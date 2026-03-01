import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, FileText, Settings, Mail, BarChart3, Trash2, Edit, Eye, 
  EyeOff, Lock, Unlock, ArrowLeft, Plus, Search, Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "posts" | "categories" | "subscribers">("dashboard");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalViews: 0,
    totalComments: 0,
    subscribers: 0,
  });

  // Users data
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAdmin) {
      navigate("/profile");
      toast.error("Admin access required");
      return;
    }
  }, [user, isAdmin, navigate]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Stats
        const [usersRes, postsRes, commentsRes, subscribersRes] = await Promise.all([
          supabase.from("profiles").select("user_id"),
          supabase.from("posts").select("id, views"),
          supabase.from("comments").select("id"),
          supabase.from("newsletter_subscribers").select("id"),
        ]);

        setStats({
          totalUsers: usersRes.data?.length || 0,
          totalPosts: postsRes.data?.length || 0,
          totalViews: postsRes.data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0,
          totalComments: commentsRes.data?.length || 0,
          subscribers: subscribersRes.data?.length || 0,
        });

        // Users
        const usersWithDetails = await Promise.all(
          (usersRes.data || []).map(async (u) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", u.user_id)
              .single();
            return profile;
          })
        );
        setUsers(usersWithDetails.filter(Boolean));

        // Posts
        const postsRes2 = await supabase
          .from("posts")
          .select("*, profiles(display_name), categories(name)")
          .order("created_at", { ascending: false });
        setPosts(postsRes2.data || []);

        // Categories
        const categoriesRes = await supabase.from("categories").select("*");
        setCategories(categoriesRes.data || []);

        // Subscribers
        const subscribersRes2 = await supabase
          .from("newsletter_subscribers")
          .select("*")
          .order("subscribed_at", { ascending: false });
        setSubscribers(subscribersRes2.data || []);
      } catch (err) {
        toast.error("Failed to load data");
      }
      setLoading(false);
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      toast.error("Failed to delete post");
    } else {
      toast.success("Post deleted");
      setPosts(posts.filter((p) => p.id !== postId));
    }
  };

  const handleTogglePostPublished = async (postId: string, published: boolean) => {
    const { error } = await supabase
      .from("posts")
      .update({ published: !published })
      .eq("id", postId);
    if (error) {
      toast.error("Failed to update post");
    } else {
      toast.success(`Post ${!published ? "published" : "unpublished"}`);
      setPosts(posts.map((p) => (p.id === postId ? { ...p, published: !published } : p)));
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    if (error) {
      toast.error("Failed to delete category");
    } else {
      toast.success("Category deleted");
      setCategories(categories.filter((c) => c.id !== categoryId));
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", subscriberId);
    if (error) {
      toast.error("Failed to delete subscriber");
    } else {
      toast.success("Subscriber removed");
      setSubscribers(subscribers.filter((s) => s.id !== subscriberId));
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.user_id.includes(searchQuery)
  );

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    { icon: Users, label: "Total Users", value: stats.totalUsers, color: "bg-blue-500/10 text-blue-500" },
    { icon: FileText, label: "Total Posts", value: stats.totalPosts, color: "bg-purple-500/10 text-purple-500" },
    { icon: Eye, label: "Total Views", value: stats.totalViews.toLocaleString(), color: "bg-green-500/10 text-green-500" },
    { icon: Mail, label: "Subscribers", value: stats.subscribers, color: "bg-orange-500/10 text-orange-500" },
  ];

  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "posts" as const, label: "Posts", icon: FileText },
    { id: "categories" as const, label: "Categories", icon: Filter },
    { id: "subscribers" as const, label: "Subscribers", icon: Mail },
  ];

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />

      <main className="py-10">
        <div className="container max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-black">Admin Panel</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your site content and users</p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </motion.div>

          {/* Stats Cards */}
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-border bg-card p-6 shadow-card"
                >
                  <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-black mt-1">{card.value}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                    <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <p className="text-sm">Total site data loaded and ready</p>
                        <span className="text-xs text-green-500 font-medium">✓ Synced</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex gap-3 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-input bg-secondary pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-secondary/50 border-b border-border">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">User</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Bio</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => (
                              <tr key={u.user_id} className="hover:bg-secondary/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium">{u.display_name || "N/A"}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground font-mono text-xs">
                                  {u.user_id.slice(0, 8)}...
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{u.bio || "-"}</td>
                                <td className="px-6 py-4 text-right">
                                  <button className="text-xs text-primary hover:underline">View</button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                No users found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Posts Tab */}
              {activeTab === "posts" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex gap-3 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-input bg-secondary pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-secondary/50 border-b border-border">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Views</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                              <tr key={post.id} className="hover:bg-secondary/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium max-w-xs truncate">{post.title}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{post.profiles?.display_name || "N/A"}</td>
                                <td className="px-6 py-4 text-sm">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      post.published
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-red-500/10 text-red-500"
                                    }`}
                                  >
                                    {post.published ? "Published" : "Draft"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{post.views || 0}</td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleTogglePostPublished(post.id, post.published)}
                                    className="text-xs text-primary hover:underline"
                                    title={post.published ? "Unpublish" : "Publish"}
                                  >
                                    {post.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                  </button>
                                  <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="text-xs text-destructive hover:underline"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                No posts found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Categories Tab */}
              {activeTab === "categories" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex gap-3 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-input bg-secondary pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-secondary/50 border-b border-border">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat) => (
                              <tr key={cat.id} className="hover:bg-secondary/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium">{cat.name}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground font-mono text-xs">{cat.slug}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{cat.description || "-"}</td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="text-xs text-destructive hover:underline"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                No categories found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Subscribers Tab */}
              {activeTab === "subscribers" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-secondary/50 border-b border-border">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Subscribed</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {subscribers.length > 0 ? (
                            subscribers.map((sub) => (
                              <tr key={sub.id} className="hover:bg-secondary/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium">{sub.email}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                  {new Date(sub.subscribed_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => handleDeleteSubscriber(sub.id)}
                                    className="text-xs text-destructive hover:underline"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                                No subscribers found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
