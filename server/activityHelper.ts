import fs from 'fs';
import path from 'path';

export interface ActivityUser {
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

export interface ActivityEvent {
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

export interface ActivityStore {
  users: Record<string, ActivityUser>;
  events: ActivityEvent[];
}

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (_) {}
}

const activityFilePath = path.join(dataDir, 'user_activity.json');
const projectsFilePath = path.join(dataDir, 'projects.json');
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (_) {}
}

export const ADMIN_EMAILS = [
  'techbaseaxis@gmail.com',
  'techbaseaixe@gmail.com',
  'bgho40185@gmail.com'
];

export function loadActivityStore(): ActivityStore {
  const now = new Date().toISOString();
  let store: ActivityStore | null = null;

  try {
    if (fs.existsSync(activityFilePath)) {
      const raw = fs.readFileSync(activityFilePath, 'utf8');
      store = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading activity store from disk:', err);
  }

  if (!store || !store.users) {
    store = {
      users: {},
      events: []
    };
  }

  // Ensure default founder & agency profiles exist
  if (!store.users['bgho40185@gmail.com']) {
    store.users['bgho40185@gmail.com'] = {
      id: 'usr_bikram_ghosh',
      email: 'bgho40185@gmail.com',
      name: 'Bikram Ghosh',
      photoURL: '/src/assets/images/bikram-ghosh-lead-architect-kolkata.webp',
      role: 'admin',
      createdAt: '2026-01-15T10:00:00.000Z',
      lastLoginAt: now,
      lastLogoutAt: null,
      lastActiveAt: now,
      device: 'Admin Console'
    };
  }

  if (!store.users['techbaseaxis@gmail.com']) {
    store.users['techbaseaxis@gmail.com'] = {
      id: 'usr_tba_hq',
      email: 'techbaseaxis@gmail.com',
      name: 'Tech Base Axis HQ',
      photoURL: '/src/assets/images/bikram-ghosh-developer-avatar.webp',
      role: 'admin',
      createdAt: '2026-01-10T08:30:00.000Z',
      lastLoginAt: now,
      lastLogoutAt: null,
      lastActiveAt: now,
      device: 'Cloud Workstation'
    };
  }

  if (!Array.isArray(store.events) || store.events.length === 0) {
    store.events = [
      {
        id: 'evt_init_1',
        userId: 'usr_bikram_ghosh',
        name: 'Bikram Ghosh',
        email: 'bgho40185@gmail.com',
        photoURL: '/src/assets/images/bikram-ghosh-lead-architect-kolkata.webp',
        type: 'login',
        timestamp: now,
        device: 'Admin Console',
        details: 'Founder logged into Admin Console'
      }
    ];
  }

  return store;
}

export function saveActivityStore(store: ActivityStore): void {
  try {
    fs.writeFileSync(activityFilePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving activity store to disk:', err);
  }
}

export function getActivityDashboard(): any {
  const store = loadActivityStore();
  const now = Date.now();

  const isToday = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      const today = new Date();
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    } catch {
      return false;
    }
  };

  const usersList = Object.values(store.users).map((u) => {
    const activeAgeMs = now - new Date(u.lastActiveAt || 0).getTime();
    const logoutTime = u.lastLogoutAt ? new Date(u.lastLogoutAt).getTime() : 0;
    const activeTime = new Date(u.lastActiveAt || 0).getTime();

    // Online if pinged within last 2.5 minutes (150,000 ms) and not logged out after active
    const isOnline = activeAgeMs < 150000 && activeTime >= logoutTime;
    return {
      ...u,
      isOnline
    };
  });

  // Sort: online first, then by lastActiveAt descending
  usersList.sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return new Date(b.lastActiveAt || 0).getTime() - new Date(a.lastActiveAt || 0).getTime();
  });

  const onlineCount = usersList.filter((u) => u.isOnline).length;
  const offlineCount = usersList.length - onlineCount;
  const loginsToday = store.events.filter((e) => e.type === 'login' && isToday(e.timestamp)).length;
  const signupsToday = store.events.filter((e) => e.type === 'signup' && isToday(e.timestamp)).length;

  return {
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
  };
}

