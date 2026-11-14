import "dotenv/config";
import fs from 'fs';
import path from 'path';
import { recordInquiryFromNotification } from './inquiryHelper.ts';

/**
 * OneSignal Admin Notification Automation Service (Server-Side Only)
 * 
 * Target Admin OneSignal Subscription / Player ID: 32007a0b-38ed-4800-a681-f663fd00d188
 * OneSignal App ID: f9cfc686-a78c-445f-a436-8b6bb2e6bdff
 * Registered Domain: https://www.tbaonline.online
 * 
 * SECURITY:
 * - REST API key is loaded strictly from process.env.ONESIGNAL_REST_API_KEY
 *   and NEVER exposed to frontend or client bundles.
 * - Notifications are routed EXCLUSIVELY to ADMIN_PLAYER_ID using
 *   `include_subscription_ids: [adminPlayerId]` with NO fallback to segments,
 *   client-writable tags, external_id aliases, or dynamically registered devices.
 */

export interface AdminNotificationEvent {
  eventType: 
    | 'account_created'
    | 'user_signup'
    | 'new_account'
    | 'package_booking'
    | 'appointment'
    | 'appointment_booked'
    | 'book_appointment'
    | 'quote_request'
    | 'contact_enquiry'
    | 'inquiry_message'
    | 'payment_success'
    | 'proposal_accepted'
    | 'revision_request'
    | 'support_request'
    | 'review_submitted'
    | 'review_message';
  
  // Client identification
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  email?: string;
  clientPhone?: string;
  phone?: string;
  company?: string;

  // Package booking specifics
  packageName?: string;
  packagePrice?: number | string;
  bookingId?: string;

  // Appointment specifics
  appointmentId?: string;
  service?: string;
  date?: string;
  time?: string;
  appointmentDate?: string;
  appointmentTime?: string;

  // Quote specifics
  quoteId?: string;
  websiteType?: string;
  selectedFeatures?: string[] | string;
  estimatedPrice?: number | string;

  // Contact enquiry specifics
  enquiryId?: string;
  inquiryId?: string;
  subject?: string;
  message?: string;
  details?: string;

  // Payment specifics
  amount?: number | string;
  paymentId?: string;
  orderId?: string;
  projectId?: string;

  // Proposal / Revision / Support specifics
  projectName?: string;
  revisionId?: string;
  ticketId?: string;
  priority?: string;

  // Client review specifics
  rating?: number | string;
  reviewText?: string;
  reviewerRole?: string;

  // Common metadata
  timestamp?: string;
  idempotencyKey?: string;
  targetUrl?: string;

  // Legacy compatibility fields
  selectedPackage?: string;
  budgetRange?: string;
  timeline?: string;
  addOns?: string[];
  totalPrice?: number | string;
}

export interface OneSignalNotificationResponse {
  success: boolean;
  id?: string;
  recipients?: number;
  errors?: string[];
  data?: any;
  cached?: boolean;
}

// Default identifiers (Can be overridden via server environment variables)
const DEFAULT_APP_ID = 'f9cfc686-a78c-445f-a436-8b6bb2e6bdff';
const DEFAULT_ADMIN_PLAYER_ID = '32007a0b-38ed-4800-a681-f663fd00d188';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const dataDir = path.join(process.cwd(), 'data');

/**
 * Resolves and validates the single authorized ADMIN_PLAYER_ID.
 * Rejects invalid UUIDs and guards against accidentally passing ONESIGNAL_APP_ID as the player ID.
 */
export function resolveTargetAdminPlayerId(appId?: string): { adminPlayerId?: string; error?: string } {
  const resolvedAppId = (appId || process.env.ONESIGNAL_APP_ID || DEFAULT_APP_ID).trim();
  const rawCandidate = (
    process.env.ADMIN_PLAYER_ID ||
    process.env.ONESIGNAL_ADMIN_PLAYER_ID ||
    DEFAULT_ADMIN_PLAYER_ID
  ).trim();

  if (!rawCandidate || !UUID_REGEX.test(rawCandidate)) {
    return {
      error: `Invalid ADMIN_PLAYER_ID ("${rawCandidate}"). Expected a valid OneSignal subscription/player UUID.`
    };
  }

  if (rawCandidate.toLowerCase() === resolvedAppId.toLowerCase()) {
    return {
      error: `Misconfigured ADMIN_PLAYER_ID: "${rawCandidate}" matches ONESIGNAL_APP_ID. Set ADMIN_PLAYER_ID to the admin device subscription/player ID instead of the App ID.`
    };
  }

  return { adminPlayerId: rawCandidate };
}

