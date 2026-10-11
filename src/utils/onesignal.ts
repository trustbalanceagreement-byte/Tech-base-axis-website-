// OneSignal Web SDK v16 Helper Utility
// App ID: f9cfc686-a78c-445f-a436-8b6bb2e6bdff

export const ONESIGNAL_APP_ID = 'f9cfc686-a78c-445f-a436-8b6bb2e6bdff';

export interface OneSignalUserInterface {
  addTag: (key: string, value: string) => Promise<void>;
  addTags: (tags: Record<string, string>) => Promise<void>;
  removeTag: (key: string) => Promise<void>;
  removeTags: (keys: string[]) => Promise<void>;
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
          const granted = OneSignal.Notifications.permission;
          resolve(Boolean(granted));
        } else {
          resolve(false);
        }
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
    } catch (err: any) {
      console.warn('[OneSignal] User identification notice:', err?.message || err);
    }
  });
};

/**
 * Logs out user from OneSignal session.
 */
export const logoutOneSignalUser = (): void => {
  runWithOneSignal(async (OneSignal) => {
    try {
      if (OneSignal.logout) {
        await OneSignal.logout();
      }
    } catch (err: any) {
      console.warn('[OneSignal] Logout notice:', err?.message || err);
    }
  });
};
