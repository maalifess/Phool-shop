import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Heart, Star, Palette, Gift, Feather, Cloud, Sun, Flower2, Coffee } from "lucide-react";
import Layout from "@/components/Layout";
import { loadProducts } from "@/lib/supabaseProducts";
import { loadCards } from "@/lib/supabaseCards";
import type { Product } from "@/lib/supabaseProducts";
import type { Card as SupabaseCard, Review } from "@/lib/supabaseTypes";
import { loadApprovedReviews } from "@/lib/supabaseReviews";
import confetti from "canvas-confetti";
import { MouseTrail } from "@/components/MouseTrail";
import { YarnLoadingScreen } from "@/components/YarnLoadingScreen";

// Floating element helper tied to scroll (Parallax)
const ParallaxFloater = ({
  children,
  className,
  scrollYProgress,
  speed = 1,
  direction = 1,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  scrollYProgress: any;
  speed?: number;
  direction?: number;
  delay?: number;
}) => {
  // Parallax logic based on scroll
  const yScroll = useTransform(scrollYProgress, [0, 1], [0, 800 * speed * direction]);
  // Additional gentle bobbing animation
  return (
    <motion.div
      style={{ y: yScroll }}
      className={`absolute ${className}`}
    >
      <motion.div
        initial={{ y: 0, x: 0, rotate: 0 }}
        animate={{
          y: [-15, 15, -15],
          x: [-10, 10, -10],
          rotate: [-10, 10, -10]
        }}
        transition={{
          duration: 4 + Math.random() * 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", bounce: 0.4, delay: i * 0.1, duration: 0.8 },
  }),
};

const popIn = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

const fireConfetti = () => {
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#f472b6', '#a855f7', '#facc15', '#bfdbfe'] // custom pink, purple, yellow, blue
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#f472b6', '#a855f7', '#facc15', '#bfdbfe']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

const Index = () => {
  const { scrollYProgress } = useScroll();
  const yHeroText = useTransform(scrollYProgress, [0, 0.4], [0, 150]);
  const opacityHeroText = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // SVG Wave parallax
  const waveX1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const waveX2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const [products, setProducts] = useState<Product[]>([]);
  const [cards, setCards] = useState<SupabaseCard[]>([]);
  const [featuredIndex1, setFeaturedIndex1] = useState(0);
  const [featuredIndex2, setFeaturedIndex2] = useState(1);
  const [featuredIndex3, setFeaturedIndex3] = useState(2);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [audioEnabled, setAudioEnabled] = useState(false);

  // Create a tiny, gentle bloop sound programmatically (Web Audio API)
  const playPopSound = () => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // high pip
      oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volume (very soft)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) { /* ignore if audio context fails */ }
  };

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

  const activeFeatured1 = featuredItems.length > 0 ? featuredItems[featuredIndex1 % featuredItems.length] : null;
  const activeFeatured2 = featuredItems.length > 1 ? featuredItems[featuredIndex2 % featuredItems.length] : activeFeatured1;
  const activeFeatured3 = featuredItems.length > 2 ? featuredItems[featuredIndex3 % featuredItems.length] : activeFeatured1;

  useEffect(() => {
    (async () => {
      setFeaturedLoading(true);
      const [p, c] = await Promise.all([loadProducts(), loadCards()]);
      setProducts(p);
      setCards(c);

      setFeaturedIndex1(0);
      setFeaturedIndex2(p.length + c.length > 1 ? 1 : 0);
      setFeaturedIndex3(p.length + c.length > 2 ? 2 : 0);

      setFeaturedLoading(false);
    })();
  }, []);

  const idxRefs = useRef([0, 1, 2]);
  useEffect(() => {
    idxRefs.current = [featuredIndex1, featuredIndex2, featuredIndex3];
  }, [featuredIndex1, featuredIndex2, featuredIndex3]);

  useEffect(() => {
    if (featuredLoading) return;
    if (featuredItems.length <= 3) return; // Need extra items to truly cycle seamlessly

    const len = featuredItems.length;

    const t1 = window.setInterval(() => {
      setFeaturedIndex1((i) => {
        let next = (i + 1) % len;
        let iters = 0;
        while ((next === idxRefs.current[1] || next === idxRefs.current[2]) && iters < len) {
          next = (next + 1) % len;
          iters++;
        }
        return next;
      });
    }, 5000);

    const t2 = window.setInterval(() => {
      setFeaturedIndex2((i) => {
        let next = (i + 1) % len;
        let iters = 0;
        while ((next === idxRefs.current[0] || next === idxRefs.current[2]) && iters < len) {
          next = (next + 1) % len;
          iters++;
        }
        return next;
      });
    }, 6500);

    const t3 = window.setInterval(() => {
      setFeaturedIndex3((i) => {
        let next = (i + 1) % len;
        let iters = 0;
        while ((next === idxRefs.current[0] || next === idxRefs.current[1]) && iters < len) {
          next = (next + 1) % len;
          iters++;
        }
        return next;
      });
    }, 8500);

    return () => {
      window.clearInterval(t1);
      window.clearInterval(t2);
      window.clearInterval(t3);
    };
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
      <YarnLoadingScreen />
      <MouseTrail />

      {/* Audio Toggle Floating Bottom Right */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring" }}
        onClick={() => {
          setAudioEnabled(!audioEnabled);
          if (!audioEnabled) playPopSound(); // play sound to confirm it's on
        }}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-white shadow-xl shadow-pink-200/50 border-2 border-pink-200 text-pink-500 hover:bg-pink-50 hover:scale-110 transition-all cursor-pointer"
        title="Toggle magical sound effects"
      >
        {audioEnabled ? (
          <Sparkles className="w-6 h-6 animate-pulse text-purple-500" />
        ) : (
          <Sparkles className="w-6 h-6 opacity-30 text-slate-400" />
        )}
      </motion.button>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#fff0f5] py-16 md:py-24 min-h-[85vh] flex items-center justify-center">
        {/* Animated Background Gradients using precise palette */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5], rotate: [0, 90, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-[40rem] h-[40rem] bg-[#f9a8d4]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4], rotate: [0, -120, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-40 -right-20 w-[35rem] h-[35rem] bg-[#d8b4fe]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.9, 0.5], x: [0, 100, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 left-1/4 w-[45rem] h-[45rem] bg-[#fecdd3]/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        {/* Highly animated Parallax Floating Icons overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
          <ParallaxFloater scrollYProgress={scrollYProgress} speed={0.8} delay={0} className="top-[15%] left-[15%] text-[#f472b6] opacity-70"><Heart className="w-14 h-14 fill-[#f9a8d4]/40" /></ParallaxFloater>
          <ParallaxFloater scrollYProgress={scrollYProgress} speed={1.2} direction={-1} delay={1} className="top-[25%] right-[20%] text-[#a855f7] opacity-70"><Sparkles className="w-12 h-12" /></ParallaxFloater>
          <ParallaxFloater scrollYProgress={scrollYProgress} speed={0.5} delay={2} className="bottom-[25%] left-[20%] text-[#fb7185] opacity-70"><Star className="w-10 h-10 fill-[#fecdd3]/40" /></ParallaxFloater>
          <ParallaxFloater scrollYProgress={scrollYProgress} speed={1.5} direction={-1} delay={0.5} className="bottom-[30%] right-[15%] text-[#f472b6] opacity-60"><Gift className="w-12 h-12" /></ParallaxFloater>
          <ParallaxFloater scrollYProgress={scrollYProgress} speed={0.9} delay={3} className="top-[10%] right-[40%] text-[#facc15] opacity-60"><Sun className="w-16 h-16 fill-[#fef3c7]/40" /></ParallaxFloater>
          <ParallaxFloater scrollYProgress={scrollYProgress} speed={1.3} delay={1.5} className="bottom-[15%] left-[45%] text-[#93c5fd] opacity-60"><Cloud className="w-14 h-14 fill-[#bfdbfe]/40" /></ParallaxFloater>
          <ParallaxFloater scrollYProgress={scrollYProgress} speed={1.1} direction={-1} delay={2.5} className="top-[40%] left-[8%] text-[#e879f9] opacity-50"><Flower2 className="w-10 h-10" /></ParallaxFloater>
        </div>

        <motion.div
          style={{ y: yHeroText, opacity: opacityHeroText }}
          className="container relative z-20"
        >
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={popIn}
              className="mb-8"
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.5 }}
              className="mb-4 relative"
            >
              <motion.div
                className="text-7xl md:text-9xl text-[#f472b6] drop-shadow-md mb-4"
                style={{ fontFamily: '"Great Vibes", cursive' }}
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Phool Shop
              </motion.div>
              <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-slate-800 drop-shadow-sm">
                Creating cozy moments,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-rose-400">
                  one soft stitch at a time.
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="max-w-2xl text-xl leading-relaxed text-slate-600 md:text-2xl mt-8 font-medium"
            >
              Discover adorable crochet creations made entirely by hand. From sweet amigurumi friends to warm, cuddly blankets.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="flex flex-wrap gap-6 justify-center mt-12"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={playPopSound}
              >
                <Button asChild onClick={fireConfetti} size="lg" className="rounded-full px-10 h-16 text-xl bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 border-none shadow-xl shadow-pink-300/40 cursor-none">
                  <Link to="/catalog">
                    Shop Collection ✨ <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={playPopSound}
              >
                <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-16 text-xl bg-white/60 backdrop-blur-xl border-pink-200 border-2 text-pink-600 hover:bg-white hover:text-pink-700 shadow-lg shadow-pink-100/20 cursor-none">
                  <Link to="/custom-orders">
                    <Sparkles className="mr-2 h-6 w-6 text-purple-400" /> Custom Orders
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Animated Cute SVG Wave divider matching scroll */}
        <div className="absolute bottom-0 left-0 right-0 w-[200%] overflow-hidden leading-none z-10 pointer-events-none transform translate-y-1">
          <motion.svg style={{ x: waveX1 }} viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[80px] md:h-[120px] opacity-30 fill-white">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
          </motion.svg>
          <motion.svg style={{ x: waveX2, marginLeft: "-100%", marginTop: "-80px" }} viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[80px] md:h-[120px] md:mt-[-120px] opacity-60 fill-white">
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"></path>
          </motion.svg>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[80px] md:h-[120px] md:mt-[-120px] mt-[-80px] fill-white">
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32 relative bg-white">
        <div className="container max-w-6xl relative z-10">
          <div className="flex flex-col items-center text-center mb-20">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
              <motion.div variants={fadeUp} custom={0} className="inline-block mb-4">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Star className="w-12 h-12 text-[#facc15] fill-[#facc15] mx-auto" />
                </motion.div>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="font-display text-4xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
                Featured Sweets 🧶
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="mt-5 max-w-xl text-slate-500 text-xl">
                Our most-loved pieces, looking for a cozy new home.
              </motion.p>
            </motion.div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="w-full">
            {featuredLoading ? (
              <div className="text-center text-slate-400 flex justify-center items-center h-64">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                  className="rounded-full h-12 w-12 border-b-4 border-pink-400 mr-4"
                />
                <span className="text-xl font-medium text-pink-400">Loading cuteness...</span>
              </div>
            ) : featuredItems.length === 0 ? (
              <div className="text-center text-slate-400 bg-pink-50 rounded-[3rem] p-16 font-medium text-xl">No products available yet.</div>
            ) : (
              <div className="mx-auto rounded-[3rem] bg-gradient-to-br from-pink-100 via-purple-50 to-rose-100 p-3 md:p-8 shadow-xl border-4 border-white max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Carousel Slots mapping */}
                  {[
                    { activeItem: activeFeatured1, index: featuredIndex1, setIndex: setFeaturedIndex1 },
                    { activeItem: activeFeatured2, index: featuredIndex2, setIndex: setFeaturedIndex2 },
                    { activeItem: activeFeatured3, index: featuredIndex3, setIndex: setFeaturedIndex3 }
                  ].map((slot, slotIndex) => (
                    <div key={`slot-${slotIndex}`} className="relative bg-white/90 rounded-[2.5rem] shadow-sm flex flex-col items-center p-6 border-2 border-pink-50/50 backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-500 min-h-[480px]">

                      <div className="flex-1 w-full flex flex-col justify-start">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${slot.activeItem?.kind ?? ""}-${slot.activeItem?.id ?? ""}-${slotIndex}`}
                            initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)", y: 20 }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)", y: -20 }}
                            transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                            className="flex flex-col items-center w-full"
                          >
                            {/* Image Container */}
                            <motion.div
                              whileHover={{ scale: 1.05, rotate: [-2, 2, -2, 2, 0] }}
                              transition={{ duration: 0.5 }}
                              className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-[2rem] bg-pink-50 shadow-inner group border-[6px] border-[#fce7f3] mx-auto mb-6"
                            >
                              {(() => {
                                const images = slot.activeItem?.images;
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
                                  <motion.img
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.8 }}
                                    src={img}
                                    alt={slot.activeItem?.name ?? ""}
                                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                    fetchPriority="high"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-sm text-[#f9a8d4] gap-3">
                                    <Heart className="w-12 h-12 text-[#fbcfe8] fill-[#fbcfe8]" />
                                  </div>
                                );
                              })()}
                              {/* Tags */}
                              <motion.div
                                animate={{ rotate: [-5, 5, -5] }}
                                transition={{ repeat: Infinity, duration: 2 + slotIndex, ease: "easeInOut" }} // stagger tag animation speeds
                                className="absolute top-3 left-3 bg-gradient-to-r from-[#f472b6] to-[#a855f7] px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-white shadow-lg flex items-center gap-1.5 transform origin-bottom-left"
                              >
                                <Star className="w-3 h-3 fill-white" />
                                {slot.activeItem?.kind === "card" ? "Card" : "Product"}
                              </motion.div>
                            </motion.div>

                            {/* Content */}
                            <div className="flex flex-col flex-1 w-full text-center items-center justify-between px-2">
                              <div>
                                <motion.h3
                                  className="font-display text-2xl sm:text-3xl font-bold leading-tight text-[#1e293b] drop-shadow-sm line-clamp-2 min-h-[3rem]"
                                >
                                  {slot.activeItem?.name}
                                </motion.h3>
                                <motion.div
                                  className="mt-3 text-xl font-black text-[#ec4899] bg-[#fdf2f8] border-2 border-[#fce7f3] w-fit px-5 py-1.5 rounded-full mx-auto"
                                >
                                  PKR {slot.activeItem?.price}
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Static Controls */}
                      <div className="w-full flex-shrink-0 flex flex-col items-center mt-6 px-2">
                        <motion.div onHoverStart={playPopSound} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="w-full">
                          <Button onClick={fireConfetti} asChild className="rounded-full w-full h-14 text-base font-semibold bg-[#ec4899] hover:bg-[#db2777] shadow-lg shadow-pink-500/30 cursor-none">
                            <Link to={`/product/${slot.activeItem?.id}`}>View Details 🌸</Link>
                          </Button>
                        </motion.div>

                        {/* Manual Controls for this specific slot */}
                        <div className="flex items-center gap-3 mt-6">
                          <motion.div onHoverStart={playPopSound} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.8 }}>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="rounded-full h-10 w-10 border-2 border-[#fbcfe8] text-[#ec4899] hover:bg-[#fdf2f8] shadow-sm cursor-none"
                              onClick={() => {
                                let prev = (slot.index - 1 + featuredItems.length) % featuredItems.length;
                                let len = featuredItems.length;
                                let count = 0;
                                while ((prev === idxRefs.current[(slotIndex + 1) % 3] || prev === idxRefs.current[(slotIndex + 2) % 3]) && count < len) {
                                  prev = (prev - 1 + len) % len;
                                  count++;
                                }
                                slot.setIndex(prev);
                              }}
                            >
                              <ArrowRight className="h-4 w-4 rotate-180" />
                            </Button>
                          </motion.div>

                          <div className="flex gap-1.5">
                            {featuredItems.slice(0, 5).map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  playPopSound();
                                  slot.setIndex(idx);
                                }}
                                className="cursor-none"
                              >
                                <motion.div
                                  className={`h-2 rounded-full ${idx === (slot.index % featuredItems.length) ? "bg-[#ec4899] w-6" : "bg-[#fbcfe8] w-2"}`}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                />
                              </button>
                            ))}
                          </div>

                          <motion.div onHoverStart={playPopSound} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.8 }}>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="rounded-full h-10 w-10 border-2 border-[#fbcfe8] text-[#ec4899] hover:bg-[#fdf2f8] shadow-sm cursor-none"
                              onClick={() => {
                                let next = (slot.index + 1) % featuredItems.length;
                                let len = featuredItems.length;
                                let count = 0;
                                while ((next === idxRefs.current[(slotIndex + 1) % 3] || next === idxRefs.current[(slotIndex + 2) % 3]) && count < len) {
                                  next = (next + 1) % len;
                                  count++;
                                }
                                slot.setIndex(next);
                              }}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Our Story - Highly Animated with Exact Palette */}
      <section className="relative overflow-hidden py-16 md:py-20 bg-gradient-to-b from-white to-[#faf5ff]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_3px_3px,rgba(236,72,153,0.1)_1px,transparent_0)] [background-size:32px_32px]" />

        <div className="container max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
            className="overflow-hidden rounded-[3rem] bg-white/90 shadow-2xl shadow-purple-200/50 border-4 border-white backdrop-blur-xl"
          >
            <div className="grid gap-0 md:grid-cols-2">
              <div className="p-10 md:p-16 flex flex-col justify-center bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#fdf2f8]">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 text-pink-500 mb-4"
                >
                  <div className="p-2 bg-[#fce7f3] rounded-full">
                    <Palette className="h-6 w-6 text-[#ec4899]" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-[#ec4899]">Our Story</span>
                </motion.div>

                <motion.h2
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 font-display text-4xl md:text-5xl font-extrabold tracking-tight text-[#1e293b]"
                >
                  The Art of Slow Craft
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 text-xl leading-relaxed text-[#475569] font-medium"
                >
                  Phool means "flower" — and just like flowers, every crochet piece we create blossoms with intention and beauty.
                  We believe in sustainable, slow craft, and the joy of gifting handmade pieces that last a lifetime.
                </motion.p>

                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5, rotate: [0, -3, 3, -3, 0] }}
                    className="bg-white p-6 rounded-[2rem] shadow-lg shadow-pink-100/50 border-2 border-pink-50"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#ffe4e6] flex items-center justify-center mb-4">
                      <Feather className="w-7 h-7 text-[#fb7185]" />
                    </div>
                    <p className="font-bold text-xl text-[#1e293b]">Soft Fibers</p>
                    <p className="mt-2 text-base text-[#64748b] font-medium">Premium yarns chosen for utmost comfort.</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5, rotate: [0, 3, -3, 3, 0] }}
                    className="bg-white p-6 rounded-[2rem] shadow-lg shadow-purple-100/50 border-2 border-purple-50"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#ede9fe] flex items-center justify-center mb-4">
                      <Sparkles className="w-7 h-7 text-[#a855f7]" />
                    </div>
                    <p className="font-bold text-xl text-[#1e293b]">Unique Details</p>
                    <p className="mt-2 text-base text-[#64748b] font-medium">No two are exactly the same. Every stitch is human.</p>
                  </motion.div>
                </div>
              </div>

              <div className="relative min-h-[400px] md:h-full hidden md:block overflow-hidden bg-gradient-to-br from-[#fbcfe8] via-[#e9d5ff] to-[#fecdd3] p-8">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                {/* Visual Magic Elements */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 mix-blend-overlay">
                  <div className="text-[25rem] text-white" style={{ fontFamily: '"Great Vibes", cursive' }}>P</div>
                </div>
                {/* Floating parallax decorative elements */}
                <ParallaxFloater scrollYProgress={scrollYProgress} delay={0} speed={0.4} className="top-[20%] left-[20%]">
                  <div className="w-32 h-32 rounded-full bg-white/40 backdrop-blur-md shadow-xl border-2 border-white/50 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-[#f472b6]" />
                  </div>
                </ParallaxFloater>
                <ParallaxFloater scrollYProgress={scrollYProgress} delay={1.5} speed={0.6} direction={-1} className="bottom-[20%] right-[15%]">
                  <div className="w-40 h-40 rounded-full bg-white/50 backdrop-blur-md shadow-xl border-2 border-white/50 flex items-center justify-center">
                    <Coffee className="w-16 h-16 text-[#a855f7]" />
                  </div>
                </ParallaxFloater>
                <ParallaxFloater scrollYProgress={scrollYProgress} delay={0.8} speed={0.3} className="top-[30%] right-[10%]">
                  <div className="w-20 h-20 rounded-full bg-[#fef3c7]/50 backdrop-blur-md shadow-lg border-2 border-white/50 flex items-center justify-center">
                    <Star className="w-8 h-8 text-[#facc15]" />
                  </div>
                </ParallaxFloater>
                <ParallaxFloater scrollYProgress={scrollYProgress} delay={2} speed={0.5} direction={-1} className="bottom-[10%] left-[10%]">
                  <div className="w-24 h-24 rounded-full bg-[#bfdbfe]/50 backdrop-blur-md shadow-lg border-2 border-white/50 flex items-center justify-center">
                    <Cloud className="w-10 h-10 text-[#60a5fa]" />
                  </div>
                </ParallaxFloater>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Wave for next section */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none transform translate-y-1">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[100px]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.65,131.7,201.2,118S263.4,67.23,321.39,56.44Z" className="fill-[#ffffff]"></path>
          </svg>
        </div>
      </section>

      {/* Testimonials - Bouncy Spring Animations */}
      <section className="py-16 md:py-20 bg-[#ffffff] relative">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-[#fef3c7] to-[#fbcfe8] mb-8 shadow-inner border-4 border-white"
            >
              <Star className="h-12 w-12 fill-[#facc15] text-[#facc15]" />
            </motion.div>
            <h2 className="font-display text-5xl font-extrabold tracking-tight text-[#1e293b] md:text-6xl">
              Customer Reviews 💖
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mt-20 grid gap-8 md:grid-cols-3"
          >
            {reviewsLoading ? (
              <div className="col-span-full text-center text-[#94a3b8] font-medium text-xl">Loading sweet words...</div>
            ) : reviews.length === 0 ? (
              <div className="col-span-full text-center text-[#94a3b8] bg-[#f8fafc] rounded-[3rem] p-16 font-medium text-xl">No reviews yet. Check back soon!</div>
            ) : (
              reviews.slice(0, 3).map((r, i) => (
                <motion.div
                  key={r.id}
                  variants={fadeUp}
                  custom={i + 1}
                  whileHover={{ y: -15, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onHoverStart={playPopSound}
                >
                  {/* Matching exact Strict Color Palette requested */}
                  <Card className="h-full border-none shadow-2xl shadow-purple-100/50 rounded-[2.5rem] bg-gradient-to-b from-[#ffffff] to-[#fdf2f8] overflow-hidden relative cursor-none">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 via-purple-300 to-rose-300" />
                    <CardContent className="flex h-full flex-col p-10 pt-12">
                      <div className="flex gap-1.5 mb-6 bg-[#fef3c7]/30 border border-[#facc15]/20 w-fit px-4 py-2 rounded-full">
                        {Array.from({ length: Math.max(1, Math.min(5, r.rating)) }).map((_, j) => (
                          <Star key={j} className="h-5 w-5 fill-[#facc15] text-[#facc15]" />
                        ))}
                      </div>
                      <p className="flex-1 text-[#475569] leading-relaxed text-xl font-medium italic">
                        "{r.comment}"
                      </p>
                      <div className="mt-10 flex items-center gap-4 border-t border-[#f1f5f9] pt-6">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f9a8d4] to-[#c084fc] flex items-center justify-center text-white font-black font-display text-2xl shadow-md border-2 border-white">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-[#1e293b]">{r.name}</p>
                          <div className="flex text-[#ec4899] text-sm font-medium mt-1 items-center gap-1">
                            <Heart className="w-3.5 h-3.5 fill-[#ec4899]" /> Verified Buyer
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>

          {reviews.length > 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f8fafc] text-[#64748b] font-bold text-lg border-2 border-slate-100">
                <Heart className="w-5 h-5 text-[#f472b6] fill-[#f472b6]" />
                + {reviews.length - 3} more happy customers!
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