export function recordActivityEvent(payload: {
  userId?: string;
  email?: string;
  name?: string;
  photoURL?: string | null;
  type?: 'signup' | 'login' | 'logout' | 'heartbeat';
  device?: string;
  details?: string;
}): { success: boolean; timestamp: string } {
  const { userId, email, name, photoURL, type, device, details } = payload || {};
  if (!email && !userId) {
    throw new Error('Missing email or userId');
  }

  const store = loadActivityStore();
  const nowIso = new Date().toISOString();
  const userKey = (email || userId || '').toLowerCase().trim();

  const isAdmin = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userKey);

  const existing: ActivityUser = store.users[userKey] || {
    id: userId || `usr_${Date.now()}`,
    email: email || userKey,
    name: name || userKey.split('@')[0],
    photoURL: photoURL || null,
    role: isAdmin ? 'admin' : 'client',
    createdAt: nowIso,
    lastLoginAt: nowIso,
    lastLogoutAt: null,
    lastActiveAt: nowIso,
    device: device || 'Web Browser'
  };

  if (name) existing.name = name;
  if (photoURL) existing.photoURL = photoURL;
  if (device) existing.device = device;

  if (type === 'signup') {
    existing.createdAt = nowIso;
    existing.lastLoginAt = nowIso;
    existing.lastLogoutAt = null;
    existing.lastActiveAt = nowIso;
  } else if (type === 'login') {
    existing.lastLoginAt = nowIso;
    existing.lastLogoutAt = null;
    existing.lastActiveAt = nowIso;
  } else if (type === 'logout') {
    existing.lastLogoutAt = nowIso;
    existing.lastActiveAt = nowIso;
  } else if (type === 'heartbeat') {
    existing.lastActiveAt = nowIso;
    if (existing.lastLogoutAt && new Date(nowIso).getTime() > new Date(existing.lastLogoutAt).getTime()) {
      existing.lastLogoutAt = null;
    }
  }

  store.users[userKey] = existing;

  if (type !== 'heartbeat') {
    store.events.unshift({
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: existing.id,
      name: existing.name,
      email: existing.email,
      photoURL: existing.photoURL,
      type: type || 'login',
      timestamp: nowIso,
      device: device || existing.device,
      details: details || `${existing.name} ${type === 'signup' ? 'created a new account' : type === 'login' ? 'logged in' : 'logged out'}`
    });

    if (store.events.length > 150) {
      store.events = store.events.slice(0, 150);
    }
  }

  saveActivityStore(store);
  return { success: true, timestamp: nowIso };
}

