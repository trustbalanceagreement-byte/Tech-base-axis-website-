// NOTE: no relative imports on purpose. The Express server (run by Node directly) and the
// Vercel functions resolve file extensions differently, so the two helpers are passed in.
export interface VerifyPaymentDeps {
  sendAdminOneSignalNotification: (event: any) => Promise<any>;
  handleVerifyRazorpaySignature: (params: any) => { verified: boolean; statusCode: number; error?: string };
}

export interface HandlerResult {
  status: number;
  body: any;
}

/**
 * Verifies a payment (Razorpay signature or legacy UPI confirmation) and, only after
 * successful verification, alerts the admin. Shared by the Express server and the
 * Vercel serverless function so both behave identically.
 */
export async function processVerifyPayment(reqBody: any, deps: VerifyPaymentDeps): Promise<HandlerResult> {
  const { sendAdminOneSignalNotification, handleVerifyRazorpaySignature } = deps;
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
      orderId,
      amount,
      clientName,
      email,
      phone,
      packageName,
      projectId,
      status,
      utrNumber,
      selectedApp
    } = reqBody || {};

    const isRazorpayVerification = Boolean(razorpay_signature || (razorpay_order_id && razorpay_payment_id));

    if (isRazorpayVerification) {
      const verifyResult = handleVerifyRazorpaySignature(reqBody);
      if (!verifyResult.verified) {
        return {
          status: verifyResult.statusCode,
          body: { success: false, verified: false, error: verifyResult.error || 'Invalid signature' }
        };
      }

      const resolvedPaymentId = razorpay_payment_id || paymentId;
      const resolvedOrderId = razorpay_order_id || orderId;
      const numericAmount = Number(amount) || 0;

      const result = await sendAdminOneSignalNotification({
        eventType: 'payment_success',
        clientName: clientName || 'Valued Client',
        email: email || '',
        phone: phone || '',
        amount: numericAmount,
        paymentId: resolvedPaymentId,
        orderId: resolvedOrderId,
        packageName: packageName || 'Service Package',
        projectId: projectId || packageName || 'Razorpay Gateway',
        timestamp: new Date().toISOString()
      });

      return {
        status: 200,
        body: {
          success: true,
          verified: true,
          order_id: resolvedOrderId,
          payment_id: resolvedPaymentId,
          amount: numericAmount,
          message: 'Payment verified successfully',
          notification: result,
          verifiedAt: new Date().toISOString()
        }
      };
    }

    // Legacy direct UPI verification fallback
    if (!paymentId || !amount) {
      return { status: 400, body: { error: 'Invalid payment payload: paymentId and amount required' } };
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return { status: 400, body: { error: 'Invalid amount: must be a positive numeric value' } };
    }

    if (status !== 'success' && status !== 'captured' && status !== 'paid' && status !== undefined) {
      return { status: 400, body: { error: `Payment not verified. Status: ${status}` } };
    }

    const result = await sendAdminOneSignalNotification({
      eventType: 'payment_success',
      clientName: clientName || 'Valued Client',
      email: email || '',
      phone: phone || '',
      amount: numericAmount,
      paymentId,
      orderId: orderId || `ord_${Date.now()}`,
      packageName: packageName || 'Service Package',
      projectId: projectId || packageName || 'Package Architecture',
      timestamp: new Date().toISOString()
    });

    return {
      status: 200,
      body: {
        verified: true,
        paymentId,
        orderId,
        amount: numericAmount,
        utrNumber: utrNumber || null,
        selectedApp: selectedApp || 'UPI',
        notification: result,
        verifiedAt: new Date().toISOString()
      }
    };
  } catch (error: any) {
    return { status: 500, body: { error: error?.message || 'Payment verification failed' } };
  }
}
