import React, { useState, useEffect } from 'react';
import { ClientInquiry, ServicePackage, NavSection } from '../types';
import { FOUNDER_INFO, SERVICE_PACKAGES } from '../data/mockData';
import { 
  Send, 
  Mail, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  ExternalLink,
  MessageSquare,
  MessageCircle,
  Calendar,
  Calculator,
  Phone,
  Lock,
  FileText,
  RotateCcw,
  ArrowUpRight
} from 'lucide-react';
import { OfficialGmailIcon, OfficialWhatsAppIcon, OfficialInstagramIcon } from './ui/SocialIcons';

interface ContactSectionProps {
  packages?: ServicePackage[];
  preselectedPackage?: ServicePackage | null;
  onInquirySubmitted: (inquiry: ClientInquiry) => void;
  onNavigate: (section: NavSection) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  packages,
  preselectedPackage,
  onInquirySubmitted,
  onNavigate
}) => {
  const availablePackages = packages && packages.length > 0 ? packages : SERVICE_PACKAGES;
  
  // Tomorrow's date formatted as YYYY-MM-DD for default appointment date
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [requestType, setRequestType] = useState<'appointment' | 'quote_request' | 'contact_enquiry'>('appointment');

  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    company: '',
    projectType: 'Full-Stack SaaS',
    websiteType: 'E-Commerce Platform',
    selectedFeatures: [
      'Authentication & RBAC',
      'Payment Gateway Integration',
      'Admin Analytics Dashboard',
      'High-Speed CDN & SEO'
    ] as string[],
    selectedPackage: preselectedPackage ? preselectedPackage.name : (availablePackages[0]?.name || 'Full-Stack Growth Architecture'),
    appointmentDate: tomorrowStr,
    appointmentTime: '10:00 AM - 11:00 AM IST',
    budgetRange: '₹35,000 - ₹75,000',
    timeline: '1 Month',
    details: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFeature = (feature: string) => {
    setFormData((prev) => {
      const exists = prev.selectedFeatures.includes(feature);
      return {
        ...prev,
        selectedFeatures: exists
          ? prev.selectedFeatures.filter((f) => f !== feature)
          : [...prev.selectedFeatures, feature]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.email) return;

    setIsSubmitting(true);

    const generatedId = `inq-${Date.now().toString().slice(-4)}`;

    let scopeDetails = formData.details;
    if (requestType === 'appointment') {
      scopeDetails = formData.details 
        ? `${formData.details} [Consultation on ${formData.appointmentDate} at ${formData.appointmentTime}]`
        : `Requested appointment on ${formData.appointmentDate} at ${formData.appointmentTime}.`;
    } else if (requestType === 'quote_request') {
      const featList = formData.selectedFeatures.length > 0 
        ? `Selected Features: ${formData.selectedFeatures.join(', ')}`
        : 'Standard Architecture';
      scopeDetails = `[QUOTE REQUEST for ${formData.websiteType}] Est. Budget: ${formData.budgetRange}. ${featList}. ${formData.details ? 'Notes: ' + formData.details : ''}`;
    }

    const newInquiry: ClientInquiry = {
      id: generatedId,
      clientName: formData.clientName,
      email: formData.email,
      phone: formData.phone || undefined,
      company: formData.company || 'Direct Founder',
      projectType: requestType === 'quote_request' ? formData.websiteType : formData.projectType,
      websiteType: requestType === 'quote_request' ? formData.websiteType : undefined,
      selectedFeatures: requestType === 'quote_request' ? formData.selectedFeatures : undefined,
      selectedPackage: undefined,
      budgetRange: formData.budgetRange,
      timeline: formData.timeline,
      details: scopeDetails,
      createdAt: new Date().toISOString(),
      status: 'New',
      priority: formData.timeline.includes('Urgent') ? 'High' : 'Normal',
      notes: `Mode: ${requestType}. Phone: ${formData.phone || 'N/A'}. Dispatched directly to Bikram Ghosh.`,
      eventType: requestType,
      appointmentDate: requestType === 'appointment' ? formData.appointmentDate : undefined,
      appointmentTime: requestType === 'appointment' ? formData.appointmentTime : undefined
    };

    onInquirySubmitted(newInquiry);
    setLastSubmittedId(newInquiry.id);
    setSubmitted(true);
    setIsSubmitting(false);

    // Call backend REST API to push notification directly to Bikram Ghosh's OneSignal device
    try {
      let payload: any = {
        eventType: requestType,
        clientId: newInquiry.id,
        clientName: newInquiry.clientName,
        clientEmail: newInquiry.email,
        email: newInquiry.email,
        clientPhone: formData.phone || '',
        phone: formData.phone || '',
        company: newInquiry.company,
        timestamp: newInquiry.createdAt
      };

      if (requestType === 'appointment') {
        payload = {
          ...payload,
          appointmentId: newInquiry.id,
          service: formData.projectType,
          date: formData.appointmentDate,
          time: formData.appointmentTime,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          details: newInquiry.details
        };
      } else if (requestType === 'quote_request') {
        payload = {
          ...payload,
          quoteId: newInquiry.id,
          websiteType: formData.websiteType,
          selectedFeatures: formData.selectedFeatures.join(', '),
          estimatedPrice: formData.budgetRange,
          details: newInquiry.details
        };
      } else {
        payload = {
          ...payload,
          enquiryId: newInquiry.id,
          inquiryId: newInquiry.id,
          subject: formData.projectType || 'General Client Enquiry',
          message: formData.details || 'New enquiry from client.',
          details: formData.details
        };
      }

      fetch('/api/notify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .catch((error) => {
          console.warn('[OneSignal] Notification dispatch notice:', error);
        });
    } catch (e) {
      // Non-blocking
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-neutral-100">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="text-xs font-mono text-[#e61e2b] uppercase tracking-widest mb-2 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#e61e2b]" />
          <span>INSTANT DISPATCH // TECH BASE AXIS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
          Connect Directly with Bikram Ghosh
        </h1>
        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
          Book an architecture package, schedule a 1-on-1 technical consultation, or transmit your project brief. Notifications are instantly routed to Bikram Ghosh in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Direct Info & Quick Booking */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct Card */}
          <div className="obsidian-card p-6 rounded-2xl border border-neutral-800 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#e61e2b]" />
              <span>Direct Engineering Channel</span>
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <OfficialGmailIcon className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-neutral-400 font-mono">Direct Founder Email</div>
                  <a
                    href={`mailto:${FOUNDER_INFO.email}`}
                    className="text-white font-mono font-semibold hover:text-red-400 transition-colors"
                  >
                    {FOUNDER_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <OfficialWhatsAppIcon className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-neutral-400 font-mono">Official WhatsApp Business</div>
                  <a
                    href="https://wa.me/919477201106"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 font-mono font-semibold hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>+91 94772 01106</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <OfficialInstagramIcon className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-neutral-400 font-mono">Founder Instagram Profile</div>
                  <a
                    id="contact-founder-instagram"
                    href={FOUNDER_INFO.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-mono font-semibold hover:text-pink-400 transition-colors inline-flex items-center gap-1.5 truncate max-w-full"
                  >
                    <span>@bik.ram737</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
                  </a>
                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">Bikram Ghosh • Direct DM & Project Updates</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <MapPin className="w-4 h-4 text-[#e61e2b] mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-neutral-400 font-mono">Operating Headquarters</div>
                  <div className="text-white font-medium">{FOUNDER_INFO.location}</div>
                  <div className="text-xs text-neutral-400">Serving global clients across US, EU & APAC</div>
                </div>
              </div>
            </div>

            {/* Quick Contact Launchers: Email & Instagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={`mailto:${FOUNDER_INFO.email}?subject=Tech%20Base%20Axis%20Architecture%20Inquiry`}
                className="py-3 px-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-red-600/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all hover:text-white"
              >
                <OfficialGmailIcon className="w-4 h-4 shrink-0" />
                <span>Email Bikram</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>

              <a
                id="contact-btn-dm-instagram"
                href={FOUNDER_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-pink-500/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all hover:text-white"
              >
                <OfficialInstagramIcon className="w-4 h-4 shrink-0" />
                <span>DM on Instagram</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Direct Client Portal & Client Protections */}
        <div className="lg:col-span-7 space-y-6">
          <div className="obsidian-card p-6 sm:p-8 rounded-2xl border border-neutral-800 relative">
            {submitted ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-600/40 text-[#e61e2b] flex items-center justify-center mx-auto shadow-lg shadow-red-600/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {requestType === 'appointment'
                      ? 'Appointment Request Confirmed'
                      : requestType === 'package_booking'
                      ? 'Package Booking Transmitted'
                      : 'Project Brief Received & Logged'}
                  </h3>
                  <div className="text-xs font-mono text-[#e61e2b] mb-4">
                    REFERENCE ID: #{lastSubmittedId}
                  </div>
                  <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="text-white font-semibold">{formData.clientName}</span>. A high-priority push alert has been dispatched directly to Bikram Ghosh's device. You will receive a direct reply at <span className="text-[#e61e2b] font-mono">{formData.email}</span>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        clientName: '',
                        email: '',
                        company: '',
                        projectType: 'Full-Stack SaaS',
                        selectedPackage: availablePackages[0]?.name || 'Full-Stack Growth Architecture',
                        appointmentDate: tomorrowStr,
                        appointmentTime: '10:00 AM - 11:00 AM IST',
                        budgetRange: '₹3,000 - ₹10,000',
                        timeline: '1 Month',
                        details: ''
                      });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors active:scale-95 cursor-pointer shadow-sm"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Direct Client Portal
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Choose your action below to trigger an instant push notification to Bikram Ghosh.
                  </p>
                </div>

                {/* Purpose Tabs: Appointment, Quote Request & Client Enquiry */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 bg-neutral-900/80 rounded-xl border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setRequestType('appointment')}
                    className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      requestType === 'appointment'
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Appointment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('quote_request')}
                    className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      requestType === 'quote_request'
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Get Quote</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('contact_enquiry')}
                    className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      requestType === 'contact_enquiry'
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Enquiry</span>
                  </button>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                      Your Name <span className="text-[#e61e2b]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                      Work Email <span className="text-[#e61e2b]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/50"
                    />
                  </div>
                </div>

                {/* Phone / WhatsApp & Organization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Phone / WhatsApp <span className="text-neutral-500">(Recommended)</span></span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                      Organization / Brand
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/50"
                    />
                  </div>
                </div>

                {/* FIELDS SPECIFIC TO APPOINTMENT */}
                {requestType === 'appointment' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-neutral-300 mb-1.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#e61e2b]" />
                          <span>Preferred Date <span className="text-[#e61e2b]">*</span></span>
                        </label>
                        <input
                          type="date"
                          required
                          min={tomorrowStr}
                          value={formData.appointmentDate}
                          onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-neutral-300 mb-1.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#e61e2b]" />
                          <span>Preferred Time Slot (IST) <span className="text-[#e61e2b]">*</span></span>
                        </label>
                        <select
                          value={formData.appointmentTime}
                          onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                        >
                          <option value="10:00 AM - 11:00 AM IST">10:00 AM - 11:00 AM IST</option>
                          <option value="02:00 PM - 03:00 PM IST">02:00 PM - 03:00 PM IST</option>
                          <option value="05:00 PM - 06:00 PM IST">05:00 PM - 06:00 PM IST</option>
                          <option value="07:00 PM - 08:00 PM IST">07:00 PM - 08:00 PM IST</option>
                          <option value="Flexible / Coordinate via WhatsApp">Flexible / Coordinate via WhatsApp</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Consultation Subject / Domain
                      </label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                      >
                        <option value="Full-Stack Technical Consultation">Full-Stack Technical Consultation</option>
                        <option value="System Architecture Review">System Architecture & Scaling</option>
                        <option value="MVP Sprint Scoping">MVP Sprint Scoping</option>
                        <option value="Cloud Modernization & DevOps">Cloud Modernization & DevOps</option>
                        <option value="AI Integration & LLM APIs">AI Integration & LLM APIs</option>
                      </select>
                    </div>
                  </>
                )}

                {/* FIELDS SPECIFIC TO QUOTE REQUEST */}
                {requestType === 'quote_request' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-neutral-300 mb-1.5 flex items-center gap-1">
                          <Calculator className="w-3.5 h-3.5 text-[#e61e2b]" />
                          <span>Website / Platform Type <span className="text-[#e61e2b]">*</span></span>
                        </label>
                        <select
                          value={formData.websiteType}
                          onChange={(e) => setFormData({ ...formData, websiteType: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                        >
                          <option value="E-Commerce Platform">E-Commerce Platform</option>
                          <option value="Full-Stack SaaS Platform">Full-Stack SaaS Platform</option>
                          <option value="Corporate / Portfolio Website">Corporate / Portfolio Website</option>
                          <option value="Fintech & Payment Platform">Fintech & Payment Platform</option>
                          <option value="AI & Automation Web App">AI & Automation Web App</option>
                          <option value="Custom Web Application">Custom Web Application</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                          Estimated Budget
                        </label>
                        <select
                          value={formData.budgetRange}
                          onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                        >
                          <option value="₹15,000 - ₹35,000">₹15,000 - ₹35,000</option>
                          <option value="₹35,000 - ₹75,000">₹35,000 - ₹75,000</option>
                          <option value="₹75,000 - ₹1,50,000">₹75,000 - ₹1,50,000</option>
                          <option value="₹1,50,000+">₹1,50,000+ (Enterprise)</option>
                        </select>
                      </div>
                    </div>

                    {/* Interactive Feature Selectors */}
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-2">
                        Selected Architectural Features:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          'Authentication & RBAC',
                          'Payment Gateway Integration',
                          'Admin Analytics Dashboard',
                          'AI Capabilities & LLM APIs',
                          'Real-time Sockets & Push',
                          'High-Speed CDN & SEO'
                        ].map((feature) => {
                          const isSelected = formData.selectedFeatures.includes(feature);
                          return (
                            <button
                              key={feature}
                              type="button"
                              onClick={() => toggleFeature(feature)}
                              className={`p-2 rounded-xl text-[11px] font-mono text-left border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                                isSelected
                                  ? 'bg-red-950/50 border-red-500/60 text-white shadow-sm'
                                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              <span className="truncate">{feature}</span>
                              <span className={`text-xs ${isSelected ? 'text-[#ff4d5a] font-bold' : 'text-neutral-600'}`}>
                                {isSelected ? '✓' : '+'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* FIELDS SPECIFIC TO GENERAL ENQUIRY */}
                {requestType === 'contact_enquiry' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Subject / Domain
                      </label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                      >
                        <option value="Enterprise Cloud Scalability">Enterprise Cloud Scalability</option>
                        <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                        <option value="API Integration & Architecture">API Integration & Architecture</option>
                        <option value="Code Review & Security Audit">Code Review & Security Audit</option>
                        <option value="General Inquiry">General Technical Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                        Target Timeline
                      </label>
                      <select
                        value={formData.timeline}
                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b]"
                      >
                        <option value="Immediate (< 1 week)">Immediate (&lt; 1 Week)</option>
                        <option value="1 Month">1 Month</option>
                        <option value="2-3 Months">2 - 3 Months</option>
                        <option value="Flexible / Retainer">Flexible / Ongoing</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Project Details */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                    {requestType === 'appointment'
                      ? 'Meeting Agenda & Topics to Discuss'
                      : requestType === 'quote_request'
                      ? 'Project Requirements & Feature Brief'
                      : 'Project Scope & Inquiry Message'}
                  </label>
                  <textarea
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/50"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  id="submit-project-brief-btn"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-mono font-bold text-sm shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Client Protections & Legal Transparency Card (Directly Below Direct Client Portal) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0e0e12] border border-neutral-800/90 shadow-[0_10px_30px_rgba(0,0,0,0.6)] space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#e61e2b]" />
                <span>Client Protections & Policies</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                Guaranteed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Privacy Policy Link Card */}
              <button
                type="button"
                id="contact-legal-privacy-btn"
                onClick={() => {
                  onNavigate('privacy');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left p-3.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-500/20 text-[#e61e2b] flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-red-400 transition-colors" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono group-hover:text-red-400 transition-colors">
                    Privacy Policy
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-snug mt-1">
                    Data encryption, zero third-party resale & user privacy rights.
                  </div>
                </div>
              </button>

              {/* Terms & Conditions Link Card */}
              <button
                type="button"
                id="contact-legal-terms-btn"
                onClick={() => {
                  onNavigate('terms');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left p-3.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-red-400 transition-colors" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono group-hover:text-red-400 transition-colors">
                    Terms & Conditions
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-snug mt-1">
                    Service agreements, 100% code ownership & 30-day bug warranty.
                  </div>
                </div>
              </button>

              {/* Refund Policy Link Card */}
              <button
                type="button"
                id="contact-legal-refund-btn"
                onClick={() => {
                  onNavigate('terms');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left p-3.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-600/50 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-500/40 text-[#e61e2b] flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800/60 font-semibold">No Refunds</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono group-hover:text-red-300 transition-colors flex items-center gap-1">
                    <span>Strict Refund Policy</span>
                    <ArrowUpRight className="w-3 h-3 text-[#e61e2b]" />
                  </div>
                  <div className="text-[11px] text-neutral-300 leading-snug mt-1">
                    Strict no-refund policy. All payments, package orders &amp; subscriptions are final.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
