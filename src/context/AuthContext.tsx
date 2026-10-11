import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  type User 
} from '../lib/firebase';

import { getAutoAvatarUrl } from '../utils/avatar';
import { identifyOneSignalUser, logoutOneSignalUser } from '../utils/onesignal';
import { recordUserActivityEvent } from '../services/userActivityService';

export const ADMIN_EMAILS = [
  'techbaseaxis@gmail.com',
  'techbaseaixe@gmail.com',
  'bgho40185@gmail.com'
];

export const FOUNDER_CREDENTIALS = {
  email: 'techbaseaxis@gmail.com',
  password: 'Tba@1234#'
};

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
};

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  providerData: Array<{ providerId: string }>;
}

interface AuthContextType {
  user: AuthUser | User | null;
  isAdmin: boolean;
  loading: boolean;
  setCustomAdminUser: (customUser: AuthUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [customUser, setCustomUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore persistent founder admin session if active
    const savedAdmin = localStorage.getItem('tba_admin_session');
    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        if (parsed?.email && isAdminEmail(parsed.email)) {
          setCustomUser(parsed);
        }
      } catch (err) {
        localStorage.removeItem('tba_admin_session');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const baseUser = customUser || firebaseUser;
  // Automatically populate photoURL with Gmail DP or Founder photo if missing
  const activeUser = baseUser ? {
    ...baseUser,
    photoURL: baseUser.photoURL || getAutoAvatarUrl(baseUser)
  } : null;
  // Strict admin check: ONLY true if the active logged in user's email is an admin email
  const isAdmin = Boolean(activeUser?.email && isAdminEmail(activeUser.email));

  // Sync active user with OneSignal push notification system & Presence tracking
  useEffect(() => {
    if (activeUser?.email) {
      identifyOneSignalUser(activeUser.email, {
        role: isAdmin ? 'admin' : 'client',
        displayName: activeUser.displayName || 'User'
      });

      // Send initial presence login/heartbeat
      recordUserActivityEvent({
        userId: activeUser.uid || activeUser.email,
        email: activeUser.email,
        name: activeUser.displayName || activeUser.email.split('@')[0],
        photoURL: activeUser.photoURL,
        type: 'login'
      });

      // Run ongoing heartbeat every 45 seconds to maintain "Online" status
      const heartbeatInterval = setInterval(() => {
        if (activeUser?.email) {
          recordUserActivityEvent({
            userId: activeUser.uid || activeUser.email,
            email: activeUser.email,
            name: activeUser.displayName || activeUser.email.split('@')[0],
            photoURL: activeUser.photoURL,
            type: 'heartbeat'
          });
        }
      }, 45000);

      // Clean beacon on window close
      const handleBeforeUnload = () => {
        if (activeUser?.email) {
          recordUserActivityEvent({
            userId: activeUser.uid || activeUser.email,
            email: activeUser.email,
            name: activeUser.displayName || activeUser.email.split('@')[0],
            photoURL: activeUser.photoURL,
            type: 'logout'
          });
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        clearInterval(heartbeatInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [activeUser?.email, isAdmin]);

  const setCustomAdminUser = (userToSet: AuthUser | null) => {
    if (userToSet) {
      localStorage.setItem('tba_admin_session', JSON.stringify(userToSet));
      setCustomUser(userToSet);
    } else {
      localStorage.removeItem('tba_admin_session');
      setCustomUser(null);
    }
  };

  const logout = async () => {
    if (activeUser?.email) {
      // Record logout event
      recordUserActivityEvent({
        userId: activeUser.uid || activeUser.email,
        email: activeUser.email,
        name: activeUser.displayName || activeUser.email.split('@')[0],
        photoURL: activeUser.photoURL,
        type: 'logout'
      });
    }

    // Completely wipe all sessions so Admin Panel disappears immediately
    localStorage.removeItem('tba_admin_session');
    localStorage.removeItem('tba_admin_console_unlocked');
    setCustomUser(null);
    setFirebaseUser(null);
    logoutOneSignalUser();
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        isAdmin,
        loading,
        setCustomAdminUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
