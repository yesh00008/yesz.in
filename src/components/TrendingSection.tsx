import { Link } from "react-router-dom";
import { TrendingUp, Clock, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface TrendingSectionProps {
  posts: any[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 150, damping: 15 },
  },
};

const TrendingSection = ({ posts }: TrendingSectionProps) => {
  const trending = posts.filter((p) => p.trending).slice(0, 4);

  if (trending.length === 0) return null;

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
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
          >
            <TrendingUp className="h-4 w-4 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold">Trending Now</h2>
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {trending.map((post, i) => (
            <motion.div key={post.id} variants={item}>
              <Link
                to={`/post/${post.slug}`}
                className="group flex gap-4 items-start p-4 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/[0.03] rounded-bl-full" />
                <span className="text-3xl font-black text-primary/15 group-hover:text-primary/30 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{post.categories?.name || "General"}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.read_time || "5 min"}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingSection;
