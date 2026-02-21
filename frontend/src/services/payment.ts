/**
 * Payment Service — Khalti / eSewa integration stub
 *
 * This module provides a payment gateway abstraction.
 * Currently in stub mode (shows alert). When ready to go live:
 *
 * 1. Sign up at https://khalti.com/join/merchant/
 * 2. Get your public key and secret key
 * 3. Set VITE_KHALTI_PUBLIC_KEY in frontend/.env
 * 4. Set KHALTI_SECRET_KEY in backend/.env
 * 5. Uncomment the Khalti SDK integration below
 *
 * Backend flow:
 *   1. Frontend initiates payment → Khalti widget opens
 *   2. User completes payment → Khalti returns token
 *   3. Frontend sends token to backend → Backend verifies with Khalti API
 *   4. Backend creates/upgrades subscription in DB
 *   5. Frontend refreshes subscription state
 */

export type PaymentProvider = 'khalti' | 'esewa';

export interface PaymentRequest {
  amount: number;          // in paisa (Rs. 199 = 19900)
  productName: string;
  productIdentity: string; // e.g., 'basic_monthly'
  productUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  token?: string;
  provider: PaymentProvider;
  error?: string;
}

/**
 * Initiates a payment via Khalti
 *
 * Production integration:
 * ```
 * npm install khalti-checkout-web
 * ```
 *
 * Then replace the stub below with:
 * ```
 * import KhaltiCheckout from 'khalti-checkout-web';
 *
 * const checkout = new KhaltiCheckout({
 *   publicKey: import.meta.env.VITE_KHALTI_PUBLIC_KEY,
 *   productIdentity: req.productIdentity,
 *   productName: req.productName,
 *   productUrl: window.location.origin,
 *   eventHandler: {
 *     onSuccess: (payload) => resolve({ success: true, token: payload.token, provider: 'khalti' }),
 *     onError: (error) => resolve({ success: false, provider: 'khalti', error: error.message }),
 *   },
 * });
 * checkout.show({ amount: req.amount });
 * ```
 */
export async function initiateKhaltiPayment(req: PaymentRequest): Promise<PaymentResult> {
  const khaltiKey = import.meta.env.VITE_KHALTI_PUBLIC_KEY;

  if (!khaltiKey) {
    // Stub mode — show info alert
    const confirmed = window.confirm(
      `💳 Payment Integration Coming Soon!\n\n` +
      `Plan: ${req.productName}\n` +
      `Amount: Rs. ${(req.amount / 100).toLocaleString()}\n\n` +
      `Khalti/eSewa payment will be available soon.\n` +
      `Contact oshimpathan@gmail.com for early access.`
    );
    return {
      success: false,
      provider: 'khalti',
      error: confirmed ? 'Payment integration not yet live' : 'Payment cancelled',
    };
  }

  // When Khalti SDK is installed:
  // return new Promise((resolve) => { ... });

  return { success: false, provider: 'khalti', error: 'Khalti SDK not configured' };
}

/**
 * Verify payment token with backend
 * Backend should call Khalti's /api/v2/payment/verify/ endpoint
 */
export async function verifyPayment(
  token: string,
  amount: number,
  provider: PaymentProvider = 'khalti'
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, amount, provider }),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Payment verification failed' };
  }
}

/**
 * Full payment flow: initiate → verify → upgrade
 */
export async function processSubscriptionPayment(
  tier: 'basic' | 'pro',
  billingCycle: 'monthly' | 'yearly',
  amount: number,
): Promise<{ success: boolean; error?: string }> {
  const result = await initiateKhaltiPayment({
    amount: amount * 100, // Convert to paisa
    productName: `ShareSathi ${tier.charAt(0).toUpperCase() + tier.slice(1)} — ${billingCycle}`,
    productIdentity: `${tier}_${billingCycle}`,
  });

  if (!result.success || !result.token) {
    return { success: false, error: result.error };
  }

  const verification = await verifyPayment(result.token, amount * 100);
  return verification;
}
