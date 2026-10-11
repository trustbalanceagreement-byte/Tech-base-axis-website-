import React, { useState, useEffect } from 'react';
import { NavSection, ClientInquiry } from '../types';
import { UpiPaymentModal, PaymentOrderData } from './UpiPaymentModal';
import { launchRazorpayCheckout } from '../services/razorpayService';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  Users,
  HardDrive,
  Key,
  Database,
  Cpu,
  Bell,
  GitBranch,
  Globe,
  Plus,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

export interface BookingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  theme?: 'green' | 'blue' | 'amber' | 'red';
  description?: string;
  features?: Array<{ text: string; included: boolean }>;
}

export interface AddOnItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const EXTRA_ADD_ONS: AddOnItem[] = [
  {
    id: 'cloud_storage',
    name: 'Cloud Storage Engine',
    price: 1500,
    category: 'Infrastructure',
    description: 'High-speed S3 / Firebase storage buckets with global CDN caching & automatic asset pipelines.',
    icon: HardDrive
  },
  {
    id: 'authentication',
    name: 'Enterprise Authentication',
    price: 2000,
    category: 'Security',
    description: 'OAuth (Google, GitHub), Phone OTP, JWT session security & Role-Based Access Control (RBAC).',
    icon: Key
  },
  {
    id: 'cloud_sql',
    name: 'Cloud SQL / PostgreSQL Database',
    price: 2500,
    category: 'Database',
    description: 'Production PostgreSQL scaling, automated daily backups, connection pooling & schema hardening.',
    icon: Database
  },
  {
    id: 'ai_pipeline',
    name: 'AI & LLM Pipeline Integration',
    price: 3500,
    category: 'Intelligence',
    description: 'Gemini / OpenAI API pipelines, semantic vector search, streaming chat & background agentic workers.',
    icon: Cpu
  },
  {
    id: 'push_alerts',
    name: 'Instant Push Alerts (OneSignal)',
    price: 1200,
    category: 'Engagement',
    description: 'Real-time desktop & mobile push notifications triggered on orders, bookings, and user activity.',
    icon: Bell
  },
  {
    id: 'cicd_devops',
    name: 'Automated CI/CD Deployment',
    price: 1800,
    category: 'DevOps',
    description: 'Zero-downtime GitHub Actions deployment pipeline to Google Cloud Run / Vercel with linting & test suite.',
    icon: GitBranch
  },
  {
    id: 'domain_ssl',
    name: 'Custom Domain & Enterprise SSL',
    price: 1000,
    category: 'Networking',
    description: 'Custom domain DNS provisioning, wildcard SSL certs, and Cloudflare DDoS protection shields.',
    icon: Globe
  }
];

interface PackageBookingModalProps {
  isOpen: boolean;
  plan: BookingPlan | null;
  onClose: () => void;
  onConfirmBooking: (inquiry: ClientInquiry) => void;
  onNavigate: (section: NavSection) => void;
}

