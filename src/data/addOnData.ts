import { useEffect, useState } from 'react';
import { db, doc, getDoc, setDoc, onSnapshot } from '../lib/firebase';
import { supabaseAdmin, SUPABASE_STORAGE_BUCKET } from '../lib/supabaseClient';

// ---------------------------------------------------------------------------
// Admin-editable prices for the booking "Extra Add-ons".
// Only the prices the admin changed are stored: { [addOnId]: price }.
// Like the packages, every save carries a revision and the newest copy wins
// across this browser, Supabase and Cloud Firestore.
// ---------------------------------------------------------------------------
export type AddOnPrices = Record<string, number>;

interface AddOnPricesEnvelope {
  v: 1;
  rev: number;
  prices: AddOnPrices;
}

const LOCAL_KEY = 'tech_base_axis_addon_prices_v1';
const SUPABASE_URL_PUBLIC =
  'https://httjpsskqtgjtmjgrjgs.supabase.co/storage/v1/object/public/Tech%20Base%20Axis%20Storege/packages/addon-prices-v1.json';
const SUPABASE_PATH = 'packages/addon-prices-v1.json';
const FIRESTORE_COLLECTION = 'packages_v2';
const FIRESTORE_DOC = 'addons';
const UPDATED_EVENT = 'tba_addon_prices_updated';

function cleanPrices(input: any): AddOnPrices {
  const out: AddOnPrices = {};
  if (input && typeof input === 'object') {
    for (const [id, value] of Object.entries(input)) {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) out[id] = Math.round(n);
    }
  }
  return out;
}

function isEnvelope(x: any): x is AddOnPricesEnvelope {
  return Boolean(x) && typeof x === 'object' && typeof x.rev === 'number' && x.prices && typeof x.prices === 'object';
}

function readLocal(): AddOnPricesEnvelope | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isEnvelope(parsed)) return parsed;
    }
  } catch (_) {}
  return null;
}

function writeLocal(env: AddOnPricesEnvelope) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(env));
  } catch (_) {}
}

function newest(list: (AddOnPricesEnvelope | null)[]): AddOnPricesEnvelope | null {
  let best: AddOnPricesEnvelope | null = null;
  for (const e of list) if (e && (!best || e.rev > best.rev)) best = e;
  return best;
}

async function readSupabase(): Promise<AddOnPricesEnvelope | null> {
  try {
    const r = await fetch(`${SUPABASE_URL_PUBLIC}?t=${Date.now()}`, { cache: 'no-store' });
    if (r.ok) {
      const data = await r.json();
      if (isEnvelope(data)) return { v: 1, rev: data.rev, prices: cleanPrices(data.prices) };
    }
  } catch (_) {}
  return null;
}

function fromFirestore(data: any): AddOnPricesEnvelope | null {
  try {
    if (data && typeof data.rev === 'number' && typeof data.json === 'string') {
      return { v: 1, rev: data.rev, prices: cleanPrices(JSON.parse(data.json)) };
    }
  } catch (_) {}
  return null;
}

async function readFirestore(): Promise<AddOnPricesEnvelope | null> {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC));
    return snap.exists() ? fromFirestore(snap.data()) : null;
  } catch (_) {
    return null;
  }
}

/** Newest known copy of the saved prices (cloud first, then this browser). */
export async function fetchLatestAddOnPrices(): Promise<AddOnPrices> {
  const [supa, fire] = await Promise.all([readSupabase(), readFirestore()]);
  return newest([supa, fire, readLocal()])?.prices ?? {};
}

export function loadAddOnPrices(): AddOnPrices {
  if (typeof window === 'undefined') return {};
  return readLocal()?.prices ?? {};
}

/** Saves the prices everywhere. Returns true when at least one cloud store accepted them. */
export async function saveAddOnPrices(prices: AddOnPrices): Promise<boolean> {
  const rev = Math.max(Date.now(), (readLocal()?.rev ?? 0) + 1);
  const env: AddOnPricesEnvelope = { v: 1, rev, prices: cleanPrices(prices) };

  writeLocal(env);
  try {
    window.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail: env }));
  } catch (_) {}

  const writeSupabase = async () => {
    try {
      const blob = new Blob([JSON.stringify(env)], { type: 'application/json' });
      const { error } = await supabaseAdmin.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(SUPABASE_PATH, blob, { contentType: 'application/json', cacheControl: '0', upsert: true });
      return !error;
    } catch (_) {
      return false;
    }
  };
  const writeFirestore = async () => {
    try {
      await setDoc(doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC), {
        rev,
        json: JSON.stringify(env.prices),
        updatedAt: new Date(rev).toISOString()
      });
      return true;
    } catch (_) {
      return false;
    }
  };

  const results = await Promise.all([writeSupabase(), writeFirestore()]);
  return results.some(Boolean);
}

/** Live add-on price overrides for every visitor. */
export function subscribeToAddOnPrices(callback: (prices: AddOnPrices) => void): () => void {
  let alive = true;
  let currentRev = readLocal()?.rev ?? 0;

  const apply = (env: AddOnPricesEnvelope | null) => {
    if (!alive || !env || env.rev < currentRev) return;
    currentRev = env.rev;
    writeLocal(env);
    callback(env.prices);
  };

  callback(loadAddOnPrices());

  const refresh = async () => {
    const [supa, fire] = await Promise.all([readSupabase(), readFirestore()]);
    apply(newest([supa, fire]));
  };
  refresh();
  const timer = setInterval(refresh, 15000);

  const onLocal = (e: Event) => apply((e as CustomEvent).detail as AddOnPricesEnvelope);
  window.addEventListener(UPDATED_EVENT, onLocal);

  let unsubscribeFirestore: (() => void) | null = null;
  try {
    unsubscribeFirestore = onSnapshot(
      doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC),
      (snap: any) => {
        if (snap.exists()) apply(fromFirestore(snap.data()));
      },
      () => {}
    );
  } catch (_) {}

  return () => {
    alive = false;
    clearInterval(timer);
    window.removeEventListener(UPDATED_EVENT, onLocal);
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}

export function useAddOnPrices(): AddOnPrices {
  const [prices, setPrices] = useState<AddOnPrices>(() => loadAddOnPrices());
  useEffect(() => subscribeToAddOnPrices(setPrices), []);
  return prices;
}
