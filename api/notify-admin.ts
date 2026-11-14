// Vercel serverless function: POST /api/notify-admin
// Sends an admin-only OneSignal push for business events (bookings, enquiries, signups, reviews, payments).
import { sendAdminOneSignalNotification } from '../server/onesignalService.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const rawBody = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
    if (!rawBody || typeof rawBody !== 'object') {
      return res.status(400).json({ error: 'Missing notification payload' });
    }
    const result = await sendAdminOneSignalNotification({
      ...rawBody,
      clientName: rawBody.clientName || (rawBody.email ? String(rawBody.email).split('@')[0] : 'Client'),
      email: rawBody.email || rawBody.clientEmail || ''
    });
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
