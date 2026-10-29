import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NavSection } from '../types';
import { 
  Smartphone, 
  Code2, 
  Globe, 
  Brain, 
  Layers, 
  ArrowUpRight, 
  Workflow,
  CheckCircle2
} from 'lucide-react';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Import AI-generated 16:9 photorealistic corporate technology showcase images
import imgAutomation from '../assets/images/workflow-automation-systems.webp';
import imgCustomApp from '../assets/images/custom-app-development-architecture.webp';
import imgSoftwareDev from '../assets/images/enterprise-software-development-systems.webp';
import imgWebDev from '../assets/images/full-stack-web-development-kolkata.webp';
import imgAiSystems from '../assets/images/ai-intelligence-neural-systems.webp';
import imgDigitalSol from '../assets/images/bespoke-digital-business-solutions.webp';

interface HowWeWorkSectionProps {
  onNavigate?: (section: NavSection) => void;
}

interface ServiceStage {
  id: string;
  stepNumber: string;
  category: string;
  title: string;
  description: string;
  image: string;
  altText: string;
  icon: React.ElementType;
  tagline: string;
  metrics: string;
  features: string[];
}

const SERVICES_DATA: ServiceStage[] = [
  {
    id: 'automation',
    stepNumber: '01 / 06',
    category: 'AUTOMATION & WORKFLOWS',
    title: 'Automation Solutions',
    description: 'We design and engineer autonomous business workflows that connect your apps, eliminate manual data entry, and execute business logic without human intervention.',
    image: imgAutomation,
    altText: 'Tech Base Axis automation development team engineering robust continuous integration and workflow systems in Kolkata',
    icon: Workflow,
    tagline: 'Streamlined Pipelines & Workflows',
    metrics: 'Save up to 80% manual operating time',
    features: [
      'Automated multi-system data pipelines & webhooks',
      'Custom CRM, ERP, and payment gateway sync',
      'Fault-tolerant background task runners & alerts'
    ]
  },
  {
    id: 'custom-app',
    stepNumber: '02 / 06',
    category: 'MOBILE & WEB APPS',
    title: 'Custom App Development',
    description: 'From dynamic mobile apps to progressive web solutions, we build tailored software designed specifically for your unique operations, customer touchpoints, and business scale.',
    image: imgCustomApp,
    altText: 'Tech Base Axis custom app development engineering tailored cross-platform mobile and web applications',
    icon: Smartphone,
    tagline: 'Native & Cross-Platform Precision',
    metrics: '60 FPS fluid native interfaces for iOS & Android',
    features: [
      'Cross-platform React Native & Flutter architecture',
      'High-responsiveness offline-first local caching',
      'Seamless push notifications & biometric auth'
    ]
  },
  {
    id: 'software-dev',
    stepNumber: '03 / 06',
    category: 'ENTERPRISE SYSTEMS',
    title: 'Software Development',
    description: 'We engineer rock-solid backend systems, APIs, and enterprise web platforms engineered for zero downtime, heavy database throughput, and effortless long-term maintainability.',
    image: imgSoftwareDev,
    altText: 'Bikram Ghosh, lead web developer at Tech Base Axis, architecting scalable enterprise software solutions',
    icon: Code2,
    tagline: 'Scalable, High-Concurrency Architectures',
    metrics: '99.99% uptime with microservice reliability',
    features: [
      'Modular REST & GraphQL API infrastructure',
      'PostgreSQL, Redis & Cloud SQL clustering',
      'Automated CI/CD deployment & end-to-end testing'
    ]
  },
  {
    id: 'web-dev',
    stepNumber: '04 / 06',
    category: 'FULL-STACK WEB',
    title: 'Web Development',
    description: 'Modern, responsive, and performance-tuned web applications built with Next.js and React that load in under 1 second, rank on Google, and convert visitors into paying clients.',
    image: imgWebDev,
    altText: 'Tech Base Axis web development company Kolkata building responsive, high-performance web applications',
    icon: Globe,
    tagline: 'Ultra-Fast, High-Converting Web Platforms',
    metrics: 'Sub-second speeds & 95+ Core Web Vitals',
    features: [
      'Next.js SSR & edge CDN delivery',
      'Fully responsive layout across all device viewports',
      'Enterprise SEO, OpenGraph & Schema.org rich cards'
    ]
  },
  {
    id: 'ai-systems',
    stepNumber: '05 / 06',
    category: 'AI & MACHINE LEARNING',
    title: 'AI & Intelligent Systems',
    description: 'We integrate advanced generative AI, retrieval-augmented generation (RAG), and autonomous agents into your existing systems to automate analysis and deliver smarter outcomes.',
    image: imgAiSystems,
    altText: 'Tech Base Axis AI and intelligent systems development engineering RAG pipelines and vector intelligence',
    icon: Brain,
    tagline: 'Smart Reasoning, Agents & Neural Workflows',
    metrics: 'Sub-second inference & vector database retrieval',
    features: [
      'Custom LLM agent pipelines & tool calling',
      'Retrieval-Augmented Generation (RAG) over company data',
      'Automated document processing & visual recognition'
    ]
  },
  {
    id: 'digital-solutions',
    stepNumber: '06 / 06',
    category: 'BUSINESS DIGITAL SOLUTIONS',
    title: 'Complete Digital Solutions',
    description: 'A complete full-lifecycle technology partnership: we handle discovery, UI/UX architecture, custom engineering, payment integrations, domain management, and cloud maintenance.',
    image: imgDigitalSol,
    altText: 'Complete bespoke digital business solutions delivered by Bikram Ghosh and Tech Base Axis in Kolkata',
    icon: Layers,
    tagline: 'From Product Concept to Cloud Deployment',
    metrics: 'Full-stack delivery with guaranteed SLA support',
    features: [
      'Turnkey concept-to-deployment execution',
      'Secure payment gateway & custom domain setup',
      'Continuous 24/7 monitoring, security & feature updates'
    ]
  }
];

