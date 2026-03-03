import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Calendar, Eye, FileText, Users, Instagram, Zap, BookOpen, Ticket, TrendingUp, Mail, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";

const CreatorProfile = () => {
  const { userId } = useParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  useEffect(() => {
    const fetchCreator = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (prof) setProfile(prof);

      const { data: creatorPosts } = await supabase
        .from("posts")
        .select("*, categories(name, slug)")
        .eq("author_id", userId!)
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (creatorPosts) setPosts(creatorPosts);

      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId!);
      setFollowerCount(count || 0);

      setLoading(false);
    };
    fetchCreator();
  }, [userId]);

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

      <main className="py-16">
        <div className="container max-w-6xl">
          {/* Creator Header Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <div className="grid md:grid-cols-3 gap-12 items-start">
              {/* Profile Info */}
              <div className="md:col-span-2">
                <div className="flex gap-6 mb-8">
                  <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center text-6xl font-black text-primary shrink-0 overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile.display_name?.[0]?.toUpperCase() || "C"
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-4xl font-black text-foreground mb-2">{profile.display_name || "Creator"}</h1>
                    {profile.bio && <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{profile.bio}</p>}
                    
                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-bold text-lg">{followerCount}</div>
                          <div className="text-xs text-muted-foreground">Followers</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-bold text-lg">{posts.length}</div>
                          <div className="text-xs text-muted-foreground">Articles</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-bold text-lg">{totalViews.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Total Views</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-bold text-sm">
                            {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </div>
                          <div className="text-xs text-muted-foreground">Joined</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {userId && <FollowButton authorId={userId} />}
                      {profile.website && (
                        <motion.a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 font-semibold text-sm text-primary transition-all"
                        >
                          <Globe className="h-4 w-4" /> Website
                        </motion.a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monetization Quick Links */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">Creator Links</h3>
                
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 bg-card hover:bg-primary/5 transition-all group"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Zap className="h-4 w-4 text-yellow-500" /> Premium Articles
                  </span>
                  <span className="text-xs text-muted-foreground">→</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 bg-card hover:bg-primary/5 transition-all group"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <BookOpen className="h-4 w-4 text-blue-500" /> Courses
                  </span>
                  <span className="text-xs text-muted-foreground">→</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 bg-card hover:bg-primary/5 transition-all group"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Mail className="h-4 w-4 text-green-500" /> Newsletter
                  </span>
                  <span className="text-xs text-muted-foreground">→</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 bg-card hover:bg-primary/5 transition-all group"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Briefcase className="h-4 w-4 text-purple-500" /> Services
                  </span>
                  <span className="text-xs text-muted-foreground">→</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-border my-12" />

          {/* Articles Section */}
          {posts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                Featured Articles
              </h2>
              
              <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
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
                        author: profile.display_name || "Creator",
                        slug: post.slug,
                      }}
                      index={i}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Empty State */}
          {posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 rounded-2xl border-2 border-dashed border-border"
            >
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">No Published Articles</h3>
              <p className="text-muted-foreground">This creator hasn't published any articles yet</p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatorProfile;
