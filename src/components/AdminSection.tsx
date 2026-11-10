import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import tabLogo from '../assets/images/tab_logo_hd_transparent.png';
import { ClientInquiry, NavSection, ServicePackage, PackageFeature, Project } from '../types';
import { AdminProjectsManager } from './AdminProjectsManager';
import { AdminAddOnPrices } from './AdminAddOnPrices';
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
  Gem,
  Puzzle,
  ChevronDown,
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
import { AdminContactInbox } from './AdminContactInbox';
import { AdminPlanRequests } from './AdminPlanRequests';
import { updateInquiryInCloud } from '../data/inquiryData';
import { requestPushPermission, runWithOneSignal, syncAdminDeviceRegistration, getPushPermissionStatus } from '../utils/onesignal';
import { updatePackagesFromCloud, isSubscriptionPackage, isMaintenancePackage } from '../data/pricingData';

interface AdminSectionProps {
  inquiries: ClientInquiry[];
  inquirySyncError?: string | null;
  onUpdateInquiryStatus: (id: string, status: ClientInquiry['status'], notes?: string) => void;
  onPatchInquiry?: (id: string, patch: Partial<ClientInquiry>) => void;
  onDeleteInquiry: (id: string) => void;
  onNavigate: (section: NavSection) => void;
  onRefreshInquiries?: () => void;
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
  inquirySyncError,
  onUpdateInquiryStatus,
  onPatchInquiry,
  onDeleteInquiry,
  onNavigate,
  onRefreshInquiries,
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
  const [tabMenuOpen, setTabMenuOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'addons' | 'packages' | 'plans' | 'projects' | 'inquiries' | 'activity'>(() => {
    if (typeof window !== 'undefined') {
      const hash = (window.location.hash + ' ' + (new URLSearchParams(window.location.search).get('tab') || '')).toLowerCase();
      if (hash.includes('plans')) return 'plans';
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
      if (hash || new URLSearchParams(window.location.search).has('tab')) {
        window.history.replaceState(null, '', window.location.pathname);
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

  // Unified Real-Time Incoming Submission Alert State
  const [liveIncomingAlert, setLiveIncomingAlert] = useState<{
    id: string;
    eventType: string;
    title: string;
    clientName: string;
    emailOrPhone?: string;
    serviceOrDetails?: string;
    timestamp: number;
    inquiryId?: string;
    category: 'inquiries' | 'activity';
  } | null>(null);
  const [liveAlertProgress, setLiveAlertProgress] = useState<number>(100);
  const knownInquiryIdsRef = useRef<Set<string>>(new Set());
  const initialInquiriesCheckRef = useRef<boolean>(false);
  const knownNotificationIdsRef = useRef<Set<string>>(new Set());
  const initialNotificationsCheckRef = useRef<boolean>(false);

  // Web Audio Synthesizer Chime for Incoming Real-Time Alerts
  const playAdminIncomingChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      
      // Synth Chime: Note 1 (659.25Hz E5) -> Note 2 (987.77Hz B5) -> Note 3 (1318.5Hz E6)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(987.77, now + 0.08);
      gain2.gain.setValueAtTime(0.22, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.5);

      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1318.5, now + 0.16);
      gain3.gain.setValueAtTime(0.2, now + 0.16);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.16);
      osc3.stop(now + 0.7);
    } catch (_) {}
  };

  const triggerLiveIncomingAlert = (alertData: {
    id: string;
    eventType: string;
    title: string;
    clientName: string;
    emailOrPhone?: string;
    serviceOrDetails?: string;
    timestamp: number;
    inquiryId?: string;
    category: 'inquiries' | 'activity';
  }) => {
    playAdminIncomingChime();
    setLiveIncomingAlert(alertData);
    setLiveAlertProgress(100);
  };

  // Real-time animated shrinking countdown timer (10 seconds auto-dismiss)
  useEffect(() => {
    if (!liveIncomingAlert) {
      setLiveAlertProgress(100);
      return;
    }

    const duration = 10000; // 10s
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setLiveAlertProgress(remaining);
      if (remaining <= 0) {
        setLiveIncomingAlert(null);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [liveIncomingAlert]);

  // Channel 1: Prop Diffing on incoming inquiries (Appointments, Quotes, Enquiries, Bookings)
  useEffect(() => {
    if (!isConsoleUnlocked) return;
    const currentIds = new Set(inquiries.map((i) => i.id));
    if (!initialInquiriesCheckRef.current) {
      initialInquiriesCheckRef.current = true;
      knownInquiryIdsRef.current = currentIds;
      return;
    }

    const newItems = inquiries.filter((i) => !knownInquiryIdsRef.current.has(i.id));
    if (newItems.length > 0) {
      newItems.forEach((i) => knownInquiryIdsRef.current.add(i.id));
      const latest = newItems[0];
      
      let alertType = latest.inquiryType || 'contact_enquiry';
      let title = 'New Client Enquiry';
      if (alertType === 'appointment' || latest.projectType?.toLowerCase().includes('appointment')) {
        alertType = 'appointment';
        title = 'New Appointment Booked';
      } else if (alertType === 'quote_request' || latest.projectType?.toLowerCase().includes('quote')) {
        alertType = 'quote_request';
        title = 'New Project Quote Requested';
      } else if (alertType === 'package_booking' || latest.selectedPackage) {
        alertType = 'package_booking';
        title = 'New Package Booking Received';
      }

      triggerLiveIncomingAlert({
        id: latest.id,
        eventType: alertType,
        title,
        clientName: latest.clientName || 'Prospective Client',
        emailOrPhone: latest.email || latest.phone || '',
        serviceOrDetails: latest.projectType || latest.selectedPackage || latest.details || '',
        timestamp: Date.now(),
        inquiryId: latest.id,
        category: 'inquiries'
      });
    }
  }, [inquiries, isConsoleUnlocked]);

  // Channel 2: Polling /api/notifications/recent every 2.5s (Server-side cross-device detection)
  useEffect(() => {
    if (!isConsoleUnlocked) return;
    let isMounted = true;

    const checkRecentNotifications = async () => {
      try {
        const res = await fetch('/api/notifications/recent', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data?.success || !Array.isArray(data.notifications)) return;

        const notifs = data.notifications;
        if (!initialNotificationsCheckRef.current) {
          initialNotificationsCheckRef.current = true;
          notifs.forEach((n: any) => knownNotificationIdsRef.current.add(n.id));
          return;
        }

        const unread = notifs.filter((n: any) => !knownNotificationIdsRef.current.has(n.id));
        if (unread.length > 0) {
          unread.forEach((n: any) => knownNotificationIdsRef.current.add(n.id));
          const latest = unread[0];

          // Auto refresh inquiry table if an inquiry/booking arrived
          if (['appointment', 'quote_request', 'contact_enquiry', 'package_booking'].includes(latest.eventType)) {
            onRefreshInquiries?.();
          }

          let alertTitle = 'New Incoming Submission';
          let category: 'inquiries' | 'activity' = 'inquiries';

          if (latest.eventType === 'appointment') {
            alertTitle = 'New Appointment Booked';
          } else if (latest.eventType === 'quote_request') {
            alertTitle = 'New Project Quote Requested';
          } else if (latest.eventType === 'contact_enquiry') {
            alertTitle = 'New Client Enquiry';
          } else if (latest.eventType === 'package_booking') {
            alertTitle = 'New Package Booking Received';
          } else if (latest.eventType === 'review_submitted') {
            alertTitle = 'New Client Review Submitted';
            category = 'activity';
          } else if (latest.eventType === 'account_created' || latest.eventType === 'user_signup') {
            alertTitle = 'New Client Account Created';
            category = 'activity';
          }

          triggerLiveIncomingAlert({
            id: latest.id || `notif-${Date.now()}`,
            eventType: latest.eventType,
            title: alertTitle,
            clientName: latest.clientName || 'Client',
            emailOrPhone: latest.email || latest.clientEmail || latest.phone || '',
            serviceOrDetails: latest.service || latest.subject || latest.message || latest.reviewText || '',
            timestamp: Date.now(),
            inquiryId: latest.inquiryId || latest.bookingId || latest.quoteId || latest.appointmentId,
            category
          });
        }
      } catch (_) {}
    };

    const timer = setInterval(checkRecentNotifications, 2500);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isConsoleUnlocked, onRefreshInquiries]);

  // Channel 3: Local Event & Cross-Tab BroadcastChannel Listeners
  useEffect(() => {
    if (!isConsoleUnlocked) return;

    const handleLocalSavedInquiry = (e: any) => {
      const detail = e.detail;
      if (!detail || !detail.id) return;
      if (knownInquiryIdsRef.current.has(detail.id)) return;
      knownInquiryIdsRef.current.add(detail.id);

      onRefreshInquiries?.();

      let alertType = detail.inquiryType || 'contact_enquiry';
      let title = 'New Client Enquiry';
      if (alertType === 'appointment' || detail.projectType?.toLowerCase().includes('appointment')) {
        alertType = 'appointment';
        title = 'New Appointment Booked';
      } else if (alertType === 'quote_request' || detail.projectType?.toLowerCase().includes('quote')) {
        alertType = 'quote_request';
        title = 'New Project Quote Requested';
      } else if (alertType === 'package_booking' || detail.selectedPackage) {
        alertType = 'package_booking';
        title = 'New Package Booking Received';
      }

      triggerLiveIncomingAlert({
        id: detail.id,
        eventType: alertType,
        title,
        clientName: detail.clientName || 'Client',
        emailOrPhone: detail.email || detail.phone || '',
        serviceOrDetails: detail.projectType || detail.selectedPackage || detail.details || '',
        timestamp: Date.now(),
        inquiryId: detail.id,
        category: 'inquiries'
      });
    };

    window.addEventListener('tba_new_inquiry_saved', handleLocalSavedInquiry);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('tba_events_broadcast');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_INQUIRY' && event.data?.data) {
          handleLocalSavedInquiry({ detail: event.data.data });
        }
      };
    } catch (_) {}

    return () => {
      window.removeEventListener('tba_new_inquiry_saved', handleLocalSavedInquiry);
      if (bc) bc.close();
    };
  }, [isConsoleUnlocked, onRefreshInquiries]);

