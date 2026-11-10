// Vercel serverless function: POST /api/register-admin-device
// (Serverless memory is short-lived; delivery mainly relies on the admin's OneSignal external_id.)
import { registerAdminSubscription } from '../server/onesignalService.js';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const subscriptionId = req.body?.subscriptionId;
  const email = req.body?.email;
  if (!subscriptionId) return res.status(400).json({ error: 'Missing subscriptionId' });
  registerAdminSubscription(subscriptionId, email);
  return res.status(200).json({ success: true, registered: subscriptionId, email });
}
