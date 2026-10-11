import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Smartphone, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  CreditCard
} from 'lucide-react';
import { launchRazorpayCheckout } from '../services/razorpayService';
import { TechBaseAxisLogo } from './TechBaseAxisLogo';
import { 
  GooglePayIcon, 
  PhonePeIcon, 
  PaytmIcon, 
  BhimIcon, 
  GenericUpiIcon 
} from './ui/UpiIcons';
import { ClientInquiry, NavSection } from '../types';

export interface PaymentOrderData {
  bookingId: string;
  clientName: string;
  email: string;
  phone?: string;
  packageName: string;
  packagePrice: number;
  totalPrice: number;
  addOns?: string[];
  details?: string;
  notes?: string;
  period?: string;
}

interface UpiPaymentModalProps {
  isOpen: boolean;
  order: PaymentOrderData | null;
  onClose: () => void;
  onPaymentSuccess: (confirmedInquiry: ClientInquiry) => void;
  onNavigate?: (section: NavSection) => void;
}

// Trusted Payee Configuration for Tech Base Axis
export const PAYEE_UPI_ID = 'bgho40185@okaxis';
export const PAYEE_NAME = 'Tech Base Axis (Bikram Ghosh)';
export const PAYEE_BUSINESS_NAME = 'RK BG GAMING / Tech Base Axis';

