import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subLoading, setSubLoading] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim() });
    if (error) {
      if (error.code === "23505") toast.info("You're already subscribed!");
      else toast.error("Failed to subscribe. Try again.");
    } else {
      toast.success("Subscribed! Welcome to Yeszz.");
      setEmail("");
    }
    setSubLoading(false);
  };

  return (
    <footer className="border-t border-border py-12">
      <div className="container">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8"
        >
          <motion.div variants={item}>
            <span className="text-xl font-black text-gradient">Yeszz</span>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Your daily source for technology news, tutorials, and insights.
            </p>
          </motion.div>
          <motion.div variants={item}>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["AI", "Cybersecurity", "Programming", "Gadgets"].map((c) => (
                <li key={c}>
                  <Link to="/categories" className="hover:text-primary transition-colors inline-flex items-center gap-1 group">
                    {c}
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={item}>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </motion.div>
          <motion.div variants={item}>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-3">Get the latest tech updates in your inbox.</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                disabled={subLoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50"
              >
                {subLoading ? "..." : "Join"}
              </button>
            </form>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="border-t border-border pt-6 text-center text-xs text-muted-foreground"
        >
          © {new Date().getFullYear()} Yeszz. All rights reserved.
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
