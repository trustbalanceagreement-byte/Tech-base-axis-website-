import fs from 'fs';
import path from 'path';
import { 
  supabaseServerClient, 
  SUPABASE_BUCKET_NAME,
  syncInquiriesToSupabase,
  getInquiriesFromSupabase,
  syncDeletedInquiriesToSupabase,
  getDeletedInquiriesFromSupabase
} from './supabaseHelper.ts';

export interface ClientInquiry {
  id: string;
  clientName: string;
  email: string;
  phone?: string;
  company?: string;
  projectType: string;
  websiteType?: string;
  selectedFeatures?: string[];
  selectedPackage?: string;
  budgetRange: string;
  timeline: string;
  details: string;
  createdAt: string;
  status: 'New' | 'Reviewing' | 'Proposal Sent' | 'In Development' | 'Completed';
  priority?: 'Normal' | 'High' | 'Critical';
  notes?: string;
  eventType?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  addOns?: string[];
  basePrice?: number;
  totalPrice?: number;
  orderId?: string;
  cloudSavedAt?: string;
}

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (_) {}
}

const inquiriesFilePath = path.join(dataDir, 'inquiries.json');
const deletedInquiriesFilePath = path.join(dataDir, 'deleted_inquiries.json');

// Background sync with Supabase cloud storage to ensure multi-instance / serverless consistency
(async () => {
  try {
    const supaDeleted = await getDeletedInquiriesFromSupabase();
    if (Array.isArray(supaDeleted) && supaDeleted.length > 0) {
      const current = getDeletedInquiryIdsOnServer();
      supaDeleted.forEach((d) => current.add(String(d)));
      try {
        fs.writeFileSync(deletedInquiriesFilePath, JSON.stringify(Array.from(current), null, 2), 'utf8');
      } catch (_) {}
    }

    if (!fs.existsSync(inquiriesFilePath)) {
      const supaInquiries = await getInquiriesFromSupabase();
      if (Array.isArray(supaInquiries)) {
        const deletedIds = getDeletedInquiryIdsOnServer();
        const clean = supaInquiries.filter((i) => i && i.id && !deletedIds.has(i.id));
        fs.writeFileSync(inquiriesFilePath, JSON.stringify(clean, null, 2), 'utf8');
      }
    }
  } catch (_) {}
})();

export const INITIAL_INQUIRIES: ClientInquiry[] = [
  {
    id: "inq-101",
    clientName: "David Sterling",
    email: "david@sterlingventures.io",
    company: "Sterling Ventures",
    projectType: "Full-Stack SaaS",
    budgetRange: "₹10,000 - ₹25,000",
    timeline: "1 Month",
    details: "Looking to build a proprietary venture dealflow and LP analytics dashboard with real-time portfolio tracking and AI summarization of investor memorandums.",
    selectedPackage: "Full-Stack Growth Architecture",
    createdAt: "2026-09-15T14:30:00Z",
    status: "Proposal Sent",
    priority: "High",
    notes: "Client reviewed the Growth Architecture package. Scheduled a follow-up call to review wireframes.",
    eventType: "package_booking"
  },
  {
    id: "inq-102",
    clientName: "Elena Rostova",
    email: "elena@vanguardhealth.ai",
    company: "Vanguard Health AI",
    projectType: "AI & Intelligence",
    budgetRange: "₹25,000+",
    timeline: "2-3 Months",
    details: "Need a HIPAA-compliant medical research assistant utilizing private LLM embeddings to parse clinical trials and synthesize pharmacological contraindications.",
    selectedPackage: "Enterprise Scale & Modernization",
    createdAt: "2026-09-14T09:15:00Z",
    status: "Reviewing",
    priority: "Critical",
    notes: "Requires NDA and dedicated BAA infrastructure planning.",
    eventType: "contact_enquiry"
  },
  {
    id: "inq-103",
    clientName: "Marcus Chen",
    email: "marcus@velocitylabs.co",
    company: "Velocity Labs",
    projectType: "Rapid MVP",
    budgetRange: "₹3,000 - ₹10,000",
    timeline: "Urgent (< 2 weeks)",
    details: "Need a high-velocity functional MVP for our B2B compliance checker to demo at an upcoming investor summit in Singapore.",
    selectedPackage: "Rapid MVP Axis",
    createdAt: "2026-09-16T08:45:00Z",
    status: "New",
    priority: "High",
    notes: "Just received. High urgency for 14-day delivery sprint.",
    eventType: "quote_request"
  }
];

