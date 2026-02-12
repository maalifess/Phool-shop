import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { loadProducts } from "@/lib/products";

const categories = ["All", "Cards", "Amigurumi", "Blankets", "Accessories", "Garlands"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Catalog = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState("default");

  const all = loadProducts();
  const filtered = activeCategory === "All" ? all : all.filter((p) => p.category === activeCategory);
  const displayed = (() => {
    const copy = [...filtered];
    if (sort === "price-asc") return copy.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return copy.sort((a, b) => b.price - a.price);
    return copy;
  })();

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

          {/* Category filter + sort */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="ml-2 rounded-md border bg-background px-3 py-2 text-sm">
              <option value="default">Sort</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          {/* Products grid */}
            <motion.div
            key={activeCategory}
            initial="hidden"
            animate="visible"
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {displayed.map((product, i) => (
              <motion.div key={product.id} variants={fadeUp} custom={i}>
                <Card className="group h-full border-border/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col p-6 text-center">
                    <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl bg-accent text-5xl transition-transform duration-300 group-hover:scale-110">
                      {product.images?.[0]}
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-foreground">{product.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
                      {/* removed average hearts per user request */}
                    <p className="mt-2 text-lg font-medium text-primary">PKR {product.price}</p>
                    <div className="mt-auto pt-4">
                      {product.inStock ? (
                        <Button asChild size="sm" className="w-full rounded-full">
                          <Link to={`/product/${product.id}`}>
                            <ShoppingBag className="mr-2 h-4 w-4" /> View
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
