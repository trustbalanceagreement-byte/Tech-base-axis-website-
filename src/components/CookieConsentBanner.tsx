import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Shield, Check, X, ArrowRight } from 'lucide-react';
import { NavSection } from '../types';

const COOKIE_STORAGE_KEY = 'techbaseaxis_cookie_consent_v1';

interface CookieConsentBannerProps {
  onNavigate?: (section: NavSection) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [hasChoice, setHasChoice] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!stored) {
        // Slight delay so the page loads smoothly before showing the consent banner
        const timer = setTimeout(() => {
          setIsVisible(true);
          setHasChoice(false);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (_) {
      // Ignore storage errors in private browsing
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({
        choice: 'all',
        timestamp: new Date().toISOString()
      }));
    } catch (_) {}
    setIsVisible(false);
    setHasChoice(true);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({
        choice: 'essential',
        timestamp: new Date().toISOString()
      }));
    } catch (_) {}
    setIsVisible(false);
    setHasChoice(true);
  };

  const handleOpenPreferences = () => {
    setIsVisible(true);
  };

  return (
    <>
      {/* Floating Re-Open Trigger (Subtle button on bottom-left when banner is dismissed) */}
      {hasChoice && !isVisible && (
        <button
          type="button"
          onClick={handleOpenPreferences}
          title="Cookie & Privacy Preferences"
          aria-label="Cookie Preferences"
          className="fixed bottom-3 left-3 z-40 p-2 rounded-full bg-[#121216]/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 shadow-lg backdrop-blur-md transition-all hover:scale-105 cursor-pointer opacity-70 hover:opacity-100"
        >
          <Cookie className="w-4 h-4 text-[#e61e2b]" />
        </button>
      )}

      {/* Main Cookie Consent Banner */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-3 sm:bottom-5 inset-x-3 sm:inset-x-6 max-w-4xl mx-auto z-50 pointer-events-auto"
          >
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0d0d12]/95 border border-neutral-800/90 shadow-[0_15px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Left: Icon & Description */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-950/70 border border-red-500/30 text-[#e61e2b] flex items-center justify-center shrink-0 mt-0.5">
                    <Cookie className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white font-mono">Cookie & Privacy Consent</h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                        GDPR & DPDP
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed font-sans">
                      We use essential functional cookies and secure storage tokens to guarantee fast page rendering, maintain your session state, and protect payments. We do not sell your data or use intrusive ad trackers.
                    </p>

                    {onNavigate && (
                      <div className="pt-0.5 flex items-center gap-3 text-[11px] font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate('privacy');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-[#e61e2b] hover:text-red-400 underline cursor-pointer flex items-center gap-1"
                        >
                          <span>Privacy Policy</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <span className="text-neutral-600">•</span>
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate('terms');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
                        >
                          Terms & Refund Policy
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={handleEssentialOnly}
                    className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 text-xs font-mono font-medium transition-colors cursor-pointer text-center"
                  >
                    Essential Only
                  </button>

                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-[#e61e2b] to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(230,30,43,0.35)] cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept All</span>
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
