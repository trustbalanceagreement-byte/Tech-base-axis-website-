import { getRecentNotifications, getNotificationAttempts } from '../../server/onesignalService.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const list = getRecentNotifications();
    const attempts = getNotificationAttempts(50);
    return res.status(200).json({ success: true, notifications: list, attempts });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to get notifications', notifications: [], attempts: [] });
  }
}
