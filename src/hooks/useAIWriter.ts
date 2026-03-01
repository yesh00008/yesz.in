import { useState } from "react";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-writer`;

type AIAction = "generate" | "improve" | "summarize" | "seo" | "outline";

export const useAIWriter = () => {
  const [loading, setLoading] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");

  const runAI = async (action: AIAction, options: { content?: string; topic?: string }) => {
    setLoading(true);
    setStreamedContent("");
    let result = "";

    try {
      const resp = await fetch(AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action, ...options }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "AI request failed" }));
        throw new Error(err.error || "AI request failed");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              result += content;
              setStreamedContent(result);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      throw e;
    } finally {
      setLoading(false);
    }

    return result;
  };

  return { runAI, loading, streamedContent };
};
