import { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Reply, Pin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Comment {
  id: string;
  content: string;
  author_id: string;
  is_pinned: boolean;
  helpful_count: number;
  unhelpful_count: number;
  created_at: string;
  author?: { full_name: string; avatar_url: string };
  replies?: Comment[];
}

interface AdvancedCommentsProps {
  contentId: string;
  contentType: "post" | "paper";
}

const AdvancedComments = ({ contentId, contentType }: AdvancedCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [contentId, contentType]);

  const fetchComments = async () => {
    try {
      const { data } = await supabase
        .from("comment_threads")
        .select("*, author:profiles(full_name, avatar_url)")
        .eq("content_id", contentId)
        .eq("content_type", contentType)
        .eq("is_approved", true)
        .is("parent_comment_id", null)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (data) setComments(data as Comment[]);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      await supabase.from("comment_threads").insert([
        {
          content_id: contentId,
          content_type: contentType,
          author_id: user.id,
          parent_comment_id: replyingTo,
          content: newComment,
          is_approved: true,
        },
      ]);

      setNewComment("");
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleHelpful = async (commentId: string, isHelpful: boolean) => {
    try {
      const { data: comment } = await supabase
        .from("comment_threads")
        .select("helpful_count, unhelpful_count")
        .eq("id", commentId)
        .single();

      if (comment) {
        const update = isHelpful
          ? { helpful_count: comment.helpful_count + 1 }
          : { unhelpful_count: comment.unhelpful_count + 1 };

        await supabase.from("comment_threads").update(update).eq("id", commentId);
        fetchComments();
      }
    } catch (error) {
      console.error("Error updating helpful count:", error);
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? "ml-8 mt-4" : ""} pb-4`}>
      <div className="flex gap-3">
        {comment.author?.avatar_url && (
          <img
            src={comment.author.avatar_url}
            alt={comment.author.full_name}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium">{comment.author?.full_name || "Anonymous"}</p>
            {comment.is_pinned && <Pin className="h-3 w-3 text-primary" />}
            <p className="text-xs text-muted-foreground">
              {new Date(comment.created_at).toLocaleDateString()}
            </p>
          </div>
          <p className="text-sm mb-2">{comment.content}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleHelpful(comment.id, true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ThumbsUp className="h-3 w-3" /> {comment.helpful_count}
            </button>
            <button
              onClick={() => handleHelpful(comment.id, false)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ThumbsDown className="h-3 w-3" /> {comment.unhelpful_count}
            </button>
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Reply className="h-3 w-3" /> Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" /> Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <div className="mb-8 p-4 rounded-lg bg-secondary/50">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyingTo ? "Write a reply..." : "Share your thoughts..."}
            className="w-full bg-background border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
          <div className="flex gap-2 mt-3">
            {replyingTo && (
              <button
                onClick={() => setReplyingTo(null)}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel reply
              </button>
            )}
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-8">
          <a href="/auth" className="text-primary hover:underline">
            Sign in
          </a>
          {" "}to leave a comment
        </p>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No comments yet</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem comment={comment} />
              {comment.replies && comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedComments;