export function getDeletedInquiryIdsOnServer(): Set<string> {
  try {
    if (fs.existsSync(deletedInquiriesFilePath)) {
      const raw = fs.readFileSync(deletedInquiriesFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map(String));
      }
    }
  } catch (_) {}
  return new Set<string>();
}

export function recordDeletedInquiryIdOnServer(id: string): void {
  try {
    const safeId = String(id || '').trim();
    if (!safeId) return;
    const current = getDeletedInquiryIdsOnServer();
    current.add(safeId);
    fs.writeFileSync(deletedInquiriesFilePath, JSON.stringify(Array.from(current), null, 2), 'utf8');
    syncDeletedInquiriesToSupabase(Array.from(current)).catch(() => {});
  } catch (err) {
    console.error('[Inquiries] Error recording deleted inquiry ID on server:', err);
  }
}

export function getInquiriesList(): ClientInquiry[] {
  const deletedIds = getDeletedInquiryIdsOnServer();

  try {
    if (fs.existsSync(inquiriesFilePath)) {
      const raw = fs.readFileSync(inquiriesFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out deleted items - EVEN IF EMPTY ARRAY, KEEP IT EMPTY!
        const active = parsed.filter((item) => item && item.id && !deletedIds.has(item.id));
        return active.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      }
    }
  } catch (err) {
    console.warn('[Inquiries] Error reading inquiries from disk:', err);
  }

  // Pre-seed ONLY IF the file does not exist at all AND no inquiries have ever been deleted
  if (!fs.existsSync(inquiriesFilePath) && deletedIds.size === 0) {
    try {
      fs.writeFileSync(inquiriesFilePath, JSON.stringify(INITIAL_INQUIRIES, null, 2), 'utf8');
      syncInquiriesToSupabase(INITIAL_INQUIRIES).catch(() => {});
    } catch (_) {}
    return [...INITIAL_INQUIRIES];
  }

  return [];
}

export function saveInquiriesList(list: ClientInquiry[]): boolean {
  try {
    const deletedIds = getDeletedInquiryIdsOnServer();
    const cleanList = list.filter((item) => item && item.id && !deletedIds.has(item.id));
    fs.writeFileSync(inquiriesFilePath, JSON.stringify(cleanList, null, 2), 'utf8');
    syncInquiriesToSupabase(cleanList).catch(() => {});
    return true;
  } catch (err) {
    console.error('[Inquiries] Failed to write inquiries to disk:', err);
    return false;
  }
}

