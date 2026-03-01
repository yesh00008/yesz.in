import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  count: number;
}

const TrendingTagsCloud = () => {
  const [tags, setTags] = useState<TagWithCount[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const { data: postTags } = await supabase
        .from("post_tags")
        .select("tag_id, tags(id, name, slug)");

      if (postTags) {
        const countMap = new Map<string, TagWithCount>();
        postTags.forEach((pt: any) => {
          if (pt.tags) {
            const existing = countMap.get(pt.tags.id);
            if (existing) {
              existing.count++;
            } else {
              countMap.set(pt.tags.id, {
                id: pt.tags.id,
                name: pt.tags.name,
                slug: pt.tags.slug,
                count: 1,
              });
            }
          }
        });
        const sorted = Array.from(countMap.values()).sort((a, b) => b.count - a.count).slice(0, 20);
        setTags(sorted);
      }

      // Fallback: if no post_tags, just show all tags
      if (!postTags || postTags.length === 0) {
        const { data: allTags } = await supabase.from("tags").select("*").limit(20);
        if (allTags) {
          setTags(allTags.map((t) => ({ ...t, count: 0 })));
        }
      }
    };
    fetchTags();
  }, []);

  if (tags.length === 0) return null;

  const maxCount = Math.max(...tags.map((t) => t.count), 1);

  const getSize = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return "text-lg font-bold px-4 py-2";
    if (ratio > 0.4) return "text-sm font-semibold px-3 py-1.5";
    return "text-xs font-medium px-2.5 py-1";
  };

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center gap-2 mb-6">
          <Hash className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Trending Topics</h2>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2"
        >
          {tags.map((tag, i) => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={`/tag/${tag.slug}`}
                className={`inline-flex items-center gap-1 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground transition-colors duration-200 ${getSize(tag.count)}`}
              >
                <span>#</span>
                {tag.name}
                {tag.count > 0 && (
                  <span className="ml-1 opacity-60">({tag.count})</span>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingTagsCloud;