  // Channel 4: OneSignal Foreground Real-Time Push Listener
  useEffect(() => {
    if (!isConsoleUnlocked) return;
    runWithOneSignal((OneSignal) => {
      try {
        if (OneSignal.Notifications?.addEventListener) {
          const onForeground = (event: any) => {
            const notif = event?.notification;
            const data = notif?.additionalData || {};
            const heading = notif?.title || 'New Real-Time Submission';
            const bodyText = notif?.body || '';

            // Allow operating system notification banner to also pop up while viewing app
            if (notif?.display && typeof notif.display === 'function') {
              try { notif.display(); } catch (_) {}
            }

            triggerLiveIncomingAlert({
              id: notif?.notificationId || `os-${Date.now()}`,
              eventType: data?.inquiryType || data?.eventType || 'contact_enquiry',
              title: heading,
              clientName: data?.clientName || 'Client',
              emailOrPhone: data?.clientEmail || data?.clientPhone || '',
              serviceOrDetails: bodyText,
              timestamp: Date.now(),
              inquiryId: data?.inquiryId || data?.bookingId || data?.quoteId || data?.appointmentId,
              category: data?.eventType === 'review_submitted' || data?.eventType === 'account_created' ? 'activity' : 'inquiries'
            });
          };
          OneSignal.Notifications.addEventListener('foregroundWillDisplay', onForeground);
        }
      } catch (_) {}
    });
  }, [isConsoleUnlocked]);

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
  const [isSyncingPackages, setIsSyncingPackages] = useState<boolean>(false);

