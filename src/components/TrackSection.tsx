import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const TrackSection = () => {
  return (
    <section className="bg-background py-20 relative">
      {/* Border frame */}
      <div className="absolute inset-4 border-[3px] border-foreground rounded-3xl pointer-events-none" />

      <div className="container mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="font-heading text-4xl md:text-6xl text-foreground mb-6">
            Track Your Order
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Want to know where your handmade crochet creation is? Track your order status anytime.
          </p>
          <Link 
            to="/track-order" 
            className="pill-btn-primary text-sm md:text-base px-8 py-4 inline-block"
          >
            TRACK ORDER
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TrackSection;
