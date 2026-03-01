import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface CategoriesSectionProps {
  categories: any[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

const CategoriesSection = ({ categories }: CategoriesSectionProps) => {
  if (categories.length === 0) return null;

  return (
    <section id="categories" className="py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-1.5 h-8 rounded-full bg-primary" />
          <h2 className="text-2xl font-bold">Browse Categories</h2>
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={item}>
              <Link
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-6 hover:-translate-y-1 transition-all duration-300"
              >
                <motion.span
                  className="text-3xl"
                  whileHover={{
                    scale: 1.3,
                    rotate: [0, -15, 15, 0],
                    transition: { duration: 0.4 },
                  }}
                >
                  {cat.icon}
                </motion.span>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;
