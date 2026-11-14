// Vercel serverless function: POST & DELETE /api/register-admin-device
import { registerAdminSubscription, unregisterAdminSubscription, setTargetAdminDevice } from '../server/onesignalService.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'DELETE') {
    const subId = (req.query?.subscriptionId || req.body?.subscriptionId || '').toString();
    if (!subId) return res.status(400).json({ error: 'Missing subscriptionId' });
    const wasActive = unregisterAdminSubscription(subId);
    return res.status(200).json({ success: true, unregistered: subId, wasActive });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { subscriptionId, email, setAsTarget, playerId, onesignalId } = req.body || {};
  if (!subscriptionId) return res.status(400).json({ error: 'Missing subscriptionId' });

  const result = await registerAdminSubscription(subscriptionId, email);
  if (!result.ok) {
    return res.status(result.error?.startsWith('Unauthorized') ? 403 : 400).json({
      success: false,
      error: result.error || 'Failed to register device'
    });
  }

  if (setAsTarget) {
    setTargetAdminDevice({
      targetAdminPlayerId: onesignalId || playerId,
      targetAdminSubscriptionId: subscriptionId
    });
  }

  return res.status(200).json({ success: true, registered: subscriptionId });
}
