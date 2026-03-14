import { motion } from "framer-motion";

const DeliveryServicesSection = () => {
  return (
    <div className="w-full lg:w-1/2 bg-[#fcf2e3] py-20 relative min-h-[500px] flex items-center justify-center">
      {/* Decorative border frame */}
      <div className="absolute inset-4 border-[3px] border-[#6e4248] rounded-3xl pointer-events-none bg-[#f4d6db] z-0" />

      <div className="container mx-auto px-8 relative z-10 flex flex-col items-center justify-center h-full">
        <div className="text-center w-full flex flex-col items-center justify-center">
          {/* Main content with cute animations */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -0.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 1.2, 
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="flex flex-col items-center justify-center relative z-20"
            whileHover={{ scale: 1.01, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }}
          >
            {/* Animated heading */}
            <motion.h2 
              className="font-script text-5xl md:text-6xl text-foreground mb-6" 
              style={{ color: '#6e4248', position: 'relative', zIndex: 30 }}
              animate={{
                y: [0, -1.5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <motion.span
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                fundraisers
              </motion.span>
            </motion.h2>

            {/* Animated paragraph */}
            <motion.p 
              className="font-body text-base text-foreground mb-8 leading-relaxed max-w-lg mx-auto" 
              style={{ color: '#6e4248', position: 'relative', zIndex: 30 }}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.span
                animate={{
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                Participate or organize fundraisers with us, giving donors a yaadgaar to remember their kindness and support<br />
              </motion.span>
              <motion.span
                className="inline-block"
                animate={{
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: [0.4, 0, 0.2, 1]
                }}
                style={{ color: '#6e4248' }}
              >
                Lets work together in making a better place for everyone, reach out or shop now !!<br />
              </motion.span>
              <motion.span
                className="inline-block"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: [0.4, 0, 0.2, 1]
                }}
                style={{ color: '#c5878c' }}
              >
                a little goes a long way
              </motion.span>
            </motion.p>

            {/* Animated button */}
            <motion.a 
              href="/fundraisers" 
              className="pill-btn-primary text-sm relative z-30" 
              style={{ color: '#fcf2e3', backgroundColor: '#6e4248' }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ 
                scale: 1.03, 
                backgroundColor: '#c5878c',
                transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                animate={{
                  x: [0, 0.5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                LEARN MORE
              </motion.span>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryServicesSection;
