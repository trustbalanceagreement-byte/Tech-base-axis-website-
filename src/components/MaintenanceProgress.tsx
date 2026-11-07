import React, { useEffect, useState, useMemo } from 'react';
import { ShieldCheck, Hourglass, Activity, CheckCircle2, UserCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MyPlan, fetchMyPlans, fetchAllSystemPlans, getLocalConfirmedPlans } from '../data/planData';
import { ClientInquiry } from '../types';

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

interface MaintenanceProgressProps {
  category?: 'subscription' | 'maintenance';
  inquiries?: ClientInquiry[];
}

const PlanCard: React.FC<{ plan: MyPlan; now: number; isAdminView?: boolean }> = ({ plan, now, isAdminView }) => {
  const start = new Date(plan.planStartAt || 0).getTime();
  const end = new Date(plan.planEndAt || 0).getTime();
  const total = Math.max(end - start, 1);
  const left = Math.max(end - now, 0);
  const pct = Math.min(100, Math.max(0, ((now - start) / total) * 100));

  const days = Math.floor(left / 86400000);
  const hrs = Math.floor((left % 86400000) / 3600000);
  const mins = Math.floor((left % 3600000) / 60000);
  const secs = Math.floor((left % 60000) / 1000);

  const label = plan.selectedPackage || plan.projectType || (plan.planCategory === 'subscription' ? 'Subscription Plan' : 'Standard Maintenance');
  const termLabel = plan.planTerm === 'yearly' ? '1 Year Contract' : '1 Month Contract';
  const startText = plan.planStartAt ? new Date(start).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today';
  const endText = plan.planEndAt ? new Date(end).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '30 Days';

  return (
    <div className="obsidian-card rounded-3xl border border-emerald-500/40 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(16,185,129,0.18)] backdrop-blur-2xl relative overflow-hidden group">
      {/* Top Ambient Emerald Specular Glow Line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981]" />

      {/* Top Header: Badge & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.35)]">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {label}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                {termLabel}
              </span>
            </div>
            <div className="text-xs font-mono text-neutral-400 flex items-center gap-2 mt-0.5 truncate">
              {plan.clientName && (
                <span className="text-neutral-200 font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {plan.clientName}
                </span>
              )}
              {plan.email && (
                <span className="text-neutral-500 truncate">({plan.email})</span>
              )}
              {isAdminView && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-red-950/60 text-[#ff4d5a] border border-red-700/40 font-bold">
                  ADMIN MONITOR
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Beacon Pill */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>SYSTEM ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Markers */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Service Cycle Progress
          </span>
          <span className="font-bold text-emerald-400">
            {Math.round(pct)}% Elapsed ({days} Days Remaining)
          </span>
        </div>

        {/* High-Tech Progress Track */}
        <div
          className="h-3.5 rounded-full bg-neutral-950 border border-neutral-800 p-0.5 overflow-hidden shadow-inner"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-label="Maintenance cycle progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-teal-400 to-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-all duration-1000 relative"
            style={{ width: `${Math.max(2, pct)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none rounded-full" />
          </div>
        </div>

        {/* Micro Markers */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-0.5">
          <span>Started: {startText}</span>
          <span>Expires: {endText}</span>
        </div>
      </div>

      {/* 4-Box Digital Countdown HUD */}
      <div className="mt-5">
        <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          Real-Time Remaining Countdown
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          {[
            { v: days, l: 'Days' },
            { v: hrs, l: 'Hours' },
            { v: mins, l: 'Minutes' },
            { v: secs, l: 'Seconds' }
          ].map((c, idx) => (
            <div
              key={c.l}
              className="rounded-2xl bg-neutral-950/80 border border-neutral-800/90 py-3 sm:py-3.5 px-1 relative overflow-hidden group/box hover:border-emerald-500/40 transition-colors"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
              <div className={`text-xl sm:text-3xl font-extrabold font-mono text-white tabular-nums tracking-tight ${idx === 3 ? 'text-emerald-300' : ''}`}>
                {pad(c.v)}
              </div>
              <div className="text-[9px] sm:text-[11px] uppercase tracking-widest text-emerald-400/80 font-mono font-bold mt-1">
                {c.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Guarantee Note */}
      <div className="mt-4 pt-3.5 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Continuous uptime, security auditing &amp; priority updates by Bikram Ghosh.</span>
        </div>
        <span className="hidden sm:inline text-neutral-500 font-mono">TBA//SECURE-CONTRACT</span>
      </div>
    </div>
  );
};

/** Shows confirmed Subscription/Maintenance plans with a live countdown and progress bar right on the page. */
export const MaintenanceProgress: React.FC<MaintenanceProgressProps> = ({ category, inquiries = [] }) => {
  const { user, isAdmin } = useAuth();
  const email = (user?.email || '').trim().toLowerCase();
  const [plans, setPlans] = useState<MyPlan[]>([]);
  const [now, setNow] = useState(() => Date.now());

  // 1. Sync plans from props, localStorage, and server API
  const refreshPlans = () => {
    // A. Direct resolution from inquiries prop (Instant 0ms in-memory update!)
    const fromInquiries: MyPlan[] = inquiries
      .filter((i) => {
        const isTargetCat = !category || i.planCategory === category || (category === 'maintenance' && (i.timeline === 'Milestone Delivery' || i.projectType?.toLowerCase().includes('maintenance')));
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

    // B. Check localStorage for recently confirmed plans
    const fromLocal = getLocalConfirmedPlans().filter((p) => !category || p.planCategory === category);

    // Merge and deduplicate by ID
    const mergedMap = new Map<string, MyPlan>();
    fromLocal.forEach((p) => mergedMap.set(p.id, p));
    fromInquiries.forEach((p) => mergedMap.set(p.id, p));

    const combined = Array.from(mergedMap.values());
    if (combined.length > 0) {
      setPlans(combined);
    }

    // C. Also query server API for remote updates
    if (isAdmin) {
      fetchAllSystemPlans().then((sysPlans) => {
        const target = category ? sysPlans.filter((p) => p.planCategory === category) : sysPlans;
        if (target.length > 0) {
          target.forEach((p) => mergedMap.set(p.id, p));
          setPlans(Array.from(mergedMap.values()));
        }
      });
    } else if (email) {
      fetchMyPlans(email).then((userPlans) => {
        const target = category ? userPlans.filter((p) => p.planCategory === category) : userPlans;
        if (target.length > 0) {
          target.forEach((p) => mergedMap.set(p.id, p));
          setPlans(Array.from(mergedMap.values()));
        }
      });
    } else {
      fetchAllSystemPlans().then((sysPlans) => {
        const target = category ? sysPlans.filter((p) => p.planCategory === category) : sysPlans;
        if (target.length > 0) {
          target.forEach((p) => mergedMap.set(p.id, p));
          setPlans(Array.from(mergedMap.values()));
        }
      });
    }
  };

  useEffect(() => {
    refreshPlans();
  }, [email, isAdmin, category, inquiries]);

  // 2. Real-time event listeners for instant 0ms update when Admin clicks Confirm
  useEffect(() => {
    const onPlanConfirmed = () => refreshPlans();
    window.addEventListener('tba_plan_confirmed', onPlanConfirmed);
    window.addEventListener('tba_new_inquiry_saved', onPlanConfirmed);
    window.addEventListener('storage', onPlanConfirmed);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('tba_plans_channel');
      bc.onmessage = (e) => {
        if (e.data?.type === 'PLAN_CONFIRMED') {
          refreshPlans();
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

  // 3. Filter plans according to user context
  const activePlans = useMemo(() => {
    return plans.filter((p) => {
      const isConfirmed = p.planDecision === 'confirmed' || Boolean(p.planEndAt);
      const isCurrent = p.planEndAt ? new Date(p.planEndAt).getTime() > now : true;
      const isCategory = !category || p.planCategory === category;
      if (!isConfirmed || !isCurrent || !isCategory) return false;

      // If admin, show all active plans
      if (isAdmin) return true;

      // If logged in as client, match email
      if (email && p.email && p.email.toLowerCase() === email) return true;

      // If guest/visitor, check if it's the latest confirmed plan from local storage or system active
      const local = getLocalConfirmedPlans();
      if (local.some((l) => l.id === p.id)) return true;

      // If user isn't logged in, also show active system plan so admin / client can preview
      return true;
    });
  }, [plans, now, category, isAdmin, email]);

  const pendingPlans = useMemo(() => {
    return plans.filter((p) => {
      if (p.planDecision === 'confirmed') return false;
      const isCategory = !category || p.planCategory === category;
      if (!isCategory) return false;
      if (isAdmin) return true;
      if (email && p.email && p.email.toLowerCase() === email) return true;
      return false;
    });
  }, [plans, category, isAdmin, email]);

  // 4. Second-by-second live countdown ticker
  useEffect(() => {
    if (activePlans.length === 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activePlans.length]);

  if (activePlans.length === 0 && pendingPlans.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="maint-heading" className="space-y-4 max-w-4xl mx-auto w-full my-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-[11px] font-mono tracking-widest text-emerald-400 font-bold uppercase flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          {category === 'subscription' ? 'Active Subscription Contract' : 'Active System Maintenance Contract'}
        </span>
      </div>

      {activePlans.map((p) => (
        <PlanCard key={p.id} plan={p} now={now} isAdminView={isAdmin} />
      ))}

      {pendingPlans.map((p) => (
        <div key={p.id} className="rounded-2xl border border-amber-500/40 bg-amber-950/30 px-4 py-3.5 flex items-center gap-3 text-sm text-amber-200 backdrop-blur-md">
          <Hourglass className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
          <div>
            <div className="font-bold text-amber-100">{p.selectedPackage || p.projectType}: Waiting for Confirmation</div>
            <div className="text-xs text-amber-300/80 font-mono mt-0.5">
              Admin Bikram Ghosh is reviewing your request. Once confirmed, your live countdown and progress bar will start automatically.
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};
