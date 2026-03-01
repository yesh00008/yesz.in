import { motion } from "framer-motion";
import { PenTool, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const WriteForUsBanner = () => {
  return (
    <section className="py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: "spring" as const, stiffness: 120 }}
          whileHover={{ scale: 1.01 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring" as const, stiffness: 300 }}
              className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
            >
              <PenTool className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Want to Write for Yeszz?</h3>
              <p className="text-sm text-muted-foreground">Share your expertise with our community of 500K+ readers.</p>
            </div>
          </div>
          <motion.div whileHover={{ x: 4 }} transition={{ type: "spring" as const, stiffness: 300 }}>
            <Link
              to="/write-for-us"
              className="hover-scale inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap"
            >
              Learn More <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WriteForUsBanner;
