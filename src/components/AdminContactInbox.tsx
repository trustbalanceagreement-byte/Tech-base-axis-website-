import React, { useMemo, useState } from 'react';
import {
  Bell,
  Calendar,
  Calculator,
  Eye,
  Inbox,
  Mail,
  MessageSquare,
  Package,
  Phone,
  RotateCcw,
  Search,
  Trash2
} from 'lucide-react';
import { ClientInquiry } from '../types';

type TypeKey = 'all' | 'appointment' | 'quote' | 'enquiry' | 'booking';

const STATUSES: ClientInquiry['status'][] = ['New', 'Reviewing', 'Proposal Sent', 'In Development', 'Completed'];

const TYPE_META: Record<Exclude<TypeKey, 'all'>, { label: string; icon: React.ElementType; tone: string }> = {
  appointment: { label: 'Appointment', icon: Calendar, tone: 'text-purple-300 bg-purple-950/50 border-purple-700/50' },
  quote: { label: 'Get Quote', icon: Calculator, tone: 'text-amber-300 bg-amber-950/50 border-amber-700/50' },
  enquiry: { label: 'Enquiry', icon: MessageSquare, tone: 'text-sky-300 bg-sky-950/50 border-sky-700/50' },
  booking: { label: 'Package', icon: Package, tone: 'text-red-300 bg-red-950/50 border-red-700/50' }
};

const STATUS_TONE: Record<string, string> = {
  New: 'bg-red-500',
  Reviewing: 'bg-amber-400',
  'Proposal Sent': 'bg-sky-400',
  'In Development': 'bg-violet-400',
  Completed: 'bg-emerald-400'
};

export function inquiryTypeOf(i: ClientInquiry): Exclude<TypeKey, 'all'> {
  if (i.eventType === 'appointment') return 'appointment';
  if (i.eventType === 'quote_request') return 'quote';
  if (i.eventType === 'package_booking' || i.eventType === 'payment_success') return 'booking';
  return 'enquiry';
}

interface Props {
  inquiries: ClientInquiry[];
  syncError?: string | null;
  isRefreshing: boolean;
  pushActive: boolean;
  pushLoading: boolean;
  testBusy: boolean;
  testResult: { ok: boolean; text: string } | null;
  onRefresh: () => void;
  onEnablePush: () => void;
  onTestAlert: () => void;
  onUpdateStatus: (id: string, status: ClientInquiry['status']) => void;
  onOpen: (inq: ClientInquiry) => void;
  onDelete: (inq: ClientInquiry) => void;
}

