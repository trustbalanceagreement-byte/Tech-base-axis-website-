// OneSignal Web SDK v16 Helper Utility
// App ID: f9cfc686-a78c-445f-a436-8b6bb2e6bdff

export const ONESIGNAL_APP_ID = 'f9cfc686-a78c-445f-a436-8b6bb2e6bdff';

export interface OneSignalSubscriptionObject {
  id?: string;
  token?: string;
  optedIn?: boolean;
  optIn?: () => Promise<void>;
  optOut?: () => Promise<void>;
  addEventListener?: (event: string, listener: (...args: any[]) => void) => void;
  removeEventListener?: (event: string, listener: (...args: any[]) => void) => void;
  [key: string]: any;
}

export interface OneSignalUserInterface {
  addTag?: (key: string, value: string) => Promise<void>;
  addTags?: (tags: Record<string, string>) => Promise<void>;
  removeTag?: (key: string) => Promise<void>;
  removeTags?: (keys: string[]) => Promise<void>;
  pushSubscription?: OneSignalSubscriptionObject;
  PushSubscription?: OneSignalSubscriptionObject;
  onesignalId?: string;
  externalId?: string;
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
  }
}

/**
 * Safely resolves the active push subscription object across OneSignal v16 casing variations
 */
export const getPushSubscription = (OneSignal: any): OneSignalSubscriptionObject | null => {
  if (!OneSignal || !OneSignal.User) return null;
  return OneSignal.User.pushSubscription || OneSignal.User.PushSubscription || null;
};

/**
 * Safely retrieves the unique device/subscription identifier from OneSignal SDK
 */
export const getPushSubscriptionId = (OneSignal: any): string | null => {
  if (!OneSignal) return null;
  const sub = getPushSubscription(OneSignal);
  if (sub?.id && typeof sub.id === 'string' && sub.id.trim().length > 5) {
    return sub.id.trim();
  }
  if (sub?.token && typeof sub.token === 'string' && sub.token.trim().length > 5) {
    return sub.token.trim();
  }
  if (OneSignal.User?.onesignalId && typeof OneSignal.User.onesignalId === 'string' && OneSignal.User.onesignalId.trim().length > 5) {
    return OneSignal.User.onesignalId.trim();
  }
  return null;
};

/**
 * Executes a callback when OneSignal is initialized and ready.
 */
export const runWithOneSignal = (callback: (OneSignal: OneSignalInstance) => void | Promise<void>): void => {
  if (typeof window === 'undefined') return;

  if (window.OneSignal) {
    try {
      const result = callback(window.OneSignal);
      if (result && typeof (result as any).catch === 'function') {
        (result as any).catch((err: any) => {
          console.warn('[OneSignal] Callback notice:', err?.message || err);
        });
      }
    } catch (err: any) {
      console.warn('[OneSignal] Execution notice:', err?.message || err);
    }
    return;
  }

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      await callback(OneSignal);
    } catch (err: any) {
      console.warn('[OneSignal] Deferred execution notice:', err?.message || err);
    }
  });
};

/**
 * Prompts the user to grant push notification permissions.
 */
export const requestPushPermission = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    runWithOneSignal(async (OneSignal) => {
      try {
        if (OneSignal.Notifications?.requestPermission) {
          await OneSignal.Notifications.requestPermission();
        } else if (typeof window !== 'undefined' && 'Notification' in window) {
          await Notification.requestPermission();
        }

        const granted = Boolean(
          OneSignal.Notifications?.permission ||
          (typeof Notification !== 'undefined' && Notification.permission === 'granted')
        );

        if (granted) {
          const sub = getPushSubscription(OneSignal);
          if (sub?.optIn && !sub.optedIn) {
            try { await sub.optIn(); } catch (_) {}
          }
          syncAdminDeviceRegistration();
        }

        resolve(granted);
      } catch (err: any) {
        console.warn('[OneSignal] Permission request notice:', err?.message || err);
        resolve(false);
      }
    });
  });
};

/**
 * Associates user's email or identity with OneSignal for targeted push notifications.
 */
export const identifyOneSignalUser = (userId: string, tags?: Record<string, string>): void => {
  const cleanId = (userId || '').trim().toLowerCase();
  if (!cleanId) return;

  runWithOneSignal(async (OneSignal) => {
    try {
      if (OneSignal.login) {
        await OneSignal.login(cleanId);
      }
      if (tags && OneSignal.User?.addTags) {
        await OneSignal.User.addTags(tags);
      } else if (tags && OneSignal.User?.addTag) {
        for (const [k, v] of Object.entries(tags)) {
          await OneSignal.User.addTag(k, v);
        }
      }

      // Guarantee clients never hold admin device flags
      if (tags?.role === 'client' && OneSignal.User?.removeTag) {
        await OneSignal.User.removeTag('is_active_admin');
      }

      // If logging in as admin, immediately capture and register device subscription with server
      if (tags?.role === 'admin') {
        syncAdminDeviceRegistration(cleanId);
      }
    } catch (err: any) {
      console.warn('[OneSignal] User identification notice:', err?.message || err);
    }
  });
};

