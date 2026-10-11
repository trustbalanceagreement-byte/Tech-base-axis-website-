import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavSection } from '../types';
import { TechBaseAxisLogo } from './TechBaseAxisLogo';
import founderImage from '../assets/images/bikram-ghosh-lead-architect-kolkata.webp';
import companyCoverAiImage from '../assets/images/tech-base-axis-engineering-hq-kolkata.webp';
import { 
  ArrowUpRight, 
  Sparkles, 
  RefreshCw, 
  Send, 
  Code2, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  ExternalLink 
} from 'lucide-react';

interface AboutSectionProps {
  onNavigate: (section: NavSection) => void;
  onExplorePackages?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onNavigate,
  onExplorePackages
}) => {
  const [isCompanyMode, setIsCompanyMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const handleToggle = () => {
    setIsCompanyMode((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <section 
      id="about-section"
      className="relative w-full max-w-7xl mx-auto px-1.5 sm:px-6 lg:px-8 py-4 sm:py-6"
    >
      <div className="bg-[#0e0e11] rounded-xl sm:rounded-2xl border border-neutral-800/80 overflow-hidden shadow-2xl relative">
        
        {/* Subtle Ambient Grid Background Accent */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden="true"
        />
        <div 
          className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* ============================================================ */}
        {/* HERO / PAGE HEADER AREA                                      */}
        {/* ============================================================ */}
        <div className="relative border-b border-neutral-800/70 px-4 sm:px-8 lg:px-10 py-2 sm:py-2.5 bg-gradient-to-b from-[#141419] to-[#0e0e11]">
          <div className="flex items-center justify-between">
            <div>
              {/* Dynamic Main Heading */}
              <div className="overflow-hidden flex items-center">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={isCompanyMode ? 'heading-company' : 'heading-personal'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display text-lg sm:text-2xl lg:text-3xl text-white font-black tracking-tight uppercase leading-none"
                  >
                    {isCompanyMode ? 'About Company' : 'About Me'}
                  </motion.h2>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TWO-COLUMN LAYOUT: 3D CARD (LEFT) + RICH CONTENT (RIGHT)      */}
        {/* ============================================================ */}
        <div className="px-4 sm:px-8 lg:px-10 py-8 sm:py-12 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* -------------------------------------------------------- */}
            {/* LEFT COLUMN: 3D FLIPPABLE IMAGE CARD                     */}
            {/* -------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div 
                className="w-full max-w-[360px] sm:max-w-[400px] [perspective:1200px]"
              >
                {/* 3D Flipper Container */}
                <div
                  id="about-card-flipper"
                  role="button"
                  tabIndex={0}
                  aria-label={isCompanyMode ? 'Currently showing Tech Base Axis company card. Click or press Enter to flip to Bikram Ghosh personal photo.' : 'Currently showing Bikram Ghosh personal photo. Click or press Enter to flip to Tech Base Axis company card.'}
                  onClick={handleToggle}
                  onKeyDown={handleKeyDown}
                  className="relative w-full aspect-[4/5] rounded-2xl cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transition: prefersReducedMotion 
                      ? 'opacity 0.3s ease' 
                      : 'transform 0.85s cubic-bezier(0.23, 1, 0.32, 1)',
                    transform: isCompanyMode ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >

                  {/* =================================================== */}
                  {/* FRONT SIDE: BIKRAM GHOSH PERSONAL PHOTO             */}
                  {/* =================================================== */}
                  <div 
                    className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/90 shadow-2xl flex flex-col group-hover:border-red-600/40 group-hover:scale-[1.01] transition-all duration-300"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Background Radial Glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
                    
                    {/* Founder Photo */}
                    <img
                      src={founderImage}
                      alt="Bikram Ghosh, founder and web developer at Tech Base Axis, architecting modern digital systems in Kolkata"
                      className="w-full h-full object-cover object-top filter grayscale contrast-125 brightness-95 group-hover:contrast-110 group-hover:brightness-100 transition-all duration-500"
                    />

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-20 space-y-1">
                      <div className="flex items-center text-xs font-mono text-neutral-400">
                        <span>Age: 22 Years</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                        Bikram Ghosh
                      </h3>
                      <p className="text-xs text-neutral-300 font-mono">
                        Web Developer & Digital Systems Architect
                      </p>
                    </div>
                  </div>

                  {/* =================================================== */}
                  {/* BACK SIDE: TECH BASE AXIS COMPANY AI COVER PHOTO   */}
                  {/* =================================================== */}
                  <div 
                    className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-[#0a0a0d] border border-red-950/60 shadow-2xl group-hover:border-red-600/50 group-hover:scale-[1.01] transition-all duration-300"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    {/* Full Card AI Photo */}
                    <img
                      src={companyCoverAiImage}
                      alt="Tech Base Axis - Enterprise software engineering and web development headquarters in Kolkata"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center filter brightness-100 contrast-110 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Gradient Overlay for Sleek Obsidian Theme Depth */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" 
                      aria-hidden="true" 
                    />

                    {/* Subtle Red Rim Highlight on bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#e61e2b] to-transparent opacity-80" />
                  </div>

                </div>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* RIGHT COLUMN: SYNCHRONIZED TEXT CONTENT & ACTION BUTTON   */}
            {/* -------------------------------------------------------- */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {!isCompanyMode ? (
                  /* =================================================== */
                  /* SECTION 1 CONTENT: ABOUT ME (BIKRAM GHOSH)          */
                  /* =================================================== */
                  <motion.div
                    key="content-personal"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-5"
                  >
                    {/* Small Eyebrow Label */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono uppercase tracking-wider text-[#e61e2b] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e61e2b]" />
                      <span className="font-bold font-['Times_New_Roman',_Times,_serif]">About Me</span>
                    </div>

                    {/* Main Heading */}
                    <h3 className="font-display text-xl sm:text-2xl lg:text-3xl text-white font-bold tracking-tight leading-snug">
                      Building Digital Experiences That Make an Impact
                    </h3>

                    {/* Professional Paragraph */}
                    <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
                      Hi, I’m Bikram Ghosh, a 22-year-old web developer passionate about creating modern, responsive and high-performance websites. I focus on combining clean design, smooth user experiences and powerful web technologies to build digital experiences that are both visually impressive and functional.
                    </p>

                    {/* Quick Core Strengths Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                        <Code2 className="w-5 h-5 text-[#e61e2b] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-mono uppercase text-neutral-400">Architecture</div>
                          <div className="text-sm font-semibold text-white">Clean & High-Performance</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                        <Zap className="w-5 h-5 text-[#e61e2b] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-mono uppercase text-neutral-400">User Experience</div>
                          <div className="text-sm font-semibold text-white">Responsive & Visually Fluid</div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Me Button */}
                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        id="about-contact-me-btn"
                        onClick={() => onNavigate('contact')}
                        className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#e61e2b] hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-[0_0_25px_rgba(230,30,43,0.4)] hover:shadow-[0_0_35px_rgba(230,30,43,0.6)] active:scale-95 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Contact Me</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggle}
                        className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <span>Learn about Tech Base Axis</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#e61e2b]" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* =================================================== */
                  /* SECTION 2 CONTENT: ABOUT COMPANY (TECH BASE AXIS)   */
                  /* =================================================== */
                  <motion.div
                    key="content-company"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-6"
                  >
                    {/* Small Eyebrow Label */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono uppercase tracking-wider text-[#e61e2b] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e61e2b]" />
                      <span className="font-bold font-['Times_New_Roman',_Times,_serif]">About Company</span>
                    </div>

                    {/* Main Heading */}
                    <h3 className="font-display text-xl sm:text-2xl lg:text-3xl text-white font-bold tracking-tight leading-snug">
                      Technology Built Around Your Vision
                    </h3>

                    {/* Company Description 1 */}
                    <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
                      Tech Base Axis is a modern web development company dedicated to building professional, responsive and high-performance websites. We combine modern UI/UX design, clean development practices, responsive layouts and smooth interactive experiences to help businesses establish a strong digital presence.
                    </p>

                    {/* Company Description 2 */}
                    <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
                      At Tech Base Axis, we transform ideas into functional digital products through thoughtful design, modern technologies and user-focused development. Every project is built with attention to performance, usability, responsiveness and visual quality.
                    </p>

                    {/* Key Company Value Drivers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                        <Layers className="w-5 h-5 text-[#e61e2b] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-mono uppercase text-neutral-400">Digital Solutions</div>
                          <div className="text-sm font-semibold text-white">Full-Stack Web & UI/UX</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                        <ShieldCheck className="w-5 h-5 text-[#e61e2b] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-mono uppercase text-neutral-400">Quality Standard</div>
                          <div className="text-sm font-semibold text-white">Performance & Usability</div>
                        </div>
                      </div>
                    </div>

                    {/* Explore Tech Base Axis Button */}
                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        id="about-explore-company-btn"
                        onClick={() => {
                          if (onExplorePackages) {
                            onExplorePackages();
                          } else {
                            onNavigate('packages');
                          }
                        }}
                        className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#e61e2b] hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-[0_0_25px_rgba(230,30,43,0.4)] hover:shadow-[0_0_35px_rgba(230,30,43,0.6)] active:scale-95 cursor-pointer"
                      >
                        <span>Explore Tech Base Axis</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
