import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { loadProducts } from "@/lib/supabaseProducts";
import type { Product } from "@/lib/supabaseProducts";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const isImageUrl = (v?: string) => {
    if (!v || v.trim() === "") return false;
    return v.startsWith("data:image/") || v.startsWith("http://") || v.startsWith("https://");
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await loadProducts();
      setProducts(data);
      setLoading(false);
    })();
  }, []);

  const filtered = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);
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
            {displayed.map((product, i) => {
              const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : product.images;
              return (
                <motion.div key={product.id} variants={fadeUp} custom={i}>
                  <Card className="group h-full border-border/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6 text-center">
                      <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl border border-border/40">
                        {isImageUrl(images.find(v => v.trim() !== "")) ? (
                          <img src={images.find(v => v.trim() !== "")} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-accent text-sm text-muted-foreground">
                            No image
                          </div>
                        )}

                        <div className="absolute inset-0 translate-y-full bg-pink-500/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          {product.in_stock ? (
                            <Button asChild size="sm" className="rounded-full">
                              <Link to={`/product/${product.id}`}>
                                <ShoppingBag className="mr-2 h-4 w-4" /> View
                              </Link>
                            </Button>
                          ) : (
                            <Button size="sm" disabled className="rounded-full">
                              Out of Stock
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3 text-left">
                        <div className="min-w-0">
                          <div className="font-display text-sm font-semibold text-foreground line-clamp-1">{product.name}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{product.category}</div>
                        </div>
                        <div className="shrink-0 text-lg font-medium text-primary">PKR {product.price}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Catalog;
