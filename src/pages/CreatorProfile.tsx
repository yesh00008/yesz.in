import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Calendar, Eye, FileText, Users, Instagram, Zap, BookOpen, Ticket, TrendingUp, Mail, Briefcase, Settings, Edit2, Twitter, Linkedin, Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";

const CreatorProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ display_name: "", bio: "", website: "" });

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchCreator = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (prof) {
        setProfile(prof);
        setEditFormData({
          display_name: prof.display_name || "",
          bio: prof.bio || "",
          website: prof.website || "",
        });
      }

      const { data: creatorPosts } = await supabase
        .from("posts")
        .select("*, categories(name, slug)")
        .eq("author_id", userId!)
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (creatorPosts) setPosts(creatorPosts);

      const { data: researchPapers } = await supabase
        .from("research_papers")
        .select("*")
        .eq("author_id", userId!)
        .eq("published_at", "is.not.null")
        .order("published_at", { ascending: false });
      if (researchPapers) setPapers(researchPapers);

      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId!);
      setFollowerCount(count || 0);

      setLoading(false);
    };
    fetchCreator();
  }, [userId]);

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    try {
      await supabase
        .from("profiles")
        .update(editFormData)
        .eq("user_id", user.id);
      setProfile({ ...profile, ...editFormData });
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar onSearchOpen={() => setSearchOpen(true)} />
        <div className="container max-w-4xl py-20">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-secondary" />
              <div className="space-y-2">
                <div className="h-6 bg-secondary rounded w-40" />
                <div className="h-4 bg-secondary rounded w-60" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => <div key={i} className="h-48 bg-secondary rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-black text-gradient mb-4">404</div>
          <h1 className="text-2xl font-bold mb-3">Creator Not Found</h1>
          <Link to="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="py-6 md:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Edit Modal */}
          {showEditModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-2xl p-6 max-w-md w-full space-y-4 border border-border"
              >
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Username</label>
                  <input
                    type="text"
                    value={editFormData.display_name}
                    onChange={(e) => setEditFormData({ ...editFormData, display_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:border-primary"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Bio</label>
                  <textarea
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:border-primary resize-none"
                    placeholder="Your bio"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Website</label>
                  <input
                    type="url"
                    value={editFormData.website}
                    onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:border-primary"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all font-semibold"
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-primary/10 flex items-center justify-center text-5xl font-black text-primary shrink-0 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.display_name?.[0]?.toUpperCase() || "C"
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground">{profile?.display_name || "Creator"}</h1>
                    {profile?.bio && <p className="text-sm sm:text-base text-muted-foreground mt-1">{profile.bio}</p>}
                  </div>
                  {isOwnProfile && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowEditModal(true)}
                      className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors flex items-center gap-2 text-sm"
                    >
                      <Settings className="h-4 w-4" /> Edit
                    </motion.button>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                    <div className="text-lg font-black text-primary">{followerCount}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                    <div className="text-lg font-black text-primary">{posts.length}</div>
                    <div className="text-xs text-muted-foreground">Articles</div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                    <div className="text-lg font-black text-primary">{papers.length}</div>
                    <div className="text-xs text-muted-foreground">Papers</div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                    <div className="text-lg font-black text-primary">{totalViews.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {!isOwnProfile && userId && <FollowButton authorId={userId} />}
                  {profile?.website && (
                    <motion.a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-primary/5 font-semibold text-sm transition-all"
                    >
                      <Globe className="h-4 w-4" /> Website
                    </motion.a>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Follow:</span>
              <motion.button whileHover={{ scale: 1.1 }} className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <Twitter className="h-4 w-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <Linkedin className="h-4 w-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <Github className="h-4 w-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <Instagram className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />
          </motion.div>

          {/* Articles Section */}
          {posts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                Articles ({posts.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.slice(0, 6).map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <PostCard
                      post={{
                        id: post.id,
                        title: post.title,
                        summary: post.summary || "",
                        category: post.categories?.name || "General",
                        image: post.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
                        date: new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                        readTime: post.read_time || "5 min",
                        author: profile?.display_name || "Creator",
                        slug: post.slug,
                      }}
                      index={i}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Research Papers Section */}
          {papers.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                Research Papers ({papers.length})
              </h2>
              <div className="grid gap-4">
                {papers.slice(0, 6).map((paper, i) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/paper/${paper.id}`}
                      className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border hover:border-primary/30 bg-card hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors mb-2">{paper.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">{paper.abstract}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>{paper.institution}</span>
                          {paper.published_at && (
                            <span>{new Date(paper.published_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <motion.button whileHover={{ x: 4 }} className="text-primary font-semibold text-sm">
                          View →
                        </motion.button>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {posts.length === 0 && papers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 sm:py-20 rounded-2xl border-2 border-dashed border-border"
            >
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">No Content Yet</h3>
              <p className="text-muted-foreground">This creator hasn't published any articles or papers yet</p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatorProfile;
