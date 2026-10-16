import { Project } from '../types';
import imgAutomation from '../assets/images/workflow-automation-systems.webp';
import imgAiSystems from '../assets/images/ai-intelligence-neural-systems.webp';
import imgCustomApp from '../assets/images/custom-app-development-architecture.webp';
import imgDigitalSol from '../assets/images/bespoke-digital-business-solutions.webp';
import imgWebDev from '../assets/images/full-stack-web-development-kolkata.webp';
import imgSoftwareDev from '../assets/images/enterprise-software-development-systems.webp';

export const SAMPLE_PROJECT_TEMPLATES: Project[] = [
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
    imageUrl: imgAutomation,
    videoUrl: "https://www.instagram.com/reel/C8q8qK2J9nO/",
    mediaType: "both",
    mediaSource: "instagram_embed"
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
    imageUrl: imgAiSystems,
    videoUrl: "",
    mediaType: "image",
    mediaSource: "uploaded_photo"
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
    imageUrl: imgCustomApp,
    videoUrl: "",
    mediaType: "image",
    mediaSource: "uploaded_photo"
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
    imageUrl: imgDigitalSol,
    videoUrl: "",
    mediaType: "image",
    mediaSource: "uploaded_photo"
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
    imageUrl: imgWebDev,
    videoUrl: "",
    mediaType: "image",
    mediaSource: "uploaded_photo"
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
    imageUrl: imgSoftwareDev,
    videoUrl: "",
    mediaType: "image",
    mediaSource: "uploaded_photo"
  }
];

import { db, collection, getDocs, setDoc, doc, deleteDoc, onSnapshot } from '../lib/firebase';

export const PROJECTS_STORAGE_KEY = 'tech_base_axis_projects_v5';
export const PROJECTS_INITIALIZED_KEY = 'tech_base_axis_projects_initialized';

/**
 * Loads saved projects from localStorage if available, or returns empty list.
 * Permanently prevents auto-restoring sample projects.
 */
export function loadSavedProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (_) {}
  return [];
}

/**
 * Cleans project object for Firestore storage (prevents undefined values or oversized base64)
 */
export function sanitizeProjectForFirestore(proj: Project): Record<string, any> {
  const clean: Record<string, any> = {
    id: proj.id,
    title: proj.title || 'Untitled Project',
    subtitle: proj.subtitle || '',
    category: proj.category || 'Full-Stack SaaS',
    description: proj.description || '',
    fullOverview: proj.fullOverview || proj.description || '',
    architectureHighlights: Array.isArray(proj.architectureHighlights) ? proj.architectureHighlights : [],
    techStack: Array.isArray(proj.techStack) ? proj.techStack : [],
    metrics: Array.isArray(proj.metrics) ? proj.metrics : [],
    featured: Boolean(proj.featured),
    year: proj.year || new Date().getFullYear().toString(),
    status: proj.status || 'Production',
    mediaType: proj.mediaType || 'image',
    mediaSource: proj.mediaSource || (proj.videoUrl ? 'external_video' : 'uploaded_photo'),
    updatedAt: proj.updatedAt || new Date().toISOString()
  };

  if (proj.demoUrl) clean.demoUrl = proj.demoUrl;
  if (proj.githubUrl) clean.githubUrl = proj.githubUrl;
  if (proj.storagePath) clean.storagePath = proj.storagePath;
  if (proj.mimeType) clean.mimeType = proj.mimeType;
  if (proj.fileSizeBytes) clean.fileSizeBytes = proj.fileSizeBytes;
  if (proj.fileName) clean.fileName = proj.fileName;
  if (proj.createdAt) clean.createdAt = proj.createdAt;
  if (typeof proj.sortOrder === 'number') clean.sortOrder = proj.sortOrder;

  // Never store gigantic base64 strings directly in Firestore document
  if (proj.imageUrl && !proj.imageUrl.startsWith('data:image/')) {
    clean.imageUrl = proj.imageUrl;
  } else if (proj.imageUrl && proj.imageUrl.startsWith('data:image/') && proj.imageUrl.length < 250000) {
    clean.imageUrl = proj.imageUrl;
  }

  if (proj.videoUrl && !proj.videoUrl.startsWith('data:video/')) {
    clean.videoUrl = proj.videoUrl;
  }

  return clean;
}

export const SUPABASE_PROJECTS_URL = 'https://httjpsskqtgjtmjgrjgs.supabase.co/storage/v1/object/public/Tech%20Base%20Axis%20Storege/projects/projects.json';

/**
 * Fetches public projects with Supabase Cloud CDN and server as authoritative sources of truth.
 * Ensures all visitors in Incognito mode, separate phones, laptops, and custom domains
 * view the identical published projects without requiring admin authentication.
 */
