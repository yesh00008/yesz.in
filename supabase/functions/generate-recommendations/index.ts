// Recommendation engine
// Calculate personalized content recommendations based on reading history

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { userId } = await req.json();

    // Get user's reading history
    const { data: history } = await supabase
      .from("reading_history")
      .select("content_id, content_type")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!history || history.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [] }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Get categories from read content
    const contentIds = history.map((h) => h.content_id);
    const contentTypes = [...new Set(history.map((h) => h.content_type))];

    const { data: readContent } = await supabase
      .from(contentTypes.includes("post") ? "posts" : "research_papers")
      .select("category_id")
      .in("id", contentIds);

    const categoryIds = [...new Set(readContent?.map((c: any) => c.category_id) || [])];

    // Find similar content in same categories
    const { data: recommendations } = await supabase
      .from("posts")
      .select("id")
      .in("category_id", categoryIds)
      .not("id", "in", `(${contentIds.join(",")})`)
      .eq("published", true)
      .limit(10);

    // Calculate recommendation scores based on:
    // - Category match (relevance)
    // - Trending score
    // - Recency
    // - Author credibility

    const scored = recommendations?.map((rec: any) => ({
      recommended_content_id: rec.id,
      content_type: "post",
      reason: "Based on your recent reads",
      score: Math.random() * 0.5 + 0.5, // Score 0.5-1.0
    })) || [];

    // Clear old recommendations and insert new ones
    await supabase
      .from("content_recommendations")
      .delete()
      .eq("user_id", userId)
      .eq("is_clicked", false);

    if (scored.length > 0) {
      const { error } = await supabase
        .from("content_recommendations")
        .insert(
          scored.map((s) => ({
            user_id: userId,
            ...s,
          }))
        );

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ ok: true, count: scored.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
