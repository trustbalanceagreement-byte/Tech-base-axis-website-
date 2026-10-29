import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NavSection } from '../types';
import { FOUNDER_INFO } from '../data/mockData';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  Server, 
  UserCheck, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight, 
  CreditCard, 
  Cookie,
  Mail,
  ChevronDown
} from 'lucide-react';

interface PrivacyPolicySectionProps {
  onNavigate?: (section: NavSection) => void;
}

export const PrivacyPolicySection: React.FC<PrivacyPolicySectionProps> = ({ onNavigate }) => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('data-collection');

  const toggleAccordion = (id: string) => {
    setActiveAccordion(prev => prev === id ? null : id);
  };

  const coreGuarantees = [
    {
      icon: Lock,
      title: 'Zero Data Resale',
      desc: 'We never sell, rent, or monetize your personal or company information to third-party advertisers.'
    },
    {
      icon: ShieldCheck,
      title: 'TLS 1.3 Encryption',
      desc: 'All inquiries, messages, and transactional data are encrypted in transit and protected with strict cloud security.'
    },
    {
      icon: CreditCard,
      title: 'Secure Payment Flow',
      desc: 'Transactions are processed via RBI-licensed gateways (Razorpay & direct UPI). We never store raw card numbers or UPI PINs.'
    },
    {
      icon: UserCheck,
      title: 'Full User Rights',
      desc: 'You retain full rights to inspect, update, export, or request the complete deletion of your data at any time.'
    }
  ];

  const sections = [
    {
      id: 'data-collection',
      title: '1. What Data We Collect',
      icon: Database,
      content: (
        <div className="space-y-4 text-neutral-300 text-sm leading-relaxed">
          <p>
            When you visit or interact with the <strong className="text-white">Tech Base Axis</strong> platform (accessible via <span className="text-[#e61e2b] font-mono">tbaonline.online</span>), we may collect the following categories of information:
          </p>
          <ul className="space-y-2.5 pl-4 list-disc text-neutral-300">
            <li>
              <strong className="text-white">Direct Inquiries & Project Briefs:</strong> When you submit a project inquiry, request a package, or book a consultation, we collect your full name, work email address, phone/WhatsApp number, project requirements, budget bracket, and optional timeline details.
            </li>
            <li>
              <strong className="text-white">Account Information (When Signed In):</strong> If you sign in via Google OAuth or credentials to access the Client Portal or Admin Center, we store your authenticated name, verified email, profile avatar, and system role.
            </li>
            <li>
              <strong className="text-white">Payment & Billing Records:</strong> When you purchase packages or maintenance subscriptions, our payment partner (Razorpay) provides us with transaction confirmation IDs, payment status, amount paid, and invoice identifiers. We never store credit/debit card numbers, CVVs, or UPI PINs on our servers.
            </li>
            <li>
              <strong className="text-white">Technical Telemetry & Analytics:</strong> Standard server logs, anonymized IP addresses, browser types, operating system, and session timestamps to ensure platform uptime and defend against DDoS attacks.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'data-usage',
      title: '2. How We Use Your Data',
      icon: Eye,
      content: (
        <div className="space-y-4 text-neutral-300 text-sm leading-relaxed">
          <p>
            We process your personal and business data solely for legitimate engineering, operational, and client communication purposes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="text-xs font-mono font-bold text-white mb-1">Architecture & Delivery</div>
              <p className="text-xs text-neutral-400">Analyzing your business specifications to prepare system architecture plans, mockups, and software quotes.</p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="text-xs font-mono font-bold text-white mb-1">Invoicing & Accounting</div>
              <p className="text-xs text-neutral-400">Generating formal GST/tax invoices, managing payment confirmations, and tracking maintenance milestones.</p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="text-xs font-mono font-bold text-white mb-1">Client Communication</div>
              <p className="text-xs text-neutral-400">Updating you on project progress, responding to inquiries via email or WhatsApp, and delivering milestone codebases.</p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="text-xs font-mono font-bold text-white mb-1">Security & Fraud Prevention</div>
              <p className="text-xs text-neutral-400">Detecting malicious bot traffic, verifying payment authenticity, and protecting user accounts against unauthorized access.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'data-security',
      title: '3. Data Storage & Security Standards',
      icon: Server,
      content: (
        <div className="space-y-4 text-neutral-300 text-sm leading-relaxed">
          <p>
            Tech Base Axis enforces rigorous security measures to protect your sensitive technical and personal assets:
          </p>
          <ul className="space-y-2 pl-4 list-disc text-neutral-300">
            <li><strong className="text-white">Encryption at Rest & in Transit:</strong> 256-bit AES encryption for stored data and mandatory TLS 1.3 protocol for all client-server communications.</li>
            <li><strong className="text-white">Enterprise Cloud Hosting:</strong> Secure infrastructure hosted on Google Cloud Platform and Cloudflare edge proxies with DDoS rate-limiting.</li>
            <li><strong className="text-white">Role-Based Access Control (RBAC):</strong> Only authorized engineering personnel led by founder Bikram Ghosh have access to project repositories and client inquiries.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'cookies-policy',
      title: '4. Cookies & Local Storage Policy',
      icon: Cookie,
      content: (
        <div className="space-y-4 text-neutral-300 text-sm leading-relaxed">
          <p>
            Our website uses lightweight cookies and browser LocalStorage strictly for functional and performance reasons:
          </p>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800">
              <CheckCircle2 className="w-4 h-4 text-[#e61e2b] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-mono">Essential Cookies:</strong> Required for secure session persistence, authentication tokens, and remembering your cookie consent choice.
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800">
              <CheckCircle2 className="w-4 h-4 text-[#e61e2b] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-mono">Preference Storage:</strong> Saves your pricing filter selections and package calculator state for seamless navigation.
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-400">
            You can clear cookies or adjust preferences anytime via your browser settings or our bottom Cookie Banner.
          </p>
        </div>
      )
    },
    {
      id: 'user-rights',
      title: '5. Your Data Protection Rights',
      icon: UserCheck,
      content: (
        <div className="space-y-3 text-neutral-300 text-sm leading-relaxed">
          <p>
            In compliance with applicable data protection laws (including the Digital Personal Data Protection Act and global privacy standards), you have the following rights:
          </p>
          <ul className="space-y-2 pl-4 list-disc text-neutral-300">
            <li><strong className="text-white">Right to Access:</strong> Request a full copy of the personal information we hold about you.</li>
            <li><strong className="text-white">Right to Rectification:</strong> Request correction of inaccurate or outdated contact information.</li>
            <li><strong className="text-white">Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request the permanent deletion of your project inquiry history and account records.</li>
            <li><strong className="text-white">Right to Withdraw Consent:</strong> Opt out of non-essential communications or cookie tracking at any point.</li>
          </ul>
          <p className="pt-2 text-xs text-neutral-400">
            To exercise any of these rights, email us directly at <a href={`mailto:${FOUNDER_INFO.email}`} className="text-[#e61e2b] font-mono hover:underline">{FOUNDER_INFO.email}</a>. We respond to all verified requests within 48 hours.
          </p>
        </div>
      )
    },
    {
      id: 'contact-officer',
      title: '6. Privacy Officer & Contact Information',
      icon: Mail,
      content: (
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3 text-sm">
          <p className="text-neutral-300">
            For questions, concerns, or legal notices regarding this Privacy Policy, please contact our data controller:
          </p>
          <div className="space-y-1 font-mono text-xs text-neutral-300">
            <div><span className="text-neutral-500">Organization:</span> Tech Base Axis</div>
            <div><span className="text-neutral-500">Lead Architect:</span> Bikram Ghosh</div>
            <div><span className="text-neutral-500">Email:</span> <a href={`mailto:${FOUNDER_INFO.email}`} className="text-[#e61e2b] hover:underline">{FOUNDER_INFO.email}</a></div>
            <div><span className="text-neutral-500">Phone / WhatsApp:</span> +91 94772 01106</div>
            <div><span className="text-neutral-500">Location:</span> Kolkata, West Bengal, India</div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Header Badge & Title */}
      <div className="text-center space-y-3 sm:space-y-4 mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-900/50 text-[11px] font-mono uppercase tracking-widest text-[#e61e2b] font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DATA PROTECTION & LEGAL TRANSPARENCY</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
          Privacy <span className="text-neutral-400">Policy</span>
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto font-sans leading-relaxed">
          At Tech Base Axis, your confidentiality, code integrity, and personal information are treated with absolute enterprise-grade security.
        </p>

        <div className="text-xs font-mono text-neutral-500">
          Last Updated: October 2026 • Valid for All Visitors & Clients Globally
        </div>
      </div>

      {/* Core Guarantees Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {coreGuarantees.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-[#0e0e12] border border-neutral-800/80 hover:border-neutral-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-500/20 text-[#e61e2b] flex items-center justify-center mb-3">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white font-mono mb-1">{item.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Main Legal Sections (Accordion Style for clean scannability) */}
      <div className="space-y-4 mb-12">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = activeAccordion === section.id;

          return (
            <div 
              key={section.id}
              className="rounded-xl border border-neutral-800/80 bg-[#0c0c10] overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(section.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-900/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neutral-900 text-[#e61e2b] border border-neutral-800 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white font-display">
                    {section.title}
                  </h2>
                </div>
                <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-6 pb-5 pt-1 border-t border-neutral-800/60">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Links & Cross-Navigation Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-950 via-[#101015] to-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-sm font-bold text-white font-mono">Need to review our service agreement & refund policy?</div>
          <p className="text-xs text-neutral-400">Our Terms & Conditions provide full transparency on payment milestones and refund guarantees.</p>
        </div>

        {onNavigate && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('terms')}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>View Terms & Refund Policy</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#e61e2b]" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-md shadow-red-600/30"
            >
              <span>Contact Us</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
