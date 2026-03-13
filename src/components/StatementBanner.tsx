import { motion } from "framer-motion";

const StatementBanner = () => {
  return (
    <section className="bg-secondary py-16 md:py-24 relative overflow-hidden section-border-top section-border-bottom">
      {/* Dotted line decorations */}
      <div className="dotted-line absolute top-4 left-0 right-0" />
      <div className="dotted-line absolute bottom-4 left-0 right-0" />

      <div className="container mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Line 1 */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="font-heading text-4xl md:text-6xl lg:text-7xl text-primary-foreground">everything</span>
          </div>
          {/* Line 2 */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="font-heading text-4xl md:text-6xl lg:text-7xl text-primary-foreground">looped with</span>
          </div>
          {/* Line 3 */}
          <span className="font-heading text-4xl md:text-6xl lg:text-7xl text-primary-foreground">
            dher sara <span className="text-golden">pyar</span>
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default StatementBanner;
