import { useState } from "react";
import { Mail, Loader2, Check, ArrowRight, Users } from "lucide-react";
import { motion } from "framer-motion";
import { razorpayService, PRICES_INR, formatINR } from "@/integrations/razorpay/razorpayService";

interface NewsletterTier {
  id?: string;
  name: string;
  description: string;
  frequency: "weekly" | "twice_weekly" | "daily";
  monthlyPrice: number;
  subscribers: number;
  benefits: string[];
}

const PaidNewsletter = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"free" | "pro" | "elite">("free");

  const tiers: Record<string, NewsletterTier> = {
    free: {
      name: "Free Newsletter",
      description: "Weekly curated tech news",
      frequency: "weekly",
      monthlyPrice: 0,
      subscribers: 15243,
      benefits: ["Weekly digest", "Latest tech news", "Community access"],
    },
    pro: {
      name: "Pro Newsletter",
      description: "2x weekly in-depth articles",
      frequency: "twice_weekly",
      monthlyPrice: PRICES_INR.NEWSLETTER_MONTHLY,
      subscribers: 3421,
      benefits: ["2x weekly articles", "Early access", "Exclusive interviews", "Job listings"],
    },
    elite: {
      name: "Elite Membership",
      description: "Daily premium insights",
      frequency: "daily",
      monthlyPrice: PRICES_INR.NEWSLETTER_MONTHLY * 2,
      subscribers: 892,
      benefits: [
        "Daily insights",
        "Premium courses",
        "1-on-1 mentoring",
        "Private community",
        "Ad-free experience",
      ],
    },
  };

  const handleSubscribe = async (tier: string) => {
    if (tier === "free") {
      setSubscribed(true);
      alert("Welcome to YESZ.in Newsletter!");
      return;
    }

    setLoading(true);
    try {
      const tierData = tiers[tier];

      // Create subscription order
      const order = await razorpayService.createPaymentOrder({
        amount: tierData.monthlyPrice,
        description: `${tierData.name} Subscription`,
        email: "subscriber@yesz.in",
        name: "Newsletter Subscriber",
        phone: "9999999999",
        paymentType: "subscription",
        referenceId: tier,
      });

      // Open payment modal
      await razorpayService.openPaymentCheckout({
        ...order,
        orderId: order.id,
        userId: "current_user_id",
      });

      setSubscribed(true);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to process subscription");
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <Check className="h-16 w-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Subscription Confirmed!</h2>
        <p className="text-muted-foreground">Check your email for confirmation details</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2 mb-2">
          <Mail className="h-10 w-10 text-primary" />
          Tech Newsletters
        </h1>
        <p className="text-muted-foreground text-lg">Stay ahead with curated tech insights</p>
      </motion.div>

      {/* Tier Selector */}
      <div className="flex gap-3 mb-8 justify-center flex-wrap">
        {["free", "pro", "elite"].map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier as any)}
            className={`px-4 py-2 rounded-full font-bold transition-all ${
              selectedTier === tier
                ? "bg-primary text-white"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            {tiers[tier].name}
          </button>
        ))}
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(tiers).map(([key, tier], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl border-2 p-6 transition-all ${
              selectedTier === key
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border hover:border-primary/50"
            }`}
          >
            {/* Popular badge */}
            {key === "pro" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
            )}

            {/* Tier info */}
            <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  {tier.monthlyPrice === 0 ? "Free" : `₹${(tier.monthlyPrice / 100).toFixed(0)}`}
                </span>
                {tier.monthlyPrice > 0 && <span className="text-muted-foreground">/month</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {tier.frequency.replace("_", " ")} updates
              </p>
            </div>

            {/* Subscribers count */}
            <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {tier.subscribers.toLocaleString()} subscribers
            </div>

            {/* Benefits */}
            <ul className="space-y-3 mb-6">
              {tier.benefits.map((benefit, j) => (
                <li key={j} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSubscribe(key)}
              disabled={loading}
              className={`w-full py-3 font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                selectedTier === key
                  ? "bg-primary text-white hover:shadow-lg"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {tier.monthlyPrice === 0 ? "Subscribe Free" : "Subscribe Now"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>

            {/* Trust badge */}
            {tier.monthlyPrice > 0 && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                ✓ Cancel anytime • Secure payment
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 p-8 rounded-xl bg-secondary border border-border"
      >
        <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <p className="font-semibold mb-1">Can I change my subscription tier?</p>
            <p className="text-sm text-muted-foreground">
              Yes, upgrade or downgrade anytime in your account settings.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Do you offer annual discounts?</p>
            <p className="text-sm text-muted-foreground">
              Yes! Subscribe for 12 months and save 20% on Pro or Elite plans.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Can I cancel anytime?</p>
            <p className="text-sm text-muted-foreground">
              Absolutely. Cancel your subscription anytime without penalties.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaidNewsletter;
