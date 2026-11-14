// Vercel serverless function: POST /api/set-target-admin-device
import { setTargetAdminDevice } from '../server/onesignalService.js';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { targetAdminPlayerId, targetAdminSubscriptionId } = req.body || {};
  const updated = setTargetAdminDevice({ targetAdminPlayerId, targetAdminSubscriptionId });
  return res.status(200).json({ success: true, ...updated });
}
