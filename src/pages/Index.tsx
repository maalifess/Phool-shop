import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Heart, Star } from "lucide-react";
import Layout from "@/components/Layout";
import { loadProducts } from "@/lib/supabaseProducts";
import { loadCards } from "@/lib/supabaseCards";
import type { Product } from "@/lib/supabaseProducts";
import type { Card as SupabaseCard, Review } from "@/lib/supabaseTypes";
import { loadApprovedReviews } from "@/lib/supabaseReviews";

// Fairy Light component
const FairyLight = ({ delay, color, style }: { delay: number; color: string; style?: React.CSSProperties }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.3, 1, 0.3], 
      scale: [0.8, 1.2, 0.8]
    }}
    transition={{ 
      delay,
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }}
    className={`absolute w-2 h-2 rounded-full ${color} shadow-lg`}
    style={{
      boxShadow: `0 0 10px ${color.replace('bg-', '').replace('500', '300')}, 0 0 20px ${color.replace('bg-', '').replace('500', '200')}`,
      ...style
    }}
  />
);

// Polaroid component
const Polaroid = ({ product, delay, rotate, style }: { product: Product; delay: number; rotate: number; style?: React.CSSProperties }) => {
  const images = Array.isArray(product.images) ? product.images : 
    typeof product.images === 'string' ? (() => { try { return JSON.parse(product.images || '[]'); } catch { return []; } })() : [];
  const img = images.find((v: any) => v && v.trim() !== "") || "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rotate }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        rotate: rotate + Math.sin(Date.now() / 1000 + delay) * 2,
        x: [0, 2, -2, 0]
      }}
      transition={{ 
        delay, 
        duration: 0.6, 
        ease: "easeOut",
        x: {
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay + 0.5
        }
      }}
      className="relative bg-white p-3 shadow-xl hover:shadow-2xl transition-shadow duration-300"
      style={{ 
        width: "200px",
        zIndex: Math.floor(delay * 10),
        ...style
      }}
    >
      <div className="aspect-square mb-2 overflow-hidden bg-gray-100">
        {img ? (
          <img 
            src={img} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10" />
        )}
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-gray-800 line-clamp-2">{product.name}</p>
        <p className="text-xs text-primary font-bold mt-1">PKR {product.price}</p>
      </div>
    </motion.div>
  );
};

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

  const polaroidProducts = useMemo(() => {
    // Select first 6 products for polaroid display
    return products.slice(0, 6);
  }, [products]);

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
      <section className="relative overflow-hidden bg-secondary py-2 md:py-4 pb-64">
        <div className="absolute inset-0">
          <div className="hero-slideshow" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <div className="container relative z-10">
          <div className="flex items-center justify-center relative">
            {/* Left Polaroids with Fairy Lights */}
            <div className="absolute left-0 top-0 hidden lg:block">
              <div className="relative">
                {/* Fairy lights string */}
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <FairyLight 
                      key={`left-light-${i}`} 
                      delay={i * 0.3} 
                      color={i % 2 === 0 ? "bg-yellow-400" : "bg-pink-400"}
                      style={{
                        position: 'absolute',
                        left: `${20 + (i % 3) * 60}px`,
                        top: `${i * 40}px`
                      }}
                    />
                  ))}
                </div>
                
                {/* Overlapping polaroids */}
                <div className="relative" style={{ width: "250px", height: "500px" }}>
                  <Polaroid product={polaroidProducts[0]} delay={0.1} rotate={-8} style={{ position: 'absolute', left: '0px', top: '30px' }} />
                  <Polaroid product={polaroidProducts[1]} delay={0.3} rotate={5} style={{ position: 'absolute', left: '60px', top: '160px' }} />
                  <Polaroid product={polaroidProducts[2]} delay={0.5} rotate={-3} style={{ position: 'absolute', left: '20px', top: '310px' }} />
                </div>
              </div>
            </div>

            {/* Centered Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col gap-7 text-center max-w-2xl -mt-16 z-10"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-background/40 px-4 py-2 text-primary backdrop-blur-md mx-auto">
                <Heart className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">Handmade with heart</span>
              </div>

              <div>
                <div className="mb-3 text-5xl md:text-7xl" style={{ fontFamily: '"Great Vibes", cursive' }}>
                  <span className="text-foreground">Phool </span>
                  <span className="text-primary">Shop</span>
                </div>
                <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
                  Handcrafted with Love,
                  <span className="text-primary"> One Stitch</span> at a Time
                </h1>
              </div>

              <p className="max-w-xl mx-auto text-lg leading-relaxed text-muted-foreground md:text-xl">
                Discover crochet creations made by hand, one stitch at a time. From amigurumi to blankets, each piece tells a story.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/20">
                  <Link to="/catalog">
                    Shop Our Collection <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full bg-background/30 px-8 text-base backdrop-blur-md">
                  <Link to="/custom-orders">
                    <Sparkles className="mr-2 h-4 w-4" /> Custom Orders
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Right Polaroids with Fairy Lights */}
            <div className="absolute right-0 top-0 hidden lg:block">
              <div className="relative">
                {/* Fairy lights string */}
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <FairyLight 
                      key={`right-light-${i}`} 
                      delay={i * 0.3 + 0.5} 
                      color={i % 2 === 0 ? "bg-purple-400" : "bg-blue-400"}
                      style={{
                        position: 'absolute',
                        right: `${20 + (i % 3) * 60}px`,
                        top: `${i * 40}px`
                      }}
                    />
                  ))}
                </div>
                
                {/* Overlapping polaroids */}
                <div className="relative" style={{ width: "250px", height: "500px" }}>
                  <Polaroid product={polaroidProducts[3]} delay={0.2} rotate={6} style={{ position: 'absolute', right: '0px', top: '40px' }} />
                  <Polaroid product={polaroidProducts[4]} delay={0.4} rotate={-4} style={{ position: 'absolute', right: '50px', top: '170px' }} />
                  <Polaroid product={polaroidProducts[5]} delay={0.6} rotate={2} style={{ position: 'absolute', right: '25px', top: '320px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background slideshow */}
        {/* Decorative gradient orb */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl" />
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.h2
                variants={fadeUp}
                custom={0}
                className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
              >
                Featured Items
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={1}
                className="mt-3 max-w-xl text-muted-foreground"
              >
                Our most-loved handmade pieces, crafted with care.
              </motion.p>
            </motion.div>

            <Button asChild variant="ghost" className="h-auto w-fit rounded-full px-4 py-2 text-primary hover:bg-primary/10">
              <Link to="/catalog">
                View all shop items <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

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
              <div className="mx-auto max-w-5xl">
                <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-background/40 shadow-xl backdrop-blur-xl">
                  <motion.div
                    key={`${activeFeatured?.kind ?? ""}-${activeFeatured?.id ?? ""}`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="grid gap-8 p-8 md:grid-cols-2 md:p-10"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/30 to-background">
                      {(() => {
                        const images = activeFeatured?.images;
                        let imgArray: string[] = [];
                        if (Array.isArray(images)) {
                          imgArray = images;
                        } else if (typeof images === 'string') {
                          try {
                            imgArray = JSON.parse(images || '[]');
                          } catch {
                            imgArray = [];
                          }
                        }
                        const img = imgArray.find((v) => v && v.trim() !== "") || "";
                        return isImageUrl(img) ? (
                          <img src={img} alt={activeFeatured?.name ?? ""} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
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

          <div className="mt-10 text-center" />
        </div>
      </section>

      {/* Our Story */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-secondary" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(236,72,153,0.06)_1px,transparent_0)] [background-size:22px_22px] opacity-80" />

        <div className="container relative z-10">
          <div className="overflow-hidden rounded-3xl border border-primary/10 bg-background/35 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="p-10 md:p-14">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Our Story</span>
                </div>

                <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-foreground">
                  About the Craft
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground font-normal">
                  Phool means "flower" — and just like flowers, every crochet piece we create blossoms with intention and beauty.
                  We believe in slow craft, sustainability, and the joy of handmade gifts that last a lifetime.
                </p>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-foreground">Soft Fibers</p>
                    <p className="mt-1 text-sm text-muted-foreground">Premium yarns chosen for comfort and durability.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Unique Design</p>
                    <p className="mt-1 text-sm text-muted-foreground">No two items are exactly the same — every stitch is human.</p>
                  </div>
                </div>

                <div className="mt-10">
                  <Button asChild variant="outline" className="rounded-full bg-background/30 backdrop-blur-md">
                    <Link to="/catalog">Explore the collection</Link>
                  </Button>
                </div>
              </div>

              <div className="relative min-h-[360px] bg-gradient-to-br from-primary/10 via-background/25 to-accent/35">
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
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
