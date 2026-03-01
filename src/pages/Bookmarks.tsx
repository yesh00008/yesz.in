import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bookmark, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import PostCard from "@/components/PostCard";

const Bookmarks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchBookmarks();
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("bookmarks")
      .select("*, posts(*, categories(name, slug, icon))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setBookmarks(data);
    setLoading(false);
  };

  const removeBookmark = async (bookmarkId: string) => {
    await supabase.from("bookmarks").delete().eq("id", bookmarkId);
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <Bookmark className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-black">Reading List</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl">
              Your saved articles for later reading.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-secondary" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-secondary rounded w-16" />
                    <div className="h-5 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : bookmarks.length > 0 ? (
            <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((bm) => {
                const post = bm.posts;
                if (!post) return null;
                return (
                  <motion.div key={bm.id} variants={item} className="relative group">
                    <PostCard
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
                      index={0}
                    />
                    <button
                      onClick={() => removeBookmark(bm.id)}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-card/90 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Remove bookmark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium mb-2">No saved articles yet</p>
              <p className="text-sm text-muted-foreground mb-6">Bookmark articles to save them for later reading.</p>
              <Link to="/" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all">
                Browse Articles
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bookmarks;
