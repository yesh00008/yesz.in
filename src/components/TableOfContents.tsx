import { useState, useEffect } from "react";
import { List } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentHtml: string;
}

const TableOfContents = ({ contentHtml }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    // Parse headings from rendered DOM
    const timer = setTimeout(() => {
      const article = document.querySelector(".prose-custom");
      if (!article) return;
      const els = article.querySelectorAll("h2, h3");
      const items: TOCItem[] = [];
      els.forEach((el, i) => {
        const id = `heading-${i}`;
        el.id = id;
        items.push({
          id,
          text: el.textContent || "",
          level: el.tagName === "H2" ? 2 : 3,
        });
      });
      setHeadings(items);
    }, 300);
    return () => clearTimeout(timer);
  }, [contentHtml]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="space-y-1">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        <List className="h-3.5 w-3.5" />
        Table of Contents
      </div>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
          }}
          className={`block text-sm py-1 transition-colors ${
            h.level === 3 ? "pl-4" : ""
          } ${
            activeId === h.id
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
};

export default TableOfContents;
