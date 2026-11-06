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

// ---------------------------------------------------------------------------
// Storage layout (v2)
//
// Older versions of the site (still cached in some visitors' browsers) keep
// writing their built-in default plans to the OLD locations: the Firestore
// 'packages' collection, packages/packages.json on Supabase and /api/packages.
// Those writes replaced the plans the admin created. The live package list now
// lives in NEW, separate locations that older versions never touch.
// ---------------------------------------------------------------------------
export const PACKAGES_STORAGE_KEY = 'tech_base_axis_packages_v2_envelope';
export const DELETED_PACKAGES_STORAGE_KEY = 'tech_base_axis_deleted_packages_v1';

import { db, doc, getDoc, setDoc, onSnapshot } from '../lib/firebase';
import { supabaseAdmin, SUPABASE_STORAGE_BUCKET } from '../lib/supabaseClient';

export const SUPABASE_PACKAGES_URL = 'https://httjpsskqtgjtmjgrjgs.supabase.co/storage/v1/object/public/Tech%20Base%20Axis%20Storege/packages/packages-v2.json';
const SUPABASE_PACKAGES_PATH = 'packages/packages-v2.json';
const SERVER_PACKAGES_ENDPOINT = '/api/packages-v2';
const FIRESTORE_PACKAGES_COLLECTION = 'packages_v2';
const FIRESTORE_PACKAGES_DOC = 'current';

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

// ---------------------------------------------------------------------------
// The package list travels as an "envelope": { v: 2, rev, packages }.
// `rev` is the time of the save. Every store (browser, Supabase, server,
// Firestore) holds a copy and the copy with the highest `rev` always wins, so an
// older copy can never replace a newer one, and an empty list (admin deleted
// everything) is still a valid, newer state.
// ---------------------------------------------------------------------------
export interface PackagesEnvelope {
  v: 2;
  rev: number;
  packages: ServicePackage[];
}

function isEnvelope(x: any): x is PackagesEnvelope {
  return Boolean(x) && typeof x === 'object' && typeof x.rev === 'number' && Array.isArray(x.packages);
}

function readLocalEnvelope(): PackagesEnvelope | null {
  try {
    const raw = localStorage.getItem(PACKAGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isEnvelope(parsed)) return parsed;
    }
  } catch (_) {}
  return null;
}

function writeLocalEnvelope(env: PackagesEnvelope): void {
  try {
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(env));
  } catch (_) {}
}

/**
 * The packages this device last saved or received. Returns an empty list when
 * nothing was saved: the built-in INITIAL_PACKAGES are NEVER used as a silent
 * fallback, so only packages the admin created are ever shown.
 */
export function loadSavedPackages(): ServicePackage[] {
  if (typeof window === 'undefined') return [];
  return readLocalEnvelope()?.packages ?? [];
}

export function pickNewestEnvelope(candidates: (PackagesEnvelope | null | undefined)[]): PackagesEnvelope | null {
  let best: PackagesEnvelope | null = null;
  for (const c of candidates) {
    if (!isEnvelope(c)) continue;
    if (!best || c.rev > best.rev) best = c;
  }
  return best;
}

