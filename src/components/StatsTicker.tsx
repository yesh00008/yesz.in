import { motion } from "framer-motion";

interface StatItem {
  value: string;
  label: string;
  icon: string;
}

const stats: StatItem[] = [
  { value: "500K+", label: "Readers", icon: "👥" },
  { value: "2,000+", label: "Articles", icon: "📝" },
  { value: "50+", label: "Contributors", icon: "✍️" },
  { value: "6", label: "Categories", icon: "📂" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 15 },
  },
};

const StatsTicker = () => {
  return (
    <section className="py-8 overflow-hidden">
      <div className="container">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={item}
              whileHover={{ scale: 1.05, y: -4 }}
              className="flex flex-col items-center gap-2 p-4 transition-all duration-300 cursor-default"
            >
              <motion.span
                className="text-2xl"
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {stat.icon}
              </motion.span>
              <span className="text-2xl md:text-3xl font-black text-gradient">{stat.value}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsTicker;
