import { useState } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, Eye, Clock, Lock, Unlock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { razorpayService, PRICES_INR, formatINR } from "@/integrations/razorpay/razorpayService";

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  totalRevenue: number;
  topPostViews: number;
  avgEngagementTime: number;
  subscriberGrowth: number;
  contentPerformance: Array<{
    title: string;
    views: number;
    clicks: number;
    revenue: number;
  }>;
}

const CreatorAnalyticsPremium = ({ isPro = false }: { isPro?: boolean }) => {
  const [isUnlocked, setIsUnlocked] = useState(isPro);
  const [loading, setLoading] = useState(false);

  const sampleData: AnalyticsData = {
    totalViews: 125430,
    totalClicks: 3421,
    conversionRate: 2.72,
    totalRevenue: 185500, // in paise
    topPostViews: 15243,
    avgEngagementTime: 4.2, // minutes
    subscriberGrowth: 342,
    contentPerformance: [
      { title: "React Hooks Deep Dive", views: 18234, clicks: 542, revenue: 45000 },
      { title: "Web3 Security Guide", views: 12543, clicks: 387, revenue: 38000 },
      { title: "DevOps Best Practices", views: 9876, clicks: 234, revenue: 28500 },
    ],
  };

  const handleUnlock = async () => {
    setLoading(true);
    try {
      // Create payment order for premium analytics
      const order = await razorpayService.createPaymentOrder({
        amount: PRICES_INR.PRO_CREATOR_MONTHLY,
        description: "Creator Analytics Premium - Monthly",
        email: "creator@yesz.in",
        name: "Creator",
        phone: "9999999999",
        paymentType: "subscription",
        referenceId: "analytics_premium",
      });

      // Open payment modal
      await razorpayService.openPaymentCheckout({
        ...order,
        orderId: order.id,
        userId: "current_user_id",
      });

      setIsUnlocked(true);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to unlock premium analytics");
    } finally {
      setLoading(false);
    }
  };

  if (!isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <Lock className="h-16 w-16 mx-auto text-primary/40 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Premium Analytics Locked</h2>
        <p className="text-muted-foreground mb-6">
          Unlock detailed performance insights, revenue tracking, and advanced metrics
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="p-4 rounded-lg bg-secondary border border-border">
            <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-semibold text-sm mb-1">Advanced Analytics</p>
            <p className="text-xs text-muted-foreground">Deep insights into content performance</p>
          </div>

          <div className="p-4 rounded-lg bg-secondary border border-border">
            <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-semibold text-sm mb-1">Revenue Tracking</p>
            <p className="text-xs text-muted-foreground">Real-time earnings from all sources</p>
          </div>

          <div className="p-4 rounded-lg bg-secondary border border-border">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-semibold text-sm mb-1">Growth Metrics</p>
            <p className="text-xs text-muted-foreground">Track audience and subscriber growth</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUnlock}
          disabled={loading}
          className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50"
        >
          {loading ? "Processing..." : `Unlock Now - ${formatINR(PRICES_INR.PRO_CREATOR_MONTHLY)}/month`}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Back Button */}
      <Link
        to="/profile?tab=analytics"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Creator Analytics
          <Unlock className="h-5 w-5 text-green-500" />
        </h1>
        <p className="text-xs text-green-500 font-bold">PREMIUM UNLOCKED</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg bg-secondary border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Total Views</span>
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{(sampleData.totalViews / 1000).toFixed(1)}K</p>
          <p className="text-xs text-green-500 mt-1">+12.5% from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg bg-secondary border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Click-Through</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{sampleData.conversionRate}%</p>
          <p className="text-xs text-green-500 mt-1">+0.3% from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg bg-secondary border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">₹{(sampleData.totalRevenue / 100).toFixed(0)}</p>
          <p className="text-xs text-green-500 mt-1">+₹18,500 from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-lg bg-secondary border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Avg Engagement</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{sampleData.avgEngagementTime}m</p>
          <p className="text-xs text-green-500 mt-1">+0.5m from last month</p>
        </motion.div>
      </div>

      {/* Top performing content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-lg bg-secondary border border-border"
      >
        <h2 className="text-xl font-bold mb-4">Top Performing Content</h2>

        <div className="space-y-3">
          {sampleData.contentPerformance.map((content, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="p-4 rounded-lg bg-background border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold">{content.title}</h3>
                </div>
                <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                  #{i + 1}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Views</p>
                  <p className="font-bold text-lg">{(content.views / 1000).toFixed(1)}K</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Clicks</p>
                  <p className="font-bold text-lg">{content.clicks}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Revenue</p>
                  <p className="font-bold text-lg">₹{(content.revenue / 100).toFixed(0)}</p>
                </div>
              </div>

              {/* Performance bar */}
              <div className="mt-3 h-1 rounded-full bg-background overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(content.views / sampleData.topPostViews) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                  className="h-full bg-gradient-to-r from-primary to-primary/60"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Growth Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-6 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-muted-foreground mb-2">New Subscribers</p>
            <p className="text-3xl font-bold text-primary mb-1">+{sampleData.subscriberGrowth}</p>
            <p className="text-sm text-muted-foreground">This month</p>
          </div>

          <div>
            <p className="text-muted-foreground mb-2">Projected Monthly Revenue</p>
            <p className="text-3xl font-bold text-primary mb-1">₹{(sampleData.totalRevenue / 100).toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">Current pace</p>
          </div>

          <div>
            <p className="text-muted-foreground mb-2">Next Payout</p>
            <p className="text-3xl font-bold text-primary mb-1">₹{((sampleData.totalRevenue * 0.85) / 100).toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">After 15% commission</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatorAnalyticsPremium;
