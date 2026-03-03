// Publish scheduled content
// Runs on a schedule (e.g., every 5 minutes) to publish content that's ready

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const now = new Date().toISOString();

    // Get scheduled content ready to publish
    const { data: scheduled } = await supabase
      .from("scheduled_content")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_publish_at", now);

    if (!scheduled || scheduled.length === 0) {
      return new Response(
        JSON.stringify({ published: 0 }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    let published = 0;

    for (const item of scheduled) {
      const table = item.content_type === "post" ? "posts" : "research_papers";

      // Publish content
      const { error: publishError } = await supabase
        .from(table)
        .update({
          published: true,
          published_at: now,
        })
        .eq("id", item.content_id);

      if (publishError) {
        console.error(
          `Failed to publish ${item.content_type} ${item.content_id}:`,
          publishError
        );
        continue;
      }

      // Update scheduled content status
      const { error: updateError } = await supabase
        .from("scheduled_content")
        .update({ status: "published" })
        .eq("id", item.id);

      if (updateError) {
        console.error(`Failed to update schedule status:`, updateError);
      } else {
        published++;
      }

      // Send notification to author
      await supabase.functions.invoke("send-notifications", {
        body: {
          userId: item.author_id,
          type: item.content_type === "post" ? "post_published" : "paper_published",
          title: `Your ${item.content_type} has been published!`,
          message: "Your scheduled content is now live.",
        },
      });
    }

    return new Response(
      JSON.stringify({ published }),
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
