import React, { useMemo, useState, useEffect } from 'react';
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
  Trash2,
  Star,
  UserCheck,
  Wrench,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Send
} from 'lucide-react';
import { ClientInquiry } from '../types';
import { getDeviceInfoString, getAdminPushSubscriptionId } from '../utils/onesignal';

export type TypeKey = 'all' | 'inquiry' | 'review' | 'booking' | 'account' | 'appointment' | 'maintenance';

const STATUSES: ClientInquiry['status'][] = ['New', 'Reviewing', 'Proposal Sent', 'In Development', 'Completed'];

export const TYPE_META: Record<Exclude<TypeKey, 'all'>, { label: string; icon: React.ElementType; tone: string }> = {
  inquiry: { label: 'Inquiry Message', icon: MessageSquare, tone: 'text-sky-300 bg-sky-950/50 border-sky-700/50' },
  review: { label: 'Review Message', icon: Star, tone: 'text-yellow-300 bg-yellow-950/50 border-yellow-700/50' },
  booking: { label: 'Booking Confirmation', icon: Package, tone: 'text-rose-300 bg-rose-950/50 border-rose-700/50' },
  account: { label: 'New Account', icon: UserCheck, tone: 'text-emerald-300 bg-emerald-950/50 border-emerald-700/50' },
  appointment: { label: 'Appointment', icon: Calendar, tone: 'text-purple-300 bg-purple-950/50 border-purple-700/50' },
  maintenance: { label: 'Maintenance Message', icon: Wrench, tone: 'text-amber-300 bg-amber-950/50 border-amber-700/50' }
};

const STATUS_TONE: Record<string, string> = {
  New: 'bg-red-500',
  Reviewing: 'bg-amber-400',
  'Proposal Sent': 'bg-sky-400',
  'In Development': 'bg-violet-400',
  Completed: 'bg-emerald-400'
};

export function inquiryTypeOf(i: ClientInquiry): Exclude<TypeKey, 'all'> {
  const ev = (i.eventType || '').toLowerCase();
  const proj = (i.projectType || '').toLowerCase();
  const notes = (i.notes || '').toLowerCase();

  if (ev === 'appointment' || ev === 'appointment_booked' || ev === 'book_appointment' || proj.includes('appointment')) {
    return 'appointment';
  }
  if (ev === 'review_submitted' || ev === 'review_message' || proj.includes('review') || proj.includes('feedback')) {
    return 'review';
  }
  if (ev === 'package_booking' || ev === 'booking_confirmation' || ev === 'payment_success' || i.company === 'Direct Package Booking') {
    return 'booking';
  }
  if (ev === 'account_created' || ev === 'user_signup' || ev === 'new_account' || proj.includes('new account')) {
    return 'account';
  }
  if (ev === 'maintenance_message' || ev === 'maintenance_alert' || ev === 'maintenance_request' || proj.includes('maintenance')) {
    return 'maintenance';
  }
  return 'inquiry';
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
  onTestAlert: (eventType?: string) => void;
  onUpdateStatus: (id: string, status: ClientInquiry['status']) => void;
  onOpen: (inq: ClientInquiry) => void;
  onDelete: (inq: ClientInquiry) => void;
}

