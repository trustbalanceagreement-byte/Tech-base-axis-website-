import { ServicePackage } from '../types';

export const INITIAL_PACKAGES: ServicePackage[] = [
  // --- Monthly Subscription Plans ---
  {
    id: 'monthly-basic',
    name: 'Basic Plan',
    badge: 'Starter',
    theme: 'green',
    price: 45,
    period: '/month',
    cycle: 'monthly',
    description: 'For most businesses that want to optimize web queries & scale',
    turnaround: 'Instant Onboarding',
    idealFor: 'Small businesses & solo founders',
    popular: false,
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Optimized hashtags & keywords', included: true },
      { text: 'Your custom analytics dashboard', included: true },
      { text: '+300 pre-built UI components', included: false },
      { text: 'Dedicated 24/7 chat support', included: false },
      { text: 'High-speed cloud storage', included: false }
    ],
    deliverables: [
      'Production Web Portal Access',
      'Dashboard & Reporting Views',
      'Monthly Security & Stack Updates'
    ],
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'Node.js']
  },
  {
    id: 'monthly-standard',
    name: 'Standard Plan',
    badge: 'Most Popular',
    theme: 'blue',
    price: 60,
    period: '/month',
    cycle: 'monthly',
    description: 'For growing businesses wanting full component kits & faster turnarounds',
    turnaround: 'Instant Onboarding',
    idealFor: 'Scaling businesses & engineering teams',
    popular: true,
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Optimized hashtags & keywords', included: true },
      { text: 'Your custom analytics dashboard', included: true },
      { text: '+300 pre-built UI components', included: true },
      { text: 'Dedicated 24/7 chat support', included: false },
      { text: 'High-speed cloud storage', included: false }
    ],
    deliverables: [
      'Production Web Portal Access',
      'Full Component Library Integration',
      'Priority Performance Audits & Monitoring'
    ],
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'PostgreSQL', 'Stripe']
  },
  {
    id: 'monthly-premium',
    name: 'Premium Plan',
    badge: 'All-Inclusive',
    theme: 'amber',
    price: 86,
    period: '/month',
    cycle: 'monthly',
    description: 'Enterprise-grade speed, 300+ components, dedicated chat support & storage',
    turnaround: 'Priority Same-Day Setup',
    idealFor: 'Enterprises & high-frequency digital platforms',
    popular: false,
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Optimized hashtags & keywords', included: true },
      { text: 'Your custom analytics dashboard', included: true },
      { text: '+300 pre-built UI components', included: true },
      { text: 'Dedicated 24/7 chat support', included: true },
      { text: 'High-speed cloud storage', included: true }
    ],
    deliverables: [
      'White-Glove Architecture Guidance',
      'Unlimited Component & UI Requests',
      'Dedicated Slack / Discord Hotline',
      'Cloud Storage & Asset Hosting'
    ],
    techStack: ['React 19', 'Next/Node', 'PostgreSQL', 'Redis', 'AWS/GCP Cloud']
  },

  // --- Maintenance & Ongoing Engineering Plans ---
  {
    id: 'maintenance-basic',
    name: 'Basic Maintenance',
    badge: 'Essential Care',
    theme: 'green',
    price: 1499,
    period: '/month',
    cycle: 'maintenance',
    description: 'Continuous health monitoring, essential security patches, core library updates and bug fixes.',
    turnaround: 'Instant Onboarding',
    idealFor: 'Small businesses & startups with live web portals requiring stable uptime',
    popular: false,
    features: [
      { text: 'Continuous core framework & security updates', included: true },
      { text: 'Automated weekly database & cloud backups', included: true },
      { text: '99.9% uptime monitoring & health pings', included: true },
      { text: 'Up to 5 hours dedicated bug fixes/month', included: true },
      { text: 'SSL certificate renewal & domain checks', included: true },
      { text: 'Standard email & Discord ticketing support', included: true },
      { text: 'Custom UI/feature enhancements', included: false },
      { text: '24/7 emergency incident hotline', included: false }
    ],
    deliverables: [
      'Monthly Security & Stack Health Audit Report',
      'Automated Cloud Backup Verification Logs',
      'Dedicated Discord / Email Support Channel'
    ],
    techStack: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL / Cloud', 'Docker']
  },
  {
    id: 'maintenance-standard',
    name: 'Standard Maintenance',
    badge: 'Most Popular',
    theme: 'blue',
    price: 3499,
    period: '/month',
    cycle: 'maintenance',
    popular: true,
    description: 'Comprehensive proactive maintenance with fast-response SLA, query optimizations & active code enhancements.',
    turnaround: 'Same-Day Priority Setup',
    idealFor: 'Growing SaaS platforms, E-commerce hubs & high-traffic client portals',
    features: [
      { text: 'Everything in Basic Maintenance tier', included: true },
      { text: 'Rapid-response SLA (< 4 hours turnaround)', included: true },
      { text: 'Database query & index performance tuning', included: true },
      { text: 'Third-party API & webhook health monitoring', included: true },
      { text: 'Up to 15 hours dedicated code & feature updates', included: true },
      { text: 'Bi-weekly performance & SEO speed audits', included: true },
      { text: 'Priority WhatsApp / Slack hotline support', included: true },
      { text: 'Dedicated principal architect consultation', included: false }
    ],
    deliverables: [
      'Priority Engineering Support & Hotfix Access',
      'Bi-Weekly Deployment & Optimization Sprints',
      'Real-Time Error Logging & Alert System',
      'Dedicated WhatsApp / Slack Channel'
    ],
    techStack: ['React 19', 'Node.js / Express', 'PostgreSQL', 'Redis', 'Stripe', 'GCP / Cloud Run']
  },
  {
    id: 'maintenance-enterprise',
    name: 'Enterprise Maintenance',
    badge: '24/7 SLA',
    theme: 'amber',
    price: 6999,
    period: '/month',
    cycle: 'maintenance',
    popular: false,
    description: 'Round-the-clock incident response, zero-downtime hotfixes, disaster recovery & dedicated architect.',
    turnaround: 'Immediate Dedicated Escalation',
    idealFor: 'Enterprises, High-volume platforms, FinTech, and mission-critical applications',
    features: [
      { text: 'Everything in Standard Maintenance tier', included: true },
      { text: '24/7 emergency hotline & 30-min critical SLA', included: true },
      { text: 'High-availability multi-cloud failover checks', included: true },
      { text: 'Security penetration remediation & audit prep', included: true },
      { text: 'Up to 35 hours custom engineering & UI updates', included: true },
      { text: 'Multi-region disaster recovery & data mirroring', included: true },
      { text: 'Guaranteed 99.99% infrastructure uptime SLA', included: true },
      { text: 'Dedicated senior systems architect consultation', included: true }
    ],
    deliverables: [
      '24/7 Emergency Incident Escalation Protocol',
      'High-Availability Architecture Governance',
      'Custom Telemetry & Error Tracking Dashboard',
      'Guaranteed 99.99% Infrastructure Uptime SLA'
    ],
    techStack: ['Distributed TypeScript', 'Kubernetes', 'PostgreSQL Cluster', 'Kafka', 'Docker', 'GCP/AWS']
  }
];

