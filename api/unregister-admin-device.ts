// Vercel serverless function: POST /api/unregister-admin-device
// Removes the device subscription so push alerts STOP reaching it after logout
import { unregisterAdminSubscription } from '../server/onesignalService.js';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const subscriptionId = req.body?.subscriptionId;
  if (!subscriptionId) return res.status(400).json({ error: 'Missing subscriptionId' });
  const wasActive = unregisterAdminSubscription(subscriptionId);
  return res.status(200).json({ success: true, unregistered: subscriptionId, wasActive });
}
