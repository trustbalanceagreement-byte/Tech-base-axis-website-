/**
 * Razorpay Standard Web Checkout Integration Service
 * TBA Tech Base Axis - Payments Infrastructure
 */

export interface RazorpayOrderResponse {
  order_id: string;
  amount: number; // in paise
  currency: string;
  key_id?: string;
  payment_link_url?: string;
}

export interface RazorpaySuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerifyResponse {
  success: boolean;
  verified: boolean;
  order_id?: string;
  payment_id?: string;
  amount?: number;
  message?: string;
  error?: string;
}

export interface RazorpayCheckoutOptions {
  key?: string;
  amount: number; // in paise (e.g. 100 for ₹1)
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
    confirm_close?: boolean;
  };
  handler?: (response: RazorpaySuccessPayload) => void;
}

export interface LaunchCheckoutConfig {
  amountInRupees?: number;
  amountInPaise?: number;
  currency?: string;
  clientName?: string;
  email?: string;
  phone?: string;
  packageName?: string;
  description?: string;
  notes?: Record<string, any>;
  onSuccess: (data: {
    paymentId: string;
    orderId: string;
    signature: string;
    verifyResponse: RazorpayVerifyResponse;
  }) => void;
  onDismiss?: () => void;
  onFailure?: (error: { 
    code?: string; 
    description?: string; 
    reason?: string; 
    paymentLinkUrl?: string; 
    isDomainMismatch?: boolean;
    orderId?: string;
  }) => void;
}

/**
 * Dynamically loads Razorpay checkout script if not already present
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * STEP 1: Calls backend endpoint POST /api/create-order
 */
export async function createRazorpayOrder(params: {
  amountInPaise: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}): Promise<RazorpayOrderResponse> {
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: params.amountInPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes
    })
  });

  const data = await response.json();

  if (!response.ok || !data.order_id) {
    throw new Error(data.error || 'Failed to initialize payment order with Razorpay');
  }

  return data as RazorpayOrderResponse;
}

/**
 * STEP 3: Calls backend endpoint POST /api/verify-payment
 */
export async function verifyRazorpayPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount?: number;
  clientName?: string;
  email?: string;
  phone?: string;
  packageName?: string;
}): Promise<RazorpayVerifyResponse> {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok || !data.verified) {
    throw new Error(data.error || 'Payment signature could not be verified by server');
  }

  return data as RazorpayVerifyResponse;
}

/**
 * STEP 2: Launches full Razorpay Standard Checkout modal
 */
export async function launchRazorpayCheckout(config: LaunchCheckoutConfig): Promise<void> {
  // 1. Ensure Razorpay checkout.js script is loaded
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !(window as any).Razorpay) {
    throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
  }

  // 2. Calculate amount in paise (minimum 100 paise)
  const paise = config.amountInPaise || Math.round((config.amountInRupees || 1) * 100);
  if (paise < 100) {
    throw new Error('Minimum payment amount is ₹1.00 (100 paise)');
  }

  // 3. Request backend to create Razorpay Order
  const order = await createRazorpayOrder({
    amountInPaise: paise,
    currency: config.currency || 'INR',
    receipt: `tba_${Date.now().toString().slice(-8)}`,
    notes: {
      clientName: config.clientName || 'Client',
      packageName: config.packageName || 'Web Architecture',
      ...(config.notes || {})
    }
  });

  // 4. Client key ID from order response or Vite env
  const keyId = order.key_id || 
    (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 
    'rzp_test_TlUFOOJ7roz9IN';

  // 5. Build Razorpay Standard Checkout options
  const options: RazorpayCheckoutOptions = {
    key: keyId,
    amount: order.amount,
    currency: order.currency || 'INR',
    name: 'Tech Base Axis',
    description: config.description || (config.packageName ? `Package: ${config.packageName}` : 'High-Performance Web Architecture'),
    image: '/tab_logo.png',
    order_id: order.order_id,
    prefill: {
      name: config.clientName || '',
      email: config.email || '',
      contact: config.phone || ''
    },
    notes: {
      company: 'Tech Base Axis Kolkata',
      packageName: config.packageName || 'Custom Scope',
      ...(config.notes || {})
    },
    theme: {
      color: '#e61e2b', // TBA Signature Crimson
      backdrop_color: 'rgba(10, 10, 12, 0.85)'
    },
    modal: {
      ondismiss: () => {
        if (config.onDismiss) {
          config.onDismiss();
        }
      },
      confirm_close: true
    },
    handler: async (response: RazorpaySuccessPayload) => {
      try {
        // Send payment response to backend for HMAC verification
        const verifyResult = await verifyRazorpayPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          amount: Math.round(order.amount / 100),
          clientName: config.clientName,
          email: config.email,
          phone: config.phone,
          packageName: config.packageName
        });

        config.onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          verifyResponse: verifyResult
        });
      } catch (verifyErr: any) {
        if (config.onFailure) {
          config.onFailure({
            description: verifyErr.message || 'Payment signature verification failed'
          });
        }
      }
    }
  };

  const razorpayInstance = new (window as any).Razorpay(options);

  // Handle payment.failed event
  razorpayInstance.on('payment.failed', (failedResponse: any) => {
    console.error('[Razorpay Payment Failed Event]:', failedResponse);
    if (config.onFailure) {
      const rawDesc = failedResponse?.error?.description || '';
      const isDomainMismatch = 
        rawDesc.toLowerCase().includes('does not match registered website') ||
        failedResponse?.error?.reason === 'payment_risk_check_failed';

      const friendlyDescription = isDomainMismatch
        ? 'Payment blocked: this domain is not yet whitelisted in your Razorpay Dashboard. You can pay directly via the official Razorpay Secure Portal (rzp.io).'
        : (rawDesc || 'Payment was declined or cancelled by the bank');

      config.onFailure({
        code: failedResponse?.error?.code,
        description: friendlyDescription,
        reason: failedResponse?.error?.reason,
        paymentLinkUrl: order.payment_link_url,
        isDomainMismatch,
        orderId: order.order_id
      });
    }
  });

  // Open Razorpay Standard Checkout modal
  razorpayInstance.open();
}
