import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { UpiPaymentModal } from './UpiPaymentModal';
import { launchRazorpayCheckout } from '../services/razorpayService';
import { X, CheckCircle2, CreditCard, ShieldCheck, Sparkles, HardDrive, Key, Database, Cpu, Bell, GitBranch, Globe, Plus, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
export const EXTRA_ADD_ONS = [
    {
        id: 'cloud_storage',
        name: 'Cloud Storage Engine',
        price: 1500,
        category: 'Infrastructure',
        description: 'High-speed S3 / Firebase storage buckets with global CDN caching & automatic asset pipelines.',
        icon: HardDrive
    },
    {
        id: 'authentication',
        name: 'Enterprise Authentication',
        price: 2000,
        category: 'Security',
        description: 'OAuth (Google, GitHub), Phone OTP, JWT session security & Role-Based Access Control (RBAC).',
        icon: Key
    },
    {
        id: 'cloud_sql',
        name: 'Cloud SQL / PostgreSQL Database',
        price: 2500,
        category: 'Database',
        description: 'Production PostgreSQL scaling, automated daily backups, connection pooling & schema hardening.',
        icon: Database
    },
    {
        id: 'ai_pipeline',
        name: 'AI & LLM Pipeline Integration',
        price: 3500,
        category: 'Intelligence',
        description: 'Gemini / OpenAI API pipelines, semantic vector search, streaming chat & background agentic workers.',
        icon: Cpu
    },
    {
        id: 'push_alerts',
        name: 'Instant Push Alerts (OneSignal)',
        price: 1200,
        category: 'Engagement',
        description: 'Real-time desktop & mobile push notifications triggered on orders, bookings, and user activity.',
        icon: Bell
    },
    {
        id: 'cicd_devops',
        name: 'Automated CI/CD Deployment',
        price: 1800,
        category: 'DevOps',
        description: 'Zero-downtime GitHub Actions deployment pipeline to Google Cloud Run / Vercel with linting & test suite.',
        icon: GitBranch
    },
    {
        id: 'domain_ssl',
        name: 'Custom Domain & Enterprise SSL',
        price: 1000,
        category: 'Networking',
        description: 'Custom domain DNS provisioning, wildcard SSL certs, and Cloudflare DDoS protection shields.',
        icon: Globe
    }
];
export const PackageBookingModal = ({ isOpen, plan, onClose, onConfirmBooking, onNavigate }) => {
    const [selectedAddOnIds, setSelectedAddOnIds] = useState([]);
    const [clientName, setClientName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [paymentOrder, setPaymentOrder] = useState(null);
    const [confirmedInquiry, setConfirmedInquiry] = useState(null);
    const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);
    const [razorpayError, setRazorpayError] = useState(null);
    const [fallbackPaymentLink, setFallbackPaymentLink] = useState(null);
    // Reset fields when modal opens
    useEffect(() => {
        if (isOpen) {
            setConfirmedInquiry(null);
            setPaymentOrder(null);
            setValidationError(null);
            setRazorpayError(null);
            setFallbackPaymentLink(null);
            setIsProcessingRazorpay(false);
            setSelectedAddOnIds([]);
            setClientName('');
            setEmail('');
            setPhone('');
            setNotes('');
        }
    }, [isOpen]);
    if (!isOpen || !plan)
        return null;
    const toggleAddOn = (addonId) => {
        setSelectedAddOnIds((prev) => prev.includes(addonId)
            ? prev.filter((id) => id !== addonId)
            : [...prev, addonId]);
    };
    const selectedAddOns = EXTRA_ADD_ONS.filter((item) => selectedAddOnIds.includes(item.id));
    const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
    const basePrice = plan.price;
    const totalPrice = basePrice + addOnsTotal;
    // Razorpay Standard Web Checkout Handler
    const handlePayWithRazorpay = async (e) => {
        e.preventDefault();
        setValidationError(null);
        setRazorpayError(null);
        const trimmedName = clientName.trim();
        const trimmedEmail = email.trim();
        if (!trimmedName) {
            setValidationError('Please enter your full name to proceed with payment.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
            setValidationError('Please enter a valid email address.');
            return;
        }
        if (!plan || totalPrice <= 0) {
            setValidationError('A valid package and investment amount are required.');
            return;
        }
        setIsProcessingRazorpay(true);
        try {
            await launchRazorpayCheckout({
                amountInRupees: totalPrice,
                packageName: plan.name,
                clientName: trimmedName,
                email: trimmedEmail,
                phone: phone.trim() || undefined,
                description: `Tech Base Axis - ${plan.name} Architecture Package`,
                onSuccess: (paymentData) => {
                    setIsProcessingRazorpay(false);
                    const formattedTotalPrice = `₹${totalPrice.toLocaleString('en-IN')}`;
                    const periodStr = plan.period || '';
                    const paidInquiry = {
                        id: paymentData.orderId || `inq-${Date.now().toString().slice(-4)}`,
                        clientName: trimmedName,
                        email: trimmedEmail,
                        phone: phone.trim() || '',
                        company: 'Direct Package Booking',
                        projectType: plan.name,
                        selectedPackage: `${plan.name} (${formattedTotalPrice})`,
                        budgetRange: formattedTotalPrice,
                        timeline: plan.period?.includes('month') ? 'Monthly Retainer' : 'Milestone Project',
                        addOns: selectedAddOns.map((a) => a.name),
                        basePrice: basePrice,
                        totalPrice: totalPrice,
                        details: `[VERIFIED RAZORPAY PAYMENT] Plan: ${plan.name}. Amount Paid: ${formattedTotalPrice}${periodStr ? ' ' + periodStr : ''}. Razorpay Payment ID: ${paymentData.paymentId}. Order ID: ${paymentData.orderId}. Phone: ${phone.trim() || 'N/A'}.`,
                        createdAt: new Date().toISOString(),
                        status: 'New',
                        priority: 'High',
                        notes: notes.trim() || undefined,
                        eventType: 'payment_success',
                        paymentId: paymentData.paymentId,
                        orderId: paymentData.orderId,
                        paymentStatus: 'paid',
                        paymentMethod: 'Razorpay Standard Checkout'
                    };
                    onConfirmBooking(paidInquiry);
                    setConfirmedInquiry(paidInquiry);
                },
                onDismiss: () => {
                    setIsProcessingRazorpay(false);
                },
                onFailure: (err) => {
                    setIsProcessingRazorpay(false);
                    setRazorpayError(err.description || 'Payment was declined or cancelled.');
                    if (err.paymentLinkUrl) {
                        setFallbackPaymentLink(err.paymentLinkUrl);
                    }
                }
            });
        }
        catch (err) {
            setIsProcessingRazorpay(false);
            const rawMsg = err?.message || '';
            const friendlyMsg = rawMsg.includes('JSON') || rawMsg.includes('Unexpected')
                ? 'Could not connect to payment order service. You can retry Razorpay or pay instantly with Direct UPI QR.'
                : (rawMsg || 'Unable to open Razorpay payment gateway.');
            setRazorpayError(friendlyMsg);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setValidationError(null);
        // STEP 1: Strict validation of required booking information
        const trimmedName = clientName.trim();
        const trimmedEmail = email.trim();
        if (!trimmedName) {
            setValidationError('Please enter your full name to book.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
            setValidationError('Please enter a valid email address.');
            return;
        }
        if (!plan || totalPrice <= 0) {
            setValidationError('A valid package and investment amount are required.');
            return;
        }
        // STEP 2: Prepare locked payment order data
        const periodStr = plan.period || '';
        const formattedBasePrice = `₹${basePrice.toLocaleString('en-IN')}`;
        const formattedTotalPrice = `₹${totalPrice.toLocaleString('en-IN')}`;
        const addOnNames = selectedAddOns.map((a) => `${a.name} (+₹${a.price.toLocaleString('en-IN')})`);
        const addOnSummary = addOnNames.length > 0
            ? ` | Extra Add-ons (${addOnNames.length}): ${addOnNames.join(', ')}`
            : ' | No Extra Add-ons';
        const orderData = {
            bookingId: `inq-${Date.now().toString().slice(-4)}`,
            clientName: trimmedName,
            email: trimmedEmail,
            phone: phone.trim() || undefined,
            packageName: plan.name,
            packagePrice: basePrice,
            totalPrice: totalPrice,
            addOns: selectedAddOns.map((a) => a.name),
            details: `[PACKAGE BOOKING] Plan: ${plan.name} (Base: ${formattedBasePrice}). Total: ${formattedTotalPrice}${periodStr ? ' ' + periodStr : ''}.${addOnSummary}. ${phone ? `WhatsApp/Phone: ${phone}. ` : ''}${notes ? `Notes: ${notes}` : ''}`,
            notes: notes.trim() || undefined,
            period: plan.period
        };
        // STEP 3: Record new inquiry and dispatch instant OneSignal push notification
        const newBookingInquiry = {
            id: orderData.bookingId,
            clientName: trimmedName,
            email: trimmedEmail,
            phone: phone.trim() || '',
            company: 'Direct Package Booking',
            projectType: plan.name,
            selectedPackage: `${plan.name} (${formattedTotalPrice})`,
            budgetRange: formattedTotalPrice,
            timeline: plan.period?.includes('month') ? 'Monthly Retainer' : 'Milestone Project',
            addOns: selectedAddOns.map((a) => a.name),
            basePrice: basePrice,
            totalPrice: totalPrice,
            details: orderData.details,
            createdAt: new Date().toISOString(),
            status: 'New',
            priority: 'High',
            notes: notes.trim() || undefined,
            eventType: 'package_booking',
            orderId: orderData.bookingId
        };
        onConfirmBooking(newBookingInquiry);
        // Call backend REST API to push notification directly to OneSignal devices
        fetch('/api/notify-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType: 'package_booking',
                clientId: orderData.bookingId,
                clientName: trimmedName,
                clientEmail: trimmedEmail,
                email: trimmedEmail,
                clientPhone: phone.trim() || '',
                phone: phone.trim() || '',
                packageName: plan.name,
                packagePrice: totalPrice,
                totalPrice: totalPrice,
                bookingId: orderData.bookingId,
                details: orderData.details,
                notes: notes.trim() || undefined,
                timestamp: newBookingInquiry.createdAt
            })
        }).catch((err) => console.warn('[OneSignal] Package booking alert notice:', err));
        // STEP 4: Open professional UPI Payment Page
        setPaymentOrder(orderData);
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200", children: _jsxs("div", { className: "relative w-full max-w-2xl min-h-full sm:min-h-0 sm:my-auto rounded-none sm:rounded-2xl bg-[#0b0c10] border-0 sm:border border-neutral-800 shadow-[0_25px_70px_rgba(0,0,0,0.9)] p-4 pt-16 sm:p-7 text-neutral-100 overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#e61e2b]/15 rounded-full blur-[90px] pointer-events-none" }), _jsx("div", { className: "absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent pointer-events-none" }), _jsx("button", { onClick: onClose, className: "fixed sm:absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-800 z-10 active:scale-95", "aria-label": "Close booking modal", children: _jsx(X, { className: "w-4 h-4" }) }), confirmedInquiry ? (_jsxs("div", { className: "text-center py-5 space-y-6 animate-in zoom-in-95 duration-200", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-red-950/60 border border-red-600/50 text-[#ff4d5a] flex items-center justify-center mx-auto shadow-lg shadow-red-600/25", children: _jsx(CheckCircle2, { className: "w-8 h-8" }) }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-red-950/70 text-red-300 border border-red-600/40", children: [_jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-[#e61e2b]" }), _jsx("span", { children: "BOOKING REGISTERED & LOGGED" })] }), _jsx("h3", { className: "text-2xl font-bold text-white tracking-tight", children: "Package Booking Confirmed!" }), _jsxs("p", { className: "text-sm text-neutral-300 max-w-sm mx-auto leading-relaxed", children: ["Thank you, ", _jsx("span", { className: "text-white font-semibold", children: confirmedInquiry.clientName }), ". Your booking for ", _jsx("span", { className: "text-[#ff4d5a] font-semibold", children: plan.name }), " with configured add-ons has been saved."] })] }), _jsxs("div", { className: "p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 text-left space-y-2.5 text-xs font-mono", children: [_jsxs("div", { className: "flex justify-between items-center text-neutral-400", children: [_jsx("span", { children: "Reference ID:" }), _jsxs("span", { className: "text-[#e61e2b] font-bold", children: ["#", confirmedInquiry.id] })] }), _jsxs("div", { className: "flex justify-between items-center text-neutral-400", children: [_jsx("span", { children: "Package Plan:" }), _jsx("span", { className: "text-white font-semibold", children: plan.name })] }), _jsxs("div", { className: "flex justify-between items-center text-neutral-400", children: [_jsx("span", { children: "Base Package:" }), _jsxs("span", { className: "text-neutral-200", children: ["\u20B9", basePrice.toLocaleString('en-IN')] })] }), selectedAddOns.length > 0 && (_jsxs("div", { className: "pt-1.5 pb-1 border-t border-neutral-800/80", children: [_jsxs("div", { className: "flex justify-between items-center text-neutral-400 mb-1.5", children: [_jsxs("span", { children: ["Selected Add-ons (", selectedAddOns.length, "):"] }), _jsxs("span", { className: "text-[#ff4d5a] font-semibold", children: ["+\u20B9", addOnsTotal.toLocaleString('en-IN')] })] }), _jsx("div", { className: "flex flex-wrap gap-1.5 mt-1", children: selectedAddOns.map((item) => (_jsxs("span", { className: "px-2 py-0.5 rounded text-[11px] bg-red-950/50 text-red-300 border border-red-600/30 flex items-center gap-1", children: [_jsx("span", { className: "text-[#e61e2b]", children: "\u2713" }), " ", item.name] }, item.id))) })] })), _jsxs("div", { className: "flex justify-between items-center text-white pt-2 border-t border-neutral-800 font-bold text-sm", children: [_jsx("span", { children: "Total Investment:" }), _jsxs("span", { className: "text-[#ff4d5a]", children: ["\u20B9", totalPrice.toLocaleString('en-IN'), " ", plan.period] })] }), _jsxs("div", { className: "flex justify-between items-center text-neutral-400 pt-1 border-t border-neutral-800", children: [_jsx("span", { children: "Client Email:" }), _jsx("span", { className: "text-neutral-200", children: confirmedInquiry.email })] }), confirmedInquiry.paymentId && (_jsxs("div", { className: "flex justify-between items-center text-emerald-400 pt-1 border-t border-neutral-800", children: [_jsx("span", { children: "Razorpay Payment ID:" }), _jsx("span", { className: "font-bold font-mono text-emerald-300", children: confirmedInquiry.paymentId })] })), confirmedInquiry.paymentMethod && (_jsxs("div", { className: "flex justify-between items-center text-neutral-400", children: [_jsx("span", { children: "Payment Gateway:" }), _jsx("span", { className: "text-white font-semibold", children: confirmedInquiry.paymentMethod })] })), _jsxs("div", { className: "flex justify-between items-center text-neutral-400", children: [_jsx("span", { children: "System Status:" }), _jsxs("span", { className: "text-emerald-400 font-bold flex items-center gap-1", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }), confirmedInquiry.paymentStatus === 'paid' ? 'Payment Verified & Confirmed' : 'Active in Client Inquiries'] })] })] }), _jsx("p", { className: "text-xs text-neutral-400 font-mono", children: "A high-priority alert has been dispatched to Bikram Ghosh. Feasibility review and kickoff details will be sent to your email." }), _jsx("div", { className: "flex items-center justify-center pt-2", children: _jsx("button", { type: "button", onClick: onClose, className: "w-full sm:w-auto px-7 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-xs font-semibold transition-colors cursor-pointer active:scale-95 shadow-sm", children: "Done" }) })] })) : (_jsxs("div", { className: "space-y-4 sm:max-h-[85vh] sm:overflow-y-auto sm:pr-1", children: [_jsxs("div", { children: [_jsx("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-red-950/60 text-[#ff4d5a] border border-red-600/40 shadow-sm shadow-red-950/50", children: plan.name }), _jsx("span", { className: "text-xs font-mono text-neutral-400", children: "Subscription Package" })] }) }), _jsx("h3", { className: "text-xl sm:text-2xl font-bold text-white tracking-tight", children: "Package Customization & Extra Add-ons" }), _jsxs("p", { className: "text-xs text-neutral-400 mt-1 leading-relaxed", children: ["Enter your details below to book. Want more? Scroll down and click ", _jsx("span", { className: "text-white font-semibold", children: "\"+ Add\"" }), " to include extra modules (Cloud Storage, Authentication, etc.)."] })] }), _jsxs("div", { className: "p-3 sm:p-4 rounded-xl bg-gradient-to-r from-neutral-900/90 to-neutral-950/90 border border-neutral-800/90 grid grid-cols-2 gap-3 divide-x divide-neutral-800/80 shadow-sm", children: [_jsxs("div", { className: "pr-2", children: [_jsx("div", { className: "text-[10px] font-mono uppercase tracking-wider text-neutral-400", children: "Base Plan Price" }), _jsxs("div", { className: "text-base sm:text-xl font-extrabold text-white font-mono mt-0.5", children: ["\u20B9", basePrice.toLocaleString('en-IN'), _jsx("span", { className: "text-[11px] font-normal text-neutral-400 ml-1.5 block sm:inline", children: plan.period })] })] }), _jsxs("div", { className: "pl-3 sm:pl-4", children: [_jsx("div", { className: "text-[10px] font-mono uppercase tracking-wider text-neutral-400", children: "Configured Add-ons" }), _jsx("div", { className: "text-xs sm:text-sm font-bold font-mono mt-1 text-white", children: selectedAddOns.length > 0 ? (_jsxs("span", { className: "text-[#ff4d5a] flex items-center gap-1.5", children: [_jsxs("span", { className: "px-1.5 py-0.2 rounded bg-red-950/70 border border-red-600/40 text-[10px] text-white", children: ["+", selectedAddOns.length] }), _jsxs("span", { children: ["(+\u20B9", addOnsTotal.toLocaleString('en-IN'), ")"] })] })) : (_jsx("span", { className: "text-neutral-500 font-normal", children: "None selected" })) })] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-3.5 pt-2 border-t border-neutral-800", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-mono text-neutral-300 mb-1", children: ["Your Full Name ", _jsx("span", { className: "text-[#e61e2b]", children: "*" })] }), _jsx("input", { type: "text", required: true, value: clientName, onChange: (e) => setClientName(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-neutral-800 focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/40 focus:outline-none text-xs sm:text-sm text-white transition-colors font-mono" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-mono text-neutral-300 mb-1", children: ["Work Email ", _jsx("span", { className: "text-[#e61e2b]", children: "*" })] }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-neutral-800 focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/40 focus:outline-none text-xs sm:text-sm text-white transition-colors font-mono" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-mono text-neutral-300 mb-1", children: ["WhatsApp / Phone ", _jsx("span", { className: "text-neutral-500", children: "(Optional)" })] }), _jsx("input", { type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-neutral-800 focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/40 focus:outline-none text-xs sm:text-sm text-white transition-colors font-mono" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-mono text-neutral-300 mb-1", children: ["Special Requirements ", _jsx("span", { className: "text-neutral-500", children: "(Optional)" })] }), _jsx("input", { type: "text", value: notes, onChange: (e) => setNotes(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-neutral-800 focus:border-[#e61e2b] focus:ring-1 focus:ring-[#e61e2b]/40 focus:outline-none text-xs sm:text-sm text-white transition-colors font-mono" })] })] }), validationError && (_jsxs("div", { className: "p-3 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-300 text-xs font-mono flex items-center gap-2 animate-in fade-in", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-rose-400 shrink-0" }), _jsx("span", { children: validationError })] })), razorpayError && (_jsxs("div", { className: "p-3.5 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-300 text-xs font-mono space-y-2 animate-in fade-in", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-rose-400 shrink-0" }), _jsx("span", { children: razorpayError })] }), _jsxs("div", { className: "flex items-center justify-between pt-1 border-t border-rose-900/60", children: [_jsx("span", { className: "text-[11px] text-neutral-300", children: "Quick Alternative: Pay directly via UPI QR:" }), _jsx("button", { type: "button", onClick: handleSubmit, className: "px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] font-mono cursor-pointer transition-colors shadow-sm", children: "Pay via Direct UPI QR \u2192" })] })] })), fallbackPaymentLink && (_jsxs("div", { className: "p-3.5 rounded-xl bg-gradient-to-r from-red-950/80 via-black to-red-950/60 border border-red-500/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg shadow-red-950/50 animate-in fade-in", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-xs font-bold text-white font-mono flex items-center gap-1.5", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5 text-amber-400" }), _jsx("span", { children: "Razorpay Official Hosted Portal (rzp.io)" })] }), _jsx("div", { className: "text-[11px] text-neutral-300 font-mono mt-0.5", children: "Pay directly on Razorpay's verified portal to complete checkout" })] }), _jsxs("a", { href: fallbackPaymentLink, target: "_blank", rel: "noopener noreferrer", className: "py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0", children: [_jsx("span", { children: "Open Razorpay Portal" }), _jsx(ExternalLink, { className: "w-3.5 h-3.5" })] })] })), _jsxs("div", { className: "p-4 rounded-xl bg-neutral-950/90 border border-neutral-800 space-y-3 mt-2 shadow-inner", children: [_jsxs("div", { className: "flex items-center justify-between text-xs font-mono text-neutral-400", children: [_jsxs("span", { children: ["Base Package (", plan.name, "):"] }), _jsxs("span", { className: "text-neutral-200", children: ["\u20B9", basePrice.toLocaleString('en-IN')] })] }), selectedAddOns.length > 0 && (_jsxs("div", { className: "flex items-center justify-between text-xs font-mono text-[#ff4d5a]", children: [_jsxs("span", { children: [selectedAddOns.length, " Extra Add-on(s):"] }), _jsxs("span", { children: ["+\u20B9", addOnsTotal.toLocaleString('en-IN')] })] })), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-neutral-800/80", children: [_jsxs("div", { children: [_jsx("div", { className: "text-[10px] font-mono uppercase tracking-wider text-neutral-400", children: "Total Investment" }), _jsxs("div", { className: "text-xl sm:text-2xl font-extrabold text-white font-mono", children: ["\u20B9", totalPrice.toLocaleString('en-IN'), _jsx("span", { className: "text-xs font-normal text-neutral-400 ml-1.5", children: plan.period })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center gap-2", children: [_jsx("button", { id: "razorpay-checkout-btn", type: "button", onClick: handlePayWithRazorpay, disabled: isProcessingRazorpay, className: "py-3 px-5 rounded-xl font-mono font-bold text-white text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_4px_25px_rgba(230,30,43,0.45)] border border-red-500/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed", children: isProcessingRazorpay ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin text-white" }), _jsx("span", { children: "Connecting Razorpay..." })] })) : (_jsxs(_Fragment, { children: [_jsx(CreditCard, { className: "w-4 h-4" }), _jsx("span", { children: "Pay with Razorpay" }), _jsxs("span", { className: "text-[10px] uppercase font-normal bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-emerald-300 flex items-center gap-1", children: [_jsx(ShieldCheck, { className: "w-3 h-3 text-emerald-400" }), "Cards & UPI"] })] })) }), _jsx("button", { id: "confirm-booking-btn", type: "submit", disabled: isProcessingRazorpay, className: "py-3 px-4 rounded-xl font-mono text-neutral-300 hover:text-white text-xs font-semibold bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer", title: "Direct UPI QR scan", children: _jsx("span", { children: "Direct UPI QR" }) })] })] })] })] }), _jsxs("div", { className: "space-y-2.5 pt-2 border-t border-neutral-800", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { className: "text-xs font-mono uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5 text-[#e61e2b]" }), _jsx("span", { children: "Available Engineering Add-ons" })] }), _jsx("span", { className: "text-[11px] font-mono text-neutral-500", children: "Click \"+ Add\" to include" })] }), _jsx("div", { className: "space-y-2", children: EXTRA_ADD_ONS.map((addon) => {
                                        const isAdded = selectedAddOnIds.includes(addon.id);
                                        const Icon = addon.icon;
                                        return (_jsxs("div", { className: `p-3 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isAdded
                                                ? 'bg-red-950/20 border-red-600/50 shadow-[0_0_20px_rgba(230,30,43,0.12)]'
                                                : 'bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700/80 hover:bg-neutral-900/80'}`, children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isAdded
                                                                ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md shadow-red-600/30'
                                                                : 'bg-neutral-900 text-neutral-400 border border-neutral-800'}`, children: _jsx(Icon, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs sm:text-sm font-semibold text-white", children: addon.name }), _jsx("span", { className: "text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800", children: addon.category })] }), _jsx("p", { className: "text-[11px] text-neutral-400 leading-relaxed mt-0.5 line-clamp-2", children: addon.description })] })] }), _jsxs("div", { className: "flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/80", children: [_jsxs("div", { className: "font-mono text-xs sm:text-sm font-bold text-white", children: ["+\u20B9", addon.price.toLocaleString('en-IN')] }), _jsx("button", { type: "button", onClick: () => toggleAddOn(addon.id), className: `px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${isAdded
                                                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/30 border border-red-500/50'
                                                                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-red-500/50'}`, children: isAdded ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Added" })] })) : (_jsxs(_Fragment, { children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Add" })] })) })] })] }, addon.id));
                                    }) })] })] })), paymentOrder && (_jsx(UpiPaymentModal, { isOpen: Boolean(paymentOrder), order: paymentOrder, onClose: () => setPaymentOrder(null), onPaymentSuccess: (confirmedInquiry) => {
                        setPaymentOrder(null);
                        setConfirmedInquiry(confirmedInquiry);
                        onConfirmBooking(confirmedInquiry);
                    }, onNavigate: (section) => {
                        setPaymentOrder(null);
                        onClose();
                        onNavigate(section);
                    } }))] }) }));
};
