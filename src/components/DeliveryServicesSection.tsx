import { motion } from "framer-motion";

const DeliveryServicesSection = () => {
  return (
    <div className="w-full lg:w-1/2 bg-[#fcf2e3] py-20 relative min-h-[500px] flex items-center justify-center">
      <div className="absolute inset-4 border-[3px] border-[#6e4248] rounded-3xl pointer-events-none bg-[#f4d6db] z-0" />

      <div className="container mx-auto px-8 relative z-10 flex flex-col items-center justify-center h-full">
        <div className="text-center w-full flex flex-col items-center justify-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center relative z-20"
          >
            <h2 className="font-script text-5xl md:text-6xl text-foreground mb-6" style={{ color: '#6e4248', position: 'relative', zIndex: 30 }}>fundraisers</h2>

            <p className="font-body text-base text-foreground mb-8 leading-relaxed max-w-lg mx-auto" style={{ color: '#6e4248', position: 'relative', zIndex: 30 }}>
              Participate or organize fundraisers with us, giving donors a yaadgaar to remember their kindness and support<br />
              Lets work together in making a better place for everyone, reach out or shop now !!<br />
              a little goes a long way &lt;3
            </p>

            <a href="/fundraisers" className="pill-btn-primary text-sm relative z-30" style={{ color: '#fcf2e3' }}>LEARN MORE</a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryServicesSection;
