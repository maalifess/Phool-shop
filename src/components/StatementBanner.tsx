import { motion } from "framer-motion";
import couchIllustration from "@/assets/couch-illustration.png";
import cabinetIllustration from "@/assets/cabinet-illustration.png";

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
            <span className="font-heading text-4xl md:text-6xl lg:text-7xl text-primary-foreground uppercase">YOUR</span>
            <img src={couchIllustration} alt="" className="h-16 md:h-24 animate-wiggle" />
            <span className="font-heading text-4xl md:text-6xl lg:text-7xl text-primary-foreground uppercase">SPACE</span>
          </div>
          {/* Line 2 */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <img src={cabinetIllustration} alt="" className="h-16 md:h-24 animate-wiggle" />
            <span className="font-heading text-4xl md:text-6xl lg:text-7xl text-primary-foreground uppercase">ISN'T BORING,</span>
          </div>
          {/* Line 3 */}
          <span className="font-heading text-4xl md:text-6xl lg:text-7xl text-primary-foreground uppercase">
            IT'S JUST NOT <span className="text-golden">PHOOL</span>
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default StatementBanner;
