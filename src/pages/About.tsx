import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap, Users, Globe, Shield, Code, Award, Mail, ArrowRight, Sparkles,
  DollarSign, BarChart3, Instagram, Youtube, CheckCircle, Megaphone,
  Target, Star, Heart, Eye, MessageSquare, TrendingUp, MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";

const values = [
  { icon: Zap, title: "Innovation First", desc: "We cover the bleeding edge so you're always ahead of the curve." },
  { icon: Shield, title: "Trusted Content", desc: "Every article is fact-checked and reviewed by industry experts." },
  { icon: Code, title: "Developer Focused", desc: "Real tutorials, real code — no fluff, just what works." },
  { icon: Users, title: "Community Driven", desc: "Built by tech enthusiasts, for tech enthusiasts worldwide." },
  { icon: Globe, title: "Global Reach", desc: "Covering tech stories from Silicon Valley to Bangalore and beyond." },
  { icon: Award, title: "Quality First", desc: "We'd rather publish less but ensure every piece adds real value." },
];

const creatorFeatures = [
  { icon: Sparkles, title: "AI Writing Assistant", desc: "Get AI-powered suggestions, outlines, and content generation to speed up your workflow." },
  { icon: DollarSign, title: "Revenue Share", desc: "Earn money from your articles through our fair revenue share model." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track views, engagement, earnings, and audience growth in real-time." },
  { icon: Users, title: "Build Your Audience", desc: "Gain followers, receive tips, and grow your personal brand with us." },
];

const platforms = [
  {
    icon: Instagram, name: "Instagram", bgColor: "bg-pink-500/10", textColor: "text-pink-500",
    features: ["Sponsored Reels & Stories", "Brand collaboration posts", "Product placement & reviews", "Affiliate link integration", "Analytics & reach reports"],
  },
  {
    icon: Youtube, name: "YouTube", bgColor: "bg-red-500/10", textColor: "text-red-500",
    features: ["Sponsored video integrations", "Dedicated review videos", "Pre-roll & mid-roll spots", "Channel sponsorship deals", "Performance analytics"],
  },
  {
    icon: Globe, name: "Blog & Website", bgColor: "bg-primary/10", textColor: "text-primary",
    features: ["Sponsored articles & guides", "Banner ad placements", "Affiliate content creation", "SEO-optimized reviews", "Newsletter sponsorships"],
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

const About = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main>
        {/* Hero */}
        <section className="py-20 relative overflow-hidden">
          <div className="container relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Based in India 🇮🇳</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">About <span className="text-gradient">Yeszz</span></h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                We're a team of passionate Indian technologists, developers, and writers on a mission to make technology accessible, understandable, and exciting for everyone — from Bangalore to the world.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16">
          <div className="container max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Yeszz was born in India from a simple idea: tech content shouldn't be gatekept behind jargon and complexity. We started in 2024 as a small blog and have grown into a trusted source for hundreds of thousands of readers across the subcontinent and beyond.</p>
                <p>We cover everything from AI breakthroughs to UPI innovations, from startup culture in Bangalore and Hyderabad to in-depth programming tutorials. Our goal is to help you stay informed, learn new skills, and make better decisions about the technology shaping India's digital future.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16">
          <div className="container">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl font-bold mb-8 text-center">What We Stand For</motion.h2>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((v) => (
                <motion.div key={v.title} variants={item} className="p-6 group">
                  <v.icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { num: "500K+", label: "Monthly Readers" },
                { num: "2,000+", label: "Articles Published" },
                { num: "50+", label: "Contributors" },
                { num: "16", label: "Categories" },
              ].map((s) => (
                <div key={s.label} className="p-6">
                  <div className="text-3xl font-black text-gradient mb-1">{s.num}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Creator Services */}
        <section className="py-16">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
              <h2 className="text-3xl font-black mb-3">Creator Services</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">Join our creator program to write, earn, and grow your audience.</p>
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {creatorFeatures.map((f) => (
                <motion.div key={f.title} variants={item} className="p-6 group text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
            <div className="text-center">
              <Link to="/creator/services" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all">
                Explore Creator Services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Sponsorship */}
        <section id="sponsorship" className="py-20">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
                <Megaphone className="h-4 w-4" />
                Brand Partnerships
              </motion.div>
              <h2 className="text-3xl font-black mb-3">Amplify Your Brand with Creator Sponsorships</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Partner with Yeszz's network of Indian tech influencers.</p>
            </motion.div>

            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {insights.map((stat) => (
                <motion.div key={stat.label} variants={item} className="p-6 text-center group">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-black text-gradient mb-1">{stat.value}</div>
                  <div className="text-sm font-semibold mb-0.5">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.desc}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
              <h3 className="text-2xl font-black mb-2">Multi-Platform Sponsorships</h3>
              <p className="text-muted-foreground">Reach your target audience wherever they consume tech content</p>
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6 mb-16">
              {platforms.map((platform) => (
                <motion.div key={platform.name} variants={item} whileHover={{ y: -4 }} className="p-8 group">
                  <div className={`w-14 h-14 rounded-2xl ${platform.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <platform.icon className={`h-7 w-7 ${platform.textColor}`} />
                  </div>
                  <h4 className="text-xl font-bold mb-4">{platform.name}</h4>
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

            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
              <h3 className="text-2xl font-black mb-2">How It Works</h3>
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {howItWorks.map((step) => (
                <motion.div key={step.step} variants={item} className="text-center relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 relative">
                    <step.icon className="h-7 w-7 text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{step.step}</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
              <h3 className="text-2xl font-black mb-2">Why Partner with Yeszz?</h3>
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
              {benefits.map((b) => (
                <motion.div key={b.title} variants={item} whileHover={{ scale: 1.02 }} className="p-6 group">
                  <b.icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold mb-1">{b.title}</h4>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </motion.div>
              ))}
            </motion.div>
            <div className="text-center">
              <Link to="/contact" className="hover-scale inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all">
                <Megaphone className="h-4 w-4" /> Start a Campaign
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16">
          <div className="container max-w-2xl text-center">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-3xl font-black mb-3">Stay in the Loop</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Get the best tech stories delivered to your inbox every week.</p>
              <Link to="/newsletter" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all">
                Subscribe to Newsletter <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
