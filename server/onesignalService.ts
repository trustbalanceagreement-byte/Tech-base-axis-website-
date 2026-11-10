import "dotenv/config";
import fs from 'fs';
import path from 'path';
import { syncAdminDevicesToSupabase, getAdminDevicesFromSupabase } from './supabaseHelper.ts';
import { recordInquiryFromNotification } from './inquiryHelper.ts';

/**
 * OneSignal Admin Notification Automation Service (Server-Side Only)
 * 
 * Target Admin OneSignal Player ID: 99a86c9f-366e-4625-9506-5af191a0297d
 * Registered Domain: https://www.tbaonline.online
 * 
 * SECURITY: REST API key is loaded strictly from process.env.ONESIGNAL_REST_API_KEY
 * and NEVER exposed to frontend or client bundles.
 */

export interface AdminNotificationEvent {
  eventType: 
    | 'account_created'
    | 'user_signup'
    | 'package_booking'
    | 'appointment'
    | 'quote_request'
    | 'contact_enquiry'
    | 'inquiry_message'
    | 'payment_success'
    | 'proposal_accepted'
    | 'revision_request'
    | 'support_request'
    | 'review_submitted';
  
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
const DEFAULT_ADMIN_PLAYER_ID = '99a86c9f-366e-4625-9506-5af191a0297d';

// Admin accounts. Their devices are linked to OneSignal as external_id = email
// (the website calls OneSignal.login(email) when an admin is signed in), so alerts
// follow the admin's phone/browser and reach NOBODY else. Override with ADMIN_EMAILS (comma separated).
function getAdminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (fromEnv.length) return fromEnv;
  return ['techbaseaxis@gmail.com', 'techbaseaixe@gmail.com', 'bgho40185@gmail.com'];
}

const dataDir = path.join(process.cwd(), 'data');
const adminDevicesFilePath = path.join(dataDir, 'admin_devices.json');

function loadStoredAdminDevices(): Set<string> {
  const set = new Set<string>();
  try {
    if (fs.existsSync(adminDevicesFilePath)) {
      const parsed = JSON.parse(fs.readFileSync(adminDevicesFilePath, 'utf8'));
      if (Array.isArray(parsed)) {
        parsed.forEach((id) => {
          // Exclude legacy dead test ID if present
          if (id && typeof id === 'string' && id !== 'f860ea79-2143-41ca-8f77-e7008dd7d025') {
            set.add(id.trim());
          }
        });
      }
    }
  } catch (_) {}
  return set;
}

// Store of actively registered admin phone/browser subscription IDs
const activeAdminSubscriptions = loadStoredAdminDevices();

(async () => {
  try {
    const supaDevices = await getAdminDevicesFromSupabase();
    if (Array.isArray(supaDevices)) {
      supaDevices.forEach((id) => {
        if (id && typeof id === 'string' && id !== 'f860ea79-2143-41ca-8f77-e7008dd7d025') {
          activeAdminSubscriptions.add(id.trim());
        }
      });
      try {
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(adminDevicesFilePath, JSON.stringify(Array.from(activeAdminSubscriptions), null, 2), 'utf8');
      } catch (_) {}
    }
  } catch (_) {}
})();

/**
 * Dynamically register the active device where the Admin Console is currently open
 */
export function registerAdminSubscription(subId: string, email?: string): void {
  if (subId && typeof subId === 'string' && subId.trim().length > 6) {
    const cleanId = subId.trim();
    activeAdminSubscriptions.add(cleanId);
    try {
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(adminDevicesFilePath, JSON.stringify(Array.from(activeAdminSubscriptions), null, 2), 'utf8');
      syncAdminDevicesToSupabase(Array.from(activeAdminSubscriptions)).catch(() => {});
    } catch (_) {}
    console.log(`[OneSignal] Admin phone/device registered: ${cleanId}${email ? ` (${email})` : ''}. Total active admin devices: ${activeAdminSubscriptions.size}`);
  }
}

