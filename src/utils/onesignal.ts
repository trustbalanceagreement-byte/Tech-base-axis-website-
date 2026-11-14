// OneSignal Web SDK v16 Helper Utility
// App ID: f9cfc686-a78c-445f-a436-8b6bb2e6bdff

export const ONESIGNAL_APP_ID = 'f9cfc686-a78c-445f-a436-8b6bb2e6bdff';

export interface OneSignalUserInterface {
  addTag: (key: string, value: string) => Promise<void>;
  addTags: (tags: Record<string, string>) => Promise<void>;
  removeTag: (key: string) => Promise<void>;
  removeTags: (keys: string[]) => Promise<void>;
  PushSubscription?: {
    id?: string;
    token?: string;
    optedIn?: boolean;
    addEventListener?: (event: string, listener: (...args: any[]) => void) => void;
    removeEventListener?: (event: string, listener: (...args: any[]) => void) => void;
    [key: string]: any;
  };
  pushSubscription?: any;
  [key: string]: any;
}

export interface OneSignalNotificationsInterface {
  permission: boolean;
  permissionNative: NotificationPermission;
  requestPermission: () => Promise<void>;
  addEventListener: (event: string, listener: (...args: any[]) => void) => void;
  removeEventListener: (event: string, listener: (...args: any[]) => void) => void;
}

export interface OneSignalSlidedownInterface {
  promptPush: (options?: any) => Promise<void>;
}

export interface OneSignalInstance {
  init: (options: Record<string, any>) => Promise<void>;
  login: (externalId: string) => Promise<void>;
  logout: () => Promise<void>;
  Notifications: OneSignalNotificationsInterface;
  User: OneSignalUserInterface;
  Slidedown?: OneSignalSlidedownInterface;
  [key: string]: any;
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalInstance) => void | Promise<void>>;
    OneSignal?: OneSignalInstance;
    __oneSignalInitialized?: boolean;
    __oneSignalInitPromise?: Promise<boolean>;
  }
}

/**
 * Resolves with the initialized OneSignal instance, or null if OneSignal is
 * disabled/unavailable on the current origin (e.g. preview domains).
 */
export const getReadyOneSignal = async (): Promise<OneSignalInstance | null> => {
  if (typeof window === 'undefined') return null;

  if (window.__oneSignalInitPromise) {
    try {
      const initialized = await window.__oneSignalInitPromise;
      if (!initialized || !window.__oneSignalInitialized || !window.OneSignal) {
        return null;
      }
      return window.OneSignal;
    } catch {
      return null;
    }
  }

  if (window.__oneSignalInitialized && window.OneSignal) {
    return window.OneSignal;
  }

  return null;
};

/**
 * Executes a callback only when OneSignal has initialized successfully.
 */
export const runWithOneSignal = (callback: (OneSignal: OneSignalInstance) => void | Promise<void>): void => {
  if (typeof window === 'undefined') return;

  getReadyOneSignal()
    .then(async (OneSignal) => {
      if (!OneSignal) return;
      try {
        await callback(OneSignal);
      } catch (err: any) {
        console.warn('[OneSignal] Execution notice:', err?.message || err);
      }
    })
    .catch(() => {});
};

/**
 * Prompts the user to grant push notification permissions.
 */
export const requestPushPermission = async (): Promise<boolean> => {
  const OneSignal = await getReadyOneSignal();
  if (!OneSignal) return false;

  try {
    if (OneSignal.Notifications?.requestPermission) {
      await OneSignal.Notifications.requestPermission();
      return Boolean(OneSignal.Notifications.permission);
    }
    return false;
  } catch (err: any) {
    console.warn('[OneSignal] Permission request notice:', err?.message || err);
    return false;
  }
};

/**
 * Associates user's email or identity with OneSignal for targeted push notifications.
 */
export const identifyOneSignalUser = (userId: string, tags?: Record<string, string>): void => {
  runWithOneSignal(async (OneSignal) => {
    try {
      if (OneSignal.login) {
        await OneSignal.login(userId);
      }
      if (tags && OneSignal.User?.addTags) {
        await OneSignal.User.addTags(tags);
      }
      // Guarantee clients never hold admin device flags
      if (tags?.role === 'client' && OneSignal.User?.removeTag) {
        await OneSignal.User.removeTag('is_active_admin');
      }

      // If logging in as admin, immediately capture and register device subscription with server
      if (tags?.role === 'admin') {
        const notifyServer = (subId?: string) => {
          if (subId && subId.length > 10) {
            fetch('/api/register-admin-device', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscriptionId: subId })
            }).catch(() => {});
          }
        };

        const currentSubId = OneSignal.User?.PushSubscription?.id;
        if (currentSubId) {
          notifyServer(currentSubId);
        }

        if (OneSignal.User?.PushSubscription?.addEventListener) {
          OneSignal.User.PushSubscription.addEventListener('change', (event: any) => {
            const newId = event?.current?.id || OneSignal.User?.PushSubscription?.id;
            if (newId) notifyServer(newId);
          });
        }
      }
    } catch (err: any) {
      console.warn('[OneSignal] User identification notice:', err?.message || err);
    }
  });
};

/**
 * Registers the active browser/phone directly as an admin device
 */
export const syncAdminDeviceRegistration = (): void => {
  runWithOneSignal(async (OneSignal) => {
    try {
      if (OneSignal.User?.addTag) {
        OneSignal.User.addTag('role', 'admin');
        OneSignal.User.addTag('is_active_admin', 'true');
      }
      const subId = OneSignal.User?.PushSubscription?.id;
      if (subId && subId.length > 10) {
        fetch('/api/register-admin-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionId: subId })
        }).catch(() => {});
      }
      if (OneSignal.User?.PushSubscription?.addEventListener) {
        OneSignal.User.PushSubscription.addEventListener('change', (event: any) => {
          const newId = event?.current?.id || OneSignal.User?.PushSubscription?.id;
          if (newId && newId.length > 10) {
            fetch('/api/register-admin-device', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscriptionId: newId })
            }).catch(() => {});
          }
        });
      }
    } catch (_) {}
  });
};


/**
 * Logs out user from OneSignal session.
 */
export const logoutOneSignalUser = (): void => {
  runWithOneSignal(async (OneSignal) => {
    try {
      // Stop this device from being treated as an admin device after sign-out
      if (OneSignal.User?.removeTags) {
        await OneSignal.User.removeTags(['role', 'is_active_admin']);
      }
      if (OneSignal.logout) {
        await OneSignal.logout();
      }
    } catch (err: any) {
      console.warn('[OneSignal] Logout notice:', err?.message || err);
    }
  });
};
