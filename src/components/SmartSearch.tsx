import { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface SmartSearchProps {
  open: boolean;
  onClose: () => void;
}

const SmartSearch = ({ open, onClose }: SmartSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
      setSuggestions([]);
      // Load recent searches from localStorage
      const saved = localStorage.getItem("recentSearches");
      if (saved) setRecent(JSON.parse(saved).slice(0, 5));
      // Load trending posts
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
      setResults([]);
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      // Search posts
      const { data: posts } = await supabase
        .from("posts")
        .select("id, title, slug, summary, image_url, read_time, views, categories(name)")
        .eq("published", true)
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
        .order("views", { ascending: false })
        .limit(8);
      if (posts) setResults(posts);

      // Generate auto-suggestions from categories and tags
      const { data: cats } = await supabase
        .from("categories")
        .select("name")
        .ilike("name", `%${query}%`)
        .limit(3);
      const { data: tags } = await supabase
        .from("tags")
        .select("name")
        .ilike("name", `%${query}%`)
        .limit(3);
      const sugs = [
        ...(cats?.map((c) => c.name) || []),
        ...(tags?.map((t) => `#${t.name}`) || []),
      ];
      setSuggestions(sugs);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
        >
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative w-full max-w-xl rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <Search className="h-5 w-5 text-primary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, categories, tags..."
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

            {/* Auto-suggestions */}
            {suggestions.length > 0 && query.trim() && (
              <div className="px-4 py-2 border-b border-border flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s.replace("#", ""))}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="max-h-[60vh] overflow-y-auto">
              {/* Results */}
              {query.trim() ? (
                results.length === 0 && !loading ? (
                  <div className="px-4 py-12 text-center">
                    <Search className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No results for "{query}"</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try different keywords or browse categories</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {results.map((post) => (
                      <Link
                        key={post.id}
                        to={`/post/${post.slug}`}
                        onClick={handleResultClick}
                        className="flex items-start gap-3 rounded-xl p-3 hover:bg-secondary transition-colors group"
                      >
                        {post.image_url && (
                          <img src={post.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <h4
                            className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors"
                            dangerouslySetInnerHTML={{ __html: highlightMatch(post.title) }}
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-primary font-medium">{post.categories?.name || "General"}</span>
                            <span className="text-[10px] text-muted-foreground">· {post.read_time || "5 min"}</span>
                            <span className="text-[10px] text-muted-foreground">· {post.views || 0} views</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                <div className="p-4 space-y-6">
                  {/* Recent searches */}
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

                  {/* Trending */}
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
