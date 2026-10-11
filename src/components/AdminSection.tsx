import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import tabLogo from '../assets/images/tab_logo_hd_transparent.png';
import { ClientInquiry, NavSection, ServicePackage, PackageFeature, Project } from '../types';
import { AdminProjectsManager } from './AdminProjectsManager';
import { AdminActivityManager } from './AdminActivityManager';
import { useAuth, ADMIN_EMAILS, FOUNDER_CREDENTIALS } from '../context/AuthContext';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  googleProvider, 
  auth 
} from '../lib/firebase';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Users, 
  IndianRupee, 
  Clock, 
  CheckCircle, 
  Mail, 
  Filter, 
  Download, 
  Plus, 
  Trash2, 
  Terminal, 
  Eye, 
  EyeOff,
  X, 
  Edit3,
  ExternalLink,
  Activity,
  LogIn,
  LogOut,
  Package,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  CheckCircle2,
  Layers,
  Star,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  FolderGit2,
  Loader2,
  KeyRound,
  ShieldAlert,
  Bell,
  Send,
  Calendar
} from 'lucide-react';
import { requestPushPermission, runWithOneSignal } from '../utils/onesignal';

interface AdminSectionProps {
  inquiries: ClientInquiry[];
  onUpdateInquiryStatus: (id: string, status: ClientInquiry['status'], notes?: string) => void;
  onDeleteInquiry: (id: string) => void;
  onNavigate: (section: NavSection) => void;
  packages: ServicePackage[];
  onUpdatePackagePrice: (id: string, newPrice: number) => void;
  onUpdatePackage: (pkg: ServicePackage) => void;
  onResetPackagesToDefault: () => void;
  onCreatePackage?: (newPkg: ServicePackage) => void;
  onDeletePackage?: (id: string) => void;
  projects?: Project[];
  onUpdateProject?: (project: Project) => void;
  onCreateProject?: (project: Project) => void;
  onDeleteProject?: (id: string) => void;
  onClearAllProjects?: () => void;
}

// 24-Hour Admin Login Attempt Limiter (Max 3 failed attempts, 24-hour automatic lockout)
const DAILY_ATTEMPT_LIMIT = 3;
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const ATTEMPTS_STORAGE_KEY = 'tba_admin_login_daily_attempts';

interface AttemptState {
  count: number;
  lockedUntil: number | null;
  isLocked: boolean;
}

const getDailyAttemptState = (): AttemptState => {
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (!raw) return { count: 0, lockedUntil: null, isLocked: false };
    const parsed = JSON.parse(raw);
    const now = Date.now();

    if (parsed.lockedUntil) {
      if (now >= parsed.lockedUntil) {
        // Automatically unlocked after 24 hours!
        localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
        return { count: 0, lockedUntil: null, isLocked: false };
      }
      return { count: parsed.count || DAILY_ATTEMPT_LIMIT, lockedUntil: parsed.lockedUntil, isLocked: true };
    }

    const count = Number(parsed.count) || 0;
    if (count >= DAILY_ATTEMPT_LIMIT) {
      const lockedUntil = now + LOCK_DURATION_MS;
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify({ count, lockedUntil, isLocked: true }));
      return { count, lockedUntil, isLocked: true };
    }

    return { count, lockedUntil: null, isLocked: false };
  } catch {
    return { count: 0, lockedUntil: null, isLocked: false };
  }
};

const recordDailyFailure = () => {
  const current = getDailyAttemptState();
  const newCount = current.count + 1;
  const isLocked = newCount >= DAILY_ATTEMPT_LIMIT;
  const now = Date.now();
  const lockedUntil = isLocked ? (current.lockedUntil || (now + LOCK_DURATION_MS)) : null;

  localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify({
    count: newCount,
    lockedUntil,
    isLocked
  }));
  return { newCount, remaining: Math.max(0, DAILY_ATTEMPT_LIMIT - newCount), isLocked, lockedUntil };
};

const clearDailyFailures = () => {
  localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
};

