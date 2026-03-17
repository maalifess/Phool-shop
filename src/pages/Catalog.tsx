import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { loadProducts, loadProductsFast, loadProductsPaginated, optimizeImageUrl } from "@/lib/supabaseProducts";
import { loadCards, loadCardsFast, loadCardsPaginated } from "@/lib/supabaseCards";
import type { Product } from "@/lib/supabaseProducts";
import type { ProductCatalog } from "@/lib/supabaseProducts";
import type { Card as SupabaseCard } from "@/lib/supabaseTypes";
import { Input } from "@/components/ui/input";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [products, setProducts] = useState<ProductCatalog[]>([]);
  const [cards, setCards] = useState<ProductCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState(urlSearch);
  const ITEMS_PER_PAGE = 12;

  // Get a random sticker for placeholder
  const getRandomSticker = () => `/assets/stickers/${Math.floor(Math.random() * 26) + 1}.png`;

  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);

  // Debounce searchParams update
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only update URL if searchText is different from current urlSearch
      if (searchText !== urlSearch) {
        if (searchText) {
          setSearchParams({ search: searchText }, { replace: true });
        } else {
          setSearchParams({}, { replace: true });
        }
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchText, setSearchParams, urlSearch]);

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

  // Initial load - only first page
  useEffect(() => {
    (async () => {
      setLoading(true);
      setCurrentPage(0);
      setProducts([]);
      setCards([]);
      console.log('⚡ Loading catalog page - FIRST PAGE ONLY...');
      const [p, c] = await Promise.all([
        loadProductsPaginated(ITEMS_PER_PAGE, 0),
        loadCardsPaginated(ITEMS_PER_PAGE, 0)
      ]);
      setProducts(p);
      setCards(c);
      setHasMore(p.length === ITEMS_PER_PAGE || c.length === ITEMS_PER_PAGE);
      setLoading(false);
    })();
  }, []);

  // Load more function
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    console.log(`⚡ Loading MORE items - page ${nextPage}...`);
    
    const [p, c] = await Promise.all([
      loadProductsPaginated(ITEMS_PER_PAGE, nextPage * ITEMS_PER_PAGE),
      loadCardsPaginated(ITEMS_PER_PAGE, nextPage * ITEMS_PER_PAGE)
    ]);
    
    setProducts(prev => [...prev, ...p]);
    setCards(prev => [...prev, ...c]);
    setCurrentPage(nextPage);
    setHasMore(p.length === ITEMS_PER_PAGE || c.length === ITEMS_PER_PAGE);
    setLoadingMore(false);
  };

  const filteredItems = useMemo(() => {
    const combined = [
      ...products.map(p => ({ ...p, kind: 'product' as const })),
      ...cards.map(c => ({ ...c, kind: 'card' as const }))
    ];

    const filtered = combined.filter(item => {
      const matchesSearch = !searchText || 
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.category.toLowerCase().includes(searchText.toLowerCase());
      
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
    <Layout>
      <div className="relative">
        <PageHero scriptTitle="the" title="phool shop" scriptSubtitle="collection" />
      </div>

      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              className="pl-10 rounded-full border-2 border-foreground bg-card"
            />
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cat === activeCategory ? "pill-btn-primary text-xs" : "pill-btn-outline text-xs"}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="pill-btn-outline text-xs bg-card cursor-pointer"
          >
            <option value="default">Sort: Default</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>

        {/* Product Categories Section */}
        <div className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="retro-card bg-card animate-pulse">
                <div className="aspect-square bg-blush" />
                <div className="p-5">
                  <div className="h-4 w-1/2 bg-muted rounded" />
                  <div className="mt-3 h-6 w-2/3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-script text-4xl text-secondary">No products found</p>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, i) => {
              let img = "";
              if (item.kind === "product") {
                const images = item.images;
                let imgArray: string[] = [];
                if (Array.isArray(images)) imgArray = images;
                else if (typeof images === "string") {
                  try { imgArray = JSON.parse(images || "[]"); } catch { imgArray = []; }
                }
                img = imgArray.find((v) => v && v.trim() !== "") || "";
              } else {
                const images = (item as any).images;
                if (Array.isArray(images)) img = images[0] || "";
                else if (typeof images === "string") {
                  try { img = (JSON.parse(images || "[]")?.[0] as string) || ""; } catch { img = ""; }
                }
              }

              return (
                <motion.div
                  key={`${item.kind}-${item.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <Link to={`/product/${item.id}`} className="group block">
                    <div className="retro-card bg-card hover:shadow-retro transition-all duration-300 hover:-translate-y-1">
                      <div className="aspect-square overflow-hidden bg-blush">
                        {isImageUrl(img) ? (
                          <img
                            src={optimizeImageUrl(img, 400, 75)}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 shimmer-loading"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center">
                            <img 
                              src={getRandomSticker()} 
                              alt="Sticker" 
                              className="w-16 h-16 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-5xl">🌸</div>';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <span className="text-xs pill-btn-outline py-1 px-3 mb-2 inline-block">{item.category}</span>
                        <h3 className="font-heading text-lg text-foreground mt-2">{item.name}</h3>
                        <p className="font-body text-secondary font-bold text-lg mt-1">PKR {item.price}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="pill-btn-primary text-sm px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? 'Loading...' : 'Load More Flowers 🌸'}
            </button>
          </div>
        )}

        {/* End of items message */}
        {!loading && !hasMore && (
          <div className="text-center mt-8 text-muted-foreground">
            <p className="font-heading"></p>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Catalog;
