// Vercel serverless function: POST /api/notify-booking (legacy alias)
import { sendOneSignalPushNotification } from '../server/onesignalService.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const payload = req.body;
    if (!payload?.clientName && !payload?.email) {
      return res.status(400).json({ error: 'Missing required clientName or email' });
    }
    const result = await sendOneSignalPushNotification(payload);
    return res.status(result.success ? 200 : 502).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
