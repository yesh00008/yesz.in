import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, content, topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "generate":
        systemPrompt = "You are a professional tech blog writer for Yeszz, a technology blog. Write engaging, well-structured blog posts in HTML format with proper headings (h2, h3), paragraphs, code blocks where relevant, and bullet points. Keep the tone informative yet conversational. Don't include the title in your output - start with the content directly.";
        userPrompt = `Write a comprehensive blog post about: ${topic}`;
        break;
      case "improve":
        systemPrompt = "You are a professional editor for a tech blog. Improve the given content by making it more engaging, fixing grammar, improving structure, and enhancing clarity. Return the improved content in HTML format. Maintain the original meaning and key points.";
        userPrompt = `Improve this blog post content:\n\n${content}`;
        break;
      case "summarize":
        systemPrompt = "You are a concise content summarizer. Create a compelling 1-2 sentence summary/excerpt of the given blog post that would work as a preview card description. Return plain text only, no HTML.";
        userPrompt = `Summarize this blog post:\n\n${content}`;
        break;
      case "seo":
        systemPrompt = "You are an SEO expert. Analyze the given blog post and suggest: 1) A meta description (under 160 chars), 2) 5-8 relevant tags/keywords. Return as JSON with keys: metaDescription, tags (array of strings).";
        userPrompt = `Analyze this content for SEO:\n\nTitle: ${topic}\n\nContent: ${content}`;
        break;
      case "outline":
        systemPrompt = "You are a content strategist for a tech blog. Given a topic, generate a detailed blog post outline with sections and key points. Return as HTML with h2 and ul elements.";
        userPrompt = `Create a detailed outline for a blog post about: ${topic}`;
        break;
      default:
        throw new Error("Invalid action");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-writer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