export const PACKAGES_STORAGE_KEY = 'tech_base_axis_pricing_packages_v4';
export const PACKAGES_INITIALIZED_KEY = 'tech_base_axis_packages_initialized';
export const DELETED_PACKAGES_STORAGE_KEY = 'tech_base_axis_deleted_packages_v1';

import { db, collection, getDocs, setDoc, doc, deleteDoc, onSnapshot } from '../lib/firebase';
import { supabaseAdmin, SUPABASE_STORAGE_BUCKET } from '../lib/supabaseClient';

export const SUPABASE_PACKAGES_URL = 'https://httjpsskqtgjtmjgrjgs.supabase.co/storage/v1/object/public/Tech%20Base%20Axis%20Storege/packages/packages.json';

export type PackageCategory = 'subscription' | 'maintenance';

/**
 * Gets permanently deleted package IDs from persistent storage
 */
export function getDeletedPackageIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_PACKAGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
}

/**
 * Permanently records a deleted package ID to prevent resurrection from cloud cache or initial defaults
 */
export function recordDeletedPackageId(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    const current = getDeletedPackageIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(DELETED_PACKAGES_STORAGE_KEY, JSON.stringify(current));
    }
  } catch (_) {}
}

/**
 * Strict, mutually exclusive classification of packages into either:
 * - 'subscription'
 * - 'maintenance'
 * Guaranteed: A package will NEVER be classified into both categories.
 */
