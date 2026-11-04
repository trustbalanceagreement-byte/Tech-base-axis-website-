import { db, collection, doc, setDoc, deleteDoc, onSnapshot } from '../lib/firebase';
import { ClientInquiry } from '../types';

// ---------------------------------------------------------------------------
// Client inquiries (appointments, quotes, enquiries, package bookings) live in
// Cloud Firestore so the admin sees them on ANY device. Before, they were only
// kept in the visitor's own browser, so the admin panel never received them.
// ---------------------------------------------------------------------------
const COLLECTION = 'inquiries';

/** Firestore rejects `undefined` values, so drop them before saving. */
function clean<T extends Record<string, any>>(obj: T): Record<string, any> {
  return JSON.parse(JSON.stringify(obj));
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

// Every change is written to Firestore AND to the server store (/api/inquiries).
// It counts as saved when at least one of them accepts it.
export async function saveInquiryToCloud(inquiry: ClientInquiry): Promise<boolean> {
  const viaFirestore = (async () => {
    try {
      await setDoc(doc(db, COLLECTION, inquiry.id), clean({ ...inquiry, cloudSavedAt: new Date().toISOString() }));
      return true;
    } catch (err) {
      console.warn('[Inquiries] Firestore save failed:', err);
      return false;
    }
  })();
  const viaServer = api('POST', '/api/inquiries', clean(inquiry)).then((j) => Boolean(j?.success));
  const results = await Promise.all([viaFirestore, viaServer]);
  return results.some(Boolean);
}

export async function updateInquiryInCloud(id: string, patch: Partial<ClientInquiry>): Promise<boolean> {
  const viaFirestore = setDoc(doc(db, COLLECTION, id), clean(patch), { merge: true }).then(() => true).catch(() => false);
  const viaServer = api('PUT', '/api/inquiries', { id, patch: clean(patch) }).then((j) => Boolean(j?.success));
  return (await Promise.all([viaFirestore, viaServer])).some(Boolean);
}

export async function deleteInquiryFromCloud(id: string): Promise<boolean> {
  const viaFirestore = deleteDoc(doc(db, COLLECTION, id)).then(() => true).catch(() => false);
  const viaServer = api('DELETE', `/api/inquiries?id=${encodeURIComponent(id)}`).then((j) => Boolean(j?.success));
  return (await Promise.all([viaFirestore, viaServer])).some(Boolean);
}

/** Live list of every inquiry: Firestore (live) merged with the server store (polled every 12s). */
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
    const byId = new Map<string, ClientInquiry>();
    for (const i of [...server, ...fire]) byId.set(i.id, { ...byId.get(i.id), ...i });
    const list = [...byId.values()].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    onData(list);
  };

  const pollServer = async () => {
    const j = await api('GET', '/api/inquiries');
    serverOk = Boolean(j && Array.isArray(j.inquiries));
    server = serverOk ? (j.inquiries as ClientInquiry[]) : [];
    emit();
  };
  pollServer();
  const timer = setInterval(pollServer, 12000);

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
    unsub();
  };
}
