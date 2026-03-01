import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Instagram, Youtube, Globe, TrendingUp, Users, BarChart3,
  DollarSign, Sparkles, Shield, ArrowRight, CheckCircle, Star,
  Megaphone, Target, Zap, Heart, Eye, MessageSquare
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";

const platforms = [
  {
    icon: Instagram,
    name: "Instagram",
    color: "from-pink-500 to-purple-600",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-500",
    features: [
      "Sponsored Reels & Stories",
      "Brand collaboration posts",
      "Product placement & reviews",
      "Affiliate link integration",
      "Analytics & reach reports",
    ],
  },
  {
    icon: Youtube,
    name: "YouTube",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500/10",
    textColor: "text-red-500",
    features: [
      "Sponsored video integrations",
      "Dedicated review videos",
      "Pre-roll & mid-roll spots",
      "Channel sponsorship deals",
      "Performance analytics",
    ],
  },
  {
    icon: Globe,
    name: "Blog & Website",
    color: "from-primary to-accent",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    features: [
      "Sponsored articles & guides",
      "Banner ad placements",
      "Affiliate content creation",
      "SEO-optimized reviews",
      "Newsletter sponsorships",
    ],
  },
];

const insights = [
  { icon: Eye, value: "10M+", label: "Monthly Impressions", desc: "Across all creator channels" },
  { icon: Users, value: "500K+", label: "Combined Audience", desc: "Engaged tech followers" },
  { icon: MessageSquare, value: "8.5%", label: "Avg Engagement Rate", desc: "3x industry average" },
  { icon: TrendingUp, value: "92%", label: "Brand Satisfaction", desc: "Repeat partnership rate" },
];

const howItWorks = [
  { step: "01", icon: Target, title: "Match with Creators", desc: "We pair your brand with creators whose audience aligns perfectly with your target market." },
  { step: "02", icon: Megaphone, title: "Campaign Design", desc: "Our team crafts a multi-platform campaign strategy tailored to your goals and budget." },
  { step: "03", icon: Sparkles, title: "Content Creation", desc: "Creators produce authentic, engaging content that resonates with their audience." },
  { step: "04", icon: BarChart3, title: "Measure & Optimize", desc: "Real-time analytics dashboard to track ROI, engagement, and conversions." },
];

const benefits = [
  { icon: Shield, title: "Brand Safety", desc: "Vetted creators with authentic audiences. No bots, no fake engagement." },
  { icon: DollarSign, title: "Transparent Pricing", desc: "Clear rate cards with no hidden fees. Pay for performance, not promises." },
  { icon: Star, title: "Premium Creators", desc: "Work with top tech influencers who have built trust with their communities." },
  { icon: Heart, title: "Authentic Content", desc: "Genuine reviews and recommendations that audiences actually trust." },
];

const Sponsorship = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main>
        {/* Hero */}
        <section className="bg-hero text-primary-foreground py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(hsl(151 72% 40%) 1px, transparent 1px), linear-gradient(90deg, hsl(151 72% 40%) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/8 blur-[150px]" />
          <div className="container relative text-center max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6"
              >
                <Megaphone className="h-4 w-4" />
                Brand Partnerships
              </motion.div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-6">
                Amplify Your Brand with
                <br />
                <span className="text-gradient">Creator Sponsorships</span>
              </h1>
              <p className="text-lg opacity-70 max-w-xl mx-auto leading-relaxed mb-8">
                Partner with Yeszz's network of tech influencers on Instagram, YouTube, and beyond. Reach millions of engaged tech enthusiasts authentically.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                <Link to="/contact" className="hover-scale inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all">
                  Start a Campaign <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#platforms" className="hover-scale inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-7 py-3.5 text-sm font-semibold hover:bg-primary/10 transition-all">
                  View Platforms
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Content Insights */}
        <section className="py-16 border-b border-border">
          <div className="container">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {insights.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={item}
                  className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-all text-center group"
                >
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-black text-gradient mb-1">{stat.value}</div>
                  <div className="text-sm font-semibold mb-0.5">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Platforms */}
        <section id="platforms" className="py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-black mb-3">Multi-Platform Sponsorships</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">Reach your target audience wherever they consume tech content</p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              {platforms.map((platform) => (
                <motion.div
                  key={platform.name}
                  variants={item}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-border bg-card p-8 shadow-card hover:shadow-card-hover transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${platform.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <platform.icon className={`h-7 w-7 ${platform.textColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{platform.name}</h3>
                  <ul className="space-y-3">
                    {platform.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 border-t border-border">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-black mb-3">How It Works</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">From brand match to campaign delivery in four simple steps</p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {howItWorks.map((step, i) => (
                <motion.div
                  key={step.step}
                  variants={item}
                  className="text-center relative"
                >
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-border" />
                  )}
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 relative">
                    <step.icon className="h-7 w-7 text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 border-t border-border">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-black mb-3">Why Partner with Yeszz?</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">We're not just a platform — we're your growth partner</p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto"
            >
              {benefits.map((b) => (
                <motion.div
                  key={b.title}
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all group"
                >
                  <b.icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-border">
          <div className="container text-center max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-black mb-4">Ready to Grow Your Brand?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join 100+ brands already leveraging our creator network. Let's build your next successful campaign together.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/contact" className="hover-scale inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all">
                  <Megaphone className="h-4 w-4" /> Get Started
                </Link>
                <Link to="/about" className="hover-scale inline-flex items-center gap-2 rounded-lg border border-border px-7 py-3.5 text-sm font-medium hover:bg-secondary transition-all">
                  Learn More About Us
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Sponsorship;
