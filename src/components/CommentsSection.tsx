import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .eq("approved", true)
      .order("created_at", { ascending: true });
    if (data) {
      setComments(data);
      // Fetch profiles for commenters
      const userIds = [...new Set(data.map((c) => c.user_id))];
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);
        if (profs) {
          const map: Record<string, any> = {};
          profs.forEach((p) => (map[p.user_id] = p));
          setProfiles(map);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to comment"); return; }
    if (!newComment.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      content: newComment.trim(),
    });
    if (error) {
      toast.error("Failed to post comment");
    } else {
      toast.success("Comment posted!");
      setNewComment("");
      fetchComments();
    }
    setLoading(false);
  };

  return (
    <section id="comments" className="py-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold">Comments ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 mt-1">
              {profiles[user.id]?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full rounded-xl border border-input bg-secondary px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-xl border border-border bg-secondary/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <a href="/auth" className="text-primary font-semibold hover:underline">Sign in</a> to join the discussion.
          </p>
        </div>
      )}

      {/* Comments List */}
      <AnimatePresence>
        <div className="space-y-4">
          {comments.map((comment) => {
            const profile = profiles[comment.user_id];
            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {profile?.display_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold">{profile?.display_name || "User"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {comments.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </section>
  );
};

export default CommentsSection;
