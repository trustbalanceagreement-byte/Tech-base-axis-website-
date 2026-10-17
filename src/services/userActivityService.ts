import { 
  db, 
  setDoc, 
  deleteDoc,
  doc, 
  collection, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from '../lib/firebase';

export interface UserActivityProfile {
  id: string;
  email: string;
  name: string;
  photoURL?: string | null;
  role: 'admin' | 'client';
  createdAt: string;
  lastLoginAt: string;
  lastLogoutAt?: string | null;
  lastActiveAt: string;
  isOnline: boolean;
  device?: string;
  ip?: string;
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

export interface ActivityDashboardData {
  users: UserActivityProfile[];
  recentEvents: ActivityEvent[];
  stats: {
    totalUsers: number;
    onlineCount: number;
    offlineCount: number;
    loginsToday: number;
    signupsToday: number;
    serverTime?: string;
  };
}

// Global in-memory unified registry to prevent state oscillation and glitches
const unifiedUserMap = new Map<string, UserActivityProfile>();
const unifiedEventMap = new Map<string, ActivityEvent>();

function normalizeKey(emailOrId?: string): string {
  return (emailOrId || '').toLowerCase().trim();
}

function findExistingUserKey(u: { email?: string; id?: string }): string | null {
  const normEmail = (u.email || '').toLowerCase().trim();
  const normId = (u.id || '').trim();

  for (const [k, existing] of unifiedUserMap.entries()) {
    if (normEmail && existing.email && existing.email.toLowerCase().trim() === normEmail) {
      return k;
    }
    if (normId && existing.id && existing.id === normId) {
      return k;
    }
    if (normEmail && k === normEmail) {
      return k;
    }
    if (normId && k === normId.toLowerCase()) {
      return k;
    }
  }
  return null;
}

/**
 * Merges an array of user profiles into the unified in-memory registry.
 * Preserves existing fields while deduplicating by email/ID.
 */
function mergeIntoUnifiedUserMap(newUsers: UserActivityProfile[]): void {
  if (!Array.isArray(newUsers)) return;
  for (const u of newUsers) {
    if (!u) continue;
    const normEmail = (u.email || '').toLowerCase().trim();
    const targetKey = normEmail || (u.id || '').toLowerCase().trim();
    if (!targetKey) continue;

    const existingKey = findExistingUserKey(u);
    const existing = existingKey ? unifiedUserMap.get(existingKey) : undefined;

    if (existingKey && existingKey !== targetKey) {
      unifiedUserMap.delete(existingKey);
    }

    const merged: UserActivityProfile = {
      id: u.id || existing?.id || targetKey,
      email: u.email || existing?.email || targetKey,
      name: u.name || existing?.name || targetKey.split('@')[0],
      photoURL: u.photoURL || existing?.photoURL || null,
      device: u.device || existing?.device || 'Web Browser',
      role: u.role || existing?.role || (targetKey.includes('techbaseaxis') || targetKey.includes('bgho40185') ? 'admin' : 'client'),
      createdAt: existing?.createdAt || u.createdAt || new Date().toISOString(),
      lastLoginAt: u.lastLoginAt || existing?.lastLoginAt || new Date().toISOString(),
      lastActiveAt: u.lastActiveAt || existing?.lastActiveAt || new Date().toISOString(),
      lastLogoutAt: u.lastLogoutAt !== undefined ? u.lastLogoutAt : existing?.lastLogoutAt,
      isOnline: u.isOnline !== undefined ? u.isOnline : (existing?.isOnline ?? false)
    };

    unifiedUserMap.set(targetKey, merged);
  }
}

function mergeIntoUnifiedEventMap(newEvents: ActivityEvent[]): void {
  if (!Array.isArray(newEvents)) return;
  for (const e of newEvents) {
    if (!e || !e.id) continue;
    unifiedEventMap.set(e.id, e);
  }
}

/**
 * Builds a consistent, glitch-free ActivityDashboardData from the unified registry.
 */
function buildUnifiedDashboard(): ActivityDashboardData {
  const now = Date.now();
  const users = Array.from(unifiedUserMap.values()).map((u) => {
    const activeAgeMs = now - new Date(u.lastActiveAt || 0).getTime();
    const logoutTime = u.lastLogoutAt ? new Date(u.lastLogoutAt).getTime() : 0;
    const activeTime = new Date(u.lastActiveAt || 0).getTime();
    // Online if pinged within last 2.5 minutes (150,000 ms) and not logged out after active ping
    const isOnline = activeAgeMs < 150000 && activeTime >= logoutTime;
    return {
      ...u,
      isOnline
    };
  });

  // Sort: online users first, then by lastActiveAt descending
  users.sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return new Date(b.lastActiveAt || 0).getTime() - new Date(a.lastActiveAt || 0).getTime();
  });

  const onlineCount = users.filter((u) => u.isOnline).length;
  const offlineCount = users.length - onlineCount;

  const isToday = (isoDate?: string | null) => {
    if (!isoDate) return false;
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

  const events = Array.from(unifiedEventMap.values());
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const loginsToday = events.filter((e) => e.type === 'login' && isToday(e.timestamp)).length;
  const signupsToday = events.filter((e) => e.type === 'signup' && isToday(e.timestamp)).length;

  const data: ActivityDashboardData = {
    users,
    recentEvents: events.slice(0, 100),
    stats: {
      totalUsers: users.length,
      onlineCount,
      offlineCount,
      loginsToday,
      signupsToday,
      serverTime: new Date().toISOString()
    }
  };

  // Cache locally
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tba_activity_cache_v2', JSON.stringify(data));
    }
  } catch (_) {}

  return data;
}

