import React, { useMemo, useState } from 'react';
import { Check, Clock, Layers, Wrench, X } from 'lucide-react';
import { ClientInquiry, ServicePackage } from '../types';
import { getPackageCategory, getPackageTerm } from '../data/pricingData';
import { confirmPlanPatch, rejectPlanPatch } from '../data/planData';

type Cat = 'subscription' | 'maintenance';
type Dec = 'pending' | 'confirmed' | 'rejected';

interface Props {
  inquiries: ClientInquiry[];
  packages?: ServicePackage[];
  onDecide: (id: string, patch: Partial<ClientInquiry>) => void;
}

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const BOOKING_EVENTS = ['package_booking', 'payment_success'];

export const AdminPlanRequests: React.FC<Props> = ({ inquiries, packages = [], onDecide }) => {
  const [cat, setCat] = useState<Cat>('subscription');
  const [dec, setDec] = useState<Dec>('pending');
  const [terms, setTerms] = useState<Record<string, 'monthly' | 'yearly'>>({});

  // Include every package booking, even older ones saved before plan tracking existed.
  const plans = useMemo(() => {
    const out: ClientInquiry[] = [];
    for (const i of inquiries) {
      if (i.planCategory) {
        out.push(i);
        continue;
      }
      const isBooking = BOOKING_EVENTS.includes(i.eventType || '') || i.company === 'Direct Package Booking';
      if (!isBooking) continue;
      const name = String(i.selectedPackage || i.projectType || '').replace(/\s*\(₹.*$/, '').trim().toLowerCase();
      const pkg = (packages as ServicePackage[]).find((p) => p.name.trim().toLowerCase() === name);
      const category = pkg ? getPackageCategory(pkg) : i.timeline === 'Monthly Retainer' ? 'subscription' : 'maintenance';
      const term = pkg ? getPackageTerm(pkg.period) : 'monthly';
      out.push({ ...i, planCategory: category, planTerm: term });
    }
    return out;
  }, [inquiries, packages]);
  const decisionOf = (i: ClientInquiry): Dec => i.planDecision || 'pending';
  const count = (c: Cat, d?: Dec) => plans.filter((i) => i.planCategory === c && (!d || decisionOf(i) === d)).length;

  const rows = plans
    .filter((i) => i.planCategory === cat && decisionOf(i) === dec)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

  const cats: { key: Cat; label: string; icon: React.ElementType }[] = [
    { key: 'subscription', label: 'Subscription Plans', icon: Layers },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench }
  ];
  const decs: { key: Dec; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="space-y-4">
      <div className="obsidian-card rounded-2xl border border-neutral-800 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-950/60 border border-red-700/40 text-[#e61e2b] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Plan Requests</h2>
            <p className="text-xs text-neutral-400 font-mono">
              Subscription and Maintenance bookings from the Packages page. Confirm to start the client's countdown.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {cats.map((c) => {
            const Icon = c.icon;
            const on = cat === c.key;
            const pend = count(c.key, 'pending');
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCat(c.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono border cursor-pointer ${
                  on ? 'bg-[#e61e2b] text-white border-[#e61e2b]' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {c.label}
                <span className={`px-1.5 rounded-md text-[10px] ${on ? 'bg-black/25' : 'bg-neutral-800'}`}>{count(c.key)}</span>
                {pend > 0 && <span className="px-1.5 rounded-md text-[10px] bg-amber-500 text-black font-bold">{pend} new</span>}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {decs.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDec(d.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono border cursor-pointer ${
                dec === d.key ? 'bg-neutral-800 text-white border-neutral-600' : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-white'
              }`}
            >
              {d.label} ({count(cat, d.key)})
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="obsidian-card rounded-2xl border border-dashed border-neutral-800 py-12 text-center text-sm text-neutral-500 font-mono">
          No {dec} {cat === 'subscription' ? 'subscription' : 'maintenance'} requests.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {rows.map((i) => {
            const term = terms[i.id] || i.planTerm || 'monthly';
            return (
              <div key={i.id} className="obsidian-card rounded-2xl border border-neutral-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{i.clientName}</div>
                    <div className="text-xs font-mono text-[#e61e2b] truncate">{i.email}</div>
                    {i.phone && <div className="text-[11px] font-mono text-neutral-500">{i.phone}</div>}
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono border border-neutral-700 text-neutral-300">
                    {i.paymentStatus === 'paid' ? 'PAID' : 'PAYMENT UNVERIFIED'}
                  </span>
                </div>
                <div className="mt-3 text-sm text-neutral-200 font-medium">{i.selectedPackage || i.projectType}</div>
                <div className="mt-1 text-[11px] font-mono text-neutral-500">
                  Requested {fmt(i.createdAt)}
                  {i.totalPrice ? ` · ₹${Number(i.totalPrice).toLocaleString('en-IN')}` : ''}
                </div>

                {dec === 'pending' && (
                  <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2">
                    <label className="text-[11px] font-mono text-neutral-400 flex items-center gap-2">
                      Duration
                      <select
                        value={term}
                        onChange={(e) => setTerms((t) => ({ ...t, [i.id]: e.target.value as 'monthly' | 'yearly' }))}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-neutral-200"
                      >
                        <option value="monthly">1 month</option>
                        <option value="yearly">1 year</option>
                      </select>
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onDecide(i.id, { ...rejectPlanPatch(), planCategory: i.planCategory })}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 bg-neutral-900 hover:bg-rose-950/60 text-rose-300 border border-rose-800/50 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const patch = { ...confirmPlanPatch(term), planCategory: i.planCategory || 'maintenance' };
                          onDecide(i.id, patch);

                          try {
                            const confirmedObj = {
                              id: i.id,
                              clientName: i.clientName,
                              email: i.email,
                              phone: i.phone,
                              selectedPackage: i.selectedPackage,
                              projectType: i.projectType,
                              planCategory: i.planCategory || 'maintenance',
                              planTerm: term,
                              planDecision: 'confirmed',
                              planStartAt: patch.planStartAt,
                              planEndAt: patch.planEndAt,
                              totalPrice: i.totalPrice,
                              status: patch.status
                            };
                            localStorage.setItem('tba_latest_confirmed_plan', JSON.stringify(confirmedObj));
                            
                            // Also update list of all confirmed plans in localStorage
                            const existingListRaw = localStorage.getItem('tba_active_confirmed_plans');
                            const existingList = existingListRaw ? JSON.parse(existingListRaw) : [];
                            const updatedList = [confirmedObj, ...existingList.filter((x: any) => x.id !== i.id)];
                            localStorage.setItem('tba_active_confirmed_plans', JSON.stringify(updatedList));

                            // Broadcast locally for instant 0ms update in same/other tabs
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new CustomEvent('tba_plan_confirmed', { detail: confirmedObj }));
                              try {
                                const bc = new BroadcastChannel('tba_plans_channel');
                                bc.postMessage({ type: 'PLAN_CONFIRMED', data: confirmedObj });
                                bc.close();
                              } catch (_) {}
                            }
                          } catch (_) {}
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer transition-all"
                      >
                        <Check className="w-3.5 h-3.5" /> Confirm
                      </button>
                    </div>
                  </div>
                )}
                {dec === 'confirmed' && (
                  <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] font-mono text-emerald-300">
                    Active {fmt(i.planStartAt)} → {fmt(i.planEndAt)} ({i.planTerm === 'yearly' ? '1 year' : '1 month'})
                  </div>
                )}
                {dec === 'rejected' && (
                  <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] font-mono text-rose-300">
                    Rejected {fmt(i.planDecidedAt)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
