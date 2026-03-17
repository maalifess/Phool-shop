import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="about" className="bg-[#fcf2e3] py-12 md:py-20 relative overflow-hidden">
      {/* Decorative border frame */}
      <div className="absolute inset-4 md:inset-6 border-[3px] border-[#6e4248] rounded-[24px] md:rounded-[32px] pointer-events-none bg-[#fcf2e3] z-0" />

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[800px] flex flex-col items-center"
          >
            <h2 className="font-script text-[#6e4248] mb-6 md:mb-8 leading-tight font-normal"
                style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)' }}>
              dher sara pyar
            </h2>
            
            <div className="flex flex-col gap-4 md:gap-6 mb-8 md:mb-12">
              <p className="font-fredoka text-[#6e4248] leading-snug"
                 style={{ fontSize: 'clamp(1.125rem, 4vw, 1.75rem)' }}>
                from a burned out college kid wanting to make everyone's day, a little brighter &lt;3
              </p>
              
              <p className="font-body text-[#6e4248] leading-relaxed"
                 style={{ fontSize: 'clamp(0.95rem, 3vw, 1.125rem)' }}>
                Phoolshop isn't just a little gift shop, it carries a big piece of my heart, and yours too. To everyone who has ordered, everyone I've made happy, and even those I've occasionally disappointed, thank you for the kindness you've shared. This has been such a lovely journey, and I hope it continues to bloom.
              </p>
              
              <p className="font-body text-[#6e4248] leading-relaxed"
                 style={{ fontSize: 'clamp(0.95rem, 3vw, 1.125rem)' }}>
                My goal isn't just to sell a product. I want to spread kindness and make life just a little bit easier for everyone, every day.
              </p>
              
              <p className="font-body text-[#6e4248] leading-relaxed"
                 style={{ fontSize: 'clamp(0.95rem, 3vw, 1.125rem)' }}>
                Thank you for being a part of this pyar bhara project. &lt;3
              </p>

              <p className="font-body text-[#6e4248] leading-relaxed italic"
                 style={{ fontSize: 'clamp(0.95rem, 3vw, 1.125rem)' }}>
                May Allah keep you smiling, always.
              </p>
            </div>
            
            <motion.a 
              href="https://www.instagram.com/phoolshopp/" 
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn-primary w-full sm:w-auto"
              style={{ 
                backgroundColor: '#6e4248', 
                color: '#fcf2e3', 
                padding: '16px 40px', 
                borderRadius: '9999px',
                fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block',
                fontFamily: "'Nunito', sans-serif",
                transition: 'all 0.3s ease',
                boxShadow: '4px 4px 0px #6e4248',
                border: '2px solid #6e4248'
              }}
              whileHover={{ 
                transform: 'translate(-2px, -2px)',
                boxShadow: '6px 6px 0px #6e4248'
              }}
              whileTap={{ 
                transform: 'translate(0px, 0px)',
                boxShadow: '2px 2px 0px #6e4248'
              }}
            >
              FOLLOW ON INSTAGRAM
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
