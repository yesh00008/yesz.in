import { useState, useEffect } from "react";
import { Users, BookOpen, FileText, TrendingUp, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CreatorProfile {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  followers: number;
  published_posts: number;
  published_papers: number;
  is_verified: boolean;
  is_featured: boolean;
}

const SocialProfile = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data: user } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const { data: badges } = await supabase
        .from("creator_badges")
        .select("*")
        .eq("user_id", userId)
        .single();

      const { data: followers } = await supabase
        .from("user_followers")
        .select("*", { count: "exact" })
        .eq("following_id", userId);

      const { data: posts } = await supabase
        .from("posts")
        .select("*", { count: "exact" })
        .eq("author_id", userId)
        .eq("published", true);

      const { data: papers } = await supabase
        .from("research_papers")
        .select("*", { count: "exact" })
        .eq("author_id", userId)
        .eq("published", true);

      if (user) {
        setProfile({
          id: user.id,
          name: user.full_name || "Anonymous",
          bio: user.bio || "No bio yet",
          avatar: user.avatar_url || "",
          followers: followers?.length || 0,
          published_posts: posts?.length || 0,
          published_papers: papers?.length || 0,
          is_verified: badges?.is_verified || false,
          is_featured: badges?.is_featured || false,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    try {
      if (isFollowing) {
        await supabase
          .from("user_followers")
          .delete()
          .eq("following_id", userId);
      } else {
        await supabase
          .from("user_followers")
          .insert([{ following_id: userId }]);
      }
      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (loading || !profile) return <div>Loading...</div>;

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <div className="flex flex-col sm:flex-row gap-8 items-start">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          {profile.avatar && (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary"
            />
          )}
          <div className="text-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {profile.name}
              {profile.is_verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
            </h2>
            {profile.is_featured && (
              <p className="text-xs bg-yellow-500/20 text-yellow-700 px-2 py-1 rounded mt-1">
                Featured Creator
              </p>
            )}
          </div>
          <button
            onClick={toggleFollow}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isFollowing
                ? "bg-secondary text-foreground hover:bg-secondary/80"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>

        {/* Stats Section */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span>Followers</span>
              </div>
              <p className="text-2xl font-bold">{profile.followers.toLocaleString()}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                <span>Posts</span>
              </div>
              <p className="text-2xl font-bold">{profile.published_posts}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <BookOpen className="h-4 w-4" />
                <span>Papers</span>
              </div>
              <p className="text-2xl font-bold">{profile.published_papers}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProfile;
