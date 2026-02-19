import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Heart, Star } from "lucide-react";
import Layout from "@/components/Layout";
import { loadProducts } from "@/lib/supabaseProducts";
import { loadCards } from "@/lib/supabaseCards";
import type { Product } from "@/lib/supabaseProducts";
import type { Card as SupabaseCard, Review } from "@/lib/supabaseTypes";
import { loadApprovedReviews } from "@/lib/supabaseReviews";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cards, setCards] = useState<SupabaseCard[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const isImageUrl = (v?: string) => {
    if (!v) return false;
    const s = v.trim();
    if (!s) return false;
    return s.startsWith("data:image/") || s.startsWith("http://") || s.startsWith("https://");
  };

  const featuredItems = useMemo(() => {
    const arr: Array<(Product | SupabaseCard) & { kind: "product" | "card" }> = [];
    for (const p of products) arr.push({ ...p, kind: "product" });
    for (const c of cards) arr.push({ ...c, kind: "card" });
    return arr;
  }, [products, cards]);

  const activeFeatured = featuredItems.length ? featuredItems[featuredIndex % featuredItems.length] : null;

  useEffect(() => {
    (async () => {
      setFeaturedLoading(true);
      const [p, c] = await Promise.all([loadProducts(), loadCards()]);
      setProducts(p);
      setCards(c);
      setFeaturedLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (featuredLoading) return;
    if (featuredItems.length <= 1) return;
    const t = window.setInterval(() => {
      setFeaturedIndex((i) => (i + 1) % featuredItems.length);
    }, 2600);
    return () => window.clearInterval(t);
  }, [featuredLoading, featuredItems.length]);

  useEffect(() => {
    (async () => {
      setReviewsLoading(true);
      const next = await loadApprovedReviews();
      setReviews(next);
      setReviewsLoading(false);
    })();
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary py-24 md:py-36">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6">
              <div className="mx-auto mb-4 inline-block text-center">
                <div className="text-5xl md:text-7xl" style={{ fontFamily: '"Great Vibes", cursive' }}>
                  <span className="">Phool </span><span className="text-primary">Shop</span>
                </div>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-center relative z-20"
          >
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              Handcrafted with Love
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Beautiful crochet creations made by hand, one stitch at a time.
              From amigurumi to blankets, each piece tells a story.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="rounded-full px-8 text-base">
                <Link to="/catalog">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-base">
                <Link to="/custom-orders">
                  <Sparkles className="mr-2 h-4 w-4" /> Custom Orders
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
        {/* Background slideshow */}
        <div className="hero-slideshow">
          <div className="hero-slide hero-slide--one" />
          <div className="hero-slide hero-slide--two" />
          <div className="hero-slide hero-slide--three" />
        </div>
        {/* Decorative gradient orb */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl" />
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-display text-3xl font-bold text-foreground md:text-4xl"
            >
              Featured Creations
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-4 max-w-lg text-muted-foreground"
            >
              A few of our most loved pieces — each one handmade with care.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mt-14"
          >
            {featuredLoading ? (
              <div className="text-center text-muted-foreground">Loading featured creations...</div>
            ) : featuredItems.length === 0 ? (
              <div className="text-center text-muted-foreground">No products available yet.</div>
            ) : (
              <div className="mx-auto max-w-4xl">
                <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-background">
                  <motion.div
                    key={`${activeFeatured?.kind ?? ""}-${activeFeatured?.id ?? ""}`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="grid gap-8 p-8 md:grid-cols-2 md:p-10"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-accent">
                      {(() => {
                        const img = (activeFeatured?.images || []).find((v) => (v || "").trim() !== "") || "";
                        return isImageUrl(img) ? (
                          <img src={img} alt={activeFeatured?.name ?? ""} className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                            No image
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex flex-col justify-center">
                      <div className="text-xs font-medium text-muted-foreground">
                        {activeFeatured?.kind === "card" ? "Card" : "Product"}
                      </div>
                      <h3 className="mt-2 font-display text-3xl font-bold leading-tight text-foreground">
                        {activeFeatured?.name}
                      </h3>
                      <div className="mt-4 text-2xl font-semibold text-primary">PKR {activeFeatured?.price}</div>
                      <p className="mt-4 line-clamp-3 text-muted-foreground">
                        {activeFeatured?.description || ""}
                      </p>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <Button asChild className="rounded-full px-7">
                          <Link to={`/product/${activeFeatured?.id}`}>View</Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setFeaturedIndex((i) => (i - 1 + featuredItems.length) % featuredItems.length)}
                        >
                          Prev
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setFeaturedIndex((i) => (i + 1) % featuredItems.length)}
                        >
                          Next
                        </Button>
                      </div>

                      <div className="mt-6 flex items-center gap-2">
                        {featuredItems.slice(0, Math.min(8, featuredItems.length)).map((it, idx) => (
                          <button
                            key={`${it.kind}-${it.id}`}
                            type="button"
                            aria-label={`Go to item ${idx + 1}`}
                            onClick={() => setFeaturedIndex(idx)}
                            className={`h-2.5 w-2.5 rounded-full transition-colors ${idx === (featuredIndex % featuredItems.length) ? "bg-primary" : "bg-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>

          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="rounded-full px-8">
              <Link to="/catalog">View All Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-secondary py-20 md:py-28">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Heart className="mx-auto h-10 w-10 text-primary" />
            </motion.div>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-6 font-display text-3xl font-bold text-foreground md:text-4xl"
            >
              About Phool Shop
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 text-lg leading-relaxed text-muted-foreground"
            >
              Phool means "flower" — and just like flowers, every crochet piece we create blossoms with intention and beauty.
              We believe in slow craft, sustainability, and the joy of handmade gifts that last a lifetime.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-display text-3xl font-bold text-foreground md:text-4xl"
          >
            What Our Customers Say
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mt-14 grid gap-6 md:grid-cols-3"
          >
            {reviewsLoading ? (
              <div className="col-span-full text-center text-muted-foreground">Loading customer reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground">No reviews yet.</div>
            ) : (
              reviews.slice(0, 6).map((r, i) => (
                <motion.div key={r.id} variants={fadeUp} custom={i + 1}>
                  <Card className="h-full border-border/40">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="flex gap-0.5">
                        {Array.from({ length: Math.max(1, Math.min(5, r.rating)) }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                        "{r.comment}"
                      </p>
                      <p className="mt-4 text-sm font-semibold text-foreground">— {r.name}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
