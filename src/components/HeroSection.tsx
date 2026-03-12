import { motion } from "framer-motion";
import heroVan from "@/assets/hero-van.png";

const HeroSection = () => {
  return (
    <section className="relative bg-background overflow-hidden min-h-[80vh] flex items-center">
      {/* Border frame */}
      <div className="absolute inset-4 border-[3px] border-foreground rounded-3xl pointer-events-none" />

      <div className="container mx-auto px-8 py-16 flex flex-col lg:flex-row items-center justify-between relative z-10">
        {/* Left text */}
        <div className="flex-1">
          <motion.h2
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-script text-7xl md:text-8xl lg:text-9xl text-secondary leading-none"
          >
            Welcome to
          </motion.h2>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl text-foreground uppercase leading-tight mt-4"
          >
            PHOOL<br />SHOP
          </motion.h1>
        </div>

        {/* Right illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.5, type: "spring" }}
          className="flex-1 flex justify-center lg:justify-end mt-8 lg:mt-0"
        >
          <img
            src={heroVan}
            alt="Phool Shop delivery van with crochet goods"
            className="w-80 md:w-96 lg:w-[28rem] animate-float"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
