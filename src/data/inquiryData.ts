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

export async function saveInquiryToCloud(inquiry: ClientInquiry): Promise<boolean> {
  try {
    await setDoc(doc(db, COLLECTION, inquiry.id), clean({ ...inquiry, cloudSavedAt: new Date().toISOString() }));
    return true;
  } catch (err) {
    console.warn('[Inquiries] Could not save to cloud:', err);
    return false;
  }
}

export async function updateInquiryInCloud(id: string, patch: Partial<ClientInquiry>): Promise<boolean> {
  try {
    await setDoc(doc(db, COLLECTION, id), clean(patch), { merge: true });
    return true;
  } catch (err) {
    console.warn('[Inquiries] Could not update in cloud:', err);
    return false;
  }
}

export async function deleteInquiryFromCloud(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return true;
  } catch (err) {
    console.warn('[Inquiries] Could not delete from cloud:', err);
    return false;
  }
}

/** Live list of every inquiry (admin only: Firestore rules block everyone else). */
export function subscribeToCloudInquiries(
  onData: (list: ClientInquiry[]) => void,
  onError: (message: string) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, COLLECTION),
      (snap: any) => {
        const list: ClientInquiry[] = [];
        snap.forEach((d: any) => list.push({ ...(d.data() as ClientInquiry), id: d.id }));
        list.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
        onData(list);
      },
      (err: any) => onError(err?.code || err?.message || 'permission-denied')
    );
  } catch (err: any) {
    onError(err?.message || 'error');
    return () => {};
  }
}