export const AdminContactInbox: React.FC<Props> = (p) => {
  const [type, setType] = useState<TypeKey>('all');
  const [status, setStatus] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [deviceInfoText, setDeviceInfoText] = useState<string>('Logged-in Device');

  useEffect(() => {
    setDeviceInfoText(getDeviceInfoString());
    getAdminPushSubscriptionId().then((id) => {
      if (id) setCurrentDeviceId(id);
    });
  }, []);

  const counts = useMemo(() => {
    const c: Record<TypeKey, number> = { 
      all: p.inquiries.length, 
      inquiry: 0, 
      review: 0, 
      booking: 0, 
      account: 0, 
      appointment: 0, 
      maintenance: 0 
    };
    p.inquiries.forEach((i) => { 
      const t = inquiryTypeOf(i);
      c[t] = (c[t] || 0) + 1; 
    });
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
    { key: 'all', label: 'All Messages', icon: Inbox },
    { key: 'inquiry', label: 'Inquiries', icon: MessageSquare },
    { key: 'review', label: 'Reviews', icon: Star },
    { key: 'booking', label: 'Bookings', icon: Package },
    { key: 'account', label: 'New Accounts', icon: UserCheck },
    { key: 'appointment', label: 'Appointments', icon: Calendar },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench }
  ];

  const testCategories: { key: string; label: string; icon: React.ElementType; tone: string }[] = [
    { key: 'inquiry_message', label: 'Inquiry Message', icon: MessageSquare, tone: 'hover:border-sky-500/50 hover:bg-sky-950/30 text-sky-300' },
    { key: 'review_message', label: 'Review Message', icon: Star, tone: 'hover:border-yellow-500/50 hover:bg-yellow-950/30 text-yellow-300' },
    { key: 'booking_confirmation', label: 'Booking Confirmation', icon: Package, tone: 'hover:border-rose-500/50 hover:bg-rose-950/30 text-rose-300' },
    { key: 'account_created', label: 'New Account', icon: UserCheck, tone: 'hover:border-emerald-500/50 hover:bg-emerald-950/30 text-emerald-300' },
    { key: 'appointment', label: 'Book Appointment', icon: Calendar, tone: 'hover:border-purple-500/50 hover:bg-purple-950/30 text-purple-300' },
    { key: 'maintenance_message', label: 'Maintenance Message', icon: Wrench, tone: 'hover:border-amber-500/50 hover:bg-amber-950/30 text-amber-300' }
  ];

  return (
    <div className="space-y-4">
      {/* Active Device Push Restriction Card */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0c0d12] p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Strict Admin Device Push Routing Active</span>
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans max-w-2xl">
              Push notifications for <strong className="text-white">Inquiry, Review, Booking confirmation, New account, Book appointment,</strong> and <strong className="text-white">Maintenance</strong> messages are routed exclusively to the device where the Admin is currently logged in. Non-admin visitors and logged-out devices receive nothing.
            </p>
            <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2 flex-wrap pt-0.5">
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-[#e61e2b]" />
                <span>{deviceInfoText}</span>
              </span>
              {currentDeviceId && (
                <span className="text-neutral-500 truncate max-w-xs" title={currentDeviceId}>
                  Sub ID: {currentDeviceId.slice(0, 8)}...{currentDeviceId.slice(-6)}
                </span>
              )}
            </div>
          </div>

          {/* Quick Push Test Actions */}
          <div className="shrink-0 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={p.onEnablePush}
              disabled={p.pushLoading}
              className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                p.pushActive
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900/60'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{p.pushActive ? 'Push Alerts Allowed' : 'Enable Push on this Device'}</span>
            </button>

            <button
              type="button"
              onClick={() => p.onTestAlert('inquiry_message')}
              disabled={p.testBusy}
              className="px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 disabled:opacity-50 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>{p.testBusy ? 'Sending...' : 'Test Quick Alert'}</span>
            </button>
          </div>
        </div>

        {/* 6 Interactive Test Push Buttons */}
        <div className="mt-4 pt-3.5 border-t border-neutral-800/80">
          <div className="text-[11px] font-mono text-neutral-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>Test-send push notification to this device by message type:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {testCategories.map((tc) => {
              const Icon = tc.icon;
              return (
                <button
                  key={tc.key}
                  type="button"
                  onClick={() => p.onTestAlert(tc.key)}
                  disabled={p.testBusy}
                  className={`p-2 rounded-xl text-[11px] font-mono text-left bg-neutral-900/90 border border-neutral-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${tc.tone}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tc.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {p.testResult && (
          <div className={`mt-3.5 text-xs font-mono px-3.5 py-2.5 rounded-xl border leading-relaxed ${p.testResult.ok ? 'bg-emerald-950/50 text-emerald-300 border-emerald-600/50 shadow-sm' : 'bg-rose-950/60 text-rose-300 border-rose-600/50'}`}>
            {p.testResult.text}
          </div>
        )}
      </div>

      {/* Main Inbox Header & Controls */}
      <div className="obsidian-card rounded-2xl border border-neutral-800 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-red-950/60 border border-red-700/40 text-[#e61e2b] flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">Central Admin Dispatch Inbox</h2>
              <p className="text-xs text-neutral-400 font-mono">
                Consolidated real-time feed: Inquiries, Reviews, Bookings, New Accounts, Appointments &amp; Maintenance.
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
              className="px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 disabled:opacity-50 cursor-pointer transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${p.isRefreshing ? 'animate-spin text-red-400' : 'text-neutral-400'}`} />
              <span>{p.isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {p.syncError && (
          <div className="text-xs font-mono px-3 py-2 rounded-lg border leading-relaxed bg-amber-950/40 text-amber-300 border-amber-700/40">
            Cloud inquiries notice ({p.syncError}). Retrying from local storage and cloud mirrors.
          </div>
        )}

        {/* 6 Category Tabs + All */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const on = type === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setType(t.key)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                  on 
                    ? 'bg-[#e61e2b] text-white border-[#e61e2b] shadow-md shadow-red-600/30' 
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${on ? 'bg-black/30 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                  {counts[t.key] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + status filter */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by client name, email, phone, keyword or message content..."
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

      {/* Messages Feed */}
      {rows.length === 0 ? (
        <div className="obsidian-card rounded-2xl border border-dashed border-neutral-800 py-14 text-center">
          <Inbox className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
          <p className="text-sm text-neutral-400 font-mono">No messages found in this category.</p>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            Incoming inquiries, reviews, bookings, accounts, appointments &amp; maintenance messages will appear instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
          {rows.map((i) => {
            const currentType = inquiryTypeOf(i);
            const meta = TYPE_META[currentType] || TYPE_META.inquiry;
            const Icon = meta.icon;
            return (
              <div key={i.id} className="obsidian-card rounded-2xl border border-neutral-800 hover:border-neutral-700 p-4 sm:p-5 transition-all space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm">
                    {(i.clientName || '?').trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white truncate text-sm">{i.clientName}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border ${meta.tone}`}>
                        <Icon className="w-3 h-3" />
                        <span>{meta.label}</span>
                      </span>
                      {i.status === 'New' && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-red-950 text-red-300 border border-red-800/60 animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-[#e61e2b] truncate mt-0.5">{i.email}</div>
                    <div className="text-[11px] font-mono text-neutral-500 flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      {i.phone && (
                        <span className="flex items-center gap-1 text-neutral-300">
                          <Phone className="w-3 h-3 text-[#e61e2b]" />
                          <span>{i.phone}</span>
                        </span>
                      )}
                      {i.company && <span>{i.company}</span>}
                      {i.createdAt && (
                        <span>{new Date(i.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-neutral-200 font-medium">
                  {i.projectType}
                  {i.selectedPackage ? ` · ${i.selectedPackage}` : ''}
                </div>

                {i.details && (
                  <p className="text-xs text-neutral-300 leading-relaxed bg-black/40 border border-neutral-800/80 rounded-xl p-2.5 italic">
                    "{i.details}"
                  </p>
                )}

                <div className="flex flex-wrap gap-2 text-[11px] font-mono pt-0.5">
                  {i.appointmentDate && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-300 border border-purple-800/40 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{i.appointmentDate}{i.appointmentTime ? ` · ${i.appointmentTime}` : ''}</span>
                    </span>
                  )}
                  {i.budgetRange && (
                    <span className="px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-800">
                      {i.budgetRange}
                    </span>
                  )}
                  {i.timeline && (
                    <span className="px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800">
                      {i.timeline}
                    </span>
                  )}
                  {i.addOns && i.addOns.length > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/50 text-emerald-300 border border-emerald-700/40">
                      +{i.addOns.length} add-on{i.addOns.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
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
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button" 
                      onClick={() => p.onOpen(i)} 
                      title="View full brief" 
                      className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {i.email && (
                      <a 
                        href={`mailto:${i.email}?subject=Tech%20Base%20Axis%20-%20Regarding%20Your%20${encodeURIComponent(meta.label)}`} 
                        title="Reply via email" 
                        className="p-2 rounded-lg bg-neutral-900 hover:bg-red-950/40 text-[#e61e2b] border border-neutral-800 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button 
                      type="button" 
                      onClick={() => p.onDelete(i)} 
                      title="Delete" 
                      className="p-2 rounded-lg bg-neutral-900 hover:bg-rose-950/60 text-neutral-500 hover:text-rose-400 border border-neutral-800 cursor-pointer transition-colors"
                    >
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
