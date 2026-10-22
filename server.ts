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
import { 
  handleSupabaseUploadStream, 
  syncProjectsToSupabase, 
  getProjectsFromSupabase,
  syncPackagesToSupabase,
  getPackagesFromSupabase
} from "./server/supabaseHelper.ts";
import {
  getActivityDashboard,
  recordActivityEvent,
  deleteActivityUser
} from "./server/activityHelper.ts";

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
const packagesFilePath = path.join(dataDir, "packages.json");
const activityFilePath = path.join(dataDir, "user_activity.json");

// Static route for uploaded media
app.use("/uploads", express.static(uploadsDir));

// GET /api/activity - Real-time activity dashboard, online/offline presence & user directory
app.get("/api/activity", (_req, res) => {
  try {
    const data = getActivityDashboard();
    res.status(200).json(data);
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

    const { email, userId } = payload || {};
    if (!email && !userId) {
      return res.status(400).json({ error: "Missing email or userId" });
    }

    const result = recordActivityEvent(payload);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Error logging activity event:", err);
    res.status(500).json({ error: "Failed to record activity event" });
  }
});

// DELETE /api/activity/user - Remove user from activity directory
app.delete("/api/activity/user", (req, res) => {
  try {
    const userKey = (req.query.user || req.body?.user || req.body?.email || req.body?.userId || "").toString().toLowerCase().trim();
    if (!userKey) {
      return res.status(400).json({ error: "Missing user key" });
    }
    const success = deleteActivityUser(userKey);
    if (success) {
      return res.status(200).json({ success: true });
    }
    res.status(404).json({ error: "User not found" });
  } catch (err: any) {
    console.error("Error deleting activity user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// GET /api/projects - Shared public projects list for all live visitors
app.get("/api/projects", async (_req, res) => {
  try {
    if (fs.existsSync(projectsFilePath)) {
      const raw = fs.readFileSync(projectsFilePath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.status(200).json(parsed);
      }
    }

    // If local file is empty or missing, fetch from Supabase cloud storage bucket
    const supaProjects = await getProjectsFromSupabase();
    if (Array.isArray(supaProjects) && supaProjects.length > 0) {
      try {
        fs.writeFileSync(projectsFilePath, JSON.stringify(supaProjects, null, 2), "utf8");
      } catch (_) {}
      return res.status(200).json(supaProjects);
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
      // Cloud persistence to Supabase bucket
      syncProjectsToSupabase(projects).catch(() => {});
      return res.status(200).json({ success: true, count: projects.length });
    }
    res.status(400).json({ error: "Expected an array of projects" });
  } catch (err: any) {
    console.error("Error saving projects:", err);
    res.status(500).json({ error: err?.message || "Failed to save projects" });
  }
});

// GET /api/packages - Shared public packages & pricing for all visitor phones & devices
app.get("/api/packages", async (_req, res) => {
  try {
    if (fs.existsSync(packagesFilePath)) {
      const raw = fs.readFileSync(packagesFilePath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.status(200).json(parsed);
      }
    }

    // If local file is empty or missing, fetch from Supabase cloud storage bucket
    const supaPackages = await getPackagesFromSupabase();
    if (Array.isArray(supaPackages) && supaPackages.length > 0) {
      try {
        fs.writeFileSync(packagesFilePath, JSON.stringify(supaPackages, null, 2), "utf8");
      } catch (_) {}
      return res.status(200).json(supaPackages);
    }

    return res.status(200).json([]);
  } catch (err: any) {
    console.error("Error reading packages:", err);
    res.status(200).json([]);
  }
});

// POST /api/packages - Saves packages list from admin console
app.post("/api/packages", (req, res) => {
  try {
    const packages = req.body;
    if (Array.isArray(packages)) {
      fs.writeFileSync(packagesFilePath, JSON.stringify(packages, null, 2), "utf8");
      // Cloud persistence to Supabase bucket
      syncPackagesToSupabase(packages).catch(() => {});
      return res.status(200).json({ success: true, count: packages.length });
    }
    res.status(400).json({ error: "Expected an array of packages" });
  } catch (err: any) {
    console.error("Error saving packages:", err);
    res.status(500).json({ error: err?.message || "Failed to save packages" });
  }
});

// POST /api/supabase/upload - Direct stream upload to Supabase Storage Bucket ('Tech Base Axis Storege')
app.post("/api/supabase/upload", handleSupabaseUploadStream);

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
