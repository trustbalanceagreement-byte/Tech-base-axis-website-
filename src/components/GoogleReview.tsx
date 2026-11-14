import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export const GOOGLE_REVIEW_URL = 'https://g.page/r/CWplRg0jq_l5EBM/review';
const FLAG = 'tba_google_review_clicked_at';

const GoogleG: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

/** "Review us on Google" button. Opens the Google Business Profile review page. */
export const GoogleReviewButton: React.FC = () => {
  const open = () => {
    try { localStorage.setItem(FLAG, String(Date.now())); } catch (_) {}
    window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="flex justify-center mb-5">
      <button
        type="button"
        id="google-review-btn"
        onClick={open}
        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs sm:text-sm font-mono tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      >
        <GoogleG className="w-4 h-4" />
        <span>Review us on Google</span>
      </button>
    </div>
  );
};

/**
 * Mounted once in App. When the visitor comes back to the site after tapping the Google review button,
 * shows "Thank you for the review" automatically after 1 second.
 */
export const GoogleReviewThanks: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    let hideTimer: number | undefined;

    const check = () => {
      let at = 0;
      try { at = Number(localStorage.getItem(FLAG) || 0); } catch (_) {}
      if (!at || document.visibilityState !== 'visible') return;
      // Needs a few seconds away on Google first, otherwise opening the new tab itself would trigger it.
      if (Date.now() - at < 5000) return;
      try { localStorage.removeItem(FLAG); } catch (_) {}
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setShow(true);
        hideTimer = window.setTimeout(() => setShow(false), 7000);
      }, 1000);
    };

    check();
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    window.addEventListener('pageshow', check);
    return () => {
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
      window.removeEventListener('pageshow', check);
      window.clearTimeout(timer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 bottom-6 z-[120] w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-neutral-950/95 backdrop-blur px-4 py-3 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-white">Thank you for the review!</div>
          <div className="text-xs text-neutral-400">Your feedback means a lot to Tech Base Axis.</div>
        </div>
        <button type="button" aria-label="Close" onClick={() => setShow(false)} className="p-1 text-neutral-500 hover:text-white cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
