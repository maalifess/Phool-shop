import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const AboutSection = () => {
  const [currentSticker, setCurrentSticker] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);

  // Total stickers available
  const totalStickers = 26;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false); // Start fade out
      
      setTimeout(() => {
        setCurrentSticker((prev) => (prev % totalStickers) + 1); // Next sticker
        setIsAnimating(true); // Start fade in
      }, 300); // 300ms fade transition
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [totalStickers]);
  return (
    <section id="about" className="bg-[#fcf2e3] py-20 relative">
      {/* Border frame */}
      <div className="absolute inset-4 border-[3px] border-[#6e4248] rounded-3xl pointer-events-none bg-[#fcf2e3]" />

      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-script text-5xl md:text-6xl lg:text-7xl text-foreground mb-8">dher sara pyar</h2>

            <p className="font-heading text-lg text-foreground mb-4">
              Phool Shop isn't your typical crochet store.
            </p>

            <p className="font-body text-base text-foreground mb-4 leading-relaxed">
              It's a club, a living space where stories, handmade creations, and people come together.
            </p>

            <p className="font-body text-base text-foreground mb-8 leading-relaxed">
              Born from a love of craft and creativity, Phool Shop celebrates the beauty of handmade art and the joy of sharing. Here, crochet isn't just a hobby — it's a way of life.
            </p>

            <a href="#" className="pill-btn-primary text-sm" style={{ color: '#fcf2e3' }}>DISCOVER MORE</a>
          </motion.div>

          {/* Right photo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="retro-card rounded-[2rem] overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-500 flex items-center justify-center h-64">
              {/* Animated sticker display */}
              <motion.div
                key={currentSticker}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: isAnimating ? 1 : 0,
                  scale: isAnimating ? 1 : 0.8,
                  rotate: isAnimating ? [-2, 2, -1, 1, 0] : 0
                }}
                transition={{ 
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                  rotate: { duration: 4, repeat: isAnimating ? Infinity : 0, repeatType: "reverse", ease: "easeInOut" }
                }}
                className="w-full h-full flex items-center justify-center p-4"
              >
                <img
                  src={`/assets/stickers/${currentSticker}.png`}
                  alt={`Sticker ${currentSticker}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-8xl">🌸</div>';
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
