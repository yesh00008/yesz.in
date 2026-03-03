import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Calendar, Eye, FileText, Users, Instagram, Zap, BookOpen, Ticket, TrendingUp, Mail, Briefcase, Settings, Edit2, Twitter, Linkedin, Github, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";

const CreatorProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ 
    display_name: "", 
    bio: "", 
    website: "",
    twitter_url: "",
    linkedin_url: "",
    github_url: "",
    instagram_url: "",
    location: "",
    expertise: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchCreator = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (prof) {
        setProfile(prof);
        setEditFormData({
          display_name: prof.display_name || "",
          bio: prof.bio || "",
          website: prof.website || "",
          twitter_url: prof.twitter_url || "",
          linkedin_url: prof.linkedin_url || "",
          github_url: prof.github_url || "",
          instagram_url: prof.instagram_url || "",
          location: prof.location || "",
          expertise: prof.expertise || "",
        });
        if (prof.avatar_url) {
          setAvatarPreview(prof.avatar_url);
        }
      }

      const { data: creatorPosts } = await supabase
        .from("posts")
        .select("*, categories(name, slug)")
        .eq("author_id", userId!)
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (creatorPosts) setPosts(creatorPosts);

      const { data: researchPapers } = await supabase
        .from("research_papers")
        .select("*")
        .eq("author_id", userId!)
        .not("published_at", "is", null)
        .order("published_at", { ascending: false });
      if (researchPapers) setPapers(researchPapers);

      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId!);
      setFollowerCount(count || 0);

      setLoading(false);
    };
    fetchCreator();
  }, [userId]);

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    
    setUploading(true);
    try {
      let updateData: any = {};
      
      // Only include fields that have values (not empty strings)
      if (editFormData.display_name) updateData.display_name = editFormData.display_name;
      if (editFormData.bio) updateData.bio = editFormData.bio;
      if (editFormData.website) updateData.website = editFormData.website;
      if (editFormData.location) updateData.location = editFormData.location;
      if (editFormData.expertise) updateData.expertise = editFormData.expertise;
      if (editFormData.twitter_url) updateData.twitter_url = editFormData.twitter_url;
      if (editFormData.linkedin_url) updateData.linkedin_url = editFormData.linkedin_url;
      if (editFormData.github_url) updateData.github_url = editFormData.github_url;
      if (editFormData.instagram_url) updateData.instagram_url = editFormData.instagram_url;
      
      // Handle avatar upload
      if (avatarFile) {
        try {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          
          // Check file size (max 5MB)
          if (avatarFile.size > 5 * 1024 * 1024) {
            throw new Error("File size exceeds 5MB limit");
          }
          
          // Remove old avatar if exists
          await supabase.storage
            .from("avatars")
            .list("", { limit: 100 })
            .then(async (res) => {
              if (res.data) {
                const oldFiles = res.data.filter(f => f.name.startsWith(user.id + "-"));
                for (const file of oldFiles) {
                  await supabase.storage.from("avatars").remove([file.name]).catch(() => {});
                }
              }
            })
            .catch(() => {});
          
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, avatarFile, { upsert: true });
          
          if (uploadError) {
            console.error("Avatar upload error:", uploadError);
            throw new Error(`Avatar upload failed: ${uploadError.message}`);
          }
          
          const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
          updateData.avatar_url = data.publicUrl;
        } catch (error) {
          console.error("Avatar handling error:", error);
          // Don't throw - allow profile update even if avatar fails
          console.warn("Avatar upload skipped, profile will update without avatar change");
        }
      }
      
      // Update profile with only the fields that have values
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);
      
      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }
      
      setProfile({ ...profile, ...updateData });
      setAvatarFile(null);
      setShowEditModal(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert(`Failed to update profile: ${error?.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar onSearchOpen={() => setSearchOpen(true)} />
        <div className="container max-w-4xl py-20">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-secondary" />
              <div className="space-y-2">
                <div className="h-6 bg-secondary rounded w-40" />
                <div className="h-4 bg-secondary rounded w-60" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => <div key={i} className="h-48 bg-secondary rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-black text-gradient mb-4">404</div>
          <h1 className="text-2xl font-bold mb-3">Creator Not Found</h1>
          <Link to="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="py-6 md:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Edit Modal */}
          {showEditModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-2xl p-6 max-w-2xl w-full border border-border max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Edit Profile</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center text-3xl font-black text-primary overflow-hidden">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          profile?.display_name?.[0]?.toUpperCase() || "C"
                        )}
                      </div>
                      <div>
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer font-semibold text-sm transition-colors">
                          <Upload className="h-4 w-4" />
                          Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF (Max 5MB)</p>
                      </div>
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Username</label>
                    <input
                      type="text"
                      value={editFormData.display_name}
                      onChange={(e) => setEditFormData({ ...editFormData, display_name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:border-primary"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Bio</label>
                    <textarea
                      value={editFormData.bio}
                      onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:border-primary resize-none"
                      placeholder="Tell about yourself..."
                      rows={3}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Location</label>
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:border-primary"
                      placeholder="City, Country"
                    />
                  </div>

                  {/* Expertise */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Expertise / Skills</label>
                    <textarea
                      value={editFormData.expertise}
                      onChange={(e) => setEditFormData({ ...editFormData, expertise: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:border-primary resize-none"
                      placeholder="e.g., Web Development, AI, Data Science"
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Comma-separated skills and expertise areas</p>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Website</label>
                    <input
                      type="url"
                      value={editFormData.website}
                      onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:border-primary"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Social Links Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Social Links</h3>
                    
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Twitter URL</label>
                      <input
                        type="url"
                        value={editFormData.twitter_url}
                        onChange={(e) => setEditFormData({ ...editFormData, twitter_url: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:border-primary text-sm"
                        placeholder="https://twitter.com/yourhandle"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">LinkedIn URL</label>
                      <input
                        type="url"
                        value={editFormData.linkedin_url}
                        onChange={(e) => setEditFormData({ ...editFormData, linkedin_url: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:border-primary text-sm"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">GitHub URL</label>
                      <input
                        type="url"
                        value={editFormData.github_url}
                        onChange={(e) => setEditFormData({ ...editFormData, github_url: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:border-primary text-sm"
                        placeholder="https://github.com/yourprofile"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Instagram URL</label>
                      <input
                        type="url"
                        value={editFormData.instagram_url}
                        onChange={(e) => setEditFormData({ ...editFormData, instagram_url: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:border-primary text-sm"
                        placeholder="https://instagram.com/yourhandle"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-border">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setAvatarFile(null);
                        setAvatarPreview(profile?.avatar_url || "");
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={uploading}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                    >
                      {uploading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-primary/10 flex items-center justify-center text-5xl font-black text-primary shrink-0 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.display_name?.[0]?.toUpperCase() || "C"
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground">{profile?.display_name || "Creator"}</h1>
                    {profile?.bio && <p className="text-sm sm:text-base text-muted-foreground mt-1">{profile.bio}</p>}
                    
                    {/* Location & Expertise */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {profile?.location && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          📍 {profile.location}
                        </span>
                      )}
                      {profile?.expertise && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-xs font-semibold text-foreground">
                          ✨ Expert in: {profile.expertise}
                        </span>
                      )}
                    </div>
                  </div>
                  {isOwnProfile && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowEditModal(true)}
                      className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors flex items-center gap-2 text-sm"
                    >
                      <Settings className="h-4 w-4" /> Edit
                    </motion.button>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                    <div className="text-lg font-black text-primary">{followerCount}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                    <div className="text-lg font-black text-primary">{posts.length}</div>
                    <div className="text-xs text-muted-foreground">Articles</div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                    <div className="text-lg font-black text-primary">{papers.length}</div>
                    <div className="text-xs text-muted-foreground">Papers</div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                    <div className="text-lg font-black text-primary">{totalViews.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {!isOwnProfile && userId && <FollowButton authorId={userId} />}
                  {profile?.website && (
                    <motion.a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-primary/5 font-semibold text-sm transition-all"
                    >
                      <Globe className="h-4 w-4" /> Website
                    </motion.a>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Connect:</span>
              
              {profile?.twitter_url && (
                <motion.a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  title="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </motion.a>
              )}
              
              {profile?.linkedin_url && (
                <motion.a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </motion.a>
              )}
              
              {profile?.github_url && (
                <motion.a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  title="GitHub"
                >
                  <Github className="h-4 w-4" />
                </motion.a>
              )}
              
              {profile?.instagram_url && (
                <motion.a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  title="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </motion.a>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />
          </motion.div>

          {/* Articles Section */}
          {posts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                Articles ({posts.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.slice(0, 6).map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <PostCard
                      post={{
                        id: post.id,
                        title: post.title,
                        summary: post.summary || "",
                        category: post.categories?.name || "General",
                        image: post.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
                        date: new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                        readTime: post.read_time || "5 min",
                        author: profile?.display_name || "Creator",
                        slug: post.slug,
                      }}
                      index={i}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Research Papers Section */}
          {papers.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                Research Papers ({papers.length})
              </h2>
              <div className="grid gap-4">
                {papers.slice(0, 6).map((paper, i) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/paper/${paper.id}`}
                      className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border hover:border-primary/30 bg-card hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors mb-2">{paper.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">{paper.abstract}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>{paper.institution}</span>
                          {paper.published_at && (
                            <span>{new Date(paper.published_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <motion.button whileHover={{ x: 4 }} className="text-primary font-semibold text-sm">
                          View →
                        </motion.button>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {posts.length === 0 && papers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 sm:py-20 rounded-2xl border-2 border-dashed border-border"
            >
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">No Content Yet</h3>
              <p className="text-muted-foreground">This creator hasn't published any articles or papers yet</p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatorProfile;
