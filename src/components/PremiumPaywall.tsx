import { useState } from "react";
import { Lock, Unlock, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { razorpayService, PRICES_INR, formatINR } from "@/integrations/razorpay/razorpayService";
import { supabase } from "@/integrations/supabase/client";

interface PremiumPaywallProps {
  articleId: string;
  articleTitle: string;
  previewContent: string;
  fullContent: string;
  creatorName: string;
  userEmail?: string;
}

const PremiumPaywall = ({
  articleId,
  articleTitle,
  previewContent,
  fullContent,
  creatorName,
  userEmail,
}: PremiumPaywallProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accessType, setAccessType] = useState<"one_time" | "monthly">("one_time");

  const oneTimePrice = PRICES_INR.PREMIUM_ARTICLE; // ₹415
  const monthlyPrice = PRICES_INR.PREMIUM_ARTICLE / 2; // ₹207.50 for unlimited access

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        alert("Please sign in to unlock premium content");
        return;
      }

      // Create payment order
      const order = await razorpayService.createPaymentOrder({
        amount: accessType === "one_time" ? oneTimePrice : monthlyPrice,
        description: `Premium Article: ${articleTitle}`,
        email: userEmail || user.user.email || "",
        name: user.user.user_metadata?.name || "Reader",
        phone: user.user.user_metadata?.phone || "9999999999",
        paymentType: "course", // Using course type for articles
        referenceId: articleId,
      });

      // Open payment modal
      await razorpayService.openPaymentCheckout({
        ...order,
        orderId: order.id,
        userId: user.user.id,
      });

      // Mark as unlocked (payment will be verified server-side)
      setIsUnlocked(true);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: fullContent }}
      />
    );
  }

  return (
    <div className="relative">
      {/* Preview with blur effect */}
      <div className="prose prose-invert max-w-none blur-sm pointer-events-none">
        <div dangerouslySetInnerHTML={{ __html: previewContent }} />
      </div>

      {/* Premium Paywall Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background via-background/95 to-transparent"
      >
        <div className="text-center space-y-6 bg-card rounded-2xl p-8 border border-border max-w-md">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center"
          >
            <Lock className="h-12 w-12 text-primary" />
          </motion.div>

          <div>
            <h3 className="text-xl font-bold mb-2">Premium Content</h3>
            <p className="text-muted-foreground text-sm">
              Continue reading this exclusive article by {creatorName}
            </p>
          </div>

          {/* Pricing Options */}
          <div className="space-y-3">
            <button
              onClick={() => setAccessType("one_time")}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                accessType === "one_time"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-bold">{formatINR(oneTimePrice)}</div>
              <div className="text-xs text-muted-foreground">One-time purchase</div>
            </button>

            <button
              onClick={() => setAccessType("monthly")}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left relative ${
                accessType === "monthly"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                Save 50%
              </div>
              <div className="font-bold">{formatINR(monthlyPrice)}/month</div>
              <div className="text-xs text-muted-foreground">Unlimited premium access</div>
            </button>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUnlock}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                Unlock Now
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>

          <p className="text-xs text-muted-foreground">
            ✓ Secure and instant access • No subscription auto-renewal for one-time
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumPaywall;