/**
 * Sends user activity event to the server and Firestore, and updates local unified state instantly.
 */
export async function recordUserActivityEvent(payload: {
  userId: string;
  email: string;
  name?: string;
  photoURL?: string | null;
  type: 'signup' | 'login' | 'logout' | 'heartbeat';
  device?: string;
  details?: string;
}): Promise<void> {
  if (!payload.email && !payload.userId) return;

  const nowIso = new Date().toISOString();
  const userKey = normalizeKey(payload.email || payload.userId);
  const deviceStr = payload.device || (typeof navigator !== 'undefined' ? `${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} / ${navigator.platform || 'Web'}` : 'Web');

  const bodyData = {
    ...payload,
    timestamp: nowIso,
    device: deviceStr
  };

  const isAdmin = userKey.includes('techbaseaxis') || userKey.includes('bgho40185');

  // Immediately register in local unified map
  const existing = unifiedUserMap.get(userKey);
  const updatedProfile: UserActivityProfile = {
    id: payload.userId || existing?.id || `usr_${Date.now()}`,
    email: payload.email || existing?.email || userKey,
    name: payload.name || existing?.name || userKey.split('@')[0],
    photoURL: payload.photoURL || existing?.photoURL || null,
    role: isAdmin ? 'admin' : (existing?.role || 'client'),
    createdAt: existing?.createdAt || nowIso,
    lastLoginAt: payload.type === 'signup' || payload.type === 'login' ? nowIso : (existing?.lastLoginAt || nowIso),
    lastLogoutAt: payload.type === 'logout' ? nowIso : (payload.type === 'heartbeat' || payload.type === 'login' ? null : existing?.lastLogoutAt),
    lastActiveAt: nowIso,
    isOnline: payload.type !== 'logout',
    device: deviceStr
  };

  unifiedUserMap.set(userKey, updatedProfile);

  if (payload.type !== 'heartbeat') {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    unifiedEventMap.set(eventId, {
      id: eventId,
      userId: updatedProfile.id,
      name: updatedProfile.name,
      email: updatedProfile.email,
      photoURL: updatedProfile.photoURL,
      type: payload.type,
      timestamp: nowIso,
      device: deviceStr,
      details: payload.details || `${updatedProfile.name} ${payload.type === 'signup' ? 'created an account' : payload.type === 'login' ? 'logged in' : 'logged out'}`
    });
  }

  // Update localStorage and trigger reactive events across window and tabs
  buildUnifiedDashboard();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tba_user_activity_updated'));
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('tba_activity_channel');
        bc.postMessage({ type: 'activity_updated', timestamp: nowIso });
        bc.close();
      }
    } catch (_) {}
  }

  // 1. Post to Server API for centralized persistence
  try {
    if (typeof navigator !== 'undefined' && payload.type === 'logout' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(bodyData)], { type: 'application/json' });
      navigator.sendBeacon('/api/activity/event', blob);
    } else {
      fetch('/api/activity/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
        keepalive: payload.type === 'logout'
      }).catch(() => {});
    }
  } catch (_) {}

  // 2. Sync to Firestore collection 'user_activity' & 'activity_events'
  try {
    const userDocId = userKey.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    const profileUpdate: any = {
      id: updatedProfile.id,
      email: updatedProfile.email,
      name: updatedProfile.name,
      photoURL: updatedProfile.photoURL,
      role: updatedProfile.role,
      device: deviceStr,
      lastActiveAt: nowIso
    };

    if (payload.type === 'signup') {
      profileUpdate.createdAt = nowIso;
      profileUpdate.lastLoginAt = nowIso;
      profileUpdate.lastLogoutAt = null;
      profileUpdate.isOnline = true;
    } else if (payload.type === 'login') {
      profileUpdate.lastLoginAt = nowIso;
      profileUpdate.lastLogoutAt = null;
      profileUpdate.isOnline = true;
    } else if (payload.type === 'logout') {
      profileUpdate.lastLogoutAt = nowIso;
      profileUpdate.isOnline = false;
    } else if (payload.type === 'heartbeat') {
      profileUpdate.isOnline = true;
    }

    setDoc(doc(db, 'user_activity', userDocId), profileUpdate, { merge: true }).catch(() => {});

    // Save individual event doc into 'activity_events'
    if (payload.type !== 'heartbeat') {
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setDoc(doc(db, 'activity_events', eventId), {
        id: eventId,
        userId: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.name,
        photoURL: updatedProfile.photoURL,
        type: payload.type,
        timestamp: nowIso,
        device: deviceStr,
        details: payload.details || `${updatedProfile.name} ${payload.type === 'signup' ? 'created an account' : payload.type === 'login' ? 'logged in' : 'logged out'}`
      }).catch(() => {});
    }
  } catch (_) {}
}

