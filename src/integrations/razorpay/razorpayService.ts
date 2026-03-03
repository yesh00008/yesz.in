// Razorpay Integration for India payments (INR)
// Razorpay is the #1 payment gateway in India, handles subscriptions + one-time payments

import { supabase } from '@/integrations/supabase/client';

// Initialize Razorpay (include in your main HTML or index.html)
// <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

interface RazorpayPaymentOptions {
  amount: number; // in paise (₹1 = 100 paise)
  description: string;
  email: string;
  name: string;
  phone: string;
  paymentType: 'subscription' | 'course' | 'job_posting' | 'sponsored' | 'event' | 'gift';
  referenceId?: string; // course_id, job_id, etc
}

interface RazorpaySubscriptionOptions extends RazorpayPaymentOptions {
  planId: string;
  totalCount?: number; // number of billing cycles
  customerNotify?: 1 | 0;
}

class RazorpayService {
  private razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

  constructor() {
    if (!this.razorpayKey) {
      console.error('Razorpay Key ID not configured in .env');
    }
  }

  /**
   * Create payment order (for one-time payments)
   */
  async createPaymentOrder(options: RazorpayPaymentOptions) {
    try {
      const response = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: options.amount,
          description: options.description,
          paymentType: options.paymentType,
          referenceId: options.referenceId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create order');
      return await response.json();
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  /**
   * Create subscription plan
   */
  async createPlan(period: 'monthly' | 'quarterly' | 'yearly', amountInPaise: number, description: string) {
    try {
      const intervalMap = { monthly: 1, quarterly: 3, yearly: 12 };
      const response = await fetch('/api/razorpay/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: 'monthly',
          interval: intervalMap[period],
          amount: amountInPaise,
          description,
        }),
      });

      if (!response.ok) throw new Error('Failed to create plan');
      return await response.json();
    } catch (error) {
      console.error('Plan creation error:', error);
      throw error;
    }
  }

  /**
   * Initialize payment checkout (opens Razorpay modal)
   */
  async openPaymentCheckout(options: RazorpayPaymentOptions & { orderId: string; userId: string }) {
    const Razorpay = (window as any).Razorpay;
    if (!Razorpay) {
      alert('Payment system loading, please try again');
      return;
    }

    const razorpayOptions = {
      key: this.razorpayKey,
      amount: options.amount,
      currency: 'INR',
      order_id: options.orderId,
      name: 'YESZ.in Tech Hub',
      description: options.description,
      customer_notify: 1,
      prefill: {
        name: options.name,
        email: options.email,
        contact: options.phone,
      },
      theme: {
        color: '#22c55e', // green theme
      },
      handler: async (response: any) => {
        await this.handlePaymentSuccess(response, options);
      },
      modal: {
        ondismiss: () => {
          console.log('Payment cancelled');
        },
      },
    };

    try {
      const razorpay = new Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to open payment gateway');
    }
  }

  /**
   * Initialize subscription checkout
   */
  async openSubscriptionCheckout(options: RazorpaySubscriptionOptions & { subscriptionId: string; userId: string }) {
    const Razorpay = (window as any).Razorpay;
    if (!Razorpay) {
      alert('Payment system loading, please try again');
      return;
    }

    const razorpayOptions = {
      key: this.razorpayKey,
      subscription_id: options.subscriptionId, // Razorpay subscription ID
      name: 'YESZ.in Creator Pro',
      description: options.description,
      customer_notify: 1,
      prefill: {
        name: options.name,
        email: options.email,
        contact: options.phone,
      },
      theme: {
        color: '#22c55e',
      },
      handler: async (response: any) => {
        await this.handlePaymentSuccess(response, options);
      },
    };

    try {
      const razorpay = new Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error) {
      console.error('Subscription checkout error:', error);
      alert('Failed to open subscription gateway');
    }
  }

  /**
   * Handle successful payment and store in database
   */
  private async handlePaymentSuccess(response: any, options: RazorpayPaymentOptions & { userId: string; orderId?: string; subscriptionId?: string }) {
    try {
      // Verify payment signature server-side before storing
      const verifyResponse = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: response.razorpay_order_id || response.razorpay_subscription_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      // Store payment in database
      const { error } = await supabase.from('payments').insert({
        user_id: options.userId,
        amount_inr: options.amount,
        payment_type: options.paymentType,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id || response.razorpay_subscription_id,
        status: 'success',
        reference_id: options.referenceId,
        description: options.description,
        payment_date: new Date().toISOString(),
      });

      if (error) throw error;

      // Handle specific payment types
      await this.handlePaymentByType(options.paymentType, options.userId, options.referenceId!);

      alert('✅ Payment successful! Thank you for supporting YESZ.in');
      return true;
    } catch (error) {
      console.error('Payment storage error:', error);
      alert('Payment recorded but failed to update profile. Contact support.');
      return false;
    }
  }

  /**
   * Process payment based on type
   */
  private async handlePaymentByType(paymentType: string, userId: string, referenceId: string) {
    switch (paymentType) {
      case 'subscription':
        await this.activateProSubscription(userId);
        break;
      case 'course':
        await supabase.from('course_enrollments').insert({
          user_id: userId,
          course_id: referenceId,
          enrolled_at: new Date().toISOString(),
        });
        break;
      case 'job_posting':
        await supabase.from('job_postings').update({ status: 'active' }).eq('id', referenceId);
        break;
      case 'event':
        await supabase.from('event_registrations').insert({
          user_id: userId,
          event_id: referenceId,
          registered_at: new Date().toISOString(),
        });
        break;
      // Add more types as needed
    }
  }

  /**
   * Activate creator pro subscription
   */
  private async activateProSubscription(userId: string) {
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    await supabase.from('creator_subscriptions').upsert({
      user_id: userId,
      plan_type: 'pro',
      status: 'active',
      monthly_price: 749, // ₹749 in paise
      renewal_date: renewalDate.toISOString(),
    });
  }

  /**
   * Create webhook for subscription renewals
   */
  async setupWebhook(webhookUrl: string) {
    try {
      const response = await fetch('/api/razorpay/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });

      if (!response.ok) throw new Error('Webhook setup failed');
      return await response.json();
    } catch (error) {
      console.error('Webhook setup error:', error);
      throw error;
    }
  }

  /**
   * Get balance and settlement info
   */
  async getBalance() {
    try {
      const response = await fetch('/api/razorpay/balance');
      if (!response.ok) throw new Error('Balance fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Balance fetch error:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string) {
    try {
      const response = await fetch(`/api/razorpay/subscription/${subscriptionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Subscription cancellation failed');

      // Update local database
      await supabase
        .from('creator_subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('razorpay_subscription_id', subscriptionId);

      return true;
    } catch (error) {
      console.error('Cancellation error:', error);
      throw error;
    }
  }

  /**
   * Get refund status
   */
  async getRefundStatus(paymentId: string) {
    try {
      const response = await fetch(`/api/razorpay/refund/${paymentId}`);
      if (!response.ok) throw new Error('Refund status fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Refund status error:', error);
      throw error;
    }
  }
}

export const razorpayService = new RazorpayService();

// Price constants in paise (₹1 = 100 paise)
export const PRICES_INR = {
  PRO_CREATOR_MONTHLY: 74900, // ₹749
  PREMIUM_ARTICLE: 41500, // ₹415 (~$5)
  NEWSLETTER_MONTHLY: 58000, // ₹580 (~$7)
  SMALL_COURSE: 158000, // ₹1,580 (~$19)
  MEDIUM_COURSE: 498000, // ₹4,980 (~$60)
  LARGE_COURSE: 825000, // ₹8,250 (~$99)
  SMALL_JOB: 2066500, // ₹20,665 (~$249)
  MEDIUM_JOB: 4149000, // ₹41,490 (~$500)
  LARGE_JOB: 8300000, // ₹83,000 (~$1,000)
  SPONSORED_SMALL: 2485000, // ₹24,850 (~$300)
  SPONSORED_MEDIUM: 4149000, // ₹41,490 (~$500)
  SPONSORED_LARGE: 8300000, // ₹83,000 (~$1,000)
  EVENT_TICKET: 75000, // ₹750 (~$9)
};

// Convert paise to rupees for display
export const paiseToRupees = (paise: number): string => {
  return (paise / 100).toFixed(2);
};

// Format for Indian currency display
export const formatINR = (paise: number): string => {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
};
