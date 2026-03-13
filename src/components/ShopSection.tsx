import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { loadProducts } from "@/lib/supabaseProducts";
import { loadCards } from "@/lib/supabaseCards";
import type { Product } from "@/lib/supabaseProducts";
import type { Card as SupabaseCard } from "@/lib/supabaseTypes";

const ShopSection = () => {
  const [products, setProducts] = useState<Array<{image: string, name: string, type: 'product' | 'card'}>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsToShow = 3;

  useEffect(() => {
    const loadItems = async () => {
      try {
        const [productsData, cardsData] = await Promise.all([loadProducts(), loadCards()]);
        
        // Combine products and cards
        const productItems = productsData.slice(0, 6).map(p => ({
          image: p.images[0] || '',
          name: p.name,
          type: 'product' as const
        }));
        
        const cardItems = cardsData.slice(0, 6).map(c => ({
          image: c.images[0] || '',
          name: c.name,
          type: 'card' as const
        }));
        
        // Interleave for variety
        const allItems = [];
        for (let i = 0; i < Math.max(productItems.length, cardItems.length); i++) {
          if (i < productItems.length) allItems.push(productItems[i]);
          if (i < cardItems.length) allItems.push(cardItems[i]);
        }
        
        setProducts(allItems.slice(0, 9)); // Take 9 items for carousel
      } catch (error) {
        console.error('Failed to load items for carousel:', error);
      }
    };
    
    loadItems();
  }, []);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (products.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (products.length === 0) return 0;
        return (prev + 1) % products.length;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [products.length]);

  const nextSlide = () => {
    if (products.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    if (products.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const getVisibleProducts = () => {
    if (products.length === 0) return [null, null, null];
    
    const visible = [];
    for (let i = 0; i < itemsToShow; i++) {
      const index = (currentIndex + i) % products.length;
      visible.push(products[index]);
    }
    return visible;
  };

  return (
    <section id="shop" className="bg-[#8E6E58] py-20 relative" style={{ color: '#D4A8AC' }}>
      {/* Border frame */}
      <div className="absolute inset-4 border-[3px] border-[#FFFAF2] rounded-3xl pointer-events-none bg-[#FFFAF2]" />

      <div className="container mx-auto px-8">
        {/* Section title */}
        <h2
          className="text-6xl md:text-7xl lg:text-8xl font-bold text-center mb-12"
          style={{ 
            color: '#D4A8AC',
            fontFamily: 'Sacramento, cursive, serif',
            display: 'block',
            visibility: 'visible',
            opacity: '1',
            position: 'relative',
            zIndex: '999'
          }}
        >
          Shop
        </h2>

        {/* Product slideshow */}
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {getVisibleProducts().map((product, index) => (
              <motion.div
                key={`${currentIndex}-${index}`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="aspect-[4/3] overflow-hidden rounded-3xl border-[3px] border-foreground flex items-center justify-center cursor-pointer hover:scale-105 transition-transform relative group"
                style={{ backgroundColor: '#F7D9E0' }}
              >
                {product && product.image ? (
                  <>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-heading text-white text-sm md:text-base truncate">{product.name}</h3>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl md:text-6xl mb-4">🌸</div>
                    <div className="w-20 md:w-32 h-2 rounded-full mx-auto" style={{ backgroundColor: '#D4A8AC' }}></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Navigation buttons - visible on md+ */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-foreground text-background border-2 border-foreground hover:bg-transparent hover:text-foreground transition-colors items-center justify-center font-heading text-xl"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-foreground text-background border-2 border-foreground hover:bg-transparent hover:text-foreground transition-colors items-center justify-center font-heading text-xl"
          >
            ›
          </button>

          {/* Mobile swipe indicators */}
          <div className="flex md:hidden justify-center gap-2 mt-6">
            {Array.from({ length: Math.min(3, products.length) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentIndex === index ? "bg-foreground" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Desktop indicators */}
          <div className="hidden md:flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.min(3, products.length) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentIndex === index ? "bg-foreground" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopSection;
