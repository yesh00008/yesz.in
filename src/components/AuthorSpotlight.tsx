import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 150, damping: 15 },
  },
};

const AuthorSpotlight = () => {
  const [authors, setAuthors] = useState<any[]>([]);

  useEffect(() => {
    const fetchAuthors = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, bio")
        .limit(6);

      if (profiles && profiles.length > 0) {
        const authorsWithCounts = await Promise.all(
          profiles.map(async (profile) => {
            const { count } = await supabase
              .from("posts")
              .select("*", { count: "exact", head: true })
              .eq("author_id", profile.user_id)
              .eq("published", true);
            return { ...profile, postCount: count || 0 };
          })
        );
        setAuthors(authorsWithCounts.filter((a) => a.postCount > 0).slice(0, 4));
      }
    };
    fetchAuthors();
  }, []);

  if (authors.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" as const }}
            className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
          >
            <Users className="h-4 w-4 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold">Author Spotlight</h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {authors.map((author) => (
            <motion.div key={author.user_id} variants={item} whileHover={{ y: -6 }}>
              <Link
                to={`/creator/${author.display_name}`}
                className="group block p-6 transition-all duration-300 text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-3 group-hover:bg-primary/20 transition-colors"
                >
                  {author.avatar_url ? (
                    <img src={author.avatar_url} alt={author.display_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    author.display_name?.[0]?.toUpperCase() || "U"
                  )}
                </motion.div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{author.display_name || "Creator"}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{author.bio || "Tech Writer"}</p>
                <div className="mt-3 text-xs font-medium text-primary">{author.postCount} article{author.postCount !== 1 ? "s" : ""}</div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AuthorSpotlight;