export const AdminContactInbox: React.FC<Props> = (p) => {
  const [type, setType] = useState<TypeKey>('all');
  const [status, setStatus] = useState<string>('All');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const c: Record<TypeKey, number> = { all: p.inquiries.length, appointment: 0, quote: 0, enquiry: 0, booking: 0 };
    p.inquiries.forEach((i) => { c[inquiryTypeOf(i)]++; });
    return c;
  }, [p.inquiries]);

  const newCount = p.inquiries.filter((i) => i.status === 'New').length;
  const activeCount = p.inquiries.filter((i) => i.status === 'Proposal Sent' || i.status === 'In Development').length;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...p.inquiries]
      .filter((i) => type === 'all' || inquiryTypeOf(i) === type)
      .filter((i) => status === 'All' || i.status === status)
      .filter((i) => !q || [i.clientName, i.email, i.company, i.projectType, i.details, i.phone].some((v) => (v || '').toLowerCase().includes(q)))
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [p.inquiries, type, status, query]);

  const tabs: { key: TypeKey; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: 'All', icon: Inbox },
    { key: 'appointment', label: 'Appointments', icon: Calendar },
    { key: 'quote', label: 'Quotes', icon: Calculator },
    { key: 'enquiry', label: 'Enquiries', icon: MessageSquare },
    { key: 'booking', label: 'Packages', icon: Package }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="obsidian-card rounded-2xl border border-neutral-800 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-red-950/60 border border-red-700/40 text-[#e61e2b] flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">Contact Inbox</h2>
              <p className="text-xs text-neutral-400 font-mono">
                Everything sent from the Contact page: appointments, quotes and enquiries.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-4 mr-1 text-xs font-mono">
              <span className="text-neutral-400"><b className="text-white text-base">{counts.all}</b> total</span>
              <span className="text-neutral-400"><b className="text-red-400 text-base">{newCount}</b> new</span>
              <span className="text-neutral-400"><b className="text-emerald-400 text-base">{activeCount}</b> active</span>
            </div>
            <button
              type="button"
              onClick={p.onRefresh}
              disabled={p.isRefreshing}
              className="px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${p.isRefreshing ? 'animate-spin text-red-400' : 'text-neutral-400'}`} />
              {p.isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={p.onEnablePush}
              disabled={p.pushLoading}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border cursor-pointer ${
                p.pushActive
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                  : 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              {p.pushActive ? 'Push Alerts Active' : 'Enable Push Alerts'}
            </button>
            <button
              type="button"
              onClick={p.onTestAlert}
              disabled={p.testBusy}
              className="px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 disabled:opacity-50 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              {p.testBusy ? 'Sending...' : 'Send Test Alert'}
            </button>
          </div>
        </div>

        {p.syncError && (
          <div className="mt-4 text-xs font-mono px-3 py-2 rounded-lg border leading-relaxed bg-amber-950/40 text-amber-300 border-amber-700/40">
            Cloud inquiries could not be loaded ({p.syncError}). Publish the latest firestore.rules and redeploy on Vercel. Until then only inquiries from this device are shown.
          </div>
        )}
        {p.testResult && (
          <div className={`mt-4 text-xs font-mono px-3 py-2 rounded-lg border leading-relaxed ${p.testResult.ok ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/40' : 'bg-rose-950/50 text-rose-300 border-rose-700/50'}`}>
            {p.testResult.text}
          </div>
        )}

        {/* Type tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const on = type === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setType(t.key)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono border transition-colors cursor-pointer ${
                  on ? 'bg-[#e61e2b] text-white border-[#e61e2b]' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                <span className={`px-1.5 rounded-md text-[10px] ${on ? 'bg-black/25' : 'bg-neutral-800'}`}>{counts[t.key]}</span>
              </button>
            );
          })}
        </div>

        {/* Search + status */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone or message"
              className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#e61e2b]"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#e61e2b]"
          >
            <option value="All">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Cards */}
      {rows.length === 0 ? (
        <div className="obsidian-card rounded-2xl border border-dashed border-neutral-800 py-14 text-center">
          <Inbox className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
          <p className="text-sm text-neutral-400 font-mono">No messages here yet.</p>
          <p className="text-xs text-neutral-600 font-mono mt-1">New requests from the Contact page will appear instantly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {rows.map((i) => {
            const meta = TYPE_META[inquiryTypeOf(i)];
            const Icon = meta.icon;
            return (
              <div key={i.id} className="obsidian-card rounded-2xl border border-neutral-800 hover:border-neutral-700 p-4 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {(i.clientName || '?').trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white truncate">{i.clientName}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border ${meta.tone}`}>
                        <Icon className="w-3 h-3" /> {meta.label}
                      </span>
                      {i.status === 'New' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="New" />}
                    </div>
                    <div className="text-xs font-mono text-[#e61e2b] truncate">{i.email}</div>
                    <div className="text-[11px] font-mono text-neutral-500 flex flex-wrap gap-x-3 mt-0.5">
                      {i.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{i.phone}</span>}
                      {i.company && <span>{i.company}</span>}
                      {i.createdAt && <span>{new Date(i.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-neutral-200 font-medium">{i.projectType}{i.selectedPackage ? ` · ${i.selectedPackage}` : ''}</div>
                {i.details && <p className="mt-1 text-xs text-neutral-400 leading-relaxed line-clamp-2">{i.details}</p>}

                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-mono">
                  {i.appointmentDate && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-950/40 text-amber-300 border border-amber-800/40">
                      {i.appointmentDate}{i.appointmentTime ? ` · ${i.appointmentTime}` : ''}
                    </span>
                  )}
                  {i.budgetRange && <span className="px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-800">{i.budgetRange}</span>}
                  {i.timeline && <span className="px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800">{i.timeline}</span>}
                  {i.addOns && i.addOns.length > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/50 text-emerald-300 border border-emerald-700/40">+{i.addOns.length} add-on{i.addOns.length > 1 ? 's' : ''}</span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${STATUS_TONE[i.status] || 'bg-neutral-500'}`} />
                    <select
                      value={i.status}
                      onChange={(e) => p.onUpdateStatus(i.id, e.target.value as ClientInquiry['status'])}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#e61e2b]"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => p.onOpen(i)} title="View full brief" className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 cursor-pointer">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a href={`mailto:${i.email}?subject=Tech%20Base%20Axis%20-%20Regarding%20Your%20Request`} title="Reply via email" className="p-2 rounded-lg bg-neutral-900 hover:bg-red-950/40 text-[#e61e2b] border border-neutral-800">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                    <button type="button" onClick={() => p.onDelete(i)} title="Delete" className="p-2 rounded-lg bg-neutral-900 hover:bg-rose-950/60 text-neutral-500 hover:text-rose-400 border border-neutral-800 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
