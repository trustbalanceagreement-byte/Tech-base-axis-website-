import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { 
  sendAdminOneSignalNotification, 
  sendOneSignalPushNotification, 
  registerAdminSubscription,
  type AdminNotificationEvent 
} from "./server/onesignalService.ts";
import { generateSitemapXml } from "./server/sitemapService.ts";
import { 
  handleCreateRazorpayOrder, 
  handleVerifyRazorpaySignature 
} from "./server/razorpayHelper.ts";

const app = express();
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// Storage folders for uploads and data persistence
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const projectsFilePath = path.join(dataDir, "projects.json");
const activityFilePath = path.join(dataDir, "user_activity.json");

interface ActivityUser {
  id: string;
  email: string;
  name: string;
  photoURL?: string | null;
  role: 'admin' | 'client';
  createdAt: string;
  lastLoginAt: string;
  lastLogoutAt?: string | null;
  lastActiveAt: string;
  device?: string;
}

interface ActivityEvent {
  id: string;
  userId: string;
  name: string;
  email: string;
  photoURL?: string | null;
  type: 'signup' | 'login' | 'logout' | 'heartbeat';
  timestamp: string;
  device?: string;
  details?: string;
}

interface ActivityStore {
  users: Record<string, ActivityUser>;
  events: ActivityEvent[];
}