/**
 * Registers the active browser/phone directly as an admin device
 */
export const syncAdminDeviceRegistration = (adminEmail?: string): void => {
  runWithOneSignal(async (OneSignal) => {
    try {
      const email = (adminEmail || 'techbaseaxis@gmail.com').trim().toLowerCase();

      // 1. Tag OneSignal user with role=admin and is_active_admin=true
      if (OneSignal.User?.addTags) {
        await OneSignal.User.addTags({
          role: 'admin',
          is_active_admin: 'true',
          admin_email: email
        });
      } else if (OneSignal.User?.addTag) {
        await OneSignal.User.addTag('role', 'admin');
        await OneSignal.User.addTag('is_active_admin', 'true');
      }

      // 2. Ensure push subscription is opted in if permission is granted
      const hasPermission = Boolean(
        OneSignal.Notifications?.permission ||
        (typeof Notification !== 'undefined' && Notification.permission === 'granted')
      );
      const sub = getPushSubscription(OneSignal);
      if (hasPermission && sub?.optIn && sub.optedIn === false) {
        try {
          await sub.optIn();
        } catch (_) {}
      }

      // 3. Sender function to register device on server
      const notifyServer = (subId?: string | null) => {
        if (!subId || subId.trim().length < 8) return;
        const cleanSubId = subId.trim();

        try {
          localStorage.setItem('tba_active_admin_sub_id', cleanSubId);
        } catch (_) {}

        fetch('/api/register-admin-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionId: cleanSubId,
            email: email,
            onesignalId: OneSignal.User?.onesignalId || undefined,
            platform: typeof navigator !== 'undefined' ? navigator.userAgent : 'web'
          })
        })
          .then((res) => res.json())
          .then((data) => {
            console.log('[OneSignal] Admin device registration synced to server:', data?.registered || cleanSubId);
          })
          .catch((err) => {
            console.warn('[OneSignal] Registration push notice:', err?.message || err);
          });
      };

      // 4. Register current subscription ID if available immediately
      const initialId = getPushSubscriptionId(OneSignal);
      if (initialId) {
        notifyServer(initialId);
      }

      // 5. Attach event listener on pushSubscription changes (both lowercase and uppercase)
      if (sub?.addEventListener) {
        sub.addEventListener('change', (event: any) => {
          const newId = event?.current?.id || event?.current?.token || getPushSubscriptionId(OneSignal);
          if (newId) notifyServer(newId);
        });
      }

      // 6. Asynchronous retry polling:
      // When page loads or permission is freshly granted, pushSubscription.id takes
      // 500-2500ms to resolve from the service worker. Poll for up to 8 seconds.
      let attempts = 0;
      const pollTimer = setInterval(() => {
        attempts++;
        const resolvedId = getPushSubscriptionId(OneSignal);
        if (resolvedId) {
          notifyServer(resolvedId);
          if (attempts >= 4) {
            clearInterval(pollTimer);
          }
        }
        if (attempts >= 8) {
          clearInterval(pollTimer);
        }
      }, 1000);

    } catch (err: any) {
      console.warn('[OneSignal] syncAdminDeviceRegistration notice:', err?.message || err);
    }
  });
};

/**
 * Helper to inspect the current push permission and subscription status
 */
export const getPushPermissionStatus = async (): Promise<{
  granted: boolean;
  permission: NotificationPermission;
  subscriptionId: string | null;
}> => {
  return new Promise((resolve) => {
    runWithOneSignal((OneSignal) => {
      const permission: NotificationPermission = 
        OneSignal.Notifications?.permissionNative ||
        (typeof Notification !== 'undefined' ? Notification.permission : 'default');
      const granted = Boolean(OneSignal.Notifications?.permission || permission === 'granted');
      const subId = getPushSubscriptionId(OneSignal);
      resolve({ granted, permission, subscriptionId: subId });
    });
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
        await OneSignal.User.removeTags(['role', 'is_active_admin', 'admin_email']);
      }
      if (OneSignal.logout) {
        await OneSignal.logout();
      }
      try {
        localStorage.removeItem('tba_active_admin_sub_id');
      } catch (_) {}
    } catch (err: any) {
      console.warn('[OneSignal] Logout notice:', err?.message || err);
    }
  });
};
