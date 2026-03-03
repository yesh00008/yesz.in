import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap, Calendar, Clock, Eye, Download, Quote, BookOpen,
  ArrowLeft, Building, ExternalLink, Copy, Check, Loader2, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import SocialShareButtons from "@/components/SocialShareButtons";

interface ContentBlock {
  id: string;
  type: string;
  content: string;
  styles?: any;
}

// For AI summarization, call a backend endpoint instead of exposing the API key
// Example: POST /api/ai-summarize with { content: string }

const ResearchPaper = () => {
  const { slug } = useParams();
  const [paper, setPaper] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiSummarizing, setAiSummarizing] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      if (!slug) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("research_papers")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (data) {
        setPaper(data);
        // Increment views
        await supabase.from("research_papers").update({ views: (data.views || 0) + 1 }).eq("id", data.id);

        // Fetch author
        if (data.author_id) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.author_id).single();
          if (profile) setAuthor(profile);
        }

        // Fetch category
        if (data.category_id) {
          const { data: cat } = await supabase.from("categories").select("*").eq("id", data.category_id).single();
          if (cat) setCategory(cat);
        }
      }
      setLoading(false);
    };
    fetchPaper();
  }, [slug]);

  const handleAISummarize = async () => {
    if (!paper) return;
    setShowAiPanel(true);
    setAiSummarizing(true);
    setAiSummary("");
    try {
      let textContent = paper.title + ". " + (paper.abstract || "");
      try {
        const blocks = JSON.parse(paper.content || "[]");
        if (Array.isArray(blocks)) {
          textContent += " " + blocks.map((b: any) => b.content).join(" ");
        }
      } catch { textContent += " " + (paper.content || ""); }
      const prompt = `Summarize this research paper in a concise paragraph (4-6 sentences). Focus on the key findings and implications:\n\n${textContent.slice(0, 3000)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000); // 30s timeout
      
      try {
        const res = await fetch("https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQnBwb09XYXJJUUFvWlRpUVctMUhBNUdnTWlaTE5vcXZIaVJFc1BTc0wtUEpHT19lOTd6SnFfYWprZkZEakFJaFF6OV9xOFZHNGNvLWlURk5PcFNCNHlfVGJFOEE9PQ==", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        const data = await res.json();
        
        if (data.status === "success" && data.text) {
          setAiSummary(data.text.trim());
        } else if (res.status === 429) {
          setAiSummary("Rate limit reached. Please wait a moment and try again.");
        } else {
          setAiSummary(data.error || "Unable to generate summary. Please try again.");
        }
      } catch (fetchErr: any) {
        if (fetchErr.name === "AbortError") {
          console.error("AI request timeout");
          setAiSummary("Request timed out. Please try again.");
        } else {
          console.error("Fetch error:", fetchErr);
          setAiSummary("Network error. Please check your connection and try again.");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setAiSummary("An unexpected error occurred. Please try again."); 
    } finally {
      setAiSummarizing(false);
    }
  };

  const handleCiteCopy = async () => {
    if (!paper) return;
    const citation = `${paper.authors_list || "Unknown"}. "${paper.title}." Yeszz Tech Hub, ${new Date(paper.published_at || paper.created_at).getFullYear()}. ${paper.doi ? `DOI: ${paper.doi}` : ""}`;
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy citation:", err);
    }
  };

  const renderBlock = (block: ContentBlock) => {
    const align = block.styles?.alignment || "left";
    switch (block.type) {
      case "heading":
        return <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100 mt-10 mb-4 leading-tight" style={{ textAlign: align }}>{block.content}</h2>;
      case "heading2":
        return <h3 className="text-xl font-serif font-bold text-gray-800 dark:text-gray-200 mt-8 mb-3 leading-tight" style={{ textAlign: align }}>{block.content}</h3>;
      case "heading3":
        return <h4 className="text-lg font-serif font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2 leading-tight" style={{ textAlign: align }}>{block.content}</h4>;
      case "text":
        return (
          <p className="text-[15px] leading-[2] text-gray-700 dark:text-gray-300 font-serif mb-4 text-justify"
            style={{ textAlign: align as any }}>
            {block.content.split('\n').map((line: string, i: number) => (
              <span key={i}>{line}{i < block.content.split('\n').length - 1 && <br />}</span>
            ))}
          </p>
        );
      case "image":
        return (
          <figure className="my-8 text-center">
            <img src={block.content} alt={block.styles?.caption || paper?.title || "Figure from research paper"} className="rounded-lg shadow-sm mx-auto max-w-full" style={{ width: block.styles?.imageWidth || "100%" }} loading="lazy" />
            {block.styles?.caption && (
              <figcaption className="text-xs text-gray-500 mt-3 italic font-serif">
                <span className="font-semibold not-italic">Figure.</span> {block.styles.caption}
              </figcaption>
            )}
          </figure>
        );
      case "video":
        return (
          <div className="aspect-video rounded-lg overflow-hidden shadow-sm my-8 border border-gray-200 dark:border-zinc-800">
            {(block.content.includes("youtube") || block.content.includes("youtu.be")) ? (
              <iframe width="100%" height="100%" src={block.content.replace("watch?v=", "embed/").split("&")[0]} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full border-0" />
            ) : (
              <iframe width="100%" height="100%" src={block.content.replace("vimeo.com/", "player.vimeo.com/video/")} allowFullScreen className="w-full h-full border-0" />
            )}
          </div>
        );
      case "list":
        return (
          <ul className="list-disc list-outside space-y-1 mb-4 font-serif text-gray-700 dark:text-gray-300 text-[15px] ml-6">
            {block.content.split('\n').filter(Boolean).map((item: string, i: number) => <li key={i}>{item.replace(/^[-•]\s*/, '')}</li>)}
          </ul>
        );
      case "ordered-list":
        return (
          <ol className="list-decimal list-outside space-y-1 mb-4 font-serif text-gray-700 dark:text-gray-300 text-[15px] ml-6">
            {block.content.split('\n').filter(Boolean).map((item: string, i: number) => <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>)}
          </ol>
        );
      case "quote":
        return <blockquote className="border-l-4 border-primary pl-6 py-3 my-6 italic text-gray-600 dark:text-gray-400 font-serif text-base bg-primary/5 dark:bg-primary/10 rounded-r-lg">{block.content}</blockquote>;
      case "code":
        return (
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-5 my-6 overflow-x-auto text-sm font-mono border border-gray-800">
            <code>{block.content}</code>
          </pre>
        );
      case "divider":
        return <hr className="my-10 border-gray-200 dark:border-zinc-700" />;
      case "callout":
        return (
          <div className="rounded-lg border border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 p-5 my-6">
            <p className="text-sm font-serif text-gray-800 dark:text-gray-200">{block.content}</p>
          </div>
        );
      case "abstract":
        return (
          <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-8 my-8 border border-gray-200 dark:border-zinc-700">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Abstract</h3>
            <p className="text-[15px] leading-[2] text-gray-700 dark:text-gray-300 font-serif italic text-justify">{block.content}</p>
          </div>
        );
      case "references":
        return (
          <div className="mt-12 border-t-2 border-gray-200 dark:border-zinc-700 pt-8">
            <h3 className="text-lg font-bold font-serif mb-6 text-gray-900 dark:text-gray-100">References</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 font-serif">
              {block.content.split('\n').filter(Boolean).map((ref: string, i: number) => (
                <p key={i} className="pl-10 -indent-10 leading-relaxed hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                  <span className="font-semibold text-gray-500">[{i + 1}]</span> {ref}
                </p>
              ))}
            </div>
          </div>
        );
      default:
        return <p className="text-gray-700 dark:text-gray-300 font-serif">{block.content}</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onSearchOpen={() => setSearchOpen(true)} />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onSearchOpen={() => setSearchOpen(true)} />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <GraduationCap className="h-16 w-16 text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Paper Not Found</h1>
          <p className="text-muted-foreground mb-6">The research paper you're looking for doesn't exist.</p>
          <Link to="/research-papers" className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all">
            Browse Papers
          </Link>
        </div>
      </div>
    );
  }

  let blocks: ContentBlock[] = [];
  try {
    blocks = JSON.parse(paper.content || "[]");
  } catch {
    blocks = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Paper header — open layout like blog */}
      <div className="container max-w-7xl py-12 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Back link */}
          <Link to="/research-papers" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Research Papers
          </Link>

          {/* Badges */}
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs uppercase tracking-widest font-bold text-primary bg-primary/10 dark:bg-primary/20 rounded-full border border-primary/20">
              <GraduationCap className="h-3.5 w-3.5" />
              {paper.paper_type?.replace("-", " ") || "Research Paper"}
            </span>
            {paper.peer_reviewed && (
              <span className="px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800">
                Peer Reviewed
              </span>
            )}
            {category && (
              <Link to={`/category/${category.slug}`} className="px-3 py-1.5 text-xs uppercase tracking-wider font-semibold bg-secondary text-secondary-foreground rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                {category.name}
              </Link>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-foreground">
            {paper.title}
          </h1>

          {/* Authors & Institution as subtitle */}
          {paper.authors_list && (
            <p className="text-lg sm:text-xl text-muted-foreground mb-2 leading-relaxed font-serif">
              {paper.authors_list}
            </p>
          )}
          {paper.institution && (
            <p className="text-base text-muted-foreground/70 mb-8 flex items-center gap-2">
              <Building className="h-4 w-4" />
              {paper.institution}
            </p>
          )}

          {/* Meta card — matching blog style */}
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 mb-10 shadow-card">
            <div className="flex items-center flex-wrap gap-6">
              {paper.published_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {new Date(paper.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
              )}
              <div className="h-8 w-px bg-border hidden sm:block" />
              {paper.read_time && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{paper.read_time} read</span>
                </div>
              )}
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{paper.views || 0}</span>
                <span className="text-muted-foreground">views</span>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2 text-sm">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{paper.downloads || 0}</span>
                <span className="text-muted-foreground">downloads</span>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2 text-sm">
                <Quote className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{paper.citations || 0}</span>
                <span className="text-muted-foreground">citations</span>
              </div>
              {paper.doi && (
                <>
                  <div className="h-8 w-px bg-border hidden sm:block" />
                  <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-mono">
                    <ExternalLink className="h-4 w-4" />
                    DOI: {paper.doi}
                  </a>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Paper body — full-width like blog */}
      <article className="py-12">
        <div className="container max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* Cover image */}
            {paper.cover_image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="rounded-3xl overflow-hidden mb-12 shadow-lg border border-border mx-auto max-w-2xl"
              >
                <img src={paper.cover_image} alt={paper.title} className="w-full aspect-[16/9] object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              </motion.div>
            )}


            {/* AI Summarize Button */}
            <div className="flex items-center gap-3 mb-6 justify-center">
              <button
                onClick={handleAISummarize}
                disabled={aiSummarizing}
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black">Y</span>
                </div>
                {aiSummarizing ? "Summarizing..." : "AI Summarize"}
                {aiSummarizing && <Loader2 className="h-4 w-4 animate-spin" />}
              </button>
            </div>

            {/* AI Summary Panel */}
            {showAiPanel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-10 relative"
              >
                <button onClick={() => setShowAiPanel(false)} className="absolute top-3 right-3 p-1 rounded-full hover:bg-primary/10 transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-primary-foreground">Y</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">AI Summary</p>
                    {aiSummarizing ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing content...</span>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-foreground">{aiSummary}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Abstract */}
            {paper.abstract && (
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-border shadow-card">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Abstract</h2>
                <p className="text-[15px] leading-[2] text-muted-foreground font-serif italic text-justify">
                  {paper.abstract}
                </p>
              </div>
            )}

            {/* Keywords */}
            {paper.keywords && (
              <div className="mb-10 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">Keywords:</span>
                {paper.keywords.split(",").map((kw: string, i: number) => (
                  <span key={i} className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground font-medium">
                    {kw.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Content blocks — full width, no box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="research-paper-body mb-12"
            >
              {blocks.map((block) => (
                <div key={block.id}>{renderBlock(block)}</div>
              ))}
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-12" />

            {/* Engagement — cite & share inline, like blog post */}
            <div className="flex items-center justify-between gap-6 mb-12 flex-wrap">
              <button
                onClick={handleCiteCopy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Citation Copied!" : "Cite This Paper"}
              </button>
              <SocialShareButtons url={window.location.href} title={paper.title} />
            </div>
          </motion.div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default ResearchPaper;
