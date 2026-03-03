import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Eye, Share2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Analytics = () => {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalShares: 0,
    totalComments: 0,
    totalFollowers: 0,
    trendingScore: 0,
  });
  const [contentStats, setContentStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Fetch content analytics
        const { data: analytics } = await supabase
          .from("content_analytics")
          .select("*")
          .order("trending_score", { ascending: false })
          .limit(10);

        if (analytics) {
          setContentStats(analytics);
          const totals = analytics.reduce(
            (acc, stat) => ({
              totalViews: acc.totalViews + (stat.views || 0),
              totalShares: acc.totalShares + (stat.shares || 0),
              trendingScore: acc.trendingScore + (stat.trending_score || 0),
            }),
            { totalViews: 0, totalShares: 0, trendingScore: 0 }
          );
          setStats((prev) => ({ ...prev, ...totals }));
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <Navbar />

      <main className="container max-w-6xl py-12 px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your content performance and audience engagement.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="h-5 w-5 text-green-500" />
              <p className="text-sm text-muted-foreground">Total Shares</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalShares.toLocaleString()}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <p className="text-sm text-muted-foreground">Trending Score</p>
            </div>
            <p className="text-2xl font-bold">{stats.trendingScore.toFixed(1)}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5 text-orange-500" />
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalFollowers.toLocaleString()}</p>
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Top Performing Content
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {contentStats.map((stat) => (
                <div key={stat.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{stat.content_type === "post" ? "Post" : "Paper"}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.views} views • {stat.shares} shares
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{stat.trending_score?.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Trending</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Analytics;
