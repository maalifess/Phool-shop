import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Heart, Star } from "lucide-react";
import Layout from "@/components/Layout";

const featuredProducts = [
  { id: 1, name: "Rose Bouquet Amigurumi", price: 35, image: "🌹" },
  { id: 2, name: "Sunflower Blanket", price: 85, image: "🌻" },
  { id: 3, name: "Lavender Bear", price: 28, image: "🧸" },
  { id: 4, name: "Daisy Chain Garland", price: 22, image: "🌼" },
];

const testimonials = [
  { name: "Sarah M.", text: "The quality is incredible! My daughter loves her amigurumi bunny.", rating: 5 },
  { name: "Emily R.", text: "Beautiful custom blanket — exactly what I envisioned. Highly recommend!", rating: 5 },
  { name: "Jessica L.", text: "Perfect gifts for baby showers. Everyone always asks where I got them.", rating: 5 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Index = () => {
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
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {featuredProducts.map((product, i) => (
              <motion.div key={product.id} variants={fadeUp} custom={i + 2}>
                <Card className="group cursor-pointer border-border/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl bg-accent text-5xl transition-transform duration-300 group-hover:scale-110">
                      {product.image}
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-primary font-medium">PKR {product.price}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 1}>
                <Card className="h-full border-border/40">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                      "{t.text}"
                    </p>
                    <p className="mt-4 text-sm font-semibold text-foreground">— {t.name}</p>
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

export default Index;
