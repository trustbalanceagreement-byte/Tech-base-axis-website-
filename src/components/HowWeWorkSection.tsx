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
  Workflow 
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
}

const SERVICES_DATA: ServiceStage[] = [
  {
    id: 'automation',
    stepNumber: '01 / 06',
    category: 'AUTOMATION',
    title: 'Automation Solutions',
    description: 'We create smart automation systems that reduce repetitive tasks, improve workflow efficiency, and help businesses save time.',
    image: imgAutomation,
    altText: 'Tech Base Axis automation development team engineering robust continuous integration and workflow systems in Kolkata',
    icon: Workflow,
    tagline: 'Streamlined Pipelines & Workflows',
    metrics: 'Up to 80% time saved on repetitive workflows'
  },
  {
    id: 'custom-app',
    stepNumber: '02 / 06',
    category: 'CUSTOM APP DEVELOPMENT',
    title: 'Custom App Development',
    description: 'We design and develop custom applications tailored to specific business requirements, user needs and workflows.',
    image: imgCustomApp,
    altText: 'Tech Base Axis custom app development engineering tailored cross-platform mobile and web applications',
    icon: Smartphone,
    tagline: 'Native & Cross-Platform Precision',
    metrics: 'Tailored UX for iOS, Android & Hybrid apps'
  },
  {
    id: 'software-dev',
    stepNumber: '03 / 06',
    category: 'SOFTWARE DEVELOPMENT',
    title: 'Software Development',
    description: 'We build scalable and reliable software solutions designed around real-world business requirements and long-term growth.',
    image: imgSoftwareDev,
    altText: 'Bikram Ghosh, lead web developer at Tech Base Axis, architecting scalable enterprise software solutions',
    icon: Code2,
    tagline: 'Fault-Tolerant Enterprise Systems',
    metrics: '99.99% uptime architecture & modular backends'
  },
  {
    id: 'web-dev',
    stepNumber: '04 / 06',
    category: 'WEB DEVELOPMENT',
    title: 'Web Development',
    description: 'We create modern, responsive and high-performance websites that work seamlessly across desktop, tablet and mobile devices.',
    image: imgWebDev,
    altText: 'Tech Base Axis web development company Kolkata building responsive, high-performance web applications',
    icon: Globe,
    tagline: 'Responsive & Sub-Second Speeds',
    metrics: '100% responsive, SEO & Core Web Vitals optimized'
  },
  {
    id: 'ai-systems',
    stepNumber: '05 / 06',
    category: 'AI & INTELLIGENT SYSTEMS',
    title: 'AI & Intelligent Systems',
    description: 'We integrate modern AI technologies to create smarter digital experiences, automation systems and intelligent business solutions.',
    image: imgAiSystems,
    altText: 'Tech Base Axis AI and intelligent systems development engineering RAG pipelines and vector intelligence',
    icon: Brain,
    tagline: 'LLMs, Reasoning & Vector Search',
    metrics: 'Real-time inference, RAG & agentic pipelines'
  },
  {
    id: 'digital-solutions',
    stepNumber: '06 / 06',
    category: 'BUSINESS DIGITAL SOLUTIONS',
    title: 'Complete Digital Solutions',
    description: 'From concept to development and deployment, we create complete digital solutions designed to solve business problems and improve digital experiences.',
    image: imgDigitalSol,
    altText: 'Complete bespoke digital business solutions delivered by Bikram Ghosh and Tech Base Axis in Kolkata',
    icon: Layers,
    tagline: 'End-to-End Execution & Growth',
    metrics: 'Full lifecycle strategy, development & cloud launch'
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

            {/* TWO-COLUMN SHOWCASE: DESKTOP TABS (LEFT) & GSAP PINNED IMAGE SHOWCASE (RIGHT) */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
              
              {/* LEFT COLUMN: Service Navigation & Synchronized Stage Details */}
              <div className="hidden sm:flex lg:col-span-5 flex-col justify-between space-y-2.5 sm:space-y-3.5 order-2 lg:order-1">
                
                {/* Desktop Step Selector List (01 to 06) */}
                <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                  {SERVICES_DATA.map((service, idx) => {
                    const isActive = idx === activeStep;
                    const ItemIcon = service.icon;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleStepClick(idx)}
                        className={`text-left w-full p-2 sm:p-2.5 rounded-xl transition-all duration-200 flex items-center justify-between border cursor-pointer ${
                          isActive
                            ? 'bg-neutral-900/95 border-red-600/70 shadow-[0_0_20px_rgba(230,30,43,0.18)] translate-x-1.5'
                            : 'bg-neutral-950/40 border-neutral-800/60 hover:border-neutral-700 hover:bg-neutral-900/40 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold transition-colors ${
                            isActive 
                              ? 'bg-[#e61e2b] text-white shadow-[0_0_10px_rgba(230,30,43,0.6)]' 
                              : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                          }`}>
                            0{idx + 1}
                          </div>
                          
                          <div className="truncate">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                              <span>{service.category}</span>
                            </div>
                            <div className={`text-xs sm:text-sm font-bold truncate ${
                              isActive ? 'text-white' : 'text-neutral-300'
                            }`}>
                              {service.title}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isActive && (
                            <span className="text-[9px] font-mono text-[#e61e2b] bg-red-950/40 border border-red-900/50 px-2 py-0.5 rounded-full animate-pulse">
                              ACTIVE
                            </span>
                          )}
                          <ItemIcon className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-[#e61e2b]' : 'text-neutral-500'
                          }`} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Synchronized Stage Detail Box (Stack of 6 DOM panels transitioned directly by GSAP) */}
                <div className="relative p-3 sm:p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 h-[108px] overflow-hidden">
                  {SERVICES_DATA.map((service, idx) => {
                    const ServiceIcon = service.icon;
                    return (
                      <div
                        key={service.id}
                        ref={(el) => { detailRefs.current[idx] = el; }}
                        className="absolute inset-0 p-3 sm:p-3.5 flex flex-col justify-between"
                        style={{
                          visibility: idx === 0 ? 'visible' : 'hidden',
                          opacity: idx === 0 ? 1 : 0,
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-xs font-mono text-neutral-400 mb-1">
                            <span className="text-[#e61e2b] font-semibold flex items-center gap-1.5">
                              <ServiceIcon className="w-3.5 h-3.5" />
                              {service.tagline}
                            </span>
                            <span className="text-neutral-500">STAGE {service.stepNumber}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans line-clamp-2">
                            {service.description}
                          </p>
                        </div>

                        {/* CTA & Metrics */}
                        <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                          <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[240px]">
                            {service.metrics}
                          </span>
                          {onNavigate && (
                            <button
                              type="button"
                              onClick={() => onNavigate('contact')}
                              className="inline-flex items-center gap-1 text-xs font-mono text-[#e61e2b] hover:text-red-400 font-bold tracking-wider transition-colors cursor-pointer shrink-0"
                            >
                              <span>EXPLORE SERVICE</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* RIGHT COLUMN: PINNED CINEMATIC IMAGE CONTAINER (CYCLED BY GSAP TIMELINE) */}
              <div className="w-full lg:col-span-7 order-1 lg:order-2">
                <div 
                  className="relative w-full h-[500px] xs:h-[540px] sm:h-[580px] md:h-[620px] lg:h-[650px] rounded-2xl border border-neutral-800/90 bg-neutral-950 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] select-none"
                  onTouchStart={handleCardTouchStart}
                  onTouchEnd={handleCardTouchEnd}
                >
                  {/* 6 Layered Slides Cycled by GSAP Timeline */}
                  {SERVICES_DATA.map((service, index) => {
                    const ServiceIcon = service.icon;
                    return (
                      <div
                        key={service.id}
                        ref={(el) => { slideRefs.current[index] = el; }}
                        className="absolute inset-0 w-full h-full flex flex-col justify-between p-3 sm:p-5 overflow-hidden rounded-2xl select-none"
                        style={{
                          opacity: index === 0 ? 1 : 0,
                          visibility: index === 0 ? 'visible' : 'hidden',
                          zIndex: index === 0 ? 20 : 1,
                        }}
                      >
                        {/* Full Image */}
                        <img
                          src={service.image}
                          alt={service.altText}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          className="absolute inset-0 w-full h-full object-cover object-center filter contrast-105 brightness-95"
                        />

                        {/* Top-edge Crimson Glow */}
                        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#e61e2b] to-transparent shadow-[0_0_16px_#e61e2b] z-30" />

                        {/* Cinematic Gradients for readability */}
                        <div className="absolute top-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-10" />
                        <div className="absolute bottom-0 inset-x-0 h-80 sm:h-96 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none z-10" />
                        <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none z-30" />



                        {/* Bottom Content Panel Overlaid on Photo (Transparent container & transparent gradient text) */}
                        <div className="relative z-20 p-2 sm:p-4 bg-transparent border-0 shadow-none mb-1 sm:mb-2">
                          <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-red-950/60 backdrop-blur-md border border-red-500/30 text-[#e61e2b] shrink-0">
                              <ServiceIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-display text-lg xs:text-xl sm:text-2xl md:text-3xl font-black leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] bg-gradient-to-r from-white via-white/95 to-white/80 bg-clip-text text-transparent">
                                {service.title}
                              </h3>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-neutral-200/90 text-xs sm:text-sm md:text-base leading-relaxed font-sans drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-2xl">
                            {service.description}
                          </p>
                        </div>
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