  // OneSignal push notifications state
  const [pushPermission, setPushPermission] = useState<boolean>(false);
  const [pushLoading, setPushLoading] = useState<boolean>(false);
  const [isRefreshingInquiries, setIsRefreshingInquiries] = useState<boolean>(false);

  const handleManualRefreshInquiries = async () => {
    if (onRefreshInquiries) {
      setIsRefreshingInquiries(true);
      try {
        await onRefreshInquiries();
        triggerToast('Client inquiries refreshed from server!');
      } finally {
        setTimeout(() => setIsRefreshingInquiries(false), 500);
      }
    }
  };

  // Automatically register this exact device/phone where Admin Console is open as the active admin device
  const registerCurrentDeviceAsAdmin = () => {
    const adminEmail = user?.email || 'techbaseaxis@gmail.com';
    syncAdminDeviceRegistration(adminEmail);
  };

  useEffect(() => {
    // Only a signed-in admin may turn this device into an admin alert device.
    if (!isAdmin) return;
    const adminEmail = user?.email || 'techbaseaxis@gmail.com';

    getPushPermissionStatus().then((status) => {
      setPushPermission(status.granted);
    });

    runWithOneSignal((OneSignal) => {
      if (OneSignal.Notifications) {
        const isGranted = Boolean(OneSignal.Notifications.permission);
        setPushPermission(isGranted);
        if (isGranted) {
          syncAdminDeviceRegistration(adminEmail);
        }
        if (OneSignal.Notifications.addEventListener) {
          OneSignal.Notifications.addEventListener('permissionChange', (granted: boolean) => {
            setPushPermission(Boolean(granted));
            if (granted) {
              syncAdminDeviceRegistration(adminEmail);
            }
          });
        }
      }
      syncAdminDeviceRegistration(adminEmail);
    });
  }, [isAdmin, user?.email]);

