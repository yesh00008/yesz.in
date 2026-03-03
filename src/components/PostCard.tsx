import { Link } from "react-router-dom";
import { Clock, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { memo } from "react";

export interface PostCardData {
  id: string;
  title: string;
  summary: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
  author: string;
  slug: string;
  featured?: boolean;
}

const categoryColors: Record<string, string> = {
  AI: "bg-primary/10 text-primary",
  Cybersecurity: "bg-destructive/10 text-destructive",
  Gadgets: "bg-emerald-500/10 text-emerald-600",
  Programming: "bg-amber-500/10 text-amber-600",
  Startups: "bg-violet-500/10 text-violet-600",
  Reviews: "bg-pink-500/10 text-pink-600",
};

interface PostCardProps {
  post: PostCardData;
  index?: number;
  featured?: boolean;
}

const PostCard = ({ post, index = 0, featured = false }: PostCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        type: "spring" as const,
        stiffness: 150,
        damping: 15,
      }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      className={`group ${featured ? "md:col-span-2 md:row-span-2" : ""}`}
    >
      <Link to={`/post/${post.slug}`} className="block h-full">
        <div className="h-full rounded-xl transition-all duration-300 overflow-hidden">
          <div className={`relative overflow-hidden ${featured ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-3 left-3">
              <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${categoryColors[post.category] || "bg-secondary text-secondary-foreground"}`}>
                {post.category}
              </span>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
              <div className="w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
          <div className="p-5">
            <h3 className={`font-bold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2 ${featured ? "text-xl md:text-2xl" : "text-base"}`}>
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {post.summary}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{post.date}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default memo(PostCard, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.index === nextProps.index &&
    prevProps.featured === nextProps.featured
  );
});
