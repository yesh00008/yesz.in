import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Flame, Eye, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PopularThisWeek = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    supabase
      .from("posts")
      .select("*, categories(name, slug, icon)")
      .eq("published", true)
      .gte("published_at", weekAgo.toISOString())
      .order("views", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data && data.length > 0) setPosts(data);
        else {
          // Fallback: just get top viewed posts
          supabase
            .from("posts")
            .select("*, categories(name, slug, icon)")
            .eq("published", true)
            .order("views", { ascending: false })
            .limit(5)
            .then(({ data: fallback }) => {
              if (fallback) setPosts(fallback);
            });
        }
      });
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-center gap-2 mb-8">
          <Flame className="h-5 w-5 text-destructive" />
          <h2 className="text-2xl font-bold">Popular This Week</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Hero post */}
          {posts[0] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="row-span-2"
            >
              <Link to={`/post/${posts[0].slug}`} className="group block h-full">
                <div className="h-full rounded-xl transition-all duration-300 overflow-hidden relative">
                  <div className="aspect-[16/10] lg:aspect-auto lg:h-full relative">
                    <img
                      src={posts[0].image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"}
                      alt={posts[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="inline-block rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-semibold text-primary-foreground mb-3">
                        {posts[0].categories?.name || "General"}
                      </span>
                      <h3 className="text-xl font-bold text-white leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {posts[0].title}
                      </h3>
                      <p className="text-sm text-white/70 line-clamp-2 mb-3">{posts[0].summary}</p>
                      <div className="flex items-center gap-3 text-xs text-white/60">
                        <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{posts[0].views} views</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{posts[0].read_time || "5 min"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Stacked list */}
          <div className="space-y-3">
            {posts.slice(1).map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/post/${post.slug}`}
                  className="group flex gap-4 p-4 transition-all duration-300"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={post.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{post.categories?.name || "General"}</span>
                    <h3 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors mt-0.5">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2">
                      <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{post.read_time || "5 min"}</span>
                    </div>
                  </div>
                  <span className="text-3xl font-black text-primary/10 self-center shrink-0">
                    {String(i + 2).padStart(2, "0")}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularThisWeek;