export function getPackageCategory(pkg: ServicePackage): PackageCategory {
  if (!pkg) return 'subscription';
  
  // 1. Explicit cycle flag takes highest priority
  if (pkg.cycle === 'maintenance' || pkg.cycle === 'milestone') {
    return 'maintenance';
  }
  if (pkg.cycle === 'monthly' || pkg.cycle === 'subscription') {
    return 'subscription';
  }

  // 2. ID prefix classification
  const idLower = (pkg.id || '').toLowerCase();
  if (idLower.startsWith('maint') || idLower.includes('maintenance')) {
    return 'maintenance';
  }
  if (idLower.startsWith('monthly') || idLower.startsWith('sub') || idLower.includes('subscription')) {
    return 'subscription';
  }

  // 3. Name keywords
  const nameLower = (pkg.name || '').toLowerCase();
  if (nameLower.includes('maintenance') || nameLower.includes('support') || nameLower.includes('bug')) {
    return 'maintenance';
  }
  if (nameLower.includes('subscription') || nameLower.includes('monthly')) {
    return 'subscription';
  }

  // 4. Period keywords (milestone/project vs monthly)
  const periodLower = (pkg.period || '').toLowerCase();
  if (periodLower.includes('project') || periodLower.includes('milestone') || periodLower.includes('one-time')) {
    return 'maintenance';
  }

  // Default fallback is subscription
  return 'subscription';
}

export function isSubscriptionPackage(pkg: ServicePackage): boolean {
  return getPackageCategory(pkg) === 'subscription';
}

export function isMaintenancePackage(pkg: ServicePackage): boolean {
  return getPackageCategory(pkg) === 'maintenance';
}

/**
 * Loads the packages the admin saved, from localStorage.
 * Returns an empty list when nothing was saved: the built-in INITIAL_PACKAGES
 * are NEVER used as a silent fallback, so only packages added through the
 * Admin panel are shown (INITIAL_PACKAGES is used only by the explicit
 * "Reset to default" action).
 * Guaranteed to exclude any package permanently deleted by admin.
 */
export function loadSavedPackages(): ServicePackage[] {
  const deletedIds = getDeletedPackageIds();
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(PACKAGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((p) => !deletedIds.includes(p.id));
      }
    }
  } catch (err) {
    console.error('Failed to load packages from storage:', err);
  }
  return [];
}

/**
 * Cleans package object for Firestore storage (prevents undefined values)
 */
export function sanitizePackageForFirestore(pkg: ServicePackage): Record<string, any> {
  const clean: Record<string, any> = {
    id: pkg.id,
    name: pkg.name || 'Service Package',
    badge: pkg.badge || '',
    theme: pkg.theme || 'green',
    price: typeof pkg.price === 'number' ? pkg.price : 0,
    period: pkg.period || '/month',
    cycle: pkg.cycle || (getPackageCategory(pkg) === 'maintenance' ? 'maintenance' : 'monthly'),
    description: pkg.description || '',
    turnaround: pkg.turnaround || 'Instant Setup',
    idealFor: pkg.idealFor || '',
    popular: Boolean(pkg.popular),
    features: Array.isArray(pkg.features)
      ? pkg.features.map((f) => ({
          text: typeof f === 'string' ? f : f.text,
          included: typeof f === 'string' ? true : Boolean(f.included)
        }))
      : [],
    deliverables: Array.isArray(pkg.deliverables) ? pkg.deliverables : [],
    techStack: Array.isArray(pkg.techStack) ? pkg.techStack : [],
    updatedAt: new Date().toISOString()
  };

  return clean;
}

/**
 * Fetches public packages with Supabase Cloud CDN, Server API and Cloud Firestore as sources of truth.
 * Ensures all visitors across any mobile phone, desktop, or incognito window
 * view the identical admin-configured prices without requiring authentication.
 */
