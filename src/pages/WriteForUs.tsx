import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Send, CheckCircle, Users, Lightbulb, PenTool } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import { toast } from "sonner";

const guidelines = [
  { icon: BookOpen, title: "Original Content", desc: "All submissions must be original, unpublished work. We don't accept reposted or AI-generated content." },
  { icon: Lightbulb, title: "Tech Focused", desc: "Topics should relate to AI, programming, cybersecurity, gadgets, startups, or tech reviews." },
  { icon: PenTool, title: "Well Written", desc: "Clear, engaging prose with proper grammar. Code examples should be tested and functional." },
  { icon: Users, title: "Reader Value", desc: "Every article should teach something new or provide a fresh perspective on existing topics." },
];

const WriteForUs = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "", pitch: "", portfolio: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Pitch submitted! We'll review it within 48 hours.");
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
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
        <section className="bg-hero text-primary-foreground py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(hsl(151 72% 40%) 1px, transparent 1px), linear-gradient(90deg, hsl(151 72% 40%) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
          <div className="container relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">Write for <span className="text-gradient">Yeszz</span></h1>
              <p className="text-lg opacity-70 max-w-xl leading-relaxed">
                Share your expertise with our growing community of 500K+ monthly readers. We pay competitive rates for quality content.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8">Submission Guidelines</h2>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              {guidelines.map((g) => (
                <motion.div key={g.title} variants={item} className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 group">
                  <g.icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-1">{g.title}</h3>
                  <p className="text-sm text-muted-foreground">{g.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Submit Your Pitch</h2>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-primary/30 bg-primary/5 p-10 text-center"
                >
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Pitch Received!</h3>
                  <p className="text-muted-foreground">We'll review your submission and get back to you within 48 hours.</p>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onSubmit={handleSubmit}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Name</label>
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Topic / Title</label>
                    <input type="text" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required placeholder="e.g. How to Build AI Agents with LangChain" className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Pitch (200-500 words)</label>
                    <textarea value={form.pitch} onChange={(e) => setForm({ ...form, pitch: e.target.value })} required rows={6} placeholder="Describe what you'll cover, why it matters, and your unique angle..." className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Portfolio / Previous Work (optional)</label>
                    <input type="url" value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} placeholder="https://..." className="w-full rounded-lg border border-input bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all">
                    <Send className="h-4 w-4" /> Submit Pitch
                  </button>
                </motion.form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WriteForUs;
