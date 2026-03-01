import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import PostCard from "@/components/PostCard";

const TagPage = () => {
  const { slug } = useParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [tag, setTag] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTag = async () => {
      setLoading(true);
      const { data: tagData } = await supabase.from("tags").select("*").eq("slug", slug!).single();
      if (tagData) {
        setTag(tagData);
        const { data: postTags } = await supabase
          .from("post_tags")
          .select("post_id")
          .eq("tag_id", tagData.id);
        if (postTags && postTags.length > 0) {
          const postIds = postTags.map((pt) => pt.post_id);
          const { data: postsData } = await supabase
            .from("posts")
            .select("*, categories(name, slug, icon)")
            .eq("published", true)
            .in("id", postIds)
            .order("created_at", { ascending: false });
          if (postsData) setPosts(postsData);
        }
      }
      setLoading(false);
    };
    fetchTag();
  }, [slug]);

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <Tag className="h-7 w-7 text-primary" />
              <h1 className="text-4xl font-black">#{tag?.name || slug}</h1>
            </div>
            <p className="text-muted-foreground mb-10">{posts.length} article{posts.length !== 1 ? "s" : ""} tagged</p>
          </motion.div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-secondary" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-secondary rounded w-16" />
                    <div className="h-5 bg-secondary rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={{
                    id: post.id,
                    title: post.title,
                    summary: post.summary || "",
                    category: post.categories?.name || "General",
                    image: post.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
                    date: new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    readTime: post.read_time || "5 min",
                    author: "Yeszz Team",
                    slug: post.slug,
                  }}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium mb-2">No articles with this tag yet</p>
              <Link to="/" className="text-primary text-sm hover:underline">Browse all articles</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TagPage;