const formatRemainingLockTime = (lockedUntil: number | null): string => {
  if (!lockedUntil) return '24 hours';
  const diffMs = lockedUntil - Date.now();
  if (diffMs <= 0) return '0 minutes';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} minutes`;
};

// Format remaining countdown time into live ticking HH:MM:SS
const formatCountdown = (lockedUntil: number | null): string => {
  if (!lockedUntil) return '00:00:00';
  const diff = Math.max(0, lockedUntil - Date.now());
  if (diff <= 0) return '00:00:00';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const AdminSection: React.FC<AdminSectionProps> = ({
  inquiries,
  onUpdateInquiryStatus,
  onDeleteInquiry,
  onNavigate,
  packages,
  onUpdatePackagePrice,
  onUpdatePackage,
  onResetPackagesToDefault,
  onCreatePackage,
  onDeletePackage,
  projects = [],
  onUpdateProject,
  onCreateProject,
  onDeleteProject,
  onResetProjectsToDefault,
  onClearAllProjects
}) => {
  const { user, isAdmin, setCustomAdminUser, logout } = useAuth();

  // Dedicated Admin Login Authentication state - Session gated when navigating to Admin Panel
  const [isConsoleUnlocked, setIsConsoleUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('tba_admin_console_session_unlocked') === 'true';
    }
    return false;
  });
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [attemptState, setAttemptState] = useState(getDailyAttemptState);

  // Dynamic visual effect states: shaking warning animation & real-time countdown ticker
  const [warningKey, setWarningKey] = useState<number>(0);
  const [inputShakeKey, setInputShakeKey] = useState<number>(0);
  const [countdownText, setCountdownText] = useState<string>(() => {
    const initial = getDailyAttemptState();
    return initial.isLocked && initial.lockedUntil ? formatCountdown(initial.lockedUntil) : '';
  });

  // Real-time 1-second interval ticker for live 24-hour countdown & automatic unlock
  useEffect(() => {
    if (!attemptState.isLocked || !attemptState.lockedUntil) {
      setCountdownText('');
      return;
    }

    const checkLockStatus = () => {
      const now = Date.now();
      if (now >= (attemptState.lockedUntil || 0)) {
        // Automatically unlocked after 24 hours!
        clearDailyFailures();
        const unlocked = getDailyAttemptState();
        setAttemptState(unlocked);
        setAuthError(null);
        setCountdownText('');
      } else {
        setCountdownText(formatCountdown(attemptState.lockedUntil));
      }
    };

    checkLockStatus();
    const interval = setInterval(checkLockStatus, 1000);
    return () => clearInterval(interval);
  }, [attemptState.isLocked, attemptState.lockedUntil]);

  // Tab: 'packages' | 'projects' | 'inquiries' | 'activity'
  const [activeAdminTab, setActiveAdminTab] = useState<'packages' | 'projects' | 'inquiries' | 'activity'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('activity')) return 'activity';
      if (hash.includes('inquiries')) return 'inquiries';
      if (hash.includes('projects')) return 'projects';
    }
    return 'packages';
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('activity')) {
        setActiveAdminTab('activity');
      } else if (hash.includes('inquiries')) {
        setActiveAdminTab('inquiries');
      } else if (hash.includes('projects')) {
        setActiveAdminTab('projects');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Inquiries filter & detail modal
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedInquiry, setSelectedInquiry] = useState<ClientInquiry | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');

  // URL Deep Link handler for OneSignal Push Notification Clicks
  useEffect(() => {
    const checkUrlForInquiry = () => {
      try {
        const fullUrl = window.location.href;
        const match = fullUrl.match(/[?&#](?:id|inquiryId|bookingId|quoteId|appointmentId)=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          const foundId = match[1];
          const matchInq = inquiries.find((i) => i.id === foundId || i.id.includes(foundId));
          if (matchInq) {
            setSelectedInquiry(matchInq);
            setEditingNotes(matchInq.notes || '');
            setActiveAdminTab('inquiries');
          }
        }
      } catch (_) {}
    };
    checkUrlForInquiry();
    window.addEventListener('hashchange', checkUrlForInquiry);
    return () => window.removeEventListener('hashchange', checkUrlForInquiry);
  }, [inquiries]);

  // Packages filters & editing state
  const [packageFilter, setPackageFilter] = useState<'all' | 'monthly' | 'milestone'>('all');
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [savedFeedbackId, setSavedFeedbackId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Price & package edit drafts
  const [editedPackages, setEditedPackages] = useState<Record<string, ServicePackage>>({});
  const [newFeatureText, setNewFeatureText] = useState<Record<string, string>>({});

  // New package modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // OneSignal push notifications state
  const [pushPermission, setPushPermission] = useState<boolean>(false);
  const [pushLoading, setPushLoading] = useState<boolean>(false);

  // Automatically register this exact device/phone where Admin Console is open as the active admin device
  const registerCurrentDeviceAsAdmin = (OneSignal: any) => {
    try {
      if (OneSignal.User?.addTag) {
        OneSignal.User.addTag('role', 'admin');
        OneSignal.User.addTag('is_active_admin', 'true');
      }
      const subId = OneSignal.User?.PushSubscription?.id;
      if (subId) {
        fetch('/api/register-admin-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionId: subId })
        }).catch(() => {});
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    runWithOneSignal((OneSignal) => {
      if (OneSignal.Notifications) {
        const isGranted = Boolean(OneSignal.Notifications.permission);
        setPushPermission(isGranted);
        if (isGranted) {
          registerCurrentDeviceAsAdmin(OneSignal);
        }
        if (OneSignal.Notifications.addEventListener) {
          OneSignal.Notifications.addEventListener('permissionChange', (granted: boolean) => {
            setPushPermission(Boolean(granted));
            if (granted) {
              registerCurrentDeviceAsAdmin(OneSignal);
            }
          });
        }
      }
      registerCurrentDeviceAsAdmin(OneSignal);
    });
  }, []);

  const handleEnablePush = async () => {
    setPushLoading(true);
    try {
      const granted = await requestPushPermission();
      setPushPermission(granted);
      if (granted) {
        runWithOneSignal((OneSignal) => {
          registerCurrentDeviceAsAdmin(OneSignal);
        });
        triggerToast('Push notifications enabled for this admin device!');
      } else {
        triggerToast('Notification permission dismissed or denied.');
      }
    } finally {
      setPushLoading(false);
    }
  };

  const [newPkgForm, setNewPkgForm] = useState({
    name: '',
    badge: 'New Tier',
    theme: 'blue' as 'green' | 'blue' | 'amber' | 'red',
    price: 99,
    period: '/month',
    cycle: 'monthly' as 'monthly' | 'milestone',
    popular: false,
    description: '',
    turnaround: 'Instant Setup',
    idealFor: 'Startups & modern companies',
    featuresText: 'Unlimited projects\nCustom dashboard\nDedicated support'
  });

  // Authorized only when Admin Console credentials have been authenticated
  const isAuthorized = isConsoleUnlocked;

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    // 0. Enforce 24-hour lockout limit (Max 3 failed attempts)
    const currentLimits = getDailyAttemptState();
    if (currentLimits.isLocked) {
      setAttemptState(currentLimits);
      if (currentLimits.lockedUntil) {
        setCountdownText(formatCountdown(currentLimits.lockedUntil));
      }
      setWarningKey(prev => prev + 1);
      setInputShakeKey(prev => prev + 1);
      setAuthError(`Security Lockout: Admin portal is locked for 24 hours due to 3 incorrect attempts. Automatically unlocks in ${formatRemainingLockTime(currentLimits.lockedUntil)}.`);
      return;
    }

    const emailTrim = loginEmail.trim().toLowerCase();
    const pass = loginPassword;

    if (!emailTrim || !pass) {
      setAuthError('Please enter both admin email and password.');
      setInputShakeKey(prev => prev + 1);
      return;
    }

    setAuthLoading(true);

    try {
      // 1. Direct validation against founder credentials:
      // Email: techbaseaxis@gmail.com
      // Password: I @m The TB@ Founder
      const isValidAdminEmail = 
        emailTrim === 'techbaseaxis@gmail.com' ||
        emailTrim === 'techbaseaixe@gmail.com' ||
        emailTrim === 'bgho40185@gmail.com';

      const isValidPassword = 
        pass === 'I @m The TB@ Founder' ||
        pass.trim() === 'I @m The TB@ Founder' ||
        pass === 'TBA_tech base aixe' ||
        pass.trim() === 'TBA_tech base aixe' ||
        pass === 'Tba@1234#';

      if (isValidAdminEmail && isValidPassword) {
        // Successful login: Reset daily failure counter
        clearDailyFailures();
        setAttemptState(getDailyAttemptState());
        setCountdownText('');

        try {
          await signInWithEmailAndPassword(auth, emailTrim, pass);
        } catch {
          // Continue with verified custom admin session
        }

        setCustomAdminUser({
          uid: 'tba-founder-verified',
          email: emailTrim,
          displayName: 'Bikram Ghosh (Founder)',
          photoURL: null,
          emailVerified: true,
          providerData: [{ providerId: 'password' }]
        });

        setIsConsoleUnlocked(true);
        try {
          sessionStorage.setItem('tba_admin_console_session_unlocked', 'true');
        } catch (_) {}
        setAuthSuccess('Founder Identity Verified! Access Granted.');
        triggerToast('Welcome back, Founder Bikram Ghosh.');
        setAuthLoading(false);
        return;
      }

      // 2. Real Firebase Auth fallback if already set up
      try {
        const cred = await signInWithEmailAndPassword(auth, emailTrim, pass);
        const authenticatedEmail = cred.user?.email?.toLowerCase();

        if (authenticatedEmail && ADMIN_EMAILS.some(a => a.toLowerCase() === authenticatedEmail)) {
          clearDailyFailures();
          setAttemptState(getDailyAttemptState());
          setCountdownText('');
          setIsConsoleUnlocked(true);
          try {
            sessionStorage.setItem('tba_admin_console_session_unlocked', 'true');
          } catch (_) {}
          setAuthSuccess('Administrator authenticated! Unlocking Console...');
          triggerToast('Admin console unlocked successfully.');
          setAuthLoading(false);
          return;
        }
      } catch {
        // Firebase attempt failed
      }

      // 3. Failed Attempt handling: Deduct 1 attempt from daily quota (3 per 24 hours)
      const { remaining, isLocked, lockedUntil } = recordDailyFailure();
      setAttemptState(getDailyAttemptState());
      setWarningKey(prev => prev + 1);
      setInputShakeKey(prev => prev + 1);
      if (isLocked && lockedUntil) {
        setCountdownText(formatCountdown(lockedUntil));
      }

      if (isLocked) {
        setAuthError(`Security Alert: Maximum 3 failed attempts reached! Admin portal has been locked for 24 hours. Automatically unlocks in ${formatRemainingLockTime(lockedUntil)}.`);
      } else if (remaining === 2) {
        setAuthError('Wrong password! You have 2 attempt left.');
      } else if (remaining === 1) {
        setAuthError('Wrong password! You have 1 attempt left.');
      } else {
        setAuthError(`Incorrect credentials! You have ${remaining} attempt left.`);
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      const { remaining, isLocked, lockedUntil } = recordDailyFailure();
      setAttemptState(getDailyAttemptState());
      setWarningKey(prev => prev + 1);
      setInputShakeKey(prev => prev + 1);
      if (isLocked && lockedUntil) {
        setCountdownText(formatCountdown(lockedUntil));
      }
      if (isLocked) {
        setAuthError(`Security Alert: Maximum 3 failed attempts reached! Admin portal has been locked for 24 hours. Automatically unlocks in ${formatRemainingLockTime(lockedUntil)}.`);
      } else if (remaining === 2) {
        setAuthError('Wrong password! You have 2 attempt left.');
      } else if (remaining === 1) {
        setAuthError('Wrong password! You have 1 attempt left.');
      } else {
        setAuthError(`Incorrect credentials! You have ${remaining} attempt left.`);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLockConsole = () => {
    try {
      sessionStorage.removeItem('tba_admin_console_session_unlocked');
    } catch (_) {}
    setIsConsoleUnlocked(false);
    triggerToast('Admin Console locked.');
    onNavigate('home');
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (filterStatus === 'All') return true;
    return inq.status === filterStatus;
  });

  // Calculate KPIs
  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter(i => i.status === 'New').length;
  const activeProposals = inquiries.filter(i => i.status === 'Proposal Sent' || i.status === 'In Development').length;
  
  // Pipeline estimate calculation
  const pipelineValue = inquiries.reduce((acc, curr) => {
    if (curr.budgetRange.includes('25,000+')) return acc + 30000;
    if (curr.budgetRange.includes('10,000')) return acc + 15000;
    if (curr.budgetRange.includes('3,000')) return acc + 5000;
    return acc + 2500;
  }, 0);

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inquiries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tech_base_axis_leads_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper to show a floating notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Get current package draft or prop value
  const getPackageData = (pkg: ServicePackage): ServicePackage => {
    return editedPackages[pkg.id] || pkg;
  };

  // Handle draft field change
  const handleFieldChange = (id: string, field: keyof ServicePackage, value: any) => {
    const current = getPackageData(packages.find(p => p.id === id) || ({} as ServicePackage));
    setEditedPackages(prev => ({
      ...prev,
      [id]: {
        ...current,
        [field]: value
      }
    }));
  };

  // Handle Quick Price Tweak (+/- buttons)
  const handleQuickPriceAdjust = (pkg: ServicePackage, delta: number) => {
    const current = getPackageData(pkg);
    const newPrice = Math.max(0, (current.price || 0) + delta);
    handleFieldChange(pkg.id, 'price', newPrice);
  };

  // Save changes for a package
  const handleSavePackage = (pkg: ServicePackage) => {
    const toSave = getPackageData(pkg);
    onUpdatePackage(toSave);
    setSavedFeedbackId(pkg.id);
    triggerToast(`Package "${toSave.name}" price set to ₹${toSave.price.toLocaleString('en-IN')}${toSave.period || ''}! Live on website.`);
    setTimeout(() => {
      setSavedFeedbackId((curr) => (curr === pkg.id ? null : curr));
    }, 2500);
  };

  // Toggle feature inclusion in draft
  const handleToggleFeatureIncluded = (pkgId: string, featureIndex: number) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return;
    const current = getPackageData(pkg);
    const updatedFeatures = (current.features || []).map((f, idx) => {
      if (idx !== featureIndex) return f;
      if (typeof f === 'string') {
        return { text: f, included: false };
      }
      return { ...f, included: !f.included };
    });
    handleFieldChange(pkgId, 'features', updatedFeatures);
  };

  // Add new feature to package
  const handleAddFeature = (pkgId: string) => {
    const text = newFeatureText[pkgId]?.trim();
    if (!text) return;
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return;
    const current = getPackageData(pkg);
    const updatedFeatures = [...(current.features || []), { text, included: true }];
    handleFieldChange(pkgId, 'features', updatedFeatures);
    setNewFeatureText(prev => ({ ...prev, [pkgId]: '' }));
  };

  // Remove feature from package
  const handleRemoveFeature = (pkgId: string, featureIndex: number) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return;
    const current = getPackageData(pkg);
    const updatedFeatures = (current.features || []).filter((_, idx) => idx !== featureIndex);
    handleFieldChange(pkgId, 'features', updatedFeatures);
  };

  // Handle create new package
  const handleCreateNewPackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgForm.name.trim()) return;

    const featuresList: PackageFeature[] = newPkgForm.featuresText
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean)
      .map(text => ({ text, included: true }));

    const newPackage: ServicePackage = {
      id: `pkg-custom-${Date.now().toString().slice(-5)}`,
      name: newPkgForm.name.trim(),
      badge: newPkgForm.badge.trim() || 'Special',
      theme: newPkgForm.theme,
      price: Number(newPkgForm.price) || 0,
      period: newPkgForm.period || (newPkgForm.cycle === 'monthly' ? '/month' : '/project'),
      cycle: newPkgForm.cycle,
      popular: newPkgForm.popular,
      description: newPkgForm.description.trim() || 'Custom architecture and engineering scope.',
      turnaround: newPkgForm.turnaround.trim() || 'Flexible Sprint',
      idealFor: newPkgForm.idealFor.trim() || 'Businesses seeking tailored velocity',
      features: featuresList,
      deliverables: ['Full Source Code Repository', 'Architecture Walkthrough & Handoff'],
      techStack: ['React 19', 'TypeScript', 'Tailwind CSS']
    };

    if (onCreatePackage) {
      onCreatePackage(newPackage);
    }
    setIsCreateModalOpen(false);
    triggerToast(`New package "${newPackage.name}" created at ₹${newPackage.price.toLocaleString('en-IN')}! Live on website.`);
  };

  // Filtered packages
  const filteredPackages = packages.filter((pkg) => {
    if (packageFilter === 'all') return true;
    if (packageFilter === 'monthly') {
      return pkg.cycle === 'monthly' || pkg.period?.includes('month') || pkg.id.includes('monthly');
    }
    if (packageFilter === 'milestone') {
      return pkg.cycle === 'milestone' || (!pkg.period?.includes('month') && !pkg.id.includes('monthly'));
    }
    return true;
  });

  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md p-6 sm:p-8 rounded-2xl obsidian-card border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-xl text-neutral-100"
        >
          {/* Subtle Ambient Radial Glowing Lights with Breathing Motion */}
          <motion.div 
            animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.15, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 -right-24 w-60 h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none" 
          />
          <motion.div 
            animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-24 -left-24 w-60 h-60 bg-red-950/30 rounded-full blur-3xl pointer-events-none" 
          />

          {/* Company Brand Logo Header - Centered & Enlarged */}
          <div className="relative z-10 flex flex-col items-center justify-center mx-auto mb-6">
            <motion.div 
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative flex items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-neutral-900/95 border border-neutral-800/90 shadow-[0_0_45px_rgba(230,30,43,0.35)] group"
            >
              <img
                src={tabLogo}
                alt="Tech Base Axis - Web Development Company Kolkata Official Logo"
                className="h-28 xs:h-32 sm:h-36 md:h-40 w-auto max-w-[260px] sm:max-w-[320px] object-contain filter drop-shadow-[0_6px_24px_rgba(255,255,255,0.25)] group-hover:brightness-110 transition-all duration-300"
              />
              <span className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-sm pointer-events-none" />
            </motion.div>
            <div className="mt-3.5 flex items-center gap-2 font-bold tracking-wider text-white text-base sm:text-lg">
              <span>TECH BASE</span>
              <span className="text-[#e61e2b] font-extrabold">AXIS</span>
            </div>
          </div>

          <div className="relative z-10 text-center mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Admin Console Login
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Restricted to Founder &amp; Administrator Bikram Ghosh
            </p>
          </div>

          {/* CYBERNETIC HOLOGRAM LOCK SCREEN EFFECT (Active when 3 attempts exceeded) */}
          {attemptState.isLocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-950/70 via-[#140b0e] to-neutral-900 border border-red-700/80 shadow-[0_0_35px_rgba(230,30,43,0.35)] overflow-hidden text-center mb-5"
            >
              {/* Cybernetic Scanning Laser Beam traversing top to bottom */}
              <motion.div
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ff0033]"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
              />

              {/* Horizontal Neon Scan Streak */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: 'linear' }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-red-600/15 to-transparent pointer-events-none"
              />

              {/* Lock Animation with Shackle, Expanding Radar Waves & Pulse Effect */}
              <div className="flex flex-col items-center justify-center gap-2 relative z-10">
                <div className="relative flex items-center justify-center mb-1">
                  {/* Expanding Pulse Radar Waves */}
                  <motion.span
                    animate={{ scale: [1, 1.8, 2.3], opacity: [0.75, 0.25, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
                    className="absolute w-12 h-12 rounded-full bg-red-600/30 pointer-events-none"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.4, 1.9], opacity: [0.55, 0.2, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut', delay: 0.4 }}
                    className="absolute w-12 h-12 rounded-full bg-red-500/20 pointer-events-none"
                  />

                  {/* Tilting & Glowing 3D Padlock Badge */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.08, 1],
                      rotate: [-4, 4, -4]
                    }}
                    transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                    className="relative z-10 w-11 h-11 rounded-2xl bg-red-950 border border-red-500/90 flex items-center justify-center text-red-400 shadow-[0_0_25px_rgba(230,30,43,0.6)]"
                  >
                    <Lock className="w-5 h-5 text-red-400" />
                  </motion.div>
                </div>

                <div className="text-center">
                  <div className="text-xs sm:text-sm font-mono font-bold text-red-300 tracking-wide uppercase flex items-center justify-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-red-400" />
                    <span>Admin Portal Locked • 0 Attempts Left</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 font-mono mt-1 max-w-[320px] mx-auto">
                    Maximum 3 failed attempts reached. For security, admin portal login is locked for 24 hours.
                  </p>
                </div>

                {/* Live 24-Hour Countdown Clock Box */}
                <div className="mt-2 flex items-center justify-center gap-2.5 px-4 py-2 rounded-xl bg-black/75 border border-red-900/60 text-neutral-200 shadow-inner">
                  <Clock className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-xs font-mono text-neutral-400">Auto Unlocks in:</span>
                  <span className="font-mono text-sm sm:text-base font-bold text-red-300 tracking-widest">
                    {countdownText || '24:00:00'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* DYNAMIC SHAKING WARNING BANNER (When Wrong Password Entered) */}
          <AnimatePresence mode="wait">
            {attemptState.count > 0 && !attemptState.isLocked && (
              <motion.div
                key={warningKey}
                initial={{ opacity: 0, y: -4 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  x: [-8, 8, -6, 6, -3, 3, 0] 
                }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ 
                  x: { duration: 0.45, ease: 'easeInOut' },
                  opacity: { duration: 0.15 }
                }}
                className="relative z-10 mb-4 p-3 rounded-xl bg-red-950/80 border border-red-700/80 text-red-300 text-xs font-mono flex items-center gap-2.5 shadow-lg shadow-red-950/60"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <div className="flex-1 leading-snug">
                  Wrong password! <span className="font-bold text-white underline decoration-red-400 underline-offset-2">You have {Math.max(0, DAILY_ATTEMPT_LIMIT - attemptState.count)} attempt left</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* General Feedback Banners */}
          {authError && !attemptState.isLocked && attemptState.count === 0 && (
            <div className="relative z-10 mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{authError}</div>
            </div>
          )}

          {authSuccess && (
            <div className="relative z-10 mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs font-mono flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1">{authSuccess}</div>
            </div>
          )}

          {/* ADMIN EMAIL & ACCESS KEY / PASSWORD FORM */}
          <form onSubmit={handleEmailPasswordLogin} className="relative z-10 space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  disabled={authLoading || attemptState.isLocked}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                Access Key / Password
              </label>
              {/* Dynamic Shaking Input Container on Invalid Submission */}
              <motion.div 
                key={inputShakeKey}
                animate={inputShakeKey > 0 ? { x: [-7, 7, -5, 5, -2, 2, 0] } : {}}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="relative"
              >
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={authLoading || attemptState.isLocked}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={attemptState.isLocked}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1 cursor-pointer disabled:opacity-40"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </motion.div>
            </div>

            {/* Submit Button with Hover & Tap Physics */}
            <motion.button
              whileHover={!(authLoading || attemptState.isLocked) ? { scale: 1.02 } : {}}
              whileTap={!(authLoading || attemptState.isLocked) ? { scale: 0.98 } : {}}
              type="submit"
              disabled={authLoading || attemptState.isLocked}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#e61e2b] to-red-700 hover:from-red-500 hover:to-red-600 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : attemptState.isLocked ? (
                <>
                  <Lock className="w-4 h-4 text-rose-300" />
                  <span>Login Locked For 24 Hours</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate &amp; Enter Console</span>
                </>
              )}
            </motion.button>
          </form>

        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-neutral-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-[#12131a]/95 border border-emerald-500/40 text-white shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-xs font-mono flex-1">
            {toastMessage}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Session Bar with Metallic TAB Monogram Watermark */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-[#0e0e14]/90 border border-neutral-800/90 shadow-[0_0_35px_rgba(0,0,0,0.6)]">
        {/* High-Definition Transparent TAB Monogram Logo Watermark (Razor-sharp PNG, no blurriness) with Ambient Breathing Effect */}
        <motion.div 
          animate={{ opacity: [0.22, 0.3, 0.22], scale: [1, 1.02, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0"
        >
          <img
            src={tabLogo}
            alt="Tech Base Axis Monogram Watermark"
            className="w-auto h-52 sm:h-72 object-contain filter contrast-125 brightness-125 drop-shadow-[0_0_35px_rgba(255,255,255,0.18)]"
          />
        </motion.div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-red-950/40 border border-red-600/40 flex items-center justify-center text-[#e61e2b] shrink-0 shadow-[0_0_15px_rgba(230,30,43,0.25)] mt-0.5 sm:mt-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#e61e2b]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
                Admin Dashboard // Tech Base Axis
              </h1>
              <div className="text-xs text-neutral-400 font-mono pt-0.5">
                Authenticated Operator:
              </div>
              <div className="inline-flex items-center gap-1.5 text-[#ff5c67] font-semibold text-xs sm:text-sm font-mono">
                <span>{user?.email || 'techbaseaxis@gmail.com'}</span>
                {isAdmin && (
                  <span 
                    className="inline-flex items-center justify-center shrink-0" 
                    title="Verified Administrator"
                  >
                    <svg 
                      className="w-4 h-4 shrink-0" 
                      viewBox="0 0 24 24" 
                      fill="none"
                    >
                      <path 
                        d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z" 
                        fill="#1d9bf0" 
                      />
                      <path 
                        d="M10.2 16.2L6.5 12.5l1.4-1.4 2.3 2.3 6.9-6.9 1.4 1.4-7.9 8.3z" 
                        fill="#ffffff" 
                      />
                    </svg>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar - Matches Screenshot Row */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto pt-2">
            <button
              type="button"
              onClick={() => onNavigate('packages')}
              className="px-3 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Preview live customer pricing section"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#e61e2b] shrink-0" />
              <span>Pricing</span>
            </button>

            <button
              type="button"
              onClick={exportToJson}
              className="px-3 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Download leads as JSON"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>Export</span>
            </button>

            {/* Professional Log Out Button */}
            <button
              type="button"
              onClick={handleLockConsole}
              className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-800/50 hover:border-red-700 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-sm shadow-red-950/40"
              title="Log out from Admin Dashboard"
            >
              <LogOut className="w-3.5 h-3.5 text-[#e61e2b] shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-b border-neutral-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveAdminTab('packages')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'packages'
              ? 'bg-[#e61e2b] text-white font-bold shadow-lg shadow-red-600/30'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>PRICE CONTROL</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeAdminTab === 'packages' ? 'bg-black/30 text-white' : 'bg-neutral-800 text-neutral-300'
          }`}>
            {packages.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('projects')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'projects'
              ? 'bg-[#e61e2b] text-white font-bold shadow-lg shadow-red-600/30'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>PROJECTS</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeAdminTab === 'projects' ? 'bg-black/30 text-white' : 'bg-neutral-800 text-neutral-300'
          }`}>
            {projects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('inquiries')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'inquiries'
              ? 'bg-[#e61e2b] text-white font-bold shadow-lg shadow-red-600/30'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>CLIENT INQUIRIES</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeAdminTab === 'inquiries' ? 'bg-black/30 text-white' : 'bg-neutral-800 text-neutral-300'
          }`}>
            {newInquiries} NEW
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('activity')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'activity'
              ? 'bg-[#e61e2b] text-white font-bold shadow-lg shadow-red-600/30'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>ACTIVITY</span>
        </button>
      </div>

      {/* TAB 1: PACKAGES & PRICING MANAGEMENT */}
      {activeAdminTab === 'packages' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Banner & Control Bar */}
          <div className="obsidian-card rounded-2xl border border-neutral-800 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Price Control Center
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Package</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all package prices and names back to initial defaults?')) {
                      onResetPackagesToDefault();
                      setEditedPackages({});
                      triggerToast('All package prices restored to defaults!');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Restore original package pricing"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Defaults</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid - Side by Side (Pashapashi) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-neutral-800/80">
              <div className="p-2 sm:p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[11px] font-mono text-neutral-400 truncate">Total Active</div>
                  <div className="text-xs sm:text-xl font-bold font-mono text-white mt-0.5 truncate">
                    {packages.length} Packages
                  </div>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-950/60 text-[#e61e2b] flex items-center justify-center shrink-0 self-end sm:self-center">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>

              <div className="p-2 sm:p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[11px] font-mono text-neutral-400 truncate">Subscription</div>
                  <div className="text-xs sm:text-xl font-bold font-mono text-blue-400 mt-0.5 truncate">
                    {packages.filter(p => p.cycle === 'monthly' || p.period?.includes('month')).length} Plans
                  </div>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center shrink-0 self-end sm:self-center">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>

              <div className="p-2 sm:p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[11px] font-mono text-neutral-400 truncate">Maintenance</div>
                  <div className="text-xs sm:text-xl font-bold font-mono text-amber-400 mt-0.5 truncate">
                    {packages.filter(p => p.cycle === 'milestone' || (!p.period?.includes('month') && !p.id.includes('monthly'))).length} Plans
                  </div>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-950/60 text-amber-400 flex items-center justify-center shrink-0 self-end sm:self-center">
                  <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={() => setPackageFilter(packageFilter === 'monthly' ? 'all' : 'monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  packageFilter === 'monthly'
                    ? 'bg-blue-950/70 text-blue-300 border border-blue-500/40 font-semibold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                ⚡ Subscription
              </button>
              <button
                type="button"
                onClick={() => setPackageFilter(packageFilter === 'milestone' ? 'all' : 'milestone')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  packageFilter === 'milestone'
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                🛠️ Maintenance
              </button>
            </div>
          </div>

          {/* Cards Grid: Direct Editable Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
              const current = getPackageData(pkg);
              const isMonthly = current.cycle === 'monthly' || current.period?.includes('month') || current.id.includes('monthly');
              const isSaved = savedFeedbackId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className={`obsidian-card rounded-2xl border transition-all duration-200 relative flex flex-col justify-between overflow-hidden p-5 ${
                    isSaved
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                      : current.popular
                      ? 'border-blue-500/50 shadow-md shadow-blue-500/10'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Top Bar with Popular Toggle & Actions (Badge Removed) */}
                  <div>
                    <div className="flex items-center justify-end gap-1.5 mb-3">
                      {/* Popular Toggle */}
                      <button
                        type="button"
                        onClick={() => handleFieldChange(pkg.id, 'popular', !current.popular)}
                        className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                          current.popular
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300 border border-neutral-800'
                        }`}
                        title="Toggle Most Popular Star badge"
                      >
                        <Star className={`w-3.5 h-3.5 ${current.popular ? 'fill-amber-400 text-amber-400' : ''}`} />
                        <span className="text-[10px]">{current.popular ? 'Popular' : 'Standard'}</span>
                      </button>
                    </div>

                    {/* Package Name Input */}
                    <div className="mb-3">
                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                        Package Name
                      </label>
                      <input
                        type="text"
                        value={current.name}
                        onChange={(e) => handleFieldChange(pkg.id, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 bg-neutral-900/90 border border-neutral-800 focus:border-[#e61e2b] rounded-lg text-sm font-bold text-white focus:outline-none"
                      />
                    </div>

                    {/* Badge / Subtitle */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                          Badge / Tag
                        </label>
                        <input
                          type="text"
                          value={current.badge || ''}
                          onChange={(e) => handleFieldChange(pkg.id, 'badge', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 focus:border-[#e61e2b] rounded-lg text-xs font-mono text-neutral-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                          Period Label
                        </label>
                        <input
                          type="text"
                          value={current.period || ''}
                          onChange={(e) => handleFieldChange(pkg.id, 'period', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 focus:border-[#e61e2b] rounded-lg text-xs font-mono text-neutral-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* PROMINENT PRICE EDITOR */}
                    <div className="p-4 rounded-xl bg-gradient-to-b from-[#14141d] to-[#0d0d12] border border-neutral-700/80 shadow-inner mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono uppercase text-red-400 font-bold flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-[#e61e2b]" />
                          Package Pricing (INR / ₹)
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          Custom Rate
                        </span>
                      </div>

                      {/* Main Big Input for Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-[#e61e2b] font-mono">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={current.price}
                          onChange={(e) => handleFieldChange(pkg.id, 'price', Math.max(0, Number(e.target.value) || 0))}
                          className="w-full text-2xl sm:text-3xl font-extrabold font-mono text-white bg-neutral-900 border-2 border-neutral-700 focus:border-[#e61e2b] rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-600/30"
                        />
                        <span className="text-xs font-mono text-neutral-400 shrink-0">
                          {current.period || (isMonthly ? '/mo' : '/proj')}
                        </span>
                      </div>

                      {/* Quick Adjust Price Buttons (+ / -) */}
                      <div className="mt-3 pt-2.5 border-t border-neutral-800 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono text-neutral-500 mr-1">Quick:</span>
                        {isMonthly ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleQuickPriceAdjust(pkg, -5)}
                              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono cursor-pointer"
                            >
                              -₹5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickPriceAdjust(pkg, 5)}
                              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono cursor-pointer"
                            >
                              +₹5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickPriceAdjust(pkg, 10)}
                              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono cursor-pointer"
                            >
                              +₹10
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickPriceAdjust(pkg, 25)}
                              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono cursor-pointer"
                            >
                              +₹25
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleQuickPriceAdjust(pkg, -100)}
                              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono cursor-pointer"
                            >
                              -₹100
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickPriceAdjust(pkg, 100)}
                              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono cursor-pointer"
                            >
                              +₹100
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickPriceAdjust(pkg, 500)}
                              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono cursor-pointer"
                            >
                              +₹500
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickPriceAdjust(pkg, 1000)}
                              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono cursor-pointer"
                            >
                              +₹1k
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description Textarea */}
                    <div className="mb-4">
                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                        Short Description
                      </label>
                      <textarea
                        rows={2}
                        value={current.description}
                        onChange={(e) => handleFieldChange(pkg.id, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 focus:border-[#e61e2b] rounded-lg text-xs font-mono text-neutral-300 focus:outline-none leading-relaxed"
                      />
                    </div>

                    {/* Features Checklist Editor */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono uppercase text-neutral-400">
                          Package Features (Click to toggle)
                        </label>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {(current.features || []).length} items
                        </span>
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                        {(current.features || []).map((feat, fIdx) => {
                          const text = typeof feat === 'string' ? feat : feat.text;
                          const included = typeof feat === 'string' ? true : feat.included;

                          return (
                            <div
                              key={fIdx}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-neutral-900/70 border border-neutral-800/80 text-xs"
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleFeatureIncluded(pkg.id, fIdx)}
                                className="flex items-center gap-2 text-left flex-1 cursor-pointer"
                              >
                                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                                  included ? 'bg-emerald-500 text-black font-bold' : 'bg-neutral-800 text-neutral-600'
                                }`}>
                                  {included ? '✓' : '✕'}
                                </span>
                                <span className={`font-mono text-[11px] truncate ${
                                  included ? 'text-neutral-200' : 'text-neutral-500 line-through'
                                }`}>
                                  {text}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(pkg.id, fIdx)}
                                className="text-neutral-500 hover:text-rose-400 p-0.5 cursor-pointer"
                                title="Remove this feature"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add new feature input */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          value={newFeatureText[pkg.id] || ''}
                          onChange={(e) => setNewFeatureText(prev => ({ ...prev, [pkg.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddFeature(pkg.id);
                            }
                          }}
                          className="w-full px-2.5 py-1 bg-neutral-900 border border-neutral-800 focus:border-[#e61e2b] rounded-lg text-xs font-mono text-neutral-200 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddFeature(pkg.id)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono cursor-pointer shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSavePackage(pkg)}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                          : 'bg-[#e61e2b] hover:bg-red-500 text-white shadow-md shadow-red-600/25'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Saved Live!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Price (₹{current.price.toLocaleString('en-IN')})</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onDeletePackage) {
                          onDeletePackage(pkg.id);
                          triggerToast(`Package "${current.name}" deleted from website & Packages page.`);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-white border border-rose-900/50 hover:border-red-600 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm shadow-rose-950/50"
                      title={`Delete "${current.name}" package from website & Packages page`}
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-mono font-semibold hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS & MEDIA MANAGER */}
      {activeAdminTab === 'projects' && (
        <AdminProjectsManager
          projects={projects}
          onUpdateProject={onUpdateProject || (() => {})}
          onCreateProject={onCreateProject || (() => {})}
          onDeleteProject={onDeleteProject || (() => {})}
          onClearAllProjects={onClearAllProjects || (() => {})}
          onNavigate={onNavigate}
        />
      )}

      {/* TAB 3: CLIENT INQUIRIES & LEADS */}
      {activeAdminTab === 'inquiries' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* KPI Cards Grid - Responsive Side-by-Side Boxes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="obsidian-card p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] sm:text-xs font-mono truncate">Total Client Briefs</span>
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e61e2b] shrink-0 ml-1" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mb-1">
                {totalInquiries}
              </div>
              <div className="text-[10px] sm:text-xs text-neutral-500 font-mono truncate">All-time received</div>
            </div>

            <div className="obsidian-card p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] sm:text-xs font-mono truncate">New Pending Review</span>
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0 ml-1" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 mb-1">
                {newInquiries}
              </div>
              <div className="text-[10px] sm:text-xs text-neutral-500 font-mono truncate">Action required &lt; 24h</div>
            </div>

            <div className="obsidian-card p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] sm:text-xs font-mono truncate">Active Pipeline</span>
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 ml-1" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mb-1">
                {activeProposals}
              </div>
              <div className="text-[10px] sm:text-xs text-neutral-500 font-mono truncate">Proposals & Sprints</div>
            </div>

            <div className="obsidian-card p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] sm:text-xs font-mono truncate">Estimated Pipeline</span>
                <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e61e2b] shrink-0 ml-1" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#e61e2b] mb-1 truncate">
                ₹{pipelineValue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] sm:text-xs text-neutral-500 font-mono truncate">Based on selected tiers</div>
            </div>
          </div>

          {/* Main Leads Table */}
          <div className="obsidian-card rounded-2xl border border-neutral-800 p-6 space-y-6">
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Client Inquiries &amp; Project Briefs</h2>
                <p className="text-xs text-neutral-400 font-mono">
                  Live database tracking prospective contracts and client communications.
                </p>
              </div>

              {/* Filter Pills & Push Alerts */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={pushLoading}
                  className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                    pushPermission
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                      : 'bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/40'
                  }`}
                  title={pushPermission ? 'OneSignal Push alerts active for new client leads' : 'Enable browser push notifications for inquiries'}
                >
                  <Bell className={`w-3.5 h-3.5 ${pushPermission ? 'text-emerald-400' : 'text-indigo-400'}`} />
                  <span>{pushPermission ? 'Push Alerts Active' : 'Enable Push Alerts'}</span>
                </button>

                <Filter className="w-3.5 h-3.5 text-neutral-500 mr-1" />
                {['All', 'New', 'Reviewing', 'Proposal Sent', 'In Development', 'Completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      filterStatus === st
                        ? 'bg-red-950/60 text-red-300 border border-red-600/40'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-mono">
                    <th className="py-3 px-3">Client / Company</th>
                    <th className="py-3 px-3">Project Type &amp; Package</th>
                    <th className="py-3 px-3">Budget</th>
                    <th className="py-3 px-3">Timeline</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {filteredInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{inq.clientName}</div>
                        <div className="text-xs font-mono text-[#e61e2b]">{inq.email}</div>
                        {inq.company && (
                          <div className="text-[11px] text-neutral-500 font-mono">{inq.company}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-medium text-neutral-200 flex items-center gap-1.5 flex-wrap">
                          {inq.eventType === 'appointment' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60">
                              📅 Appointment
                            </span>
                          ) : inq.eventType === 'package_booking' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/60 text-red-300 border border-red-800/60">
                              🔥 Package
                            </span>
                          ) : inq.eventType === 'quote_request' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/60">
                              🧮 Quote
                            </span>
                          ) : inq.eventType === 'payment_success' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                              💰 Payment
                            </span>
                          ) : inq.eventType === 'proposal_accepted' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                              🎉 Proposal
                            </span>
                          ) : inq.eventType === 'revision_request' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                              🔄 Revision
                            </span>
                          ) : inq.eventType === 'support_request' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 text-rose-300 border border-rose-800/60">
                              🛠️ Support
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-800/60">
                              💬 Enquiry
                            </span>
                          )}
                          <span>{inq.projectType}</span>
                        </div>
                        {inq.selectedPackage && (
                          <div className="text-xs text-neutral-400 font-mono">{inq.selectedPackage}</div>
                        )}
                        {inq.addOns && inq.addOns.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                              +{inq.addOns.length} Add-on{inq.addOns.length > 1 ? 's' : ''}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[220px]" title={inq.addOns.join(', ')}>
                              {inq.addOns.join(', ')}
                            </span>
                          </div>
                        )}
                        {inq.appointmentDate && (
                          <div className="text-[11px] text-amber-300 font-mono flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            <span>{inq.appointmentDate} • {inq.appointmentTime}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-white">
                        {inq.budgetRange}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-neutral-400">
                        {inq.timeline}
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={inq.status}
                          onChange={(e) => onUpdateInquiryStatus(inq.id, e.target.value as ClientInquiry['status'])}
                          className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs font-mono text-red-300 focus:outline-none focus:border-[#e61e2b]"
                        >
                          <option value="New">● New</option>
                          <option value="Reviewing">● Reviewing</option>
                          <option value="Proposal Sent">● Proposal Sent</option>
                          <option value="In Development">● In Development</option>
                          <option value="Completed">● Completed</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInquiry(inq);
                              setEditingNotes(inq.notes || '');
                            }}
                            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
                            title="View Full Brief"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={`mailto:${inq.email}?subject=Tech%20Base%20Axis%20-%20Regarding%20Your%20Project%20Brief`}
                            className="p-2 rounded-lg bg-neutral-900 hover:bg-red-950/40 text-[#e61e2b] border border-neutral-800 transition-colors"
                            title="Reply via Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteInquiry(inq.id);
                              triggerToast(`Deleted brief from ${inq.clientName}`);
                            }}
                            className="p-2 rounded-lg bg-neutral-900 hover:bg-rose-950/60 text-neutral-500 hover:text-rose-400 border border-neutral-800 hover:border-rose-700/60 transition-all cursor-pointer active:scale-95"
                            title="Delete Lead Immediately"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredInquiries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-500 font-mono text-xs">
                        No client inquiries found matching filter "{filterStatus}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE ACTIVITY & USER PRESENCE */}
      {activeAdminTab === 'activity' && (
        <AdminActivityManager onNavigate={onNavigate} />
      )}

      {/* MODAL: ADD NEW CUSTOM PACKAGE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl obsidian-card border border-neutral-800 p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Create New Package Tier</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPackageSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1">
                  Package Name <span className="text-[#e61e2b]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPkgForm.name}
                  onChange={(e) => setNewPkgForm({ ...newPkgForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    Plan Category / Type
                  </label>
                  <select
                    value={newPkgForm.cycle}
                    onChange={(e) => {
                      const cycle = e.target.value as 'monthly' | 'milestone';
                      setNewPkgForm({
                        ...newPkgForm,
                        cycle,
                        period: cycle === 'monthly' ? '/month' : '/project'
                      });
                    }}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                  >
                    <option value="monthly">Subscription</option>
                    <option value="milestone">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={newPkgForm.badge}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    Price (₹ INR) <span className="text-[#e61e2b]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newPkgForm.price}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, price: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    Period Format
                  </label>
                  <input
                    type="text"
                    value={newPkgForm.period}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, period: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1">
                  Card Theme Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['green', 'blue', 'amber', 'red'] as const).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewPkgForm({ ...newPkgForm, theme: col })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono uppercase tracking-wider border capitalize transition-all ${
                        newPkgForm.theme === col
                          ? 'border-white bg-neutral-800 text-white font-bold'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-500'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={newPkgForm.description}
                  onChange={(e) => setNewPkgForm({ ...newPkgForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1">
                  Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={newPkgForm.featuresText}
                  onChange={(e) => setNewPkgForm({ ...newPkgForm, featuresText: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="new-pkg-popular"
                  checked={newPkgForm.popular}
                  onChange={(e) => setNewPkgForm({ ...newPkgForm, popular: e.target.checked })}
                  className="rounded border-neutral-800 bg-neutral-900 text-[#e61e2b] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="new-pkg-popular" className="text-xs font-mono text-neutral-300 cursor-pointer">
                  Highlight as "Most Popular" (elevated card with glow)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#e61e2b] to-red-600 hover:from-red-500 hover:to-red-600 text-white text-xs font-mono font-bold shadow-md shadow-red-600/30 cursor-pointer"
                >
                  Create &amp; Publish Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: CLIENT INQUIRY BRIEF */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl obsidian-card border border-neutral-800 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#e61e2b] uppercase tracking-wider">
                  Lead Reference ID: #{selectedInquiry.id}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedInquiry.clientName}
                </h3>
                <div className="text-xs font-mono text-neutral-400">
                  {selectedInquiry.email} {selectedInquiry.company ? `• ${selectedInquiry.company}` : ''}
                </div>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-neutral-500 block mb-1">Project Type</span>
                <span className="text-white font-semibold">{selectedInquiry.projectType}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-neutral-500 block mb-1">Package</span>
                <span className="text-emerald-400 font-semibold">{selectedInquiry.selectedPackage || 'Custom'}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-neutral-500 block mb-1">Budget</span>
                <span className="text-white font-semibold">{selectedInquiry.budgetRange}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-neutral-500 block mb-1">Timeline</span>
                <span className="text-neutral-300">{selectedInquiry.timeline}</span>
              </div>
            </div>

            {/* Selected Add-ons Display */}
            {selectedInquiry.addOns && selectedInquiry.addOns.length > 0 && (
              <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Configured Engineering Add-ons ({selectedInquiry.addOns.length})</span>
                  </h4>
                  {selectedInquiry.totalPrice && (
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      Total: ₹{selectedInquiry.totalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {selectedInquiry.addOns.map((addon, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{addon}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-mono uppercase text-neutral-400 mb-2">
                Project Scope Details
              </h4>
              <p className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs sm:text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">
                {selectedInquiry.details || 'No additional scope details specified.'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase text-neutral-400 mb-2 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#e61e2b]" />
                <span>Internal Engineering Notes (Private)</span>
              </h4>
              <textarea
                rows={3}
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Tech%20Base%20Axis%20Quotation%20-%20${selectedInquiry.clientName}`}
                  className="px-4 py-2 rounded-xl bg-[#e61e2b] hover:bg-red-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-red-600/25 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Quotation Email</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    onDeleteInquiry(selectedInquiry.id);
                    setSelectedInquiry(null);
                    triggerToast(`Deleted brief from ${selectedInquiry.clientName}`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-700/60 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Delete Lead Immediately"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onUpdateInquiryStatus(selectedInquiry.id, selectedInquiry.status, editingNotes);
                  setSelectedInquiry(null);
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-xs cursor-pointer"
              >
                Save Notes &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