export function getTargetAdminPlayerId(appId?: string): string {
  const { adminPlayerId } = resolveTargetAdminPlayerId(appId);
  return adminPlayerId || DEFAULT_ADMIN_PLAYER_ID;
}

/**
 * Backwards-compatible registration hook.
 * Strict security policy: public/unauthenticated calls cannot add arbitrary devices to admin alerts.
 * Only verifies whether the incoming ID matches the locked ADMIN_PLAYER_ID.
 */
export function registerAdminSubscription(subId: string, _email?: string): { ok: boolean; error?: string } {
  if (!subId || typeof subId !== 'string') {
    return { ok: false, error: 'Missing subscriptionId' };
  }
  const cleanId = subId.trim();
  const { adminPlayerId } = resolveTargetAdminPlayerId();
  if (adminPlayerId && cleanId.toLowerCase() === adminPlayerId.toLowerCase()) {
    console.log(`[OneSignal] Verified active admin device matches ADMIN_PLAYER_ID (${adminPlayerId}).`);
    return { ok: true };
  }
  console.warn(`[OneSignal] Ignored device registration (${cleanId}): notifications are strictly locked to ADMIN_PLAYER_ID.`);
  return {
    ok: false,
    error: 'Unauthorized: admin push alerts are strictly locked to ADMIN_PLAYER_ID.'
  };
}

export function unregisterAdminSubscription(_subId: string): boolean {
  return false;
}

export function setTargetAdminDevice(_opts?: {
  targetAdminPlayerId?: string;
  targetAdminSubscriptionId?: string;
}): { targetAdminPlayerId: string; lockedToEnvAdminPlayerId: true } {
  return {
    targetAdminPlayerId: getTargetAdminPlayerId(),
    lockedToEnvAdminPlayerId: true
  };
}

export function getNotificationDiagnosticInfo() {
  const hasKey = Boolean(process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY);
  const appId = process.env.ONESIGNAL_APP_ID ? `${process.env.ONESIGNAL_APP_ID.slice(0, 8)}...` : 'default';
  return {
    onesignalReady: hasKey,
    appIdPreview: appId,
    targetAdminPlayerId: getTargetAdminPlayerId(),
    timestamp: new Date().toISOString()
  };
}

export function getActiveAdminSubscriptions(): string[] {
  const { adminPlayerId } = resolveTargetAdminPlayerId();
  return adminPlayerId ? [adminPlayerId] : [];
}

const recentNotificationsFilePath = path.join(dataDir, 'recent_notifications.json');

export function getRecentNotifications(): AdminNotificationEvent[] {
  try {
    if (fs.existsSync(recentNotificationsFilePath)) {
      const parsed = JSON.parse(fs.readFileSync(recentNotificationsFilePath, 'utf8'));
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 50);
      }
    }
  } catch (_) {}
  return [];
}

export function recordRecentNotification(event: AdminNotificationEvent): void {
  try {
    const list = getRecentNotifications();
    const cleanEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString()
    };
    const idKey = event.idempotencyKey || event.appointmentId || event.quoteId || event.enquiryId || event.bookingId || event.clientId;
    const updated = [
      cleanEvent,
      ...list.filter((x: any) => {
        const xId = x.idempotencyKey || x.appointmentId || x.quoteId || x.enquiryId || x.bookingId || x.clientId;
        return xId !== idKey;
      })
    ].slice(0, 50);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(recentNotificationsFilePath, JSON.stringify(updated, null, 2), 'utf8');
  } catch (_) {}
}


// In-memory idempotency cache (TTL: 5 minutes) to prevent duplicate notifications
interface CachedResponse {
  timestamp: number;
  response: OneSignalNotificationResponse;
}
const idempotencyCache = new Map<string, CachedResponse>();

function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, item] of idempotencyCache.entries()) {
    if (now - item.timestamp > 5 * 60 * 1000) {
      idempotencyCache.delete(key);
    }
  }
}

/**
 * Format currency numbers cleanly (e.g. 45000 -> 45,000)
 */
function formatCurrency(val?: number | string): string {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val;
  if (isNaN(num)) return String(val).replace(/₹/g, '').trim();
  return num.toLocaleString('en-IN');
}



/**
 * Builds the notification title and actionable body according to the Tech Base Axis spec.
 */
