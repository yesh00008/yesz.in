import { useState } from "react";
import { Check, Loader2, IndianRupee, Crown, Zap, TrendingUp, BarChart3, Users, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { razorpayService, PRICES_INR, formatINR } from "@/integrations/razorpay/razorpayService";

interface CreatorProPaymentProps {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
}

const CreatorProPayment = ({ userId, userName, userEmail, userPhone }: CreatorProPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");

  const monthlyPrice = PRICES_INR.PRO_CREATOR_MONTHLY; // ₹749
  const yearlyPrice = monthlyPrice * 10; // ₹7,490 (Best value!)

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Create order
      const order = await razorpayService.createPaymentOrder({
        amount: selectedPlan === "monthly" ? monthlyPrice : yearlyPrice,
        description: `Creator Pro ${selectedPlan === "monthly" ? "Monthly" : "Yearly"} Subscription`,
        email: userEmail,
        name: userName,
        phone: userPhone,
        paymentType: "subscription",
      });

      // Open payment modal
      await razorpayService.openPaymentCheckout({
        ...order,
        orderId: order.id,
        userId,
      });
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: TrendingUp, text: "Monetize your content" },
    { icon: BarChart3, text: "Advanced analytics" },
    { icon: Users, text: "Boost visibility" },
    { icon: Zap, text: "Premium badge" },
    { icon: Crown, text: "Priority support" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Back Button */}
      <Link
        to="/profile?tab=subscription"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-primary mb-2">
          <Crown className="h-8 w-8" />
          Become a Creator Pro
        </h1>
        <p className="text-muted-foreground">Unlock monetization features and grow your audience</p>
      </div>

      {/* Plan Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {["monthly", "yearly"].map((plan) => (
          <button
            key={plan}
            onClick={() => setSelectedPlan(plan as "monthly" | "yearly")}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              selectedPlan === plan
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            {plan === "yearly" && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 33%
              </div>
            )}
            <div className="text-left">
              <h3 className="font-bold capitalize mb-1">{plan} Plan</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold">
                  {plan === "monthly"
                    ? `₹${(monthlyPrice / 100).toFixed(0)}`
                    : `₹${(yearlyPrice / 100).toFixed(0)}`}
                </span>
                <span className="text-muted-foreground">/{plan === "monthly" ? "month" : "year"}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {plan === "monthly"
                  ? "₹748 per month"
                  : "Just ₹624/month when paid yearly"}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary"
          >
            <feature.icon className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="text-sm">{feature.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Payment Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full py-3 px-6 bg-gradient-to-r from-primary to-primary/80 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <IndianRupee className="h-5 w-5" />
            Upgrade to Pro - {formatINR(selectedPlan === "monthly" ? monthlyPrice : yearlyPrice)}
          </>
        )}
      </motion.button>

      {/* Trust badges */}
      <div className="flex gap-4 mt-6 pt-6 border-t border-border justify-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          Secure Payment
        </div>
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          Cancel Anytime
        </div>
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          24/7 Support
        </div>
      </div>
    </motion.div>
  );
};

export default CreatorProPayment;
