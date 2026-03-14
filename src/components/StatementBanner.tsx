import { motion } from "framer-motion";

const StatementBanner = () => {
  return (
    <section className="bg-secondary py-16 md:py-24 relative overflow-hidden section-border-top section-border-bottom">
      {/* Dotted line decorations */}
      <div className="dotted-line absolute top-4 left-0 right-0" />
      <div className="dotted-line absolute bottom-4 left-0 right-0" />

      <div className="container mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-center gap-4"
        >
          {/* Line 1 - "everything" */}
          <motion.div 
            className="flex items-center gap-4 flex-wrap justify-center"
            initial={{ opacity: 0, y: 20, rotate: -1 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 1, 
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.1
            }}
          >
            <motion.span 
              className="font-heading text-4xl md:text-6xl lg:text-7xl" 
              style={{ color: '#FFFAF2' }}
              animate={{
                scale: [1, 1.02, 1],
                y: [0, -1, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              everything
            </motion.span>
          </motion.div>

          {/* Line 2 - "looped with" */}
          <motion.div 
            className="flex items-center gap-4 flex-wrap justify-center"
            initial={{ opacity: 0, y: 20, rotate: 0.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 1, 
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.3
            }}
          >
            <motion.span 
              className="font-heading text-4xl md:text-6xl lg:text-7xl" 
              style={{ color: '#FFFAF2' }}
              animate={{
                scale: [1, 1.015, 1],
                opacity: [0.95, 1, 0.95],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              looped with
            </motion.span>
          </motion.div>

          {/* Line 3 - "dher sara pyar" */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 1.2, 
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.5
            }}
            className="relative"
          >
            <motion.span 
              className="font-heading text-4xl md:text-6xl lg:text-7xl relative inline-block"
              style={{ color: '#FFFAF2' }}
              animate={{
                y: [0, -2, 0],
                rotate: [0, 0.5, -0.5, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                repeatType: "reverse",
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              dher sara {" "}
              <motion.span
                className="inline-block"
                style={{ color: '#cfd9b6' }}
                animate={{
                  scale: [1, 1.08, 1],
                  filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                pyar
              </motion.span>
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatementBanner;