export function saveInquiry(inquiry: Partial<ClientInquiry>): { success: boolean; id: string; inquiry: ClientInquiry } {
  const rawId = String(inquiry.id || `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);

  // If this ID was previously marked as deleted, remove it from deleted list since user actively re-submitted
  try {
    const deleted = getDeletedInquiryIdsOnServer();
    if (deleted.has(safeId)) {
      deleted.delete(safeId);
      fs.writeFileSync(deletedInquiriesFilePath, JSON.stringify(Array.from(deleted), null, 2), 'utf8');
    }
  } catch (_) {}

  const currentList = getInquiriesList();

  const normalized: ClientInquiry = {
    id: safeId,
    clientName: String(inquiry.clientName || 'Direct Client').trim(),
    email: String(inquiry.email || '').trim().toLowerCase(),
    phone: inquiry.phone ? String(inquiry.phone).trim() : undefined,
    company: inquiry.company ? String(inquiry.company).trim() : 'Direct Founder',
    projectType: inquiry.projectType || inquiry.websiteType || 'General Consultation',
    websiteType: inquiry.websiteType,
    selectedFeatures: Array.isArray(inquiry.selectedFeatures) ? inquiry.selectedFeatures : undefined,
    selectedPackage: inquiry.selectedPackage,
    budgetRange: inquiry.budgetRange || 'Flexible',
    timeline: inquiry.timeline || 'Standard',
    details: inquiry.details || '',
    createdAt: inquiry.createdAt || new Date().toISOString(),
    status: inquiry.status || 'New',
    priority: inquiry.priority || 'Normal',
    notes: inquiry.notes,
    eventType: inquiry.eventType || 'contact_enquiry',
    appointmentDate: inquiry.appointmentDate,
    appointmentTime: inquiry.appointmentTime,
    addOns: Array.isArray(inquiry.addOns) ? inquiry.addOns : undefined,
    basePrice: inquiry.basePrice,
    totalPrice: inquiry.totalPrice,
    orderId: inquiry.orderId,
    cloudSavedAt: new Date().toISOString()
  };

  const existingIndex = currentList.findIndex((item) => item.id === safeId);
  let updatedList: ClientInquiry[];

  if (existingIndex >= 0) {
    updatedList = currentList.map((item, idx) => (idx === existingIndex ? { ...item, ...normalized } : item));
  } else {
    updatedList = [normalized, ...currentList];
  }

  saveInquiriesList(updatedList);
  return { success: true, id: safeId, inquiry: normalized };
}

export function updateInquiry(id: string, patch: Partial<ClientInquiry>): { success: boolean } {
  const safeId = String(id || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const currentList = getInquiriesList();
  const index = currentList.findIndex((item) => item.id === safeId);

  if (index === 0 || index > 0) {
    const updated = {
      ...currentList[index],
      ...patch,
      cloudSavedAt: new Date().toISOString()
    };
    currentList[index] = updated;
    saveInquiriesList(currentList);
    return { success: true };
  }

  return { success: false };
}

export function deleteInquiry(id: string): { success: boolean; id: string } {
  const safeId = String(id || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  // 1. Permanently record as deleted so it can never be resurrected
  recordDeletedInquiryIdOnServer(safeId);

  // 2. Remove from disk inquiries.json
  const currentList = getInquiriesList();
  const filtered = currentList.filter((item) => item.id !== safeId);
  saveInquiriesList(filtered);
  return { success: true, id: safeId };
}

/**
 * Automatically creates/updates an inquiry whenever an admin notification is triggered
 * (Appointment booked, Get Quote submitted, Enquiry sent, or Package booked).
 */
export function recordInquiryFromNotification(eventData: any): ClientInquiry | null {
  if (!eventData || typeof eventData !== 'object') return null;

  const rawId = eventData.appointmentId ||
    eventData.quoteId ||
    eventData.enquiryId ||
    eventData.bookingId ||
    eventData.inquiryId ||
    eventData.clientId ||
    `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const clientName = eventData.clientName || 'Direct Client';
  const email = eventData.email || eventData.clientEmail || '';
  if (!email && !clientName) return null;

  const eventType = eventData.eventType || 'contact_enquiry';
  let projectType = eventData.service || eventData.websiteType || eventData.subject || eventData.packageName || 'Web Architecture';

  let scopeDetails = eventData.details || eventData.message || '';
  if (eventType === 'appointment' && (eventData.date || eventData.appointmentDate)) {
    const d = eventData.date || eventData.appointmentDate;
    const t = eventData.time || eventData.appointmentTime || 'IST';
    if (!scopeDetails.includes(d)) {
      scopeDetails = `${scopeDetails ? scopeDetails + ' ' : ''}[Consultation requested for ${d} at ${t}]`;
    }
  } else if (eventType === 'review_submitted') {
    projectType = 'Client Review / Feedback';
    const stars = eventData.rating ? `${eventData.rating}/5 ⭐` : '5/5 ⭐';
    const text = eventData.reviewText || eventData.message || 'Client feedback submitted.';
    scopeDetails = `[${stars}] "${text}" (Role: ${eventData.reviewerRole || 'Client'})`;
  } else if (eventType === 'account_created' || eventType === 'user_signup') {
    projectType = 'New Account Created';
    scopeDetails = `New user profile registered on Tech Base Axis. Email: ${email}.`;
  }

  const { inquiry } = saveInquiry({
    id: rawId,
    clientName,
    email,
    phone: eventData.phone || eventData.clientPhone || undefined,
    company: eventData.company || 'Direct Founder',
    projectType,
    websiteType: eventData.websiteType,
    selectedFeatures: typeof eventData.selectedFeatures === 'string'
      ? eventData.selectedFeatures.split(',').map((s: string) => s.trim())
      : eventData.selectedFeatures,
    selectedPackage: eventData.packageName,
    budgetRange: eventData.estimatedPrice || eventData.budgetRange || (eventData.totalPrice ? `₹${eventData.totalPrice}` : 'Standard'),
    timeline: eventData.timeline || 'Standard',
    details: scopeDetails,
    createdAt: eventData.timestamp || new Date().toISOString(),
    status: 'New',
    priority: eventData.priority || (eventType === 'appointment' ? 'High' : 'Normal'),
    notes: `Triggered via ${eventType}. Phone: ${eventData.phone || eventData.clientPhone || 'N/A'}.`,
    eventType,
    appointmentDate: eventData.date || eventData.appointmentDate,
    appointmentTime: eventData.time || eventData.appointmentTime,
    totalPrice: eventData.totalPrice || eventData.packagePrice,
    orderId: eventData.orderId || eventData.bookingId
  });

  return inquiry;
}