/**
 * Fetches real-time activity and presence dashboard, consolidating server data, local cache, and in-memory registry.
 */
export async function fetchUserActivityDashboard(): Promise<ActivityDashboardData> {
  // 1. Fetch from Server API
  try {
    const res = await fetch('/api/activity');
    if (res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && Array.isArray(data.users)) {
          // Keep active online user sessions
          const liveOnline = Array.from(unifiedUserMap.values()).filter((u) => u.isOnline);
          unifiedUserMap.clear();
          mergeIntoUnifiedUserMap(data.users);
          for (const live of liveOnline) {
            const key = (live.email || live.id || '').toLowerCase().trim();
            if (key && unifiedUserMap.has(key)) {
              const cur = unifiedUserMap.get(key)!;
              unifiedUserMap.set(key, { ...cur, isOnline: true, lastActiveAt: live.lastActiveAt });
            }
          }
          if (Array.isArray(data.recentEvents)) {
            mergeIntoUnifiedEventMap(data.recentEvents);
          }
          return buildUnifiedDashboard();
        }
      }
    }
  } catch (err) {
    console.warn('[Activity Service] Server fetch notice:', err);
  }

  // 2. Recover from local cache if offline
  try {
    const cached = typeof window !== 'undefined' ? localStorage.getItem('tba_activity_cache_v2') : null;
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.users)) {
        mergeIntoUnifiedUserMap(parsed.users);
        if (Array.isArray(parsed.recentEvents)) {
          mergeIntoUnifiedEventMap(parsed.recentEvents);
        }
        return buildUnifiedDashboard();
      }
    }
  } catch (_) {}

  // 3. Fallback baseline if completely clean
  if (unifiedUserMap.size === 0) {
    mergeIntoUnifiedUserMap([
      {
        id: 'tba-founder-verified',
        email: 'techbaseaxis@gmail.com',
        name: 'Bikram Ghosh (Founder)',
        photoURL: '/src/assets/images/bikram-ghosh-developer-avatar.webp',
        role: 'admin',
        createdAt: '2026-01-10T08:30:00.000Z',
        lastLoginAt: new Date().toISOString(),
        lastLogoutAt: null,
        lastActiveAt: new Date().toISOString(),
        isOnline: true,
        device: 'Admin Console'
      },
      {
        id: 'usr_bikram_ghosh',
        email: 'bgho40185@gmail.com',
        name: 'Bikram Ghosh',
        photoURL: '/src/assets/images/bikram-ghosh-lead-architect-kolkata.webp',
        role: 'admin',
        createdAt: '2026-01-15T10:00:00.000Z',
        lastLoginAt: '2026-10-07T03:30:00.000Z',
        lastLogoutAt: null,
        lastActiveAt: '2026-10-07T03:30:00.000Z',
        isOnline: false,
        device: 'Android Chrome / Mobile'
      },
      {
        id: 'k2kv6msCjrfiO5FQJGxTSXprZPQ2',
        email: 'agnikx4@gmail.com',
        name: 'Agnik Das',
        photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocLPJ1k2cuxcWkkSMlg3dQssRmk-77R-MvoI2X-l9p9PmrLY7IF2=s96-c',
        role: 'client',
        createdAt: '2026-10-16T19:34:37.880Z',
        lastLoginAt: '2026-10-16T19:34:37.880Z',
        lastLogoutAt: null,
        lastActiveAt: '2026-10-16T19:34:37.880Z',
        isOnline: false,
        device: 'Mobile / Linux armv81'
      },
      {
        id: '3tPaiYcf1CdGE9p0IXLD0hDCtLp1',
        email: 'rohankundu454@gmail.com',
        name: 'Rohan Kundu',
        photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocJva7fRVe5QCiTFH3QgcTTaZZQuAaqby1jL335BRCxy4A_1PA=s96-c',
        role: 'client',
        createdAt: '2026-10-16T17:42:23.000Z',
        lastLoginAt: '2026-10-16T17:42:23.000Z',
        lastLogoutAt: '2026-10-16T17:43:30.295Z',
        lastActiveAt: '2026-10-16T17:44:39.088Z',
        isOnline: false,
        device: 'Mobile / Linux armv81'
      }
    ]);
  }

  return buildUnifiedDashboard();
}

