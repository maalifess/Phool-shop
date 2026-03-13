import { motion } from "framer-motion";

const DeliveryServicesSection = () => {
  return (
    <div className="w-full lg:w-1/2 bg-[#FFFAF2] py-20 relative">
      <div className="absolute inset-4 border-[3px] border-foreground rounded-3xl pointer-events-none" />

      <div className="container mx-auto px-8">
        <div className="text-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-script text-5xl md:text-6xl text-secondary mb-6">Fundraisers</h2>

            <p className="font-body text-base text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto">
              Support your cause with handmade crochet creations. Perfect for school fundraisers, community events, and charitable organizations.
            </p>

            <a href="/fundraisers" className="pill-btn-primary text-sm">LEARN MORE</a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryServicesSection;