export async function fetchPublicPackages(): Promise<ServicePackage[]> {
  const deletedIds = getDeletedPackageIds();
  const filterDeleted = (list: ServicePackage[]) => list.filter(p => !deletedIds.includes(p.id));

  // 1. Fetch directly from global Supabase Cloud CDN (public, global, 100% available without auth)
  try {
    const supaRes = await fetch(`${SUPABASE_PACKAGES_URL}?t=${Date.now()}`, { cache: 'no-cache' });
    if (supaRes.ok) {
      const supaPackages = await supaRes.json();
      if (Array.isArray(supaPackages)) {
        const cleaned = filterDeleted(supaPackages);
        try {
          localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(cleaned));
        } catch (_) {}
        return cleaned;
      }
    }
  } catch (_) {}

  // 2. Fetch from /api/packages server backend
  try {
    const res = await fetch('/api/packages');
    if (res.ok) {
      const serverPackages = await res.json();
      if (Array.isArray(serverPackages)) {
        const cleaned = filterDeleted(serverPackages);
        try {
          localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(cleaned));
        } catch (_) {}
        return cleaned;
      }
    }
  } catch (_) {}

  // 3. Fallback to Cloud Firestore 'packages' collection
  try {
    const querySnapshot = await getDocs(collection(db, 'packages'));
    if (!querySnapshot.empty) {
      const firestorePackages: ServicePackage[] = [];
      querySnapshot.forEach((d) => {
        if (!deletedIds.includes(d.id)) {
          const item = d.data() as ServicePackage;
          firestorePackages.push({ ...item, id: d.id });
        }
      });

      if (firestorePackages.length > 0) {
        try {
          localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(firestorePackages));
        } catch (_) {}
        return firestorePackages;
      }
    }
  } catch (firestoreErr) {
    console.warn('[Cloud Firestore Packages Sync] Firestore read notice:', firestoreErr);
  }

  // 4. Fallback to local persistent storage (admin-saved packages only, never the built-in defaults)
  return loadSavedPackages();
}

/**
 * Real-time subscription to public packages across all devices.
 * Seamlessly syncs package prices, features, and details to every visitor's phone in real time.
 */
export function subscribeToPublicPackages(callback: (packages: ServicePackage[]) => void): () => void {
  let isMounted = true;

  const safeCallback = (incoming: ServicePackage[]) => {
    if (!isMounted) return;
    if (!Array.isArray(incoming)) return;

    const deletedIds = getDeletedPackageIds();
    const cleanPackages = incoming.filter((p) => !deletedIds.includes(p.id));

    callback(cleanPackages);
    try {
      localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(cleanPackages));
    } catch (_) {}
  };

  // 1. Initial fast load
  fetchPublicPackages().then((pkgs) => {
    if (isMounted && Array.isArray(pkgs)) {
      safeCallback(pkgs);
    }
  }).catch(() => {});

  // 2. PRIMARY: Real-time Cloud Firestore listener
  let unsubscribeFirestore: (() => void) | null = null;
  try {
    unsubscribeFirestore = onSnapshot(collection(db, 'packages'), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty) {
        const deletedIds = getDeletedPackageIds();
        const livePackages: ServicePackage[] = [];
        snapshot.forEach((d) => {
          if (!deletedIds.includes(d.id)) {
            const item = d.data() as ServicePackage;
            livePackages.push({ ...item, id: d.id });
          }
        });

        safeCallback(livePackages);
      }
    }, (err) => {
      if (err?.code !== 'unavailable' && err?.code !== 'permission-denied') {
        console.warn('[Cloud Firestore Packages Sync] Snapshot listener notice:', err?.message || err);
      }
    });
  } catch (err: any) {
    if (err?.code !== 'unavailable' && err?.code !== 'permission-denied') {
      console.warn('[Cloud Firestore Packages Sync] onSnapshot setup notice:', err?.message || err);
    }
  }

  // 3. Local reactive event listener for instant 0ms single-tab updates
  const handleLocalUpdate = (e: any) => {
    if (!isMounted) return;
    if (e.detail && Array.isArray(e.detail)) {
      safeCallback(e.detail);
    }
  };
  window.addEventListener('tba_packages_updated', handleLocalUpdate);

  // 4. BroadcastChannel for instant cross-tab reactivity
  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('tba_packages_channel');
      channel.onmessage = (event) => {
        if (!isMounted) return;
        if (event.data && Array.isArray(event.data)) {
          safeCallback(event.data);
        }
      };
    }
  } catch (_) {}

  // 5. Polling Supabase CDN & server every 3 seconds for instant multi-device live sync
  const intervalId = setInterval(() => {
    if (!isMounted) return;
    fetch(`${SUPABASE_PACKAGES_URL}?t=${Date.now()}`, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((supaData) => {
        if (isMounted && Array.isArray(supaData)) {
          safeCallback(supaData);
        } else if (isMounted) {
          fetch('/api/packages')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (isMounted && Array.isArray(data)) {
                safeCallback(data);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (isMounted) {
          fetch('/api/packages')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (isMounted && Array.isArray(data)) {
                safeCallback(data);
              }
            })
            .catch(() => {});
        }
      });
  }, 3000);

  return () => {
    isMounted = false;
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener('tba_packages_updated', handleLocalUpdate);
    if (channel) channel.close();
    clearInterval(intervalId);
  };
}

