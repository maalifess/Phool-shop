import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { loadProducts } from "@/lib/supabaseProducts";
import { loadCards } from "@/lib/supabaseCards";
import type { Product } from "@/lib/supabaseProducts";
import type { Card as SupabaseCard } from "@/lib/supabaseTypes";
import confetti from "canvas-confetti";
import { MouseTrail } from "@/components/MouseTrail";

// Import sticker images
import sticker1 from '@/assets/stickers/1.png';
import sticker2 from '@/assets/stickers/2.png';
import sticker3 from '@/assets/stickers/3.png';
import sticker4 from '@/assets/stickers/4.png';

const fireConfetti = () => {
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#BC8F8F', '#a855f7', '#facc15', '#bfdbfe'] // custom pink, purple, yellow, blue
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#BC8F8F', '#a855f7', '#facc15', '#bfdbfe']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cards, setCards] = useState<SupabaseCard[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

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

  const featuredPreview = featuredItems.slice(0, 3);

  useEffect(() => {
    (async () => {
      setFeaturedLoading(true);
      const [p, c] = await Promise.all([loadProducts(), loadCards()]);
      setProducts(p);
      setCards(c);
      setFeaturedLoading(false);
    })();
  }, []);

  // Scroll-based navbar hiding
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout hideNavbar hideFooter>
      <MouseTrail />
      <style>
        {`@keyframes phool-marquee {\n  0% { transform: translateX(0); }\n  100% { transform: translateX(-50%); }\n}`}
      </style>

      <div className="min-h-screen" style={{ backgroundColor: '#FFF5EE' }}>
        <div className={`hidden lg:flex left-1/2 -translate-x-1/2 w-[93vw] lg:max-w-[1280px] fixed top-10 z-50 h-min transition-transform duration-500 ${navVisible ? 'translate-y-0' : '-translate-y-[200%]'}`}>
          <div className="flex items-center justify-between w-full gap-6">
            <div className="flex items-center justify-center gap-2 border-2 rounded-full px-4 py-2.5 w-full" style={{ backgroundColor: '#FFF5EE', borderColor: '#442f2a' }}>
              <Link to="/" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Home</Link>
              <Link to="/custom-orders" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Custom Orders</Link>
              <Link to="/catalog" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Shop</Link>
            </div>
            <div className="w-full flex items-center justify-center">
              <Link to="/" className="text-3xl font-bold tracking-tight" style={{ color: '#442f2a', fontFamily: '"Fredoka One", cursive' }}>Phool</Link>
            </div>
            <div className="flex items-center justify-center gap-2 border-2 rounded-full px-4 py-2.5 w-full" style={{ backgroundColor: '#FFF5EE', borderColor: '#442f2a' }}>
              <Link to="/fundraisers" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Fundraisers</Link>
              <Link to="/tokri" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }} aria-label="Cart">
                Tokri
              </Link>
            </div>
          </div>
        </div>

        <div className={`lg:hidden fixed w-full top-0 left-0 right-0 z-50 bg-transparent p-4 transition-transform duration-500 ${navVisible ? 'translate-y-0' : '-translate-y-[200%]'}`}>
          <div className="relative w-full flex items-center">
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 border-2 rounded-full" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
              <span className="text-xl">≡</span>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-shrink-0">
              <Link to="/" className="text-xl font-bold" style={{ color: '#442f2a', fontFamily: '"Fredoka One", cursive' }}>Phool</Link>
            </div>
            <div className="flex items-center gap-3 ml-auto flex-shrink-0">
              <Link to="/tokri" className="w-14 h-14 flex items-center justify-center border-2 rounded-full text-xs font-bold" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }} aria-label="Cart">
                Tokri
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-[5dvh] md:pt-0">
          <div className="xl:max-w-[1360px] mx-auto">
            <div className="w-full flex items-center justify-center relative">
              <div className="border-2 border-[#442f2a] lg:w-[95vw] w-[90vw] h-[85dvh] md:h-[92dvh] overflow-hidden mt-[8dvh] md:mt-[2dvh] px-6 md:px-8 grid place-items-center" style={{ borderRadius: '3.5rem 3.5rem 0 0', backgroundColor: '#EFD8D6' }}>
                <div className="w-full max-w-[1200px] mx-auto h-[85dvh] md:h-[70vh] flex flex-row items-center justify-center md:gap-10 translate-y-[5%]">
                  <div className="flex flex-col md:gap-10 items-center md:items-end md:justify-end top-2 md:top-5 relative z-10 w-full md:w-5/8 h-full">
                    <div className="w-full h-1/3">
                      <h1 className="hidden md:block leading-[1] text-[12vh] md:text-[22vh] whitespace-nowrap -rotate-8" style={{ color: '#FFF5EE', fontFamily: '"Sacramento", cursive' }}>
                        Welcome to
                      </h1>
                      <h1 className="block md:hidden leading-[1] text-[9vh] whitespace-nowrap -rotate-8" style={{ color: '#FFF5EE', fontFamily: '"Sacramento", cursive' }}>
                        Welcome to
                      </h1>
                    </div>
                    <div className="w-full h-2/3">
                      <h2 className="mt-10 md:mt-0 md:text-[14vh] text-[8.5vh] leading-[0.9] text-left md:text-right translate-y-[-45%] md:translate-y-[-10%] pt-4" style={{ color: '#FFF5EE', fontFamily: '"Fredoka One", cursive' }}>
                        PHOOL
                        <br />
                        SHOP
                      </h2>
                      <p className="max-w-[44ch] mt-6 md:mt-8 text-base md:text-lg leading-[1.5] md:text-right" style={{ color: '#442f2a' }}>
                        Handmade crochet creations—cute amigurumi friends, soft gifts, and cozy pieces made with care.
                      </p>
                      <div className="mt-6 flex items-center justify-start md:justify-end gap-3">
                        <Button asChild onClick={fireConfetti} className="rounded-full px-6 border-2" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>
                          <Link to="/catalog">Shop</Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-full px-6 border-2" style={{ borderColor: '#442f2a', color: '#442f2a', backgroundColor: 'transparent' }}>
                          <Link to="/custom-orders">Custom</Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:grid md:w-3/8 w-2/3 h-full relative place-items-end">
                    <motion.img
                      src={sticker1}
                      alt=""
                      className="w-full h-full object-contain object-bottom"
                      animate={{ y: [-6, 6, -6], rotate: [1, -1, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="md:hidden w-2/3 h-full absolute bottom-0 right-0">
                    <motion.img
                      src={sticker2}
                      alt=""
                      className="w-full h-full object-contain object-bottom p-3"
                      animate={{ y: [-6, 6, -6] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute h-[3.25rem] md:h-[4rem] left-0 w-full py-4 overflow-hidden z-10 border-y-4 border-[#442f2a] -translate-y-[100%]" style={{ backgroundColor: '#BC8F8F' }}>
            <div className="flex whitespace-nowrap" style={{ animation: 'phool-marquee 15s linear infinite', width: '200%' }}>
              <div className="flex items-center" style={{ color: '#FFF5EE', fontFamily: '"Fredoka One", cursive' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="text-[1.5rem] md:text-[2rem] px-3">CROCHET</span>
                ))}
              </div>
              <div className="flex items-center" style={{ color: '#FFF5EE', fontFamily: '"Fredoka One", cursive' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={`b-${i}`} className="text-[1.5rem] md:text-[2rem] px-3">CROCHET</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div id="shop" className="xl:max-w-[1360px] mx-auto">
          <section className="w-full border-x-2 border-[#442f2a] bg-[#F7F3ED] text-[#442f2a] max-w-[90vw] md:max-w-[95vw] mx-auto relative pb-16 md:pb-24">
            <div className="max-w-[1080px] flex flex-col items-center justify-center gap-10 px-4 mx-auto">
              <div className="w-full flex items-center justify-between gap-6 mt-16">
                <div className="hidden md:flex w-16 h-16 border-2 rounded-full items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <ArrowRight className="h-6 w-6" />
                </div>
                <h2 className="text-[4rem] md:text-[8rem] leading-[1] rotate-[-10deg]" style={{ fontFamily: '"Sacramento", cursive' }}>Shop</h2>
                <div className="hidden md:flex w-16 h-16 border-2 rounded-full items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <ArrowRight className="h-6 w-6 rotate-180" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                {featuredPreview.map((item, idx) => {
                  if (!item) return null;
                  const images = item.images;
                  let imgArray: string[] = [];
                  if (Array.isArray(images)) imgArray = images;
                  else if (typeof images === 'string') {
                    try { imgArray = JSON.parse(images || '[]'); } catch { imgArray = []; }
                  }
                  const img = imgArray.find((v) => v && v.trim() !== "") || "";

                  return (
                    <Link
                      key={`${item.kind}-${item.id}-${idx}`}
                      to={`/product/${item.id}`}
                      className="group block"
                    >
                      <div className="border-2 rounded-[2rem] overflow-hidden" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                        <div className="aspect-[4/5] bg-[#EFD8D6] relative overflow-hidden">
                          {isImageUrl(img) ? (
                            <img src={img} alt={item.name ?? ''} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="absolute inset-0 grid place-items-center" style={{ color: '#442f2a' }}>🌸</div>
                          )}
                        </div>
                        <div className="border-t-2 px-4 py-4 text-center font-bold" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>
                          {item.name}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4">
                <Button asChild className="rounded-full px-6 border-2" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>
                  <Link to="/catalog">Go to shop</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>

        <div id="about" className="xl:max-w-[1360px] mx-auto">
          <section className="w-full border-x-2 border-[#442f2a] bg-[#F7F3ED] text-[#442f2a] max-w-[90vw] md:max-w-[95vw] mx-auto relative py-16 md:py-20">
            <div className="max-w-[1080px] mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-[4rem] md:text-[6rem] leading-[1] rotate-[-8deg]" style={{ fontFamily: '"Sacramento", cursive' }}>About</h2>
                <p className="mt-6 text-base md:text-lg leading-[1.6]">
                  Phool means “flower”. We make crochet pieces slowly and carefully—small friends, gifts, and cozy items meant to be kept.
                </p>
                <div className="mt-8">
                  <Button asChild className="rounded-full px-6 border-2" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>
                    <Link to="/catalog">Discover</Link>
                  </Button>
                </div>
              </div>
              <div className="border-2 rounded-[2rem] overflow-hidden" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                <img src={sticker3} alt="" className="w-full h-full object-contain p-8" />
              </div>
            </div>
          </section>
        </div>

        <div id="reviews" className="xl:max-w-[1360px] mx-auto">
          <section className="w-full border-x-2 border-[#442f2a] bg-[#F7F3ED] text-[#442f2a] max-w-[90vw] md:max-w-[95vw] mx-auto relative py-16 md:py-20">
            <div className="max-w-[1080px] flex flex-col items-center justify-center gap-10 px-4 mx-auto">
              <div className="w-full flex items-center justify-between gap-6 mt-16">
                <div className="hidden md:flex w-16 h-16 border-2 rounded-full items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <ArrowRight className="h-6 w-6" />
                </div>
                <h2 className="text-[4rem] md:text-[8rem] leading-[1] rotate-[-10deg]" style={{ fontFamily: '"Sacramento", cursive' }}>Reviews</h2>
                <div className="hidden md:flex w-16 h-16 border-2 rounded-full items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <ArrowRight className="h-6 w-6 rotate-180" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="border-2 rounded-[2rem] overflow-hidden" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-12 h-12 border-2 rounded-full flex items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#EFD8D6' }}>
                        <span className="text-xl">🌸</span>
                      </div>
                      <div>
                        <div className="font-bold" style={{ color: '#442f2a' }}>Sarah K.</div>
                        <div className="text-sm" style={{ color: '#BC8F8F' }}>⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p className="text-base md:text-lg leading-[1.6]" style={{ color: '#442f2a' }}>
                      "Absolutely love my crochet flowers! The craftsmanship is amazing and they look perfect in my home. Will definitely order again!"
                    </p>
                  </div>
                </div>

                <div className="border-2 rounded-[2rem] overflow-hidden" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-12 h-12 border-2 rounded-full flex items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#EFD8D6' }}>
                        <span className="text-xl">🧸</span>
                      </div>
                      <div>
                        <div className="font-bold" style={{ color: '#442f2a' }}>Ahmed R.</div>
                        <div className="text-sm" style={{ color: '#BC8F8F' }}>⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p className="text-base md:text-lg leading-[1.6]" style={{ color: '#442f2a' }}>
                      "Ordered a custom teddy bear for my daughter's birthday. It turned out even better than I imagined! Great communication throughout."
                    </p>
                  </div>
                </div>

                <div className="border-2 rounded-[2rem] overflow-hidden" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-12 h-12 border-2 rounded-full flex items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#EFD8D6' }}>
                        <span className="text-xl">🎀</span>
                      </div>
                      <div>
                        <div className="font-bold" style={{ color: '#442f2a' }}>Fatima M.</div>
                        <div className="text-sm" style={{ color: '#BC8F8F' }}>⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p className="text-base md:text-lg leading-[1.6]" style={{ color: '#442f2a' }}>
                      "The gift wrapping was beautiful! My friend loved her custom crochet blanket. The attention to detail is incredible. Highly recommend!"
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button asChild className="rounded-full px-6 border-2" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>
                  <Link to="/catalog">Shop Now</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>

        <div id="find-us" className="w-full py-16" style={{ backgroundColor: '#FFF5EE' }}>
          <div className="xl:max-w-[1360px] mx-auto px-4">
            <div className="w-[95vw] max-w-[1080px] mx-auto border-2 rounded-[2rem]" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>
              <div className="p-8 md:p-12 border-b-2" style={{ borderColor: '#FFF5EE' }}>
                <h3 className="uppercase text-4xl sm:text-6xl md:text-7xl leading-[0.9]" style={{ fontFamily: '"Fredoka One", cursive' }}>
                  thanks for
                  <br />
                  shopping with us!
                </h3>
              </div>
              <div className="grid md:grid-cols-3">
                <div className="p-8 border-b-2 md:border-b-0 md:border-r-2" style={{ borderColor: '#FFF5EE' }}>
                  <div className="text-base md:text-lg">hello@phool.shop</div>
                  <div className="mt-2 text-base md:text-lg">WhatsApp: +92 …</div>
                  <div className="mt-2 text-base md:text-lg">Pakistan</div>
                  <div className="mt-2 text-base md:text-lg">Online orders</div>
                </div>
                <div className="p-8 border-b-2 md:border-b-0 md:border-r-2" style={{ borderColor: '#FFF5EE' }}>
                  <div className="text-base md:text-lg">Newsletter</div>
                  <div className="mt-4">
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full bg-transparent border-b-2 outline-none px-2 py-2"
                      style={{ borderColor: '#FFF5EE' }}
                    />
                  </div>
                  <div className="mt-4">
                    <Button className="rounded-full px-6 border-2" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}>
                      Subscribe
                    </Button>
                  </div>
                </div>
                <div className="p-8 flex items-center justify-center relative">
                  <motion.img
                    src={sticker4}
                    alt=""
                    className="w-40 h-40 object-contain"
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
