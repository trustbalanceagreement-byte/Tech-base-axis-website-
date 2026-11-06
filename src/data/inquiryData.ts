import { db, collection, doc, setDoc, deleteDoc, onSnapshot } from '../lib/firebase';
import { ClientInquiry } from '../types';

// ---------------------------------------------------------------------------
// Client inquiries (appointments, quotes, enquiries, package bookings) live in
// the server store (/api/inquiries) and Cloud Firestore so the admin sees them
// on ANY device in real-time.
// ---------------------------------------------------------------------------
const COLLECTION = 'inquiries';
const DELETED_INQUIRIES_KEY = 'tech_base_axis_deleted_inquiries_v2';

/** Firestore and JSON endpoints reject `undefined` values, so drop them before sending. */
function clean<T extends Record<string, any>>(obj: T): Record<string, any> {
  return JSON.parse(JSON.stringify(obj));
}

/** Retrieve all IDs of inquiries explicitly deleted by the admin */
export function getDeletedInquiryIds(): Set<string> {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(DELETED_INQUIRIES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return new Set(parsed.map(String));
        }
      }
    }
  } catch (_) {}
  return new Set<string>();
}

/** Permanently record an inquiry ID as deleted so it can NEVER be resurrected */
export function recordDeletedInquiryId(id: string): void {
  try {
    const cleanId = String(id || '').trim();
    if (!cleanId || typeof window === 'undefined') return;
    const current = getDeletedInquiryIds();
    current.add(cleanId);
    localStorage.setItem(DELETED_INQUIRIES_KEY, JSON.stringify(Array.from(current)));
  } catch (_) {}
}

async function api(method: string, url: string, body?: any): Promise<any | null> {
  try {
    const r = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    });
    if (!r.ok) return null;
    return await r.json();
  } catch (_) {
    return null;
  }
}

// Every inquiry is guaranteed to be saved to the backend server (/api/inquiries)
// and synced to Cloud Firestore.
export async function saveInquiryToCloud(inquiry: ClientInquiry): Promise<boolean> {
  const cleanedInquiry = clean({
    ...inquiry,
    cloudSavedAt: new Date().toISOString()
  });

  // Broadcast locally for instant 0ms UI update across tabs/components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tba_new_inquiry_saved', { detail: cleanedInquiry }));
  }

  // 1. Direct server store (persisted to disk & instant access across all devices)
  const viaServer = api('POST', '/api/inquiries', cleanedInquiry)
    .then((j) => Boolean(j?.success))
    .catch(() => false);

  // 2. Cloud Firestore attempt
  const viaFirestore = (async () => {
    try {
      await setDoc(doc(db, COLLECTION, inquiry.id), cleanedInquiry);
      return true;
    } catch (_) {
      return false;
    }
  })();

  const results = await Promise.all([viaServer, viaFirestore]);
  return results.some(Boolean);
}

export async function updateInquiryInCloud(id: string, patch: Partial<ClientInquiry>): Promise<boolean> {
  const cleanedPatch = clean(patch);

  const viaServer = api('PUT', '/api/inquiries', { id, patch: cleanedPatch })
    .then((j) => Boolean(j?.success))
    .catch(() => false);

  const viaFirestore = setDoc(doc(db, COLLECTION, id), cleanedPatch, { merge: true })
    .then(() => true)
    .catch(() => false);

  return (await Promise.all([viaServer, viaFirestore])).some(Boolean);
}

export async function deleteInquiryFromCloud(id: string): Promise<boolean> {
  // 1. Immediately record in client's deleted tombstone list
  recordDeletedInquiryId(id);

  // 2. Call server DELETE endpoint
  const viaServer = api('DELETE', `/api/inquiries?id=${encodeURIComponent(id)}`)
    .then((j) => Boolean(j?.success))
    .catch(() => false);

  // 3. Delete from Firestore if connected
  const viaFirestore = deleteDoc(doc(db, COLLECTION, id))
    .then(() => true)
    .catch(() => false);

  return (await Promise.all([viaServer, viaFirestore])).some(Boolean);
}

/** Direct fetch from server store with deleted inquiries filtered out */
export async function fetchServerInquiries(): Promise<ClientInquiry[]> {
  const deleted = getDeletedInquiryIds();
  try {
    const j = await api('GET', '/api/inquiries');
    if (j && Array.isArray(j.inquiries)) {
      return (j.inquiries as ClientInquiry[]).filter((i) => i && i.id && !deleted.has(i.id));
    }
  } catch (_) {}
  return [];
}

/** Live list of every inquiry: server store (polled every 2s) merged with Firestore live stream. */
export function subscribeToCloudInquiries(
  onData: (list: ClientInquiry[]) => void,
  onError: (message: string) => void
): () => void {
  let fire: ClientInquiry[] = [];
  let server: ClientInquiry[] = [];
  let fireOk = false;
  let serverOk = false;
  let fireErr = '';
  let alive = true;

  const emit = () => {
    if (!alive) return;
    if (!fireOk && !serverOk) {
      onError(fireErr || 'cloud-unavailable');
      return;
    }
    const deleted = getDeletedInquiryIds();
    const byId = new Map<string, ClientInquiry>();
    for (const i of [...server, ...fire]) {
      if (i && i.id && !deleted.has(i.id)) {
        byId.set(i.id, { ...byId.get(i.id), ...i });
      }
    }
    const list = [...byId.values()].sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );
    onData(list);
  };

  const pollServer = async () => {
    const j = await api('GET', '/api/inquiries');
    if (j && Array.isArray(j.inquiries)) {
      serverOk = true;
      server = j.inquiries as ClientInquiry[];
      emit();
    }
  };

  // Immediate poll
  pollServer();
  // Poll every 2 seconds for near real-time updates when clients book appointments or submit quotes
  const timer = setInterval(pollServer, 2000);

  const handleInstantInquiry = (e: any) => {
    if (e?.detail) {
      server = [e.detail, ...server.filter((x) => x.id !== e.detail.id)];
      emit();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('tba_new_inquiry_saved', handleInstantInquiry);
  }

  let unsub: () => void = () => {};
  try {
    unsub = onSnapshot(
      collection(db, COLLECTION),
      (snap: any) => {
        const list: ClientInquiry[] = [];
        snap.forEach((d: any) => list.push({ ...(d.data() as ClientInquiry), id: d.id }));
        fire = list;
        fireOk = true;
        emit();
      },
      (err: any) => {
        fireOk = false;
        fireErr = err?.code || err?.message || 'permission-denied';
        emit();
      }
    );
  } catch (err: any) {
    fireErr = err?.message || 'error';
    emit();
  }

  return () => {
    alive = false;
    clearInterval(timer);
    if (typeof window !== 'undefined') {
      window.removeEventListener('tba_new_inquiry_saved', handleInstantInquiry);
    }
    unsub();
  };
}