export function getActiveAdminSubscriptions(): string[] {
  return Array.from(activeAdminSubscriptions);
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
 * Resolves active subscription IDs for admin player/user ID.
 * Queries OneSignal v16 User API and auto-heals any muted subscription flag.
 */
async function resolveAdminSubscriptions(appId: string, apiKey: string, adminPlayerId: string): Promise<string[]> {
  const subscriptions: string[] = [];
  const primarySubId = process.env.ONESIGNAL_ADMIN_SUBSCRIPTION_ID;

  try {
    const res = await fetch(`https://api.onesignal.com/apps/${appId}/users/by/onesignal_id/${adminPlayerId}`, {
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.subscriptions)) {
        for (const sub of data.subscriptions) {
          if (sub.token && sub.id) {
            subscriptions.push(sub.id);
            // Self-healing: if subscription was disabled or notification_types < 0, re-enable
            if (sub.enabled === false || (sub.notification_types !== undefined && sub.notification_types < 0)) {
              fetch(`https://api.onesignal.com/apps/${appId}/subscriptions/${sub.id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Key ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: { enabled: true, notification_types: 1 } })
              }).catch(() => {});
            }
          }
        }
      }
    }
  } catch (err: any) {
    console.warn('[OneSignal] Notice: Dynamic user subscription query completed:', err?.message || err);
  }

  // Only fallback if explicit environment variable was configured
  if (subscriptions.length === 0 && primarySubId && !subscriptions.includes(primarySubId)) {
    subscriptions.push(primarySubId);
  }

  return subscriptions;
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
    case 'user_signup': {
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

    case 'appointment': {
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

    case 'review_submitted': {
      const stars = Number(event.rating) || 0;
      const text = (event.reviewText || event.message || '').trim();
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

  // 1. Resolve configuration from environment
  const appId = config?.appId || process.env.ONESIGNAL_APP_ID || DEFAULT_APP_ID;
  const apiKey = config?.apiKey || process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY;
  const adminPlayerId = process.env.ONESIGNAL_ADMIN_PLAYER_ID || DEFAULT_ADMIN_PLAYER_ID;

  if (!apiKey) {
    console.warn('[OneSignal] Note: ONESIGNAL_REST_API_KEY is not defined in server environment. Skipping push dispatch.');
    return {
      success: false,
      errors: ['ONESIGNAL_REST_API_KEY not configured in server environment. Set ONESIGNAL_REST_API_KEY in .env']
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

  // 4. Resolve Target Admin Device Subscriptions
  // If the admin opened the admin panel on a phone/browser, its subscription is registered in activeAdminSubscriptions.
  const dynamicAdminSubs = getActiveAdminSubscriptions();
  const knownAdminSubs = await resolveAdminSubscriptions(appId, apiKey, adminPlayerId);
  const combinedAdminSubs = Array.from(new Set([...dynamicAdminSubs, ...knownAdminSubs])).filter(Boolean);

  // 5. Construct payload for OneSignal REST API
  // STRICT ADMIN ROUTING: Target ONLY the phone/device where the Admin Panel is open,
  // or devices tagged with role='admin'. Clients/subscribers are NEVER targeted!
  const commonNotificationData = {
    event: 'new_inquiry', // Unified real-time event identifier
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
    adminPlayerId: adminPlayerId,
    deepLink: deepLink
  };

  const baseBody = {
    app_id: appId,
    headings: { en: title },
    contents: { en: body },
    web_url: deepLink,
    priority: 10,
    chrome_web_icon: 'https://www.tbaonline.online/tab_logo.png',
    chrome_web_badge: 'https://www.tbaonline.online/tab_logo.png',
    data: commonNotificationData
  };

  const post = async (label: string, targeting: Record<string, any>) => {
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
          body: JSON.stringify({ ...baseBody, ...targeting })
        });
        const json: any = await response.json().catch(() => ({}));
        const ok = response.ok && Boolean(json?.id);
        return { ok, status: response.status, json };
      } catch (err: any) {
        return { ok: false, status: 500, json: { errors: [err?.message || String(err)] } };
      }
    };

    let result = await trySend(primaryAuth);
    // If rejected with 401/403 or Access denied, try alternative scheme
    if (!result.ok && (result.status === 401 || result.status === 403)) {
      const retryResult = await trySend(secondaryAuth);
      if (retryResult.ok) {
        result = retryResult;
      }
    }

    const ok = result.ok;
    const json = result.json;
    console.log(`[OneSignal] ${label}: ${ok ? 'sent' : 'not delivered'} (HTTP ${result.status})${ok ? '' : ' ' + JSON.stringify(json?.errors || json)}`);
    return { ok, json };
  };

  let finalResult: OneSignalNotificationResponse = { success: false };
  const adminEmails = getAdminEmails();
  const errors: string[] = [];

  // Robust Admin-only delivery: tries most specific routes down to aliases, tags and registered subscriptions
  const routes: { label: string; targeting: Record<string, any>; skip?: boolean }[] = [
    {
      label: 'registered active admin devices (subscription IDs)',
      targeting: { include_subscription_ids: combinedAdminSubs },
      skip: combinedAdminSubs.length === 0
    },
    {
      label: 'admin accounts (external_id aliases push)',
      targeting: { include_aliases: { external_id: adminEmails }, target_channel: 'push' }
    },
    {
      label: 'admin accounts (legacy external_user_ids)',
      targeting: { include_external_user_ids: adminEmails }
    },
    {
      label: 'admin player IDs',
      targeting: { include_player_ids: combinedAdminSubs },
      skip: combinedAdminSubs.length === 0
    },
    {
      label: 'admin tag role=admin',
      targeting: { filters: [{ field: 'tag', key: 'role', relation: '=', value: 'admin' }] }
    },
    {
      label: 'admin tag is_active_admin=true',
      targeting: { filters: [{ field: 'tag', key: 'is_active_admin', relation: '=', value: 'true' }] }
    }
  ];

  let anyRouteAccepted = false;

  for (const route of routes) {
    if (route.skip) continue;
    const { ok, json } = await post(route.label, route.targeting);
    const recipients = typeof json?.recipients === 'number' ? json.recipients : (ok ? 1 : 0);

    if (ok) {
      anyRouteAccepted = true;
      if (recipients > 0) {
        console.log(`[OneSignal] Alert successfully dispatched to ${recipients} admin device(s) via "${route.label}". Notification ID: ${json.id}`);
        finalResult = { success: true, id: json.id, recipients, data: json };
        break; // Successfully delivered to actual active admin recipient!
      } else {
        console.warn(`[OneSignal] Route "${route.label}" accepted (ID: ${json?.id}) but reported 0 recipients. Trying remaining routes to guarantee delivery to admin's active device...`);
        if (!finalResult.success) {
          finalResult = { success: true, id: json.id, recipients: 0, data: json };
        }
      }
    } else {
      errors.push(`${route.label}: ${JSON.stringify(json?.errors || json)}`);
    }
  }

  if (!finalResult.success && !anyRouteAccepted) {
    finalResult = { success: false, errors };
  }

  // Store in idempotency cache
  if (idempotencyKey && finalResult.success) {
    idempotencyCache.set(idempotencyKey, {
      timestamp: Date.now(),
      response: finalResult
    });
  }

  console.log(`[OneSignal] "${title}" -> ${finalResult.success ? 'delivered to admin device(s)' : 'NOT delivered to any admin device'}`);
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