export async function fetchPublicProjects(): Promise<Project[]> {
  // 1. Fetch directly from global Supabase Cloud CDN (public, global, 100% available without auth)
  try {
    const supaRes = await fetch(`${SUPABASE_PROJECTS_URL}?t=${Date.now()}`, { cache: 'no-cache' });
    if (supaRes.ok) {
      const supaProjects = await supaRes.json();
      if (Array.isArray(supaProjects) && supaProjects.length > 0) {
        const published = supaProjects.filter((p: Project) => p.status !== 'Draft');
        try {
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(published));
          localStorage.removeItem('tba_projects_explicitly_cleared');
        } catch (_) {}
        return published;
      }
    }
  } catch (_) {}

  // 2. Fetch from /api/projects server backend
  try {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const serverProjects = await res.json();
      if (Array.isArray(serverProjects) && serverProjects.length > 0) {
        const published = serverProjects.filter((p: Project) => p.status !== 'Draft');
        try {
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(published));
          localStorage.removeItem('tba_projects_explicitly_cleared');
        } catch (_) {}
        return published;
      }
    }
  } catch (_) {}

  // 3. Fallback to local persistent storage
  const local = loadSavedProjects();
  if (local.length > 0) {
    return local;
  }

  // 4. Fallback to Cloud Firestore 'projects' collection
  try {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    if (!querySnapshot.empty) {
      const firestoreProjects: Project[] = [];
      querySnapshot.forEach((d) => {
        const item = d.data() as Project;
        if (item.status !== 'Draft') {
          firestoreProjects.push({ ...item, id: d.id });
        }
      });

      if (firestoreProjects.length > 0) {
        firestoreProjects.sort((a, b) => {
          if (typeof a.sortOrder === 'number' && typeof b.sortOrder === 'number') {
            return b.sortOrder - a.sortOrder;
          }
          return new Date(b.createdAt || b.year || 0).getTime() - new Date(a.createdAt || a.year || 0).getTime();
        });

        try {
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(firestoreProjects));
          localStorage.removeItem('tba_projects_explicitly_cleared');
        } catch (_) {}

        return firestoreProjects;
      }
    }
  } catch (firestoreErr) {
    console.warn('[Cloud Firestore Sync] Firestore read notice:', firestoreErr);
  }

  return [];
}

/**
 * Real-time subscription to public projects across all devices.
 * Uses a safe callback that NEVER erases existing published projects with an empty snapshot
 * unless the administrator explicitly cleared all projects.
 */
export function subscribeToPublicProjects(callback: (projects: Project[]) => void): () => void {
  let isMounted = true;

  // Safe handler to ensure newly published projects and uploaded videos are NEVER wiped out
  const safeCallback = (incoming: Project[]) => {
    if (!isMounted) return;
    if (!Array.isArray(incoming)) return;

    if (incoming.length > 0) {
      try {
        localStorage.removeItem('tba_projects_explicitly_cleared');
      } catch (_) {}
    }

    const currentSaved = loadSavedProjects();

    if (incoming.length === 0) {
      if (currentSaved.length > 0) {
        callback(currentSaved);
        fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentSaved)
        }).catch(() => {});
      } else {
        callback([]);
      }
      return;
    }

    // Smart merge: Fresh incoming projects take priority, preserving local optimistic media URLs
    const savedMap = new Map<string, Project>();
    for (const p of currentSaved) {
      savedMap.set(p.id, p);
    }

    const mergedList: Project[] = incoming.map((incProj) => {
      const savedProj = savedMap.get(incProj.id);
      if (!savedProj) return incProj;

      // Preserve media URLs if incoming is missing them or vice versa
      const preservedVideo = incProj.videoUrl || savedProj.videoUrl;
      const preservedImage = incProj.imageUrl || savedProj.imageUrl;

      return {
        ...savedProj,
        ...incProj,
        videoUrl: preservedVideo,
        imageUrl: preservedImage
      };
    });

    // Also include any locally saved projects not yet present in the incoming sync
    for (const savedProj of currentSaved) {
      if (!mergedList.some((p) => p.id === savedProj.id)) {
        mergedList.push(savedProj);
      }
    }

    mergedList.sort((a, b) => {
      if (typeof a.sortOrder === 'number' && typeof b.sortOrder === 'number') {
        return b.sortOrder - a.sortOrder;
      }
      return new Date(b.createdAt || b.year || 0).getTime() - new Date(a.createdAt || a.year || 0).getTime();
    });

    callback(mergedList);
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(mergedList));
    } catch (_) {}
  };

  // 1. Initial load
  fetchPublicProjects().then((projs) => {
    if (isMounted && Array.isArray(projs)) {
      safeCallback(projs);
    }
  }).catch(() => {});

  // 2. PRIMARY: Real-time Cloud Firestore listener
  let unsubscribeFirestore: (() => void) | null = null;
  try {
    unsubscribeFirestore = onSnapshot(collection(db, 'projects'), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty) {
        const liveProjects: Project[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as Project;
          if (item.status !== 'Draft') {
            liveProjects.push({ ...item, id: d.id });
          }
        });

        if (liveProjects.length > 0) {
          liveProjects.sort((a, b) => {
            if (typeof a.sortOrder === 'number' && typeof b.sortOrder === 'number') {
              return b.sortOrder - a.sortOrder;
            }
            return new Date(b.createdAt || b.year || 0).getTime() - new Date(a.createdAt || a.year || 0).getTime();
          });
          safeCallback(liveProjects);
        }
      }
    }, (err) => {
      console.warn('[Cloud Firestore Sync] Live snapshot listener notice:', err);
    });
  } catch (err) {
    console.warn('[Cloud Firestore Sync] onSnapshot setup notice:', err);
  }

  // 3. Local reactive event listener for instant 0ms single-tab updates
  const handleLocalUpdate = (e: any) => {
    if (!isMounted) return;
    if (e.detail && Array.isArray(e.detail)) {
      safeCallback(e.detail.filter((p: Project) => p.status !== 'Draft'));
    }
  };
  window.addEventListener('tba_projects_updated', handleLocalUpdate);

  // 4. BroadcastChannel for instant cross-tab reactivity
  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('tba_projects_channel');
      channel.onmessage = (event) => {
        if (!isMounted) return;
        if (event.data && Array.isArray(event.data)) {
          safeCallback(event.data.filter((p: Project) => p.status !== 'Draft'));
        }
      };
    }
  } catch (_) {}

  // 5. Polling Supabase CDN & server every 3 seconds for instant multi-device live sync
  const intervalId = setInterval(() => {
    if (!isMounted) return;
    fetch(`${SUPABASE_PROJECTS_URL}?t=${Date.now()}`, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((supaData) => {
        if (isMounted && Array.isArray(supaData) && supaData.length > 0) {
          const published = supaData.filter((p: Project) => p.status !== 'Draft');
          safeCallback(published);
        } else if (isMounted) {
          fetch('/api/projects')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (isMounted && Array.isArray(data) && data.length > 0) {
                const published = data.filter((p) => p.status !== 'Draft');
                safeCallback(published);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (isMounted) {
          fetch('/api/projects')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (isMounted && Array.isArray(data) && data.length > 0) {
                const published = data.filter((p) => p.status !== 'Draft');
                safeCallback(published);
              }
            })
            .catch(() => {});
        }
      });
  }, 3000);

  return () => {
    isMounted = false;
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener('tba_projects_updated', handleLocalUpdate);
    if (channel) channel.close();
    clearInterval(intervalId);
  };
}

