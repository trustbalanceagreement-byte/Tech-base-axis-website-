import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  ArrowLeft,
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Clock,
  KeyRound
} from 'lucide-react';
import { TechBaseAxisLogo } from './TechBaseAxisLogo';
import { useAuth, ADMIN_EMAILS, FOUNDER_CREDENTIALS } from '../context/AuthContext';
import { recordUserActivityEvent } from '../services/userActivityService';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  googleProvider,
  updateProfile,
  sendPasswordResetEmail
} from '../lib/firebase';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'create';
  onLoginSuccess?: (isAdmin: boolean) => void;
}

// Security: Max 3 failed attempts per device, locked for exactly 24 hours
const PORTAL_MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in ms
const DEVICE_STORAGE_KEY = 'tba_device_portal_lockout_v2';

export interface DeviceLockoutState {
  count: number;
  remaining: number;
  isLocked: boolean;
  lockedUntil: number | null;
}

// Helper to retrieve device-specific lockout state from this phone/device's localStorage
const getDeviceLockoutState = (): DeviceLockoutState => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(DEVICE_STORAGE_KEY) : null;
    if (!raw) {
      return { count: 0, remaining: PORTAL_MAX_ATTEMPTS, isLocked: false, lockedUntil: null };
    }
    const data = JSON.parse(raw);
    const now = Date.now();

    // 1. If currently locked, check if 24 hours have elapsed
    if (data.lockedUntil) {
      if (now >= Number(data.lockedUntil)) {
        // 24 hours have passed! Automatically unlock this device
        localStorage.removeItem(DEVICE_STORAGE_KEY);
        return { count: 0, remaining: PORTAL_MAX_ATTEMPTS, isLocked: false, lockedUntil: null };
      }
      // Still within the 24-hour lockout window
      return {
        count: PORTAL_MAX_ATTEMPTS,
        remaining: 0,
        isLocked: true,
        lockedUntil: Number(data.lockedUntil)
      };
    }

    // 2. If attempts were recorded over 24h ago without locking, reset daily quota
    if (data.lastAttemptAt && now - Number(data.lastAttemptAt) > LOCKOUT_DURATION_MS) {
      localStorage.removeItem(DEVICE_STORAGE_KEY);
      return { count: 0, remaining: PORTAL_MAX_ATTEMPTS, isLocked: false, lockedUntil: null };
    }

    const count = Math.min(PORTAL_MAX_ATTEMPTS, Math.max(0, Number(data.count) || 0));
    const isLocked = count >= PORTAL_MAX_ATTEMPTS;
    const lockedUntil = isLocked ? (Number(data.lockedUntil) || (now + LOCKOUT_DURATION_MS)) : null;

    if (isLocked && !data.lockedUntil) {
      localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify({
        count: PORTAL_MAX_ATTEMPTS,
        lockedUntil,
        lastAttemptAt: now
      }));
    }

    return {
      count,
      remaining: Math.max(0, PORTAL_MAX_ATTEMPTS - count),
      isLocked,
      lockedUntil
    };
  } catch {
    return { count: 0, remaining: PORTAL_MAX_ATTEMPTS, isLocked: false, lockedUntil: null };
  }
};

// Record a failed attempt for this device
const recordDeviceFailure = (): DeviceLockoutState => {
  const current = getDeviceLockoutState();
  const now = Date.now();
  const newCount = current.count + 1;
  const isLocked = newCount >= PORTAL_MAX_ATTEMPTS;
  const lockedUntil = isLocked ? (now + LOCKOUT_DURATION_MS) : null;

  const nextState: DeviceLockoutState = {
    count: Math.min(PORTAL_MAX_ATTEMPTS, newCount),
    remaining: Math.max(0, PORTAL_MAX_ATTEMPTS - newCount),
    isLocked,
    lockedUntil
  };

  try {
    localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify({
      count: nextState.count,
      lockedUntil: nextState.lockedUntil,
      lastAttemptAt: now
    }));
  } catch (err) {
    console.error('Failed to save device lockout state:', err);
  }

  return nextState;
};

