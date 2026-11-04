// Vercel serverless function: POST /api/verify-payment
import { processVerifyPayment } from '../server/verifyPayment.js';
import { sendAdminOneSignalNotification } from '../server/onesignalService.js';
import { handleVerifyRazorpaySignature } from '../server/razorpayHelper.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const result = await processVerifyPayment(req.body, { sendAdminOneSignalNotification, handleVerifyRazorpaySignature });
  return res.status(result.status).json(result.body);
}
