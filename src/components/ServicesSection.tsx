import { motion } from "framer-motion";

const services = [
  { label: "CUSTOM\nORDERS", shape: "starburst" },
  { label: "CROCHET\nBOUQUETS", shape: "pill" },
  { label: "GIFT\nSETS", shape: "circle" },
  { label: "SPECIAL\nDELIVERY", shape: "pill" },
];

const ServicesSection = () => {
  return (
    <section id="services" className="bg-background py-20 relative">
      <div className="absolute inset-4 border-[3px] border-foreground rounded-3xl pointer-events-none" />

      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - floating service badges */}
          <div className="relative min-h-[400px]">
            {services.map((service, i) => {
              const positions = [
                "top-0 left-8",
                "top-24 left-48",
                "bottom-16 left-4",
                "bottom-0 left-56",
              ];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15, type: "spring" }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`absolute ${positions[i]} cursor-pointer`}
                >
                  {service.shape === "starburst" ? (
                    <div className="starburst bg-golden w-36 h-36 flex items-center justify-center">
                      <span className="font-heading text-sm text-foreground text-center whitespace-pre-line leading-tight">
                        {service.label}
                      </span>
                    </div>
                  ) : service.shape === "circle" ? (
                    <div className="bg-golden rounded-full w-32 h-32 flex items-center justify-center border-2 border-foreground shadow-retro">
                      <span className="font-heading text-sm text-foreground text-center whitespace-pre-line leading-tight">
                        {service.label}
                      </span>
                    </div>
                  ) : (
                    <div className="pill-btn-golden text-xs whitespace-pre-line leading-tight shadow-retro">
                      {service.label}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Right - text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-script text-7xl md:text-8xl text-secondary mb-8">Services</h2>

            <p className="font-body text-base text-muted-foreground mb-8 leading-relaxed max-w-lg">
              From selecting unique handmade pieces to creative custom orders, from gift curation to special deliveries, our services bring warmth and personality to every occasion.
            </p>

            <a href="#" className="pill-btn-primary text-sm">DISCOVER MORE</a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
