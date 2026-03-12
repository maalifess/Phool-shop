import { motion } from "framer-motion";
import shopBouquets from "@/assets/shop-bouquets.jpg";
import shopAmigurumi from "@/assets/shop-amigurumi.jpg";
import shopAccessories from "@/assets/shop-accessories.jpg";

const categories = [
  { image: shopBouquets, label: "CROCHET\nBOUQUETS", color: "golden" },
  { image: shopAmigurumi, label: "AMIGURUMI\n& PLUSH", color: "secondary" },
  { image: shopAccessories, label: "ACCESSORIES\n& MORE", color: "golden" },
];

const ShopSection = () => {
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

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ scale: 1.03, rotate: i === 1 ? -1 : 1 }}
              className="retro-card cursor-pointer group relative"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              {/* Label badge */}
              <div className="absolute bottom-6 left-4">
                <div className={`pill-btn-golden text-xs font-heading whitespace-pre-line leading-tight shadow-retro -rotate-3`}>
                  {cat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopSection;
