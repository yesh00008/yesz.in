import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import {
  Zap, Users, Globe, Shield, Code, Award, Mail, ArrowRight, Sparkles,
  DollarSign, BarChart3, Instagram, Youtube, CheckCircle, Megaphone,
  Target, Star, Heart, Eye, MessageSquare, TrendingUp, MapPin,
  Monitor, Smartphone, Palette, Wrench, Cloud, Layers, PenTool,
  Lightbulb, BookOpen, HeadphonesIcon, Rocket, Settings, Database,
  Search, Layout, MousePointerClick, BrainCircuit, FileText, Cpu
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

// ── Our Services ──
const devServices = [
  { icon: Megaphone, title: "Advertising & Ads", desc: "Strategic digital advertising campaigns across platforms to grow your brand reach and conversions.", color: "from-orange-500 to-red-500" },
  { icon: Code, title: "Web Development", desc: "Full-stack website development — from landing pages to complex web applications using modern stacks.", color: "from-blue-500 to-cyan-500" },
  { icon: Smartphone, title: "App Development", desc: "Native and cross-platform mobile apps for iOS and Android that delight users and drive engagement.", color: "from-green-500 to-emerald-500" },
  { icon: Palette, title: "UI/UX Design", desc: "Beautiful, intuitive interfaces crafted with user research, wireframing, prototyping, and design systems.", color: "from-purple-500 to-pink-500" },
  { icon: Monitor, title: "Website Design", desc: "Stunning, responsive website designs that reflect your brand identity and convert visitors into customers.", color: "from-indigo-500 to-violet-500" },
  { icon: Cloud, title: "SaaS Development", desc: "End-to-end SaaS product development — architecture, billing, dashboards, APIs, and scaling strategies.", color: "from-sky-500 to-blue-500" },
  { icon: Wrench, title: "Maintenance & Support", desc: "Ongoing website and app maintenance, performance optimization, security patches, and 24/7 monitoring.", color: "from-amber-500 to-orange-500" },
  { icon: Database, title: "Backend & APIs", desc: "Robust backend systems, REST/GraphQL APIs, database design, and cloud infrastructure management.", color: "from-teal-500 to-green-500" },
  { icon: Search, title: "SEO & Digital Marketing", desc: "Search engine optimization, content marketing, and analytics to boost your online visibility.", color: "from-rose-500 to-pink-500" },
  { icon: Layout, title: "Graphic Design", desc: "Logos, banners, social media creatives, and brand identity design that makes you stand out.", color: "from-fuchsia-500 to-purple-500" },
  { icon: Settings, title: "DevOps & Hosting", desc: "CI/CD pipelines, Docker, cloud hosting setup (AWS/GCP/Azure), and infrastructure automation.", color: "from-slate-500 to-zinc-500" },
  { icon: Layers, title: "Custom Software", desc: "Bespoke software solutions tailored to your business needs — ERP, CRM, dashboards, and more.", color: "from-cyan-500 to-teal-500" },
];

const creatorContentServices = [
  { icon: Lightbulb, title: "Content Suggestions", desc: "AI-powered topic ideas and trending content suggestions tailored to your niche and audience interests." },
  { icon: PenTool, title: "Content Writing Helpers", desc: "Writing tools, grammar checkers, tone adjusters, and style guides to polish your articles to perfection." },
  { icon: BrainCircuit, title: "AI Content Strategy", desc: "Data-driven content calendar planning, keyword research, and audience analysis for maximum reach." },
  { icon: BookOpen, title: "Editorial Review", desc: "Professional editing and fact-checking services to ensure accuracy and quality before publishing." },
  { icon: FileText, title: "Template Library", desc: "Ready-to-use blog templates, article structures, and content frameworks to kickstart your writing." },
  { icon: MousePointerClick, title: "Engagement Analytics", desc: "Deep insights into what content resonates most, with actionable tips to improve reader engagement." },
  { icon: HeadphonesIcon, title: "Creator Support", desc: "Dedicated support team for creators — troubleshooting, onboarding, and personalized growth coaching." },
  { icon: Rocket, title: "Content Promotion", desc: "Amplify your content with featured placements, newsletter inclusions, and social media boosts." },
  { icon: Cpu, title: "AI Thumbnail Generator", desc: "Generate eye-catching thumbnails, cover images, and Open Graph images using AI for every post." },
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

        {/* ═══ OUR SERVICES ═══ */}
        <section className="py-20 relative overflow-hidden">
          {/* Background decorative blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl"
            />
          </div>

          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-5"
              >
                <Rocket className="h-4 w-4" />
                What We Offer
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Our <span className="text-gradient">Services</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                From building world-class websites to crafting SaaS platforms, designing beautiful interfaces, 
                and maintaining your digital products — we've got you covered end to end.
              </p>
            </motion.div>

            {/* Dev Services Grid */}
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10"
            >
              {devServices.map((service, i) => (
                <motion.div
                  key={service.title}
                  variants={item}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 overflow-hidden cursor-pointer"
                >
                  {/* Gradient hover glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`} />
                  
                  <div className={`relative z-10`}>
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <service.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                  </div>

                  {/* Corner accent */}
                  <div className={`absolute -bottom-2 -right-2 w-20 h-20 rounded-full bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110 transition-all hover:gap-3">
                Get a Quote <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ═══ CREATOR & CONTENT SERVICES ═══ */}
        <section className="py-20 relative">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-sm font-semibold text-purple-500 mb-5"
              >
                <Sparkles className="h-4 w-4" />
                For Creators
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Creator & Content <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Services</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                Supercharge your content creation with AI-powered suggestions, writing helpers, editorial support, 
                and everything you need to build a thriving creator career.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
            >
              {creatorContentServices.map((service, i) => (
                <motion.div
                  key={service.title}
                  variants={item}
                  whileHover={{ y: -4 }}
                  className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center"
                    >
                      <service.icon className="h-5 w-5 text-purple-500" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-base mb-1.5 group-hover:text-purple-500 transition-colors">{service.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Cards */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto"
            >
              <motion.div whileHover={{ scale: 1.03 }} className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
                <PenTool className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-bold mb-2">Start Creating</h4>
                <p className="text-xs text-muted-foreground mb-4">Join our creator program and start publishing today.</p>
                <Link to="/creator/write" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all">
                  Write Now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 text-center">
                <HeadphonesIcon className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h4 className="font-bold mb-2">Need Help?</h4>
                <p className="text-xs text-muted-foreground mb-4">Talk to our team about custom content solutions.</p>
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all">
                  Contact Us <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
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
