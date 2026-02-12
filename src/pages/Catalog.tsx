import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const categories = ["All", "Amigurumi", "Blankets", "Accessories", "Garlands"];

const mockProducts = [
  { id: 1, name: "Rose Bouquet Amigurumi", price: 35, category: "Amigurumi", image: "🌹", inStock: true },
  { id: 2, name: "Sunflower Blanket", price: 85, category: "Blankets", image: "🌻", inStock: true },
  { id: 3, name: "Lavender Bear", price: 28, category: "Amigurumi", image: "🧸", inStock: true },
  { id: 4, name: "Daisy Chain Garland", price: 22, category: "Garlands", image: "🌼", inStock: true },
  { id: 5, name: "Cotton Scrunchie Set", price: 12, category: "Accessories", image: "🎀", inStock: true },
  { id: 6, name: "Baby Whale", price: 30, category: "Amigurumi", image: "🐋", inStock: false },
  { id: 7, name: "Rainbow Blanket", price: 95, category: "Blankets", image: "🌈", inStock: true },
  { id: 8, name: "Flower Coasters (Set of 4)", price: 18, category: "Accessories", image: "🌸", inStock: true },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Catalog = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? mockProducts
    : mockProducts.filter((p) => p.category === activeCategory);

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Our Catalog</h1>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Browse our handcrafted collection — each piece made with care.
            </p>
          </motion.div>

          {/* Category filter */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Products grid */}
          <motion.div
            key={activeCategory}
            initial="hidden"
            animate="visible"
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {filtered.map((product, i) => (
              <motion.div key={product.id} variants={fadeUp} custom={i}>
                <Card className="group h-full border-border/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col p-6 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-accent text-4xl transition-transform duration-300 group-hover:scale-110">
                      {product.image}
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-foreground">{product.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
                    <p className="mt-2 text-lg font-medium text-primary">${product.price}</p>
                    <div className="mt-auto pt-4">
                      {product.inStock ? (
                        <Button asChild size="sm" className="w-full rounded-full">
                          <Link to={`/order?product=${product.id}`}>
                            <ShoppingBag className="mr-2 h-4 w-4" /> Order
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" disabled className="w-full rounded-full">
                          Out of Stock
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Catalog;
