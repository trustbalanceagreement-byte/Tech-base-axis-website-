import { ClientInquiry } from '../types';

export interface MyPlan {
  id: string;
  selectedPackage?: string;
  projectType?: string;
  planCategory: 'subscription' | 'maintenance';
  planTerm?: 'monthly' | 'yearly';
  planDecision?: 'pending' | 'confirmed' | 'rejected';
  planStartAt?: string;
  planEndAt?: string;
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
    const r = await fetch(`/api/inquiries?plans=${encodeURIComponent(email.trim().toLowerCase())}`, { cache: 'no-store' });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j?.plans) ? (j.plans as MyPlan[]) : [];
  } catch (_) {
    return [];
  }
}
