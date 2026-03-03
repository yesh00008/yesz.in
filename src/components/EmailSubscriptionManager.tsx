import { useState, useEffect } from "react";
import { Mail, Bell, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionPreferences {
  newsletter: boolean;
  new_posts: boolean;
  new_papers: boolean;
  author_updates: boolean;
  frequency: "daily" | "weekly" | "monthly" | "never";
  category_digests: string[];
}

const EmailSubscriptionManager = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<SubscriptionPreferences>({
    newsletter: true,
    new_posts: true,
    new_papers: true,
    author_updates: false,
    frequency: "weekly",
    category_digests: [],
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const categories = [
    "AI", "Cybersecurity", "Programming", "Cloud Computing", "DevOps",
    "Mobile", "Gaming", "Startups", "Gadgets", "Blockchain"
  ];

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("email_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setPrefs({
          newsletter: data.newsletter,
          new_posts: data.new_posts,
          new_papers: data.new_papers,
          author_updates: data.author_updates,
          frequency: data.frequency,
          category_digests: data.category_digests || [],
        });
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    try {
      await supabase.from("email_subscriptions").upsert(
        {
          user_id: user.id,
          email: user.email,
          ...prefs,
        },
        { onConflict: "user_id" }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const toggleCategory = (cat: string) => {
    setPrefs((prev) => ({
      ...prev,
      category_digests: prev.category_digests.includes(cat)
        ? prev.category_digests.filter((c) => c !== cat)
        : [...prev.category_digests, cat],
    }));
  };

  if (!user || loading) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Mail className="h-5 w-5" /> Email Preferences
      </h2>

      <div className="space-y-6">
        {/* Main Subscriptions */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.newsletter}
              onChange={(e) => setPrefs((prev) => ({ ...prev, newsletter: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">Subscribe to newsletter</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.new_posts}
              onChange={(e) => setPrefs((prev) => ({ ...prev, new_posts: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">New blog posts</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.new_papers}
              onChange={(e) => setPrefs((prev) => ({ ...prev, new_papers: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">New research papers</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.author_updates}
              onChange={(e) => setPrefs((prev) => ({ ...prev, author_updates: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">Updates from creators I follow</span>
          </label>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4" /> Email Frequency
          </label>
          <select
            value={prefs.frequency}
            onChange={(e) => setPrefs((prev) => ({ ...prev, frequency: e.target.value as any }))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="never">Never</option>
          </select>
        </div>

        {/* Category Digests */}
        <div>
          <p className="text-sm font-medium mb-3">Category Digests</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.category_digests.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={savePreferences}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
          >
            <Save className="h-4 w-4" />
            {saved ? "Saved!" : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSubscriptionManager;
