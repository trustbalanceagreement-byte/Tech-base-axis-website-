import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavSection, Project, ServicePackage } from '../types';
import { FOUNDER_INFO, EDUCATION_DATA } from '../data/mockData';
import founderImage from '../assets/images/bikram-ghosh-founder-web-developer.webp';
import { useAuth } from '../context/AuthContext';
import { AboutSection } from './AboutSection';
import { HowWeWorkSection } from './HowWeWorkSection';
import { StaggerTestimonials, TestimonialItem, INITIAL_TESTIMONIALS } from './ui/stagger-testimonials';
import { ReviewModal, NewReviewData } from './ReviewModal';
import { 
  Terminal, 
  Cpu, 
  Zap, 
  Gem, 
  Code2, 
  Server,
  Layers,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Award,
  Atom,
  Wind,
  Braces,
  Database,
  Binary,
  Boxes,
  Cloud,
  Shield,
  Bot,
  Radio,
  Flame,
  Workflow,
  Star,
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';


interface HomeSectionProps {
  onNavigate: (section: NavSection) => void;
  onSelectProject: (project: Project) => void;
  onSelectPackage?: (pkg: ServicePackage) => void;
  projects?: Project[];
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onNavigate,
  onSelectProject,
  onSelectPackage,
  projects = []
}) => {
  const { user } = useAuth();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showGoogleReviewThankYou, setShowGoogleReviewThankYou] = useState(false);
  const leftPageForReviewRef = useRef(false);
  const thankYouTimerRef = useRef<number | null>(null);
  const hideThankYouTimerRef = useRef<number | null>(null);

  const triggerGoogleReviewThankYou = useCallback(() => {
    try {
      localStorage.removeItem('tba_gbp_review_pending');
      sessionStorage.removeItem('tba_gbp_review_left');
    } catch {
      // ignore storage errors
    }
    leftPageForReviewRef.current = false;

    if (thankYouTimerRef.current !== null) {
      window.clearTimeout(thankYouTimerRef.current);
    }
    if (hideThankYouTimerRef.current !== null) {
      window.clearTimeout(hideThankYouTimerRef.current);
    }

    thankYouTimerRef.current = window.setTimeout(() => {
      setShowGoogleReviewThankYou(true);
      hideThankYouTimerRef.current = window.setTimeout(() => {
        setShowGoogleReviewThankYou(false);
      }, 7000);
    }, 1000);
  }, []);

  useEffect(() => {
    // Check if returning/redirecting back to the page after clicking the Google Business Profile review link
    try {
      const pendingTs = localStorage.getItem('tba_gbp_review_pending');
      if (pendingTs) {
        const elapsed = Date.now() - Number(pendingTs);
        if (!Number.isNaN(elapsed) && elapsed >= 0 && elapsed < 30 * 60 * 1000) {
          triggerGoogleReviewThankYou();
        } else {
          localStorage.removeItem('tba_gbp_review_pending');
          sessionStorage.removeItem('tba_gbp_review_left');
        }
      }
    } catch {
      // ignore storage errors
    }

    const markLeftPage = () => {
      try {
        if (localStorage.getItem('tba_gbp_review_pending')) {
          leftPageForReviewRef.current = true;
          sessionStorage.setItem('tba_gbp_review_left', '1');
        }
      } catch {
        // ignore storage errors
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        markLeftPage();
      } else if (document.visibilityState === 'visible') {
        handleReturnToSite();
      }
    };

    const handleReturnToSite = () => {
      try {
        const pendingTs = localStorage.getItem('tba_gbp_review_pending');
        if (!pendingTs) return;
        const elapsed = Date.now() - Number(pendingTs);
        const hasLeft =
          leftPageForReviewRef.current ||
          sessionStorage.getItem('tba_gbp_review_left') === '1' ||
          elapsed >= 1000;
        if (hasLeft) {
          triggerGoogleReviewThankYou();
        }
      } catch {
        // ignore storage errors
      }
    };

    window.addEventListener('blur', markLeftPage);
    window.addEventListener('focus', handleReturnToSite);
    window.addEventListener('pageshow', handleReturnToSite);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', markLeftPage);
      window.removeEventListener('focus', handleReturnToSite);
      window.removeEventListener('pageshow', handleReturnToSite);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (thankYouTimerRef.current !== null) {
        window.clearTimeout(thankYouTimerRef.current);
      }
      if (hideThankYouTimerRef.current !== null) {
        window.clearTimeout(hideThankYouTimerRef.current);
      }
    };
  }, [triggerGoogleReviewThankYou]);

  const handleGoogleReviewClick = () => {
    leftPageForReviewRef.current = false;
    try {
      localStorage.setItem('tba_gbp_review_pending', String(Date.now()));
      sessionStorage.removeItem('tba_gbp_review_left');
    } catch {
      // ignore storage errors
    }
  };
  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>(() => {
    try {
      const saved = localStorage.getItem('techbase_client_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...INITIAL_TESTIMONIALS];
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_TESTIMONIALS;
  });

  const handleAddReview = (data: NewReviewData) => {
    const newItem: TestimonialItem = {
      tempId: Date.now(),
      testimonial: data.testimonial,
      by: `${data.name}, ${data.role}`,
      imgSrc: data.avatar,
      rating: data.rating
    };

    const updated = [newItem, ...testimonialsList];
    setTestimonialsList(updated);

    // Alert the admin's device about the new review (admin only)
    try {
      fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'review_submitted',
          clientName: data.name,
          reviewerRole: data.role,
          rating: data.rating,
          reviewText: data.testimonial,
          idempotencyKey: `review:${newItem.tempId}`,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    } catch (_) {}

    try {
      const saved = localStorage.getItem('techbase_client_reviews');
      const prevCustom = saved ? JSON.parse(saved) : [];
      localStorage.setItem('techbase_client_reviews', JSON.stringify([newItem, ...prevCustom]));
    } catch (e) {
      console.error('Failed to save review to storage', e);
    }
  };
  return (
    <div className="space-y-12 sm:space-y-16 pb-20 text-neutral-100">
      
      {/* ============================================================ */}
      {/* PRESENTATION PANEL: "HELLO, I'M BIKRAM GHOSH" (HERO CARD)     */}
      {/* ============================================================ */}
      <motion.section 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-7xl mx-auto px-1.5 sm:px-6 lg:px-8 pt-1.5 sm:pt-6"
      >
        <div className="bg-[#0e0e11] rounded-xl sm:rounded-2xl border border-neutral-800/80 overflow-hidden shadow-2xl">
          
          {/* Content Area */}
          <div className="px-4 sm:px-8 lg:px-10 py-6 sm:py-12 lg:py-16">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column (Desktop) / Main Column */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Mobile Top Row: Headline on left, Male photo in the boxed area on right! */}
                <div className="flex items-center justify-between gap-3 sm:gap-5 md:block">
                  <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                    <h1 className="font-display text-[clamp(1.75rem,10vw,2.75rem)] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-black tracking-tight leading-[0.9] uppercase">
                      <span className="block">HELLO, I'M</span>
                      <span className="block">BIKRAM</span>
                      <span className="block">GHOSH</span>
                      <span className="sr-only"> - Web Development Company in Kolkata, Tech Base Axis</span>
                    </h1>
                  </div>

                  {/* Mobile-only photo in the hero row - enlarged, prominent & crisp */}
                  <div className="md:hidden shrink-0 relative w-36 xs:w-44 sm:w-52 h-48 xs:h-56 sm:h-64 flex items-center justify-center">
                    {/* Crimson red circle disk */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 xs:w-40 sm:w-48 h-32 xs:h-40 sm:h-48 rounded-full bg-[#e61e2b] shadow-[0_0_30px_rgba(230,30,43,0.6)] z-0" />
                    
                    {/* Male Cutout / Portrait */}
                    <div className="relative z-10 w-full h-full flex items-end justify-center" itemScope itemType="https://schema.org/Person">
                      <img
                        src="/bikram-ghosh.jpg"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = founderImage;
                        }}
                        alt="Bikram Ghosh - Founder and Full Stack Web Developer at Tech Base Axis Kolkata"
                        title="Bikram Ghosh - Web Developer in Kolkata"
                        itemProp="image"
                        fetchPriority="high"
                        loading="eager"
                        className="w-34 xs:w-42 sm:w-50 h-46 xs:h-54 sm:h-62 object-cover object-top rounded-b-xl filter grayscale contrast-125 brightness-95 drop-shadow-[0_16px_25px_rgba(0,0,0,0.9)]"
                      />
                    </div>

                    <div className="absolute -bottom-1 -left-1 z-20 px-2.5 py-0.5 rounded-md bg-black/95 border border-neutral-800 text-[10px] xs:text-[11px] font-mono text-neutral-200 shadow-md">
                      <span className="text-[#e61e2b] font-bold">FOUNDER</span>
                    </div>
                  </div>
                </div>

                {/* Tagline */}
                <div className="pt-2 pb-1">
                  <div className="flex items-center gap-2.5">
                    <span aria-hidden="true" className="font-display text-2xl sm:text-3xl md:text-4xl text-[#e61e2b] font-black leading-tight tracking-tighter shrink-0 drop-shadow-[0_0_8px_rgba(230,30,43,0.55)]">//</span>
                    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-white font-black tracking-wide uppercase leading-tight">
                      WELCOME TO MY PORTFOLIO
                    </h2>
                  </div>
                </div>

                {/* Bio Paragraph */}
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-lg">
                  Senior technical systems engineer, founder, and principal architect with over 6 years of expertise building resilient distributed cloud backends, enterprise full-stack web platforms, and generative AI reasoning pipelines that deliver verified zero-latency user experiences.
                </p>

                {/* Verified Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[
                    { value: '45+', label: 'Deployments' },
                    { value: '99.99%', label: 'Uptime SLA' },
                    { value: '3.8x', label: 'Speed Boost' },
                    { value: '6+ Yrs', label: 'Engineering' }
                  ].map((stat, sIdx) => (
                    <div key={sIdx} className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800">
                      <div className="font-display text-2xl text-[#e61e2b] font-bold">{stat.value}</div>
                      <div className="text-[11px] font-mono text-neutral-400">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3">
                  <button
                    onClick={() => onNavigate('contact')}
                    className="px-5 sm:px-6 py-3 rounded-xl bg-[#e61e2b] hover:bg-red-500 text-white font-mono font-bold text-xs tracking-wider transition-all shadow-lg shadow-red-600/25 flex items-center justify-center cursor-pointer"
                  >
                    <span>CONNECT WITH BIKRAM</span>
                  </button>
                  <button
                    onClick={() => onNavigate('packages')}
                    className="px-5 sm:px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-mono text-xs transition-colors cursor-pointer"
                  >
                    <span>VIEW PACKAGES</span>
                  </button>
                </div>
              </div>

              {/* Desktop Right Column: Commanding & High-Impact Male Portrait with Red Circle */}
              <div className="hidden md:flex md:col-span-5 items-center justify-center">
                <div className="relative w-64 md:w-72 lg:w-84 h-[320px] md:h-[380px] lg:h-[440px] flex items-center justify-center md:-translate-y-12 lg:-translate-y-24">
                  {/* Solid Crimson Red Circular Disk Accent */}
                  <div className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-56 md:w-64 lg:w-72 h-56 md:h-64 lg:h-72 rounded-full bg-[#e61e2b] shadow-[0_0_45px_rgba(230,30,43,0.5)] z-0" />
                  
                  {/* Person Cutout / Portrait in front of the red disk */}
                  <div className="relative z-10 w-full h-full flex items-end justify-center" itemScope itemType="https://schema.org/Person">
                    <img
                      src="/bikram-ghosh.jpg"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = founderImage;
                      }}
                      alt="Bikram Ghosh - Founder and Lead Full Stack Web Developer at Tech Base Axis Kolkata"
                      title="Bikram Ghosh - Web Developer in Kolkata"
                      itemProp="image"
                      fetchPriority="high"
                      loading="eager"
                      className="w-56 md:w-64 lg:w-76 h-[300px] md:h-[360px] lg:h-[420px] object-cover object-top rounded-b-2xl filter grayscale contrast-125 brightness-95 drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
                    />
                  </div>

                  {/* Subtle tech badge */}
                  <div className="absolute -bottom-2 -left-2 z-20 px-2.5 py-1 rounded-lg bg-black/90 border border-neutral-800 backdrop-blur-md text-[9px] sm:text-[10px] font-mono text-neutral-300 shadow-lg">
                    <span className="text-[#e61e2b] font-bold">TECH BASE AXIS</span> // FOUNDER
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/* PRESENTATION PANEL 2: "ABOUT ME / ABOUT COMPANY" INTERACTIVE */}
      {/* ============================================================ */}
      <AboutSection 
        onNavigate={onNavigate} 
        onExplorePackages={() => onNavigate('packages')} 
      />

      {/* ============================================================ */}
      {/* PRESENTATION PANEL 3: "MY SKILLS" (PROGRAMMING & TECH STACK) */}
      {/* ============================================================ */}
      <motion.section 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-7xl mx-auto px-1.5 sm:px-6 lg:px-8"
      >
        <div className="bg-[#0e0e11] rounded-xl sm:rounded-2xl border border-neutral-800/80 overflow-hidden shadow-2xl">
          
          {/* Content Area */}
          <div className="px-4 sm:px-10 py-8 lg:py-12 space-y-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800/70 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#e61e2b] font-semibold">
                  <span className="w-2 h-0.5 bg-[#e61e2b]" />
                  <span>CORE COMPETENCIES & STACK</span>
                </div>
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-black tracking-tight uppercase">
                  My Skills
                </h2>
              </div>
              <div className="text-xs font-mono text-neutral-400">
                // FULL-STACK & SYSTEM ARCHITECTURE
              </div>
            </div>

            {/* Skills Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              
              {/* Category 1: Programming Languages */}
              <div className="space-y-2.5 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#e61e2b] font-semibold">
                  <span className="w-2 h-0.5 bg-[#e61e2b]" />
                  <span>Programming Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "TypeScript", icon: Code2 },
                    { name: "JavaScript (ES6+)", icon: Braces },
                    { name: "Python", icon: Binary },
                    { name: "C / C++", icon: Cpu },
                    { name: "Go (Golang)", icon: Boxes },
                    { name: "SQL (Postgres)", icon: Database },
                    { name: "HTML5 & CSS3", icon: Globe },
                    { name: "Bash / Shell", icon: Terminal }
                  ].map((lang, idx) => {
                    const IconComp = lang.icon;
                    return (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900/90 border border-neutral-800 text-xs sm:text-sm font-mono text-neutral-200 hover:text-white hover:border-red-500/50 transition-colors"
                      >
                        <IconComp className="w-3.5 h-3.5 shrink-0 text-[#e61e2b]" />
                        <span>{lang.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Category 2: Frontend & Frameworks */}
              <div className="space-y-2.5 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#e61e2b] font-semibold">
                  <span className="w-2 h-0.5 bg-[#e61e2b]" />
                  <span>Frontend & Web Frameworks</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "React 19", icon: Atom },
                    { name: "TypeScript", icon: Code2 },
                    { name: "Tailwind CSS v4", icon: Wind },
                    { name: "Next.js", icon: Globe },
                    { name: "Redux Toolkit", icon: Workflow },
                    { name: "Zustand", icon: Boxes },
                    { name: "Vite", icon: Zap },
                    { name: "Motion / Animations", icon: Gem },
                    { name: "WebSockets", icon: Radio }
                  ].map((skill, idx) => {
                    const IconComp = skill.icon;
                    return (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900/90 border border-neutral-800 text-xs sm:text-sm font-mono text-neutral-200 hover:text-white hover:border-red-500/50 transition-colors"
                      >
                        <IconComp className="w-3.5 h-3.5 shrink-0 text-[#e61e2b]" />
                        <span>{skill.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Category 3: Backend, Cloud & Databases */}
              <div className="space-y-2.5 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#e61e2b] font-semibold">
                  <span className="w-2 h-0.5 bg-[#e61e2b]" />
                  <span>Backend, Cloud & Infrastructure</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Node.js & Express", icon: Server },
                    { name: "FastAPI", icon: Zap },
                    { name: "PostgreSQL", icon: Database },
                    { name: "MongoDB", icon: Layers },
                    { name: "Redis", icon: Flame },
                    { name: "Docker", icon: Boxes },
                    { name: "Kubernetes", icon: Workflow },
                    { name: "AWS & Cloud Run", icon: Cloud },
                    { name: "Kafka", icon: Radio },
                    { name: "REST & GraphQL", icon: Braces }
                  ].map((skill, idx) => {
                    const IconComp = skill.icon;
                    return (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900/90 border border-neutral-800 text-xs sm:text-sm font-mono text-neutral-200 hover:text-white hover:border-red-500/50 transition-colors"
                      >
                        <IconComp className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                        <span>{skill.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Category 4: AI & Architecture Disciplines */}
              <div className="space-y-2.5 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#e61e2b] font-semibold">
                  <span className="w-2 h-0.5 bg-[#e61e2b]" />
                  <span>AI & System Architecture</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Gemini AI / LLM Reasoning", icon: Bot },
                    { name: "Vector Embeddings & RAG", icon: Database },
                    { name: "Microservices Design", icon: Workflow },
                    { name: "OAuth & API Security", icon: Shield },
                    { name: "CI/CD & DevOps", icon: Terminal },
                    { name: "Zero-Latency Caching", icon: Zap }
                  ].map((skill, idx) => {
                    const IconComp = skill.icon;
                    return (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/30 border border-red-900/40 text-xs sm:text-sm font-mono text-red-200 hover:border-red-500 transition-colors"
                      >
                        <IconComp className="w-3.5 h-3.5 shrink-0 text-[#e61e2b]" />
                        <span>{skill.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/* SECTION: HOW WE WORK (PREMIUM INTERACTIVE SHOWCASE)           */}
      {/* ============================================================ */}
      <HowWeWorkSection onNavigate={onNavigate} />

      {/* ============================================================ */}
      {/* SECTION: CLIENT REVIEWS                                      */}
      {/* ============================================================ */}
      <motion.section 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-6 sm:pt-8"
      >
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          {/* Google Business Profile Review Button */}
          <div className="mb-5 flex justify-center">
            <a
              id="google-business-review-btn"
              href="https://g.page/r/CWplRg0jq_l5EBM/review"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGoogleReviewClick}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-neutral-900/95 hover:bg-neutral-800 border border-neutral-700/80 hover:border-[#e61e2b]/60 text-white font-semibold text-xs sm:text-sm font-mono tracking-wide shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_24px_rgba(230,30,43,0.3)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
              </svg>
              <span>Google Business Profile Review</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </a>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-black tracking-tight uppercase">
            Client Reviews
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-lg mx-auto">
            Verified feedback from CTOs, technical founders, and enterprise engineering partners.
          </p>

          {/* "Review Us" Button - Only visible when client is logged in with their account */}
          {user && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                id="review-us-btn"
                onClick={() => setIsReviewModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#e61e2b] hover:bg-[#c81924] text-white font-semibold text-xs sm:text-sm font-mono tracking-wide shadow-[0_0_20px_rgba(230,30,43,0.4)] hover:shadow-[0_0_30px_rgba(230,30,43,0.65)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <Star className="w-4 h-4 fill-white text-white" />
                <span>Review Us</span>
              </button>
            </div>
          )}
        </div>

        <StaggerTestimonials testimonials={testimonialsList} />
      </motion.section>

      {/* Interactive Review Modal */}
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmitReview={handleAddReview}
      />

      {/* Automatic Thank You Notification after returning from Google Business Profile Review */}
      <AnimatePresence>
        {showGoogleReviewThankYou && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-[#111116]/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.85)] px-4 py-3.5 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-white flex-1">
              Thank you for the review
            </p>
            <button
              type="button"
              onClick={() => setShowGoogleReviewThankYou(false)}
              aria-label="Close thank you message"
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