const loadActivityStore = (): ActivityStore => {
  try {
    if (fs.existsSync(activityFilePath)) {
      const raw = fs.readFileSync(activityFilePath, "utf8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading activity store:", err);
  }
  
  const now = new Date().toISOString();
  return {
    users: {
      "bgho40185@gmail.com": {
        id: "usr_bikram_ghosh",
        email: "bgho40185@gmail.com",
        name: "Bikram Ghosh",
        photoURL: "/src/assets/images/bikram-ghosh-lead-architect-kolkata.webp",
        role: "admin",
        createdAt: "2026-01-15T10:00:00.000Z",
        lastLoginAt: now,
        lastLogoutAt: null,
        lastActiveAt: now,
        device: "Chrome / Linux / Admin Console"
      },
      "techbaseaxis@gmail.com": {
        id: "usr_tba_hq",
        email: "techbaseaxis@gmail.com",
        name: "Tech Base Axis HQ",
        photoURL: "/src/assets/images/bikram-ghosh-developer-avatar.webp",
        role: "admin",
        createdAt: "2026-01-10T08:30:00.000Z",
        lastLoginAt: now,
        lastLogoutAt: null,
        lastActiveAt: now,
        device: "Cloud Workstation"
      }
    },
    events: [
      {
        id: "evt_init_1",
        userId: "usr_bikram_ghosh",
        name: "Bikram Ghosh",
        email: "bgho40185@gmail.com",
        photoURL: "/src/assets/images/bikram-ghosh-lead-architect-kolkata.webp",
        type: "login",
        timestamp: now,
        device: "Chrome / Linux",
        details: "Founder logged in to Admin Console"
      }
    ]
  };
};

const saveActivityStore = (store: ActivityStore) => {
  try {
    fs.writeFileSync(activityFilePath, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving activity store:", err);
  }
};

// Static route for uploaded media
app.use("/uploads", express.static(uploadsDir));

// GET /api/activity - Real-time activity dashboard, online/offline presence & user directory
app.get("/api/activity", (_req, res) => {
  try {
    const store = loadActivityStore();
    const now = Date.now();
    const isToday = (isoDate: string) => {
      const d = new Date(isoDate);
      const today = new Date();
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    };

    const usersList = Object.values(store.users).map((u) => {
      const activeAgeMs = now - new Date(u.lastActiveAt).getTime();
      const logoutTime = u.lastLogoutAt ? new Date(u.lastLogoutAt).getTime() : 0;
      const activeTime = new Date(u.lastActiveAt).getTime();
      
      // Online if pinged within last 2.5 minutes (150,000 ms) and not logged out after active
      const isOnline = activeAgeMs < 150000 && activeTime >= logoutTime;
      return {
        ...u,
        isOnline
      };
    });

    // Sort users: Online users first, then by lastActiveAt descending
    usersList.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
    });

    const onlineCount = usersList.filter((u) => u.isOnline).length;
    const offlineCount = usersList.length - onlineCount;
    const loginsToday = store.events.filter((e) => e.type === "login" && isToday(e.timestamp)).length;
    const signupsToday = store.events.filter((e) => e.type === "signup" && isToday(e.timestamp)).length;

    res.status(200).json({
      users: usersList,
      recentEvents: store.events.slice(0, 100),
      stats: {
        totalUsers: usersList.length,
        onlineCount,
        offlineCount,
        loginsToday,
        signupsToday,
        serverTime: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error("Activity API error:", err);
    res.status(500).json({ error: "Failed to retrieve user activity" });
  }
});

// POST /api/activity/event - Record user signup, login, logout, or presence heartbeat
app.post("/api/activity/event", (req, res) => {
  try {
    let payload = req.body;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (_) {}
    }

    const { userId, email, name, photoURL, type, device, details } = payload || {};
    if (!email && !userId) {
      return res.status(400).json({ error: "Missing email or userId" });
    }

    const store = loadActivityStore();
    const nowIso = new Date().toISOString();
    const userKey = (email || userId).toLowerCase();

    const adminEmails = [
      "techbaseaxis@gmail.com",
      "techbaseaixe@gmail.com",
      "bgho40185@gmail.com"
    ];
    const isAdmin = adminEmails.includes(userKey);

    const existing: ActivityUser = store.users[userKey] || {
      id: userId || `usr_${Date.now()}`,
      email: email || userKey,
      name: name || userKey.split("@")[0],
      photoURL: photoURL || null,
      role: isAdmin ? "admin" : "client",
      createdAt: nowIso,
      lastLoginAt: nowIso,
      lastLogoutAt: null,
      lastActiveAt: nowIso,
      device: device || "Web Browser"
    };

    // Update dynamic fields
    if (name) existing.name = name;
    if (photoURL) existing.photoURL = photoURL;
    if (device) existing.device = device;

    if (type === "signup") {
      existing.createdAt = nowIso;
      existing.lastLoginAt = nowIso;
      existing.lastLogoutAt = null;
      existing.lastActiveAt = nowIso;
    } else if (type === "login") {
      existing.lastLoginAt = nowIso;
      existing.lastLogoutAt = null;
      existing.lastActiveAt = nowIso;
    } else if (type === "logout") {
      existing.lastLogoutAt = nowIso;
      existing.lastActiveAt = nowIso;
    } else if (type === "heartbeat") {
      existing.lastActiveAt = nowIso;
      if (existing.lastLogoutAt && new Date(nowIso).getTime() > new Date(existing.lastLogoutAt).getTime()) {
        existing.lastLogoutAt = null;
      }
    }

    store.users[userKey] = existing;

    // Record in events audit log if not a raw heartbeat
    if (type !== "heartbeat") {
      store.events.unshift({
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: existing.id,
        name: existing.name,
        email: existing.email,
        photoURL: existing.photoURL,
        type: type || "login",
        timestamp: nowIso,
        device: device || existing.device,
        details: details || `${existing.name} ${type === "signup" ? "created a new account" : type === "login" ? "logged in" : "logged out"}`
      });

      // Keep up to 150 events
      if (store.events.length > 150) {
        store.events = store.events.slice(0, 150);
      }
    }

    saveActivityStore(store);
    res.status(200).json({ success: true, timestamp: nowIso });
  } catch (err: any) {
    console.error("Error logging activity event:", err);
    res.status(500).json({ error: "Failed to record activity event" });
  }
});

// GET /api/projects - Shared public projects list for all live visitors
app.get("/api/projects", (_req, res) => {
  try {
    if (fs.existsSync(projectsFilePath)) {
      const raw = fs.readFileSync(projectsFilePath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return res.status(200).json(parsed);
      }
    }
    return res.status(200).json([]);
  } catch (err: any) {
    console.error("Error reading projects:", err);
    res.status(200).json([]);
  }
});

// POST /api/projects - Saves projects list from admin
app.post("/api/projects", (req, res) => {
  try {
    const projects = req.body;
    if (Array.isArray(projects)) {
      fs.writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2), "utf8");
      return res.status(200).json({ success: true, count: projects.length });
    }
    res.status(400).json({ error: "Expected an array of projects" });
  } catch (err: any) {
    console.error("Error saving projects:", err);
    res.status(500).json({ error: err?.message || "Failed to save projects" });
  }
});

