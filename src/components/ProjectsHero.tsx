import React from 'react';
import {
  ArrowRight,
  Bot,
  Cloud,
  Code2,
  Lightbulb,
  LayoutDashboard,
  Rocket,
  Settings,
  ShoppingCart,
  Smartphone,
  Wrench
} from 'lucide-react';
import { Project, NavSection } from '../types';

interface ProjectsHeroProps {
  projects: Project[];
  onNavigate: (section: NavSection) => void;
}

const delay = (ms: number, floatMs = 1000): React.CSSProperties =>
  ({ ['--d' as any]: `${ms}ms`, ['--fd' as any]: `${floatMs}ms` });

interface TechCardProps {
  icon: React.ReactNode;
  label: string;
  color: string; // rgb triplet, e.g. "96,165,250"
  className?: string;
  style?: React.CSSProperties;
}

const TechCard: React.FC<TechCardProps> = ({ icon, label, color, className = '', style }) => (
  <div
    className={`tba-rise tba-float flex flex-col items-center justify-center gap-1 sm:gap-2 rounded-2xl px-2 py-2.5 sm:px-4 sm:py-4 backdrop-blur-sm ${className}`}
    style={{
      background: `linear-gradient(160deg, rgba(${color},0.14), rgba(10,10,13,0.85))`,
      border: `1px solid rgba(${color},0.55)`,
      boxShadow: `0 0 28px rgba(${color},0.16)`,
      color: `rgb(${color})`,
      ...style
    }}
  >
    <span className="block [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-10 sm:[&>svg]:h-10">{icon}</span>
    <span className="text-[11px] sm:text-sm font-mono text-neutral-200">{label}</span>
  </div>
);

const FlowCard: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <div
    className={`tba-rise tba-float flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-sm ${className}`}
    style={style}
  >
    {[
      { icon: <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Idea' },
      { icon: <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Build' },
      { icon: <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Deploy' }
    ].map((step, i) => (
      <React.Fragment key={step.label}>
        {i > 0 && <ArrowRight className="w-4 h-4 text-neutral-500 tba-nudge shrink-0" />}
        <div className="flex flex-col items-center gap-1 text-neutral-400">
          {step.icon}
          <span className="text-[10px] sm:text-[11px] font-mono">{step.label}</span>
        </div>
      </React.Fragment>
    ))}
  </div>
);

export const ProjectsHero: React.FC<ProjectsHeroProps> = () => {
  return (
    <section className="relative isolate mb-3 sm:mb-12 lg:min-h-[30rem]">
      {/* Faint grid + glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-10 bottom-0 -z-10">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[34rem] max-w-full h-56 rounded-full bg-red-700/15 blur-[110px]" />
        <div className="absolute top-8 right-0 w-72 h-72 rounded-full bg-violet-600/10 blur-[110px]" />
      </div>

      {/* ---------- Desktop: floating cards around the headline ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
        {/* connecting lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
          <path d="M596 70 L620 70" className="tba-dash" fill="none" stroke="rgba(180,160,255,0.4)" strokeWidth="1.4" />
          <path d="M724 70 L800 70" className="tba-dash" fill="none" stroke="rgba(180,160,255,0.35)" strokeWidth="1.4" />
          <path d="M690 152 C 700 200, 780 210, 790 258" className="tba-dash" fill="none" stroke="rgba(110,231,160,0.35)" strokeWidth="1.4" />
          <path d="M910 115 C 930 150, 930 180, 930 208" className="tba-dash" fill="none" stroke="rgba(180,160,255,0.35)" strokeWidth="1.4" />
        </svg>

        <Settings className="absolute left-[6%] top-[18%] w-9 h-9 text-neutral-700 tba-spin-slow" />
        <Code2 className="absolute left-[11%] top-[66%] w-10 h-10 text-neutral-700 tba-float" style={delay(500, 400)} />
        <Smartphone className="absolute left-[80%] top-[74%] w-9 h-9 text-neutral-700 tba-float" style={delay(700, 1400)} />

        <TechCard
          icon={<Bot />}
          label="Automation"
          color="214,180,90"
          className="absolute left-[50%] top-[0%] w-[7.5rem] h-[9.5rem] opacity-70"
          style={delay(200, 0)}
        />
        <TechCard
          icon={<Cloud />}
          label="Cloud"
          color="120,150,255"
          className="absolute left-[62%] top-[0%] w-[7.5rem] h-[9.5rem] opacity-90"
          style={delay(300, 700)}
        />
        <FlowCard className="absolute right-0 top-[2%] w-[15rem] opacity-80" style={delay(400, 300)} />
        <TechCard
          icon={<ShoppingCart />}
          label="Ecommerce"
          color="110,210,150"
          className="absolute left-[74%] top-[62%] w-[7.5rem] h-[9.5rem] opacity-70"
          style={delay(500, 1100)}
        />
        <TechCard
          icon={<LayoutDashboard />}
          label="Software Apps"
          color="170,130,255"
          className="absolute right-0 top-[50%] w-[11rem] h-[9.5rem] opacity-90"
          style={delay(600, 500)}
        />
      </div>

      {/* ---------- Copy ---------- */}
      <div className="relative z-10 mx-auto max-w-4xl lg:max-w-5xl xl:max-w-6xl text-center pt-0 pb-4 sm:pt-2 sm:pb-12 lg:pt-20 lg:pb-16">
        <h1
          className="tba-rise font-sans font-extrabold text-white tracking-tight leading-[1.08] text-[clamp(1.9rem,8vw,2.75rem)] sm:text-5xl lg:text-[2.6rem] xl:text-5xl 2xl:text-6xl"
          style={delay(120)}
        >
          Building the Future:
          <span className="block bg-gradient-to-r from-white via-[#ffb7a8] to-[#ff3b30] bg-clip-text text-transparent tba-shimmer">
            Digital Solutions. Automation. Commerce.
          </span>
        </h1>

        <p
          className="tba-rise mt-5 mx-auto max-w-2xl text-sm sm:text-base lg:text-lg text-neutral-300 leading-relaxed"
          style={delay(240)}
        >
          Engineered by <strong className="text-white font-semibold">TECH BASE AXIS (TBA)</strong> and founder <strong className="text-white font-semibold">Bikram Ghosh</strong>. From custom software and AI automation to robust e-commerce and web platforms, we deliver high-performance digital solutions across Kalyani, Kolkata, and global markets.
        </p>
      </div>

      {/* ---------- Mobile / tablet: cards below the copy ---------- */}
      <div className="lg:hidden relative z-10 mx-auto max-w-xl pb-0 sm:pb-4 space-y-2 sm:space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <TechCard icon={<Bot />} label="Automation" color="214,180,90" style={delay(300, 0)} />
          <TechCard icon={<Cloud />} label="Cloud" color="120,150,255" style={delay(380, 600)} />
          <TechCard icon={<ShoppingCart />} label="Ecommerce" color="110,210,150" style={delay(460, 1100)} />
          <TechCard icon={<LayoutDashboard />} label="Software Apps" color="170,130,255" style={delay(540, 400)} />
        </div>
        <FlowCard className="w-full justify-around" style={delay(620, 800)} />
      </div>
    </section>
  );
};
