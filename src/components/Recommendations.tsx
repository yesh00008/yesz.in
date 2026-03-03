import { useState, useEffect } from "react";
import { Zap, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface Recommendation {
  id: string;
  recommended_content_id: string;
  content_type: "post" | "paper";
  reason: string;
  score: number;
  title?: string;
  summary?: string;
}

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) fetchRecommendations();
  }, [user]);

  const fetchRecommendations = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("content_recommendations")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_clicked", false)
        .order("score", { ascending: false })
        .limit(5);

      if (data) {
        // Fetch content details for each recommendation
        const enriched = await Promise.all(
          data.map(async (rec) => {
            const table = rec.content_type === "post" ? "posts" : "research_papers";
            const { data: content } = await supabase
              .from(table)
              .select("title, summary, abstract")
              .eq("id", rec.recommended_content_id)
              .single();

            return {
              ...rec,
              title: content?.title,
              summary: content?.summary || content?.abstract,
            };
          })
        );
        setRecommendations(enriched);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const dismissRecommendation = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  };

  const visible = recommendations.filter((r) => !dismissed.has(r.id));

  if (!user || loading || visible.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg">Recommended For You</h3>
      </div>

      <div className="space-y-3">
        {visible.map((rec) => (
          <Link
            key={rec.id}
            to={rec.content_type === "post" ? `/blog/${rec.recommended_content_id}` : `/research/${rec.recommended_content_id}`}
            className="flex gap-3 p-3 rounded-lg bg-background hover:bg-secondary/50 transition-colors group"
          >
            <div className="flex-1">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                {rec.title}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                {rec.summary}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                {rec.content_type === "post" ? "Article" : "Research Paper"} · Relevance: {(rec.score * 100).toFixed(0)}%
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                dismissRecommendation(rec.id);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
