import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Send, FileText, Hash,
  ArrowLeft, Loader2, Plus, Image as ImageIcon, Video, Link as LinkIcon, X, Type, Heading1, Heading2,
  List, ListOrdered, Quote, Code, Minus, AlignLeft, AlignCenter, AlignRight,
  Eye, Settings, ChevronDown, BookOpen, GraduationCap, Grid, Table, Palette, Bold, Italic, Underline
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import { toast } from "sonner";

interface ContentBlock {
  id: string;
  type: "text" | "heading" | "heading2" | "heading3" | "image" | "video" | "list" | "ordered-list" | "quote" | "code" | "divider" | "callout" | "abstract" | "references" | "image-grid" | "table";
  content: string;
  styles?: {
    fontSize?: string;
    alignment?: "left" | "center" | "right" | "justify";
    color?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    imageWidth?: string;
    imageHeight?: string;
    imageAlignment?: "left" | "center" | "right";
    caption?: string;
    language?: string;
    bgColor?: string;
    fontFamily?: string;
    gridColumns?: number;
    gridImages?: string[];
    gridCaptions?: string[];
    tableRows?: number;
    tableCols?: number;
    tableData?: string[][];
    tableHeaders?: string[];
  };
}

type DocType = "blog" | "research";

const WriteEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  // Create refs for each block's file input to prevent cross-block uploads
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState({ top: 0, left: 0 });

  // Validate docType from URL parameter
  const getValidDocType = (): DocType => {
    const typeParam = searchParams.get("type");
    const validTypes: DocType[] = ["blog", "research"];
    return validTypes.includes(typeParam as DocType) ? (typeParam as DocType) : "blog";
  };

  const [docType, setDocType] = useState<DocType>(getValidDocType());

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
    authors_list: "",
    institution: "",
    doi: "",
    paper_type: "research",
    abstract: "",
  });

  useEffect(() => {
    const text = post.blocks.map(b => b.content).join(" ");
    setWordCount(text.split(/\s+/).filter(Boolean).length);
    setCharCount(text.length);
  }, [post.blocks]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    supabase.from("categories").select("*").then(({ data }) => {
      if (data) setCategories(data);
    });

    if (id) {
      const table = docType === "research" ? "research_papers" : "posts";
      supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .eq("author_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            try {
              const blocks = JSON.parse(data.content || "[]");
              setPost({
                title: data.title || "",
                slug: data.slug || "",
                summary: data.summary || (data as any).abstract || "",
                blocks: Array.isArray(blocks) ? blocks : [],
                image_url: data.image_url || (data as any).cover_image || "",
                category_id: data.category_id || "",
                read_time: data.read_time || "5 min",
                meta_description: data.meta_description || "",
                meta_keywords: data.meta_keywords || "",
                status: data.status || "draft",
                authors_list: (data as any).authors_list || "",
                institution: (data as any).institution || "",
                doi: (data as any).doi || "",
                paper_type: (data as any).paper_type || "research",
                abstract: (data as any).abstract || "",
              });
            } catch {
              setPost(p => ({ ...p, title: data.title, slug: data.slug }));
            }
          }
        });
    }
  }, [user, id, navigate, docType]);

  const generateSlug = useCallback((title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }, []);

  const handleTitleChange = (title: string) => {
    setPost(p => ({ ...p, title, slug: generateSlug(title) }));
  };

  const addBlock = (type: ContentBlock["type"], afterId?: string) => {
    const defaultStyles: ContentBlock["styles"] = { alignment: "left" };
    if (type === "image-grid") {
      defaultStyles.gridColumns = 2;
      defaultStyles.gridImages = ["", ""];
      defaultStyles.gridCaptions = ["", ""];
    }
    if (type === "table") {
      defaultStyles.tableRows = 3;
      defaultStyles.tableCols = 3;
      defaultStyles.tableHeaders = ["Header 1", "Header 2", "Header 3"];
      defaultStyles.tableData = [["", "", ""], ["", "", ""], ["", "", ""]];
    }
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: "",
      styles: defaultStyles,
    };
    setPost(p => {
      if (afterId) {
        const idx = p.blocks.findIndex(b => b.id === afterId);
        const newBlocks = [...p.blocks];
        newBlocks.splice(idx + 1, 0, newBlock);
        return { ...p, blocks: newBlocks };
      }
      return { ...p, blocks: [...p.blocks, newBlock] };
    });
    setShowBlockMenu(false);
    setTimeout(() => {
      const el = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLElement;
      el?.focus();
    }, 100);
  };

  const updateBlock = (blockId: string, content: string) => {
    setPost(p => ({
      ...p,
      blocks: p.blocks.map(b => (b.id === blockId ? { ...b, content } : b)),
    }));
  };

  const updateBlockStyles = (blockId: string, styles: ContentBlock["styles"]) => {
    setPost(p => ({
      ...p,
      blocks: p.blocks.map(b => (b.id === blockId ? { ...b, styles: { ...b.styles, ...styles } } : b)),
    }));
  };

  const deleteBlock = (blockId: string) => {
    setPost(p => ({ ...p, blocks: p.blocks.filter(b => b.id !== blockId) }));
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    const idx = post.blocks.findIndex(b => b.id === blockId);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === post.blocks.length - 1)) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    const newBlocks = [...post.blocks];
    [newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]];
    setPost(p => ({ ...p, blocks: newBlocks }));
  };

  const handleBlockKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const block = post.blocks.find(b => b.id === blockId);
      if (block && ["heading", "heading2", "heading3"].includes(block.type)) {
        e.preventDefault();
        addBlock("text", blockId);
      }
    }
    if (e.key === "Backspace") {
      const block = post.blocks.find(b => b.id === blockId);
      if (block && block.content === "" && post.blocks.length > 1) {
        e.preventDefault();
        deleteBlock(blockId);
      }
    }
    if (e.key === "/") {
      const block = post.blocks.find(b => b.id === blockId);
      if (block && block.content === "") {
        e.preventDefault();
        const el = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
        if (el) {
          const rect = el.getBoundingClientRect();
          setBlockMenuPosition({ top: rect.bottom + 4, left: rect.left });
          setActiveBlockId(blockId);
          setShowBlockMenu(true);
        }
      }
    }
  };

  const handleImageUpload = async (blockId: string, file: File) => {
    try {
      const fileName = `blog-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("blog-images").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("blog-images").getPublicUrl(fileName);
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

    if (docType === "research") {
      const payload = {
        title: post.title,
        slug: post.slug || generateSlug(post.title),
        abstract: post.abstract || post.summary,
        content: JSON.stringify(post.blocks),
        cover_image: post.image_url,
        category_id: post.category_id || null,
        read_time: post.read_time,
        meta_description: post.meta_description,
        meta_keywords: post.meta_keywords,
        author_id: user.id,
        published: publish,
        status: publish ? "published" : post.status,
        authors_list: post.authors_list,
        institution: post.institution,
        doi: post.doi,
        paper_type: post.paper_type,
        keywords: post.meta_keywords,
        ...(publish ? { published_at: new Date().toISOString() } : {}),
      };
      let error;
      if (id) {
        ({ error } = await supabase.from("research_papers").update(payload).eq("id", id));
      } else {
        ({ error } = await supabase.from("research_papers").insert(payload));
      }
      if (error) toast.error(error.message);
      else {
        toast.success(publish ? "Research paper published!" : "Draft saved!");
        if (!id) navigate("/creator/dashboard");
      }
    } else {
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
      if (error) toast.error(error.message);
      else {
        toast.success(publish ? "Published!" : "Draft saved!");
        if (!id) navigate("/creator/dashboard");
      }
    }
    setSaving(false);
  };

  const blockTypes = [
    { type: "text", icon: Type, label: "Paragraph", shortcut: "Text block" },
    { type: "heading", icon: Heading1, label: "Heading 1", shortcut: "Large heading" },
    { type: "heading2", icon: Heading2, label: "Heading 2", shortcut: "Medium heading" },
    { type: "heading3", icon: Hash, label: "Heading 3", shortcut: "Small heading" },
    { type: "image", icon: ImageIcon, label: "Image", shortcut: "Upload or URL" },
    { type: "video", icon: Video, label: "Video", shortcut: "YouTube/Vimeo" },
    { type: "list", icon: List, label: "Bullet List", shortcut: "Unordered list" },
    { type: "ordered-list", icon: ListOrdered, label: "Numbered List", shortcut: "Ordered list" },
    { type: "quote", icon: Quote, label: "Quote", shortcut: "Block quote" },
    { type: "code", icon: Code, label: "Code Block", shortcut: "Syntax highlighted" },
    { type: "divider", icon: Minus, label: "Divider", shortcut: "Horizontal rule" },
    { type: "callout", icon: BookOpen, label: "Callout", shortcut: "Highlighted box" },
    { type: "image-grid", icon: Grid, label: "Image Grid", shortcut: "Multi-image layout" },
    { type: "table", icon: Table, label: "Table", shortcut: "Data table" },
    ...(docType === "research" ? [
      { type: "abstract", icon: FileText, label: "Abstract", shortcut: "Paper abstract" },
      { type: "references", icon: BookOpen, label: "References", shortcut: "Bibliography" },
    ] : []),
  ];

  const renderBlockPreview = (block: ContentBlock) => {
    const align = block.styles?.alignment || "left";
    switch (block.type) {
      case "heading":
        return <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-6 leading-tight" style={{ textAlign: align }}>{block.content}</h1>;
      case "heading2":
        return <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-4 leading-tight" style={{ textAlign: align }}>{block.content}</h2>;
      case "heading3":
        return <h3 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-3 leading-tight" style={{ textAlign: align }}>{block.content}</h3>;
      case "text":
        return (
          <p className="text-base leading-[1.8] text-muted-foreground font-serif mb-4"
            style={{
              textAlign: align as any,
              color: block.styles?.color || undefined,
              fontWeight: block.styles?.bold ? "bold" : undefined,
              fontStyle: block.styles?.italic ? "italic" : undefined,
              textDecoration: block.styles?.underline ? "underline" : undefined,
            }}>
            {block.content.split('\n').map((line, i) => (
              <span key={i}>{line}{i < block.content.split('\n').length - 1 && <br />}</span>
            ))}
          </p>
        );
      case "image":
        return (
          <figure className="my-8" style={{ display: "flex", justifyContent: block.styles?.imageAlignment === "left" ? "flex-start" : block.styles?.imageAlignment === "right" ? "flex-end" : "center" }}>
            <div>
              <img src={block.content} alt={block.styles?.caption || ""} className="rounded-lg shadow-md" style={{ width: block.styles?.imageWidth || "100%", maxWidth: "100%" }} loading="lazy" />
              {block.styles?.caption && <figcaption className="text-sm text-muted-foreground mt-2 text-center italic">{block.styles.caption}</figcaption>}
            </div>
          </figure>
        );
      case "video":
        return (
          <div className="aspect-video rounded-xl overflow-hidden shadow-lg my-8 border border-border">
            {(block.content.includes("youtube") || block.content.includes("youtu.be")) ? (
              <iframe width="100%" height="100%" src={block.content.replace("watch?v=", "embed/").split("&")[0]} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
            ) : block.content.includes("vimeo") ? (
              <iframe width="100%" height="100%" src={block.content.replace("vimeo.com/", "player.vimeo.com/video/")} frameBorder="0" allowFullScreen className="w-full h-full" />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center"><p className="text-muted-foreground">Invalid video URL</p></div>
            )}
          </div>
        );
      case "list":
        return (
          <ul className="list-disc list-inside space-y-1.5 mb-4 font-serif text-muted-foreground pl-4">
            {block.content.split('\n').filter(Boolean).map((item, i) => <li key={i}>{item.replace(/^[-•]\s*/, '')}</li>)}
          </ul>
        );
      case "ordered-list":
        return (
          <ol className="list-decimal list-inside space-y-1.5 mb-4 font-serif text-muted-foreground pl-4">
            {block.content.split('\n').filter(Boolean).map((item, i) => <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>)}
          </ol>
        );
      case "quote":
        return <blockquote className="border-l-4 border-primary/50 pl-6 py-2 my-6 italic text-muted-foreground font-serif text-lg">{block.content}</blockquote>;
      case "code":
        return (
          <pre className="bg-zinc-900 text-zinc-100 rounded-xl p-6 my-6 overflow-x-auto text-sm font-mono border border-zinc-800">
            <code>{block.content}</code>
          </pre>
        );
      case "divider":
        return <hr className="my-8 border-border" />;
      case "callout":
        return (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 my-6">
            <p className="text-sm font-serif text-foreground">{block.content}</p>
          </div>
        );
      case "abstract":
        return (
          <div className="bg-secondary/50 rounded-xl p-8 my-8 border border-border">
            <h3 className="text-lg font-bold font-serif mb-3 text-foreground">Abstract</h3>
            <p className="text-sm leading-relaxed text-muted-foreground font-serif italic">{block.content}</p>
          </div>
        );
      case "references":
        return (
          <div className="my-8 border-t border-border pt-6">
            <h3 className="text-lg font-bold font-serif mb-4 text-foreground">References</h3>
            <div className="space-y-2 text-sm text-muted-foreground font-serif">
              {block.content.split('\n').filter(Boolean).map((ref, i) => (
                <p key={i} className="pl-8 -indent-8">[{i + 1}] {ref}</p>
              ))}
            </div>
          </div>
        );
      case "image-grid": {
        const images = block.styles?.gridImages || [];
        const captions = block.styles?.gridCaptions || [];
        const cols = block.styles?.gridColumns || 2;
        return (
          <div className={`grid gap-4 my-8`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {images.filter(Boolean).map((url, i) => (
              <figure key={i}>
                <img src={url} alt={captions[i] || ""} className="rounded-lg w-full h-48 object-cover shadow-md" loading="lazy" />
                {captions[i] && <figcaption className="text-xs text-muted-foreground mt-1.5 text-center italic">{captions[i]}</figcaption>}
              </figure>
            ))}
          </div>
        );
      }
      case "table": {
        const headers = block.styles?.tableHeaders || [];
        const data = block.styles?.tableData || [];
        return (
          <div className="my-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-secondary">
                  {headers.map((h, i) => (
                    <th key={i} className="border border-border px-4 py-2.5 text-left font-semibold text-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? "" : "bg-secondary/30"}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border border-border px-4 py-2 text-muted-foreground">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      default:
        return <p className="text-muted-foreground">{block.content}</p>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Google Docs-style Toolbar */}
      <div className="sticky top-14 z-40 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        {/* Row 1: File actions bar */}
        <div className="container max-w-6xl flex items-center justify-between py-1.5 px-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/creator/dashboard")} className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors">
              <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-1">
              <div className={`p-1.5 rounded ${docType === "research" ? "bg-violet-100 dark:bg-violet-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
                {docType === "research" ? <GraduationCap className="h-4 w-4 text-violet-600 dark:text-violet-400" /> : <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </div>
              <input
                type="text"
                value={post.title || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={docType === "research" ? "Untitled Research Paper" : "Untitled Document"}
                className="bg-transparent text-sm font-medium outline-none border-none w-60 text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 dark:border-zinc-700 p-0.5 mr-2">
              <button
                onClick={() => setDocType("blog")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${docType === "blog" ? "bg-blue-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
              >
                Blog
              </button>
              <button
                onClick={() => setDocType("research")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${docType === "research" ? "bg-violet-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
              >
                Research
              </button>
            </div>
            <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${previewMode ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}>
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">
              <Settings className="h-3.5 w-3.5" /> Settings
            </button>
            <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1" />
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving || post.blocks.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Publish
            </button>
          </div>
        </div>

        {/* Row 2: Formatting toolbar */}
        <div className="container max-w-6xl flex items-center gap-0.5 py-1 px-4 border-t border-gray-100 dark:border-zinc-800 overflow-x-auto">
          <div className="relative">
            <button
              onClick={() => { setBlockMenuPosition({ top: 180, left: 100 }); setShowBlockMenu(!showBlockMenu); }}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Insert
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

          {[
            { type: "heading", icon: Heading1, tip: "Heading 1" },
            { type: "heading2", icon: Heading2, tip: "Heading 2" },
            { type: "text", icon: Type, tip: "Paragraph" },
          ].map((btn) => (
            <button
              key={btn.type}
              onClick={() => addBlock(btn.type as any)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors"
              title={btn.tip}
            >
              <btn.icon className="h-4 w-4" />
            </button>
          ))}

          <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

          {[
            { type: "image", icon: ImageIcon, tip: "Image" },
            { type: "video", icon: Video, tip: "Video" },
            { type: "code", icon: Code, tip: "Code" },
            { type: "quote", icon: Quote, tip: "Quote" },
            { type: "list", icon: List, tip: "Bullet list" },
            { type: "ordered-list", icon: ListOrdered, tip: "Numbered list" },
            { type: "divider", icon: Minus, tip: "Divider" },
          ].map((btn) => (
            <button
              key={btn.type}
              onClick={() => addBlock(btn.type as any)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors"
              title={btn.tip}
            >
              <btn.icon className="h-4 w-4" />
            </button>
          ))}

          <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

          {[
            { align: "left" as const, icon: AlignLeft },
            { align: "center" as const, icon: AlignCenter },
            { align: "right" as const, icon: AlignRight },
          ].map((btn) => (
            <button
              key={btn.align}
              onClick={() => {
                if (activeBlockId) updateBlockStyles(activeBlockId, { alignment: btn.align });
              }}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors"
              title={`Align ${btn.align}`}
            >
              <btn.icon className="h-4 w-4" />
            </button>
          ))}

          <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

          {/* Text formatting */}
          {[
            { style: "bold" as const, icon: Bold, tip: "Bold" },
            { style: "italic" as const, icon: Italic, tip: "Italic" },
            { style: "underline" as const, icon: Underline, tip: "Underline" },
          ].map((btn) => {
            const activeBlock = post.blocks.find(b => b.id === activeBlockId);
            const isActive = activeBlock?.styles?.[btn.style];
            return (
              <button
                key={btn.style}
                onClick={() => {
                  if (activeBlockId) {
                    const current = post.blocks.find(b => b.id === activeBlockId)?.styles?.[btn.style];
                    updateBlockStyles(activeBlockId, { [btn.style]: !current });
                  }
                }}
                className={`p-1.5 rounded transition-colors ${isActive ? "bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200" : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400"}`}
                title={btn.tip}
              >
                <btn.icon className="h-4 w-4" />
              </button>
            );
          })}

          <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

          {/* Font family */}
          <select
            value={post.blocks.find(b => b.id === activeBlockId)?.styles?.fontFamily || "serif"}
            onChange={(e) => {
              if (activeBlockId) updateBlockStyles(activeBlockId, { fontFamily: e.target.value });
            }}
            className="px-1.5 py-1 text-xs rounded border border-gray-200 dark:border-zinc-700 bg-transparent text-gray-600 dark:text-gray-400 outline-none focus:border-primary max-w-[90px]"
            title="Font family"
          >
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans</option>
            <option value="mono">Mono</option>
            <option value="cursive">Cursive</option>
          </select>

          {/* Text color */}
          <div className="relative flex items-center" title="Text color">
            <Palette className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 mr-0.5" />
            <input
              type="color"
              value={post.blocks.find(b => b.id === activeBlockId)?.styles?.color || "#374151"}
              onChange={(e) => {
                if (activeBlockId) updateBlockStyles(activeBlockId, { color: e.target.value });
              }}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>

          {/* Background color */}
          <div className="relative flex items-center" title="Background color">
            <span className="text-[10px] text-gray-400 mr-0.5">BG</span>
            <input
              type="color"
              value={post.blocks.find(b => b.id === activeBlockId)?.styles?.bgColor || "#ffffff"}
              onChange={(e) => {
                if (activeBlockId) updateBlockStyles(activeBlockId, { bgColor: e.target.value === "#ffffff" ? undefined : e.target.value });
              }}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>

          <div className="flex-1" />

          <span className="text-[10px] text-gray-400 whitespace-nowrap">
            {wordCount} words &middot; {charCount} chars
          </span>
        </div>
      </div>

      {/* Block insertion menu */}
      <AnimatePresence>
        {showBlockMenu && (
          <>
            <div className="fixed inset-0 z-50" onClick={() => setShowBlockMenu(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              className="fixed z-50 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-xl p-2 w-64 max-h-80 overflow-y-auto"
              style={{ top: blockMenuPosition.top || 180, left: blockMenuPosition.left || 100 }}
            >
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-2 py-1">Insert Block</p>
              {blockTypes.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => addBlock(bt.type as any, activeBlockId || undefined)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  <bt.icon className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{bt.label}</p>
                    <p className="text-[10px] text-gray-400">{bt.shortcut}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings side panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-14 bottom-0 w-80 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 z-40 overflow-y-auto shadow-xl"
          >
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Document Settings</h3>
                <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">{docType === "research" ? "Abstract" : "Summary"}</label>
                <textarea
                  value={docType === "research" ? post.abstract : post.summary}
                  onChange={(e) => {
                    if (docType === "research") setPost(p => ({ ...p, abstract: e.target.value }));
                    else setPost(p => ({ ...p, summary: e.target.value }));
                  }}
                  placeholder={docType === "research" ? "Paper abstract..." : "Brief summary..."}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Category</label>
                <select
                  value={post.category_id}
                  onChange={(e) => setPost(p => ({ ...p, category_id: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Select</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">{docType === "research" ? "Cover Image" : "Featured Image"}</label>
                <input
                  type="url"
                  value={post.image_url}
                  onChange={(e) => setPost(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-primary"
                />
                {post.image_url && (
                  <img src={post.image_url} className="w-full h-32 object-cover rounded-lg mt-2" alt="Cover" />
                )}
              </div>

              {docType === "research" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Authors (comma-separated)</label>
                    <input
                      type="text"
                      value={post.authors_list}
                      onChange={(e) => setPost(p => ({ ...p, authors_list: e.target.value }))}
                      placeholder="John Doe, Jane Smith"
                      className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Institution</label>
                    <input
                      type="text"
                      value={post.institution}
                      onChange={(e) => setPost(p => ({ ...p, institution: e.target.value }))}
                      placeholder="MIT, Stanford..."
                      className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Paper Type</label>
                    <select
                      value={post.paper_type}
                      onChange={(e) => setPost(p => ({ ...p, paper_type: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      <option value="research">Research Paper</option>
                      <option value="review">Literature Review</option>
                      <option value="survey">Survey</option>
                      <option value="case-study">Case Study</option>
                      <option value="whitepaper">Whitepaper</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">DOI</label>
                    <input
                      type="text"
                      value={post.doi}
                      onChange={(e) => setPost(p => ({ ...p, doi: e.target.value }))}
                      placeholder="10.xxxx/xxxxx"
                      className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Meta Keywords</label>
                <input
                  type="text"
                  value={post.meta_keywords}
                  onChange={(e) => setPost(p => ({ ...p, meta_keywords: e.target.value }))}
                  placeholder="react, ai, technology"
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Meta Description</label>
                <textarea
                  value={post.meta_description}
                  onChange={(e) => setPost(p => ({ ...p, meta_description: e.target.value }))}
                  placeholder="SEO description..."
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Read Time</label>
                <input
                  type="text"
                  value={post.read_time}
                  onChange={(e) => setPost(p => ({ ...p, read_time: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editor / Preview Area */}
      <main className="py-8">
        <div className={`mx-auto ${showSettings ? "max-w-3xl mr-80" : "max-w-4xl"} transition-all`}>
          {previewMode ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 mx-4"
            >
              <div className={`p-8 sm:p-12 lg:p-16 ${docType === "research" ? "max-w-[700px] mx-auto" : ""}`}>
                {docType === "research" && (
                  <div className="text-center mb-10">
                    <span className="inline-block px-3 py-1 mb-4 text-[10px] uppercase tracking-widest font-bold text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-400 rounded-full">
                      {post.paper_type || "Research Paper"}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight mb-4">{post.title || "Untitled"}</h1>
                    {post.authors_list && <p className="text-sm text-muted-foreground font-serif">{post.authors_list}</p>}
                    {post.institution && <p className="text-xs text-muted-foreground mt-1">{post.institution}</p>}
                    {post.doi && <p className="text-xs text-muted-foreground mt-1 font-mono">DOI: {post.doi}</p>}
                    <div className="w-16 h-px bg-gray-300 dark:bg-zinc-700 mx-auto mt-6" />
                  </div>
                )}
                {docType === "blog" && (
                  <div className="mb-8">
                    <h1 className="text-4xl sm:text-5xl font-black text-foreground leading-tight mb-4">{post.title || "Untitled"}</h1>
                    {post.summary && <p className="text-lg text-muted-foreground leading-relaxed">{post.summary}</p>}
                  </div>
                )}
                {post.image_url && (
                  <img src={post.image_url} alt="Cover" className="w-full rounded-xl mb-8 object-cover max-h-96" />
                )}
                <div className="space-y-1">
                  {post.blocks.map((block) => (
                    <div key={block.id}>{renderBlockPreview(block)}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div
              ref={editorRef}
              className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 mx-4 min-h-[600px]"
            >
              <div className="p-8 sm:p-12 lg:p-16 max-w-[750px] mx-auto">
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={docType === "research" ? "Research Paper Title" : "Article Title"}
                  className="w-full bg-transparent text-3xl sm:text-4xl font-bold outline-none placeholder:text-gray-300 dark:placeholder:text-zinc-600 text-gray-900 dark:text-gray-100 mb-2 font-serif"
                />
                <p className="text-xs text-gray-400 mb-8 font-mono">/{post.slug || "slug-will-appear-here"}</p>

                <div className="space-y-1">
                  {post.blocks.length === 0 ? (
                    <div className="py-8 text-center cursor-pointer group" onClick={() => addBlock("text")}>
                      <p className="text-gray-400 dark:text-zinc-600 text-sm group-hover:text-gray-500 transition-colors">
                        Click here or press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-[10px] font-mono mx-1">/</kbd> to start writing...
                      </p>
                    </div>
                  ) : (
                    post.blocks.map((block, idx) => (
                      <div
                        key={block.id}
                        className={`group relative rounded-lg transition-all ${activeBlockId === block.id ? "bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-200 dark:ring-blue-800" : "hover:bg-gray-50 dark:hover:bg-zinc-800/30"}`}
                        onClick={() => setActiveBlockId(block.id)}
                      >
                        {/* Left gutter controls */}
                        <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); setBlockMenuPosition({ top: rect.bottom, left: rect.left }); setActiveBlockId(block.id); setShowBlockMenu(true); }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-gray-400"
                            title="Add block"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500"
                            title="Delete"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Right gutter reorder */}
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5 text-[10px] text-gray-400">
                          {idx > 0 && (
                            <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "up"); }} className="hover:text-gray-600 p-0.5">&#8593;</button>
                          )}
                          {idx < post.blocks.length - 1 && (
                            <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "down"); }} className="hover:text-gray-600 p-0.5">&#8595;</button>
                          )}
                        </div>

                        {/* Block content area */}
                        <div className="px-2 py-1" style={{ backgroundColor: block.styles?.bgColor || undefined, borderRadius: block.styles?.bgColor ? "0.5rem" : undefined }}>
                          {block.type === "text" && (
                            <textarea
                              data-block-id={block.id}
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
                              onFocus={() => setActiveBlockId(block.id)}
                              placeholder="Type something..."
                              rows={Math.max(1, block.content.split('\n').length)}
                              className="w-full bg-transparent text-base leading-[1.8] text-gray-700 dark:text-gray-300 outline-none resize-none placeholder:text-gray-300 dark:placeholder:text-zinc-600"
                              style={{
                                textAlign: (block.styles?.alignment || "left") as any,
                                fontWeight: block.styles?.bold ? "bold" : undefined,
                                fontStyle: block.styles?.italic ? "italic" : undefined,
                                textDecoration: block.styles?.underline ? "underline" : undefined,
                                color: block.styles?.color || undefined,
                                fontFamily: block.styles?.fontFamily === "mono" ? "monospace" : block.styles?.fontFamily === "sans-serif" ? "system-ui, sans-serif" : block.styles?.fontFamily === "cursive" ? "cursive" : "Georgia, serif",
                              }}
                            />
                          )}

                          {block.type === "heading" && (
                            <input
                              data-block-id={block.id}
                              type="text"
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
                              onFocus={() => setActiveBlockId(block.id)}
                              placeholder="Heading 1"
                              className="w-full bg-transparent text-3xl font-bold text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-300 dark:placeholder:text-zinc-600 font-serif"
                              style={{ textAlign: (block.styles?.alignment || "left") as any }}
                            />
                          )}

                          {block.type === "heading2" && (
                            <input
                              data-block-id={block.id}
                              type="text"
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
                              onFocus={() => setActiveBlockId(block.id)}
                              placeholder="Heading 2"
                              className="w-full bg-transparent text-2xl font-bold text-gray-800 dark:text-gray-200 outline-none placeholder:text-gray-300 dark:placeholder:text-zinc-600 font-serif"
                              style={{ textAlign: (block.styles?.alignment || "left") as any }}
                            />
                          )}

                          {block.type === "heading3" && (
                            <input
                              data-block-id={block.id}
                              type="text"
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
                              onFocus={() => setActiveBlockId(block.id)}
                              placeholder="Heading 3"
                              className="w-full bg-transparent text-xl font-semibold text-gray-800 dark:text-gray-200 outline-none placeholder:text-gray-300 dark:placeholder:text-zinc-600 font-serif"
                              style={{ textAlign: (block.styles?.alignment || "left") as any }}
                            />
                          )}

                          {block.type === "image" && (
                            <div className="py-2">
                              {block.content ? (
                                <div className="relative group/img">
                                  <img src={block.content} alt={block.styles?.caption || "Image"} className="rounded-lg max-w-full mx-auto" style={{ width: block.styles?.imageWidth || "100%", maxWidth: "100%" }} />
                                  {block.styles?.caption && <p className="text-xs text-center text-gray-400 mt-2 italic">{block.styles.caption}</p>}
                                  <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); updateBlock(block.id, ""); }} className="px-2 py-1 rounded bg-black/60 text-white text-xs">Replace</button>
                                  </div>
                                  <div className="mt-2 flex gap-2 items-center">
                                    <input
                                      type="text"
                                      placeholder="Caption..."
                                      value={block.styles?.caption || ""}
                                      onChange={(e) => updateBlockStyles(block.id, { caption: e.target.value })}
                                      className="flex-1 bg-transparent text-xs text-gray-500 outline-none border-b border-transparent focus:border-gray-300"
                                    />
                                    <input
                                      type="range"
                                      min="30"
                                      max="100"
                                      value={parseInt(block.styles?.imageWidth || "100")}
                                      onChange={(e) => updateBlockStyles(block.id, { imageWidth: `${e.target.value}%` })}
                                      className="w-20"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <input ref={(el) => { if (el) fileInputRefs.current[block.id] = el; }} type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(block.id, e.target.files[0]); }} className="hidden" />
                                  <button onClick={() => {
                                    if (fileInputRefs.current[block.id]) {
                                      fileInputRefs.current[block.id]?.click();
                                    }
                                  }} className="w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 p-6 text-center hover:border-blue-400 transition-colors">
                                    <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-400">Click to upload or drag image</p>
                                  </button>
                                  <input
                                    type="url"
                                    placeholder="Or paste image URL..."
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                    className="w-full bg-transparent text-sm text-gray-600 dark:text-gray-400 outline-none border-b border-gray-200 dark:border-zinc-700 pb-1 focus:border-blue-400"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {block.type === "video" && (
                            <div className="py-2">
                              <input
                                data-block-id={block.id}
                                type="url"
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                onFocus={() => setActiveBlockId(block.id)}
                                placeholder="Paste YouTube or Vimeo URL..."
                                className="w-full bg-transparent text-sm text-gray-600 dark:text-gray-400 outline-none border-b border-gray-200 dark:border-zinc-700 pb-2 mb-2 focus:border-blue-400"
                              />
                              {block.content && (block.content.includes("youtube") || block.content.includes("youtu.be")) && (
                                <div className="aspect-video rounded-lg overflow-hidden">
                                  <iframe width="100%" height="100%" src={block.content.replace("watch?v=", "embed/").split("&")[0]} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
                                </div>
                              )}
                            </div>
                          )}

                          {(block.type === "list" || block.type === "ordered-list") && (
                            <textarea
                              data-block-id={block.id}
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              onFocus={() => setActiveBlockId(block.id)}
                              placeholder={block.type === "list" ? "- Item 1\n- Item 2\n- Item 3" : "1. Item 1\n2. Item 2\n3. Item 3"}
                              rows={Math.max(3, block.content.split('\n').length)}
                              className="w-full bg-transparent text-base leading-relaxed text-gray-700 dark:text-gray-300 outline-none resize-none placeholder:text-gray-300 dark:placeholder:text-zinc-600 font-serif"
                            />
                          )}

                          {block.type === "quote" && (
                            <div className="border-l-4 border-gray-300 dark:border-zinc-600 pl-4">
                              <textarea
                                data-block-id={block.id}
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                onFocus={() => setActiveBlockId(block.id)}
                                placeholder="Enter quote..."
                                rows={Math.max(2, block.content.split('\n').length)}
                                className="w-full bg-transparent text-lg italic leading-relaxed text-gray-600 dark:text-gray-400 outline-none resize-none placeholder:text-gray-300 dark:placeholder:text-zinc-600 font-serif"
                              />
                            </div>
                          )}

                          {block.type === "code" && (
                            <div className="rounded-lg bg-zinc-900 dark:bg-zinc-950 p-4 overflow-x-auto">
                              <textarea
                                data-block-id={block.id}
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                onFocus={() => setActiveBlockId(block.id)}
                                placeholder="// Paste code here..."
                                rows={Math.max(4, block.content.split('\n').length)}
                                className="w-full bg-transparent text-sm leading-relaxed text-green-400 outline-none resize-none font-mono placeholder:text-zinc-600"
                              />
                            </div>
                          )}

                          {block.type === "divider" && (
                            <div className="py-4">
                              <hr className="border-gray-200 dark:border-zinc-700" />
                            </div>
                          )}

                          {block.type === "callout" && (
                            <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                              <textarea
                                data-block-id={block.id}
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                onFocus={() => setActiveBlockId(block.id)}
                                placeholder="Callout text..."
                                rows={Math.max(2, block.content.split('\n').length)}
                                className="w-full bg-transparent text-sm leading-relaxed text-blue-800 dark:text-blue-200 outline-none resize-none placeholder:text-blue-300 dark:placeholder:text-blue-600"
                              />
                            </div>
                          )}

                          {block.type === "abstract" && (
                            <div className="rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 p-5">
                              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Abstract</p>
                              <textarea
                                data-block-id={block.id}
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                onFocus={() => setActiveBlockId(block.id)}
                                placeholder="Write your paper abstract..."
                                rows={Math.max(4, block.content.split('\n').length)}
                                className="w-full bg-transparent text-sm leading-relaxed italic text-gray-600 dark:text-gray-400 outline-none resize-none placeholder:text-gray-300 font-serif"
                              />
                            </div>
                          )}

                          {block.type === "references" && (
                            <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">References</p>
                              <textarea
                                data-block-id={block.id}
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                onFocus={() => setActiveBlockId(block.id)}
                                placeholder="Enter references, one per line..."
                                rows={Math.max(5, block.content.split('\n').length)}
                                className="w-full bg-transparent text-sm leading-relaxed text-gray-600 dark:text-gray-400 outline-none resize-none placeholder:text-gray-300 font-serif"
                              />
                            </div>
                          )}

                          {block.type === "image-grid" && (
                            <div className="py-2 space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Image Grid</p>
                                <select
                                  value={block.styles?.gridColumns || 2}
                                  onChange={(e) => updateBlockStyles(block.id, { gridColumns: Number(e.target.value) })}
                                  className="text-xs border border-gray-200 dark:border-zinc-700 rounded px-2 py-1 bg-transparent outline-none"
                                >
                                  <option value={2}>2 columns</option>
                                  <option value={3}>3 columns</option>
                                  <option value={4}>4 columns</option>
                                </select>
                                <button
                                  onClick={() => {
                                    const imgs = [...(block.styles?.gridImages || []), ""];
                                    const caps = [...(block.styles?.gridCaptions || []), ""];
                                    updateBlockStyles(block.id, { gridImages: imgs, gridCaptions: caps });
                                  }}
                                  className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20"
                                >
                                  + Add image
                                </button>
                              </div>
                              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${block.styles?.gridColumns || 2}, 1fr)` }}>
                                {(block.styles?.gridImages || []).map((url: string, i: number) => (
                                  <div key={i} className="space-y-1">
                                    {url ? (
                                      <div className="relative group/gimg">
                                        <img src={url} alt="" className="w-full h-32 object-cover rounded-lg" />
                                        <button
                                          onClick={() => {
                                            const imgs = [...(block.styles?.gridImages || [])];
                                            imgs[i] = "";
                                            updateBlockStyles(block.id, { gridImages: imgs });
                                          }}
                                          className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover/gimg:opacity-100 transition-opacity"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <input
                                        type="url"
                                        placeholder="Image URL..."
                                        onChange={(e) => {
                                          const imgs = [...(block.styles?.gridImages || [])];
                                          imgs[i] = e.target.value;
                                          updateBlockStyles(block.id, { gridImages: imgs });
                                        }}
                                        className="w-full rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 p-3 text-xs outline-none bg-gray-50 dark:bg-zinc-800/50 focus:border-primary"
                                      />
                                    )}
                                    <input
                                      type="text"
                                      placeholder="Caption..."
                                      value={(block.styles?.gridCaptions || [])[i] || ""}
                                      onChange={(e) => {
                                        const caps = [...(block.styles?.gridCaptions || [])];
                                        caps[i] = e.target.value;
                                        updateBlockStyles(block.id, { gridCaptions: caps });
                                      }}
                                      className="w-full bg-transparent text-[11px] text-gray-400 outline-none border-b border-transparent focus:border-gray-300"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {block.type === "table" && (
                            <div className="py-2 space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Table</p>
                                <button
                                  onClick={() => {
                                    const cols = (block.styles?.tableCols || 3) + 1;
                                    const headers = [...(block.styles?.tableHeaders || []), `Header ${cols}`];
                                    const data = (block.styles?.tableData || []).map(row => [...row, ""]);
                                    updateBlockStyles(block.id, { tableCols: cols, tableHeaders: headers, tableData: data });
                                  }}
                                  className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20"
                                >
                                  + Column
                                </button>
                                <button
                                  onClick={() => {
                                    const cols = block.styles?.tableCols || 3;
                                    const data = [...(block.styles?.tableData || []), Array(cols).fill("")];
                                    updateBlockStyles(block.id, { tableRows: (block.styles?.tableRows || 3) + 1, tableData: data });
                                  }}
                                  className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20"
                                >
                                  + Row
                                </button>
                              </div>
                              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-700">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-gray-50 dark:bg-zinc-800">
                                      {(block.styles?.tableHeaders || []).map((h: string, ci: number) => (
                                        <th key={ci} className="border-b border-r border-gray-200 dark:border-zinc-700 last:border-r-0">
                                          <input
                                            type="text"
                                            value={h}
                                            onChange={(e) => {
                                              const headers = [...(block.styles?.tableHeaders || [])];
                                              headers[ci] = e.target.value;
                                              updateBlockStyles(block.id, { tableHeaders: headers });
                                            }}
                                            className="w-full bg-transparent px-3 py-2 text-xs font-semibold outline-none text-gray-700 dark:text-gray-300"
                                            placeholder="Header"
                                          />
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(block.styles?.tableData || []).map((row: string[], ri: number) => (
                                      <tr key={ri}>
                                        {row.map((cell: string, ci: number) => (
                                          <td key={ci} className="border-b border-r border-gray-200 dark:border-zinc-700 last:border-r-0 last:border-b-0">
                                            <input
                                              type="text"
                                              value={cell}
                                              onChange={(e) => {
                                                const data = (block.styles?.tableData || []).map((r: string[]) => [...r]);
                                                data[ri][ci] = e.target.value;
                                                updateBlockStyles(block.id, { tableData: data });
                                              }}
                                              className="w-full bg-transparent px-3 py-2 text-xs outline-none text-gray-600 dark:text-gray-400"
                                              placeholder="..."
                                            />
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {post.blocks.length > 0 && (
                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={() => addBlock("text")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add block
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WriteEditor;
