import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Calendar, Eye, FileText, Users } from "lucide-react";
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
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

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

      <main className="py-12">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-black text-primary shrink-0">
                {profile.display_name?.[0]?.toUpperCase() || "C"}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black mb-1 text-primary">{profile.display_name || "Creator"}</h1>
                {profile.bio && <p className="text-muted-foreground mb-3">{profile.bio}</p>}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </a>
                  )}
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {followerCount} followers</span>
                  <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {posts.length} articles</span>
                  <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {totalViews.toLocaleString()} views</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
                {userId && <FollowButton authorId={userId} />}
              </div>
            </div>

            {/* Posts */}
            <h2 className="text-xl font-bold mb-6">Published Articles</h2>
            {posts.length > 0 ? (
              <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post, i) => (
                  <motion.div key={post.id} variants={item}>
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
            ) : (
              <div className="text-center py-16 rounded-xl border border-dashed border-border">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No published articles yet</p>
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