async function readSupabaseEnvelope(): Promise<PackagesEnvelope | null> {
  try {
    const r = await fetch(`${SUPABASE_PACKAGES_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (r.ok) {
      const data = await r.json();
      if (isEnvelope(data)) return data;
    }
  } catch (_) {}
  return null;
}

async function readServerEnvelope(): Promise<PackagesEnvelope | null> {
  try {
    const r = await fetch(SERVER_PACKAGES_ENDPOINT, { cache: 'no-store' });
    if (r.ok) {
      const data = await r.json();
      if (isEnvelope(data)) return data;
    }
  } catch (_) {}
  return null;
}

function envelopeFromFirestore(data: any): PackagesEnvelope | null {
  try {
    if (!data || typeof data.rev !== 'number') return null;
    const list = typeof data.json === 'string' ? JSON.parse(data.json) : null;
    return Array.isArray(list) ? { v: 2, rev: data.rev, packages: list } : null;
  } catch (_) {
    return null;
  }
}

async function readFirestoreEnvelope(): Promise<PackagesEnvelope | null> {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_PACKAGES_COLLECTION, FIRESTORE_PACKAGES_DOC));
    return snap.exists() ? envelopeFromFirestore(snap.data()) : null;
  } catch (_) {
    return null;
  }
}

/** Newest copy across Supabase, the server and Firestore. null when none is reachable / nothing saved yet. */
export async function fetchCloudEnvelope(): Promise<PackagesEnvelope | null> {
  const [supa, server, fire] = await Promise.all([
    readSupabaseEnvelope(),
    readServerEnvelope(),
    readFirestoreEnvelope()
  ]);
  return pickNewestEnvelope([supa, server, fire]);
}

/**
 * Live subscription to the public packages for every visitor / device.
 * Sources: Supabase JSON + server (polled) and Cloud Firestore (live listener).
 * The newest save always wins; an older copy can never replace a newer one.
 */
export function subscribeToPublicPackages(callback: (packages: ServicePackage[]) => void): () => void {
  let isMounted = true;
  let lastSerialized = '';
  // Never go back to a copy older than what this device already has
  let currentRev = readLocalEnvelope()?.rev ?? 0;

  const sources: { supabase: PackagesEnvelope | null; server: PackagesEnvelope | null; firestore: PackagesEnvelope | null } = {
    supabase: null,
    server: null,
    firestore: null
  };

  const accept = (env: PackagesEnvelope | null) => {
    if (!isMounted || !isEnvelope(env)) return;
    if (env.rev < currentRev) return; // stale copy: ignore

    const serialized = JSON.stringify(env.packages);
    const changed = serialized !== lastSerialized || env.rev > currentRev;
    currentRev = Math.max(currentRev, env.rev);
    if (!changed) return;
    lastSerialized = serialized;

    writeLocalEnvelope(env);
    callback(env.packages);
  };

  const recompute = () => accept(pickNewestEnvelope([sources.supabase, sources.server, sources.firestore]));

  const pullHttpSources = async () => {
    const [supa, server] = await Promise.all([readSupabaseEnvelope(), readServerEnvelope()]);
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
      doc(db, FIRESTORE_PACKAGES_COLLECTION, FIRESTORE_PACKAGES_DOC),
      (snap: any) => {
        if (!isMounted) return;
        sources.firestore = snap.exists() ? envelopeFromFirestore(snap.data()) : null;
        recompute();
      },
      (err: any) => {
        if (err?.code !== 'unavailable' && err?.code !== 'permission-denied') {
          console.warn('[Cloud Firestore Packages Sync] Snapshot listener notice:', err?.message || err);
        }
      }
    );
  } catch (err: any) {
    console.warn('[Cloud Firestore Packages Sync] onSnapshot setup notice:', err?.message || err);
  }

  // 3. Same-tab / cross-tab events fired by the admin panel right after a save
  const handleLocalUpdate = (e: any) => {
    if (isEnvelope(e?.detail)) accept(e.detail);
  };
  window.addEventListener('tba_packages_updated', handleLocalUpdate);

  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('tba_packages_channel_v2');
      channel.onmessage = (event) => accept(event.data);
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

let highestRev = 0;

/**
 * Saves the package list to this browser, Supabase, the server and Cloud Firestore.
 * Every save gets a new, higher revision so all devices know it is the newest copy.
 * Returns true when at least one cloud store accepted it; when none did, a
 * 'tba_packages_sync_failed' event is fired so the admin panel can warn the admin.
 */
export async function savePackages(packages: ServicePackage[], deletedId?: string): Promise<boolean> {
  if (deletedId) {
    recordDeletedPackageId(deletedId);
  }

  const rev = Math.max(Date.now(), (readLocalEnvelope()?.rev ?? 0) + 1, highestRev + 1);
  highestRev = rev;
  const iso = new Date(rev).toISOString();
  const env: PackagesEnvelope = {
    v: 2,
    rev,
    packages: (Array.isArray(packages) ? packages : []).map((p) => ({ ...p, rev, updatedAt: iso }))
  };

  // 0. Immediate local persistence + instant update of every open tab / component
  writeLocalEnvelope(env);
  try {
    window.dispatchEvent(new CustomEvent('tba_packages_updated', { detail: env }));
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('tba_packages_channel_v2');
      channel.postMessage(env);
      setTimeout(() => channel.close(), 100);
    }
  } catch (_) {}

  // 1. Cloud writes in parallel; each reports whether it really succeeded
  const writeSupabase = async (): Promise<boolean> => {
    try {
      const blob = new Blob([JSON.stringify(env, null, 2)], { type: 'application/json' });
      const { error } = await supabaseAdmin.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(SUPABASE_PACKAGES_PATH, blob, { contentType: 'application/json', cacheControl: '0', upsert: true });
      if (error) {
        console.warn('[Supabase Package Sync] Notice:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[Supabase Package Sync] Notice:', err);
      return false;
    }
  };

  const writeServer = async (): Promise<boolean> => {
    try {
      const res = await fetch(SERVER_PACKAGES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(env)
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  };

  const writeFirestore = async (): Promise<boolean> => {
    try {
      await setDoc(doc(db, FIRESTORE_PACKAGES_COLLECTION, FIRESTORE_PACKAGES_DOC), {
        v: 2,
        rev,
        json: JSON.stringify(env.packages),
        updatedAt: iso
      });
      return true;
    } catch (err) {
      console.warn('[Cloud Firestore Package Sync] Notice:', err);
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
// Admin edits are always applied on top of the NEWEST known copy (never on a
// possibly stale list held in the admin's browser), and one at a time, so quick
// consecutive edits cannot overwrite each other.
// ---------------------------------------------------------------------------
let lastSavedEnvelope: PackagesEnvelope | null = null;
let lastSavedAt = 0;
let packageWriteQueue: Promise<unknown> = Promise.resolve();

export function updatePackagesFromCloud(
  change: (current: ServicePackage[]) => ServicePackage[],
  deletedId?: string
): Promise<ServicePackage[]> {
  const run = async (): Promise<ServicePackage[]> => {
    // A copy we saved a moment ago may not be visible in the cloud yet: prefer it.
    const recentlySaved = lastSavedEnvelope && Date.now() - lastSavedAt < 30000;
    const cloud = recentlySaved ? lastSavedEnvelope : await fetchCloudEnvelope();
    const base = pickNewestEnvelope([cloud, readLocalEnvelope()]);

    const next = change(base ? base.packages : []);
    await savePackages(next, deletedId);

    lastSavedEnvelope = readLocalEnvelope();
    lastSavedAt = Date.now();
    return lastSavedEnvelope ? lastSavedEnvelope.packages : next;
  };

  const result = packageWriteQueue.then(run, run);
  packageWriteQueue = result.catch(() => {});
  return result;
}

/** Billing term of a recurring package, read from its period label ("/year", "yearly", "annual" => yearly). */
export function getPackageTerm(period?: string): 'monthly' | 'yearly' {
  const p = (period || '').toLowerCase();
  return p.includes('year') || p.includes('annual') ? 'yearly' : 'monthly';
}
