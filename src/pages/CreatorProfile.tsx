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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="py-12 px-4">
        <div className="max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            
            {/* Link in Bio Card */}
            <div className="rounded-3xl border-2 border-border bg-card/95 backdrop-blur-sm shadow-2xl overflow-hidden">
              {/* Background Header */}
              <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/10" />
              
              {/* Profile Section */}
              <div className="px-6 pb-6">
                {/* Avatar */}
                <div className="flex justify-center -mt-16 mb-4">
                  <div className="w-32 h-32 rounded-full bg-card border-4 border-card shadow-lg overflow-hidden flex items-center justify-center text-5xl font-black text-primary">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile.display_name?.[0]?.toUpperCase() || "C"
                    )}
                  </div>
                </div>

                {/* Name */}
                <h1 className="text-2xl font-black text-center text-foreground mb-2">{profile.display_name || "Creator"}</h1>
                
                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm text-center text-muted-foreground mb-6 leading-relaxed">{profile.bio}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-8 text-center">
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-lg font-black text-primary">{followerCount}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-lg font-black text-primary">{posts.length}</div>
                    <div className="text-xs text-muted-foreground">Articles</div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-lg font-black text-primary">{totalViews.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </motion.div>
                </div>

                {/* Follow Button */}
                {userId && <div className="mb-6">{<FollowButton authorId={userId} />}</div>}

                {/* Action Links */}
                <div className="space-y-3">
                  {/* Website */}
                  {profile.website && (
                    <motion.a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 font-semibold text-sm text-foreground transition-all"
                    >
                      <Globe className="h-4 w-4" /> WEBSITE
                    </motion.a>
                  )}

                  {/* Articles */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => document.querySelector("#articles")?.scrollIntoView({ behavior: "smooth" })}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 font-semibold text-sm text-foreground transition-all"
                  >
                    <FileText className="h-4 w-4" /> ARTICLES ({posts.length})
                  </motion.button>

                  {/* Blog Monetization */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/40 font-semibold text-sm text-foreground transition-all"
                  >
                    <Zap className="h-4 w-4" /> PREMIUM ACCESS
                  </motion.button>

                  {/* Coaching/Services */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 font-semibold text-sm text-foreground transition-all"
                  >
                    <BookOpen className="h-4 w-4" /> COURSES
                  </motion.button>

                  {/* Newsletter */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/40 font-semibold text-sm text-foreground transition-all"
                  >
                    <Mail className="h-4 w-4" /> NEWSLETTER
                  </motion.button>

                  {/* Affiliates */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40 font-semibold text-sm text-foreground transition-all"
                  >
                    <TrendingUp className="h-4 w-4" /> AFFILIATE LINKS
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="h-px bg-border my-6" />

                {/* Social Icons */}
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Footer Info */}
                <p className="text-xs text-muted-foreground text-center mt-6">
                  Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Articles Section */}
            {posts.length > 0 && (
              <div id="articles" className="mt-12">
                <h2 className="text-2xl font-bold text-center mb-6">Featured Articles</h2>
                <div className="grid gap-4">
                  {posts.slice(0, 6).map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="group"
                    >
                      <Link
                        to={`/blog/${post.slug}`}
                        className="flex gap-4 p-4 rounded-xl border border-border hover:border-primary/30 bg-card hover:bg-primary/5 transition-all"
                      >
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt=""
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{post.categories?.name || "General"}</p>
                        </div>
                      </Link>
                    </motion.div>
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

export default CreatorProfile;