// Timeline calibration constants
const TIMELINE_DURATION = 12.3;
const PEAK_PROGRESS_POINTS = [
  0.6 / TIMELINE_DURATION,
  2.85 / TIMELINE_DURATION,
  4.95 / TIMELINE_DURATION,
  7.05 / TIMELINE_DURATION,
  9.15 / TIMELINE_DURATION,
  11.25 / TIMELINE_DURATION,
];

export const HowWeWorkSection: React.FC<HowWeWorkSectionProps> = ({ onNavigate }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerStepBadgeRef = useRef<HTMLSpanElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const activeStepRef = useRef(activeStep);
  activeStepRef.current = activeStep;

  // Touch Swipe Gesture Support
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // GSAP ScrollTrigger Setup: Fully pins & centers, then smoothly scrubs through stages
  useEffect(() => {
    const sectionEl = sectionRef.current;
    const pinEl = pinContainerRef.current;
    if (!sectionEl || !pinEl) return;

    const ctx = gsap.context(() => {
      const slides = slideRefs.current;
      const details = detailRefs.current;
      if (!slides || slides.length === 0) return;

      // Initialize slide states (using autoAlpha for 100% glitch-free visibility + opacity toggle)
      slides.forEach((slide, idx) => {
        if (!slide) return;
        if (idx === 0) {
          gsap.set(slide, { autoAlpha: 1, y: 0, scale: 1, zIndex: 20 });
        } else {
          gsap.set(slide, { autoAlpha: 0, y: 28, scale: 1.03, zIndex: 1 });
        }
      });

      // Initialize detail states
      details.forEach((detail, idx) => {
        if (!detail) return;
        if (idx === 0) {
          gsap.set(detail, { autoAlpha: 1, y: 0, zIndex: 10 });
        } else {
          gsap.set(detail, { autoAlpha: 0, y: 15, zIndex: 1 });
        }
      });

      // Master scrubbing timeline for cycling through the 6 slides & detail blocks
      const tl = gsap.timeline();

      // 1. INTRO HOLD: Container fully pins and centers before sequential transitions start
      tl.to({}, { duration: 1.2 });

      // 2. Sequential Transitions between the 6 stages
      for (let i = 1; i < SERVICES_DATA.length; i++) {
        const prevSlide = slides[i - 1];
        const currSlide = slides[i];
        const prevDetail = details[i - 1];
        const currDetail = details[i];
        const label = `step_${i}`;

        // Simultaneous, synchronized GPU-accelerated transitions
        if (prevSlide && currSlide) {
          tl.to(prevSlide, {
            autoAlpha: 0,
            y: -28,
            scale: 0.97,
            duration: 1.2,
            ease: 'power2.inOut',
            zIndex: 1,
          }, label)
          .to(currSlide, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: 'power2.inOut',
            zIndex: 20,
          }, label);
        }

        if (prevDetail && currDetail) {
          tl.to(prevDetail, {
            autoAlpha: 0,
            y: -12,
            duration: 1.0,
            ease: 'power2.inOut',
            zIndex: 1,
          }, label)
          .to(currDetail, {
            autoAlpha: 1,
            y: 0,
            duration: 1.0,
            ease: 'power2.inOut',
            zIndex: 10,
          }, label);
        }

        // Hold each stage comfortably so user can read and view
        tl.to({}, { duration: 0.9 });
      }

      // 3. OUTRO HOLD: Stage 06 is showcased in stillness before unpinning
      tl.to({}, { duration: 0.6 });

      // ScrollTrigger instance with pinning and smooth scrubbing
      const st = ScrollTrigger.create({
        trigger: sectionEl,
        start: 'top top+=64', // Aligns directly underneath the 64px fixed header
        end: () => `+=${Math.max(window.innerHeight * 2.8, 2600)}`,
        pin: pinEl,
        pinSpacing: true,
        scrub: 0.5, // Snappy, ultra-smooth response with zero lag
        anticipatePin: 1,
        animation: tl,
        onUpdate: (self) => {
          const p = self.progress;

          // Exact stage classification based on timeline points
          let currentIdx = 0;
          if (p >= 10.2 / TIMELINE_DURATION) currentIdx = 5;
          else if (p >= 8.1 / TIMELINE_DURATION) currentIdx = 4;
          else if (p >= 6.0 / TIMELINE_DURATION) currentIdx = 3;
          else if (p >= 3.9 / TIMELINE_DURATION) currentIdx = 2;
          else if (p >= 1.8 / TIMELINE_DURATION) currentIdx = 1;
          else currentIdx = 0;

          if (currentIdx !== activeStepRef.current) {
            activeStepRef.current = currentIdx;
            setActiveStep(currentIdx);
            if (headerStepBadgeRef.current) {
              headerStepBadgeRef.current.textContent = `0${currentIdx + 1} of 06`;
            }
          }
        }
      });

      scrollTriggerRef.current = st;
    }, sectionEl);

    // Refresh ScrollTrigger after DOM layout stabilizes
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener('resize', handleResize);
      ctx.revert();
    };
  }, []);

  // Synchronize slides whenever activeStep changes directly
  useEffect(() => {
    const slides = slideRefs.current;
    const details = detailRefs.current;
    if (!slides || slides.length === 0) return;

    slides.forEach((slide, idx) => {
      if (!slide) return;
      if (idx === activeStep) {
        gsap.to(slide, { autoAlpha: 1, y: 0, scale: 1, zIndex: 20, duration: 0.35, overwrite: 'auto' });
      } else {
        gsap.to(slide, { autoAlpha: 0, y: idx < activeStep ? -20 : 20, scale: 0.98, zIndex: 1, duration: 0.35, overwrite: 'auto' });
      }
    });

    details.forEach((detail, idx) => {
      if (!detail) return;
      if (idx === activeStep) {
        gsap.to(detail, { autoAlpha: 1, y: 0, zIndex: 10, duration: 0.3, overwrite: 'auto' });
      } else {
        gsap.to(detail, { autoAlpha: 0, y: 10, zIndex: 1, duration: 0.3, overwrite: 'auto' });
      }
    });
  }, [activeStep]);

  // Programmatic smooth scroll to any of the 6 stages within the pinned ScrollTrigger track
  const handleStepClick = (index: number) => {
    setActiveStep(index);
    const st = scrollTriggerRef.current;
    if (!st) return;

    const targetProgress = PEAK_PROGRESS_POINTS[index];
    const targetScroll = st.start + targetProgress * (st.end - st.start);

    // Only scroll if difference is noticeable
    if (Math.abs(window.scrollY - targetScroll) > 80) {
      window.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      handleStepClick(activeStep - 1);
    }
  };

  const handleNextStep = () => {
    if (activeStep < SERVICES_DATA.length - 1) {
      handleStepClick(activeStep + 1);
    }
  };

  const handleCardTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleCardTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;

    // Only respond to horizontal swipes and NEVER hijack vertical scrolling
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) {
        handleNextStep();
      } else {
        handlePrevStep();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <section 
      id="how-we-work"
      ref={sectionRef}
      className="relative w-full text-neutral-100"
    >
      {/* GSAP Pinned Viewport Showcase Container: Centered vertically in viewport beneath navbar */}
      <div 
        ref={pinContainerRef}
        className="w-full min-h-[calc(100dvh-64px)] flex flex-col justify-center items-center py-2 sm:py-4"
      >
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          
          {/* Main Card Container with Obsidian & Crimson Aesthetic */}
          <div className="bg-[#0e0e11] rounded-xl sm:rounded-2xl border border-neutral-800/80 shadow-[0_0_50px_rgba(0,0,0,0.85)] p-3 sm:p-5 lg:p-7 relative overflow-hidden backdrop-blur-xl">
            
            {/* Background subtle radial ambient glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

            {/* SECTION HEADER: BOLD, EXPANSIVE & SCALED */}
            <div className="relative z-10 mb-3 sm:mb-5 border-b border-neutral-800/80 pb-3 sm:pb-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 sm:gap-4">
                <div className="space-y-1 sm:space-y-1.5">
                  {/* Section Tag */}
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#e61e2b] font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e61e2b] shadow-[0_0_10px_#e61e2b]" />
                    <span>HOW WE WORK</span>
                  </div>
                  
                  {/* Large Strong Heading */}
                  <h2 className="font-display text-2xl xs:text-3xl sm:text-4xl lg:text-5xl text-white font-black tracking-tight uppercase leading-tight">
                    Building Digital Solutions <span className="text-neutral-400">That Actually Work</span>
                  </h2>
                </div>

                {/* Subtitle / Intro Paragraph */}
                <p className="hidden sm:block text-neutral-400 text-xs sm:text-sm max-w-md leading-relaxed font-sans">
                  From automation and custom applications to web development, software and intelligent digital systems, we transform ideas into reliable digital solutions built around real business needs.
                </p>
              </div>
            </div>

            {/* TWO-COLUMN SHOWCASE: DYNAMIC HEADLINE & DETAILS (LEFT) & GSAP PINNED IMAGE SHOWCASE (RIGHT) */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
              
              {/* LEFT COLUMN: Dynamic Headline & Full Details Showcase (Synchronized with active photo via GSAP) */}
              <div className="w-full lg:col-span-5 order-2 lg:order-1 flex flex-col">
                <div className="relative w-full h-[460px] xs:h-[490px] sm:h-[520px] lg:h-[580px] rounded-2xl border border-neutral-800/90 bg-[#0a0a0d] backdrop-blur-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between">
                  {/* Subtle ambient corner glow */}
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-red-950/20 rounded-full blur-2xl pointer-events-none" />

                  {/* 6 Synchronized Panels Layered on top of each other, controlled by GSAP detailRefs */}
                  <div className="relative flex-1 w-full h-full overflow-hidden">
                    {SERVICES_DATA.map((service, idx) => {
                      const ServiceIcon = service.icon;
                      return (
                        <div
                          key={service.id}
                          ref={(el) => { detailRefs.current[idx] = el; }}
                          className="absolute inset-0 p-4 xs:p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-y-auto"
                          style={{
                            visibility: idx === 0 ? 'visible' : 'hidden',
                            opacity: idx === 0 ? 1 : 0,
                            zIndex: idx === 0 ? 10 : 1,
                          }}
                        >
                          {/* Content Area */}
                          <div className="space-y-3 sm:space-y-4">
                            {/* PROMINENT HEADLINE (matches active photo, e.g. "Complete Digital Solutions") */}
                            <h3 className="font-display text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight pt-1">
                              {service.title}
                            </h3>

                            {/* Tagline */}
                            <div className="text-xs sm:text-sm font-mono text-[#e61e2b] font-semibold flex items-center gap-2">
                              <ServiceIcon className="w-4 h-4" />
                              <span>{service.tagline}</span>
                            </div>

                            {/* Rich Description */}
                            <p className="text-xs sm:text-sm lg:text-base text-neutral-300 leading-relaxed font-sans pt-1">
                              {service.description}
                            </p>

                            {/* Key Deliverable Highlights */}
                            <div className="pt-2 space-y-2">
                              {service.features.map((feat, fIdx) => (
                                <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                                  <CheckCircle2 className="w-4 h-4 text-[#e61e2b] shrink-0 mt-0.5" />
                                  <span className="leading-snug">{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bottom Card Area: Clean CTA Button */}
                          {onNavigate && (
                            <div className="pt-4 border-t border-neutral-800/80 mt-auto">
                              <button
                                type="button"
                                onClick={() => onNavigate('contact')}
                                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#e61e2b] to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-xs sm:text-sm font-mono tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(230,30,43,0.3)] hover:shadow-[0_0_25px_rgba(230,30,43,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <span>Inquire About {service.title}</span>
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: PINNED CINEMATIC IMAGE CONTAINER (CYCLED BY GSAP TIMELINE) */}
              <div className="w-full lg:col-span-7 order-1 lg:order-2 flex flex-col">
                <div 
                  className="relative w-full h-[460px] xs:h-[490px] sm:h-[520px] lg:h-[580px] rounded-2xl border border-neutral-800/90 bg-neutral-950 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] select-none"
                  onTouchStart={handleCardTouchStart}
                  onTouchEnd={handleCardTouchEnd}
                >
                  {/* 6 Layered Slides Cycled by GSAP Timeline */}
                  {SERVICES_DATA.map((service, index) => {
                    return (
                      <div
                        key={service.id}
                        ref={(el) => { slideRefs.current[index] = el; }}
                        className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl select-none"
                        style={{
                          opacity: index === 0 ? 1 : 0,
                          visibility: index === 0 ? 'visible' : 'hidden',
                          zIndex: index === 0 ? 20 : 1,
                        }}
                      >
                        {/* Full Photorealistic Image */}
                        <img
                          src={service.image}
                          alt={service.altText}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          className="absolute inset-0 w-full h-full object-cover object-center filter contrast-105 brightness-100"
                        />

                        {/* Top-edge Crimson Glow */}
                        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#e61e2b] to-transparent shadow-[0_0_16px_#e61e2b] z-30" />

                        {/* Subtle edge border */}
                        <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none z-30" />
                      </div>
                    );
                  })}

                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
