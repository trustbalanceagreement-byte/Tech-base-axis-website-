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
    __oneSignalReady?: boolean;
    __oneSignalInitPromise?: Promise<boolean>;
  }
}

export const isOneSignalAllowedOrigin = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host === 'www.tbaonline.online' ||
    host === 'tbaonline.online' ||
    host === 'localhost' ||
    host === '127.0.0.1'
  );
};

/**
 * Executes a callback when OneSignal is initialized and ready.
 */
export const runWithOneSignal = (
  callback: (OneSignal: OneSignalInstance) => void | Promise<void>,
  onUnavailable?: () => void
): void => {
  if (typeof window === 'undefined' || !isOneSignalAllowedOrigin()) {
    onUnavailable?.();
    return;
  }

  const executeIfReady = () => {
    const sdk = window.OneSignal;
    if (!window.__oneSignalReady || !sdk || !sdk.User) {
      onUnavailable?.();
      return;
    }
    try {
      const result = callback(sdk);
      if (result && typeof (result as any).catch === 'function') {
        (result as any).catch((err: any) => {
          console.warn('[OneSignal] Callback notice:', err?.message || err);
        });
      }
    } catch (err: any) {
      console.warn('[OneSignal] Execution notice:', err?.message || err);
    }
  };

  if (window.__oneSignalInitPromise) {
    window.__oneSignalInitPromise
      .then((ready) => {
        if (!ready) {
          onUnavailable?.();
          return;
        }
        executeIfReady();
      })
      .catch(() => {
        onUnavailable?.();
      });
    return;
  }

  if (window.OneSignal && window.__oneSignalReady) {
    executeIfReady();
    return;
  }

  onUnavailable?.();
};

/**
 * Prompts the user to grant push notification permissions.
 */
export const requestPushPermission = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    runWithOneSignal(
      async (OneSignal) => {
        try {
          if (OneSignal.Notifications?.requestPermission) {
            await OneSignal.Notifications.requestPermission();
            const granted = OneSignal.Notifications.permission;
            resolve(Boolean(granted));
          } else {
            resolve(false);
          }
        } catch (err: any) {
          console.warn('[OneSignal] Permission request notice:', err?.message || err);
          resolve(false);
        }
      },
      () => resolve(false)
    );
  });
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
 * Returns a concise human-readable label for the current browser/device.
 */
export const getDeviceInfoString = (): string => {
  if (typeof navigator === 'undefined') return 'Unknown Device';
  const ua = navigator.userAgent || '';
  const os = /Android/i.test(ua)
    ? 'Android'
    : /iPhone|iPad|iPod/i.test(ua)
    ? 'iOS'
    : /Windows/i.test(ua)
    ? 'Windows'
    : /Mac OS X|Macintosh/i.test(ua)
    ? 'macOS'
    : /Linux/i.test(ua)
    ? 'Linux'
    : 'Desktop';

  const browser = /Edg\//i.test(ua)
    ? 'Edge'
    : /OPR\//i.test(ua)
    ? 'Opera'
    : /Chrome\//i.test(ua) && !/Edg\//i.test(ua)
    ? 'Chrome'
    : /Safari\//i.test(ua) && !/Chrome\//i.test(ua)
    ? 'Safari'
    : /Firefox\//i.test(ua)
    ? 'Firefox'
    : 'Browser';

  return `${browser} on ${os}`;
};

/**
 * Returns the active OneSignal push subscription ID if available and initialized.
 */
export const getAdminPushSubscriptionId = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !isOneSignalAllowedOrigin()) return null;
  try {
    if (window.__oneSignalInitPromise) {
      const ready = await window.__oneSignalInitPromise;
      if (!ready) return null;
    }
    if (!window.__oneSignalReady || !window.OneSignal?.User) return null;
    return window.OneSignal.User.PushSubscription?.id || null;
  } catch {
    return null;
  }
};

export interface OneSignalClientStatus {
  ready: boolean;
  supported: boolean;
  permission: boolean;
  optedIn: boolean;
  subscriptionId: string | null;
  initError: string | null;
}

/**
 * Returns the current client-side OneSignal readiness and permission status.
 */
export const getOneSignalStatus = async (): Promise<OneSignalClientStatus> => {
  const supported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator;

  if (typeof window === 'undefined' || !isOneSignalAllowedOrigin()) {
    return {
      ready: false,
      supported,
      permission: false,
      optedIn: false,
      subscriptionId: null,
      initError: 'OneSignal Web Push is registered to https://www.tbaonline.online.'
    };
  }

  try {
    if (window.__oneSignalInitPromise) {
      const ok = await window.__oneSignalInitPromise;
      if (!ok) {
        return {
          ready: false,
          supported,
          permission: false,
          optedIn: false,
          subscriptionId: null,
          initError: 'OneSignal did not initialize on this origin.'
        };
      }
    }

    const sdk = window.OneSignal;
    if (!window.__oneSignalReady || !sdk || !sdk.User) {
      return {
        ready: false,
        supported,
        permission: false,
        optedIn: false,
        subscriptionId: null,
        initError: 'OneSignal SDK is not ready yet.'
      };
    }

    const permission = Boolean(sdk.Notifications?.permission);
    const optedIn = sdk.User.PushSubscription?.optedIn !== false && permission;
    const subscriptionId = sdk.User.PushSubscription?.id || null;

    return {
      ready: true,
      supported,
      permission,
      optedIn,
      subscriptionId,
      initError: null
    };
  } catch (err: any) {
    return {
      ready: false,
      supported,
      permission: false,
      optedIn: false,
      subscriptionId: null,
      initError: err?.message || 'Unable to read OneSignal status.'
    };
  }
};

/**
 * Registers the active browser/phone directly as an admin device
 */
export const syncAdminDeviceRegistration = (adminEmail?: string | null): void => {
  runWithOneSignal(async (OneSignal) => {
    try {
      if (OneSignal.User?.addTag) {
        OneSignal.User.addTag('role', 'admin');
        OneSignal.User.addTag('is_active_admin', 'true');
      }
      const sendRegistration = (subId?: string | null) => {
        if (subId && subId.length > 10) {
          fetch('/api/register-admin-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscriptionId: subId,
              ...(adminEmail ? { email: adminEmail } : {}),
              device: getDeviceInfoString()
            })
          }).catch(() => {});
        }
      };

      const subId = OneSignal.User?.PushSubscription?.id;
      sendRegistration(subId);

      if (OneSignal.User?.PushSubscription?.addEventListener) {
        OneSignal.User.PushSubscription.addEventListener('change', (event: any) => {
          const newId = event?.current?.id || OneSignal.User?.PushSubscription?.id;
          sendRegistration(newId);
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
