import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Eye, Share2, MessageCircle, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import ReadingProgress from "@/components/ReadingProgress";
import BackToTop from "@/components/BackToTop";
import PostCard from "@/components/PostCard";
import PostReactions from "@/components/PostReactions";
import CommentsSection from "@/components/CommentsSection";
import SocialShareButtons from "@/components/SocialShareButtons";
import ReadingTimeEstimator from "@/components/ReadingTimeEstimator";

interface ContentBlock {
  id: string;
  type: "text" | "heading" | "heading2" | "heading3" | "image" | "video" | "list" | "ordered-list" | "quote" | "code" | "divider" | "callout" | "abstract" | "references" | "image-grid" | "table";
  content: string;
  styles?: {
    fontSize?: string;
    alignment?: "left" | "center" | "right";
    color?: string;
    bgColor?: string;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    imageWidth?: string;
    imageHeight?: string;
    imageAlignment?: "left" | "center" | "right";
    caption?: string;
    gridColumns?: number;
    gridImages?: string[];
    gridCaptions?: string[];
    tableRows?: number;
    tableCols?: number;
    tableHeaders?: string[];
    tableData?: string[][];
  };
}

const BlogPost = () => {
  const { slug } = useParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("posts")
        .select("*, categories(name, slug, icon)")
        .eq("slug", slug!)
        .eq("published", true)
        .single();

      if (data) {
        setPost(data);
        // Increment views
        supabase.from("posts").update({ views: (data.views || 0) + 1 }).eq("id", data.id).then();
        const { data: rel } = await supabase
          .from("posts")
          .select("*, categories(name, slug, icon)")
          .eq("published", true)
          .eq("category_id", data.category_id)
          .neq("id", data.id)
          .limit(3);
        if (rel) setRelated(rel);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  const categoryColors: Record<string, string> = {
    AI: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
    Cybersecurity: "bg-red-500/10 text-red-600 border border-red-500/20",
    Gadgets: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    Programming: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    Startups: "bg-violet-500/10 text-violet-600 border border-violet-500/20",
    Reviews: "bg-pink-500/10 text-pink-600 border border-pink-500/20",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
        <Navbar onSearchOpen={() => setSearchOpen(true)} />
        <div className="container max-w-4xl py-20">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-secondary rounded w-20" />
            <div className="h-12 bg-secondary rounded-xl w-3/4" />
            <div className="h-6 bg-secondary rounded w-1/2 mt-6" />
            <div className="h-80 bg-secondary rounded-2xl mt-12" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-6xl font-black text-gradient mb-4">404</div>
          <h1 className="text-2xl font-bold mb-3">Post Not Found</h1>
          <Link to="/" className="text-primary hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  const catName = post.categories?.name || "General";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <ReadingProgress />
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <article className="py-12">
        <div className="container max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Back Button */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>

            {/* Category Badge */}
            <div className="mb-6">
              <span className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${categoryColors[catName] || "bg-secondary text-secondary-foreground"}`}>
                {catName}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-foreground">
              {post.title}
            </h1>

            {/* Summary */}
            {post.summary && (
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
                {post.summary}
              </p>
            )}

            {/* AI Summarize Button */}
            <div className="flex items-center gap-3 mb-6">
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



            {/* Post Meta Card */}
            <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 mb-10 shadow-card">
              <div className="flex items-center flex-wrap gap-6">
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-sm font-bold text-primary-foreground">
                    Y
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Yeszz Team</p>
                    <p className="text-xs text-muted-foreground">Author</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-border hidden sm:block" />

                {/* Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-border hidden sm:block" />

                {/* Reading Time */}
                {post.content && (
                  <ReadingTimeEstimator content={post.content} />
                )}

                {/* Divider */}
                <div className="h-8 w-px bg-border hidden sm:block" />

                {/* Views */}
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{post.views || 0}</span>
                  <span className="text-muted-foreground">views</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {post.image_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="rounded-3xl overflow-hidden mb-12 shadow-lg border border-border mx-auto max-w-2xl"
              >
                <img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="w-full aspect-[16/9] object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy" 
                />
              </motion.div>
            )}

            {/* Content */}
            {post.content && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-12"
              >
                {(() => {
                  // Try to parse as JSON blocks
                  try {
                    const blocks = JSON.parse(post.content) as ContentBlock[];
                    if (Array.isArray(blocks) && blocks.length > 0 && blocks[0].type) {
                      // It's block-based content
                      return (
                        <div className="space-y-6">
                          {blocks.map((block) => (
                            <motion.div
                              key={block.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              {/* Text Block */}
                              {block.type === "text" && (
                                <p 
                                  className={`leading-relaxed text-muted-foreground transition-all`}
                                  style={{
                                    fontSize: block.styles?.fontSize === "sm" ? "0.875rem" 
                                      : block.styles?.fontSize === "lg" ? "1.125rem"
                                      : block.styles?.fontSize === "xl" ? "1.25rem"
                                      : block.styles?.fontSize === "2xl" ? "1.5rem"
                                      : "1rem",
                                    textAlign: block.styles?.alignment || "left",
                                    color: block.styles?.color || undefined,
                                    backgroundColor: block.styles?.bgColor || undefined,
                                    fontFamily: block.styles?.fontFamily || undefined,
                                    fontWeight: block.styles?.bold ? "bold" : undefined,
                                    fontStyle: block.styles?.italic ? "italic" : undefined,
                                    textDecoration: block.styles?.underline ? "underline" : undefined,
                                    padding: block.styles?.bgColor ? "0.5rem 0.75rem" : undefined,
                                    borderRadius: block.styles?.bgColor ? "0.5rem" : undefined,
                                  }}
                                >
                                  {block.content.split('\n').map((line, i) => (
                                    <span key={i}>
                                      {line}
                                      {i < block.content.split('\n').length - 1 && <br />}
                                    </span>
                                  ))}
                                </p>
                              )}

                              {/* Heading Block */}
                              {block.type === "heading" && (
                                <h2 
                                  className="font-black text-foreground mb-4"
                                  style={{
                                    fontSize: block.styles?.fontSize === "2xl" ? "1.5rem"
                                      : block.styles?.fontSize === "3xl" ? "1.875rem"
                                      : block.styles?.fontSize === "4xl" ? "2.25rem"
                                      : block.styles?.fontSize === "5xl" ? "3rem"
                                      : "1.875rem",
                                    textAlign: block.styles?.alignment || "left",
                                  }}
                                >
                                  {block.content}
                                </h2>
                              )}

                              {/* Heading2 Block */}
                              {block.type === "heading2" && (
                                <h3 className="text-xl font-bold text-foreground mb-3 mt-8" style={{ textAlign: block.styles?.alignment || "left" }}>
                                  {block.content}
                                </h3>
                              )}

                              {/* Heading3 Block */}
                              {block.type === "heading3" && (
                                <h4 className="text-lg font-semibold text-foreground mb-2 mt-6" style={{ textAlign: block.styles?.alignment || "left" }}>
                                  {block.content}
                                </h4>
                              )}

                              {/* Image Block */}
                              {block.type === "image" && (
                                <div 
                                  className="my-6"
                                  style={{
                                    display: "flex",
                                    justifyContent: block.styles?.imageAlignment === "left" ? "flex-start" 
                                      : block.styles?.imageAlignment === "right" ? "flex-end" 
                                      : "center",
                                  }}
                                >
                                  <div>
                                    <img
                                      src={block.content}
                                      alt={block.styles?.caption || "Content"}
                                      style={{
                                        width: block.styles?.imageWidth || "100%",
                                        height: block.styles?.imageHeight || "auto",
                                        maxWidth: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                        borderRadius: "0.75rem",
                                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                      }}
                                      className="hover:scale-105 transition-transform duration-500"
                                      loading="lazy"
                                    />
                                    {block.styles?.caption && (
                                      <p className="text-sm text-muted-foreground mt-3 italic">
                                        {block.styles.caption}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Video Block */}
                              {block.type === "video" && (
                                <div className="aspect-video rounded-2xl overflow-hidden shadow-lg border border-border my-6">
                                  {block.content.includes("youtube") || block.content.includes("youtu.be") ? (
                                    <iframe
                                      width="100%"
                                      height="100%"
                                      src={block.content.replace("watch?v=", "embed/").split("&")[0]}
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      className="w-full h-full"
                                    />
                                  ) : block.content.includes("vimeo") ? (
                                    <iframe
                                      width="100%"
                                      height="100%"
                                      src={block.content.replace("vimeo.com/", "player.vimeo.com/video/")}
                                      frameBorder="0"
                                      allow="autoplay; fullscreen; picture-in-picture"
                                      allowFullScreen
                                      className="w-full h-full"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                                      <p className="text-muted-foreground">Invalid video URL</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* List Block */}
                              {block.type === "list" && (
                                <ul className="space-y-2 text-lg text-muted-foreground">
                                  {block.content.split('\n').map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                      <span className="text-primary font-bold">•</span>
                                      <span>{item.replace(/^[-•]\s*/, '')}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {/* Ordered List Block */}
                              {block.type === "ordered-list" && (
                                <ol className="space-y-2 text-lg text-muted-foreground list-decimal list-inside">
                                  {block.content.split('\n').filter(Boolean).map((item, i) => (
                                    <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>
                                  ))}
                                </ol>
                              )}

                              {/* Quote Block */}
                              {block.type === "quote" && (
                                <blockquote className="border-l-4 border-primary pl-6 py-3 my-6 italic text-muted-foreground bg-primary/5 rounded-r-lg text-lg">
                                  {block.content}
                                </blockquote>
                              )}

                              {/* Code Block */}
                              {block.type === "code" && (
                                <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 my-6 overflow-x-auto text-sm font-mono border border-gray-800">
                                  <code>{block.content}</code>
                                </pre>
                              )}

                              {/* Divider Block */}
                              {block.type === "divider" && (
                                <hr className="my-10 border-border" />
                              )}

                              {/* Callout Block */}
                              {block.type === "callout" && (
                                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 my-6">
                                  <p className="text-sm text-foreground">{block.content}</p>
                                </div>
                              )}

                              {/* Abstract Block */}
                              {block.type === "abstract" && (
                                <div className="bg-card/50 rounded-xl p-6 my-6 border border-border">
                                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Abstract</h3>
                                  <p className="text-sm leading-relaxed text-muted-foreground italic">{block.content}</p>
                                </div>
                              )}

                              {/* References Block */}
                              {block.type === "references" && (
                                <div className="mt-10 border-t border-border pt-6">
                                  <h3 className="text-lg font-bold mb-4 text-foreground">References</h3>
                                  <div className="space-y-2 text-sm text-muted-foreground">
                                    {block.content.split('\n').filter(Boolean).map((ref, i) => (
                                      <p key={i} className="pl-8 -indent-8"><span className="font-semibold">[{i + 1}]</span> {ref}</p>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Image Grid Block */}
                              {block.type === "image-grid" && block.styles?.gridImages && (
                                <div className={`grid gap-4 my-6`} style={{ gridTemplateColumns: `repeat(${block.styles?.gridColumns || 2}, 1fr)` }}>
                                  {block.styles.gridImages.filter(Boolean).map((img, i) => (
                                    <div key={i}>
                                      <img src={img} alt={block.styles?.gridCaptions?.[i] || ""} className="w-full rounded-xl object-cover aspect-square hover:scale-105 transition-transform duration-300" loading="lazy" />
                                      {block.styles?.gridCaptions?.[i] && (
                                        <p className="text-xs text-muted-foreground mt-2 text-center italic">{block.styles.gridCaptions[i]}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Table Block */}
                              {block.type === "table" && block.styles?.tableData && (
                                <div className="overflow-x-auto my-6 rounded-xl border border-border">
                                  <table className="w-full text-sm">
                                    {block.styles?.tableHeaders && (
                                      <thead className="bg-secondary">
                                        <tr>
                                          {block.styles.tableHeaders.map((h, i) => (
                                            <th key={i} className="px-4 py-3 text-left font-semibold text-foreground border-b border-border">{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                    )}
                                    <tbody>
                                      {block.styles.tableData.map((row, ri) => (
                                        <tr key={ri} className="border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors">
                                          {row.map((cell, ci) => (
                                            <td key={ci} className="px-4 py-3 text-muted-foreground">{cell}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      );
                    }
                  } catch (e) {
                    // Not valid JSON, treat as HTML
                  }

                  // Fallback to HTML rendering for legacy content
                  return (
                    <div
                      className="prose prose-invert max-w-none prose-custom prose-headings:font-black prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:bg-secondary prose-code:text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-secondary prose-pre:border prose-pre:border-border leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  );
                })()}
              </motion.div>
            )}

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-12" />

            {/* Engagement Section */}
            <div className="flex items-center justify-between gap-6 mb-12 flex-wrap">
              <PostReactions
                postId={post.id}
                onCommentClick={() => document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth" })}
              />
              <SocialShareButtons url={window.location.href} title={post.title} />
            </div>

            {/* Comments Section */}
            <div id="comments-section">
              <CommentsSection postId={post.id} />
            </div>
          </motion.div>
        </div>
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="py-20 border-t border-border">
          <div className="container max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-3xl sm:text-4xl font-black mb-3">Related Articles</h2>
              <p className="text-muted-foreground mb-10">Explore more from <span className="text-primary font-semibold">{catName}</span></p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <PostCard
                      post={{
                        id: p.id,
                        title: p.title,
                        summary: p.summary || "",
                        category: p.categories?.name || "General",
                        image: p.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
                        date: new Date(p.published_at || p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                        readTime: p.read_time || "5 min",
                        author: "Yeszz Team",
                        slug: p.slug,
                      }}
                      index={i}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
      <BackToTop />
    </div>
  );
};

export default BlogPost;
