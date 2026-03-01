import { useState, useEffect } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FollowButtonProps {
  authorId: string;
  className?: string;
}

const FollowButton = ({ authorId, className = "" }: FollowButtonProps) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchState();
  }, [authorId, user]);

  const fetchState = async () => {
    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", authorId);
    setFollowerCount(count || 0);

    if (user) {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", authorId)
        .maybeSingle();
      setFollowing(!!data);
    }
  };

  const toggleFollow = async () => {
    if (!user) { toast.error("Sign in to follow creators"); return; }
    if (user.id === authorId) { toast.error("You can't follow yourself"); return; }
    setLoading(true);
    if (following) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", authorId);
      setFollowing(false);
      setFollowerCount((c) => c - 1);
      toast.success("Unfollowed");
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: authorId });
      setFollowing(true);
      setFollowerCount((c) => c + 1);
      toast.success("Following!");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 ${
        following
          ? "border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
          : "bg-primary text-primary-foreground shadow-primary hover:brightness-110"
      } ${className}`}
    >
      {following ? (
        <>
          <UserCheck className="h-4 w-4" /> Following · {followerCount}
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" /> Follow · {followerCount}
        </>
      )}
    </button>
  );
};

export default FollowButton;
