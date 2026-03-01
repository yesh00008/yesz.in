import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Globe, FileText, Save, LogOut, Camera, PenTool,
  Eye, Calendar, Shield, Bookmark, BarChart3, ArrowRight, Edit2, Trash2, Plus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import { toast } from "sonner";

const Profile = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "activity" | "blogs" | "settings">("profile");
  const [userBlogs, setUserBlogs] = useState<any[]>([]);
  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    website: "",
    avatar_url: "",
  });
  const [stats, setStats] = useState({ posts: 0, views: 0, bookmarks: 0, comments: 0 });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const fetchData = async () => {
      const [profileRes, postsRes, bookmarksRes, commentsRes, blogsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("posts").select("id, views").eq("author_id", user.id),
        supabase.from("bookmarks").select("id").eq("user_id", user.id),
        supabase.from("comments").select("id").eq("user_id", user.id),
        supabase.from("posts").select("id, title, slug, summary, image_url, published, created_at, views").eq("author_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (profileRes.data) {
        setProfile({
          display_name: profileRes.data.display_name || "",
          bio: profileRes.data.bio || "",
          website: profileRes.data.website || "",
          avatar_url: profileRes.data.avatar_url || "",
        });
      }
      const posts = postsRes.data || [];
      setStats({
        posts: posts.length,
        views: posts.reduce((sum, p) => sum + (p.views || 0), 0),
        bookmarks: bookmarksRes.data?.length || 0,
        comments: commentsRes.data?.length || 0,
      });
      setUserBlogs(blogsRes.data || []);
    };
    fetchData();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        website: profile.website,
        avatar_url: profile.avatar_url,
      })
      .eq("user_id", user.id);

    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated!");
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out");
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", blogId);
    if (error) {
      toast.error("Failed to delete blog");
    } else {
      toast.success("Blog deleted!");
      setUserBlogs(userBlogs.filter(b => b.id !== blogId));
    }
  };

  const statCards = [
    { icon: FileText, label: "Posts", value: stats.posts, color: "text-primary" },
    { icon: Eye, label: "Total Views", value: stats.views.toLocaleString(), color: "text-blue-500" },
    { icon: Bookmark, label: "Bookmarks", value: stats.bookmarks, color: "text-yellow-500" },
    { icon: BarChart3, label: "Comments", value: stats.comments, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="py-10">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* Profile Header Card */}
            <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden mb-6">
              <div className="h-24 bg-hero relative" />
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 -mt-10">
                  <div className="w-20 h-20 rounded-full bg-card border-4 border-card flex items-center justify-center text-2xl font-bold text-primary shadow-card">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      profile.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "Y"
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <h1 className="text-2xl font-black">{profile.display_name || "User"}</h1>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                          <Globe className="h-3 w-3" /> Website
                        </a>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Joined {new Date(user?.created_at || "").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to="/creator/dashboard"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all"
                    >
                      <PenTool className="h-3.5 w-3.5" /> Creator Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-card text-center">
                  <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-border">
              {(["profile", "activity", "blogs", "settings"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                    activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> Display Name
                  </label>
                  <input
                    type="text"
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" /> Bio
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" /> Website
                  </label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yoursite.com"
                    className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-muted-foreground" /> Avatar URL
                  </label>
                  <input
                    type="url"
                    value={profile.avatar_url}
                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    ) : (
                      <><Save className="h-4 w-4" /> Save Changes</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "activity" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><PenTool className="h-5 w-5 text-primary" /> Quick Actions</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Link to="/creator/write" className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-secondary hover:border-primary/30 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <PenTool className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Write a Post</p>
                        <p className="text-xs text-muted-foreground">Create new content</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </Link>
                    <Link to="/creator/dashboard" className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-secondary hover:border-primary/30 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Dashboard</p>
                        <p className="text-xs text-muted-foreground">View analytics</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-secondary hover:border-red-500/30 transition-all group">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                          <Shield className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Admin Panel</p>
                          <p className="text-xs text-muted-foreground">Manage site content</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                      </Link>
                    )}
                    <Link to="/bookmarks" className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-secondary hover:border-primary/30 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                        <Bookmark className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Bookmarks</p>
                        <p className="text-xs text-muted-foreground">Saved articles</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </Link>
                    <Link to={`/creator/${user?.id}`} className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-secondary hover:border-primary/30 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                        <Eye className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Public Profile</p>
                        <p className="text-xs text-muted-foreground">How others see you</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "blogs" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> My Blogs ({userBlogs.length})</h3>
                  <Link to="/creator/write" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all">
                    <Plus className="h-4 w-4" /> New Blog
                  </Link>
                </div>

                {userBlogs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h4 className="font-semibold mb-2">No blogs yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">Start creating your first blog post to inspire others!</p>
                    <Link to="/creator/write" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all">
                      <PenTool className="h-4 w-4" /> Write Your First Blog
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {userBlogs.map((blog) => (
                      <motion.div
                        key={blog.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-border bg-card hover:border-primary/30 transition-all overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row gap-4 p-6">
                          {blog.image_url && (
                            <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                              <img
                                src={blog.image_url}
                                alt={blog.title}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg mb-2 line-clamp-2">{blog.title}</h4>
                            {blog.summary && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{blog.summary}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                              <span>{new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" /> {blog.views || 0} views
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${blog.published ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                                {blog.published ? "Published" : "Draft"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link
                              to={`/creator/write/${blog.id}`}
                              className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-all"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-6">
                <div>
                  <h3 className="font-bold mb-1 flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Email</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div>
                  <h3 className="font-bold mb-1 flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" /> Account Security</h3>
                  <p className="text-sm text-muted-foreground mb-3">Manage your account security and sign-out options.</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 transition-all"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