export const DEFAULT_PROJECTS_LIST = [
  {
    id: "omniflow-os",
    title: "OmniFlow Cloud OS",
    subtitle: "Distributed Multi-Tenant Workflow & Pipeline Orchestrator",
    category: "Cloud & Infra",
    description: "Enterprise-grade orchestration engine handling concurrent task graphs, asynchronous job queues, and dynamic node dispatch with zero-latency telemetry.",
    fullOverview: "OmniFlow Cloud OS was built to address large-scale data synchronization across heterogeneous cloud environments. Featuring an event-driven microservices architecture with Kafka-backed messaging, Redis cluster caching, and automated failover mechanics.",
    architectureHighlights: [
      "Sub-20ms distributed consensus using Raft-based state machine replication",
      "Dynamic worker pool auto-scaling based on real-time queue depth and CPU pressure",
      "Comprehensive telemetry dashboard with live WebSocket stream visualization",
      "End-to-end tenant isolation with cryptographically verified multi-tenancy"
    ],
    techStack: ["TypeScript", "Node.js", "React 19", "PostgreSQL", "Kafka", "Docker", "GCP"],
    metrics: [
      { label: "Daily Transactions", value: "4.2M+" },
      { label: "P99 Dispatch Latency", value: "<18ms" },
      { label: "Uptime SLA", value: "99.99%" }
    ],
    featured: true,
    year: "2026",
    status: "Production",
    demoUrl: "https://omniflow.techbaseaxis.io",
    githubUrl: "https://github.com/techbaseaxis/omniflow-cloud-os",
    imageUrl: "/src/assets/images/workflow-automation-systems.webp",
    videoUrl: "https://www.instagram.com/reel/C8q8qK2J9nO/",
    mediaType: "both"
  },
  {
    id: "aether-neural-copilot",
    title: "Aether AI Neural Copilot",
    subtitle: "Server-Side Enterprise Intelligence & Document Reasoning Engine",
    category: "AI & Intelligence",
    description: "Multi-modal contextual reasoning engine utilizing state-of-the-art LLMs, hybrid vector search, and structured schema extraction for institutional clients.",
    fullOverview: "Aether AI integrates enterprise knowledge bases with advanced generative AI. It constructs high-dimensional vector embeddings with HNSW indexing, executing retrieval-augmented generation with strict role-based data boundaries.",
    architectureHighlights: [
      "Hybrid dense-sparse retrieval combining vector similarity with BM25 keyword matching",
      "Streaming SSE (Server-Sent Events) pipeline delivering token generation under 120ms first-token latency",
      "Auditable reasoning trace logs with strict hallucination-prevention validation fences",
      "Client-side zero-knowledge caching keeping sensitive corporate queries fully ephemeral"
    ],
    techStack: ["Python FastAPI", "React 19", "Gemini API", "Pinecone", "Tailwind CSS", "Redis"],
    metrics: [
      { label: "Document Ingestion", value: "250k+ Docs" },
      { label: "Reasoning Accuracy", value: "98.4%" },
      { label: "First Token Time", value: "115ms" }
    ],
    featured: true,
    year: "2026",
    status: "Production",
    demoUrl: "https://aether.techbaseaxis.io",
    githubUrl: "https://github.com/techbaseaxis/aether-neural-copilot",
    imageUrl: "/src/assets/images/ai-intelligence-neural-systems.webp",
    videoUrl: "",
    mediaType: "image"
  },
  {
    id: "nexuspay-core",
    title: "NexusPay Core Engine",
    subtitle: "High-Throughput Global Financial Routing & Double-Entry Ledger",
    category: "Fintech & Web3",
    description: "Fintech ledger and payment switch with immutable transactional integrity, automated multi-currency reconciliation, and PCI-DSS compliant vaulting.",
    fullOverview: "Designed for international cross-border settlements, NexusPay Core implements an immutable double-entry bookkeeping ledger guaranteeing strict ACID compliance and idempotent payment processing.",
    architectureHighlights: [
      "Strict double-entry ledger database schema preventing phantom ledger drift",
      "Smart payment routing engine optimizing gateway fee margins by up to 14.2%",
      "Automated webhook retry backoff with dead-letter queue inspection tools",
      "Zero-trust API gateway with mutual TLS and cryptographic signature verification"
    ],
    techStack: ["Node.js", "Express", "TypeScript", "PostgreSQL", "Tailwind CSS", "Docker"],
    metrics: [
      { label: "Processed Volume", value: "₹38M+" },
      { label: "Settlement Success", value: "99.98%" },
      { label: "Reconciliation", value: "Real-time" }
    ],
    featured: true,
    year: "2025",
    status: "Enterprise Client",
    demoUrl: "https://nexuspay.techbaseaxis.io",
    githubUrl: "https://github.com/techbaseaxis/nexuspay-core",
    imageUrl: "/src/assets/images/custom-app-development-architecture.webp",
    videoUrl: "",
    mediaType: "image"
  },
  {
    id: "zenith-logistics-matrix",
    title: "Zenith Logistics Matrix",
    subtitle: "Real-Time Fleet Telemetry & Automated Route Optimization Hub",
    category: "Full-Stack SaaS",
    description: "Fleet tracking ecosystem processing continuous GPS beacons, dynamic geo-fencing triggers, and multi-stop algorithmic delivery route computation.",
    fullOverview: "Zenith Logistics Matrix serves courier fleets by calculating optimal TSP (Traveling Salesperson) routing in real-time, factoring in live traffic density, driver shift hours, and vehicle payload limits.",
    architectureHighlights: [
      "High-frequency WebSocket channels handling up to 15,000 concurrent GPS vehicle pings",
      "Spatial queries powered by PostGIS geo-indexes for millisecond geofence breaches",
      "Adaptive offline-first mobile companion app with bi-directional sync upon reconnect",
      "Interactive map visualizer utilizing vector tiling and heat-map clustering"
    ],
    techStack: ["React 19", "Node.js", "PostGIS", "WebSockets", "MapLibre", "Tailwind CSS"],
    metrics: [
      { label: "Active Fleets", value: "1,200+" },
      { label: "Fuel Cost Saved", value: "22%" },
      { label: "Telemetry Latency", value: "<45ms" }
    ],
    featured: false,
    year: "2025",
    status: "Active Deployment",
    demoUrl: "https://zenith.techbaseaxis.io",
    githubUrl: "https://github.com/techbaseaxis/zenith-logistics",
    imageUrl: "/src/assets/images/bespoke-digital-business-solutions.webp",
    videoUrl: "",
    mediaType: "image"
  },
  {
    id: "axis-obsidian-ds",
    title: "Axis Obsidian Design System",
    subtitle: "High-Performance Dark-Themed UI System for Data-Dense Platforms",
    category: "Full-Stack SaaS",
    description: "Accessible, zero-runtime overhead component library engineered specifically for fintech dashboards, developer tools, and operational telemetry displays.",
    fullOverview: "A meticulous component ecosystem prioritizing optical hierarchy, mathematically calibrated border radii, high-contrast dark neutrals, and keyboard-first accessibility.",
    architectureHighlights: [
      "WAI-ARIA compliance with full keyboard navigation and screen reader live regions",
      "Micro-animations powered by hardware-accelerated transforms and motion spring physics",
      "Design tokens calibrated for true deep obsidian contrast (#090a0f to #1e293b)",
      "Zero bundle-size inflation with tree-shakable modular component exports"
    ],
    techStack: ["React 19", "TypeScript", "Tailwind CSS v4", "Motion", "Radix Primitives"],
    metrics: [
      { label: "Component Count", value: "65+" },
      { label: "Lighthouse Score", value: "100/100" },
      { label: "Bundle Size", value: "8.4 kB" }
    ],
    featured: true,
    year: "2026",
    status: "Production",
    demoUrl: "https://obsidian.techbaseaxis.io",
    githubUrl: "https://github.com/techbaseaxis/axis-obsidian",
    imageUrl: "/src/assets/images/full-stack-web-development-kolkata.webp",
    videoUrl: "",
    mediaType: "image"
  },
  {
    id: "cryptopulse-terminal",
    title: "CryptoPulse Terminal",
    subtitle: "Low-Latency Market Analytics & Algorithmic Order Flow Visualizer",
    category: "Fintech & Web3",
    description: "Financial terminal charting multi-exchange order books, live depth charts, liquidation heatmaps, and custom algorithmic trend signals.",
    fullOverview: "CryptoPulse was designed for pro traders needing milliseconds-ahead market clarity. Built with custom WebGL canvas charts that render 60 FPS order book depth without browser thread lock.",
    architectureHighlights: [
      "Dual WebSocket multiplexer coalescing Binance, Coinbase, and Bybit order books",
      "OffscreenCanvas rendering engine capable of displaying 500,000 tick updates per minute",
      "Local browser memory buffer with instant client-side technical indicator calculations",
      "Audible audio alerts and push notifications for user-configured volatility thresholds"
    ],
    techStack: ["TypeScript", "React 19", "HTML5 Canvas", "Tailwind CSS", "WebSockets"],
    metrics: [
      { label: "Tick Processing", value: "50k/sec" },
      { label: "Feed Latency", value: "<12ms" },
      { label: "Chart Frame Rate", value: "60 FPS" }
    ],
    featured: false,
    year: "2025",
    status: "Active Deployment",
    demoUrl: "https://cryptopulse.techbaseaxis.io",
    githubUrl: "https://github.com/techbaseaxis/cryptopulse-terminal",
    imageUrl: "/src/assets/images/enterprise-software-development-systems.webp",
    videoUrl: "",
    mediaType: "image"
  }
];

export function getProjectsList(): any[] {
  try {
    if (fs.existsSync(projectsFilePath)) {
      const raw = fs.readFileSync(projectsFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading projects file:', err);
  }
  return [];
}

export function saveProjectsList(projects: any[]): boolean {
  if (!Array.isArray(projects)) return false;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving projects list:', err);
    return false;
  }
}

export function handleUpload(payload: { filename: string; folder?: string; data: string }): { url: string; filename: string } {
  const folder = payload.folder || 'media';
  const uploadsBase = path.join(process.cwd(), 'uploads', folder);
  if (!fs.existsSync(uploadsBase)) {
    fs.mkdirSync(uploadsBase, { recursive: true });
  }

  const cleanName = `${Date.now()}_${payload.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const targetFile = path.join(uploadsBase, cleanName);

  const rawData = payload.data;
  const matches = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let buffer: Buffer;
  if (matches && matches.length === 3) {
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(rawData, 'base64');
  }

  fs.writeFileSync(targetFile, buffer);
  return {
    url: `/uploads/${folder}/${cleanName}`,
    filename: cleanName
  };
}