// POST /api/upload-raw or /api/upload/raw - Ultra-fast raw binary stream upload for instant photo/video saving
app.post(["/api/upload-raw", "/api/upload/raw"], (req, res) => {
  try {
    const rawFilename = (req.query.filename as string) || (req.headers["x-filename"] as string) || `upload_${Date.now()}`;
    const rawFolder = (req.query.folder as string) || (req.headers["x-folder"] as string) || "media";
    const safeFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, "");

    const folderDir = path.join(uploadsDir, safeFolder);
    if (!fs.existsSync(folderDir)) {
      fs.mkdirSync(folderDir, { recursive: true });
    }
    const targetPath = path.join(folderDir, safeFilename);
    const writeStream = fs.createWriteStream(targetPath);

    req.pipe(writeStream);

    writeStream.on("finish", () => {
      const publicUrl = `/uploads/${safeFolder}/${safeFilename}`;
      res.status(200).json({ success: true, url: publicUrl, filename: safeFilename });
    });

    writeStream.on("error", (err) => {
      console.error("Raw upload write error:", err);
      res.status(500).json({ error: err.message || "Failed to write raw stream" });
    });
  } catch (err: any) {
    console.error("Raw upload setup error:", err);
    res.status(500).json({ error: err?.message || "Failed to initiate upload stream" });
  }
});

// POST /api/upload - Reliable cloud upload endpoint for photos and videos
app.post("/api/upload", (req, res) => {
  try {
    const { filename, folder, data } = req.body;
    if (!filename || !data) {
      return res.status(400).json({ error: "Missing filename or data" });
    }

    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(data, "base64");
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    let targetPath = path.join(uploadsDir, safeFilename);
    let publicUrl = `/uploads/${safeFilename}`;

    if (folder) {
      const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
      const folderDir = path.join(uploadsDir, safeFolder);
      if (!fs.existsSync(folderDir)) {
        fs.mkdirSync(folderDir, { recursive: true });
      }
      targetPath = path.join(folderDir, safeFilename);
      publicUrl = `/uploads/${safeFolder}/${safeFilename}`;
    }

    fs.writeFileSync(targetPath, buffer);
    res.status(200).json({ success: true, url: publicUrl, filename: safeFilename });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err?.message || "Failed to process upload" });
  }
});

// Cloud Run health check endpoints
app.get(["/healthz", "/health"], (_req, res) => {
  res.status(200).send("OK");
});

// Cloud Run sets PORT (typically 8080). If PORT is provided, use it; otherwise fallback to 8080 (or 3000).
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

// Dynamic automated sitemap.xml for Google, Bing, and search engine crawlers
app.get("/sitemap.xml", (req, res) => {
  const host = req.get("host");
  const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  const baseUrl = host ? `${protocol}://${host}` : "https://www.tbaonline.online";

  const xml = generateSitemapXml(baseUrl);
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.status(200).send(xml);
});

// Automated robots.txt route
app.get("/robots.txt", (req, res) => {
  const host = req.get("host");
  const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  const baseUrl = host ? `${protocol}://${host}` : "https://www.tbaonline.online";

  const robots = `# ==========================================
# Tech Base Axis - Search Engine Robots Policy
# Website: https://www.tbaonline.online
# ==========================================

# Allow all major search engines
User-agent: *
Allow: /
Disallow: /api/

# Explicitly permit major search engine crawlers
User-agent: Googlebot
Allow: /
Disallow: /api/

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /
Disallow: /api/

# Official XML Sitemap Location
Sitemap: ${baseUrl}/sitemap.xml
`;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.status(200).send(robots);
});

// Health check endpoint for Cloud Run and container probes
app.get("/api/health", (_req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    onesignalConfigured: Boolean(process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY)
  });
});

// Diagnostic check (Safe: never prints key)
app.get("/api/notification-status", (_req, res) => {
  const hasKey = Boolean(process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY);
  const appId = process.env.ONESIGNAL_APP_ID ? `${process.env.ONESIGNAL_APP_ID.slice(0, 8)}...` : "default";
  const targetId = process.env.ONESIGNAL_ADMIN_PLAYER_ID || "99a86c9f-366e-4625-9506-5af191a0297d";

  res.status(200).json({
    onesignalReady: hasKey,
    appIdPreview: appId,
    targetAdminPlayerId: targetId,
    timestamp: new Date().toISOString()
  });
});

