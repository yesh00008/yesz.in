import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PostCard from "@/components/PostCard";
import CategoriesSection from "@/components/CategoriesSection";
import TrendingSection from "@/components/TrendingSection";
import PopularThisWeek from "@/components/PopularThisWeek";
import AuthorSpotlight from "@/components/AuthorSpotlight";
import SmartSearch from "@/components/SmartSearch";
import StatsTicker from "@/components/StatsTicker";
import NewsletterBanner from "@/components/NewsletterBanner";
import WriteForUsBanner from "@/components/WriteForUsBanner";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import TrendingTagsCloud from "@/components/TrendingTagsCloud";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

const Index = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);
  const latestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [postsRes, catsRes] = await Promise.all([
        supabase.from("posts").select("*, categories(name, slug, icon)").eq("published", true).order("created_at", { ascending: false }),
        supabase.from("categories").select("*"),
      ]);
      if (postsRes.data) setPosts(postsRes.data);
      if (catsRes.data) setCategories(catsRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearchOpen = useCallback(() => setSearchOpen(true), []);
  const handleSearchClose = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const featured = posts.filter((p) => p.featured);
  const latest = posts.slice(0, visibleCount);
  const hasMore = posts.length > visibleCount;

  const loadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((v) => Math.min(v + 6, posts.length));
      setLoadingMore(false);
    }, 400);
  }, [posts.length]);

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={handleSearchOpen} />
      <SmartSearch open={searchOpen} onClose={handleSearchClose} />

      <main>
        <HeroSection />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <StatsTicker />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <TrendingSection posts={posts} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <CategoriesSection categories={categories} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <PopularThisWeek />
        </motion.div>

        <section id="latest" className="py-16">
          <div className="container">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold mb-8"
            >
              Latest Articles
            </motion.h2>
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                    <div className="aspect-[16/10] bg-secondary" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-secondary rounded w-16" />
                      <div className="h-5 bg-secondary rounded w-3/4" />
                      <div className="h-3 bg-secondary rounded w-full" />
                      <div className="h-3 bg-secondary rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : latest.length > 0 ? (
              <>
                <motion.div
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {latest.map((post, i) => (
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
                          author: "Yeszz Team",
                          slug: post.slug,
                          featured: post.featured,
                        }}
                        index={i}
                        featured={i === 0 && post.featured}
                      />
                    </motion.div>
                  ))}
                </motion.div>
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all disabled:opacity-60"
                    >
                      {loadingMore ? "Loading..." : "Load More Articles"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg mb-2">No articles yet</p>
                <p className="text-sm text-muted-foreground">Articles will appear here once published.</p>
              </div>
            )}
          </div>
        </section>

        {featured.length > 1 && (
          <section className="py-16">
            <div className="container">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-2xl font-bold mb-8"
              >
                Featured
              </motion.h2>
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-6"
              >
                {featured.slice(0, 2).map((post, i) => (
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
                        author: "Yeszz Team",
                        slug: post.slug,
                        featured: true,
                      }}
                      index={i}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <TrendingTagsCloud />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <AuthorSpotlight />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <NewsletterBanner />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <WriteForUsBanner />
        </motion.div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
