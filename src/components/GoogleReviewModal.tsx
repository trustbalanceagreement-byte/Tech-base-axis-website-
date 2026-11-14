import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ExternalLink } from 'lucide-react';

export const GOOGLE_REVIEW_URL = 'https://g.page/r/CWplRg0jq_l5EBM/review';

interface GoogleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const GoogleReviewModal: React.FC<GoogleReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl bg-[#111116] border border-neutral-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-10 my-4"
          >
            {/* Red Accent Top Border */}
            <div className="h-1 w-full bg-gradient-to-r from-[#e61e2b] via-red-500 to-[#e61e2b]" />

            {/* Header */}
            <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-neutral-800/80 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.1.74-2.5 1.18-4.22 1.18-3.24 0-5.99-2.19-6.97-5.13H1.03v3.14C3.04 21.18 7.2 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.03 14.04A7.19 7.19 0 0 1 4.65 12c0-.71.13-1.4.38-2.04V6.82H1.03A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.03 5.18l4-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.77c1.8 0 3.41.62 4.68 1.84l3.51-3.51C18.07 1.19 15.3 0 12 0 7.2 0 3.04 2.82 1.03 6.82l4 3.14C6.01 6.96 8.76 4.77 12 4.77Z"
                  />
                </svg>
                <div className="min-w-0">
                  <h3 className="font-display text-base sm:text-lg text-white font-bold tracking-tight truncate">
                    Google Business Profile Review
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer shrink-0"
                aria-label="Close Google review dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Google Review Iframe */}
            <div className="relative w-full h-[60vh] min-h-[380px] max-h-[560px] bg-neutral-950">
              <iframe
                src={GOOGLE_REVIEW_URL}
                title="Google Business Profile Review"
                className="w-full h-full border-0 bg-white"
                allow="geolocation; clipboard-write"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Footer Controls */}
            <div className="px-4 sm:px-6 py-3.5 border-t border-neutral-800/80 bg-[#0e0e12] flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#e61e2b]" />
                <span>Open directly if blocked by browser</span>
              </a>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={onReviewSubmitted}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e61e2b] hover:bg-[#c81924] text-white font-semibold text-xs font-mono tracking-wide shadow-[0_0_18px_rgba(230,30,43,0.4)] transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I've Submitted Review</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
