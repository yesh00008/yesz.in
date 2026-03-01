import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Save, Send, Sparkles, Wand2, FileText, Hash,
  ArrowLeft, Loader2, Plus, Image as ImageIcon, Video, Link, X, Type, Heading2, List
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useAIWriter } from "@/hooks/useAIWriter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import { toast } from "sonner";

interface ContentBlock {
  id: string;
  type: "text" | "heading" | "image" | "video" | "list";
  content: string;
  styles?: {
    fontSize?: string;
    alignment?: "left" | "center" | "right";
    color?: string;
    imageWidth?: string;
    imageHeight?: string;
    imageAlignment?: "left" | "center" | "right";
    caption?: string;
  };
}

const WriteEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { runAI, loading: aiLoading } = useAIWriter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [post, setPost] = useState({
    title: "",
    slug: "",
    summary: "",
    blocks: [] as ContentBlock[],
    image_url: "",
    category_id: "",
    read_time: "5 min",
    meta_description: "",
    meta_keywords: "",
    status: "draft" as string,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    supabase.from("categories").select("*").then(({ data }) => {
      if (data) setCategories(data);
    });

    if (id) {
      supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .eq("author_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            // Parse blocks from content JSON
            try {
              const blocks = JSON.parse(data.content || "[]");
              setPost({
                title: data.title || "",
                slug: data.slug || "",
                summary: data.summary || "",
                blocks: Array.isArray(blocks) ? blocks : [],
                image_url: data.image_url || "",
                category_id: data.category_id || "",
                read_time: data.read_time || "5 min",
                meta_description: data.meta_description || "",
                meta_keywords: data.meta_keywords || "",
                status: data.status || "draft",
              });
            } catch {
              setPost(p => ({ ...p, title: data.title, slug: data.slug }));
            }
          }
        });
    }
  }, [user, id, navigate]);

  const generateSlug = useCallback((title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }, []);

  const handleTitleChange = (title: string) => {
    setPost(p => ({ ...p, title, slug: generateSlug(title) }));
  };

  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: "",
    };
    setPost(p => ({ ...p, blocks: [...p.blocks, newBlock] }));
  };

  const updateBlock = (id: string, content: string) => {
    setPost(p => ({
      ...p,
      blocks: p.blocks.map(b => (b.id === id ? { ...b, content } : b)),
    }));
  };

  const updateBlockStyles = (id: string, styles: ContentBlock["styles"]) => {
    setPost(p => ({
      ...p,
      blocks: p.blocks.map(b => (b.id === id ? { ...b, styles: { ...b.styles, ...styles } } : b)),
    }));
  };

  const deleteBlock = (id: string) => {
    setPost(p => ({ ...p, blocks: p.blocks.filter(b => b.id !== id) }));
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const idx = post.blocks.findIndex(b => b.id === id);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === post.blocks.length - 1)) {
      return;
    }
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    const newBlocks = [...post.blocks];
    [newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]];
    setPost(p => ({ ...p, blocks: newBlocks }));
  };

  const handleImageUpload = async (blockId: string, file: File) => {
    try {
      const fileName = `blog-${Date.now()}-${file.name}`;
      const { error: uploadError, data } = await supabase.storage
        .from("blog-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(fileName);

      updateBlock(blockId, publicUrl);
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error("Failed to upload image: " + err.message);
    }
  };

  const handleSave = async (publish = false) => {
    if (!user) return;
    if (!post.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);

    const payload = {
      title: post.title,
      slug: post.slug || generateSlug(post.title),
      summary: post.summary,
      content: JSON.stringify(post.blocks),
      image_url: post.image_url,
      category_id: post.category_id || null,
      read_time: post.read_time,
      meta_description: post.meta_description,
      meta_keywords: post.meta_keywords,
      author_id: user.id,
      published: publish,
      status: publish ? "published" : post.status,
      ...(publish ? { published_at: new Date().toISOString() } : {}),
    };

    let error;
    if (id) {
      ({ error } = await supabase.from("posts").update(payload).eq("id", id));
    } else {
      ({ error } = await supabase.from("posts").insert(payload));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(publish ? "Published!" : "Draft saved!");
      if (!id) navigate("/creator/dashboard");
    }
    setSaving(false);
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error("Enter a topic first");
      return;
    }
    try {
      const result = await runAI("generate", { topic: aiTopic });
      // Add AI-generated content as text blocks
      const paragraphs = result.split("\n\n").filter(p => p.trim());
      const newBlocks = paragraphs.map((para, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        type: "text" as const,
        content: para,
      }));
      setPost(p => ({ ...p, blocks: [...p.blocks, ...newBlocks] }));
      toast.success("Content generated!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleAISummary = async () => {
    if (post.blocks.length === 0) return;
    try {
      const content = post.blocks.map(b => b.content).join("\n");
      const result = await runAI("summarize", { content });
      setPost(p => ({ ...p, summary: result }));
      toast.success("Summary generated!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="py-10">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/creator/dashboard")}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
                <h1 className="text-3xl font-black">{id ? "Edit Article" : "Write new Article"}</h1>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/80 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || post.blocks.length === 0}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Publish
                </button>
              </div>
            </div>

            {/* Title & Meta */}
            <div className="space-y-6 mb-10">
              <div>
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Article Title"
                  className="w-full bg-transparent text-3xl sm:text-4xl font-black outline-none placeholder-muted-foreground"
                />
              </div>

              <div className="rounded-2xl border border-border bg-card/50 p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Summary</label>
                  <textarea
                    value={post.summary}
                    onChange={(e) => setPost(p => ({ ...p, summary: e.target.value }))}
                    placeholder="Brief summary of your article (SEO description)..."
                    rows={2}
                    className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{post.summary.length}/160</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
                    <select
                      value={post.category_id}
                      onChange={(e) => setPost(p => ({ ...p, category_id: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Featured Image URL</label>
                    <input
                      type="url"
                      value={post.image_url}
                      onChange={(e) => setPost(p => ({ ...p, image_url: e.target.value }))}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Blocks */}
            <div className="mb-10">
              <div className="mb-6">
                <h2 className="text-lg font-black mb-4">Content</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => addBlock("text")}
                    className="flex items-center gap-2 rounded-lg border border-border hover:bg-secondary px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Type className="h-4 w-4" /> Text
                  </button>
                  <button
                    onClick={() => addBlock("heading")}
                    className="flex items-center gap-2 rounded-lg border border-border hover:bg-secondary px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Heading2 className="h-4 w-4" /> Heading
                  </button>
                  <button
                    onClick={() => addBlock("image")}
                    className="flex items-center gap-2 rounded-lg border border-border hover:bg-secondary px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <ImageIcon className="h-4 w-4" /> Image
                  </button>
                  <button
                    onClick={() => addBlock("video")}
                    className="flex items-center gap-2 rounded-lg border border-border hover:bg-secondary px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Video className="h-4 w-4" /> Video
                  </button>
                  <button
                    onClick={() => addBlock("list")}
                    className="flex items-center gap-2 rounded-lg border border-border hover:bg-secondary px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <List className="h-4 w-4" /> List
                  </button>
                </div>
              </div>

              {/* Blocks */}
              <div className="space-y-4">
                {post.blocks.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-12 text-center">
                    <p className="text-muted-foreground mb-4">Start writing by adding content blocks</p>
                    <button
                      onClick={() => addBlock("text")}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
                    >
                      <Plus className="h-4 w-4" /> Add first block
                    </button>
                  </div>
                ) : (
                  post.blocks.map((block, idx) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-border bg-card p-6 space-y-4 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">{block.type}</span>
                        <div className="flex gap-2 transition-opacity">
                          {idx > 0 && (
                            <button
                              onClick={() => moveBlock(block.id, "up")}
                              className="p-1.5 hover:bg-secondary rounded transition-colors text-xs font-semibold hover:text-primary"
                              title="Move up"
                            >
                              ↑
                            </button>
                          )}
                          {idx < post.blocks.length - 1 && (
                            <button
                              onClick={() => moveBlock(block.id, "down")}
                              className="p-1.5 hover:bg-secondary rounded transition-colors text-xs font-semibold hover:text-primary"
                              title="Move down"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
                            title="Delete"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Text Block */}
                      {block.type === "text" && (
                        <div className="space-y-3">
                          <textarea
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, e.target.value)}
                            placeholder="Write your content here... You can add links like [text](url)"
                            rows={4}
                            className="w-full bg-secondary rounded-lg border border-input px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                          />
                          <div className="grid sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Font Size</label>
                              <select
                                value={block.styles?.fontSize || "base"}
                                onChange={(e) => updateBlockStyles(block.id, { fontSize: e.target.value })}
                                className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              >
                                <option value="sm">Small</option>
                                <option value="base">Normal</option>
                                <option value="lg">Large</option>
                                <option value="xl">Extra Large</option>
                                <option value="2xl">2XL</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Alignment</label>
                              <select
                                value={block.styles?.alignment || "left"}
                                onChange={(e) => updateBlockStyles(block.id, { alignment: e.target.value as any })}
                                className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Text Color</label>
                              <input
                                type="color"
                                value={block.styles?.color || "#ffffff"}
                                onChange={(e) => updateBlockStyles(block.id, { color: e.target.value })}
                                className="w-full rounded-lg border border-input h-10 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Heading Block */}
                      {block.type === "heading" && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, e.target.value)}
                            placeholder="Section heading..."
                            className="w-full bg-secondary rounded-lg border border-input px-4 py-3 text-xl font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Font Size</label>
                              <select
                                value={block.styles?.fontSize || "3xl"}
                                onChange={(e) => updateBlockStyles(block.id, { fontSize: e.target.value })}
                                className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              >
                                <option value="2xl">2XL</option>
                                <option value="3xl">3XL</option>
                                <option value="4xl">4XL</option>
                                <option value="5xl">5XL</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Alignment</label>
                              <select
                                value={block.styles?.alignment || "left"}
                                onChange={(e) => updateBlockStyles(block.id, { alignment: e.target.value as any })}
                                className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image Block */}
                      {block.type === "image" && (
                        <div className="space-y-3">
                          {block.content ? (
                            <div className="relative rounded-xl overflow-hidden bg-secondary border-4 border-dashed border-primary/30 group/img hover:border-primary/50 transition-colors">
                              <img
                                src={block.content}
                                alt="Content"
                                style={{ 
                                  width: block.styles?.imageWidth || "100%",
                                  height: block.styles?.imageHeight || "auto",
                                  maxWidth: "100%",
                                  objectFit: "cover"
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleImageUpload(block.id, e.target.files[0]);
                                    }
                                  }}
                                  className="hidden"
                                />
                                <button
                                  onClick={() => fileInputRef.current?.click()}
                                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
                                >
                                  Replace
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleImageUpload(block.id, e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                              />
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center hover:bg-primary/10 hover:border-primary/50 transition-all"
                              >
                                <ImageIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                                <p className="text-sm font-medium">Click to upload image</p>
                                <p className="text-xs text-muted-foreground">or paste URL below</p>
                              </button>
                              <input
                                type="url"
                                placeholder="Or paste image URL..."
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                className="w-full bg-secondary rounded-lg border border-input px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </>
                          )}
                          {block.content && (
                            <div className="grid sm:grid-cols-4 gap-2">
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Width (%)</label>
                                <input
                                  type="range"
                                  min="30"
                                  max="100"
                                  value={parseInt(block.styles?.imageWidth || "100")}
                                  onChange={(e) => updateBlockStyles(block.id, { imageWidth: `${e.target.value}%` })}
                                  className="w-full"
                                />
                                <span className="text-xs text-muted-foreground">{block.styles?.imageWidth || "100%"}</span>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Height (px)</label>
                                <input
                                  type="number"
                                  placeholder="auto"
                                  value={block.styles?.imageHeight ? parseInt(block.styles.imageHeight) : ""}
                                  onChange={(e) => updateBlockStyles(block.id, { imageHeight: e.target.value ? `${e.target.value}px` : undefined })}
                                  className="w-full rounded-lg border border-input bg-secondary px-2 py-1.5 text-xs outline-none focus:border-primary"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Alignment</label>
                                <select
                                  value={block.styles?.imageAlignment || "center"}
                                  onChange={(e) => updateBlockStyles(block.id, { imageAlignment: e.target.value as any })}
                                  className="w-full rounded-lg border border-input bg-secondary px-2 py-1.5 text-xs outline-none focus:border-primary"
                                >
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Caption</label>
                                <input
                                  type="text"
                                  placeholder="Image caption..."
                                  value={block.styles?.caption || ""}
                                  onChange={(e) => updateBlockStyles(block.id, { caption: e.target.value })}
                                  className="w-full rounded-lg border border-input bg-secondary px-2 py-1.5 text-xs outline-none focus:border-primary"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Video Block */}
                      {block.type === "video" && (
                        <div className="space-y-3">
                          <input
                            type="url"
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, e.target.value)}
                            placeholder="YouTube or Vimeo URL (e.g., https://youtube.com/watch?v=...)"
                            className="w-full bg-secondary rounded-lg border border-input px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                          {block.content && (
                            <div className="aspect-video rounded-xl overflow-hidden bg-secondary border-4 border-dashed border-primary/30">
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
                                <div className="w-full h-full flex items-center justify-center">
                                  <p className="text-muted-foreground text-sm">YouTube or Vimeo only</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* List Block */}
                      {block.type === "list" && (
                        <textarea
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          placeholder="Enter list items (one per line)&#10;- Item 1&#10;- Item 2&#10;- Item 3"
                          rows={4}
                          className="w-full bg-secondary rounded-lg border border-input px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono"
                        />
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* SEO Section */}
            <div className="rounded-2xl border border-border bg-card/50 p-6 space-y-4">
              <h3 className="font-bold text-lg">SEO Settings</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Meta Tags (keywords)</label>
                <input
                  type="text"
                  value={post.meta_keywords}
                  onChange={(e) => setPost(p => ({ ...p, meta_keywords: e.target.value }))}
                  placeholder="react, javascript, web development"
                  className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WriteEditor;
