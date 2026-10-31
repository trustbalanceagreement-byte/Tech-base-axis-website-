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
    rev: typeof pkg.rev === 'number' ? pkg.rev : Date.now(),
    updatedAt: pkg.updatedAt || new Date().toISOString()
  };

  return clean;
}

/** Revision of a list = newest save stamp found in it (0 for legacy lists without one). */
export function getPackagesRev(list: ServicePackage[] | null | undefined): number {
  if (!Array.isArray(list)) return 0;
  let max = 0;
  for (const p of list) {
    const r = typeof p?.rev === 'number' ? p.rev : p?.updatedAt ? Date.parse(p.updatedAt) || 0 : 0;
    if (r > max) max = r;
  }
  return max;
}

async function readSupabasePackages(): Promise<ServicePackage[] | null> {
  try {
    const r = await fetch(`${SUPABASE_PACKAGES_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) return data;
    }
  } catch (_) {}
  return null;
}

async function readServerPackages(): Promise<ServicePackage[] | null> {
  try {
    const r = await fetch('/api/packages', { cache: 'no-store' });
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) return data;
    }
  } catch (_) {}
  return null;
}

async function readFirestorePackages(): Promise<ServicePackage[] | null> {
  try {
    const snap = await getDocs(collection(db, 'packages'));
    const list: ServicePackage[] = [];
    snap.forEach((d) => list.push({ ...(d.data() as ServicePackage), id: d.id }));
    return list;
  } catch (_) {
    return null;
  }
}

/**
 * Picks the NEWEST copy of the package list among all cloud sources.
 * Different sources can briefly disagree (a write to one of them may fail), so
 * "newest save wins" is what keeps a package the admin just created from being
 * overwritten by an older copy.
 */
export function pickNewestPackages(candidates: (ServicePackage[] | null)[]): ServicePackage[] | null {
  const valid = candidates.filter((c): c is ServicePackage[] => Array.isArray(c));
  if (valid.length === 0) return null;
  let best = valid[0];
  for (const c of valid.slice(1)) {
    const diff = getPackagesRev(c) - getPackagesRev(best);
    if (diff > 0 || (diff === 0 && best.length === 0 && c.length > 0)) best = c;
  }
  return best;
}

/** Newest list across Supabase, the server and Firestore. null when nothing is reachable. */
export async function fetchCloudPackages(): Promise<ServicePackage[] | null> {
  const [supa, fire, server] = await Promise.all([
    readSupabasePackages(),
    readFirestorePackages(),
    readServerPackages()
  ]);
  return pickNewestPackages([supa, fire, server]);
}

/**
 * Fetches public packages: newest cloud copy, else whatever the admin saved locally.
 */
export async function fetchPublicPackages(): Promise<ServicePackage[]> {
  const deletedIds = getDeletedPackageIds();
  const cloud = await fetchCloudPackages();
  const list = cloud ?? loadSavedPackages();
  return list.filter((p) => !deletedIds.includes(p.id));
}

/**
 * Live subscription to public packages for every visitor / device.
 * Sources: Supabase JSON, server JSON (polled) and Cloud Firestore (live listener).
 * The newest save always wins and an older copy can never replace a newer one.
 */
export function subscribeToPublicPackages(callback: (packages: ServicePackage[]) => void): () => void {
  let isMounted = true;
  let lastSerialized = '';
  // Never go back to a copy older than what this device already shows / saved
  let currentRev = getPackagesRev(loadSavedPackages());

  const sources: { supabase: ServicePackage[] | null; firestore: ServicePackage[] | null; server: ServicePackage[] | null } = {
    supabase: null,
    firestore: null,
    server: null
  };

  const accept = (incoming: ServicePackage[] | null) => {
    if (!isMounted || !Array.isArray(incoming)) return;

    const rev = getPackagesRev(incoming);
    if (rev < currentRev) return; // stale copy: ignore

    const deletedIds = getDeletedPackageIds();
    const cleanPackages = incoming.filter((p) => !deletedIds.includes(p.id));

    const serialized = JSON.stringify(cleanPackages);
    if (serialized === lastSerialized) {
      currentRev = Math.max(currentRev, rev);
      return;
    }
    lastSerialized = serialized;
    currentRev = Math.max(currentRev, rev);

    callback(cleanPackages);
    try {
      localStorage.setItem(PACKAGES_STORAGE_KEY, serialized);
    } catch (_) {}
  };

  const recompute = () => accept(pickNewestPackages([sources.supabase, sources.firestore, sources.server]));

  const pullHttpSources = async () => {
    const [supa, server] = await Promise.all([readSupabasePackages(), readServerPackages()]);
    if (!isMounted) return;
    if (supa) sources.supabase = supa;
    if (server) sources.server = server;
    recompute();
  };

  // 1. Initial load + polling of the HTTP sources
  pullHttpSources();
  const intervalId = setInterval(pullHttpSources, 10000);

  // 2. Cloud Firestore live listener (instant updates, no polling cost)
  let unsubscribeFirestore: (() => void) | null = null;
  try {
    unsubscribeFirestore = onSnapshot(
      collection(db, 'packages'),
      (snapshot) => {
        if (!isMounted) return;
        const list: ServicePackage[] = [];
        snapshot.forEach((d) => list.push({ ...(d.data() as ServicePackage), id: d.id }));
        sources.firestore = list;
        recompute();
      },
      (err) => {
        if (err?.code !== 'unavailable' && err?.code !== 'permission-denied') {
          console.warn('[Cloud Firestore Packages Sync] Snapshot listener notice:', err?.message || err);
        }
      }
    );
  } catch (err: any) {
    if (err?.code !== 'unavailable' && err?.code !== 'permission-denied') {
      console.warn('[Cloud Firestore Packages Sync] onSnapshot setup notice:', err?.message || err);
    }
  }

  // 3. Same-tab / cross-tab events fired by the admin panel right after a save
  const handleLocalUpdate = (e: any) => {
    if (e.detail && Array.isArray(e.detail)) {
      // The admin's own fresh save is the newest copy by definition
      sources.supabase = e.detail;
      sources.firestore = e.detail;
      sources.server = e.detail;
      accept(e.detail);
    }
  };
  window.addEventListener('tba_packages_updated', handleLocalUpdate);

  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('tba_packages_channel');
      channel.onmessage = (event) => {
        if (event.data && Array.isArray(event.data)) accept(event.data);
      };
    }
  } catch (_) {}

  return () => {
    isMounted = false;
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener('tba_packages_updated', handleLocalUpdate);
    if (channel) channel.close();
    clearInterval(intervalId);
  };
}

/**
 * Saves packages to localStorage, Supabase, the server and Cloud Firestore.
 * Every save is stamped with a revision so all devices can tell it is the newest copy.
 * Returns true when at least one cloud store accepted the save; when none did, a
 * 'tba_packages_sync_failed' event is fired so the admin panel can warn the admin.
 */
export async function savePackages(packages: ServicePackage[], deletedId?: string): Promise<boolean> {
  if (deletedId) {
    recordDeletedPackageId(deletedId);
  }

  const deletedIds = getDeletedPackageIds();
  const rev = Date.now();
  const cleanPackages: ServicePackage[] = (Array.isArray(packages) ? packages : [])
    .filter((p) => !deletedIds.includes(p.id))
    .map((p) => ({ ...p, rev, updatedAt: new Date(rev).toISOString() }));

  // 0. IMMEDIATE LOCAL PERSISTENCE
  try {
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(cleanPackages));
    localStorage.setItem(PACKAGES_INITIALIZED_KEY, 'true');
  } catch (_) {}

  // 1. Instant reactive update across components / tabs
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

  // 2. Cloud writes in parallel. Each one reports whether it really succeeded.
  const writeSupabase = async (): Promise<boolean> => {
    try {
      const jsonBlob = new Blob([JSON.stringify(cleanPackages, null, 2)], { type: 'application/json' });
      const { error } = await supabaseAdmin.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload('packages/packages.json', jsonBlob, {
          contentType: 'application/json',
          cacheControl: '0',
          upsert: true
        });
      if (error) {
        console.warn('[Direct Supabase Package Sync] Notice:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[Direct Supabase Package Sync] Init notice:', err);
      return false;
    }
  };

  const writeServer = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanPackages)
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  };

  const writeFirestore = async (): Promise<boolean> => {
    try {
      if (deletedId) {
        await deleteDoc(doc(db, 'packages', deletedId)).catch(() => {});
      }

      const snap = await getDocs(collection(db, 'packages'));
      const activeIds = new Set(cleanPackages.map((p) => p.id));
      const delIds = new Set(deletedIds);
      const removals: Promise<unknown>[] = [];
      snap.forEach((d) => {
        if (delIds.has(d.id) || !activeIds.has(d.id)) {
          removals.push(deleteDoc(doc(db, 'packages', d.id)));
        }
      });
      await Promise.all(removals);

      await Promise.all(
        cleanPackages.map((pkg) => setDoc(doc(db, 'packages', pkg.id), sanitizePackageForFirestore(pkg), { merge: true }))
      );
      return true;
    } catch (firestoreErr) {
      console.warn('[Cloud Firestore Sync] Packages sync notice:', firestoreErr);
      return false;
    }
  };

  const results = await Promise.all([writeSupabase(), writeServer(), writeFirestore()]);
  const ok = results.some(Boolean);

  if (!ok && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tba_packages_sync_failed'));
  }
  return ok;
}

// ---------------------------------------------------------------------------
// Admin edits: always apply the change on top of the LATEST cloud list.
//
// Previously every admin action saved the whole list held in the admin's
// browser (localStorage / an old poll result). If that copy was stale (for
// example it still contained old default packages), saving pushed those stale
// packages back to the cloud and every visitor suddenly saw extra packages.
// ---------------------------------------------------------------------------

let lastSavedPackages: ServicePackage[] | null = null;
let lastSavedAt = 0;
let packageWriteQueue: Promise<unknown> = Promise.resolve();

/**
 * Applies `change` to the newest known package list and saves the result.
 * Calls are serialized so quick consecutive admin actions cannot overwrite each other.
 */
export function updatePackagesFromCloud(
  change: (current: ServicePackage[]) => ServicePackage[],
  deletedId?: string
): Promise<ServicePackage[]> {
  const run = async (): Promise<ServicePackage[]> => {
    const deletedIds = getDeletedPackageIds();
    // A list we saved a moment ago may not be visible on the CDN yet: prefer it.
    const recentlySaved = lastSavedPackages && Date.now() - lastSavedAt < 30000;
    const cloud = recentlySaved ? lastSavedPackages : await fetchCloudPackages();
    const base = (cloud ?? loadSavedPackages()).filter((p) => !deletedIds.includes(p.id));

    const next = change(base);
    await savePackages(next, deletedId);

    // Keep the stamped copy that savePackages just wrote locally
    const stamped = loadSavedPackages();
    lastSavedPackages = stamped;
    lastSavedAt = Date.now();
    return stamped;
  };

  const result = packageWriteQueue.then(run, run);
  packageWriteQueue = result.catch(() => {});
  return result;
}
