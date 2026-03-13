import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative bg-background overflow-hidden min-h-[80vh] flex items-center">
      {/* Border frame */}
      <div className="absolute inset-4 border-[3px] border-foreground rounded-3xl pointer-events-none" />

      <div className="container mx-auto px-8 py-16 flex flex-col lg:flex-row items-center justify-between relative z-10">
        {/* Centered text */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.h2
            initial={{ opacity: 0, x: -60, rotate: -10 }}
            animate={{ opacity: 1, x: 0, rotate: -10 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-script text-6xl md:text-7xl lg:text-8xl text-secondary leading-none mb-4"
          >
            خوش آمدید
          </motion.h2>
          <div className="lg:translate-x-8">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="font-heading text-5xl md:text-7xl lg:text-8xl text-foreground leading-tight"
            >
              Phool Shop
            </motion.h1>
          </div>
        </div>

        {/* Right illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: [-3, 3, -3]
          }}
          transition={{
            opacity: { duration: 1, delay: 0.5 },
            scale: { duration: 1, delay: 0.5, type: "spring" },
            rotate: {
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }
          }}
          className="flex-1 flex justify-center lg:justify-end mt-8 lg:mt-0"
        >
          <div className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 flex items-center justify-center overflow-hidden">
            <img src="/assets/branding/girl.png" alt="Sticker" className="w-full h-full object-contain" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
