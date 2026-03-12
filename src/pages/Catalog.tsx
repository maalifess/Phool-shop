import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import HepHeader from "@/components/HepHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";
import { loadProducts } from "@/lib/supabaseProducts";
import { loadCards } from "@/lib/supabaseCards";
import type { Product } from "@/lib/supabaseProducts";
import type { Card as SupabaseCard } from "@/lib/supabaseTypes";
import { MouseTrail } from "@/components/MouseTrail";

// Import sticker images
import sticker1 from '@/assets/stickers/1.png';
import sticker2 from '@/assets/stickers/2.png';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [products, setProducts] = useState<Product[]>([]);
  const [cards, setCards] = useState<SupabaseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(urlSearch);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);

  const isImageUrl = (v?: string) => {
    if (!v || v.trim() === "") return false;
    return v.startsWith("data:image/") || v.startsWith("http://") || v.startsWith("https://");
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of products) {
      const parts = p.category.split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(c => cats.add(c));
    }
    for (const c of cards) {
      cats.add(c.category);
    }
    return ["All", ...Array.from(cats)];
  }, [products, cards]);

  const allProducts = useMemo(() => {
    const arr = [];
    for (const p of products) {
      arr.push(p);
    }
    for (const c of cards) {
      arr.push({ ...c, images: c.images });
    }
    return arr;
  }, [products, cards]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [productsData, cardsData] = await Promise.all([
        loadProducts(),
        loadCards()
      ]);
      setProducts(productsData);
      setCards(cardsData);
      setLoading(false);
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

  const displayed = useMemo(() => {
    let result = [...allProducts];

    // Search filter
    const q = searchText.toLowerCase().trim();
    if (q) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory !== "All") {
      result = result.filter((p) => {
        const cats = p.category.split(',').map(s => s.trim()).filter(Boolean);
        return cats.includes(activeCategory);
      });
    }

    // Sort
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [allProducts, searchText, activeCategory, sort]);

  const clearSearch = () => {
    setSearchText("");
    setSearchParams({});
  };

  return (
<<<<<<< Updated upstream
    <Layout hideNavbar hideFooter>
      <MouseTrail />
      
      <div className="min-h-screen" style={{ backgroundColor: '#FFF5EE' }}>
        {/* Desktop Navigation */}
        <div className={`hidden lg:flex left-1/2 -translate-x-1/2 w-[93vw] lg:max-w-[1280px] fixed top-10 z-50 h-min transition-transform duration-500 ${navVisible ? 'translate-y-0' : '-translate-y-[200%]'}`}>
          <div className="flex items-center justify-between w-full gap-6">
            <div className="flex items-center justify-center gap-2 border-2 rounded-full px-4 py-2.5 w-full" style={{ backgroundColor: '#FFF5EE', borderColor: '#442f2a' }}>
              <Link to="/#about" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>About</Link>
              <Link to="/#custom-orders" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Custom Orders</Link>
              <Link to="/catalog" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#442f2a', color: '#FFF5EE' }}>Shop</Link>
            </div>
            <div className="w-full flex items-center justify-center">
              <Link to="/" className="text-3xl font-bold tracking-tight" style={{ color: '#442f2a', fontFamily: '"Fredoka One", cursive' }}>Phool</Link>
            </div>
            <div className="flex items-center justify-center gap-2 border-2 rounded-full px-4 py-2.5 w-full" style={{ backgroundColor: '#FFF5EE', borderColor: '#442f2a' }}>
              <Link to="/#find-us" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Find Us</Link>
              <Link to="/tokri" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }} aria-label="Cart">
                Tokri
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
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

        {/* Hero Section */}
        <div className="pt-[5dvh] md:pt-0">
          <div className="xl:max-w-[1360px] mx-auto">
            <div className="w-full flex items-center justify-center relative">
              <div className="border-2 border-[#442f2a] lg:w-[95vw] w-[90vw] min-h-[50dvh] md:min-h-[60dvh] overflow-hidden mt-[8dvh] md:mt-[2dvh] px-6 md:px-8 grid place-items-center" style={{ borderRadius: '3.5rem 3.5rem 0 0', backgroundColor: '#EFD8D6' }}>
                <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center justify-center gap-6 py-12">
                  <h1 className="text-[4rem] md:text-[8rem] leading-[1] rotate-[-10deg]" style={{ fontFamily: '"Sacramento", cursive', color: '#FFF5EE' }}>
                    Shop
                  </h1>
                  <p className="max-w-[44ch] text-base md:text-lg text-center" style={{ color: '#442f2a' }}>
                    Browse our handcrafted collection — each piece made with care.
                  </p>
                  
                  {/* Search bar */}
                  <div className="w-full max-w-md">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: '#BC8F8F' }} />
                      <input
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search products..."
                        className="h-12 w-full rounded-full border-2 pl-12 pr-10 text-base outline-none"
                        style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                      />
                      {searchText && (
                        <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#BC8F8F' }}>
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="xl:max-w-[1360px] mx-auto">
          <section className="w-full border-x-2 border-[#442f2a] bg-[#F7F3ED] text-[#442f2a] max-w-[90vw] md:max-w-[95vw] mx-auto relative py-8 md:py-12">
            <div className="max-w-[1080px] flex flex-col items-center justify-center gap-6 px-4 mx-auto">
              
              {/* Filters row */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="border-2 rounded-full px-4 py-1.5 text-sm md:text-base transition-colors duration-200"
                    style={{
                      borderColor: '#442f2a',
                      backgroundColor: activeCategory === cat ? '#442f2a' : '#FFF5EE',
                      color: activeCategory === cat ? '#FFF5EE' : '#442f2a'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <select 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)} 
                  className="border-2 rounded-full px-4 py-1.5 text-sm md:text-base outline-none"
                  style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                >
                  <option value="default">Sort</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                </select>
              </div>

              {/* Results count */}
              <div className="text-sm" style={{ color: '#BC8F8F' }}>
                {loading ? "Loading..." : `${displayed.length} item${displayed.length !== 1 ? "s" : ""} found`}
              </div>

              {/* Products grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mt-4">
                {loading ? (
                  <div className="col-span-full text-center py-12" style={{ color: '#BC8F8F' }}>
                    Loading beautiful creations...
                  </div>
                ) : displayed.length === 0 ? (
                  <div className="col-span-full text-center py-12" style={{ color: '#BC8F8F' }}>
                    <p className="text-lg">No products match your filters.</p>
                    <Button 
                      className="mt-4 rounded-full px-6 border-2" 
                      style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}
                      onClick={() => { setActiveCategory("All"); setSearchText(""); }}
                    >
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  displayed.map((product, idx) => {
                    const firstImage = product.images.find((v) => (v || "").trim() !== "") || "";
                    
                    return (
                      <Link
                        key={`${product.id}-${idx}`}
                        to={`/product/${product.id}`}
                        className="group block"
                      >
                        <div className="border-2 rounded-[2rem] overflow-hidden transition-transform duration-300 hover:scale-[1.02]" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                          <div className="aspect-[4/5] relative overflow-hidden" style={{ backgroundColor: '#EFD8D6' }}>
                            {isImageUrl(firstImage) ? (
                              <img src={firstImage} alt={product.name ?? ''} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="absolute inset-0 grid place-items-center" style={{ color: '#442f2a' }}>🌸</div>
                            )}
                            
                            {!product.in_stock && (
                              <div className="absolute top-3 left-3 border-2 rounded-full px-3 py-1 text-xs font-bold" style={{ borderColor: '#442f2a', backgroundColor: '#442f2a', color: '#FFF5EE' }}>
                                Out of Stock
                              </div>
                            )}
                          </div>
                          <div className="border-t-2 px-4 py-4" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>
                            <div className="font-bold text-center truncate">{product.name}</div>
                            <div className="text-center mt-1">PKR {product.price}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer Section */}
        <div className="w-full py-16" style={{ backgroundColor: '#FFF5EE' }}>
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
                    src={sticker1}
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
=======
    <div className="min-h-screen bg-[#FFF5EE]">
      <HepHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl rounded-3xl border border-[#EFD8D6] bg-white/60 p-12 text-center shadow-lg backdrop-blur-sm"
          >
            <h1 className="font-display text-4xl font-bold md:text-5xl" style={{color: '#442f2a'}}>Our Catalog</h1>
            <p className="mx-auto mt-4 max-w-lg text-[#BC8F8F]">
              Browse our handcrafted collection — each piece made with care.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-4xl rounded-3xl border border-[#EFD8D6] bg-white/60 p-8 shadow-lg backdrop-blur-sm"
          >
            {/* Search bar */}
            <div className="mx-auto max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BC8F8F]" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search by name, description, or category..."
                  className="h-11 w-full rounded-full border border-[#EFD8D6] bg-[#F7F3ED] pl-10 pr-10 text-sm outline-none focus:border-[#BC8F8F] focus:ring-1 focus:ring-[#BC8F8F]/30"
                />
                {searchText && (
                  <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BC8F8F] hover:text-[#442f2a]">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters row */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full ${activeCategory === cat ? 'bg-[#BC8F8F] text-white' : 'border-[#EFD8D6] text-[#BC8F8F] hover:bg-[#F7F3ED]'}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-[#EFD8D6] bg-[#F7F3ED] px-3 py-2 text-sm text-[#442f2a]">
                <option value="default">Sort</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
            </div>

            {/* Results count */}
            <div className="mt-6 text-center text-sm text-[#BC8F8F]">
              {loading ? "Loading..." : `${displayed.length} item${displayed.length !== 1 ? "s" : ""} found`}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            key={`${activeCategory}-${searchText}`}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-6xl rounded-3xl border border-[#EFD8D6] bg-white/60 p-8 shadow-lg backdrop-blur-sm"
          >
            <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {displayed.map((product, i) => (
                <motion.div key={product.id} variants={fadeUp} custom={i}>
                  <Card className="group h-full border-[#EFD8D6]/40 bg-[#F7F3ED] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6 text-center">
                      <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl border border-[#EFD8D6]/40">
                        {(() => {
                          const firstImage = product.images.find((v) => (v || "").trim() !== "") || "";
                          return isImageUrl(firstImage) ? (
                            <img 
                              src={firstImage} 
                              alt={product.name} 
                              className="absolute inset-0 h-full w-full object-cover" 
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#EFD8D6] text-sm text-[#BC8F8F]">
                            No image
                          </div>
                          );
                        })()}

                        <div className="absolute inset-0 translate-y-full bg-[#EFD8D6]/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />

                        {!product.in_stock && (
                          <div className="absolute top-2 left-2 rounded-full bg-red-500/90 px-2.5 py-0.5 text-xs font-semibold text-white">
                            Out of Stock
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          {product.in_stock ? (
                            <Button asChild size="sm" className="rounded-full bg-[#BC8F8F] hover:bg-[#442f2a]">
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
                          <div className="font-display text-sm font-semibold text-[#442f2a] line-clamp-1">{product.name}</div>
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {product.category.split(',').map((c, i) => (
                              <span key={i} className="inline-block rounded-full bg-[#EFD8D6] px-2 py-0.5 text-xs text-[#BC8F8F]">
                                {c.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="shrink-0 text-lg font-medium text-[#BC8F8F]">PKR {product.price}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {!loading && displayed.length === 0 && (
              <div className="mt-16 text-center text-[#BC8F8F]">
                <p className="text-lg">No products match your filters.</p>
                <Button variant="outline" className="mt-4 rounded-full border-[#EFD8D6] text-[#BC8F8F] hover:bg-[#F7F3ED]" onClick={() => { setActiveCategory("All"); setSearchText(""); }}>
                  Clear all filters
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F7F3ED] py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#BC8F8F]">© 2024 Phool Shop. All rights reserved.</p>
        </div>
      </footer>
    </div>
>>>>>>> Stashed changes
  );
};

export default Catalog;