export const PackageBookingModal: React.FC<PackageBookingModalProps> = ({
  isOpen,
  plan,
  onClose,
  onConfirmBooking,
  onNavigate
}) => {
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrderData | null>(null);
  const [confirmedInquiry, setConfirmedInquiry] = useState<ClientInquiry | null>(null);
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);
  const [razorpayError, setRazorpayError] = useState<string | null>(null);
  const [fallbackPaymentLink, setFallbackPaymentLink] = useState<string | null>(null);

  // Reset fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmedInquiry(null);
      setPaymentOrder(null);
      setValidationError(null);
      setRazorpayError(null);
      setFallbackPaymentLink(null);
      setIsProcessingRazorpay(false);
      setSelectedAddOnIds([]);
      setClientName('');
      setEmail('');
      setPhone('');
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOnIds((prev) => 
      prev.includes(addonId) 
        ? prev.filter((id) => id !== addonId) 
        : [...prev, addonId]
    );
  };

  const selectedAddOns = EXTRA_ADD_ONS.filter((item) => selectedAddOnIds.includes(item.id));
  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  const basePrice = plan.price;
  const totalPrice = basePrice + addOnsTotal;

  // Razorpay Standard Web Checkout Handler
  const handlePayWithRazorpay = async (e: React.MouseEvent) => {
    e.preventDefault();
    setValidationError(null);
    setRazorpayError(null);

    const trimmedName = clientName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setValidationError('Please enter your full name to proceed with payment.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (!plan || totalPrice <= 0) {
      setValidationError('A valid package and investment amount are required.');
      return;
    }

    setIsProcessingRazorpay(true);

    try {
      await launchRazorpayCheckout({
        amountInRupees: totalPrice,
        packageName: plan.name,
        clientName: trimmedName,
        email: trimmedEmail,
        phone: phone.trim() || undefined,
        description: `Tech Base Axis - ${plan.name} Architecture Package`,
        onSuccess: (paymentData) => {
          setIsProcessingRazorpay(false);

          const formattedTotalPrice = `₹${totalPrice.toLocaleString('en-IN')}`;
          const periodStr = plan.period || '';

          const paidInquiry: ClientInquiry = {
            id: paymentData.orderId || `inq-${Date.now().toString().slice(-4)}`,
            clientName: trimmedName,
            email: trimmedEmail,
            phone: phone.trim() || '',
            company: 'Direct Package Booking',
            projectType: plan.name,
            selectedPackage: `${plan.name} (${formattedTotalPrice})`,
            budgetRange: formattedTotalPrice,
            timeline: plan.period?.includes('month') ? 'Monthly Retainer' : 'Milestone Project',
            addOns: selectedAddOns.map((a) => a.name),
            basePrice: basePrice,
            totalPrice: totalPrice,
            details: `[VERIFIED RAZORPAY PAYMENT] Plan: ${plan.name}. Amount Paid: ${formattedTotalPrice}${periodStr ? ' ' + periodStr : ''}. Razorpay Payment ID: ${paymentData.paymentId}. Order ID: ${paymentData.orderId}. Phone: ${phone.trim() || 'N/A'}.`,
            createdAt: new Date().toISOString(),
            status: 'New',
            priority: 'High',
            notes: notes.trim() || undefined,
            eventType: 'payment_success',
            paymentId: paymentData.paymentId,
            orderId: paymentData.orderId,
            paymentStatus: 'paid',
            paymentMethod: 'Razorpay Standard Checkout'
          };

          onConfirmBooking(paidInquiry);
          setConfirmedInquiry(paidInquiry);
        },
        onDismiss: () => {
          setIsProcessingRazorpay(false);
        },
        onFailure: (err) => {
          setIsProcessingRazorpay(false);
          setRazorpayError(err.description || 'Payment was declined or cancelled.');
          if (err.paymentLinkUrl) {
            setFallbackPaymentLink(err.paymentLinkUrl);
          }
        }
      });
    } catch (err: any) {
      setIsProcessingRazorpay(false);
      setRazorpayError(err.message || 'Unable to initialize Razorpay checkout gateway.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // STEP 1: Strict validation of required booking information
    const trimmedName = clientName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setValidationError('Please enter your full name to book.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (!plan || totalPrice <= 0) {
      setValidationError('A valid package and investment amount are required.');
      return;
    }

    // STEP 2: Prepare locked payment order data
    const periodStr = plan.period || '';
    const formattedBasePrice = `₹${basePrice.toLocaleString('en-IN')}`;
    const formattedTotalPrice = `₹${totalPrice.toLocaleString('en-IN')}`;
    const addOnNames = selectedAddOns.map((a) => `${a.name} (+₹${a.price.toLocaleString('en-IN')})`);
    const addOnSummary = addOnNames.length > 0 
      ? ` | Extra Add-ons (${addOnNames.length}): ${addOnNames.join(', ')}`
      : ' | No Extra Add-ons';

    const orderData: PaymentOrderData = {
      bookingId: `inq-${Date.now().toString().slice(-4)}`,
      clientName: trimmedName,
      email: trimmedEmail,
      phone: phone.trim() || undefined,
      packageName: plan.name,
      packagePrice: basePrice,
      totalPrice: totalPrice,
      addOns: selectedAddOns.map((a) => a.name),
      details: `[PACKAGE BOOKING] Plan: ${plan.name} (Base: ${formattedBasePrice}). Total: ${formattedTotalPrice}${periodStr ? ' ' + periodStr : ''}.${addOnSummary}. ${phone ? `WhatsApp/Phone: ${phone}. ` : ''}${notes ? `Notes: ${notes}` : ''}`,
      notes: notes.trim() || undefined,
      period: plan.period
    };

    // STEP 3: Record new inquiry and dispatch instant OneSignal push notification
    const newBookingInquiry: ClientInquiry = {
      id: orderData.bookingId,
      clientName: trimmedName,
      email: trimmedEmail,
      phone: phone.trim() || '',
      company: 'Direct Package Booking',
      projectType: plan.name,
      selectedPackage: `${plan.name} (${formattedTotalPrice})`,
      budgetRange: formattedTotalPrice,
      timeline: plan.period?.includes('month') ? 'Monthly Retainer' : 'Milestone Project',
      addOns: selectedAddOns.map((a) => a.name),
      basePrice: basePrice,
      totalPrice: totalPrice,
      details: orderData.details,
      createdAt: new Date().toISOString(),
      status: 'New',
      priority: 'High',
      notes: notes.trim() || undefined,
      eventType: 'package_booking',
      orderId: orderData.bookingId
    };

    onConfirmBooking(newBookingInquiry);

    // Call backend REST API to push notification directly to OneSignal devices
    fetch('/api/notify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'package_booking',
        clientId: orderData.bookingId,
        clientName: trimmedName,
        clientEmail: trimmedEmail,
        email: trimmedEmail,
        clientPhone: phone.trim() || '',
        phone: phone.trim() || '',
        packageName: plan.name,
        packagePrice: totalPrice,
        totalPrice: totalPrice,
        bookingId: orderData.bookingId,
        details: orderData.details,
        notes: notes.trim() || undefined,
        timestamp: newBookingInquiry.createdAt
      })
    }).catch((err) => console.warn('[OneSignal] Package booking alert notice:', err));

    // STEP 4: Open professional UPI Payment Page
    setPaymentOrder(orderData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl my-auto rounded-2xl bg-[#0b0c10] border border-neutral-800 shadow-[0_25px_70px_rgba(0,0,0,0.9)] p-5 sm:p-7 text-neutral-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Crimson Glow matching Tech Base Axis branding */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#e61e2b]/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Top edge subtle reflection */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-800 z-10 active:scale-95"
          aria-label="Close booking modal"
        >
          <X className="w-4 h-4" />
        </button>

        {confirmedInquiry ? (
          /* STATE: BOOKING CONFIRMED SCREEN */
          <div className="text-center py-5 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-600/50 text-[#ff4d5a] flex items-center justify-center mx-auto shadow-lg shadow-red-600/25">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-red-950/70 text-red-300 border border-red-600/40">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e61e2b]" />
                <span>BOOKING REGISTERED &amp; LOGGED</span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Package Booking Confirmed!
              </h3>
              <p className="text-sm text-neutral-300 max-w-sm mx-auto leading-relaxed">
                Thank you, <span className="text-white font-semibold">{confirmedInquiry.clientName}</span>. Your booking for <span className="text-[#ff4d5a] font-semibold">{plan.name}</span> with configured add-ons has been saved.
              </p>
            </div>

            {/* Booking Details Card */}
            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 text-left space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center text-neutral-400">
                <span>Reference ID:</span>
                <span className="text-[#e61e2b] font-bold">#{confirmedInquiry.id}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Package Plan:</span>
                <span className="text-white font-semibold">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Base Package:</span>
                <span className="text-neutral-200">₹{basePrice.toLocaleString('en-IN')}</span>
              </div>

              {selectedAddOns.length > 0 && (
                <div className="pt-1.5 pb-1 border-t border-neutral-800/80">
                  <div className="flex justify-between items-center text-neutral-400 mb-1.5">
                    <span>Selected Add-ons ({selectedAddOns.length}):</span>
                    <span className="text-[#ff4d5a] font-semibold">+₹{addOnsTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedAddOns.map((item) => (
                      <span key={item.id} className="px-2 py-0.5 rounded text-[11px] bg-red-950/50 text-red-300 border border-red-600/30 flex items-center gap-1">
                        <span className="text-[#e61e2b]">✓</span> {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-white pt-2 border-t border-neutral-800 font-bold text-sm">
                <span>Total Investment:</span>
                <span className="text-[#ff4d5a]">₹{totalPrice.toLocaleString('en-IN')} {plan.period}</span>
              </div>

              <div className="flex justify-between items-center text-neutral-400 pt-1 border-t border-neutral-800">
                <span>Client Email:</span>
                <span className="text-neutral-200">{confirmedInquiry.email}</span>
              </div>
              {confirmedInquiry.paymentId && (
                <div className="flex justify-between items-center text-emerald-400 pt-1 border-t border-neutral-800">
                  <span>Razorpay Payment ID:</span>
                  <span className="font-bold font-mono text-emerald-300">{confirmedInquiry.paymentId}</span>
                </div>
              )}
              {confirmedInquiry.paymentMethod && (
                <div className="flex justify-between items-center text-neutral-400">
                  <span>Payment Gateway:</span>
                  <span className="text-white font-semibold">{confirmedInquiry.paymentMethod}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-neutral-400">
                <span>System Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {confirmedInquiry.paymentStatus === 'paid' ? 'Payment Verified & Confirmed' : 'Active in Client Inquiries'}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 font-mono">
              A high-priority alert has been dispatched to Bikram Ghosh. Feasibility review and kickoff details will be sent to your email.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-xs font-semibold transition-colors cursor-pointer active:scale-95 shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* STATE: ADD-ONS CUSTOMIZATION & CONFIRM BOOKING */
          <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-1">
            {/* Header with Professional Theme Badges */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-red-950/60 text-[#ff4d5a] border border-red-600/40 shadow-sm shadow-red-950/50">
                    {plan.name}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">Subscription Package</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Package Customization &amp; Extra Add-ons
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Customize your subscription by adding extra modules (Cloud Storage, Authentication, etc.). Click <span className="text-white font-semibold">"+ Add"</span> beside any item.
              </p>
            </div>

            {/* Base Plan Summary Bar (Dual-column Obsidian Card with zero text-wrap glitches) */}
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-neutral-900/90 to-neutral-950/90 border border-neutral-800/90 grid grid-cols-2 gap-3 divide-x divide-neutral-800/80 shadow-sm">
              <div className="pr-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  Base Plan Price
                </div>
                <div className="text-base sm:text-xl font-extrabold text-white font-mono mt-0.5">
                  ₹{basePrice.toLocaleString('en-IN')}
                  <span className="text-[11px] font-normal text-neutral-400 ml-1.5 block sm:inline">
                    {plan.period}
                  </span>
                </div>
              </div>

              <div className="pl-3 sm:pl-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  Configured Add-ons
                </div>
                <div className="text-xs sm:text-sm font-bold font-mono mt-1 text-white">
                  {selectedAddOns.length > 0 ? (
                    <span className="text-[#ff4d5a] flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-red-950/70 border border-red-600/40 text-[10px] text-white">
                        +{selectedAddOns.length}
                      </span>
                      <span>(+₹{addOnsTotal.toLocaleString('en-IN')})</span>
                    </span>
                  ) : (
                    <span className="text-neutral-500 font-normal">None selected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Extra Add-ons Selection List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e61e2b]" />
                  <span>Available Engineering Add-ons</span>
                </label>
                <span className="text-[11px] font-mono text-neutral-500">
                  Click "+ Add" to include
                </span>
              </div>

              <div className="space-y-2">
                {EXTRA_ADD_ONS.map((addon) => {
                  const isAdded = selectedAddOnIds.includes(addon.id);
                  const Icon = addon.icon;

                  return (
                    <div
                      key={addon.id}
                      className={`p-3 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isAdded
                          ? 'bg-red-950/20 border-red-600/50 shadow-[0_0_20px_rgba(230,30,43,0.12)]'
                          : 'bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700/80 hover:bg-neutral-900/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isAdded 
                            ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md shadow-red-600/30' 
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-white">
                              {addon.name}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                              {addon.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5 line-clamp-2">
                            {addon.description}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Price & Add Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/80">
                        <div className="font-mono text-xs sm:text-sm font-bold text-white">
                          +₹{addon.price.toLocaleString('en-IN')}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleAddOn(addon.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            isAdded
                              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/30 border border-red-500/50'
                              : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-red-500/50'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Booking Form Details */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-neutral-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    Your Full Name <span className="text-[#e61e2b]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-neutral-800 focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/40 focus:outline-none text-xs sm:text-sm text-white transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    Work Email <span className="text-[#e61e2b]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-neutral-800 focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/40 focus:outline-none text-xs sm:text-sm text-white transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    WhatsApp / Phone <span className="text-neutral-500">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-neutral-800 focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/40 focus:outline-none text-xs sm:text-sm text-white transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    Special Requirements <span className="text-neutral-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-neutral-800 focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/40 focus:outline-none text-xs sm:text-sm text-white transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Validation & Razorpay Error Feedback */}
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {razorpayError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{razorpayError}</span>
                </div>
              )}

              {/* Direct Razorpay Hosted Portal fallback */}
              {fallbackPaymentLink && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/80 via-black to-red-950/60 border border-red-500/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg shadow-red-950/50 animate-in fade-in">
                  <div>
                    <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Razorpay Official Hosted Portal (rzp.io)</span>
                    </div>
                    <div className="text-[11px] text-neutral-300 font-mono mt-0.5">
                      Pay directly on Razorpay's verified portal to complete checkout
                    </div>
                  </div>
                  <a
                    href={fallbackPaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>Open Razorpay Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Total Investment Card & Confirm Button (Clean Website Obsidian Theme) */}
              <div className="p-4 rounded-xl bg-neutral-950/90 border border-neutral-800 space-y-3 mt-2 shadow-inner">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>Base Package ({plan.name}):</span>
                  <span className="text-neutral-200">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>

                {selectedAddOns.length > 0 && (
                  <div className="flex items-center justify-between text-xs font-mono text-[#ff4d5a]">
                    <span>{selectedAddOns.length} Extra Add-on(s):</span>
                    <span>+₹{addOnsTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-neutral-800/80">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Total Investment
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                      ₹{totalPrice.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-neutral-400 ml-1.5">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Primary Button: Pay via Razorpay Standard Checkout */}
                    <button
                      id="razorpay-checkout-btn"
                      type="button"
                      onClick={handlePayWithRazorpay}
                      disabled={isProcessingRazorpay}
                      className="py-3 px-5 rounded-xl font-mono font-bold text-white text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_4px_25px_rgba(230,30,43,0.45)] border border-red-500/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingRazorpay ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Connecting Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Pay with Razorpay</span>
                          <span className="text-[10px] uppercase font-normal bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-emerald-300 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Cards &amp; UPI
                          </span>
                        </>
                      )}
                    </button>

                    {/* Secondary Button: Manual UPI QR / Transfer */}
                    <button
                      id="confirm-booking-btn"
                      type="submit"
                      disabled={isProcessingRazorpay}
                      className="py-3 px-4 rounded-xl font-mono text-neutral-300 hover:text-white text-xs font-semibold bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Direct UPI QR scan"
                    >
                      <span>Direct UPI QR</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Professional UPI Payment Modal - opens strictly after user clicks Confirm Booking and validates */}
        {paymentOrder && (
          <UpiPaymentModal
            isOpen={Boolean(paymentOrder)}
            order={paymentOrder}
            onClose={() => setPaymentOrder(null)}
            onPaymentSuccess={(confirmedInquiry) => {
              setPaymentOrder(null);
              setConfirmedInquiry(confirmedInquiry);
              onConfirmBooking(confirmedInquiry);
            }}
            onNavigate={(section) => {
              setPaymentOrder(null);
              onClose();
              onNavigate(section);
            }}
          />
        )}
      </div>
    </div>
  );
};
