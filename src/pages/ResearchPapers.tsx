import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap, Calendar, Clock, Eye, Download,
  Quote, ChevronRight, BookOpen, Users, Building, ArrowUpRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";

const ResearchPapers = () => {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: papersData, error } = await supabase
          .from("research_papers")
          .select("*, categories(name, slug)")
          .eq("published", true)
          .order("published_at", { ascending: false });
        if (error) {
          console.error("Error fetching papers:", error);
          setPapers([]);
        } else if (papersData) {
          setPapers(papersData);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredPaper = papers.find(p => p.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Hero section */}
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_70%)]" />
        <div className="container max-w-6xl py-16 px-4 relative z-10">
          <div className="flex items-center gap-2 text-xs text-primary-foreground/70 mb-4">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground">Research Papers</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold">Research Papers</h1>
              <p className="text-primary-foreground/70 text-sm mt-1">Peer-reviewed academic research in technology</p>
            </div>
          </div>
          <p className="text-primary-foreground/80 max-w-xl text-sm leading-relaxed mt-4">
            Explore cutting-edge research papers published by our community of scholars, engineers, and industry experts.
            From AI to cybersecurity, discover the latest findings shaping the future of technology.
          </p>
          {!loading && (
            <div className="flex items-center gap-4 mt-6 text-sm text-primary-foreground/70">
              <span>{papers.length} papers published</span>
              <span>·</span>
              <span>{papers.filter(p => p.peer_reviewed).length} peer-reviewed</span>
            </div>
          )}
        </div>
      </div>

      <main className="container max-w-6xl py-10 px-4">
        {/* Featured paper */}
        {featuredPaper && (
          <Link
            to={`/research/${featuredPaper.slug}`}
            className="block mb-12 group"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {featuredPaper.cover_image && (
                  <div className="h-64 md:h-auto overflow-hidden">
                    <img src={featuredPaper.cover_image} alt={featuredPaper.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">Featured</span>
                    <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 dark:bg-primary/20 rounded-full">
                      {featuredPaper.paper_type?.replace("-", " ")}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-foreground leading-tight mb-3 group-hover:text-primary transition-colors">
                    {featuredPaper.title}
                  </h2>
                  {featuredPaper.authors_list && (
                    <p className="text-sm text-muted-foreground mb-2 font-serif">{featuredPaper.authors_list}</p>
                  )}
                  {featuredPaper.abstract && (
                    <p className="text-sm text-muted-foreground/70 line-clamp-3 leading-relaxed mb-4">{featuredPaper.abstract}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{featuredPaper.views || 0}</span>
                    <span className="flex items-center gap-1"><Quote className="h-3 w-3" />{featuredPaper.citations || 0} citations</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featuredPaper.read_time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No papers found</h3>
            <p className="text-sm text-muted-foreground">No research papers published yet</p>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-border">
            {papers.map((paper, idx) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Link
                  to={`/research/${paper.slug}`}
                  className="group block py-8 first:pt-0 hover:bg-primary/[0.02] transition-colors -mx-4 px-4 rounded-lg"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Cover image if exists */}
                    {paper.cover_image && (
                      <div className="md:w-56 md:flex-shrink-0">
                        <img
                          src={paper.cover_image}
                          alt={paper.title}
                          className="rounded-xl w-full h-40 md:h-36 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-bold text-primary bg-primary/10 dark:bg-primary/20 rounded-full">
                          {paper.paper_type?.replace("-", " ") || "Research"}
                        </span>
                        {paper.peer_reviewed && (
                          <span className="px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            Peer Reviewed
                          </span>
                        )}
                        {(paper as any).categories?.name && (
                          <span className="px-2.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground bg-secondary rounded-full">
                            {(paper as any).categories.name}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-black text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                        {paper.title}
                      </h3>

                      {/* Authors */}
                      {paper.authors_list && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                          <Users className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="line-clamp-1">{paper.authors_list}</span>
                        </div>
                      )}

                      {/* Institution */}
                      {paper.institution && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mb-3">
                          <Building className="h-3 w-3 flex-shrink-0" />
                          <span>{paper.institution}</span>
                        </div>
                      )}

                      {/* Abstract excerpt */}
                      {paper.abstract && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{paper.abstract}</p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground">
                        {paper.published_at && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(paper.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{paper.views || 0} views</span>
                        <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5" />{paper.downloads || 0}</span>
                        <span className="flex items-center gap-1.5"><Quote className="h-3.5 w-3.5" />{paper.citations || 0} citations</span>
                        <ArrowUpRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ResearchPapers;
