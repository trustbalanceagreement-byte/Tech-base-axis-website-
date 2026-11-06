// Vercel serverless function: /api/inquiries
// Shared inquiry store (Supabase Storage, written with the server-side key) so appointments,
// quotes, enquiries and bookings reach the admin panel on any device even if Firestore rules block them.
//   POST   { ...inquiry }          create / overwrite one inquiry
//   PUT    { id, patch }           merge changes (status, notes)
//   DELETE ?id=...                 remove one
//   GET                            list newest first
import { supabaseServerClient, SUPABASE_BUCKET_NAME } from '../server/supabaseHelper.js';

const FOLDER = 'inquiries';
const safeId = (id: unknown) => String(id || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
const pathFor = (id: string) => `${FOLDER}/${id}.json`;

async function readOne(id: string): Promise<any | null> {
  const { data, error } = await supabaseServerClient.storage.from(SUPABASE_BUCKET_NAME).download(pathFor(id));
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text());
  } catch {
    return null;
  }
}

async function writeOne(id: string, value: any) {
  const body = new Blob([JSON.stringify(value)], { type: 'application/json' });
  const { error } = await supabaseServerClient.storage
    .from(SUPABASE_BUCKET_NAME)
    .upload(pathFor(id), body, { contentType: 'application/json', cacheControl: '0', upsert: true });
  if (error) throw new Error(error.message);
}

function bodyOf(req: any): any {
  let b = req.body;
  if (typeof b === 'string') {
    try { b = JSON.parse(b); } catch { b = {}; }
  }
  return b || {};
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json');
  try {
    if (req.method === 'POST') {
      const inq = bodyOf(req);
      const id = safeId(inq?.id);
      if (!id || typeof inq?.clientName !== 'string') return res.status(400).json({ error: 'Invalid inquiry' });
      await writeOne(id, { ...inq, id: inq.id, cloudSavedAt: new Date().toISOString() });
      return res.status(200).json({ success: true, id });
    }

    if (req.method === 'PUT') {
      const body = bodyOf(req);
      const id = safeId(body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const existing = (await readOne(id)) || { id: body.id };
      await writeOne(id, { ...existing, ...(body.patch || {}), id: body.id });
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const id = safeId(req.query?.id || new URL(req.url || '', 'http://x').searchParams.get('id'));
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await supabaseServerClient.storage.from(SUPABASE_BUCKET_NAME).remove([pathFor(id)]);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
      const { data: files, error } = await supabaseServerClient.storage
        .from(SUPABASE_BUCKET_NAME)
        .list(FOLDER, { limit: 300, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) return res.status(500).json({ error: error.message });
      const names = (files || []).filter((f: any) => f.name.endsWith('.json')).slice(0, 300);
      const items = await Promise.all(names.map((f: any) => readOne(f.name.replace(/\.json$/, ''))));
      const all = items.filter(Boolean);
      const planEmail = String(req.query?.plans || new URL(req.url || '', 'http://x').searchParams.get('plans') || '')
        .trim()
        .toLowerCase();
      if (planEmail) {
        // Public, per-user view: only that user's own plan fields (never other clients' data)
        const mine = all
          .filter((i: any) => i.planCategory && String(i.email || '').trim().toLowerCase() === planEmail)
          .map((i: any) => ({
            id: i.id,
            selectedPackage: i.selectedPackage,
            projectType: i.projectType,
            planCategory: i.planCategory,
            planTerm: i.planTerm,
            planDecision: i.planDecision,
            planStartAt: i.planStartAt,
            planEndAt: i.planEndAt
          }));
        return res.status(200).json({ success: true, plans: mine });
      }
      return res.status(200).json({ success: true, inquiries: all });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Inquiry store error' });
  }
}
