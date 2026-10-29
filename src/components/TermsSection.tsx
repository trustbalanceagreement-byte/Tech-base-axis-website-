import React, { useState } from 'react';
import { NavSection } from '../types';
import { FOUNDER_INFO } from '../data/mockData';
import { 
  FileText, 
  RotateCcw, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface TermsSectionProps {
  onNavigate?: (section: NavSection) => void;
  initialTab?: 'all' | 'refund' | 'payment';
}

export const TermsSection: React.FC<TermsSectionProps> = ({ onNavigate, initialTab = 'all' }) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'refund' | 'payment'>(initialTab);
  const [expandedSection, setExpandedSection] = useState<string | null>('refund-policy');

  const toggleSection = (id: string) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  return (
    <div className="w-full min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Header Badge & Title */}
      <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-900/50 text-[11px] font-mono uppercase tracking-widest text-[#e61e2b] font-bold">
          <Scale className="w-3.5 h-3.5" />
          <span>LEGAL AGREEMENT & CLIENT GUARANTEE</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
          Terms & <span className="text-neutral-400">Conditions</span>
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Comprehensive service guidelines, transparent milestone invoicing, and our client-first Refund Policy.
        </p>

        <div className="text-xs font-mono text-neutral-500">
          Effective Date: October 2026 • Tech Base Axis & Bikram Ghosh
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        <button
          type="button"
          onClick={() => setSelectedTab('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer ${
            selectedTab === 'all'
              ? 'bg-[#e61e2b] text-white shadow-[0_0_15px_rgba(230,30,43,0.4)]'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          All Terms & Conditions
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('refund');
            setExpandedSection('refund-policy');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            selectedTab === 'refund'
              ? 'bg-[#e61e2b] text-white shadow-[0_0_15px_rgba(230,30,43,0.4)]'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#e61e2b]" />
          <span>Refund Policy</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('payment');
            setExpandedSection('payment-terms');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            selectedTab === 'payment'
              ? 'bg-[#e61e2b] text-white shadow-[0_0_15px_rgba(230,30,43,0.4)]'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment & Invoicing</span>
        </button>
      </div>

      {/* Dedicated Highlighted Refund Policy Card (Satisfies specific user focus) */}
      {(selectedTab === 'all' || selectedTab === 'refund') && (
        <div id="refund-policy-featured" className="p-5 sm:p-7 rounded-2xl bg-[#110e10] border-2 border-red-600/40 shadow-[0_0_30px_rgba(230,30,43,0.15)] mb-8 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-red-900/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center text-[#e61e2b] shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                  Tech Base Axis Strict No-Refund Policy
                </h2>
                <p className="text-xs font-mono text-neutral-400">
                  All service fees, development milestones, package purchases, and subscriptions are non-refundable.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-600/40 text-[10px] font-mono uppercase font-bold tracking-wider">
              No Refunds • All Sales Final
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-2">
              <div className="text-xs font-mono text-[#e61e2b] font-bold uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Dedicated Engineering</span>
              </div>
              <div className="text-base font-bold text-white font-sans">Immediate Resource Allocation</div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Upon order confirmation, engineering hours, developer availability, and system architecture time are reserved exclusively for your project. This committed labor time cannot be returned or recouped.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-2">
              <div className="text-xs font-mono text-[#e61e2b] font-bold uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Digital Deliverables</span>
              </div>
              <div className="text-base font-bold text-white font-sans">Proprietary Assets &amp; Code</div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                All custom source code repositories, UI/UX design mockups, and deployment architectures are digital and intangible intellectual deliverables. Once work has begun or files are shared, they cannot be returned.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-2">
              <div className="text-xs font-mono text-[#e61e2b] font-bold uppercase flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cloud &amp; Infrastructure</span>
              </div>
              <div className="text-base font-bold text-white font-sans">Non-Recoverable Expenses</div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Domain registrations, SSL certs, cloud database provisioning, hosting slots, and third-party API integration fees incur upfront, non-reversible capital expenditures paid directly to upstream providers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#e61e2b]" />
              <span>Strict Company Policy Notice:</span>
            </div>
            <p>
              Under company policy, <strong className="text-white">Tech Base Axis does not offer refunds, chargebacks, or payment reversals under any circumstances</strong>. All payments made—including advance deposits, milestone disbursements, monthly maintenance retainers, and package tier purchases—are strictly final and non-refundable once an order is placed or work commences.
            </p>
            <p className="text-neutral-400 text-xs">
              We strongly advise all clients to thoroughly review package specifications, architecture plans, and project scopes before proceeding with payment. If you have questions regarding our terms or project feasibility, please contact us directly at <a href={`mailto:${FOUNDER_INFO.email}`} className="text-[#e61e2b] font-mono hover:underline">{FOUNDER_INFO.email}</a> prior to booking.
            </p>
          </div>
        </div>
      )}

      {/* Main Legal Clauses Accordion */}
      <div className="space-y-4 mb-12">
        {/* Clause 1: Services Scope */}
        {(selectedTab === 'all') && (
          <div className="rounded-xl border border-neutral-800/80 bg-[#0c0c10] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('scope')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-900/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-900 text-[#e61e2b] border border-neutral-800 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  1. Scope of Services & Architectural Delivery
                </h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-200 shrink-0 ${expandedSection === 'scope' ? 'rotate-180 text-white' : ''}`} />
            </button>
            {expandedSection === 'scope' && (
              <div className="px-4 sm:px-6 pb-5 pt-1 border-t border-neutral-800/60 text-sm text-neutral-300 space-y-3 leading-relaxed">
                <p>
                  Tech Base Axis provides professional bespoke software development, web engineering, workflow automation, and AI system design. Each project is governed by a mutual Statement of Work (SOW) or package specification detailing deliverables, turnaround times, and milestones.
                </p>
                <p>
                  Any scope additions requested after milestone sign-off will be quoted as separate add-on modules to ensure clear project timelines.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Clause 2: Payment Terms */}
        {(selectedTab === 'all' || selectedTab === 'payment') && (
          <div className="rounded-xl border border-neutral-800/80 bg-[#0c0c10] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('payment-terms')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-900/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-900 text-[#e61e2b] border border-neutral-800 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  2. Payment Schedules, Invoicing & Taxes
                </h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-200 shrink-0 ${expandedSection === 'payment-terms' ? 'rotate-180 text-white' : ''}`} />
            </button>
            {expandedSection === 'payment-terms' && (
              <div className="px-4 sm:px-6 pb-5 pt-1 border-t border-neutral-800/60 text-sm text-neutral-300 space-y-3 leading-relaxed">
                <ul className="space-y-2.5 pl-4 list-disc text-neutral-300">
                  <li>
                    <strong className="text-white">Currencies & Payment Methods:</strong> All package rates are denominated in Indian Rupees (INR / ₹) or US Dollars (USD / $) for international clientele. Payments are processed securely via Razorpay, UPI QR, or direct bank transfer.
                  </li>
                  <li>
                    <strong className="text-white">Milestone Invoicing:</strong> Custom projects follow a 50% initial commitment deposit prior to architecture development, with remaining balance payable upon milestone demos and formal cloud deployment.
                  </li>
                  <li>
                    <strong className="text-white">Recurring Maintenance Plans &amp; No Refunds:</strong> Monthly maintenance and server monitoring subscriptions are billed at the beginning of each 30-day service cycle and are non-refundable. You may cancel your subscription renewal at any time prior to the next billing date, but processed payments are final and non-refundable.
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Clause 3: Intellectual Property */}
        {(selectedTab === 'all') && (
          <div className="rounded-xl border border-neutral-800/80 bg-[#0c0c10] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('ip')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-900/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-900 text-[#e61e2b] border border-neutral-800 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  3. Intellectual Property Rights & Code Ownership
                </h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-200 shrink-0 ${expandedSection === 'ip' ? 'rotate-180 text-white' : ''}`} />
            </button>
            {expandedSection === 'ip' && (
              <div className="px-4 sm:px-6 pb-5 pt-1 border-t border-neutral-800/60 text-sm text-neutral-300 space-y-3 leading-relaxed">
                <p>
                  <strong className="text-white">100% Client Code Ownership:</strong> Upon complete settlement of all agreed project milestone fees, 100% of the custom application source code, UI designs, and database schemas are irrevocably assigned and transferred to the client.
                </p>
                <p>
                  Tech Base Axis retains the right to reference non-confidential project titles and publicly accessible URLs in portfolio case studies, unless an explicit Non-Disclosure Agreement (NDA) has been executed prior to project start.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Clause 4: Post-Launch Bug Warranty */}
        {(selectedTab === 'all') && (
          <div className="rounded-xl border border-neutral-800/80 bg-[#0c0c10] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('warranty')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-900/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-900 text-[#e61e2b] border border-neutral-800 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  4. 30-Day Bug Warranty & Post-Launch Support
                </h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-200 shrink-0 ${expandedSection === 'warranty' ? 'rotate-180 text-white' : ''}`} />
            </button>
            {expandedSection === 'warranty' && (
              <div className="px-4 sm:px-6 pb-5 pt-1 border-t border-neutral-800/60 text-sm text-neutral-300 space-y-3 leading-relaxed">
                <p>
                  All completed bespoke projects delivered by Tech Base Axis include a <strong className="text-white">complimentary 30-day post-launch warranty period</strong>. Any bugs, functional defects, or regressions identified within the original scope will be patched and resolved at zero additional cost.
                </p>
                <p className="text-xs text-neutral-400">
                  Ongoing maintenance, future feature requests, or third-party API deprecations after the 30-day warranty are covered under our monthly maintenance tiers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Clause 5: Jurisdiction */}
        {(selectedTab === 'all') && (
          <div className="rounded-xl border border-neutral-800/80 bg-[#0c0c10] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('jurisdiction')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-900/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-900 text-[#e61e2b] border border-neutral-800 shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  5. Governing Law & Dispute Resolution
                </h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-200 shrink-0 ${expandedSection === 'jurisdiction' ? 'rotate-180 text-white' : ''}`} />
            </button>
            {expandedSection === 'jurisdiction' && (
              <div className="px-4 sm:px-6 pb-5 pt-1 border-t border-neutral-800/60 text-sm text-neutral-300 space-y-3 leading-relaxed">
                <p>
                  These terms are governed by the laws of India. Any unresolved dispute arising out of or in connection with our services shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-white">Kolkata, West Bengal, India</strong>.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom CTA Banner */}
      <div className="p-6 rounded-2xl bg-[#0d0d11] border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-sm font-bold text-white font-mono">Have questions regarding our no-refund policy or project terms?</div>
          <p className="text-xs text-neutral-400">We provide direct architecture consultations and clear scope agreements before accepting any assignment.</p>
        </div>

        {onNavigate && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('privacy')}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              <span>Privacy Policy</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-md shadow-red-600/30"
            >
              <span>Talk to Bikram Ghosh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
