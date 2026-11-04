// Vercel serverless function: POST /api/create-order (Razorpay order)
import { handleCreateRazorpayOrder } from '../server/razorpayHelper.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const result = await handleCreateRazorpayOrder(req.body);
    if (!result.success) return res.status(result.statusCode).json({ error: result.error });
    return res.status(result.statusCode).json(result.data);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Internal server error while creating order' });
  }
}
