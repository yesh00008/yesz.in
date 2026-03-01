import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Zap, BookOpen, Bell } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const perks = [
  { icon: Zap, title: "Weekly Digest", desc: "Get the top stories curated and delivered every Monday morning." },
  { icon: BookOpen, title: "Exclusive Content", desc: "Subscriber-only deep dives, analysis, and early access to reviews." },
  { icon: Bell, title: "Breaking News", desc: "Be first to know about major tech announcements and security alerts." },
];

const Newsletter = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim() });
    if (error) {
      if (error.code === "23505") toast.info("You're already subscribed!");
      else toast.error("Failed to subscribe. Try again.");
    } else {
      setSubscribed(true);
      toast.success("Welcome to the Yeszz newsletter!");
    }
    setLoading(false);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main>
        <section className="bg-hero text-primary-foreground py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(hsl(151 72% 40%) 1px, transparent 1px), linear-gradient(90deg, hsl(151 72% 40%) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="container relative text-center max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Mail className="h-3.5 w-3.5" />
                Free Newsletter
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">Stay Ahead of the <span className="text-gradient">Tech Curve</span></h1>
              <p className="text-lg opacity-70 leading-relaxed mb-8">
                Join 50,000+ developers, founders, and tech enthusiasts who get our weekly digest of the most important tech stories.
              </p>

              {subscribed ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-8 py-4 text-lg font-semibold">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  You're subscribed! Check your inbox.
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="flex-1 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm outline-none focus:border-primary/50 placeholder:opacity-50 transition-all"
                  />
                  <button type="submit" disabled={loading} className="hover-scale rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all disabled:opacity-50">
                    {loading ? "Subscribing..." : "Subscribe Free"}
                  </button>
                </form>
              )}
              <p className="text-xs opacity-40 mt-3">No spam, unsubscribe anytime. We respect your privacy.</p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold mb-8 text-center">What You'll Get</h2>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-3 gap-5">
              {perks.map((p) => (
                <motion.div key={p.title} variants={item} className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 text-center group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <p.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Newsletter;