type UpiAppType = 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other';
type PaymentStep = 'checkout' | 'verifying' | 'success' | 'pending' | 'failed';

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  order,
  onClose,
  onPaymentSuccess,
  onNavigate
}) => {
  // UI & Flow states
  const [selectedApp, setSelectedApp] = useState<UpiAppType>('gpay');
  const [activeTab, setActiveTab] = useState<'upi_apps' | 'qr_code'>('upi_apps');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState<boolean>(true);

  // Verification states
  const [step, setStep] = useState<PaymentStep>('checkout');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string>('');
  const [verifiedInquiry, setVerifiedInquiry] = useState<ClientInquiry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRazorpayLoading, setIsRazorpayLoading] = useState<boolean>(false);
  const [fallbackRazorpayUrl, setFallbackRazorpayUrl] = useState<string | null>(null);

  // Mobile detection for optimal tab prioritization
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent) || (typeof window !== 'undefined' && window.innerWidth < 768);
      setIsMobile(isMobileDevice);
      if (isMobileDevice) {
        setActiveTab('upi_apps');
      } else {
        setActiveTab('qr_code');
      }
    };
    checkMobile();
  }, [isOpen]);

  // Reset state on open
  useEffect(() => {
    if (isOpen && order) {
      setStep('checkout');
      setUtrNumber('');
      setUtrError(null);
      setIsVerifying(false);
      setVerifiedPaymentId('');
      setVerifiedInquiry(null);
      setErrorMessage(null);
      generateDynamicQr(order.totalPrice, order.packageName, order.bookingId);
    }
  }, [isOpen, order]);

  // Generate crisp, pixel-perfect dynamic UPI QR Code for the EXACT locked amount
  const generateDynamicQr = async (amount: number, packageName: string, bookingId: string) => {
    try {
      setQrLoading(true);
      // Clean, standardized NPCI UPI URI with pre-locked amount
      const upiUrl = `upi://pay?pa=${encodeURIComponent(PAYEE_UPI_ID)}&pn=${encodeURIComponent('Tech Base Axis')}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Booking-${packageName.slice(0, 16)}`)}&tr=${encodeURIComponent(bookingId)}`;
      
      const dataUrl = await QRCode.toDataURL(upiUrl, {
        width: 380,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate dynamic UPI QR code:', err);
    } finally {
      setQrLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  const formattedAmount = `₹${order.totalPrice.toLocaleString('en-IN')}`;

  // Copy UPI ID helper
  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(PAYEE_UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Copy Amount helper
  const handleCopyAmount = async () => {
    try {
      await navigator.clipboard.writeText(order.totalPrice.toString());
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Build standard deep link based on selected UPI App
  const buildUpiDeepLink = (app: UpiAppType): string => {
    const rawUpi = `pa=${encodeURIComponent(PAYEE_UPI_ID)}&pn=${encodeURIComponent('Tech Base Axis')}&am=${order.totalPrice.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Booking-${order.packageName.slice(0, 16)}`)}&tr=${encodeURIComponent(order.bookingId)}`;

    switch (app) {
      case 'gpay':
        // Primary Google Pay UPI intent with fallback to standard upi://
        return `gpay://upi/pay?${rawUpi}`;
      case 'phonepe':
        return `phonepe://pay?${rawUpi}`;
      case 'paytm':
        return `paytmmp://pay?${rawUpi}`;
      case 'bhim':
        return `bhim://pay?${rawUpi}`;
      case 'other':
      default:
        // Universal OS-level UPI chooser
        return `upi://pay?${rawUpi}`;
    }
  };

  // Initiate mobile payment intent
  const handlePayNow = () => {
    const deepLink = buildUpiDeepLink(selectedApp);
    const genericLink = buildUpiDeepLink('other');

    // Notify admin that client has launched a UPI payment intent
    fetch('/api/notify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'package_booking',
        clientId: order.bookingId,
        clientName: order.clientName,
        clientEmail: order.email,
        email: order.email,
        clientPhone: order.phone || '',
        phone: order.phone || '',
        packageName: order.packageName,
        packagePrice: order.totalPrice,
        totalPrice: order.totalPrice,
        bookingId: order.bookingId,
        details: `[UPI PAYMENT INITIATED: ${selectedApp.toUpperCase()}] Client clicked Pay Now for ${order.packageName}. Locked Amount: ${formattedAmount}. ${order.details || ''}`,
        notes: `Selected UPI app: ${selectedApp.toUpperCase()}`,
        timestamp: new Date().toISOString()
      })
    }).catch((err) => console.warn('[OneSignal] UPI intent notice:', err));

    // Attempt to open the specific application scheme
    try {
      window.location.href = deepLink;
    } catch {
      window.location.href = genericLink;
    }

    // After attempting invocation, smoothly shift view to prompt user for 12-digit UTR confirmation
    setTimeout(() => {
      setStep('verifying');
    }, 1200);
  };

  // Handle server-side payment verification
  const handleVerifyPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUtrError(null);
    setErrorMessage(null);

    const cleanUtr = utrNumber.trim();
    // Validate UTR format: Indian UPI UTR is typically 12 numeric digits or alphanumeric bank ref
    if (!cleanUtr || cleanUtr.length < 8) {
      setUtrError('Please enter a valid 12-digit UPI Reference / UTR Number from your payment receipt.');
      return;
    }

    setIsVerifying(true);
    const paymentId = `PAY-UPI-${Date.now().toString().slice(-6)}-${cleanUtr.slice(-4)}`;

    try {
      // Real backend server verification endpoint
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          orderId: order.bookingId,
          amount: order.totalPrice,
          clientName: order.clientName,
          email: order.email,
          phone: order.phone || '',
          packageName: order.packageName,
          projectId: `Package: ${order.packageName}`,
          utrNumber: cleanUtr,
          selectedApp,
          status: 'success'
        })
      });

      const result = await response.json();

      if (response.ok && result.verified) {
        // Construct the confirmed, paid client inquiry record
        const confirmed: ClientInquiry = {
          id: order.bookingId,
          clientName: order.clientName,
          email: order.email,
          phone: order.phone || '',
          company: 'Direct Package Booking',
          projectType: order.packageName,
          selectedPackage: `${order.packageName} (${formattedAmount})`,
          budgetRange: formattedAmount,
          timeline: order.period?.includes('month') ? 'Monthly Retainer' : 'Milestone Project',
          addOns: order.addOns || [],
          basePrice: order.packagePrice,
          totalPrice: order.totalPrice,
          details: `[VERIFIED UPI PAYMENT] Package: ${order.packageName}. Locked Amount: ${formattedAmount}. Payment ID: ${paymentId}. UTR: ${cleanUtr}. Selected App: ${selectedApp}. ${order.details || ''}`,
          createdAt: new Date().toISOString(),
          status: 'New',
          priority: 'High',
          notes: `Verified UPI Payment via ${selectedApp.toUpperCase()}. UTR: ${cleanUtr}. Transaction confirmed.`,
          eventType: 'payment_success',
          paymentId: paymentId,
          orderId: order.bookingId
        };

        setVerifiedPaymentId(paymentId);
        setVerifiedInquiry(confirmed);
        setStep('success');

        // Pass to parent application handler
        onPaymentSuccess(confirmed);
      } else {
        setErrorMessage(result.error || 'Payment verification could not be confirmed. Please double-check your UTR.');
        setStep('failed');
      }
    } catch (err: any) {
      console.warn('Payment verification network notice:', err);
      // If network times out, transition to pending state gracefully
      setStep('pending');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLaunchRazorpay = async () => {
    if (!order) return;
    setIsRazorpayLoading(true);
    setErrorMessage(null);

    try {
      await launchRazorpayCheckout({
        amountInRupees: order.totalPrice,
        packageName: order.packageName,
        clientName: order.clientName,
        email: order.email,
        phone: order.phone,
        description: `Tech Base Axis - ${order.packageName}`,
        onSuccess: (paymentData) => {
          setIsRazorpayLoading(false);
          setVerifiedPaymentId(paymentData.paymentId);
          setStep('success');

          const confirmed: ClientInquiry = {
            id: paymentData.orderId || order.bookingId,
            clientName: order.clientName,
            email: order.email,
            phone: order.phone || '',
            company: 'Direct Package Booking',
            projectType: order.packageName,
            selectedPackage: `${order.packageName} (${formattedAmount})`,
            budgetRange: formattedAmount,
            timeline: order.period?.includes('month') ? 'Monthly Retainer' : 'Milestone Project',
            addOns: order.addOns || [],
            basePrice: order.packagePrice,
            totalPrice: order.totalPrice,
            details: `[VERIFIED RAZORPAY PAYMENT] Package: ${order.packageName}. Locked Amount: ${formattedAmount}. Payment ID: ${paymentData.paymentId}. Order ID: ${paymentData.orderId}. ${order.details || ''}`,
            createdAt: new Date().toISOString(),
            status: 'New',
            priority: 'High',
            notes: order.notes,
            eventType: 'payment_success',
            paymentId: paymentData.paymentId,
            orderId: paymentData.orderId,
            paymentStatus: 'paid',
            paymentMethod: 'Razorpay Standard Checkout'
          };

          setVerifiedInquiry(confirmed);
          onPaymentSuccess(confirmed);
        },
        onDismiss: () => {
          setIsRazorpayLoading(false);
        },
        onFailure: (err) => {
          setIsRazorpayLoading(false);
          setErrorMessage(err.description || 'Razorpay payment was cancelled or declined.');
          if (err.paymentLinkUrl) {
            setFallbackRazorpayUrl(err.paymentLinkUrl);
          }
        }
      });
    } catch (err: any) {
      setIsRazorpayLoading(false);
      setErrorMessage(err.message || 'Unable to connect to Razorpay.');
    }
  };

  const handleManualVerificationPending = () => {
    // Construct pending inquiry record
    const pendingInquiry: ClientInquiry = {
      id: order.bookingId,
      clientName: order.clientName,
      email: order.email,
      phone: order.phone || '',
      company: 'Direct Package Booking',
      projectType: order.packageName,
      selectedPackage: `${order.packageName} (${formattedAmount})`,
      budgetRange: formattedAmount,
      timeline: 'Pending Verification',
      addOns: order.addOns || [],
      basePrice: order.packagePrice,
      totalPrice: order.totalPrice,
      details: `[PENDING PAYMENT VERIFICATION] Package: ${order.packageName}. Submitted UTR: ${utrNumber || 'Awaiting entry'}. Amount: ${formattedAmount}.`,
      createdAt: new Date().toISOString(),
      status: 'Reviewing',
      priority: 'High',
      notes: `Payment verification submitted and pending admin review. UTR: ${utrNumber || 'N/A'}.`,
      eventType: 'package_booking',
      orderId: order.bookingId
    };

    // Dispatch OneSignal notification for pending verification review
    fetch('/api/notify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'package_booking',
        clientId: order.bookingId,
        clientName: order.clientName,
        clientEmail: order.email,
        email: order.email,
        clientPhone: order.phone || '',
        phone: order.phone || '',
        packageName: order.packageName,
        packagePrice: order.totalPrice,
        totalPrice: order.totalPrice,
        bookingId: order.bookingId,
        details: pendingInquiry.details,
        notes: pendingInquiry.notes,
        timestamp: pendingInquiry.createdAt
      })
    }).catch((err) => console.warn('[OneSignal] Pending verification alert notice:', err));

    onPaymentSuccess(pendingInquiry);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div 
        className="relative w-full max-w-xl my-auto rounded-2xl bg-[#0b0c10] border border-neutral-800 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-4 sm:p-6 text-neutral-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Crimson Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#e61e2b]/15 rounded-full blur-[80px] pointer-events-none" />

        {/* Top edge subtle crimson accent line */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#e61e2b] to-transparent pointer-events-none" />

        {/* Header Section */}
        <div className="relative z-10 flex items-start justify-between gap-3 pb-3 border-b border-neutral-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TechBaseAxisLogo size="sm" showText={false} />
              <span className="font-display font-black text-sm sm:text-base tracking-wider text-white uppercase">
                TECH BASE <span className="text-[#e61e2b]">AXIS</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h2 id="payment-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                Secure UPI Payment
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono font-medium text-emerald-400">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Encrypted</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
            aria-label="Close payment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: MAIN CHECKOUT & PAYMENT SELECTION */}
        {step === 'checkout' && (
          <div className="relative z-10 mt-4 space-y-4">
            
            {/* 1. PROJECT & LOCKED AMOUNT SUMMARY */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-950/90 border border-neutral-800/90 shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
                <span>PROJECT SUMMARY</span>
                <span className="text-neutral-500 font-sans text-[10px]">One-time payment</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="text-sm sm:text-base font-bold text-white">
                    {order.packageName}
                  </div>
                  <div className="text-xs text-neutral-400 font-mono mt-0.5">
                    Client: <span className="text-neutral-200">{order.clientName}</span> ({order.email})
                  </div>
                </div>

                {/* Amount with Strict Lock indicator */}
                <div className="sm:text-right">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center sm:justify-end gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-400 font-semibold">Amount Locked</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight text-[#ff4d5a]">
                    {formattedAmount}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    Amount locked to selected package
                  </div>
                </div>
              </div>
            </div>

            {/* FAST OPTION: Razorpay Standard Checkout (Cards, UPI, NetBanking) */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-red-950/70 via-black to-red-950/40 border border-red-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-red-950/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-[#ff4d5a] shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                    <span>Pay with Razorpay</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 font-semibold">
                      Instant Automated
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Credit/Debit Cards, UPI, Net Banking, EMI
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLaunchRazorpay}
                disabled={isRazorpayLoading}
                className="py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
              >
                {isRazorpayLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting Razorpay...</span>
                  </>
                ) : (
                  <>
                    <span>Launch Razorpay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {fallbackRazorpayUrl && (
              <a
                href={fallbackRazorpayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl font-mono text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer animate-in fade-in"
              >
                <span>Continue on Razorpay Secure Portal (rzp.io)</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-200" />
              </a>
            )}

            {/* TAB SELECTOR: UPI APPS vs SCAN QR */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900/90 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setActiveTab('upi_apps')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'upi_apps'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-[#e61e2b]" />
                <span>Choose UPI App</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qr_code')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'qr_code'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-[#e61e2b]" />
                <span>Scan QR Code</span>
              </button>
            </div>

            {/* VIEW A: SELECT UPI APP (MOBILE / INTENT) */}
            {activeTab === 'upi_apps' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="text-xs font-mono text-neutral-300 flex items-center justify-between">
                  <span>Select your preferred UPI app:</span>
                  <span className="text-[10px] text-neutral-500 font-sans">Fast &amp; Direct</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Google Pay */}
                  <div
                    onClick={() => setSelectedApp('gpay')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedApp === 'gpay'
                        ? 'bg-neutral-900 border-[#e61e2b] shadow-[0_0_15px_rgba(230,30,43,0.2)]'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GooglePayIcon className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl shadow-sm" />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">Google Pay</div>
                        <div className="text-[10px] sm:text-[11px] font-mono text-neutral-400">GPay UPI</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedApp === 'gpay' ? 'border-[#e61e2b] bg-[#e61e2b]' : 'border-neutral-600'
                    }`}>
                      {selectedApp === 'gpay' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* PhonePe */}
                  <div
                    onClick={() => setSelectedApp('phonepe')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedApp === 'phonepe'
                        ? 'bg-neutral-900 border-[#e61e2b] shadow-[0_0_15px_rgba(230,30,43,0.2)]'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PhonePeIcon className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl shadow-sm" />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">PhonePe</div>
                        <div className="text-[10px] sm:text-[11px] font-mono text-neutral-400">UPI Instant</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedApp === 'phonepe' ? 'border-[#e61e2b] bg-[#e61e2b]' : 'border-neutral-600'
                    }`}>
                      {selectedApp === 'phonepe' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* Paytm */}
                  <div
                    onClick={() => setSelectedApp('paytm')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedApp === 'paytm'
                        ? 'bg-neutral-900 border-[#e61e2b] shadow-[0_0_15px_rgba(230,30,43,0.2)]'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PaytmIcon className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl shadow-sm" />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">Paytm</div>
                        <div className="text-[10px] sm:text-[11px] font-mono text-neutral-400">Paytm UPI</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedApp === 'paytm' ? 'border-[#e61e2b] bg-[#e61e2b]' : 'border-neutral-600'
                    }`}>
                      {selectedApp === 'paytm' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* BHIM / Other UPI */}
                  <div
                    onClick={() => setSelectedApp('other')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedApp === 'other'
                        ? 'bg-neutral-900 border-[#e61e2b] shadow-[0_0_15px_rgba(230,30,43,0.2)]'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GenericUpiIcon className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl shadow-sm" />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">Other UPI Apps</div>
                        <div className="text-[10px] sm:text-[11px] font-mono text-neutral-400">BHIM, Cred, Bank</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedApp === 'other' ? 'border-[#e61e2b] bg-[#e61e2b]' : 'border-neutral-600'
                    }`}>
                      {selectedApp === 'other' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handlePayNow}
                  className="w-full py-3.5 px-4 rounded-xl font-mono font-bold text-white text-xs sm:text-sm tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-red-600 to-[#e61e2b] hover:from-red-500 hover:to-red-600 shadow-[0_4px_25px_rgba(230,30,43,0.45)] border border-red-500/40 hover:scale-[1.01] active:scale-95"
                >
                  <Lock className="w-4 h-4 text-white/90" />
                  <span>Pay {formattedAmount} Securely</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('verifying')}
                    className="text-[11px] font-mono text-neutral-400 hover:text-white underline underline-offset-4 cursor-pointer"
                  >
                    Already paid? Enter 12-digit UTR reference to verify
                  </button>
                </div>
              </div>
            )}

            {/* VIEW B: SCAN TO PAY (DYNAMIC LOCKED QR + COPY UPI) */}
            {activeTab === 'qr_code' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div className="p-4 rounded-xl bg-neutral-950/90 border border-neutral-800 text-center space-y-3">
                  <div className="text-xs font-mono text-neutral-300 font-semibold">
                    Scan with any UPI app to pay <span className="text-[#ff4d5a]">{formattedAmount}</span>
                  </div>

                  {/* QR Image Container with Crisp White Matting (Completely stable, no rotation/distortion) */}
                  <div className="flex justify-center">
                    <div className="relative p-3 bg-white rounded-2xl shadow-xl border-4 border-neutral-800 inline-block">
                      {qrLoading ? (
                        <div className="w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center bg-neutral-100 rounded-xl text-neutral-600 text-xs font-mono">
                          <Loader2 className="w-6 h-6 animate-spin text-[#e61e2b] mb-2" />
                          <span>Generating Dynamic QR...</span>
                        </div>
                      ) : qrDataUrl ? (
                        <img 
                          src={qrDataUrl} 
                          alt={`Tech Base Axis UPI QR Code for ${formattedAmount}`}
                          className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg select-none"
                        />
                      ) : null}

                      {/* Small Center Emblem */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center pointer-events-none">
                        <GenericUpiIcon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 font-mono">
                    Google Pay • PhonePe • Paytm • BHIM • Any Banking UPI
                  </p>

                  {/* Payee VPA / UPI ID Copy Card */}
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-2 max-w-sm mx-auto">
                    <div className="text-left truncate">
                      <div className="text-[10px] font-mono text-neutral-400">Official UPI ID (VPA):</div>
                      <div className="text-xs font-mono font-bold text-white truncate">{PAYEE_UPI_ID}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-2.5 py-1 text-[11px] font-mono rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Button to proceed to verification */}
                <button
                  type="button"
                  onClick={() => setStep('verifying')}
                  className="w-full py-3.5 px-4 rounded-xl font-mono font-bold text-white text-xs sm:text-sm tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-red-600 to-[#e61e2b] hover:from-red-500 hover:to-red-600 shadow-[0_4px_25px_rgba(230,30,43,0.45)] border border-red-500/40"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Completed Payment &rarr; Enter UTR</span>
                </button>
              </div>
            )}

            {/* CRITICAL ZERO-CREDENTIAL SECURITY GUARANTEE */}
            <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-start gap-2.5 text-[11px] font-mono text-neutral-400 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-neutral-300 font-semibold">100% Secure Transaction: </span>
                Tech Base Axis never requests your UPI PIN, OTP, or banking password. Authentication happens strictly inside your chosen official banking or UPI app.
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: VERIFICATION & UTR SUBMISSION */}
        {step === 'verifying' && (
          <div className="relative z-10 mt-4 space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Verifying Booking For</div>
                <div className="text-sm font-bold text-white">{order.packageName}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-neutral-400">Locked Amount</div>
                <div className="text-lg font-bold font-mono text-[#ff4d5a]">{formattedAmount}</div>
              </div>
            </div>

            <form onSubmit={handleVerifyPayment} className="space-y-3.5">
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                <label className="block text-xs font-mono text-neutral-200 font-semibold">
                  Enter 12-Digit UPI Reference / UTR Number <span className="text-[#e61e2b]">*</span>
                </label>
                <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                  After completing the transfer in Google Pay, PhonePe, Paytm, or BHIM, copy the 12-digit UTR / UPI Ref ID from your payment receipt below:
                </p>

                <div className="relative mt-2">
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={utrNumber}
                    onChange={(e) => {
                      setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                      setUtrError(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/50 focus:outline-none text-sm font-mono text-white uppercase tracking-wider"
                  />
                </div>

                {utrError && (
                  <div className="text-[11px] font-mono text-rose-400 flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{utrError}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full sm:w-1/3 py-3 px-3 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono font-medium text-neutral-300 transition-colors cursor-pointer"
                >
                  &larr; Back to Methods
                </button>

                <button
                  type="submit"
                  disabled={isVerifying || !utrNumber.trim()}
                  className="w-full sm:w-2/3 py-3 px-4 rounded-xl font-mono font-bold text-white text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-red-600 to-[#e61e2b] hover:from-red-500 hover:to-red-600 shadow-md shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying with Server...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Payment &amp; Confirm Booking</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: PAYMENT SUCCESS SCREEN */}
        {step === 'success' && (
          <div className="relative z-10 mt-5 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.35)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight">
                Payment Verified &amp; Confirmed!
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Your project booking has been authenticated and locked in.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-xl bg-neutral-950/90 border border-neutral-800 text-left space-y-2 text-xs font-mono max-w-md mx-auto">
              <div className="flex justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-neutral-400">Package:</span>
                <span className="text-white font-bold">{order.packageName}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-neutral-400">Amount Paid:</span>
                <span className="text-emerald-400 font-bold">{formattedAmount}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-neutral-400">Payment ID:</span>
                <span className="text-neutral-200 font-mono text-[11px] truncate">{verifiedPaymentId}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-neutral-400">UTR / Ref:</span>
                <span className="text-neutral-200 font-mono text-[11px]">{utrNumber}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-neutral-400">Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Payment Verified</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 max-w-md mx-auto">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('contact');
                  }}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-neutral-200 transition-colors cursor-pointer"
                >
                  View Inquiries
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl font-mono font-bold text-white text-xs uppercase bg-[#e61e2b] hover:bg-red-600 transition-colors cursor-pointer shadow-md shadow-red-600/30"
              >
                Back to Website
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT PENDING SCREEN */}
        {step === 'pending' && (
          <div className="relative z-10 mt-5 text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-950/70 border border-amber-500/50 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <div className="text-xl font-bold text-white tracking-tight">
                Payment Verification Pending
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-1 max-w-md mx-auto">
                Your payment reference has been recorded. Our verification system or admin team is confirming the bank settlement. Please do not make another payment.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-neutral-800 text-xs font-mono text-left max-w-sm mx-auto space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-400">Order ID:</span>
                <span className="text-neutral-200">{order.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Amount:</span>
                <span className="text-amber-400 font-semibold">{formattedAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Submitted UTR:</span>
                <span className="text-neutral-200">{utrNumber || 'Under processing'}</span>
              </div>
            </div>

            <div className="flex gap-2 max-w-sm mx-auto pt-2">
              <button
                type="button"
                onClick={() => setStep('verifying')}
                className="w-1/2 py-2.5 px-3 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
              >
                Re-check UTR
              </button>
              <button
                type="button"
                onClick={handleManualVerificationPending}
                className="w-1/2 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 font-mono font-bold text-white text-xs uppercase transition-colors cursor-pointer"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PAYMENT FAILURE SCREEN */}
        {step === 'failed' && (
          <div className="relative z-10 mt-5 text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(244,63,94,0.3)]">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xl font-bold text-white tracking-tight">
                Payment Could Not Be Verified
              </div>
              <p className="text-xs text-rose-300/90 font-mono mt-1 max-w-md mx-auto">
                {errorMessage || 'The submitted reference could not be verified automatically against the locked package amount.'}
              </p>
            </div>

            <div className="flex gap-2.5 max-w-sm mx-auto pt-2">
              <button
                type="button"
                onClick={() => setStep('verifying')}
                className="w-1/2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-[#e61e2b] font-mono font-bold text-white text-xs uppercase cursor-pointer"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-1/2 py-2.5 px-3 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-neutral-300 cursor-pointer"
              >
                Choose Another App
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