/**
 * Subscribes to live user activity updates using Firestore real-time listeners (onSnapshot)
 * and seamless merging so the user counts and list never glitch or oscillate.
 */
export function subscribeToLiveActivity(
  callback: (data: ActivityDashboardData) => void
): () => void {
  // 1. Initial load
  fetchUserActivityDashboard().then(callback).catch(() => {});

  // 2. Real-time Firestore onSnapshot listeners
  let unsubscribeUsers: (() => void) | null = null;
  let unsubscribeEvents: (() => void) | null = null;

  try {
    unsubscribeUsers = onSnapshot(collection(db, 'user_activity'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreUsers = snapshot.docs.map((d) => d.data() as UserActivityProfile);
        mergeIntoUnifiedUserMap(firestoreUsers);
        callback(buildUnifiedDashboard());
      }
    }, (err) => {
      if (err?.code !== 'unavailable' && err?.code !== 'permission-denied') {
        console.warn('Firestore user_activity listener notice:', err);
      }
    });

    const eventsQuery = query(collection(db, 'activity_events'), orderBy('timestamp', 'desc'), limit(100));
    unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreEvents = snapshot.docs.map((d) => d.data() as ActivityEvent);
        mergeIntoUnifiedEventMap(firestoreEvents);
        callback(buildUnifiedDashboard());
      }
    }, (err) => {
      if (err?.code !== 'unavailable' && err?.code !== 'permission-denied') {
        console.warn('Firestore activity_events listener notice:', err);
      }
    });
  } catch (err: any) {
    if (err?.code !== 'unavailable' && err?.code !== 'permission-denied') {
      console.warn('Could not set up Firestore onSnapshot listener:', err);
    }
  }

  // 3. Fallback interval polling every 5 seconds that merges server data without dropping any users
  const pollInterval = setInterval(() => {
    fetchUserActivityDashboard().then(callback).catch(() => {});
  }, 5000);

  // 4. Local reactive event listener & multi-tab channel
  const handleLocalUpdate = () => {
    callback(buildUnifiedDashboard());
  };
  window.addEventListener('tba_user_activity_updated', handleLocalUpdate);

  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('tba_activity_channel');
      channel.onmessage = () => {
        fetchUserActivityDashboard().then(callback).catch(() => {});
      };
    }
  } catch (_) {}

  return () => {
    if (unsubscribeUsers) unsubscribeUsers();
    if (unsubscribeEvents) unsubscribeEvents();
    clearInterval(pollInterval);
    window.removeEventListener('tba_user_activity_updated', handleLocalUpdate);
    if (channel) {
      try {
        channel.close();
      } catch (_) {}
    }
  };
}

/**
 * Deletes a user profile from the activity directory across Server, Firestore, and Local Cache
 */
export async function deleteUserActivityProfile(userKeyOrEmail: string): Promise<boolean> {
  const normalizedKey = normalizeKey(userKeyOrEmail);
  if (!normalizedKey) return false;

  // 1. Remove from unified in-memory registry
  unifiedUserMap.delete(normalizedKey);
  for (const [key, u] of unifiedUserMap.entries()) {
    if (u.id === userKeyOrEmail || normalizeKey(u.email) === normalizedKey) {
      unifiedUserMap.delete(key);
    }
  }

  // 2. Delete on Server
  try {
    await fetch(`/api/activity/user?user=${encodeURIComponent(normalizedKey)}`, {
      method: 'DELETE'
    });
  } catch (_) {}

  // 3. Delete on Firestore
  try {
    const docId = normalizedKey.replace(/[^a-zA-Z0-9_-]/g, '_');
    await deleteDoc(doc(db, 'user_activity', docId));
  } catch (_) {}

  // 4. Update localStorage cache & broadcast
  buildUnifiedDashboard();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tba_user_activity_updated'));
  }
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('tba_activity_channel');
      bc.postMessage({ type: 'activity_updated', timestamp: new Date().toISOString() });
      bc.close();
    }
  } catch (_) {}

  return true;
}
