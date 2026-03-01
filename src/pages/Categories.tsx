import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";
import { Link } from "react-router-dom";

const Categories = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-black mb-3">Categories</h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl">
              Explore our curated categories covering every corner of the tech world.
            </p>
          </motion.div>

          <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <motion.div key={cat.id} variants={item}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="group block rounded-xl border border-border bg-card p-8 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-300"
                >
                  <span className="text-4xl mb-4 block group-hover:animate-float">{cat.icon}</span>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{cat.name}</h2>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {categories.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p>Loading categories...</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
