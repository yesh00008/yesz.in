import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import PostCard from "@/components/PostCard";

const CategoryDetail = () => {
  const { slug } = useParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [category, setCategory] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [{ data: cat }, { data: cats }] = await Promise.all([
        supabase.from("categories").select("*").eq("slug", slug!).single(),
        supabase.from("categories").select("*").order("name"),
      ]);

      if (cats) setAllCategories(cats);
      if (cat) {
        setCategory(cat);
        const { data: p, count } = await supabase
          .from("posts")
          .select("*, categories(name, slug, icon)", { count: "exact" })
          .eq("published", true)
          .eq("category_id", cat.id)
          .order("created_at", { ascending: false });
        if (p) setPosts(p);
        if (count !== null) setPostCount(count);
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 15, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } } };

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main>
        {/* Hero Banner */}
        <section className="py-16 relative overflow-hidden">
          <div className="container relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                <ArrowLeft className="h-4 w-4" /> All Categories
              </Link>

              {category && (
                <div className="flex items-center gap-5">
                  <span className="text-6xl">{category.icon}</span>
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-black text-primary">{category.name}</h1>
                    <p className="text-muted-foreground mt-2 max-w-lg">{category.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4" /> {postCount} Articles</span>
                      <span className="inline-flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Trending</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <div className="container py-12">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Content */}
            <div className="flex-1">
              {loading ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl overflow-hidden animate-pulse">
                      <div className="aspect-[16/10] bg-secondary" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-secondary rounded w-3/4" />
                        <div className="h-3 bg-secondary rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 gap-6">
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
                          author: "Yeszz Team",
                          slug: post.slug,
                        }}
                        index={i}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 rounded-xl">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-semibold mb-2">No Articles Yet</h3>
                  <p className="text-muted-foreground text-sm">We're working on great content for this category. Check back soon!</p>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="p-5">
                  <h3 className="font-bold text-sm mb-4">Browse Categories</h3>
                  <div className="space-y-1.5">
                    {allCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                          cat.slug === slug
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-sm mb-3">About this Category</h3>
                  {category && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryDetail;
