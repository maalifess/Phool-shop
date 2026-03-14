import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const AboutSection = () => {
  const [currentSticker, setCurrentSticker] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);
  const totalStickers = 26;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);
      
      setTimeout(() => {
        const nextSticker = (currentSticker % totalStickers) + 1;
        setCurrentSticker(nextSticker);
        
        setTimeout(() => {
          setIsAnimating(true);
        }, 100);
      }, 600);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSticker, totalStickers]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-40 items-center min-h-auto">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: "'Nunito', sans-serif" }}
            className="text-center md:text-left"
          >
            <h2 style={{ 
              fontFamily: "'Sacramento', cursive", 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
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
              gap: '0.75rem', 
              marginBottom: '1.5rem'
            }}>
              <p style={{ 
                fontFamily: "'Fredoka One', cursive", 
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', 
                color: '#6e4248',
                lineHeight: '1.4'
              }}>
                Phool Shop isn't your typical crochet store.
              </p>
              
              <p style={{ 
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'clamp(0.875rem, 2vw, 1rem)', 
                color: '#6e4248',
                lineHeight: '1.6'
              }}>
                It's a club, a living space where stories, handmade creations, and people come together.
              </p>
              
              <p style={{ 
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'clamp(0.875rem, 2vw, 1rem)', 
                color: '#6e4248',
                lineHeight: '1.6'
              }}>
                Born from a love of craft and creativity, Phool Shop celebrates the beauty of handmade art and the joy of sharing. Here, crochet isn't just a hobby — it's a way of life.
              </p>
            </div>
            
            <motion.a 
              href="#" 
              className="pill-btn-primary"
              style={{ 
                backgroundColor: '#6e4248', 
                color: '#fcf2e3', 
                padding: '12px 24px', 
                borderRadius: '9999px',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
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
              DISCOVER MORE
            </motion.a>
          </motion.div>

          {/* Right Content - Stickers */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center items-center md:order-last order-first"
          >
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: 'clamp(300px, 80vw, 500px)', 
              height: 'clamp(300px, 80vw, 500px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <motion.div
                key={currentSticker}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: isAnimating ? 1 : 0,
                  scale: isAnimating ? 1 : 0.95,
                }}
                transition={{ 
                  opacity: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
                  scale: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
                }}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  padding: '10px'
                }}
              >
                <motion.img
                  src={`/assets/stickers/${currentSticker}.png`}
                  alt={`Sticker ${currentSticker}`}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    maxWidth: 'clamp(200px, 60vw, 350px)',
                    maxHeight: 'clamp(200px, 60vw, 350px)',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
                  }}
                  animate={{
                    rotate: isAnimating ? [0, 2, -2, 1, -1, 0] : 0,
                    y: isAnimating ? [0, -3, 0] : 0,
                  }}
                  transition={{
                    rotate: { duration: 5, repeat: isAnimating ? Infinity : 0, repeatType: "reverse", ease: [0.4, 0, 0.2, 1] },
                    y: { duration: 4, repeat: isAnimating ? Infinity : 0, repeatType: "reverse", ease: [0.4, 0, 0.2, 1] },
                  }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    if (img.parentElement) {
                      img.parentElement.innerHTML = '<div style="font-size: 48px; color: #6e4248;">🌸</div>';
                    }
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
