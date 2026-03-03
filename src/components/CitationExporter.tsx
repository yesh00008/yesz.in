import { useState } from "react";
import { FileDown, Copy, Check } from "lucide-react";

interface CitationExporterProps {
  title: string;
  authors: string;
  publishedAt: string;
  doi?: string;
  url: string;
}

const CitationExporter = ({ title, authors, publishedAt, doi, url }: CitationExporterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState("");

  const year = new Date(publishedAt).getFullYear();

  const citations = {
    bibtex: `@article{${title.slug || "article"}${year},
  title={${title}},
  author={${authors}},
  year={${year}},
  ${doi ? `doi={${doi}},` : ""}
  url={${url}}
}`,
    apa: `${authors}. (${year}). ${title}. Retrieved from ${url}${doi ? ` https://doi.org/${doi}` : ""}`,
    chicago: `${authors}. "${title}" Yeszz Tech Hub. Accessed ${new Date().toLocaleDateString()}.${doi ? ` https://doi.org/${doi}.` : "."}`,
    mla: `${authors}. "${title}." Yeszz Tech Hub, ${year}, ${url}.`,
    harvard: `${authors} ${year}, '${title}', Yeszz Tech Hub. Available at: ${url}${doi ? ` (Accessed: ${new Date().toLocaleDateString()}).` : "."}`,
  };

  const copyCitation = (format: string) => {
    const text = citations[format as keyof typeof citations];
    navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(""), 2000);
  };

  const downloadPDF = () => {
    // Placeholder for PDF generation
    alert("PDF download feature coming soon!");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
      >
        <FileDown className="h-4 w-4" />
        Cite & Export
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl border border-border p-6 max-w-lg w-full max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Export & Citation</h2>

            {/* Download PDF */}
            <button
              onClick={downloadPDF}
              className="w-full flex items-center gap-2 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors mb-4"
            >
              <FileDown className="h-4 w-4" />
              Download as PDF
            </button>

            <div className="space-y-3">
              {(Object.keys(citations) as Array<keyof typeof citations>).map((format) => (
                <div key={format} className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs font-semibold uppercase mb-2 text-muted-foreground">
                    {format.toUpperCase()}
                  </p>
                  <p className="text-xs text-foreground font-mono mb-2 line-clamp-3">
                    {citations[format]}
                  </p>
                  <button
                    onClick={() => copyCitation(format)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {copied === format ? (
                      <>
                        <Check className="h-3 w-3" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CitationExporter;
