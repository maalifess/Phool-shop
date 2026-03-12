import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
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

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, c] = await Promise.all([loadProducts(), loadCards()]);
      setProducts(p);
      setCards(c);
      setLoading(false);
    })();
  }, []);

  const filteredItems = useMemo(() => {
    const combined = [
      ...products.map(p => ({ ...p, kind: 'product' as const })),
      ...cards.map(c => ({ ...c, kind: 'card' as const }))
    ];

    let filtered = combined.filter(item => {
      const matchesSearch = !searchText || 
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.category.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()));
      
      const matchesCategory = activeCategory === "All" || item.category.includes(activeCategory);
      
      return matchesSearch && matchesCategory;
    });

    // Sorting
    if (sort === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [products, cards, searchText, activeCategory, sort]);

  return (
    <Layout hideNavbar hideFooter>
      <MouseTrail />
      <div className="min-h-screen" style={{ backgroundColor: '#FFF5EE' }}>
        {/* Desktop Navigation */}
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
              <Link to="/tokri" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Tokri</Link>
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
              <Link to="/tokri" className="w-14 h-14 flex items-center justify-center border-2 rounded-full text-xs font-bold" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}>Tokri</Link>
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
                    Browse our collection of handmade crochet treasures
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="xl:max-w-[1360px] mx-auto mt-8">
          <div className="w-full max-w-[90vw] md:max-w-[95vw] mx-auto px-4">
            <div className="border-2 rounded-[2rem] p-6" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#BC8F8F' }} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        if (e.target.value) {
                          setSearchParams({ search: e.target.value });
                        } else {
                          setSearchParams({});
                        }
                      }}
                      className="w-full pl-10 pr-10 py-3 border-2 rounded-xl outline-none"
                      style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                    />
                    {searchText && (
                      <button
                        onClick={() => {
                          setSearchText("");
                          setSearchParams({});
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="h-5 w-5" style={{ color: '#BC8F8F' }} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="md:w-48">
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-xl outline-none"
                    style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="md:w-48">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-xl outline-none"
                    style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                  >
                    <option value="default">Sort by</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low-High)</option>
                    <option value="price-desc">Price (High-Low)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="xl:max-w-[1360px] mx-auto mt-8">
          <div className="w-full max-w-[90vw] md:max-w-[95vw] mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border-2 rounded-[2rem] overflow-hidden animate-pulse" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                    <div className="aspect-[4/5] bg-[#EFD8D6]" />
                    <div className="h-16 bg-[#BC8F8F]" />
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg" style={{ color: '#442f2a' }}>No items found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  let img = "";
                  if (item.kind === 'product') {
                    const images = item.images;
                    let imgArray: string[] = [];
                    if (Array.isArray(images)) imgArray = images;
                    else if (typeof images === 'string') {
                      try { imgArray = JSON.parse(images || '[]'); } catch { imgArray = []; }
                    }
                    img = imgArray.find((v) => v && v.trim() !== "") || "";
                  } else if (item.kind === 'card') {
                    img = (item as any).image || "";
                  }

                  return (
                    <motion.div
                      key={`${item.kind}-${item.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Link
                        to={`/${item.kind === 'product' ? 'product' : 'card'}/${item.id}`}
                        className="group block"
                      >
                        <div className="border-2 rounded-[2rem] overflow-hidden transition-transform duration-200 group-hover:scale-[1.02]" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                          <div className="aspect-[4/5] bg-[#EFD8D6] relative overflow-hidden">
                            {isImageUrl(img) ? (
                              <img src={img} alt={item.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="absolute inset-0 grid place-items-center" style={{ color: '#442f2a' }}>🌸</div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-2" style={{ color: '#442f2a' }}>{item.name}</h3>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold" style={{ color: '#BC8F8F' }}>PKR {item.price}</span>
                              <span className="text-sm px-2 py-1 rounded-full" style={{ backgroundColor: '#EFD8D6', color: '#442f2a' }}>
                                {item.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Catalog;
