import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  PenTool, Eye, TrendingUp, DollarSign, Plus, FileText,
  Clock, CheckCircle, Edit3, Trash2, BarChart3, Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import { toast } from "sonner";

const CreatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const fetchData = async () => {
      const [postsRes, tipsRes] = await Promise.all([
        supabase.from("posts").select("*, categories(name)").eq("author_id", user.id).order("created_at", { ascending: false }),
        supabase.from("creator_tips").select("*").eq("creator_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (postsRes.data) setPosts(postsRes.data);
      if (tipsRes.data) setTips(tipsRes.data);
      setLoading(false);
    };
    fetchData();
  }, [user, navigate]);

  const handleDelete = async (postId: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) toast.error("Failed to delete");
    else {
      setPosts(p => p.filter(post => post.id !== postId));
      toast.success("Post deleted");
    }
  };

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalEarnings = tips.reduce((sum, t) => sum + Number(t.amount), 0);
  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = posts.filter(p => !p.published).length;

  const filteredPosts = activeTab === "all" ? posts
    : activeTab === "published" ? posts.filter(p => p.published)
    : posts.filter(p => !p.published);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const stats = [
    { icon: FileText, label: "Total Posts", value: posts.length, color: "text-primary" },
    { icon: Eye, label: "Total Views", value: totalViews.toLocaleString(), color: "text-info" },
    { icon: TrendingUp, label: "Published", value: publishedCount, color: "text-success" },
    { icon: DollarSign, label: "Earnings", value: `$${totalEarnings.toFixed(2)}`, color: "text-warning" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="py-10">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black">Creator Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your content and track performance</p>
              </div>
              <Link
                to="/creator/write"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all"
              >
                <Plus className="h-4 w-4" /> New Post
              </Link>
            </div>

            {/* Stats */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <motion.div key={stat.label} variants={item} className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-border">
              {(["all", "published", "draft"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                    activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab} {tab === "all" ? `(${posts.length})` : tab === "published" ? `(${publishedCount})` : `(${draftCount})`}
                </button>
              ))}
            </div>

            {/* Posts List */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-14 bg-secondary rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-1/2" />
                        <div className="h-3 bg-secondary rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                {filteredPosts.map((post) => (
                  <motion.div key={post.id} variants={item} className="rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-card-hover transition-all group">
                    <div className="flex items-center gap-4">
                      {post.image_url && (
                        <img src={post.image_url} alt="" className="w-20 h-14 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{post.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {post.published ? <CheckCircle className="h-3 w-3 text-success" /> : <Clock className="h-3 w-3" />}
                            {post.published ? "Published" : "Draft"}
                          </span>
                          <span>{post.categories?.name || "Uncategorized"}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views || 0}</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/creator/write/${post.id}`}
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20 rounded-xl border border-dashed border-border">
                <PenTool className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start creating content to grow your audience</p>
                <Link to="/creator/write" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all">
                  <Plus className="h-4 w-4" /> Write Your First Post
                </Link>
              </div>
            )}

            {/* Recent Tips */}
            {tips.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-warning" /> Recent Tips
                </h2>
                <div className="space-y-2">
                  {tips.slice(0, 5).map(tip => (
                    <div key={tip.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning text-sm font-bold">$</div>
                        <div>
                          <p className="text-sm font-medium">${Number(tip.amount).toFixed(2)}</p>
                          {tip.message && <p className="text-xs text-muted-foreground truncate max-w-xs">{tip.message}</p>}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(tip.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatorDashboard;
