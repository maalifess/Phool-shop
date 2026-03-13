import { motion } from "framer-motion";
import { useState } from "react";

const products = Array(9).fill(null);

const ShopSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 3) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 3 + products.length) % products.length);
  };

  const getVisibleProducts = () => {
    return [
      products[currentIndex],
      products[(currentIndex + 1) % products.length],
      products[(currentIndex + 2) % products.length]
    ];
  };

  return (
    <section id="shop" className="bg-background py-20 relative">
      {/* Border frame */}
      <div className="absolute inset-4 border-[3px] border-foreground rounded-3xl pointer-events-none" />

      <div className="container mx-auto px-8">
        {/* Section title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-script text-7xl md:text-8xl text-secondary text-center mb-12"
        >
          Shop
        </motion.h2>

        {/* Product slideshow */}
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {getVisibleProducts().map((product, index) => (
              <motion.div
                key={`${currentIndex}-${index}`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="aspect-[4/3] overflow-hidden rounded-3xl border-[3px] border-foreground bg-muted flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="text-center">
                  <div className="text-4xl md:text-6xl mb-4">🌸</div>
                  <div className="w-20 md:w-32 h-2 bg-golden rounded-full mx-auto"></div>
                </div>
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
            {Array.from({ length: 3 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 3)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / 3) === index ? "bg-foreground" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Desktop indicators */}
          <div className="hidden md:flex justify-center gap-2 mt-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 3)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / 3) === index ? "bg-foreground" : "bg-muted"
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
