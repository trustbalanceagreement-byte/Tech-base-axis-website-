import React, { useState } from 'react';
import { ServicePackage, NavSection, ClientInquiry } from '../types';
import { INITIAL_PACKAGES, isSubscriptionPackage, isMaintenancePackage, getDeletedPackageIds } from '../data/pricingData';
import { PackageCardSkeleton } from './ui/Skeleton';
import { 
  Check, 
  ChevronDown, 
  Terminal,
  Layers,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { PackageBookingModal, BookingPlan } from './PackageBookingModal';

interface PackagesSectionProps {
  packages?: ServicePackage[];
  onNavigate: (section: NavSection) => void;
  onSelectPackage: (pkg: ServicePackage) => void;
  onInquirySubmitted?: (inquiry: ClientInquiry) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages,
  onNavigate,
  onSelectPackage,
  onInquirySubmitted
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'milestone'>('monthly');
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  const [selectedBookingPlan, setSelectedBookingPlan] = useState<BookingPlan | null>(null);

  const handleCycleChange = (cycle: 'monthly' | 'milestone') => {
    if (cycle === billingCycle) return;
    setIsSwitching(true);
    setBillingCycle(cycle);
    setTimeout(() => {
      setIsSwitching(false);
    }, 200);
  };

  // Available packages dynamically loaded from Admin panel or initial defaults, strictly excluding deleted packages
  const deletedIds = getDeletedPackageIds();
  const rawPackages = (packages && Array.isArray(packages)) ? packages : INITIAL_PACKAGES;
  const allPackages = rawPackages.filter((p) => !deletedIds.includes(p.id));

  // Filter plans based on the active billing cycle strictly (zero overlap)
  const currentCategoryPackages = allPackages.filter((pkg) => {
    if (billingCycle === 'monthly') {
      return isSubscriptionPackage(pkg);
    }
    return isMaintenancePackage(pkg);
  });

  const displayPlans = currentCategoryPackages.map((pkg, idx) => {
    // Determine theme
    let theme: 'green' | 'blue' | 'amber' | 'red' = pkg.theme || 'green';
    if (!pkg.theme) {
      if (idx === 1 || pkg.popular) theme = 'blue';
      else if (idx === 2) theme = 'amber';
    }

    // Normalize features
    const normalizedFeatures = (pkg.features || []).map((f) => {
      if (typeof f === 'string') {
        return { text: f, included: true };
      }
      return f;
    });

    return {
      id: pkg.id,
      name: pkg.name,
      theme,
      price: pkg.price,
      period: pkg.period || (isSubscriptionPackage(pkg) ? '/month' : '/project'),
      popular: Boolean(pkg.popular),
      description: pkg.description,
      features: normalizedFeatures,
      packageRef: pkg
    };
  });

  // Project plans for the matrix table header
  const milestonePlans = allPackages.filter(isMaintenancePackage);

  const faqs = [
    {
      q: "Do I get 100% full ownership of the source code and IP?",
      a: "Yes, absolutely. Upon final milestone handoff, 100% of all intellectual property, Git repositories, deployment configurations, and documentation belong exclusively to your business. We do not retain any proprietary licenses or vendor lock-in."
    },
    {
      q: "How does the 14-Day Rapid MVP sprint work?",
      a: "Day 1-2 covers architecture blueprinting and database schema locking. Days 3-10 involve rapid core full-stack development with daily Git commits and staging deployments. Days 11-14 focus on QA, end-to-end testing, domain configuration, and final production rollout."
    },
    {
      q: "Can we customize or combine service packages?",
      a: "Certainly. While these packages reflect our most requested scopes, Tech Base Axis regularly tailors bespoke engineering scopes based on your specific requirements, existing legacy stacks, or unique infrastructure constraints."
    },
    {
      q: "What post-launch support is provided?",
      a: "All project packages include an included bug-warranty window (from 14 to 60 days depending on tier) covering zero-downtime hotfixes, runtime error monitoring, and developer handoff training."
    }
  ];

  const handleSelect = (plan: typeof displayPlans[0]) => {
    // Open Add-on customization & booking popup directly without navigating to contact
    setSelectedBookingPlan(plan);
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-neutral-100">
      {/* Background Cosmic Radial Glows */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[760px] max-w-full h-[520px] bg-indigo-900/[0.22] blur-[150px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-72 left-1/4 w-72 h-72 bg-blue-700/[0.12] blur-[130px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-80 right-1/4 w-72 h-72 bg-amber-700/[0.08] blur-[130px] pointer-events-none -z-10 rounded-full" />

      {/* Header Section Matching Uploaded Image */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="text-sm font-medium text-indigo-300 tracking-wide font-sans">
          Plans &amp; Pricing
        </div>
        
        <div className="relative inline-block pb-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
            <span>Choose Your </span>
            <span className="relative inline-block text-white">
              Plan
              {/* Red Swoop Underline accent exactly like reference image */}
              <svg 
                className="absolute -bottom-2 left-0 w-full h-3.5 text-[#e61e2b] overflow-visible" 
                viewBox="0 0 100 12" 
                fill="none" 
                preserveAspectRatio="none"
              >
                <path 
                  d="M2 9.5C28 2.5 72 2 98 8" 
                  stroke="currentColor" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                />
              </svg>
            </span>
          </h1>
        </div>

        {/* Cycle Toggle */}
        <div className="flex justify-center items-center gap-2 pt-3">
          <div className="inline-flex p-1 rounded-full bg-[#14162e]/90 border border-indigo-500/25 backdrop-blur-md shadow-lg shadow-indigo-950/50 flex-wrap justify-center">
            <button
              id="packages-filter-monthly"
              onClick={() => handleCycleChange('monthly')}
              className={`px-3.5 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Subscription Plans ({allPackages.filter(isSubscriptionPackage).length})
            </button>
            <button
              id="packages-filter-milestone"
              onClick={() => handleCycleChange('milestone')}
              className={`px-3.5 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                billingCycle === 'milestone'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Maintenance ({allPackages.filter(isMaintenancePackage).length})
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Glowing Glassmorphism Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-7xl mx-auto pt-4">
        {isSwitching ? (
          <>
            <PackageCardSkeleton />
            <PackageCardSkeleton />
            <PackageCardSkeleton />
          </>
        ) : displayPlans.length === 0 ? (
          <div className="col-span-full text-center py-12 px-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 font-mono text-sm">
            No active packages in this category. You can add new packages anytime from the Admin Panel.
          </div>
        ) : (
          displayPlans.map((plan) => {
          const isGreen = plan.theme === 'green';
          const isBlue = plan.theme === 'blue';
          const isAmber = plan.theme === 'amber';
          const isRed = plan.theme === 'red';

          return (
            <div
              key={plan.id}
              className={`rounded-[28px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative overflow-hidden h-full ${
                isGreen ? 'pricing-glass-green' : ''
              } ${
                isBlue 
                  ? 'pricing-glass-blue md:-translate-y-2 z-10' 
                  : ''
              } ${
                isAmber ? 'pricing-glass-amber' : ''
              } ${
                isRed ? 'pricing-glass-red' : ''
              }`}
            >
              {/* Subtle top ambient specular light bar */}
              <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

              <div>
                {/* Top Rounded Colored Pill Badge */}
                <div className="flex justify-center mb-5">
                  <span
                    className={`px-5 py-1 rounded-full text-xs font-bold text-white tracking-wide shadow-md ${
                      isGreen 
                        ? 'bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.7)]' 
                        : isBlue 
                        ? 'bg-[#3b82f6] shadow-[0_0_18px_rgba(59,130,246,0.8)]' 
                        : isAmber
                        ? 'bg-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.7)]'
                        : 'bg-[#e61e2b] shadow-[0_0_15px_rgba(230,30,43,0.7)]'
                    }`}
                  >
                    {plan.name}
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline justify-center gap-1.5 mb-3">
                  <span className={`font-extrabold text-white tracking-tight ${
                    isBlue ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'
                  }`}>
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-neutral-300 font-normal">
                    {plan.period}
                  </span>
                </div>

                {/* Subtitle Description */}
                <p className="text-center text-xs text-neutral-300/85 leading-relaxed max-w-[240px] mx-auto mb-6">
                  {plan.description}
                </p>

                {/* Features List with Dividers matching screenshot */}
                <div className="space-y-2.5 mb-6 text-xs sm:text-[13px]">
                  {plan.features.map((feature, fIdx) => {
                    const isDividerBefore = fIdx === 3;
                    return (
                      <React.Fragment key={fIdx}>
                        {isDividerBefore && (
                          <div className="h-[1px] bg-white/10 my-3 w-full" />
                        )}
                        <div className="flex items-center gap-2.5">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />
                          ) : (
                            <span className="w-4 h-4 shrink-0 inline-block" />
                          )}
                          <span
                            className={
                              feature.included 
                                ? 'text-neutral-200' 
                                : 'text-neutral-500 line-through/none opacity-50'
                            }
                          >
                            {feature.text}
                          </span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Glowing Rounded Button */}
              <div className="pt-4 flex justify-center">
                <button
                  id={`book-now-${plan.id}`}
                  onClick={() => handleSelect(plan)}
                  className={`w-full py-2.5 px-6 rounded-full text-xs sm:text-sm font-bold text-white transition-all duration-300 tracking-wide cursor-pointer flex items-center justify-center gap-2 ${
                    isGreen
                      ? 'bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#059669] shadow-[0_4px_20px_rgba(16,185,129,0.5)] border border-emerald-400/40 hover:scale-[1.03]'
                      : isBlue
                      ? 'bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#60a5fa] hover:to-[#2563eb] shadow-[0_6px_25px_rgba(59,130,246,0.65)] border border-blue-400/50 hover:scale-[1.03] py-3'
                      : isAmber
                      ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#d97706] shadow-[0_4px_20px_rgba(245,158,11,0.5)] border border-amber-400/40 hover:scale-[1.03]'
                      : 'bg-gradient-to-r from-[#e61e2b] to-[#b91c1c] hover:from-[#f87171] hover:to-[#b91c1c] shadow-[0_4px_20px_rgba(230,30,43,0.5)] border border-red-500/40 hover:scale-[1.03]'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Book Now</span>
                </button>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Toggle Full Comparison Matrix */}
      <div className="text-center pt-4">
        <button
          onClick={() => setShowMatrix(!showMatrix)}
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-[#e61e2b]" />
          <span>{showMatrix ? 'Hide Deliverable Matrix' : 'View Full Technical Breakdown Matrix'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMatrix ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Feature Comparison Matrix Table (Collapsible) */}
      {showMatrix && (
        <div className="glassmorphism-card rounded-2xl p-6 sm:p-8 relative overflow-hidden animate-in fade-in duration-300">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          <h2 className="text-xl font-bold text-white mb-2">Detailed Architecture Deliverable Matrix</h2>
          <p className="text-xs text-neutral-400 mb-6">
            Complete technical deliverable breakdown across development tiers.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 font-mono">
                  <th className="py-3.5 px-3">Architecture Deliverable</th>
                  <th className="py-3.5 px-3 text-emerald-400">
                    {milestonePlans[0]?.name || 'Basic MVP'} (₹{(milestonePlans[0]?.price || 1999).toLocaleString('en-IN')})
                  </th>
                  <th className="py-3.5 px-3 text-blue-400">
                    {milestonePlans[1]?.name || 'Growth SaaS'} (₹{(milestonePlans[1]?.price || 3999).toLocaleString('en-IN')})
                  </th>
                  <th className="py-3.5 px-3 text-amber-400">
                    {milestonePlans[2]?.name || 'Enterprise'} (₹{(milestonePlans[2]?.price || 7499).toLocaleString('en-IN')})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-300">
                <tr>
                  <td className="py-3.5 px-3 font-medium text-white">Turnaround Delivery</td>
                  <td className="py-3.5 px-3 font-mono">10 - 14 Days</td>
                  <td className="py-3.5 px-3 font-mono text-blue-400 font-bold">3 - 4 Weeks</td>
                  <td className="py-3.5 px-3 font-mono">6 - 8 Weeks</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-medium text-white">Codebase Ownership &amp; IP</td>
                  <td className="py-3.5 px-3 font-mono">100% Full IP</td>
                  <td className="py-3.5 px-3 font-mono text-blue-400 font-bold">100% Full IP</td>
                  <td className="py-3.5 px-3 font-mono">100% Full IP</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-medium text-white">Database &amp; Storage Architecture</td>
                  <td className="py-3.5 px-3 font-mono">PostgreSQL/Firestore</td>
                  <td className="py-3.5 px-3 font-mono text-blue-400 font-bold">Multi-tenant + Redis</td>
                  <td className="py-3.5 px-3 font-mono">Clustered HA + Kafka</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-medium text-white">AI / Gemini LLM Integration</td>
                  <td className="py-3.5 px-3 font-mono text-neutral-500">Optional Add-on</td>
                  <td className="py-3.5 px-3 font-mono text-blue-400 font-bold">Full API Integration</td>
                  <td className="py-3.5 px-3 font-mono">Multi-model Pipelines</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-medium text-white">Post-Launch Warranty</td>
                  <td className="py-3.5 px-3 font-mono">14 Days</td>
                  <td className="py-3.5 px-3 font-mono text-blue-400 font-bold">30 Days</td>
                  <td className="py-3.5 px-3 font-mono">60 Days 24/7 SLA</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Clear terms, zero surprises, and transparent engineering milestones.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="glassmorphism-card rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/10 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct Contact Banner */}
      <div className="text-center p-8 rounded-2xl glassmorphism-card max-w-xl mx-auto relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
        <h3 className="text-lg font-bold text-white mb-2">Need a custom technical scope?</h3>
        <p className="text-xs text-neutral-300 mb-5 leading-relaxed">
          Bikram Ghosh is available to review your system requirements and provide a tailored technical estimate within 24 hours.
        </p>
        <button
          onClick={() => onNavigate('contact')}
          className="px-7 py-3 rounded-full bg-gradient-to-r from-[#e61e2b] to-red-600 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs font-mono tracking-wide transition-all inline-flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer hover:scale-105"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Send Custom Inquiry</span>
        </button>
      </div>

      {/* Package Booking Confirmation Modal */}
      <PackageBookingModal
        isOpen={Boolean(selectedBookingPlan)}
        plan={selectedBookingPlan}
        onClose={() => setSelectedBookingPlan(null)}
        onConfirmBooking={(inquiry) => {
          if (onInquirySubmitted) {
            onInquirySubmitted(inquiry);
          }
        }}
        onNavigate={(section) => {
          setSelectedBookingPlan(null);
          onNavigate(section);
        }}
      />
    </div>
  );
};
