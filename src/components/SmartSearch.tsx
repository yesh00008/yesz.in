import { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, Clock, Sparkles, GraduationCap, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

// For AI summarization, call a backend endpoint instead of exposing the API key
// Example: POST /api/aero/run with { prompt: string }

interface SmartSearchProps {
  open: boolean;
  onClose: () => void;
}

const SmartSearch = ({ open, onClose }: SmartSearchProps) => {
  const [query, setQuery] = useState("");
  const [postResults, setPostResults] = useState<any[]>([]);
  const [paperResults, setPaperResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<{ [key: string]: string }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setPostResults([]);
      setPaperResults([]);
      setSuggestions([]);
      setAiAnswer("");
      const saved = localStorage.getItem("recentSearches");
      if (saved) setRecent(JSON.parse(saved).slice(0, 5));
      supabase
        .from("posts")
        .select("id, title, slug, image_url, views, categories(name)")
        .eq("published", true)
        .order("views", { ascending: false })
        .limit(4)
        .then(({ data }) => { if (data) setTrending(data); });
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setPostResults([]);
      setPaperResults([]);
      setSuggestions([]);
      setAiAnswer("");
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data: posts } = await supabase
        .from("posts")
        .select("id, title, slug, summary, image_url, read_time, views, categories(name)")
        .eq("published", true)
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
        .order("views", { ascending: false })
        .limit(6);
      if (posts) setPostResults(posts);

      const { data: papers } = await supabase
        .from("research_papers")
        .select("id, title, slug, abstract, cover_image, read_time, views, paper_type, categories(name)")
        .eq("published", true)
        .or(`title.ilike.%${query}%,abstract.ilike.%${query}%,authors_list.ilike.%${query}%`)
        .order("views", { ascending: false })
        .limit(4);
      if (papers) setPaperResults(papers);

      const { data: cats } = await supabase
        .from("categories")
        .select("name")
        .ilike("name", `%${query}%`)
        .limit(3);
      setSuggestions(cats?.map((c) => c.name) || []);
      setLoading(false);

      const allResults = [...(posts || []), ...(papers || [])];
      generateAIAnswer(query, allResults);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const generateAIAnswer = async (q: string, results: any[]) => {
    setAiLoading(true);
    try {
      const context = results.slice(0, 5).map(r =>
        `"${r.title}" - ${r.summary || r.abstract || ""}`
      ).join(". ");
      const prompt = context
        ? `You are a tech blog search assistant. Based on these articles: ${context}. Answer this in exactly 2 short sentences: "${q}"`
        : `You are a tech blog search assistant. Answer this in exactly 2 short sentences: "${q}"`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10s timeout
      
      try {
        const response = await fetch("https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQnBwb09XYXJJUUFvWlRpUVctMUhBNUdnTWlaTE5vcXZIaVJFc1BTc0wtUEpHT19lOTd6SnFfYWprZkZEakFJaFF6OV9xOFZHNGNvLWlURk5PcFNCNHlfVGJFOEE9PQ==", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === "success" && data.text) {
            setAiAnswer(data.text.trim());
          } else {
            setAiAnswer("");
          }
        } else {
          console.error("AI API error:", response.status);
          setAiAnswer("");
        }
      } catch (fetchErr: any) {
        if (fetchErr.name === "AbortError") {
          console.error("AI request timeout");
        } else {
          console.error("AI fetch error:", fetchErr);
        }
        setAiAnswer("");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      setAiAnswer("");
    } finally {
      setAiLoading(false);
    }
  };

  const generateSummary = async (id: string, title: string, content: string | undefined) => {
    setSummarizingId(id);
    try {
      const prompt = `Summarize this ${title.length > 100 ? "article" : "article"} in 2-3 sentences. Focus on key points and conclusions.\n\nTitle: ${title}\n\nContent: ${(content || "").slice(0, 2000)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000); // 30s timeout
      
      try {
        const response = await fetch("https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQnBwb09XYXJJUUFvWlRpUVctMUhBNUdnTWlaTE5vcXZIaVJFc1BTc0wtUEpHT19lOTd6SnFfYWprZkZEakFJaFF6OV9xOFZHNGNvLWlURk5PcFNCNHlfVGJFOEE9PQ==", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === "success" && data.text) {
            setSummaries(prev => ({ ...prev, [id]: data.text.trim() }));
          }
        } else {
          console.error("Summary API error:", response.status);
        }
      } catch (fetchErr: any) {
        if (fetchErr.name === "AbortError") {
          console.error("Summary request timeout");
        } else {
          console.error("Summary fetch error:", fetchErr);
        }
      }
    } catch (error) {
      console.error("Summary generation error:", error);
    } finally {
      setSummarizingId(null);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const saveSearch = (term: string) => {
    const updated = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleResultClick = () => {
    if (query.trim()) saveSearch(query.trim());
    onClose();
  };

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, '<mark class="bg-primary/20 text-primary rounded px-0.5">$1</mark>');
  };

  const totalResults = postResults.length + paperResults.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
        >
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <Search className="h-5 w-5 text-primary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, research papers, categories..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {loading && (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Sparkles className="h-4 w-4 text-primary" />
                </motion.div>
              )}
              <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && query.trim() && (
              <div className="px-4 py-2 border-b border-border flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="max-h-[65vh] overflow-y-auto">
              {query.trim() ? (
                <>
                  {/* AI Answer */}
                  {(aiLoading || aiAnswer) && (
                    <div className="px-4 pt-3 pb-2 border-b border-border">
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-black text-primary-foreground">Y</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">AI Answer</p>
                          {aiLoading ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Thinking...</span>
                            </div>
                          ) : (
                            <p className="text-sm text-foreground leading-relaxed">{aiAnswer}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {totalResults === 0 && !loading ? (
                    <div className="px-4 py-12 text-center">
                      <Search className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">No results for "{query}"</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Try different keywords or browse categories</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {postResults.length > 0 && (
                        <>
                          <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Blog Posts</span>
                          </div>
                          {postResults.map((post) => (
                            <div key={post.id} className="rounded-xl hover:bg-secondary transition-colors">
                              <Link
                                to={`/post/${post.slug}`}
                                onClick={handleResultClick}
                                className="flex items-start gap-3 p-3 group"
                              >
                                {post.image_url && (
                                  <img src={post.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4
                                    className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors"
                                    dangerouslySetInnerHTML={{ __html: highlightMatch(post.title) }}
                                  />
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-primary font-medium">{post.categories?.name || "General"}</span>
                                    <span className="text-[10px] text-muted-foreground">· {post.read_time || "5 min"}</span>
                                    <span className="text-[10px] text-muted-foreground">· {post.views || 0} views</span>
                                  </div>
                                </div>
                              </Link>
                              <button
                                onClick={() => generateSummary(post.id, post.title, post.summary)}
                                disabled={summarizingId === post.id}
                                className="text-[10px] px-3 py-1.5 mx-3 mb-2 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1.5 font-medium"
                              >
                                {summarizingId === post.id ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Summarizing...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3" />
                                    Summarize
                                  </>
                                )}
                              </button>
                              {summaries[post.id] && (
                                <div className="px-3 pb-2 text-xs text-muted-foreground bg-primary/5 rounded-lg mx-3 p-2">
                                  <p className="font-medium text-primary mb-1">Summary:</p>
                                  <p className="leading-relaxed">{summaries[post.id]}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      )}

                      {paperResults.length > 0 && (
                        <>
                          <div className="flex items-center gap-1.5 px-3 pt-3 pb-1">
                            <GraduationCap className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Research Papers</span>
                          </div>
                          {paperResults.map((paper) => (
                            <div key={paper.id} className="rounded-xl hover:bg-secondary transition-colors">
                              <Link
                                to={`/research/${paper.slug}`}
                                onClick={handleResultClick}
                                className="flex items-start gap-3 p-3 group"
                              >
                                {paper.cover_image && (
                                  <img src={paper.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4
                                    className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors"
                                    dangerouslySetInnerHTML={{ __html: highlightMatch(paper.title) }}
                                  />
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                      {paper.paper_type?.replace("-", " ") || "Research"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">{paper.categories?.name}</span>
                                  </div>
                                </div>
                              </Link>
                              <button
                                onClick={() => generateSummary(paper.id, paper.title, paper.abstract)}
                                disabled={summarizingId === paper.id}
                                className="text-[10px] px-3 py-1.5 mx-3 mb-2 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1.5 font-medium"
                              >
                                {summarizingId === paper.id ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Summarizing...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3" />
                                    Summarize
                                  </>
                                )}
                              </button>
                              {summaries[paper.id] && (
                                <div className="px-3 pb-2 text-xs text-muted-foreground bg-primary/5 rounded-lg mx-3 p-2">
                                  <p className="font-medium text-primary mb-1">Summary:</p>
                                  <p className="leading-relaxed">{summaries[paper.id]}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 space-y-6">
                  {recent.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Recent</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recent.map((r) => (
                          <button
                            key={r}
                            onClick={() => setQuery(r)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {trending.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Trending</span>
                      </div>
                      <div className="space-y-1">
                        {trending.map((post, i) => (
                          <Link
                            key={post.id}
                            to={`/post/${post.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-secondary transition-colors group"
                          >
                            <span className="text-lg font-black text-muted-foreground/30 w-6">{i + 1}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold line-clamp-1 group-hover:text-primary transition-colors">{post.title}</p>
                              <p className="text-[10px] text-muted-foreground">{post.categories?.name} · {post.views} views</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>
                <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[9px]">↑↓</kbd> Navigate
                <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[9px] ml-2">↵</kbd> Open
              </span>
              <span>
                <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[9px]">ESC</kbd> Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartSearch;
