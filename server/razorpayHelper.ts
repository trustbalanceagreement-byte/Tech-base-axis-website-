import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Razorpay credentials configuration
 * Uses environment variables with fallback to configured credentials
 */
export function getRazorpayClient() {
  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TlUFOOJ7roz9IN').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || 'ipOiOlF2y0uaXffI57HMph4p').trim();

  const client = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });

  return { client, keyId, keySecret };
}

export interface CreateOrderParams {
  amount: number | string; // in paise (e.g. 100 for ₹1, 50000 for ₹500)
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export interface CreateOrderResult {
  success: boolean;
  statusCode: number;
  data?: {
    order_id: string;
    amount: number;
    currency: string;
    key_id: string;
    payment_link_url?: string;
  };
  error?: string;
}

/**
 * STEP 1: Backend Create Order
 * Minimum amount: 100 paise (₹1)
 */
export async function handleCreateRazorpayOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const rawAmount = Number(params?.amount);

  if (isNaN(rawAmount) || rawAmount < 100) {
    return {
      success: false,
      statusCode: 400,
      error: 'Invalid order amount: Minimum amount is 100 paise (₹1)'
    };
  }

  const amountInPaise = Math.round(rawAmount);
  const currency = (params.currency || 'INR').toUpperCase();
  const receipt = params.receipt || `rcpt_${Date.now().toString().slice(-8)}`;
  const notes = params.notes || {};

  try {
    const { client, keyId } = getRazorpayClient();

    const order = await client.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes
    });

    if (!order || !order.id) {
      return {
        success: false,
        statusCode: 500,
        error: 'Razorpay order creation returned an empty response'
      };
    }

    // Generate hosted payment link as universal fallback for domain security restrictions
    let paymentLinkUrl: string | undefined;
    try {
      const plink = await client.paymentLink.create({
        amount: amountInPaise,
        currency,
        accept_partial: false,
        description: (notes.packageName as string) || 'Tech Base Axis Architecture',
        customer: {
          name: (notes.clientName as string) || 'Valued Client',
          email: (notes.email as string) || undefined,
          contact: (notes.phone as string) || undefined
        },
        notify: { sms: false, email: false },
        notes: {
          order_id: order.id,
          ...notes
        }
      });
      paymentLinkUrl = plink?.short_url;
    } catch (plinkErr: any) {
      console.warn('[Razorpay Payment Link Fallback Notice]:', plinkErr?.message);
    }

    return {
      success: true,
      statusCode: 200,
      data: {
        order_id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        key_id: keyId,
        payment_link_url: paymentLinkUrl
      }
    };
  } catch (err: any) {
    console.error('[Razorpay Order Creation Error]:', err);

    // Auth failures
    const statusCode = err?.statusCode === 401 || err?.error?.code === 'BAD_REQUEST_ERROR' && err?.error?.description?.includes('auth')
      ? 401
      : 500;

    return {
      success: false,
      statusCode,
      error: err?.error?.description || err?.message || 'Failed to create Razorpay order'
    };
  }
}

export interface VerifySignatureParams {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  // Also accept alternative field names
  order_id?: string;
  payment_id?: string;
  signature?: string;
  orderId?: string;
  paymentId?: string;
}

export interface VerifySignatureResult {
  success: boolean;
  statusCode: number;
  verified: boolean;
  message?: string;
  error?: string;
  order_id?: string;
  payment_id?: string;
}

/**
 * STEP 3: Backend Verify Signature
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 */
export function handleVerifyRazorpaySignature(params: VerifySignatureParams): VerifySignatureResult {
  const orderId = (params.razorpay_order_id || params.order_id || params.orderId || '').trim();
  const paymentId = (params.razorpay_payment_id || params.payment_id || params.paymentId || '').trim();
  const receivedSignature = (params.razorpay_signature || params.signature || '').trim();

  // Validate required fields
  if (!orderId || !paymentId || !receivedSignature) {
    return {
      success: false,
      statusCode: 400,
      verified: false,
      error: 'Missing required signature verification fields (order_id, payment_id, and signature are required)'
    };
  }

  const { keySecret } = getRazorpayClient();

  if (!keySecret) {
    return {
      success: false,
      statusCode: 500,
      verified: false,
      error: 'Razorpay secret key is not configured on the server'
    };
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const receivedBuf = Buffer.from(receivedSignature, 'utf8');

    // Constant-time comparison to prevent timing attacks
    if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
      console.warn(`[Razorpay Signature Mismatch] Order: ${orderId}, Payment: ${paymentId}`);
      return {
        success: false,
        statusCode: 400,
        verified: false,
        error: 'Payment verification failed: Signature mismatch. Payment has not been validated.'
      };
    }

    return {
      success: true,
      statusCode: 200,
      verified: true,
      message: 'Razorpay payment signature verified successfully',
      order_id: orderId,
      payment_id: paymentId
    };
  } catch (err: any) {
    console.error('[Razorpay Signature Verification Error]:', err);
    return {
      success: false,
      statusCode: 500,
      verified: false,
      error: err?.message || 'Error occurred during signature verification'
    };
  }
}