// POST /api/notify-booking (Kept for backwards compatibility)
app.post("/api/notify-booking", async (req, res) => {
  try {
    const payload: AdminNotificationEvent = req.body;
    if (!payload?.clientName && !payload?.email) {
      return res.status(400).json({ error: "Missing required clientName or email" });
    }

    const result = await sendOneSignalPushNotification(payload);
    res.status(result.success ? 200 : 502).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// POST /api/register-admin-device
// Registers the exact active phone/device where the admin console is open
app.post("/api/register-admin-device", (req, res) => {
  const { subscriptionId } = req.body;
  if (subscriptionId) {
    registerAdminSubscription(subscriptionId);
    return res.status(200).json({ success: true, registered: subscriptionId });
  }
  res.status(400).json({ error: "Missing subscriptionId" });
});

// POST /api/notify-admin
// Central server-side handler for all business events (package bookings, appointments, quotes, enquiries, payments)
app.post("/api/notify-admin", async (req, res) => {
  try {
    const eventData: AdminNotificationEvent = req.body;
    if (!eventData) {
      return res.status(400).json({ error: "Missing notification payload" });
    }

    // Friendly fallbacks so client information is always available
    const normalizedEvent: AdminNotificationEvent = {
      ...eventData,
      clientName: eventData.clientName || (eventData.email ? eventData.email.split('@')[0] : 'Client'),
      email: eventData.email || eventData.clientEmail || ''
    };

    const result = await sendAdminOneSignalNotification(normalizedEvent);
    res.status(result.success ? 200 : 200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// STEP 1: Backend Create Order (Razorpay Standard Checkout)
app.post("/api/create-order", async (req, res) => {
  try {
    const result = await handleCreateRazorpayOrder(req.body);
    if (!result.success) {
      return res.status(result.statusCode).json({ error: result.error });
    }
    return res.status(result.statusCode).json(result.data);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Internal server error while creating order" });
  }
});

// STEP 3: Backend Verify Payment Signature (Razorpay & Webhooks)
// Only triggers notification AFTER successful backend validation (idempotent)
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      paymentId, 
      orderId, 
      amount, 
      clientName, 
      email, 
      phone, 
      packageName, 
      projectId, 
      status, 
      utrNumber, 
      selectedApp 
    } = req.body;

    const isRazorpayVerification = Boolean(
      razorpay_signature || 
      (razorpay_order_id && razorpay_payment_id)
    );

    if (isRazorpayVerification) {
      // 1. Verify Razorpay HMAC-SHA256 signature
      const verifyResult = handleVerifyRazorpaySignature(req.body);
      if (!verifyResult.verified) {
        return res.status(verifyResult.statusCode).json({ 
          success: false, 
          verified: false, 
          error: verifyResult.error || 'Invalid signature' 
        });
      }

      // 2. Verified successfully - Trigger admin notification
      const resolvedPaymentId = razorpay_payment_id || paymentId;
      const resolvedOrderId = razorpay_order_id || orderId;
      const numericAmount = Number(amount) || 0;

      const result = await sendAdminOneSignalNotification({
        eventType: "payment_success",
        clientName: clientName || "Valued Client",
        email: email || "",
        phone: phone || "",
        amount: numericAmount,
        paymentId: resolvedPaymentId,
        orderId: resolvedOrderId,
        packageName: packageName || "Service Package",
        projectId: projectId || packageName || "Razorpay Gateway",
        timestamp: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        verified: true,
        order_id: resolvedOrderId,
        payment_id: resolvedPaymentId,
        amount: numericAmount,
        message: 'Payment verified successfully',
        notification: result,
        verifiedAt: new Date().toISOString()
      });
    }

    // Legacy direct UPI verification fallback
    if (!paymentId || !amount) {
      return res.status(400).json({ error: "Invalid payment payload: paymentId and amount required" });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount: must be a positive numeric value" });
    }

    // Only confirm notification when status is confirmed/captured
    if (status !== "success" && status !== "captured" && status !== "paid" && status !== undefined) {
      return res.status(400).json({ error: `Payment not verified. Status: ${status}` });
    }

    // Trigger admin notification only after verified payment
    const result = await sendAdminOneSignalNotification({
      eventType: "payment_success",
      clientName: clientName || "Valued Client",
      email: email || "",
      phone: phone || "",
      amount: numericAmount,
      paymentId: paymentId,
      orderId: orderId || `ord_${Date.now()}`,
      packageName: packageName || "Service Package",
      projectId: projectId || packageName || "Package Architecture",
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      verified: true,
      paymentId,
      orderId,
      amount: numericAmount,
      utrNumber: utrNumber || null,
      selectedApp: selectedApp || 'UPI',
      notification: result,
      verifiedAt: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Payment verification failed" });
  }
});

// Serve compiled static assets from dist
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

// For SPA routing, serve index.html for any request that doesn't match a static file
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Application server running on http://0.0.0.0:${PORT}`);
});