/**
 * Saves projects permanently to localStorage, Server Cloud API, and Cloud Firestore.
 * Ensures the single source of truth is updated everywhere immediately without getting overwritten.
 */
export async function saveProjects(projects: Project[], deletedId?: string): Promise<void> {
  if (!Array.isArray(projects)) return;

  // 0. IMMEDIATE LOCAL PERSISTENCE (Synchronous, guaranteed 0ms)
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    localStorage.setItem(PROJECTS_INITIALIZED_KEY, 'true');
    if (projects.length === 0) {
      localStorage.setItem('tba_projects_explicitly_cleared', 'true');
    } else {
      localStorage.removeItem('tba_projects_explicitly_cleared');
    }
  } catch (_) {}

  // 1. PRIMARY SERVER SYNC (Immediate, persistent disk file on server)
  try {
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projects)
    });
  } catch (serverErr) {
    console.warn('[Server Projects Sync] Server save notice:', serverErr);
  }

  // 2. Dispatch instant reactive events across tabs & components
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tba_projects_updated', { detail: projects }));
    }
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('tba_projects_channel');
      channel.postMessage(projects);
      setTimeout(() => channel.close(), 100);
    }
  } catch (_) {}

  // 3. BACKGROUND FIRESTORE SYNC (Non-blocking, runs in background)
  (async () => {
    try {
      if (deletedId) {
        await deleteDoc(doc(db, 'projects', deletedId)).catch(() => {});
      }

      if (projects.length === 0) {
        const snap = await getDocs(collection(db, 'projects')).catch(() => null);
        if (snap) {
          snap.forEach(async (d) => {
            await deleteDoc(doc(db, 'projects', d.id)).catch(() => {});
          });
        }
      } else {
        for (const proj of projects) {
          const sanitized = sanitizeProjectForFirestore(proj);
          await setDoc(doc(db, 'projects', proj.id), sanitized, { merge: true }).catch(() => {});
        }
      }
    } catch (firestoreErr) {
      console.warn('[Cloud Firestore Sync] Background sync notice:', firestoreErr);
    }
  })();
}

/**
 * Saves a single project directly to Cloud Firestore and syncs state.
 */
export async function saveSingleProjectToFirestore(project: Project): Promise<void> {
  const sanitized = sanitizeProjectForFirestore(project);
  await setDoc(doc(db, 'projects', project.id), sanitized, { merge: true });
}

/**
 * Deletes a single project directly from Cloud Firestore.
 */
export async function deleteSingleProjectFromFirestore(projectId: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', projectId));
}