  const [testBusy, setTestBusy] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);

  // Sends a real test alert and shows exactly where it fails (backend missing, key missing, no admin device...)
  const handleTestAlert = async () => {
    setTestBusy(true);
    setTestResult(null);
    try {
      let status: any = null;
      let statusCode = 0;
      try {
        const sr = await fetch('/api/notification-status', { cache: 'no-store' });
        statusCode = sr.status;
        status = await sr.json();
      } catch (_) {}

      if (!status) {
        setTestResult({ ok: false, text: `Backend not reachable: /api/notification-status returned HTTP ${statusCode || 'error'}. The /api functions are not deployed on this host yet.` });
        return;
      }
      if (!status.onesignalReady) {
        setTestResult({ ok: false, text: 'OneSignal REST API key is missing on the server. Add ONESIGNAL_REST_API_KEY in Vercel > Settings > Environment Variables, then Redeploy.' });
        return;
      }

      const r = await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'contact_enquiry',
          clientName: 'TEST ALERT',
          email: user?.email || 'techbaseaxis@gmail.com',
          subject: 'Test notification from Admin panel',
          message: 'If you can read this on your phone, admin alerts work properly!',
          idempotencyKey: `test:${Date.now()}`
        })
      });
      const data: any = await r.json().catch(() => ({}));
      if (data?.success) {
        setTestResult({ ok: true, text: `Test alert sent to OneSignal (ID: ${data.id || 'ok'}). It should appear on this admin device in a few seconds. If it does not, check your device/browser notification permissions.` });
      } else {
        const detail = JSON.stringify(data?.errors || data?.error || data).slice(0, 400);
        setTestResult({ ok: false, text: `OneSignal did not deliver the alert: ${detail}. Tip: sign in as admin on this device, allow notifications, reload and try again. Also check that ONESIGNAL_APP_ID matches the app the REST key belongs to.` });
      }
    } finally {
      setTestBusy(false);
    }
  };

  const handleEnablePush = async () => {
    setPushLoading(true);
    try {
      const granted = await requestPushPermission();
      setPushPermission(granted);
      if (granted) {
        syncAdminDeviceRegistration(user?.email || 'techbaseaxis@gmail.com');
        triggerToast('Push notifications enabled and registered for this admin device!');
      } else {
        triggerToast('Notification permission was dismissed or blocked in browser settings.');
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
    cycle: 'monthly' as 'monthly' | 'maintenance',
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
        syncAdminDeviceRegistration(emailTrim);
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
          syncAdminDeviceRegistration(authenticatedEmail);
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

  // Warn the admin when a package change could not be saved to ANY cloud store
  useEffect(() => {
    const onSyncFailed = () =>
      triggerToast('Warning: package saved only on this device. Cloud sync failed, visitors will not see it. Check internet and try again.');
    window.addEventListener('tba_packages_sync_failed', onSyncFailed);
    return () => window.removeEventListener('tba_packages_sync_failed', onSyncFailed);
  }, []);

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
    const categoryLabel = isSubscriptionPackage(toSave) ? 'Subscription' : 'Maintenance';
    triggerToast(`Package "${toSave.name}" saved to ${categoryLabel} at ₹${toSave.price.toLocaleString('en-IN')}${toSave.period || ''}! Synced live to all visitor phones.`);
    setTimeout(() => {
      setSavedFeedbackId((curr) => (curr === pkg.id ? null : curr));
    }, 2500);
  };

  // Publish / Sync all packages & prices to Cloud Firestore & Supabase CDN for all visitor phones
  const handleSyncAllPackagesToCloud = async () => {
    setIsSyncingPackages(true);
    try {
      // Publish only the admin's edited drafts, applied on top of the latest cloud list
      // (never re-upload a possibly stale local copy of every package).
      const edits = Object.values(editedPackages) as ServicePackage[];
      await updatePackagesFromCloud((list) =>
        edits.reduce(
          (acc, pkg) =>
            acc.some((p) => p.id === pkg.id) ? acc.map((p) => (p.id === pkg.id ? pkg : p)) : [...acc, pkg],
          list
        )
      );
      triggerToast('All package prices & details published to all phones & visitor devices in real time!');
    } catch (err) {
      console.error('Failed to sync packages:', err);
      triggerToast('Prices saved locally, cloud sync will retry in background.');
    } finally {
      setIsSyncingPackages(false);
    }
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

    const isMaint = newPkgForm.cycle === 'maintenance';
    const newPackage: ServicePackage = {
      id: isMaint ? `pkg-maint-${Date.now().toString().slice(-6)}` : `pkg-sub-${Date.now().toString().slice(-6)}`,
      name: newPkgForm.name.trim(),
      badge: newPkgForm.badge.trim() || (isMaint ? 'Maintenance' : 'Subscription'),
      theme: newPkgForm.theme,
      price: Number(newPkgForm.price) || 0,
      period: newPkgForm.period?.trim() || '/month',
      cycle: isMaint ? 'maintenance' : 'monthly',
      popular: newPkgForm.popular,
      description: newPkgForm.description.trim() || (isMaint ? 'Ongoing system maintenance, security and updates.' : 'Subscription tier.'),
      turnaround: newPkgForm.turnaround.trim() || 'Instant Setup',
      idealFor: newPkgForm.idealFor.trim() || 'Businesses seeking tailored velocity',
      features: featuresList,
      deliverables: ['Full Source Code Repository', 'Architecture Walkthrough & Handoff'],
      techStack: ['React 19', 'TypeScript', 'Tailwind CSS']
    };

    if (onCreatePackage) {
      onCreatePackage(newPackage);
    }
    setIsCreateModalOpen(false);
    triggerToast(`New package "${newPackage.name}" created at ₹${newPackage.price.toLocaleString('en-IN')}! Added strictly to ${isMaint ? 'Maintenance' : 'Subscription'}.`);
  };

  // Filtered packages strictly separated (zero overlap)
  const filteredPackages = packages.filter((pkg) => {
    if (packageFilter === 'all') return true;
    if (packageFilter === 'monthly') {
      return isSubscriptionPackage(pkg);
    }
    if (packageFilter === 'milestone') {
      return isMaintenancePackage(pkg);
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

          {/* Company Brand Logo Header - Centered & Compact */}
          <div className="relative z-10 flex flex-col items-center justify-center mx-auto mb-4">
            <motion.div 
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative flex items-center justify-center p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-neutral-900/95 border border-neutral-800/90 shadow-[0_0_25px_rgba(230,30,43,0.25)] group"
            >
              <img
                src={tabLogo}
                alt="Tech Base Axis - Web Development Company Kolkata Official Logo"
                className="h-14 xs:h-16 sm:h-20 w-auto max-w-[130px] sm:max-w-[160px] object-contain filter drop-shadow-[0_4px_16px_rgba(255,255,255,0.2)] group-hover:brightness-110 transition-all duration-300"
              />
              <span className="absolute inset-0 rounded-xl sm:rounded-2xl bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-sm pointer-events-none" />
            </motion.div>
            <div className="mt-2.5 flex items-center gap-1.5 font-bold tracking-wider text-white text-sm sm:text-base">
              <span>TECH BASE</span>
              <span className="text-[#e61e2b] font-extrabold">AXIS</span>
            </div>
          </div>

          <div className="relative z-10 text-center mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
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

  const getIncomingBadgeClass = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'quote_request':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'package_booking':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'review_submitted':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'account_created':
      case 'user_signup':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  const getIncomingBadgeLabel = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'APPOINTMENT';
      case 'quote_request':
        return 'GET QUOTE';
      case 'package_booking':
        return 'BOOKING';
      case 'review_submitted':
        return 'CLIENT REVIEW';
      case 'account_created':
      case 'user_signup':
        return 'NEW ACCOUNT';
      default:
        return 'CLIENT ENQUIRY';
    }
  };

  const getIncomingBadgeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-3 h-3 text-red-400 shrink-0" />;
      case 'quote_request':
        return <IndianRupee className="w-3 h-3 text-amber-400 shrink-0" />;
      case 'package_booking':
        return <Package className="w-3 h-3 text-purple-400 shrink-0" />;
      case 'review_submitted':
        return <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />;
      case 'account_created':
      case 'user_signup':
        return <Users className="w-3 h-3 text-emerald-400 shrink-0" />;
      default:
        return <Mail className="w-3 h-3 text-blue-400 shrink-0" />;
    }
  };

  const handleViewIncomingInConsole = (alertItem: {
    id: string;
    eventType: string;
    title: string;
    clientName: string;
    emailOrPhone?: string;
    serviceOrDetails?: string;
    timestamp: number;
    inquiryId?: string;
    category: 'inquiries' | 'activity';
  }) => {
    if (alertItem.category === 'activity') {
      setActiveAdminTab('activity');
    } else {
      setActiveAdminTab('inquiries');
      if (alertItem.inquiryId) {
        const found = inquiries.find((i) => i.id === alertItem.inquiryId || i.id.includes(alertItem.inquiryId!));
        if (found) {
          setSelectedInquiry(found);
          setEditingNotes(found.notes || '');
        } else {
          // Construct synthetic inquiry object for immediate inspection
          setSelectedInquiry({
            id: alertItem.inquiryId,
            clientName: alertItem.clientName,
            email: alertItem.emailOrPhone?.includes('@') ? alertItem.emailOrPhone : '',
            phone: !alertItem.emailOrPhone?.includes('@') ? alertItem.emailOrPhone || '' : '',
            projectType: alertItem.eventType === 'appointment' ? 'Appointment Booking' : alertItem.eventType === 'quote_request' ? 'Project Quote Request' : 'Direct Inquiry',
            budgetRange: 'Review Required',
            timeline: 'Immediate',
            details: alertItem.serviceOrDetails || 'Incoming submission received in real time.',
            status: 'New',
            createdAt: new Date().toISOString()
          });
          setEditingNotes('');
        }
      }
    }
    setLiveIncomingAlert(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-neutral-100">
      {/* Real-Time Incoming Submission Live UI Alert (Appointments, Quotes, Enquiries, Bookings, Reviews, Signups) */}
      <AnimatePresence>
        {liveIncomingAlert && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed top-20 right-4 sm:right-8 z-[9999] max-w-md w-[calc(100vw-2rem)] sm:w-[440px] rounded-2xl bg-[#0c0d12]/98 border border-[#e61e2b]/50 text-white shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(230,30,43,0.35)] backdrop-blur-2xl overflow-hidden group"
          >
            {/* Top Glowing Crimson Accent Line */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#e61e2b] via-red-500 to-[#e61e2b] shadow-[0_0_15px_#e61e2b]" />

            <div className="p-4 sm:p-5 space-y-3.5">
              {/* Header: Live Beacon + Type Badge + Dismiss */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e61e2b] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e61e2b]" />
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-[#ff4d5a] uppercase font-bold truncate">
                    LIVE INCOMING SUBMISSION
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] sm:text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${getIncomingBadgeClass(liveIncomingAlert.eventType)}`}>
                    {getIncomingBadgeIcon(liveIncomingAlert.eventType)}
                    {getIncomingBadgeLabel(liveIncomingAlert.eventType)}
                  </span>

                  <button
                    type="button"
                    onClick={() => setLiveIncomingAlert(null)}
                    className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Client & Submission Info */}
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                    {liveIncomingAlert.clientName}
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                    Just now
                  </span>
                </div>

                {liveIncomingAlert.emailOrPhone && (
                  <div className="text-xs font-mono text-neutral-400 truncate flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-[#e61e2b] shrink-0" />
                    <span className="truncate">{liveIncomingAlert.emailOrPhone}</span>
                  </div>
                )}

                {liveIncomingAlert.serviceOrDetails && (
                  <div className="text-xs text-neutral-300 bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-2.5 line-clamp-2 italic leading-relaxed">
                    "{liveIncomingAlert.serviceOrDetails}"
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleViewIncomingInConsole(liveIncomingAlert)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#e61e2b] hover:bg-[#ff2b38] text-white text-xs font-mono font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(230,30,43,0.4)] hover:shadow-[0_0_25px_rgba(230,30,43,0.6)] cursor-pointer"
                >
                  <span>VIEW IN CONSOLE</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setLiveIncomingAlert(null)}
                  className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono transition-colors cursor-pointer shrink-0"
                >
                  DISMISS
                </button>
              </div>
            </div>

            {/* Auto-Dismiss Shrinking Countdown Bar */}
            <div className="h-1 w-full bg-neutral-900/80 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#e61e2b] via-red-500 to-[#e61e2b] transition-all duration-75 ease-linear shadow-[0_0_8px_#e61e2b]"
                style={{ width: `${liveAlertProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification - Signature Tech Base Axis Crimson & Obsidian Glass Theme */}
      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto p-3.5 sm:p-4 rounded-2xl bg-[#0c0d12]/95 border border-neutral-800 hover:border-[#e61e2b]/50 text-white shadow-[0_15px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(230,30,43,0.18)] backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 overflow-hidden group">
          {/* Top-edge Glowing Crimson Accent Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#e61e2b] to-transparent shadow-[0_0_12px_#e61e2b]" />

          {/* Crimson Icon Pill */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#e61e2b]/15 text-[#e61e2b] border border-[#e61e2b]/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(230,30,43,0.25)]">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#e61e2b]" />
          </div>

          {/* Notification Text */}
          <div className="text-xs sm:text-sm font-mono text-neutral-100 flex-1 leading-snug tracking-tight">
            {toastMessage}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-[#e61e2b] hover:bg-neutral-800/80 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss notification"
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

      {/* Admin Device Push Alerts Status Banner */}
      {!pushPermission ? (
        <div className="p-3.5 sm:p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-md">
          <div className="flex items-center gap-2.5 text-amber-200">
            <Bell className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <div>
              <span className="font-bold text-white">Push Alerts Not Active on this Device:</span>{' '}
              <span className="text-amber-200/90">Enable push alerts so client enquiries and bookings arrive on your phone/browser immediately.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEnablePush}
            disabled={pushLoading}
            className="shrink-0 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{pushLoading ? 'Enabling...' : 'Enable Push Alerts Now'}</span>
          </button>
        </div>
      ) : (
        <div className="px-4 py-2 rounded-xl bg-emerald-950/30 border border-emerald-700/30 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>OneSignal Push Alerts Active on this admin device</span>
          </div>
          <button
            type="button"
            onClick={handleTestAlert}
            disabled={testBusy}
            className="text-[11px] px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
          >
            {testBusy ? 'Sending Test...' : 'Send Test Push Alert'}
          </button>
        </div>
      )}
      {testResult && (
        <div className={`p-3 rounded-xl border text-xs font-mono ${testResult.ok ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/40' : 'bg-rose-950/50 text-rose-300 border-rose-700/50'}`}>
          {testResult.text}
        </div>
      )}

      {/* Admin Module Navigation (dropdown menu) */}
      {(() => {
        const adminTabs: { id: 'addons' | 'packages' | 'plans' | 'projects' | 'inquiries' | 'activity'; label: string; icon: React.ElementType; badge?: string }[] = [
          { id: 'addons', label: 'ADD-ONS', icon: Puzzle },
          { id: 'packages', label: 'PRICE CONTROL', icon: IndianRupee, badge: String(packages.length) },
          { id: 'plans', label: 'PLAN REQUESTS', icon: Layers, badge: `${inquiries.filter((i) => (i.planCategory || ['package_booking', 'payment_success'].includes(i.eventType || '') || i.company === 'Direct Package Booking') && (i.planDecision || 'pending') === 'pending').length} NEW` },
          { id: 'projects', label: 'PROJECTS', icon: FolderGit2, badge: String(projects.length) },
          { id: 'inquiries', label: 'CLIENT INQUIRIES', icon: Users, badge: `${newInquiries} NEW` },
          { id: 'activity', label: 'ACTIVITY', icon: Activity }
        ];
        const current = adminTabs.find((t) => t.id === activeAdminTab) || adminTabs[0];
        const CurrentIcon = current.icon;

        return (
          <div className="relative border-b border-neutral-800 pb-3">
            <button
              type="button"
              onClick={() => setTabMenuOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={tabMenuOpen}
              className="w-full sm:w-80 px-4 py-3 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2.5 bg-[#e61e2b] text-white font-bold shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <CurrentIcon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left truncate">{current.label}</span>
              {current.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/30 text-white">{current.badge}</span>
              )}
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${tabMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {tabMenuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setTabMenuOpen(false)}
                />
                <div
                  role="listbox"
                  className="absolute left-0 top-full -mt-2 z-40 w-full sm:w-80 rounded-xl bg-[#0d0e12] border border-neutral-700 shadow-2xl shadow-black/70 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                >
                  {adminTabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = tab.id === activeAdminTab;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setActiveAdminTab(tab.id);
                          setTabMenuOpen(false);
                        }}
                        className={`w-full px-3.5 py-3 rounded-lg font-mono text-xs uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
                          active ? 'bg-red-950/60 text-white border border-red-600/40' : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white border border-transparent'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#ff4d5a]' : ''}`} />
                        <span className="flex-1 text-left truncate">{tab.label}</span>
                        {tab.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300">{tab.badge}</span>
                        )}
                        {active && <Check className="w-4 h-4 text-[#ff4d5a] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* TAB: BOOKING ADD-ON PRICES */}
      {activeAdminTab === 'addons' && (
        <div className="animate-in fade-in duration-200">
          <AdminAddOnPrices />
        </div>
      )}

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
                  onClick={() => {
                    const defaultCycle = packageFilter === 'milestone' ? 'maintenance' : 'monthly';
                    setNewPkgForm({
                      name: '',
                      badge: defaultCycle === 'maintenance' ? 'Essential Care' : 'Special Tier',
                      theme: defaultCycle === 'maintenance' ? 'amber' : 'blue',
                      price: defaultCycle === 'maintenance' ? 1499 : 99,
                      period: '/month',
                      cycle: defaultCycle,
                      popular: false,
                      description: defaultCycle === 'maintenance' ? 'Ongoing system maintenance and priority updates.' : 'Scalable modern full-stack development subscription.',
                      turnaround: 'Instant Setup',
                      idealFor: 'Startups & modern companies',
                      featuresText: 'Unlimited projects\nCustom dashboard\nDedicated support'
                    });
                    setIsCreateModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Package</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid - Side by Side (Pashapashi) */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 border-t border-neutral-800/80">
              <div 
                onClick={() => setPackageFilter(packageFilter === 'monthly' ? 'all' : 'monthly')}
                className={`p-2 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${
                  packageFilter === 'monthly'
                    ? 'bg-blue-950/40 border-blue-500/70 ring-1 ring-blue-500/40'
                    : 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700'
                } flex flex-col sm:flex-row sm:items-center justify-between gap-1`}
                title="Click to view Subscription packages"
              >
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[11px] font-mono text-neutral-400 truncate">Subscription</div>
                  <div className="text-xs sm:text-xl font-bold font-mono text-blue-400 mt-0.5 truncate">
                    {packages.filter(isSubscriptionPackage).length} Plans
                  </div>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center shrink-0 self-end sm:self-center">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>

              <div 
                onClick={() => setPackageFilter(packageFilter === 'milestone' ? 'all' : 'milestone')}
                className={`p-2 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${
                  packageFilter === 'milestone'
                    ? 'bg-amber-950/40 border-amber-500/70 ring-1 ring-amber-500/40'
                    : 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700'
                } flex flex-col sm:flex-row sm:items-center justify-between gap-1`}
                title="Click to view Maintenance packages"
              >
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[11px] font-mono text-neutral-400 truncate">Maintenance</div>
                  <div className="text-xs sm:text-xl font-bold font-mono text-amber-400 mt-0.5 truncate">
                    {packages.filter(isMaintenancePackage).length} Plans
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
                onClick={() => setPackageFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  packageFilter === 'all'
                    ? 'bg-neutral-800 text-white border border-neutral-600 font-semibold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                All ({packages.length})
              </button>
              <button
                type="button"
                onClick={() => setPackageFilter(packageFilter === 'monthly' ? 'all' : 'monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  packageFilter === 'monthly'
                    ? 'bg-blue-950/70 text-blue-300 border border-blue-500/40 font-semibold shadow-sm shadow-blue-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                ⚡ Subscription ({packages.filter(isSubscriptionPackage).length})
              </button>
              <button
                type="button"
                onClick={() => setPackageFilter(packageFilter === 'milestone' ? 'all' : 'milestone')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  packageFilter === 'milestone'
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                🛠️ Maintenance ({packages.filter(isMaintenancePackage).length})
              </button>
            </div>
          </div>

          {/* Cards Grid: Direct Editable Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
              const current = getPackageData(pkg);
              const isMonthly = isSubscriptionPackage(current);
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
                  {/* Top Bar with Category Badge & Popular Toggle */}
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                        isMonthly 
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40' 
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      }`}>
                        {isMonthly ? '⚡ Subscription' : '🛠️ Maintenance'}
                      </span>

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

                    {/* Category Selector on Card */}
                    <div className="mb-3">
                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                        Target Section / Category
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleFieldChange(pkg.id, 'cycle', 'monthly')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                            isMonthly
                              ? 'bg-blue-950/70 border-blue-500/70 text-blue-300 font-bold shadow-sm shadow-blue-500/20'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <span>⚡ Subscription</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFieldChange(pkg.id, 'cycle', 'maintenance')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                            !isMonthly
                              ? 'bg-amber-950/70 border-amber-500/70 text-amber-300 font-bold shadow-sm shadow-amber-500/20'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <span>🛠️ Maintenance</span>
                        </button>
                      </div>
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
                          setEditedPackages(prev => {
                            const next = { ...prev };
                            delete next[pkg.id];
                            return next;
                          });
                          triggerToast(`Package "${current.name}" permanently deleted from website & Packages page.`);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-white border border-rose-900/50 hover:border-red-600 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm shadow-rose-950/50"
                      title={`Delete "${current.name}" package permanently from website & Packages page`}
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
      {activeAdminTab === 'plans' && (
        <AdminPlanRequests
          inquiries={inquiries}
          packages={packages}
          onDecide={(id, patch) => {
            if (onPatchInquiry) onPatchInquiry(id, patch);
            else updateInquiryInCloud(id, patch);
            triggerToast(patch.planDecision === 'confirmed' ? 'Plan confirmed. Client countdown started.' : 'Plan rejected.');
          }}
        />
      )}

      {activeAdminTab === 'inquiries' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <AdminContactInbox
            inquiries={inquiries}
            syncError={inquirySyncError}
            isRefreshing={isRefreshingInquiries}
            pushActive={Boolean(pushPermission)}
            pushLoading={pushLoading}
            testBusy={testBusy}
            testResult={testResult}
            onRefresh={handleManualRefreshInquiries}
            onEnablePush={handleEnablePush}
            onTestAlert={handleTestAlert}
            onUpdateStatus={onUpdateInquiryStatus}
            onOpen={(inq) => {
              setSelectedInquiry(inq);
              setEditingNotes(inq.notes || '');
            }}
            onDelete={(inq) => {
              onDeleteInquiry(inq.id);
              triggerToast(`Deleted message from ${inq.clientName}`);
            }}
          />
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
                      const cycle = e.target.value as 'monthly' | 'maintenance';
                      setNewPkgForm({
                        ...newPkgForm,
                        cycle,
                        badge: cycle === 'maintenance' ? 'Essential Care' : 'Special Tier',
                        period: '/month'
                      });
                    }}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                  >
                    <option value="monthly">Subscription</option>
                    <option value="maintenance">Maintenance</option>
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
                    <Gem className="w-3.5 h-3.5 text-emerald-400" />
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
