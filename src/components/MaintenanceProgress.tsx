import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Info, ShieldCheck, CheckCircle2, UserCheck, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MyPlan, fetchMyPlans, getLocalConfirmedPlans } from '../data/planData';
import { ClientInquiry, ServicePackage } from '../types';

interface MaintenanceProgressProps {
  category?: 'subscription' | 'maintenance';
  inquiries?: ClientInquiry[];
  packages?: ServicePackage[];
  onSelectPackage?: (pkg: ServicePackage) => void;
}

const formatIsoToYyyyMmDd = (iso?: string): string => {
  if (!iso) {
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() + 1);
    return fallback.toISOString().slice(0, 10);
  }
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return String(iso).slice(0, 10);
  }
};

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

/** 
 * Single Confirmed Plan Card matching EXACT design from Screenshot 2026-11-07 155915.png:
 * - Circular Progress Ring on left with outline Calendar icon in center
 * - "Expiration date ⓘ" header
 * - Large bold "YYYY-MM-DD" date
 * - Vibrant purple "Renew" action button
 */
const ExpirationGaugeCard: React.FC<{
  plan: MyPlan;
  now: number;
  isAdminView?: boolean;
  onRenew?: () => void;
}> = ({ plan, now, isAdminView, onRenew }) => {
  const start = new Date(plan.planStartAt || 0).getTime();
  const end = new Date(plan.planEndAt || 0).getTime();
  const total = Math.max(end - start, 1);
  const elapsed = Math.max(now - start, 0);
  const left = Math.max(end - now, 0);

  // Time elapsed percentage (0% at start -> 100% at expiration)
  const pct = Math.min(100, Math.max(2, (elapsed / total) * 100));

  const days = Math.floor(left / 86400000);
  const hrs = Math.floor((left % 86400000) / 3600000);
  const mins = Math.floor((left % 3600000) / 60000);
  const secs = Math.floor((left % 60000) / 1000);

  const expiryDateFormatted = formatIsoToYyyyMmDd(plan.planEndAt);
  const planTitle = plan.selectedPackage || plan.projectType || 'Standard Maintenance';
  const termLabel = plan.planTerm === 'yearly' ? 'Yearly Plan' : 'Monthly Plan';

  // SVG circular progress parameters (radius = 30, circumference = 2 * PI * 30 ≈ 188.495)
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-[#0e1017]/95 border border-neutral-800 hover:border-teal-500/40 p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(13,148,136,0.18)] backdrop-blur-2xl transition-all duration-300 relative overflow-hidden group">
      {/* Top subtle teal highlight line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0d9488] to-transparent shadow-[0_0_15px_#0d9488]" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* ======================================================== */}
        {/* EXACT DESIGN FROM SCREENSHOT 2026-11-07 155915:          */}
        {/* Left: Circular Progress Ring with Calendar icon inside    */}
        {/* Right: Expiration date ⓘ / YYYY-MM-DD / Renew link       */}
        {/* ======================================================== */}
        <div className="flex items-center gap-5 sm:gap-6 min-w-0">
          {/* Circular Donut Progress Ring */}
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 76 76">
              {/* Background Light Teal Track */}
              <circle
                cx="38"
                cy="38"
                r={radius}
                className="text-[#0d9488]/15"
                stroke="currentColor"
                strokeWidth="5.5"
                fill="transparent"
              />
              {/* Active Teal Progress Stroke */}
              <circle
                cx="38"
                cy="38"
                r={radius}
                className="text-[#0d9488] transition-all duration-1000 ease-out"
                stroke="currentColor"
                strokeWidth="5.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Calendar Icon In The Center (Exact matching outline icon from Screenshot) */}
            <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
              <Calendar className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.65] text-neutral-300" />
            </div>
          </div>

          {/* Details Column: Expiration date ⓘ + Bold YYYY-MM-DD + Purple Renew Link */}
          <div className="flex flex-col justify-center min-w-0">
            {/* Header: "Expiration date ⓘ" */}
            <div className="flex items-center gap-1.5 text-neutral-300 text-sm sm:text-base font-normal">
              <span>Expiration date</span>
              <Info className="w-4 h-4 text-neutral-400 stroke-[2] shrink-0" />
            </div>

            {/* Bold Expiration Date formatted as YYYY-MM-DD */}
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans mt-0.5">
              {expiryDateFormatted}
            </div>

            {/* Purple "Renew" Text Link */}
            <button
              type="button"
              onClick={onRenew}
              className="text-[#8b5cf6] hover:text-[#a78bfa] text-base font-semibold mt-1 text-left cursor-pointer hover:underline transition-colors w-fit flex items-center gap-1"
            >
              <span>Renew</span>
            </button>
          </div>
        </div>

        {/* Live Status & Countdown Sidebar Badge */}
        <div className="flex flex-col sm:items-end justify-center gap-2 border-t sm:border-t-0 sm:border-l border-neutral-800/80 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-wide uppercase">
              Active Maintenance
            </span>
          </div>

          <div className="text-xs font-mono text-neutral-300 font-semibold truncate max-w-[200px]">
            {planTitle}
          </div>

          <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>
              {days}d {pad(hrs)}h {pad(mins)}m {pad(secs)}s left
            </span>
          </div>

          {isAdminView && (
            <div className="text-[10px] font-mono text-[#ff4d5a] bg-red-950/50 border border-red-700/40 rounded px-1.5 py-0.5 mt-1 font-semibold truncate max-w-[200px]">
              Admin Monitor: {plan.clientName || 'Client'} ({plan.email})
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Shows the confirmed Maintenance expiration card ONLY to the user who booked Maintenance
 * (matched by their account email or device booking). Admins do not see other clients' plans here.
 */
export const MaintenanceProgress: React.FC<MaintenanceProgressProps> = ({
  category = 'maintenance',
  inquiries = [],
  packages = [],
  onSelectPackage
}) => {
  const { user, isAdmin } = useAuth();
  const loggedInEmail = (user?.email || '').trim().toLowerCase();
  const [plans, setPlans] = useState<MyPlan[]>([]);
  const [now, setNow] = useState(() => Date.now());

  // Check device-stored booking email if user isn't logged in with Firebase yet
  const [clientStoredEmail, setClientStoredEmail] = useState<string>(() => {
    try {
      return (localStorage.getItem('tba_client_email') || '').trim().toLowerCase();
    } catch {
      return '';
    }
  });

  // Effective target email for this browser session
  const effectiveEmail = loggedInEmail || clientStoredEmail;

  const refreshPlans = () => {
    // 1. Direct resolution from inquiries prop (Instant 0ms in-memory update!)
    const fromInquiries: MyPlan[] = inquiries
      .filter((i) => {
        const isTargetCat =
          !category ||
          i.planCategory === category ||
          (category === 'maintenance' &&
            (i.timeline === 'Milestone Delivery' ||
              i.projectType?.toLowerCase().includes('maintenance') ||
              i.selectedPackage?.toLowerCase().includes('maintenance') ||
              i.selectedPackage?.toLowerCase().includes('standard') ||
              i.selectedPackage?.toLowerCase().includes('premium')));

        return isTargetCat && (i.planDecision === 'confirmed' || i.status === 'In Development') && Boolean(i.planEndAt);
      })
      .map((i) => ({
        id: i.id,
        clientName: i.clientName,
        email: i.email,
        phone: i.phone,
        selectedPackage: i.selectedPackage,
        projectType: i.projectType,
        planCategory: (i.planCategory || category || 'maintenance') as 'subscription' | 'maintenance',
        planTerm: i.planTerm || 'monthly',
        planDecision: 'confirmed' as const,
        planStartAt: i.planStartAt,
        planEndAt: i.planEndAt,
        totalPrice: i.totalPrice,
        status: i.status
      }));

    // 2. Check localStorage for recently confirmed plans
    const fromLocal = getLocalConfirmedPlans().filter((p) => !category || p.planCategory === category);

    // Merge and deduplicate by ID
    const mergedMap = new Map<string, MyPlan>();
    fromLocal.forEach((p) => mergedMap.set(p.id, p));
    fromInquiries.forEach((p) => mergedMap.set(p.id, p));

    const combined = Array.from(mergedMap.values());
    if (combined.length > 0) {
      setPlans(combined);
    }

    // 3. Remote server fetch
    // Everyone (admin included) only ever loads plans booked with their own email.
    if (effectiveEmail) {
      fetchMyPlans(effectiveEmail).then((userPlans) => {
        const target = category ? userPlans.filter((p) => p.planCategory === category) : userPlans;
        if (target.length > 0) {
          target.forEach((p) => mergedMap.set(p.id, p));
          setPlans(Array.from(mergedMap.values()));
        }
      });
    }
  };

  useEffect(() => {
    refreshPlans();
  }, [effectiveEmail, isAdmin, category, inquiries]);

  // Real-time event listeners for 0ms broadcast when Admin clicks Confirm
  useEffect(() => {
    const onPlanConfirmed = () => {
      try {
        const stored = (localStorage.getItem('tba_client_email') || '').trim().toLowerCase();
        if (stored) setClientStoredEmail(stored);
      } catch (_) {}
      refreshPlans();
    };

    window.addEventListener('tba_plan_confirmed', onPlanConfirmed);
    window.addEventListener('tba_new_inquiry_saved', onPlanConfirmed);
    window.addEventListener('storage', onPlanConfirmed);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('tba_plans_channel');
      bc.onmessage = (e) => {
        if (e.data?.type === 'PLAN_CONFIRMED') {
          onPlanConfirmed();
        }
      };
    } catch (_) {}

    return () => {
      window.removeEventListener('tba_plan_confirmed', onPlanConfirmed);
      window.removeEventListener('tba_new_inquiry_saved', onPlanConfirmed);
      window.removeEventListener('storage', onPlanConfirmed);
      if (bc) bc.close();
    };
  }, []);

  // Poll every 15s so a confirm from the admin appears without a manual refresh
  useEffect(() => {
    const t = setInterval(() => refreshPlans(), 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveEmail, category, inquiries]);

  // 1-second live ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter plans strictly for the user who booked Maintenance (or admin)
  const activePlans = useMemo(() => {
    return plans.filter((p) => {
      const isConfirmed = p.planDecision === 'confirmed' || Boolean(p.planEndAt);
      const isCurrent = p.planEndAt ? new Date(p.planEndAt).getTime() > now : true;
      const isCategory = !category || p.planCategory === category;
      if (!isConfirmed || !isCurrent || !isCategory) return false;

      // Strict account filter: only the user who booked this plan sees it (admins do not see clients' plans).
      const planEmail = String(p.email || '').trim().toLowerCase();
      if (loggedInEmail && planEmail === loggedInEmail) return true;
      if (clientStoredEmail && planEmail === clientStoredEmail) return true;

      return false;
    });
  }, [plans, now, category, isAdmin, loggedInEmail, clientStoredEmail]);

  // If this user has no confirmed maintenance plan, do NOT display this section!
  if (activePlans.length === 0) {
    return null;
  }

  const handleRenewForPlan = (plan: MyPlan) => {
    if (onSelectPackage && packages && packages.length > 0) {
      const name = (plan.selectedPackage || plan.projectType || '').toLowerCase();
      const matched =
        packages.find((pkg) => name.includes(pkg.name.toLowerCase())) ||
        packages.find((pkg) => pkg.category === 'maintenance' || pkg.name.toLowerCase().includes('maintenance')) ||
        packages[0];
      onSelectPackage(matched);
    } else {
      const el = document.getElementById('packages-filter-milestone');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      {activePlans.map((p) => (
        <ExpirationGaugeCard
          key={p.id}
          plan={p}
          now={now}
          isAdminView={false}
          onRenew={() => handleRenewForPlan(p)}
        />
      ))}
    </div>
  );
};
