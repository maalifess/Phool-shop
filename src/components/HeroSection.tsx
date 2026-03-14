import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative bg-[#c5878c] overflow-hidden min-h-[80vh] flex items-center">
      {/* Border frame */}
      <div className="absolute inset-4 border-[3px] border-[#6e4248] rounded-3xl pointer-events-none bg-[#fcf2e3]" />

      <div className="container mx-auto px-8 py-16 flex flex-col lg:flex-row items-center justify-between relative z-10">
        {/* Centered text */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              animate={{
                opacity: 1,
                x: 0,
                scale: [1, 1.01, 1],
                y: [0, -1, 0],
              }}
              transition={{ 
                duration: 1.2, 
                ease: [0.25, 0.1, 0.25, 1],
                scale: {
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: [0.4, 0, 0.2, 1]
                },
                y: {
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: [0.4, 0, 0.2, 1]
                }
              }}
              className="font-script text-6xl md:text-7xl lg:text-8xl text-secondary leading-none mb-4"
            >
              خوش آمدید
            </motion.div>
          </div>
          <div className="lg:translate-x-8">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: 1,
                scale: [1, 1.02, 1],
                y: [0, -1.5, 0],
              }}
              transition={{ 
                duration: 1.2, 
                delay: 0.3, 
                ease: [0.25, 0.1, 0.25, 1],
                scale: {
                  duration: 7,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: [0.4, 0, 0.2, 1]
                },
                y: {
                  duration: 7,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: [0.4, 0, 0.2, 1]
                }
              }}
              className="font-heading text-5xl md:text-7xl lg:text-8xl text-[#6e4248] leading-tight"
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
          className="flex-1 flex justify-center lg:justify-end mt-8 lg:mt-0 lg:-translate-x-12"
        >
          <div className="w-48 h-48 md:w-64 md:h-64 lg:w-[450px] lg:h-[450px] flex items-center justify-center overflow-hidden">
            <img src="/assets/branding/girl.png" alt="Sticker" className="w-full h-full object-contain" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
