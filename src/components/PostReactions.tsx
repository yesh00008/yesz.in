import { useState, useEffect } from "react";
import { Heart, Bookmark, BookmarkCheck, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PostReactionsProps {
  postId: string;
  onCommentClick?: () => void;
}

const PostReactions = ({ postId, onCommentClick }: PostReactionsProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [animateLike, setAnimateLike] = useState(false);

  useEffect(() => {
    fetchCounts();
    if (user) fetchUserState();
  }, [postId, user]);

  const fetchCounts = async () => {
    const [{ count: likes }, { count: comments }] = await Promise.all([
      supabase.from("reactions").select("*", { count: "exact", head: true }).eq("post_id", postId).eq("type", "like"),
      supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", postId).eq("approved", true),
    ]);
    setLikeCount(likes || 0);
    setCommentCount(comments || 0);
  };

  const fetchUserState = async () => {
    if (!user) return;
    const [{ data: reaction }, { data: bookmark }] = await Promise.all([
      supabase.from("reactions").select("id").eq("post_id", postId).eq("user_id", user.id).eq("type", "like").maybeSingle(),
      supabase.from("bookmarks").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle(),
    ]);
    setLiked(!!reaction);
    setBookmarked(!!bookmark);
  };

  const toggleLike = async () => {
    if (!user) { toast.error("Sign in to like articles"); return; }
    if (liked) {
      await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("type", "like");
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, type: "like" });
      setLiked(true);
      setLikeCount((c) => c + 1);
      setAnimateLike(true);
      setTimeout(() => setAnimateLike(false), 600);
    }
  };

  const toggleBookmark = async () => {
    if (!user) { toast.error("Sign in to bookmark articles"); return; }
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("post_id", postId).eq("user_id", user.id);
      setBookmarked(false);
      toast.success("Removed from reading list");
    } else {
      await supabase.from("bookmarks").insert({ post_id: postId, user_id: user.id });
      setBookmarked(true);
      toast.success("Added to reading list");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggleLike}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
          liked
            ? "border-destructive/30 bg-destructive/5 text-destructive"
            : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
      >
        <motion.div animate={animateLike ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        </motion.div>
        <span>{likeCount}</span>
      </button>

      <button
        onClick={onCommentClick}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{commentCount}</span>
      </button>

      <button
        onClick={toggleBookmark}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
          bookmarked
            ? "border-primary/30 bg-primary/5 text-primary"
            : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
      >
        {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        <span>{bookmarked ? "Saved" : "Save"}</span>
      </button>
    </div>
  );
};

export default PostReactions;