// Reset failures on this device on successful sign-in
const clearDeviceLockout = () => {
  try {
    localStorage.removeItem(DEVICE_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear device lockout:', err);
  }
};

// Format remaining countdown time into HH:MM:SS
const formatCountdown = (lockedUntil: number | null): string => {
  if (!lockedUntil) return '00:00:00';
  const diff = Math.max(0, lockedUntil - Date.now());
  if (diff <= 0) return '00:00:00';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  onLoginSuccess
}) => {
  const { setCustomAdminUser } = useAuth();
  const [tab, setTab] = useState<'login' | 'create' | 'forgot'>(defaultTab);

  // Form fields - zero pre-filled text or placeholders
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Forgot Password specific state
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Device-specific lockout state
  const [attemptState, setAttemptState] = useState<DeviceLockoutState>(getDeviceLockoutState);
  const [countdownText, setCountdownText] = useState<string>('');

  // States
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [warningKey, setWarningKey] = useState<number>(0);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Live 24-hour countdown ticker & automatic unlock when 24h expires
  useEffect(() => {
    if (!attemptState.isLocked || !attemptState.lockedUntil) {
      setCountdownText('');
      return;
    }

    const checkLockStatus = () => {
      const now = Date.now();
      if (now >= (attemptState.lockedUntil || 0)) {
        // 24 HOURS HAVE PASSED! Automatically unlock this device
        clearDeviceLockout();
        const unlockedState = getDeviceLockoutState();
        setAttemptState(unlockedState);
        setWarningMessage(null);
        setCountdownText('');
      } else {
        setCountdownText(formatCountdown(attemptState.lockedUntil));
      }
    };

    checkLockStatus();
    const timer = setInterval(checkLockStatus, 1000);
    return () => clearInterval(timer);
  }, [attemptState.isLocked, attemptState.lockedUntil]);

  // Sync / refresh state whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      const current = getDeviceLockoutState();
      setAttemptState(current);
      setTab(defaultTab);
      if (current.isLocked) {
        setWarningMessage('Account locked');
      } else {
        setWarningMessage(null);
      }
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setResetEmail('');
      setResetSent(false);
      setResetError(null);
      setError(null);
      setWarningMessage(null);
      setInfoMessage(null);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    // If this device is locked for 24 hours, disallow login
    if (tab === 'login') {
      const current = getDeviceLockoutState();
      setAttemptState(current);
      if (current.isLocked) {
        setWarningMessage('Account locked');
        setWarningKey((k) => k + 1);
        return;
      }
    }

    const emailTrim = email.trim().toLowerCase();
    const pass = password;

    if (!emailTrim || !pass) {
      if (tab === 'login') {
        setWarningMessage('Please enter email and password');
        setWarningKey((k) => k + 1);
      } else {
        setError('Please fill in all fields.');
      }
      return;
    }

    setLoading(true);

    try {
      if (tab === 'login') {
        // Check for founder direct credentials
        const isFounderEmail = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === emailTrim);
        const isFounderPassword = 
          pass === FOUNDER_CREDENTIALS.password || 
          pass === 'TBA_tech base aixe' || 
          pass.trim() === 'TBA_tech base aixe';

        if (isFounderEmail && isFounderPassword) {
          clearDeviceLockout();
          setAttemptState(getDeviceLockoutState());

          setCustomAdminUser({
            uid: 'tba-founder-verified',
            email: emailTrim,
            displayName: 'Bikram Ghosh',
            photoURL: null,
            emailVerified: true,
            providerData: [{ providerId: 'password' }]
          });

          try {
            localStorage.setItem('tba_admin_console_unlocked', 'true');
          } catch (_) {}

          try {
            await signInWithEmailAndPassword(auth, emailTrim, pass);
          } catch {
            // Ignored, custom admin session already active
          }

          onClose();
          if (onLoginSuccess) onLoginSuccess(true);
          return;
        }

        // Standard Firebase Login (handles clients and registered users)
        try {
          const userCredential = await signInWithEmailAndPassword(auth, emailTrim, pass);
          
          // Successful Login on this device: Reset lockout counter
          clearDeviceLockout();
          setAttemptState(getDeviceLockoutState());

          const isUserAdmin = Boolean(
            userCredential.user.email &&
            ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userCredential.user.email?.toLowerCase())
          );

          if (isUserAdmin) {
            try {
              localStorage.setItem('tba_admin_console_unlocked', 'true');
            } catch (_) {}
          }

          recordUserActivityEvent({
            userId: userCredential.user.uid,
            email: userCredential.user.email || emailTrim,
            name: userCredential.user.displayName || emailTrim.split('@')[0],
            photoURL: userCredential.user.photoURL,
            type: 'login',
            details: `${userCredential.user.displayName || emailTrim} logged in via Email`
          });

          onClose();
          if (onLoginSuccess) onLoginSuccess(isUserAdmin);
        } catch (firebaseErr: any) {
          console.warn('Firebase login attempt failed:', firebaseErr);
          
          // Failed attempt on this device: Deduct 1 attempt from 3-attempt quota
          const nextState = recordDeviceFailure();
          setAttemptState(nextState);

          if (nextState.isLocked) {
            setWarningMessage('Account locked');
          } else {
            setWarningMessage('Wrong password');
          }
          setWarningKey((k) => k + 1);
        }
      } else if (tab === 'create') {
        // Create new account
        if (!name.trim()) {
          setError('Please provide your name.');
          setLoading(false);
          return;
        }

        if (pass.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, emailTrim, pass);
        if (name.trim()) {
          await updateProfile(userCredential.user, { displayName: name.trim() });
        }

        clearDeviceLockout();
        const isUserAdmin = Boolean(
          userCredential.user.email &&
          ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userCredential.user.email?.toLowerCase())
        );

        recordUserActivityEvent({
          userId: userCredential.user.uid,
          email: userCredential.user.email || emailTrim,
          name: name.trim(),
          photoURL: userCredential.user.photoURL,
          type: 'signup',
          details: `${name.trim()} created a new account on Tech Base Axis`
        });

        onClose();
        if (onLoginSuccess) onLoginSuccess(isUserAdmin);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (tab === 'login') {
        const nextState = recordDeviceFailure();
        setAttemptState(nextState);
        setWarningMessage(nextState.isLocked ? 'Account locked' : 'Wrong password');
        setWarningKey((k) => k + 1);
      } else {
        setError(err?.message || 'Account registration could not be completed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // If this device is locked, disallow
    if (attemptState.isLocked) {
      setWarningMessage('Account locked');
      setWarningKey((k) => k + 1);
      return;
    }

    setError(null);
    setWarningMessage(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      clearDeviceLockout();
      setAttemptState(getDeviceLockoutState());

      const isUserAdmin = Boolean(
        userCredential.user.email &&
        ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userCredential.user.email?.toLowerCase())
      );

      const isNewUser = Boolean((userCredential as any)?._tokenResponse?.isNewUser);

      recordUserActivityEvent({
        userId: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: userCredential.user.displayName || 'Google User',
        photoURL: userCredential.user.photoURL,
        type: isNewUser ? 'signup' : 'login',
        details: isNewUser 
          ? `${userCredential.user.displayName || 'User'} created a new account via Google`
          : `${userCredential.user.displayName || 'Google User'} signed in with Google`
      });

      onClose();
      if (onLoginSuccess) onLoginSuccess(isUserAdmin);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Dedicated Forgot Password Submission Handler
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    const targetEmail = (resetEmail || email).trim().toLowerCase();

    if (!targetEmail) {
      setResetError('Please enter your account email address.');
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setResetSent(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err?.code === 'auth/user-not-found') {
        setResetError('No account found with this email. Please check your spelling.');
      } else if (err?.code === 'auth/invalid-email') {
        setResetError('Invalid email format. Please provide a valid address.');
      } else {
        setResetError(err?.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-[420px] max-h-[92dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl bg-[#0e0e12] border border-neutral-800/90 shadow-[0_0_60px_rgba(0,0,0,0.95)] text-neutral-100 overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Ambient Radial Glow with smooth pulse animation */}
          <motion.div 
            animate={{ opacity: [0.12, 0.24, 0.12], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="absolute -top-20 -right-20 w-48 sm:w-60 h-48 sm:h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none" 
          />
          <motion.div 
            animate={{ opacity: [0.18, 0.30, 0.18], scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-20 -left-20 w-48 sm:w-60 h-48 sm:h-60 bg-red-950/35 rounded-full blur-3xl pointer-events-none" 
          />

          {/* Top Header: Brand Logo & Close button (Always pinned at top) */}
          <div className="relative z-10 flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-900 shrink-0">
            <TechBaseAxisLogo size="sm" subtitle="BIKRAM GHOSH" />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 border border-transparent hover:border-neutral-700/60 transition-colors cursor-pointer"
              aria-label="Close portal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>

          {/* Scrollable Inner Body */}
          <div className="relative z-10 overflow-y-auto pr-0.5 sm:pr-1 pt-3 sm:pt-4 space-y-3 sm:space-y-4 [scrollbar-width:thin] [scrollbar-color:rgba(230,30,43,0.3)_transparent]">
            
            {/* VIEW 1: DEDICATED FORGOT PASSWORD SCREEN */}
            {tab === 'forgot' ? (
              <motion.div
                key="forgot-password-screen"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Back to Sign In button */}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setResetSent(false);
                    setResetError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Sign In</span>
                </button>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-red-500 shrink-0" />
                    <span>Forgot Password?</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-neutral-400 font-sans mt-1.5 leading-relaxed">
                    Enter your registered email address and we'll send you a secure link to reset your account password.
                  </p>
                </div>

                {/* Success Confirmation Card */}
                {resetSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/50 text-emerald-200 text-xs font-mono space-y-3 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-emerald-300">Reset Email Dispatched</div>
                      <p className="text-[11px] text-neutral-300 font-sans mt-1 leading-normal">
                        We sent password reset instructions to <span className="font-bold text-white font-mono">{resetEmail || email}</span>. Please check your inbox and spam folder.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTab('login');
                        setResetSent(false);
                        setResetError(null);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs font-bold transition-all border border-neutral-700 cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </motion.div>
                ) : (
                  /* Forgot Password Form */
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
                    {resetError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-start gap-2 shadow-sm"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="flex-1 text-[11px]">{resetError}</div>
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-[11px] sm:text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                        Registered Email
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-red-500 transition-colors pointer-events-none" />
                        <input
                          type="email"
                          required
                          autoFocus
                          value={resetEmail || email}
                          onChange={(e) => {
                            setResetEmail(e.target.value);
                            setEmail(e.target.value);
                            setResetError(null);
                          }}
                          className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl bg-neutral-900/80 border border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600/60 focus:shadow-[0_0_15px_rgba(230,30,43,0.15)] text-xs sm:text-sm text-white outline-none transition-all font-sans"
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={!resetLoading ? { scale: 1.01 } : {}}
                      whileTap={!resetLoading ? { scale: 0.98 } : {}}
                      type="submit"
                      disabled={resetLoading}
                      className="w-full py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase font-mono transition-all flex items-center justify-center gap-2 mt-2 shadow-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-600/30 cursor-pointer active:scale-[0.99]"
                    >
                      {resetLoading ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
                      ) : (
                        <>
                          <span>Send Password Reset Link</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            ) : (
              /* VIEW 2: STANDARD LOGIN & REGISTER SCREENS */
              <>
                {/* Title and Subtitle */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center justify-between">
                    <span>{tab === 'login' ? 'Sign In to Portal' : 'Create Account'}</span>
                    {tab === 'login' && attemptState.isLocked && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-red-950/80 text-red-300 border border-red-700/60 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-red-400" />
                        <span>LOCKED</span>
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-neutral-400 font-sans mt-1 leading-relaxed">
                    Access your saved inquiries, client milestones, and developer resources.
                  </p>
                </div>

                {/* Segmented Switcher: Log In vs Create Account with Smooth Sliding Pill */}
                <div className="relative grid grid-cols-2 p-1 rounded-xl bg-neutral-900/90 border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => { 
                      setTab('login'); 
                      setError(null); 
                      const curr = getDeviceLockoutState();
                      setAttemptState(curr);
                      if (curr.isLocked) {
                        setWarningMessage('Account locked');
                      } else {
                        setWarningMessage(null);
                      }
                    }}
                    className={`relative py-1.5 sm:py-2 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer z-10 ${
                      tab === 'login' ? 'text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tab === 'login' && (
                      <motion.div
                        layoutId="authModalTabPill"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 bg-[#e61e2b] rounded-lg shadow-md -z-10"
                      />
                    )}
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => { 
                      setTab('create'); 
                      setError(null); 
                      setWarningMessage(null); 
                    }}
                    className={`relative py-1.5 sm:py-2 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer z-10 ${
                      tab === 'create' ? 'text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tab === 'create' && (
                      <motion.div
                        layoutId="authModalTabPill"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 bg-[#e61e2b] rounded-lg shadow-md -z-10"
                      />
                    )}
                    Create Account
                  </button>
                </div>

                {/* General Feedback Banners (Only for create tab or info messages) */}
                <AnimatePresence>
                  {tab === 'create' && error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className="p-2.5 sm:p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-start gap-2.5 shadow-sm"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1 text-[11px] sm:text-xs">{error}</div>
                    </motion.div>
                  )}

                  {infoMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className="p-2.5 sm:p-3 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs font-mono flex items-start gap-2.5 shadow-sm"
                    >
                      <div className="flex-1 text-[11px] sm:text-xs">{infoMessage}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Auth Form */}
                <form onSubmit={handleEmailPasswordAuth} className="space-y-3 sm:space-y-3.5">
                  {tab === 'create' && (
                    <div>
                      <label className="block text-[11px] sm:text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative group">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-red-500 transition-colors pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl bg-neutral-900/80 border border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600/60 focus:shadow-[0_0_15px_rgba(230,30,43,0.15)] text-xs sm:text-sm text-white outline-none transition-all font-sans"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] sm:text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-red-500 transition-colors pointer-events-none" />
                      <input
                        type="email"
                        required
                        disabled={tab === 'login' && attemptState.isLocked}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setResetEmail(e.target.value);
                        }}
                        className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl bg-neutral-900/80 border border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600/60 focus:shadow-[0_0_15px_rgba(230,30,43,0.15)] text-xs sm:text-sm text-white outline-none transition-all font-sans disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] sm:text-xs font-mono text-neutral-300 uppercase tracking-wider">
                        Password
                      </label>
                      {tab === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setTab('forgot');
                            setResetEmail(email);
                            setResetSent(false);
                            setResetError(null);
                          }}
                          className="text-[11px] sm:text-xs font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-red-500 transition-colors pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={tab === 'login' && attemptState.isLocked}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl bg-neutral-900/80 border border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600/60 focus:shadow-[0_0_15px_rgba(230,30,43,0.15)] text-xs sm:text-sm text-white outline-none transition-all font-sans disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        disabled={tab === 'login' && attemptState.isLocked}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer p-1 transition-colors disabled:opacity-40"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Warning message with standalone shaking effect (Matches Screenshot 2) */}
                    <AnimatePresence>
                      {tab === 'login' && warningMessage && (
                        <motion.div
                          key={warningKey}
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0, 
                            x: [-7, 7, -6, 6, -3, 3, 0] 
                          }}
                          exit={{ opacity: 0, y: -2 }}
                          transition={{ 
                            x: { duration: 0.4, ease: 'easeInOut' },
                            opacity: { duration: 0.15 }
                          }}
                          className="flex items-center gap-1.5 text-xs font-mono text-red-500 pt-1.5"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>
                            {warningMessage}.{' '}
                            <span className="text-red-400">
                              {attemptState.isLocked 
                                ? '0 attempt left' 
                                : `${attemptState.remaining} ${attemptState.remaining === 1 ? 'attempt' : 'attempts'} left`}
                            </span>
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ACTION AREA: Animated Lock Card when locked, or Normal Submit Button */}
                  {tab === 'login' && attemptState.isLocked ? (
                    /* ADVANCED LOCK ANIMATION & 24-HOUR AUTO-UNLOCK COUNTDOWN */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-red-950/50 via-[#140b0e] to-neutral-900 border border-red-700/60 shadow-[0_0_30px_rgba(230,30,43,0.22)] overflow-hidden mt-2 text-center"
                    >
                      {/* Cybernetic scanning laser line */}
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-red-600/20 to-transparent pointer-events-none"
                      />

                      {/* Lock Animation with Shackle and Expanding Pulse Wave */}
                      <div className="flex flex-col items-center justify-center gap-2 relative z-10">
                        <div className="relative flex items-center justify-center">
                          {/* Expanding pulse radar wave */}
                          <motion.span
                            animate={{ scale: [1, 1.7, 2], opacity: [0.7, 0.25, 0] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
                            className="absolute w-10 h-10 rounded-full bg-red-600/30"
                          />
                          <motion.span
                            animate={{ scale: [1, 1.4, 1.7], opacity: [0.5, 0.2, 0] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut', delay: 0.4 }}
                            className="absolute w-10 h-10 rounded-full bg-red-500/20"
                          />

                          {/* Animated Padlock Badge */}
                          <motion.div
                            animate={{ 
                              scale: [1, 1.08, 1],
                              rotate: [-3, 3, -3]
                            }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                            className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-950 border border-red-500/80 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(230,30,43,0.5)]"
                          >
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                          </motion.div>
                        </div>

                        <div className="text-center">
                          <div className="text-xs sm:text-sm font-mono font-bold text-red-300 tracking-wide uppercase flex items-center justify-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-red-400" />
                            <span>Device Locked • 0 Attempts Left</span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-neutral-400 font-sans mt-0.5 max-w-[300px] mx-auto">
                            Maximum 3 attempts reached on this phone. For security, portal login is locked for 24 hours.
                          </p>
                        </div>

                        {/* Live 24h Countdown Clock */}
                        <div className="mt-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-red-900/50 text-neutral-200">
                          <Clock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                          <span className="text-[11px] font-mono text-neutral-400">Auto Unlocks in:</span>
                          <span className="font-mono text-xs sm:text-sm font-bold text-red-300 tracking-widest">
                            {countdownText || '24:00:00'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* Normal Submit Button with Advanced Physics */
                    <motion.button
                      whileHover={!loading ? { scale: 1.01 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase font-mono transition-all flex items-center justify-center gap-2 mt-2 shadow-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-600/30 cursor-pointer active:scale-[0.99]"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
                      ) : (
                        <>
                          <span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  )}
                </form>

                {/* Divider */}
                <div className="flex items-center my-3 sm:my-4">
                  <div className="flex-1 border-t border-neutral-800" />
                  <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                    Or continue with
                  </span>
                  <div className="flex-1 border-t border-neutral-800" />
                </div>

                {/* Continue with Google */}
                <motion.button
                  whileHover={!loading && !attemptState.isLocked ? { scale: 1.01 } : {}}
                  whileTap={!loading && !attemptState.isLocked ? { scale: 0.98 } : {}}
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading || attemptState.isLocked}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs font-mono font-semibold text-neutral-200 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </motion.button>

                {/* Footer switch prompt */}
                <div className="text-center pt-1 pb-1 text-[11px] sm:text-xs font-mono text-neutral-400">
                  {tab === 'login' ? (
                    <span>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setTab('create'); setError(null); setWarningMessage(null); }}
                        className="text-red-400 hover:text-red-300 font-semibold cursor-pointer ml-1 transition-colors"
                      >
                        Create new account
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setTab('login'); setError(null); }}
                        className="text-red-400 hover:text-red-300 font-semibold cursor-pointer ml-1 transition-colors"
                      >
                        Log In
                      </button>
                    </span>
                  )}
                </div>
              </>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