/**
 * Saves packages permanently to localStorage, Server Cloud API, Supabase CDN, and Cloud Firestore.
 * Ensures that changes and deletions made by the admin are immediately and permanently removed everywhere.
 */
export async function savePackages(packages: ServicePackage[], deletedId?: string): Promise<void> {
  if (deletedId) {
    recordDeletedPackageId(deletedId);
  }

  const deletedIds = getDeletedPackageIds();
  const cleanPackages = (Array.isArray(packages) ? packages : []).filter((p) => !deletedIds.includes(p.id));

  // 0. IMMEDIATE LOCAL PERSISTENCE (Synchronous, guaranteed 0ms)
  try {
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(cleanPackages));
    localStorage.setItem(PACKAGES_INITIALIZED_KEY, 'true');
  } catch (_) {}

  // 1. DIRECT SUPABASE CLOUD SYNC (Guarantees persistence on custom domains and static hosting)
  try {
    const jsonBlob = new Blob([JSON.stringify(cleanPackages, null, 2)], { type: 'application/json' });
    supabaseAdmin.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload('packages/packages.json', jsonBlob, {
        contentType: 'application/json',
        upsert: true
      })
      .catch((supaErr) => {
        console.warn('[Direct Supabase Package Sync] Notice:', supaErr?.message || supaErr);
      });
  } catch (err) {
    console.warn('[Direct Supabase Package Sync] Init notice:', err);
  }

  // 2. SERVER SYNC (If backend proxy is running)
  try {
    await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPackages)
    }).catch(() => {});
  } catch (_) {}

  // 3. Dispatch instant reactive events across tabs & components
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tba_packages_updated', { detail: cleanPackages }));
    }
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('tba_packages_channel');
      channel.postMessage(cleanPackages);
      setTimeout(() => channel.close(), 100);
    }
  } catch (_) {}

  // 4. BACKGROUND FIRESTORE SYNC (Non-blocking, runs in background)
  (async () => {
    try {
      if (deletedId) {
        await deleteDoc(doc(db, 'packages', deletedId)).catch(() => {});
      }

      // Check all existing documents in Firestore 'packages' collection and delete any removed ones
      const snap = await getDocs(collection(db, 'packages')).catch(() => null);
      if (snap) {
        const activeIds = new Set(cleanPackages.map((p) => p.id));
        const delIds = new Set(deletedIds);
        snap.forEach(async (d) => {
          if (delIds.has(d.id) || !activeIds.has(d.id)) {
            await deleteDoc(doc(db, 'packages', d.id)).catch(() => {});
          }
        });
      }

      for (const pkg of cleanPackages) {
        const sanitized = sanitizePackageForFirestore(pkg);
        await setDoc(doc(db, 'packages', pkg.id), sanitized, { merge: true }).catch(() => {});
      }
    } catch (firestoreErr) {
      console.warn('[Cloud Firestore Sync] Packages background sync notice:', firestoreErr);
    }
  })();
}
