import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  DollarSign, TrendingUp, Users, Zap, Shield, BarChart3,
  PenTool, Award, Globe, ArrowRight, Sparkles, Heart
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";

const services = [
  {
    icon: PenTool,
    title: "Publish & Monetize",
    desc: "Write articles, build an audience, and earn revenue through our creator program. We share revenue with every view.",
    highlight: true,
  },
  {
    icon: DollarSign,
    title: "Tips & Donations",
    desc: "Readers can send tips directly to your profile. Keep 85% of every tip — we handle payments and processing.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    desc: "Track views, engagement, read time, and audience growth with our real-time creator dashboard.",
  },
  {
    icon: Sparkles,
    title: "AI Writing Assistant",
    desc: "Generate drafts, improve your writing, auto-create summaries, and get SEO suggestions — powered by AI.",
  },
  {
    icon: Globe,
    title: "Creator Portfolio",
    desc: "Your own public profile page showcasing your published work, bio, and stats. Share it anywhere.",
  },
  {
    icon: Shield,
    title: "Content Protection",
    desc: "Your content is protected. We handle DMCA takedowns and ensure your work stays attributed to you.",
  },
];

const tiers = [
  {
    name: "Starter",
    price: "Free",
    desc: "Perfect for getting started",
    features: ["Unlimited articles", "Basic analytics", "Creator profile", "Community support"],
    cta: "Start Writing",
    highlighted: false,
  },
  {
    name: "Pro Creator",
    price: "$9/mo",
    desc: "For serious content creators",
    features: ["Everything in Starter", "AI Writing Assistant", "Advanced analytics", "Revenue sharing", "Priority support", "Custom portfolio"],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For teams and publications",
    features: ["Everything in Pro", "Team management", "API access", "White-label options", "Dedicated account manager"],
    cta: "Contact Us",
    highlighted: false,
  },
];

const CreatorServices = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main>
        {/* Hero */}
        <section className="bg-hero text-primary-foreground py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(hsl(151 72% 40%) 1px, transparent 1px), linear-gradient(90deg, hsl(151 72% 40%) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
          <div className="container relative text-center max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary mb-6">
                <Zap className="h-3.5 w-3.5" /> Creator Program
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                Turn Your Knowledge Into <span className="text-gradient">Revenue</span>
              </h1>
              <p className="text-lg opacity-70 max-w-xl mx-auto leading-relaxed mb-8">
                Join 50+ creators earning money on Yeszz. Write about tech, grow your audience, and monetize your expertise.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link to="/creator/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all">
                  Start Creating <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#pricing" className="inline-flex items-center gap-2 rounded-lg border border-border/30 px-6 py-3 text-sm font-medium hover:bg-white/5 transition-all">
                  View Pricing
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-3">How It Works</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">Three simple steps to start earning</p>
            </div>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: "01", title: "Create & Publish", desc: "Write articles using our powerful editor with AI assistant. Publish when ready." },
                { step: "02", title: "Grow Your Audience", desc: "Your content reaches 500K+ monthly readers. Build followers and engagement." },
                { step: "03", title: "Earn Revenue", desc: "Earn from views, tips, and premium content. We pay monthly via direct deposit." },
              ].map((s) => (
                <motion.div key={s.step} variants={item} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-black mx-auto mb-4">{s.step}</div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 border-t border-border">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-3">Creator Services</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">Everything you need to succeed as a tech content creator</p>
            </div>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s) => (
                <motion.div key={s.title} variants={item} className={`rounded-xl border bg-card p-6 shadow-card hover:shadow-card-hover transition-all group ${s.highlight ? "border-primary/30 bg-primary/[0.02]" : "border-border"}`}>
                  <s.icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 border-t border-border">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-3">Creator Plans</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">Choose the plan that fits your goals</p>
            </div>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {tiers.map((tier) => (
                <motion.div key={tier.name} variants={item} className={`rounded-2xl border p-6 transition-all ${tier.highlighted ? "border-primary shadow-primary bg-primary/[0.02] scale-105" : "border-border bg-card shadow-card"}`}>
                  {tier.highlighted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground mb-3">
                      <Award className="h-3 w-3" /> Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <div className="mt-2 mb-1">
                    <span className="text-3xl font-black">{tier.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">{tier.desc}</p>
                  <ul className="space-y-2.5 mb-6">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={tier.name === "Enterprise" ? "/contact" : "/creator/dashboard"} className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${tier.highlighted ? "bg-primary text-primary-foreground shadow-primary hover:brightness-110" : "border border-border hover:bg-secondary"}`}>
                    {tier.cta}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-border">
          <div className="container text-center max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-4">Ready to Start Creating?</h2>
              <p className="text-muted-foreground mb-6">Join our growing community of tech writers and start earning today.</p>
              <Link to="/creator/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all">
                <PenTool className="h-4 w-4" /> Get Started Free
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CreatorServices;
