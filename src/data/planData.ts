import { ClientInquiry } from '../types';

export interface MyPlan {
  id: string;
  clientName?: string;
  email?: string;
  phone?: string;
  selectedPackage?: string;
  projectType?: string;
  planCategory: 'subscription' | 'maintenance';
  planTerm?: 'monthly' | 'yearly';
  planDecision?: 'pending' | 'confirmed' | 'rejected';
  planStartAt?: string;
  planEndAt?: string;
  totalPrice?: number | string;
  status?: string;
}

/** End of a plan: exactly one calendar month (monthly) or one year (yearly) after the start. */
export function computePlanEnd(startIso: string, term: 'monthly' | 'yearly'): string {
  const d = new Date(startIso);
  if (term === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

/** Patch that confirms a plan from this moment. */
export function confirmPlanPatch(term: 'monthly' | 'yearly'): Partial<ClientInquiry> {
  const now = new Date().toISOString();
  return {
    planDecision: 'confirmed',
    planTerm: term,
    planStartAt: now,
    planEndAt: computePlanEnd(now, term),
    planDecidedAt: now,
    status: 'In Development'
  };
}

export function rejectPlanPatch(): Partial<ClientInquiry> {
  return { planDecision: 'rejected', planDecidedAt: new Date().toISOString(), status: 'Completed' };
}

/** A visitor's own plans (server returns only that email's plan fields). */
export async function fetchMyPlans(email: string): Promise<MyPlan[]> {
  try {
    const q = email ? `?plans=${encodeURIComponent(email.trim().toLowerCase())}` : '';
    const r = await fetch(`/api/inquiries${q}`, { cache: 'no-store' });
    if (!r.ok) return [];
    const j = await r.json();
    if (Array.isArray(j?.plans)) return j.plans as MyPlan[];
    if (Array.isArray(j?.inquiries)) {
      return (j.inquiries as ClientInquiry[])
        .filter((i) => i.planCategory || i.planDecision)
        .map((i) => ({
          id: i.id,
          clientName: i.clientName,
          email: i.email,
          phone: i.phone,
          selectedPackage: i.selectedPackage,
          projectType: i.projectType,
          planCategory: (i.planCategory || 'maintenance') as 'subscription' | 'maintenance',
          planTerm: i.planTerm,
          planDecision: i.planDecision,
          planStartAt: i.planStartAt,
          planEndAt: i.planEndAt,
          totalPrice: i.totalPrice,
          status: i.status
        }));
    }
    return [];
  } catch (_) {
    return [];
  }
}

/** Fetch all plans across the system (used by admin or fallback). */
export async function fetchAllSystemPlans(): Promise<MyPlan[]> {
  try {
    const r = await fetch('/api/inquiries', { cache: 'no-store' });
    if (!r.ok) return [];
    const j = await r.json();
    if (Array.isArray(j?.plans)) return j.plans as MyPlan[];
    if (Array.isArray(j?.inquiries)) {
      return (j.inquiries as ClientInquiry[])
        .filter((i) => i.planCategory || i.planDecision)
        .map((i) => ({
          id: i.id,
          clientName: i.clientName,
          email: i.email,
          phone: i.phone,
          selectedPackage: i.selectedPackage,
          projectType: i.projectType,
          planCategory: (i.planCategory || 'maintenance') as 'subscription' | 'maintenance',
          planTerm: i.planTerm,
          planDecision: i.planDecision,
          planStartAt: i.planStartAt,
          planEndAt: i.planEndAt,
          totalPrice: i.totalPrice,
          status: i.status
        }));
    }
    return [];
  } catch (_) {
    return [];
  }
}

export function getLocalConfirmedPlans(): MyPlan[] {
  try {
    const raw = localStorage.getItem('tba_latest_confirmed_plan');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return [parsed];
    }
  } catch (_) {}
  return [];
}
