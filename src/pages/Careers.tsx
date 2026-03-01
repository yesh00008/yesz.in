import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Briefcase, MapPin, Users, Heart, Zap, Globe, ArrowRight,
  Camera, Video, PenTool, BarChart3, Megaphone, Code, Sparkles
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";

const perks = [
  { icon: Heart, title: "Health Benefits", desc: "Comprehensive health insurance for you and your family" },
  { icon: Zap, title: "Flexible Hours", desc: "Work when you're most productive — we trust you" },
  { icon: Globe, title: "Remote First", desc: "Work from anywhere in India — Bangalore, Mumbai, Delhi, or your hometown" },
  { icon: Users, title: "Great Team", desc: "Collaborate with passionate techies who love what they do" },
  { icon: Sparkles, title: "Learning Budget", desc: "₹50,000 annual budget for courses, conferences, and books" },
  { icon: BarChart3, title: "Growth Path", desc: "Clear career progression with regular performance reviews" },
];

const openings = [
  { title: "Social Media Manager", icon: Camera, team: "Marketing", location: "Remote (India)", type: "Full-time", desc: "Manage our Instagram, Twitter/X, and LinkedIn presence." },
  { title: "YouTube Content Creator", icon: Video, team: "Content", location: "Bangalore / Remote", type: "Full-time", desc: "Script, shoot, and edit engaging tech review videos." },
  { title: "Tech Content Writer", icon: PenTool, team: "Editorial", location: "Remote (India)", type: "Full-time / Freelance", desc: "Write in-depth articles, tutorials, and reviews." },
  { title: "Content Creator — Instagram Reels", icon: Camera, team: "Social Media", location: "Mumbai / Remote", type: "Full-time", desc: "Create short-form viral tech content." },
  { title: "Full Stack Developer", icon: Code, team: "Engineering", location: "Bangalore / Remote", type: "Full-time", desc: "Build and maintain our platform using React, TypeScript." },
  { title: "Influencer Partnerships Manager", icon: Megaphone, team: "Business", location: "Delhi NCR / Remote", type: "Full-time", desc: "Build relationships with Indian tech influencers." },
];

const Careers = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main>
        <section className="py-24 relative overflow-hidden">
          <div className="container relative text-center max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
                <Briefcase className="h-4 w-4" />
                We're Hiring 🇮🇳
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Build the Future of <span className="text-gradient">Tech Media</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Join India's fastest-growing tech media platform.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl font-black text-center mb-8">Why Work at Yeszz?</motion.h2>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {perks.map((p) => (
                <motion.div key={p.title} variants={item} className="p-6 group">
                  <p.icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-black mb-3">Open Positions</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">Find a role that matches your passion.</p>
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-4 max-w-3xl mx-auto">
              {openings.map((job) => (
                <motion.div key={job.title} variants={item} whileHover={{ x: 4 }} className="p-6 group">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <job.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          <Briefcase className="h-3 w-3" /> {job.team}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{job.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{job.desc}</p>
                    </div>
                    <Link to="/contact" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline shrink-0 mt-2 sm:mt-0">
                      Apply <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container text-center max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-black mb-3">Don't See Your Role?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Send us your profile and we'll keep you in mind.</p>
              <Link to="/contact" className="hover-scale inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all">
                Get in Touch <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
