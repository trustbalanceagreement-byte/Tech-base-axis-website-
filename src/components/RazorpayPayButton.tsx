import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { launchRazorpayCheckout, RazorpayVerifyResponse } from '../services/razorpayService';

interface RazorpayPayButtonProps {
  amountInRupees: number;
  packageName: string;
  clientName?: string;
  email?: string;
  phone?: string;
  description?: string;
  className?: string;
  buttonText?: string;
  onSuccess?: (data: {
    paymentId: string;
    orderId: string;
    signature: string;
    verifyResponse: RazorpayVerifyResponse;
  }) => void;
  onError?: (errorMessage: string) => void;
  disabled?: boolean;
}

export const RazorpayPayButton: React.FC<RazorpayPayButtonProps> = ({
  amountInRupees,
  packageName,
  clientName,
  email,
  phone,
  description,
  className = '',
  buttonText,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  const handlePay = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading || disabled || isPaid) return;

    setLoading(true);
    setErrorMessage(null);
    setFallbackUrl(null);

    try {
      await launchRazorpayCheckout({
        amountInRupees,
        packageName,
        clientName,
        email,
        phone,
        description,
        onSuccess: (data) => {
          setLoading(false);
          setIsPaid(true);
          if (onSuccess) {
            onSuccess(data);
          }
        },
        onDismiss: () => {
          setLoading(false);
          // User dismissed the checkout modal
        },
        onFailure: (err) => {
          setLoading(false);
          const errorMsg = err.description || 'Payment was declined or cancelled.';
          setErrorMessage(errorMsg);
          if (err.paymentLinkUrl) {
            setFallbackUrl(err.paymentLinkUrl);
          }
          if (onError) {
            onError(errorMsg);
          }
        }
      });
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || 'Unable to open Razorpay payment gateway';
      setErrorMessage(msg);
      if (onError) {
        onError(msg);
      }
    }
  };

  if (isPaid) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Payment Verified & Confirmed</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <button
        type="button"
        onClick={handlePay}
        disabled={loading || disabled}
        className={`relative group overflow-hidden py-3 px-6 rounded-xl font-mono font-bold text-white text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_4px_25px_rgba(230,30,43,0.45)] border border-red-500/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Connecting to Razorpay...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>{buttonText || `Pay ₹${amountInRupees.toLocaleString('en-IN')} via Razorpay`}</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-normal uppercase bg-black/30 px-1.5 py-0.5 rounded border border-white/10 text-neutral-200">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Secured
            </span>
          </>
        )}
      </button>

      {fallbackUrl && (
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-white bg-red-900/80 hover:bg-red-800 border border-red-500/50 shadow-md transition-all animate-in fade-in"
        >
          <span>Pay via Razorpay Secure Portal (rzp.io)</span>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-200" />
        </a>
      )}

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-rose-400 bg-rose-950/50 p-2 rounded-lg border border-rose-600/30">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