function buildNotificationContent(event: AdminNotificationEvent): { title: string; body: string; deepLink: string } {
  const clientName = event.clientName || 'Client';
  const baseUrl = process.env.APP_URL || 'https://www.tbaonline.online';

  let title = '💬 Tech Base Axis Alert';
  let body = `${clientName} performed an action.`;
  let deepLink = `${baseUrl}/admin?tab=inquiries`;

  switch (event.eventType) {
    case 'account_created':
    case 'user_signup':
    case 'new_account': {
      title = '👤 New Client Account Created';
      body = `${clientName} (${event.email || event.clientEmail || 'Client'}) registered a new account on Tech Base Axis.`;
      const id = event.clientId || '';
      deepLink = id ? `${baseUrl}/admin?tab=inquiries` : `${baseUrl}/admin?tab=inquiries`;
      break;
    }

    case 'package_booking': {
      const pkgName = event.packageName || event.selectedPackage || 'Custom Package';
      const amountVal = formatCurrency(event.packagePrice || event.totalPrice || event.amount);
      title = '🔥 New Package Booking';
      body = amountVal 
        ? `${clientName} booked ${pkgName} for ₹${amountVal}.` 
        : `${clientName} booked ${pkgName}.`;
      const id = event.bookingId || event.inquiryId || '';
      deepLink = id ? `${baseUrl}/admin?tab=inquiries` : `${baseUrl}/admin?tab=inquiries`;
      break;
    }

    case 'appointment':
    case 'appointment_booked':
    case 'book_appointment': {
      const dateStr = event.date || event.appointmentDate || 'Upcoming Date';
      const timeStr = event.time || event.appointmentTime || '';
      title = '📅 New Appointment';
      body = timeStr 
        ? `${clientName} booked an appointment for ${dateStr} at ${timeStr}.`
        : `${clientName} booked an appointment for ${dateStr}.`;
      const id = event.appointmentId || event.inquiryId || '';
      deepLink = id ? `${baseUrl}/admin?tab=inquiries` : `${baseUrl}/admin?tab=inquiries`;
      break;
    }

    case 'quote_request': {
      const websiteType = event.websiteType || event.service || 'Website Project';
      title = '🧮 New Quote Request';
      body = `${clientName} requested a quote for ${websiteType}.`;
      const id = event.quoteId || event.inquiryId || '';
      deepLink = id ? `${baseUrl}/admin?tab=inquiries` : `${baseUrl}/admin?tab=inquiries`;
      break;
    }

    case 'contact_enquiry':
    case 'inquiry_message': {
      title = '💬 New Client Enquiry';
      body = `${clientName} sent a new enquiry.`;
      const id = event.enquiryId || event.inquiryId || '';
      deepLink = id ? `${baseUrl}/admin?tab=inquiries` : `${baseUrl}/admin?tab=inquiries`;
      break;
    }

    case 'payment_success': {
      const amountVal = formatCurrency(event.amount || event.packagePrice);
      title = '💰 Payment Received';
      body = amountVal 
        ? `₹${amountVal} received from ${clientName}.`
        : `Payment received from ${clientName}.`;
      const id = event.paymentId || event.orderId || event.projectId || '';
      deepLink = id ? `${baseUrl}/admin?tab=inquiries` : `${baseUrl}/admin?tab=inquiries`;
      break;
    }

    case 'proposal_accepted': {
      const projName = event.projectName || event.packageName || 'Project';
      title = '🎉 Proposal Accepted';
      body = `${clientName} accepted the proposal for ${projName}.`;
      const id = event.projectId || event.inquiryId || '';
      deepLink = id ? `${baseUrl}/admin?tab=inquiries` : `${baseUrl}/admin?tab=inquiries`;
      break;
    }

    case 'revision_request': {
      const projName = event.projectName || 'Project';
      const revInfo = event.revisionId ? ` — Revision #${event.revisionId}` : '';
      title = '🔄 New Revision Request';
      body = `${clientName} requested a revision for ${projName}${revInfo}.`;
      const id = event.projectId || event.revisionId || '';
      deepLink = id ? `${baseUrl}/admin?tab=inquiries` : `${baseUrl}/admin?tab=inquiries`;
      break;
    }

    case 'review_submitted':
    case 'review_message': {
      const stars = Number(event.rating) || 0;
      const text = (event.reviewText || event.message || event.details || '').trim();
      const short = text.length > 140 ? `${text.slice(0, 137)}...` : text;
      title = stars ? `⭐ New Client Review (${stars}/5)` : '⭐ New Client Review';
      body = short
        ? `${clientName} reviewed: "${short}"`
        : `${clientName} submitted a new review.`;
      deepLink = `${baseUrl}/admin`;
      break;
    }

    case 'support_request': {
      title = '🛠️ New Support Request';
      body = `${clientName} submitted a support request.`;
      const id = event.ticketId || event.projectId || '';
      deepLink = id ? `${baseUrl}/admin?tab=inquiries` : `${baseUrl}/admin?tab=inquiries`;
      break;
    }

    default: {
      title = '🚀 Tech Base Axis Notice';
      body = `${clientName} submitted a new request.`;
    }
  }

  if (event.targetUrl) {
    deepLink = event.targetUrl;
  }

  return { title, body, deepLink };
}

