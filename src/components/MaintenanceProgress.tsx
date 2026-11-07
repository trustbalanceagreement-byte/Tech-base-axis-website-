import React, { useEffect, useState } from 'react';
import { ShieldCheck, Hourglass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMyPlans, MyPlan } from '../data/planData';

const pad = (n: number) => String(n).padStart(2, '0');

const PlanCard: React.FC<{ plan: MyPlan; now: number }> = ({ plan, now }) => {
  const start = new Date(plan.planStartAt || 0).getTime();
  const end = new Date(plan.planEndAt || 0).getTime();
  const total = Math.max(end - start, 1);
  const left = Math.max(end - now, 0);
  const pct = Math.min(100, Math.max(0, ((now - start) / total) * 100));

  const days = Math.floor(left / 86400000);
  const hrs = Math.floor((left % 86400000) / 3600000);
  const mins = Math.floor((left % 3600000) / 60000);
  const secs = Math.floor((left % 60000) / 1000);
  const label = plan.selectedPackage || plan.projectType || 'Maintenance plan';
  const termLabel = plan.planTerm === 'yearly' ? 'Yearly' : 'Monthly';
  const endText = new Date(end).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="obsidian-card rounded-2xl border border-emerald-700/30 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white truncate">{label}</div>
            <div className="text-[11px] font-mono text-neutral-400">{termLabel} {plan.planCategory === 'subscription' ? 'subscription' : 'maintenance'} · active</div>
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-600/40">
          {Math.round(pct)}%
        </span>
      </div>

      <div
        className="mt-5 h-3 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label="Plan time elapsed"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-[width] duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[
          { v: days, l: 'Days' },
          { v: hrs, l: 'Hours' },
          { v: mins, l: 'Mins' },
          { v: secs, l: 'Secs' }
        ].map((c) => (
          <div key={c.l} className="rounded-xl bg-neutral-900/80 border border-neutral-800 py-2">
            <div className="text-lg sm:text-2xl font-bold text-white font-mono tabular-nums">{pad(c.v)}</div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">{c.l}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] font-mono text-neutral-500">Ends on {endText}</p>
    </div>
  );
};

/** Shows the logged-in user's confirmed Subscription/Maintenance plans with a live countdown. Hidden when none are active. */
export const MaintenanceProgress: React.FC<{ category?: 'subscription' | 'maintenance' }> = ({ category }) => {
  const { user } = useAuth();
  const email = user?.email || '';
  const [plans, setPlans] = useState<MyPlan[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!email) {
      setPlans([]);
      return;
    }
    let alive = true;
    const load = () => fetchMyPlans(email).then((p) => alive && setPlans(p));
    load();
    const t = setInterval(load, 20000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [email]);

  const mine = category ? plans.filter((p) => p.planCategory === category) : plans;
  const active = mine.filter(
    (p) => p.planDecision === 'confirmed' && p.planEndAt && new Date(p.planEndAt).getTime() > now
  );
  const pending = mine.filter((p) => (p.planDecision || 'pending') === 'pending');

  useEffect(() => {
    if (active.length === 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active.length]);

  if (active.length === 0 && pending.length === 0) return null;

  return (
    <section aria-labelledby="maint-heading" className="space-y-4 max-w-2xl mx-auto w-full">
      <h2 id="maint-heading" className="text-lg sm:text-xl font-bold text-white text-center">{category === 'subscription' ? 'Your Subscription' : 'Your Maintenance Plan'}</h2>
      {active.map((p) => <PlanCard key={p.id} plan={p} now={now} />)}
      {pending.map((p) => (
        <div key={p.id} className="rounded-2xl border border-amber-700/30 bg-amber-950/20 px-4 py-3 flex items-center gap-3 text-sm text-amber-200">
          <Hourglass className="w-4 h-4 shrink-0" />
          <span>{p.selectedPackage || p.projectType}: waiting for confirmation from Tech Base Axis.</span>
        </div>
      ))}
    </section>
  );
};
