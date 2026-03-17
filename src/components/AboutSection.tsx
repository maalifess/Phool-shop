import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="about" style={{ backgroundColor: '#fcf2e3', padding: '60px 0', position: 'relative' }}>
      {/* Decorative border frame */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        bottom: '20px',
        border: '3px solid #6e4248',
        borderRadius: '24px',
        pointerEvents: 'none',
        backgroundColor: '#fcf2e3'
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        <div className="flex flex-col items-center justify-center min-h-auto text-center">
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: "'Nunito', sans-serif", maxWidth: '800px' }}
          >
            <h2 style={{ 
              fontFamily: "'Sacramento', cursive", 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
              color: '#6e4248', 
              marginBottom: '1.5rem',
              lineHeight: '1.2',
              fontWeight: '400'
            }}>
              dher sara pyar
            </h2>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem', 
              marginBottom: '2rem'
            }}>
              <p style={{ 
                fontFamily: "'Fredoka One', cursive", 
                fontSize: 'clamp(1.125rem, 3vw, 1.5rem)', 
                color: '#6e4248',
                lineHeight: '1.4'
              }}>
                from a burned out college kid wanting to make everyone's day, a little brighter &lt;3
              </p>
              
              <p style={{ 
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', 
                color: '#6e4248',
                lineHeight: '1.6'
              }}>
                Phoolshop isn't just a little gift shop, it carries a big piece of my heart, and yours too. To everyone who has ordered, everyone I've made happy, and even those I've occasionally disappointed, thank you for the kindness you've shared. This has been such a lovely journey, and I hope it continues to bloom.
              </p>
              
              <p style={{ 
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', 
                color: '#6e4248',
                lineHeight: '1.6'
              }}>
                My goal isn't just to sell a product. I want to spread kindness and make life just a little bit easier for everyone, every day.
              </p>
              
              <p style={{ 
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', 
                color: '#6e4248',
                lineHeight: '1.6'
              }}>
                Thank you for being a part of this pyar bhara project. &lt;3
              </p>

              <p style={{ 
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', 
                color: '#6e4248',
                lineHeight: '1.6',
                fontStyle: 'italic'
              }}>
                May Allah keep you smiling, always.
              </p>
            </div>
            
            <motion.a 
              href="https://www.instagram.com/phoolshopp/" 
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn-primary"
              style={{ 
                backgroundColor: '#6e4248', 
                color: '#fcf2e3', 
                padding: '14px 32px', 
                borderRadius: '9999px',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
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