/**
 * Main Server-Side Notification Service
 * Dispatches high-priority push notification to admin device via OneSignal REST API.
 */
export async function sendAdminOneSignalNotification(
  eventData: AdminNotificationEvent,
  config?: { appId?: string; apiKey?: string }
): Promise<OneSignalNotificationResponse> {
  cleanExpiredCache();

  // Unified Notification Handler: Always record event locally and into inquiries table
  try {
    recordRecentNotification(eventData);
  } catch (_) {}
  try {
    recordInquiryFromNotification(eventData);
  } catch (_) {}

  // 1. Resolve and validate configuration from environment
  const appId = (config?.appId || process.env.ONESIGNAL_APP_ID || DEFAULT_APP_ID).trim();
  const apiKey = (config?.apiKey || process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY || '').trim();
  const { adminPlayerId, error: adminIdError } = resolveTargetAdminPlayerId(appId);

  if (!apiKey) {
    console.warn('[OneSignal] Note: ONESIGNAL_REST_API_KEY is not defined in server environment. Skipping push dispatch.');
    return {
      success: false,
      errors: ['ONESIGNAL_REST_API_KEY not configured in server environment. Set ONESIGNAL_REST_API_KEY in .env']
    };
  }

  if (!adminPlayerId || adminIdError) {
    console.error(`[OneSignal] ${adminIdError}`);
    return {
      success: false,
      errors: [adminIdError || 'ADMIN_PLAYER_ID is not configured.']
    };
  }

  // 2. Idempotency Check
  const referenceId = 
    eventData.idempotencyKey || 
    eventData.bookingId || 
    eventData.appointmentId || 
    eventData.quoteId || 
    eventData.enquiryId || 
    eventData.inquiryId || 
    eventData.paymentId || 
    eventData.revisionId || 
    eventData.ticketId;

  const idempotencyKey = referenceId ? `${eventData.eventType}:${referenceId}` : '';
  if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
    const cached = idempotencyCache.get(idempotencyKey)!;
    console.log(`[OneSignal] Idempotent dispatch skipped for key: ${idempotencyKey}`);
    return { ...cached.response, cached: true };
  }

  // 3. Build notification content
  const { title, body, deepLink } = buildNotificationContent(eventData);

  // 4. Construct payload for OneSignal REST API
  // STRICT SINGLE-DEVICE ADMIN ROUTING:
  // Target ONLY the single subscription/player registered with ADMIN_PLAYER_ID.
  // Public user subscriptions, segments, tags, and external_id aliases are NEVER targeted.
  const commonNotificationData = {
    event: 'new_inquiry',
    action: 'new_inquiry',
    type: 'new_inquiry',
    inquiryType: eventData.eventType,
    eventType: eventData.eventType,
    isIncomingSubmission: true,
    clientId: eventData.clientId || '',
    clientName: eventData.clientName,
    clientEmail: eventData.clientEmail || eventData.email || '',
    clientPhone: eventData.clientPhone || eventData.phone || '',
    packageName: eventData.packageName || eventData.selectedPackage || '',
    packagePrice: eventData.packagePrice || eventData.totalPrice || '',
    bookingId: eventData.bookingId || '',
    appointmentId: eventData.appointmentId || '',
    quoteId: eventData.quoteId || '',
    enquiryId: eventData.enquiryId || eventData.inquiryId || '',
    paymentId: eventData.paymentId || '',
    orderId: eventData.orderId || '',
    projectId: eventData.projectId || '',
    revisionId: eventData.revisionId || '',
    ticketId: eventData.ticketId || '',
    rating: eventData.rating || '',
    reviewText: eventData.reviewText || '',
    details: eventData.details || eventData.message || '',
    referenceId: referenceId || '',
    timestamp: eventData.timestamp || new Date().toISOString(),
    adminPlayerId,
    deepLink
  };

  const payload = {
    app_id: appId,
    include_subscription_ids: [adminPlayerId],
    headings: { en: title },
    contents: { en: body },
    web_url: deepLink,
    priority: 10,
    chrome_web_icon: 'https://www.tbaonline.online/tab_logo.png',
    chrome_web_badge: 'https://www.tbaonline.online/tab_logo.png',
    data: commonNotificationData
  };

  const primaryAuth = apiKey.startsWith('os_v2_') ? `Key ${apiKey}` : `Basic ${apiKey}`;
  const secondaryAuth = apiKey.startsWith('os_v2_') ? `Basic ${apiKey}` : `Key ${apiKey}`;

  const trySend = async (authHeader: string) => {
    try {
      const response = await fetch('https://api.onesignal.com/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': authHeader
        },
        body: JSON.stringify(payload)
      });
      const json: any = await response.json().catch(() => ({}));
      const hasId = typeof json?.id === 'string' && json.id.trim().length > 0;
      const hasRecipients = json?.recipients === undefined || Number(json.recipients) > 0;
      const hasErrors = Array.isArray(json?.errors) && json.errors.length > 0;
      const ok = response.ok && hasId && hasRecipients && !hasErrors;
      return { ok, status: response.status, json };
    } catch (err: any) {
      return { ok: false, status: 500, json: { errors: [err?.message || String(err)] } };
    }
  };

  let result = await trySend(primaryAuth);
  if (!result.ok && (result.status === 401 || result.status === 403)) {
    const retryResult = await trySend(secondaryAuth);
    if (retryResult.ok) {
      result = retryResult;
    }
  }

  let finalResult: OneSignalNotificationResponse;
  if (result.ok) {
    finalResult = {
      success: true,
      id: result.json.id,
      recipients: result.json.recipients,
      data: result.json
    };
  } else {
    const errDetail = result.json?.errors
      ? (Array.isArray(result.json.errors) ? result.json.errors.map(String) : [JSON.stringify(result.json.errors)])
      : [`HTTP ${result.status}: ${JSON.stringify(result.json)}`];
    finalResult = {
      success: false,
      errors: errDetail,
      data: result.json
    };
  }

  // Store in idempotency cache
  if (idempotencyKey && finalResult.success) {
    idempotencyCache.set(idempotencyKey, {
      timestamp: Date.now(),
      response: finalResult
    });
  }

  console.log(
    `[OneSignal] "${title}" -> ${finalResult.success ? `delivered strictly to ADMIN_PLAYER_ID (${adminPlayerId})` : `NOT delivered to ADMIN_PLAYER_ID (${adminPlayerId}): ${JSON.stringify(finalResult.errors)}`}`
  );
  return finalResult;
}

