import { useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Eye, EyeOff, Maximize2, Minimize2, Copy, Check, RotateCcw } from "lucide-react";

interface MonacoCodeEditorProps {
  html: string;
  css: string;
  js: string;
  onHtmlChange: (val: string) => void;
  onCssChange: (val: string) => void;
  onJsChange: (val: string) => void;
}

type Tab = "html" | "css" | "js";

const tabConfig: { key: Tab; label: string; lang: string; color: string }[] = [
  { key: "html", label: "HTML", lang: "html", color: "text-orange-400" },
  { key: "css", label: "CSS", lang: "css", color: "text-blue-400" },
  { key: "js", label: "JavaScript", lang: "javascript", color: "text-yellow-400" },
];

const MonacoCodeEditor = ({ html, css, js, onHtmlChange, onCssChange, onJsChange }: MonacoCodeEditorProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("html");
  const [showPreview, setShowPreview] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const values: Record<Tab, string> = { html, css, js };
  const setters: Record<Tab, (v: string) => void> = { html: onHtmlChange, css: onCssChange, js: onJsChange };

  const getPreviewDoc = useCallback(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; padding: 1rem; color: #1a1a2e; }
  ${css}
</style>
</head>
<body>
${html}
<script>
try {
  ${js}
} catch(e) {
  document.body.innerHTML += '<pre style="color:red;margin-top:1rem;font-size:12px">Error: ' + e.message + '</pre>';
}
</script>
</body>
</html>`;
  }, [html, css, js]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(getPreviewDoc());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = getPreviewDoc();
    }
  };

  const containerClass = fullscreen
    ? "fixed inset-0 z-50 bg-background flex flex-col"
    : "rounded-xl border border-border bg-card overflow-hidden flex flex-col";

  return (
    <div className={containerClass} style={{ minHeight: fullscreen ? "100vh" : "600px" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-1">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <span className={activeTab === tab.key ? tab.color : ""}>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopyAll} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors" title="Copy full HTML">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <button onClick={refreshPreview} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors" title="Refresh preview">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors" title="Toggle preview">
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button onClick={() => setFullscreen(!fullscreen)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors" title="Fullscreen">
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className={`flex-1 flex ${showPreview ? "flex-col lg:flex-row" : ""} overflow-hidden`}>
        <div className={`${showPreview ? "lg:w-1/2 h-[300px] lg:h-auto" : "w-full"} flex-shrink-0`}>
          <Editor
            height="100%"
            language={tabConfig.find(t => t.key === activeTab)!.lang}
            value={values[activeTab]}
            onChange={(v) => setters[activeTab](v || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 22,
              padding: { top: 12 },
              wordWrap: "on",
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              formatOnPaste: true,
              automaticLayout: true,
              tabSize: 2,
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true },
              suggest: { showWords: true },
            }}
          />
        </div>

        {showPreview && (
          <div className="flex-1 border-t lg:border-t-0 lg:border-l border-border bg-white min-h-[300px]">
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-secondary/30">
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Live Preview</span>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={getPreviewDoc()}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
              title="Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MonacoCodeEditor;
