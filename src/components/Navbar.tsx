import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, User, LogOut, ChevronDown, Bookmark, TrendingUp, PenTool } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Careers", to: "/careers" },
  { label: "Contact", to: "/contact" },
];

const defaultCategories = [
  { name: "AI", slug: "ai", icon: "🤖", description: "Artificial Intelligence & ML" },
  { name: "Cybersecurity", slug: "cybersecurity", icon: "🔒", description: "Security & Privacy" },
  { name: "Gadgets", slug: "gadgets", icon: "📱", description: "Devices & Hardware" },
  { name: "Programming", slug: "programming", icon: "💻", description: "Code & Dev Tools" },
  { name: "Cloud Computing", slug: "cloud-computing", icon: "☁️", description: "Cloud Tech & Services" },
  { name: "DevOps", slug: "devops", icon: "⚙️", description: "CI/CD & Automation" },
  { name: "Web3", slug: "web3", icon: "🔗", description: "Blockchain & Crypto" },
  { name: "Gaming", slug: "gaming", icon: "🎮", description: "Video Games & eSports" },
  { name: "Reviews", slug: "reviews", icon: "⭐", description: "Product Reviews" },
  { name: "Startups", slug: "startups", icon: "🚀", description: "Startup Ecosystem" },
];

interface NavbarProps {
  onSearchOpen: () => void;
}

const Navbar = ({ onSearchOpen }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState(defaultCategories);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    Promise.all([
      supabase.from("categories").select("name, slug, icon, description"),
      supabase.from("posts").select("title, slug, categories(name)").eq("published", true).eq("trending", true).limit(3),
    ]).then(([catsRes, postsRes]) => {
      if (catsRes.data && catsRes.data.length > 0) setDbCategories(catsRes.data as any);
      if (postsRes.data) setTrendingPosts(postsRes.data);
    });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Yeszz" className="h-8 w-8" />
          <span className="text-xl font-black tracking-tighter text-gradient">Yeszz</span>
          <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-widest text-muted-foreground border border-border rounded px-1.5 py-0.5">Tech</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          <Link to="/" className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg ${isActive("/") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
            Home
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-lg ${catOpen || location.pathname.startsWith("/category") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              Categories
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[600px] rounded-2xl border border-border bg-background shadow-lg z-50 overflow-hidden"
                >
                  <div className="grid grid-cols-5 gap-0">
                    <div className="col-span-3 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 px-2">Browse Topics</p>
                      <div className="grid grid-cols-2 gap-1">
                        {dbCategories.map((cat) => (
                          <Link
                            key={cat.slug}
                            to={`/category/${cat.slug}`}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors group ${location.pathname === `/category/${cat.slug}` ? "bg-primary/10 text-primary" : "hover:bg-secondary"}`}
                          >
                            <span className="text-xl w-8 h-8 flex items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">{cat.icon}</span>
                            <div className="min-w-0">
                              <span className="text-sm font-semibold text-foreground block">{cat.name}</span>
                              <span className="text-[11px] text-muted-foreground truncate block">{cat.description || ""}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 px-2">
                        <Link to="/categories" className="text-xs font-semibold text-primary hover:underline">
                          View all categories →
                        </Link>
                      </div>
                    </div>
                    <div className="col-span-2 bg-secondary/30 p-4 border-l border-border">
                      <div className="flex items-center gap-1.5 mb-3">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Trending</p>
                      </div>
                      <div className="space-y-2">
                        {trendingPosts.map((post) => (
                          <Link key={post.slug} to={`/post/${post.slug}`} className="block rounded-lg p-2.5 hover:bg-background transition-colors group">
                            <p className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">{post.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{post.categories?.name || "General"}</p>
                          </Link>
                        ))}
                        {trendingPosts.length === 0 && <p className="text-xs text-muted-foreground">No trending posts yet</p>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.slice(1).map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg ${isActive(link.to) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onSearchOpen}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Search...</span>
            <kbd className="hidden sm:inline-flex items-center rounded border border-border px-1 text-[9px] font-mono">⌘K</kbd>
          </button>

          {user && (
            <>
              <Link
                to="/creator/write"
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Write"
              >
                <PenTool className="h-5 w-5" />
              </Link>
              <Link to="/bookmarks" className="p-2 rounded-lg hover:bg-secondary transition-colors hidden sm:flex" aria-label="Bookmarks">
                <Bookmark className="h-4 w-4" />
              </Link>
            </>
          )}

          {user ? (
            <div className="hidden sm:flex items-center gap-0.5">
              <Link to="/profile" className="p-2 rounded-lg hover:bg-secondary transition-all">
                <User className="h-4 w-4" />
              </Link>
              <button onClick={() => signOut()} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="hidden sm:inline-flex rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all">
              Sign In
            </Link>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden"
          >
            <nav className="container py-3 flex flex-col gap-0.5">
              <Link to="/" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive("/") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>Home</Link>

              <button
                onClick={() => setMobileCatOpen(!mobileCatOpen)}
                className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
              >
                Categories
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileCatOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {mobileCatOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-2 gap-1 px-2 py-2">
                      {dbCategories.map((cat) => (
                        <Link key={cat.slug} to={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors ${location.pathname === `/category/${cat.slug}` ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                          <span className="text-base">{cat.icon}</span>
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                    <Link to="/categories" onClick={() => setMobileOpen(false)} className="block px-5 py-2 text-xs font-semibold text-primary">
                      View All →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {navLinks.slice(1).map((link) => (
                <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(link.to) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link to="/creator/write" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">Write</Link>
                  <Link to="/bookmarks" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">Bookmarks</Link>
                </>
              )}
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">Profile</Link>
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-left px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-lg transition-colors">Sign Out</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-semibold text-primary">Sign In</Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