/**
 * Backwards compatibility export for existing handlers
 */
export async function sendOneSignalPushNotification(
  alert: any,
  config?: { appId?: string; apiKey?: string }
): Promise<OneSignalNotificationResponse> {
  const eventData: AdminNotificationEvent = {
    eventType: alert.eventType || 'inquiry_message',
    clientName: alert.clientName || 'Client',
    clientEmail: alert.email || alert.clientEmail,
    email: alert.email,
    clientPhone: alert.phone || alert.clientPhone,
    company: alert.company,
    packageName: alert.packageName || alert.selectedPackage,
    selectedPackage: alert.selectedPackage,
    packagePrice: alert.packagePrice || alert.totalPrice || alert.budgetRange,
    totalPrice: alert.totalPrice,
    bookingId: alert.inquiryId || alert.bookingId,
    appointmentId: alert.appointmentId || alert.inquiryId,
    appointmentDate: alert.appointmentDate,
    appointmentTime: alert.appointmentTime,
    date: alert.appointmentDate,
    time: alert.appointmentTime,
    quoteId: alert.quoteId || alert.inquiryId,
    websiteType: alert.projectType || alert.websiteType,
    estimatedPrice: alert.budgetRange || alert.estimatedPrice,
    enquiryId: alert.inquiryId || alert.enquiryId,
    inquiryId: alert.inquiryId,
    details: alert.details,
    message: alert.details,
    budgetRange: alert.budgetRange,
    timeline: alert.timeline,
    addOns: alert.addOns,
    timestamp: alert.timestamp || new Date().toISOString()
  };

  return sendAdminOneSignalNotification(eventData, config);
}
export type BookingAlertPayload = AdminNotificationEvent;
export const unifiedNotificationHandler = sendAdminOneSignalNotification;

