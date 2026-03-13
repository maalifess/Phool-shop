import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="about" className="bg-background py-20 relative">
      {/* Border frame */}
      <div className="absolute inset-4 border-[3px] border-foreground rounded-3xl pointer-events-none" />

      {/* TV decoration top-right */}
      <motion.div
        className="absolute top-8 right-8 w-16 md:w-24 z-10 text-4xl md:text-6xl"
        initial={{ opacity: 0, rotate: 15 }}
        whileInView={{ opacity: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        📺
      </motion.div>

      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-script text-5xl md:text-6xl lg:text-7xl text-secondary mb-8">the phool shop story book</h2>

            <p className="font-heading text-lg text-foreground mb-4">
              Phool Shop isn't your typical crochet store.
            </p>

            <p className="font-body text-base text-muted-foreground mb-4 leading-relaxed">
              It's a club, a living space where stories, handmade creations, and people come together.
            </p>

            <p className="font-body text-base text-muted-foreground mb-8 leading-relaxed">
              Born from a love of craft and creativity, Phool Shop celebrates the beauty of handmade art and the joy of sharing. Here, crochet isn't just a hobby — it's a way of life.
            </p>

            <a href="#" className="pill-btn-primary text-sm">DISCOVER MORE</a>
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
              <span className="text-8xl">🌸</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
