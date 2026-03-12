import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import type { Variants } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Heart, Star, Palette, Gift, Feather, Cloud, Sun, Flower2, Coffee } from "lucide-react";
import Layout from "@/components/Layout";
import { loadProducts } from "@/lib/supabaseProducts";
import { loadCards } from "@/lib/supabaseCards";
import type { Product } from "@/lib/supabaseProducts";
import type { Card as SupabaseCard, Review } from "@/lib/supabaseTypes";
import { loadApprovedReviews } from "@/lib/supabaseReviews";
import confetti from "canvas-confetti";
import { MouseTrail } from "@/components/MouseTrail";

// Import sticker images
import sticker1 from '@/assets/stickers/1.png';
import sticker2 from '@/assets/stickers/2.png';
import sticker3 from '@/assets/stickers/3.png';
import sticker4 from '@/assets/stickers/4.png';
import sticker5 from '@/assets/stickers/5.png';
import sticker6 from '@/assets/stickers/6.png';
import sticker7 from '@/assets/stickers/7.png';
import sticker8 from '@/assets/stickers/8.png';
import sticker9 from '@/assets/stickers/9.png';
import sticker10 from '@/assets/stickers/10.png';
import sticker11 from '@/assets/stickers/11.png';
import sticker12 from '@/assets/stickers/12.png';
import sticker13 from '@/assets/stickers/13.png';
import sticker14 from '@/assets/stickers/14.png';
import sticker15 from '@/assets/stickers/15.png';
import sticker16 from '@/assets/stickers/16.png';
import sticker17 from '@/assets/stickers/17.png';
import sticker18 from '@/assets/stickers/18.png';
import sticker19 from '@/assets/stickers/19.png';
import sticker20 from '@/assets/stickers/20.png';
import sticker21 from '@/assets/stickers/21.png';
import sticker22 from '@/assets/stickers/22.png';
import sticker23 from '@/assets/stickers/23.png';
import sticker24 from '@/assets/stickers/24.png';
import sticker25 from '@/assets/stickers/25.png';
import sticker26 from '@/assets/stickers/26.png';

// Floating element helper tied to scroll (Parallax)
const ParallaxFloater = ({
  children,
  className,
  scrollYProgress,
  speed = 1,
  direction = 1,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  scrollYProgress: any;
  speed?: number;
  direction?: number;
  delay?: number;
}) => {
  // Parallax logic based on scroll
  const yScroll = useTransform(scrollYProgress, [0, 1], [0, 800 * speed * direction]);
  // Additional gentle bobbing animation
  return (
    <motion.div
      style={{ y: yScroll }}
      className={`absolute ${className}`}
    >
      <motion.div
        initial={{ y: 0, x: 0, rotate: 0 }}
        animate={{
          y: [-15, 15, -15],
          x: [-10, 10, -10],
          rotate: [-10, 10, -10]
        }}
        transition={{
          duration: 4 + Math.random() * 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, bounce: 0.4, delay: i * 0.1, duration: 0.8 },
  }),
};

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  }
};

const fireConfetti = () => {
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#BC8F8F', '#a855f7', '#facc15', '#bfdbfe'] // custom pink, purple, yellow, blue
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#BC8F8F', '#a855f7', '#facc15', '#bfdbfe']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

const Index = () => {
  const { scrollYProgress } = useScroll();
  const yHeroText = useTransform(scrollYProgress, [0, 0.4], [0, 150]);
  const opacityHeroText = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // SVG Wave parallax
  const waveX1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const waveX2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const [products, setProducts] = useState<Product[]>([]);
  const [cards, setCards] = useState<SupabaseCard[]>([]);
  const [featuredIndex1, setFeaturedIndex1] = useState(0);
  const [featuredIndex2, setFeaturedIndex2] = useState(1);
  const [featuredIndex3, setFeaturedIndex3] = useState(2);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [audioEnabled, setAudioEnabled] = useState(false);

  // Drag state for stickers - simplified
  const [stickerPositions, setStickerPositions] = useState<Array<{x: number, y: number, rotate: number, width: number, stickerIndex: number}>>([
    // Start with empty array - stickers will be added when dragged from sidebar
  ]);
  const [selectedSticker, setSelectedSticker] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showStickerPanel, setShowStickerPanel] = useState(false);

  // Simple working drag handlers
  const handleStickerMouseDown = (e: React.MouseEvent, index: number) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedSticker(index);
    setIsDragging(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleSidebarMouseDown = (e: React.MouseEvent, stickerIndex: number) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Create new sticker at mouse position
    const container = document.getElementById('sticker-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newSticker = {
      x: e.clientX - containerRect.left - 50,
      y: e.clientY - containerRect.top - 50,
      rotate: 0,
      width: 100,
      stickerIndex
    };
    
    setStickerPositions(prev => [...prev, newSticker]);
    setSelectedSticker(stickerPositions.length);
    setIsDragging(true);
    
    setDragOffset({ x: 50, y: 50 });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isEditMode || selectedSticker === null) return;
    
    const container = document.getElementById('sticker-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    setStickerPositions(prev => {
      const newPositions = [...prev];
      if (newPositions[selectedSticker]) {
        newPositions[selectedSticker] = {
          ...newPositions[selectedSticker],
          x: Math.max(0, Math.min(newX, containerRect.width - newPositions[selectedSticker].width)),
          y: Math.max(0, Math.min(newY, containerRect.height - newPositions[selectedSticker].width))
        };
      }
      return newPositions;
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditMode || selectedSticker === null) return;
      
      const step = e.shiftKey ? 10 : 1;
      
      setStickerPositions(prev => {
        const newPositions = [...prev];
        if (!newPositions[selectedSticker]) return newPositions;
        
        switch(e.key) {
          case 'ArrowUp':
            newPositions[selectedSticker].y = Math.max(0, newPositions[selectedSticker].y - step);
            break;
          case 'ArrowDown':
            newPositions[selectedSticker].y += step;
            break;
          case 'ArrowLeft':
            newPositions[selectedSticker].x = Math.max(0, newPositions[selectedSticker].x - step);
            break;
          case 'ArrowRight':
            newPositions[selectedSticker].x += step;
            break;
          case '+':
          case '=':
            newPositions[selectedSticker].width = Math.min(300, newPositions[selectedSticker].width + 5);
            break;
          case '-':
          case '_':
            newPositions[selectedSticker].width = Math.max(50, newPositions[selectedSticker].width - 5);
            break;
          case 'r':
          case 'R':
            newPositions[selectedSticker].rotate += 15;
            break;
          case 'Delete':
          case 'Backspace':
            newPositions.splice(selectedSticker, 1);
            setSelectedSticker(null);
            break;
        }
        return newPositions;
      });
    };
    
    if (isEditMode) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEditMode, selectedSticker]);

  useEffect(() => {
    if (isEditMode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isEditMode, isDragging, selectedSticker, dragOffset]);

  // Save positions to console
  const savePositions = () => {
    console.log('=== STICKER POSITIONS ===');
    console.log('Copy this array into the code:');
    console.log(JSON.stringify(stickerPositions, null, 2));
    alert(`Positions saved to console! ${stickerPositions.length} stickers exported.`);
  };
  const playPopSound = () => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // high pip
      oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volume (very soft)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) { /* ignore if audio context fails */ }
  };

  const isImageUrl = (v?: string) => {
    if (!v) return false;
    const s = v.trim();
    if (!s) return false;
    return s.startsWith("data:image/") || s.startsWith("http://") || s.startsWith("https://");
  };

  const featuredItems = useMemo(() => {
    const arr: Array<(Product | SupabaseCard) & { kind: "product" | "card" }> = [];
    for (const p of products) arr.push({ ...p, kind: "product" });
    for (const c of cards) arr.push({ ...c, kind: "card" });
    return arr;
  }, [products, cards]);

  const activeFeatured1 = featuredItems.length > 0 ? featuredItems[featuredIndex1 % featuredItems.length] : null;
  const activeFeatured2 = featuredItems.length > 1 ? featuredItems[featuredIndex2 % featuredItems.length] : activeFeatured1;
  const activeFeatured3 = featuredItems.length > 2 ? featuredItems[featuredIndex3 % featuredItems.length] : activeFeatured1;

  useEffect(() => {
    (async () => {
      setFeaturedLoading(true);
      const [p, c] = await Promise.all([loadProducts(), loadCards()]);
      setProducts(p);
      setCards(c);

      setFeaturedIndex1(0);
      setFeaturedIndex2(p.length + c.length > 1 ? 1 : 0);
      setFeaturedIndex3(p.length + c.length > 2 ? 2 : 0);

      setFeaturedLoading(false);
    })();
  }, []);

  const idxRefs = useRef([0, 1, 2]);
  useEffect(() => {
    idxRefs.current = [featuredIndex1, featuredIndex2, featuredIndex3];
  }, [featuredIndex1, featuredIndex2, featuredIndex3]);

  useEffect(() => {
    if (featuredLoading) return;
    if (featuredItems.length <= 3) return; // Need extra items to truly cycle seamlessly

    const len = featuredItems.length;

    const t1 = window.setInterval(() => {
      setFeaturedIndex1((i) => {
        let next = (i + 1) % len;
        let iters = 0;
        while ((next === idxRefs.current[1] || next === idxRefs.current[2]) && iters < len) {
          next = (next + 1) % len;
          iters++;
        }
        return next;
      });
    }, 5000);

    const t2 = window.setInterval(() => {
      setFeaturedIndex2((i) => {
        let next = (i + 1) % len;
        let iters = 0;
        while ((next === idxRefs.current[0] || next === idxRefs.current[2]) && iters < len) {
          next = (next + 1) % len;
          iters++;
        }
        return next;
      });
    }, 6500);

    const t3 = window.setInterval(() => {
      setFeaturedIndex3((i) => {
        let next = (i + 1) % len;
        let iters = 0;
        while ((next === idxRefs.current[0] || next === idxRefs.current[1]) && iters < len) {
          next = (next + 1) % len;
          iters++;
        }
        return next;
      });
    }, 8500);

    return () => {
      window.clearInterval(t1);
      window.clearInterval(t2);
      window.clearInterval(t3);
    };
  }, [featuredLoading, featuredItems.length]);

  useEffect(() => {
    (async () => {
      setReviewsLoading(true);
      const next = await loadApprovedReviews();
      setReviews(next);
      setReviewsLoading(false);
    })();
  }, []);

  return (
    <Layout>
      <MouseTrail />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 min-h-[70vh] flex items-center justify-center" style={{backgroundColor: '#FFF5EE'}}>
        {/* Polka Dot Background Pattern - Only in Hero Section */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle, #EFD8D6 4px, transparent 4px)`,
          backgroundSize: '60px 60px',
          height: '100%'
        }} />

        <motion.div
          style={{ y: yHeroText, opacity: opacityHeroText }}
          className="container relative z-20 max-w-6xl mx-auto px-4"
        >
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={popIn}
              className="mb-6"
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.5 }}
              className="mb-4 relative"
            >
              <motion.div
                className="text-7xl md:text-9xl text-[#f472b6] drop-shadow-md mb-4"
                style={{ fontFamily: '"Great Vibes", cursive' }}
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Phool Shop
              </motion.div>
              <h1 className="font-display text-5xl md:text-7xl font-medium leading-tight tracking-tight drop-shadow-sm" style={{color: '#91766E'}}>
                Creating cozy moments,
                <br />
                <span style={{color: '#91766E'}}>
                  one soft stitch at a time.
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="max-w-2xl text-xl leading-relaxed md:text-2xl mt-8 font-medium"
              style={{color: '#91766E'}}
            >
              Discover adorable crochet creations made entirely by hand. From sweet amigurumi friends to warm, cuddly blankets.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="flex flex-wrap gap-6 justify-center mt-12"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={playPopSound}
              >
                <Button asChild onClick={fireConfetti} size="lg" className="rounded-full px-10 h-16 text-xl bg-gradient-to-r from-[#BC8F8F] to-[#EFD8D6] hover:from-[#BC8F8F] hover:to-[#F7F3ED] border-none shadow-xl shadow-[#EFD8D6]/40 cursor-none">
                  <Link to="/catalog">
                    Shop Collection <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={playPopSound}
              >
                <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-16 text-xl bg-white/60 backdrop-blur-xl border-[#EFD8D6] border-2 text-[#BC8F8F] hover:bg-white hover:text-[#BC8F8F] shadow-lg shadow-[#EFD8D6]/20 cursor-none">
                  <Link to="/custom-orders">
                    <Sparkles className="mr-2 h-6 w-6 text-purple-400" /> Custom Orders
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scattered Stickers */}
        <div id="sticker-container" className="absolute inset-0 pointer-events-none z-10">
          {/* Edit Controls - Minimal */}
          <div className="absolute top-4 left-4 z-50 pointer-events-auto">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  isEditMode 
                    ? 'bg-pink-500 text-white hover:bg-pink-600' 
                    : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                }`}
              >
                {isEditMode ? '✓ Done' : '✏️ Edit'}
              </button>
              {isEditMode && (
                <>
                  <button
                    onClick={() => setShowStickerPanel(!showStickerPanel)}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      showStickerPanel 
                        ? 'bg-purple-500 text-white hover:bg-purple-600' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    🎨 Stickers
                  </button>
                  <button
                    onClick={savePositions}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm transition-colors"
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={() => setStickerPositions([])}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm transition-colors"
                  >
                    🗑️ Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Sticker Top Panel */}
          {isEditMode && showStickerPanel && (
            <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur shadow-xl border-b border-pink-200 z-40 pointer-events-auto">
              <div className="p-2 border-b border-pink-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-pink-600">🎨 Drag stickers onto the screen</h3>
                <button
                  onClick={() => setShowStickerPanel(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-16 overflow-y-auto p-2">
                <div className="flex gap-1 flex-wrap">
                  {[
                    sticker1, sticker2, sticker3, sticker4, sticker5, sticker6, sticker7, sticker8,
                    sticker9, sticker10, sticker11, sticker12, sticker13, sticker14, sticker15, sticker16,
                    sticker17, sticker18, sticker19, sticker20, sticker21, sticker22, sticker23, sticker24,
                    sticker25, sticker26
                  ].map((sticker, index) => (
                    <div
                      key={`sidebar-sticker-${index}`}
                      className="relative group cursor-grab active:cursor-grabbing flex-shrink-0"
                      onMouseDown={(e) => handleSidebarMouseDown(e, index)}
                    >
                      <img
                        src={sticker}
                        alt={`Sticker ${index + 1}`}
                        className="w-10 h-10 object-contain border border-gray-200 rounded group-hover:border-pink-300 group-hover:shadow-sm transition-all"
                      />
                      <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-3 h-3 rounded-full flex items-center justify-center font-bold text-[8px]">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stickers - Simplified Working Version */}
          {stickerPositions.map((sticker, index) => {
            const stickerImages = [
              sticker1, sticker2, sticker3, sticker4, sticker5, sticker6, sticker7, sticker8,
              sticker9, sticker10, sticker11, sticker12, sticker13, sticker14, sticker15, sticker16,
              sticker17, sticker18, sticker19, sticker20, sticker21, sticker22, sticker23, sticker24,
              sticker25, sticker26
            ];
            
            const isSelected = selectedSticker === index;
            
            return (
              <div
                key={`sticker-${index}`}
                className={`absolute ${isEditMode ? 'pointer-events-auto' : 'pointer-events-none'}`}
                style={{
                  left: `${sticker.x}px`,
                  top: `${sticker.y}px`,
                  width: `${sticker.width}px`,
                  transform: `rotate(${sticker.rotate}deg)`,
                  zIndex: isSelected ? 100 : 10,
                  cursor: isEditMode ? 'grab' : 'default',
                  userSelect: 'none'
                }}
                onMouseDown={(e) => handleStickerMouseDown(e, index)}
              >
                {/* Selection area */}
                <div 
                  className={`absolute border-4 rounded-xl transition-all duration-200 ${
                    isSelected 
                      ? 'border-pink-500 bg-pink-100/30 shadow-xl' 
                      : 'border-transparent hover:border-pink-300 hover:bg-pink-50/20'
                  }`}
                  style={{
                    top: '-15px',
                    left: '-15px',
                    right: '-15px',
                    bottom: '-15px',
                  }}
                />
                
                {/* Sticker image */}
                <img 
                  src={stickerImages[sticker.stickerIndex]}
                  alt={`Sticker ${sticker.stickerIndex + 1}`}
                  className="w-full h-auto object-contain drop-shadow-lg pointer-events-none"
                  style={{ 
                    imageRendering: 'crisp-edges',
                  }}
                />
                
                {/* Controls for selected sticker */}
                {isSelected && isEditMode && (
                  <>
                    {/* Sticker number */}
                    <div className="absolute -top-8 left-0 bg-pink-500 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg">
                      #{sticker.stickerIndex + 1}
                    </div>
                    
                    {/* Size indicator */}
                    <div className="absolute -top-8 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                      {Math.round(sticker.width)}px
                    </div>
                    
                    {/* Rotation indicator */}
                    <div className="absolute top-0 left-0 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                      {sticker.rotate}°
                    </div>
                    
                    {/* Delete button */}
                    <button
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg text-xs font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStickerPositions(prev => prev.filter((_, i) => i !== index));
                        setSelectedSticker(null);
                      }}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* Featured Products */}
      <section className="py-8 md:py-12 relative" style={{backgroundColor: '#F7F3ED', color: '#BC8F8F'}}>
        <div className="container max-w-7xl relative z-10 px-4">
          <div className="flex flex-col items-center text-center mb-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
              <motion.h2 variants={fadeUp} custom={1} className="font-display text-4xl font-medium tracking-tight md:text-5xl" style={{color: '#BC8F8F'}}>
                Featured Items
              </motion.h2>
            </motion.div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="w-full">
            {featuredLoading ? (
              <div className="text-center text-slate-400 flex justify-center items-center h-64">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                  className="rounded-full h-12 w-12 border-b-4 border-[#BC8F8F] mr-4"
                />
                <span className="text-xl font-medium" style={{color: '#BC8F8F'}}>Loading cuteness...</span>
              </div>
            ) : featuredItems.length === 0 ? (
              <div className="text-center bg-[#EFD8D6] rounded-[3rem] p-16 font-medium text-xl" style={{color: '#BC8F8F'}}>No products available yet.</div>
            ) : (
              <div className="mx-auto rounded-[3rem] bg-gradient-to-br from-[#EFD8D6] via-[#F7F3ED] to-[#EFD8D6] p-3 md:p-8 shadow-xl border-4 border-white max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Carousel Slots mapping */}
                  {[
                    { activeItem: activeFeatured1, index: featuredIndex1, setIndex: setFeaturedIndex1 },
                    { activeItem: activeFeatured2, index: featuredIndex2, setIndex: setFeaturedIndex2 },
                    { activeItem: activeFeatured3, index: featuredIndex3, setIndex: setFeaturedIndex3 }
                  ].map((slot, slotIndex) => (
                    <div key={`slot-${slotIndex}`} className="relative bg-white/90 rounded-[2.5rem] shadow-sm flex flex-col items-center p-6 border-2 border-[#EFD8D6]/50 backdrop-blur-xl hover:shadow-2xl hover:shadow-[#BC8F8F]/20 transition-all duration-500 min-h-[480px]">

                      <div className="flex-1 w-full flex flex-col justify-start">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${slot.activeItem?.kind ?? ""}-${slot.activeItem?.id ?? ""}-${slotIndex}`}
                            initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)", y: 20 }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)", y: -20 }}
                            transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                            className="flex flex-col items-center w-full"
                          >
                            {/* Image Container */}
                            <motion.div
                              whileHover={{ scale: 1.05, rotate: [-2, 2, -2, 2, 0] }}
                              transition={{ duration: 0.5 }}
                              className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-[2rem] bg-[#EFD8D6] shadow-inner group border-[6px] border-[#EFD8D6] mx-auto mb-6"
                            >
                              {(() => {
                                const images = slot.activeItem?.images;
                                let imgArray: string[] = [];
                                if (Array.isArray(images)) {
                                  imgArray = images;
                                } else if (typeof images === 'string') {
                                  try {
                                    imgArray = JSON.parse(images || '[]');
                                  } catch {
                                    imgArray = [];
                                  }
                                }
                                const img = imgArray.find((v) => v && v.trim() !== "") || "";
                                return isImageUrl(img) ? (
                                  <motion.img
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.8 }}
                                    src={img}
                                    alt={slot.activeItem?.name ?? ""}
                                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                    fetchPriority="high"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-sm text-[#f9a8d4] gap-3">
                                    <Heart className="w-12 h-12 text-[#fbcfe8] fill-[#fbcfe8]" />
                                  </div>
                                );
                              })()}
                              {/* Tags */}
                              <motion.div
                                animate={{ rotate: [-5, 5, -5] }}
                                transition={{ repeat: Infinity, duration: 2 + slotIndex, ease: "easeInOut" }} // stagger tag animation speeds
                                className="absolute top-3 left-3 bg-gradient-to-r from-[#BC8F8F] to-[#EFD8D6] px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-medium text-white shadow-lg flex items-center gap-1.5 transform origin-bottom-left"
                              >
                                <Star className="w-3 h-3 fill-white" />
                                {slot.activeItem?.kind === "card" ? "Card" : "Product"}
                              </motion.div>
                            </motion.div>

                            {/* Content */}
                            <div className="flex flex-col flex-1 w-full text-center items-center justify-between px-2">
                              <div>
                                <motion.h3
                                  className="font-display text-2xl sm:text-3xl font-medium leading-tight text-[#BC8F8F] drop-shadow-sm line-clamp-2 min-h-[3rem]"
                                >
                                  {slot.activeItem?.name}
                                </motion.h3>
                                <motion.div
                                  className="mt-3 text-xl font-medium text-[#BC8F8F] bg-[#EFD8D6] border-2 border-[#EFD8D6] w-fit px-5 py-1.5 rounded-full mx-auto"
                                >
                                  PKR {slot.activeItem?.price}
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Static Controls */}
                      <div className="w-full flex-shrink-0 flex flex-col items-center mt-6 px-2">
                        <motion.div onHoverStart={playPopSound} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="w-full">
                          <Button onClick={fireConfetti} asChild className="rounded-full w-full h-14 text-base font-medium bg-[#BC8F8F] hover:bg-[#BC8F8F] shadow-lg shadow-[#BC8F8F]/30 cursor-none">
                            <Link to={`/product/${slot.activeItem?.id}`}>View Details</Link>
                          </Button>
                        </motion.div>

                        {/* Manual Controls for this specific slot */}
                        <div className="flex items-center gap-3 mt-6">
                          <motion.div onHoverStart={playPopSound} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.8 }}>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="rounded-full h-10 w-10 border-2 border-[#EFD8D6] text-[#BC8F8F] hover:bg-[#F7F3ED] shadow-sm cursor-none"
                              onClick={() => {
                                let prev = (slot.index - 1 + featuredItems.length) % featuredItems.length;
                                let len = featuredItems.length;
                                let count = 0;
                                while ((prev === idxRefs.current[(slotIndex + 1) % 3] || prev === idxRefs.current[(slotIndex + 2) % 3]) && count < len) {
                                  prev = (prev - 1 + len) % len;
                                  count++;
                                }
                                slot.setIndex(prev);
                              }}
                            >
                              <ArrowRight className="h-4 w-4 rotate-180" />
                            </Button>
                          </motion.div>

                          <div className="flex gap-1.5">
                            {featuredItems.slice(0, 5).map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  playPopSound();
                                  slot.setIndex(idx);
                                }}
                                className="cursor-none"
                              >
                                <motion.div
                                  className={`h-2 rounded-full ${idx === (slot.index % featuredItems.length) ? "bg-[#BC8F8F] w-6" : "bg-[#EFD8D6] w-2"}`}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                />
                              </button>
                            ))}
                          </div>

                          <motion.div onHoverStart={playPopSound} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.8 }}>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="rounded-full h-10 w-10 border-2 border-[#EFD8D6] text-[#BC8F8F] hover:bg-[#F7F3ED] shadow-sm cursor-none"
                              onClick={() => {
                                let next = (slot.index + 1) % featuredItems.length;
                                let len = featuredItems.length;
                                let count = 0;
                                while ((next === idxRefs.current[(slotIndex + 1) % 3] || next === idxRefs.current[(slotIndex + 2) % 3]) && count < len) {
                                  next = (next + 1) % len;
                                  count++;
                                }
                                slot.setIndex(next);
                              }}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Our Story - Highly Animated with Exact Palette */}
      <section className="relative overflow-hidden py-16 md:py-20" style={{backgroundColor: '#F7F3ED', color: '#BC8F8F'}}>
        <div className="container max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
            className="overflow-hidden rounded-[3rem] bg-white/90 shadow-2xl shadow-purple-200/50 border-4 border-white backdrop-blur-xl"
          >
            <div className="grid gap-0 md:grid-cols-2">
              <div className="p-10 md:p-16 flex flex-col justify-center bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#fdf2f8]">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 text-pink-500 mb-4"
                >
                  <div className="p-2 bg-[#fce7f3] rounded-full">
                    <Palette className="h-6 w-6 text-[#ec4899]" />
                  </div>
                  <span className="text-sm font-medium uppercase tracking-widest text-[#ec4899]">Our Story</span>
                </motion.div>

                <motion.h2
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 font-display text-4xl md:text-5xl font-medium tracking-tight text-[#1e293b]"
                >
                  The Art of Slow Craft
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 text-xl leading-relaxed text-[#475569] font-medium"
                >
                  Phool means "flower" — and just like flowers, every crochet piece we create blossoms with intention and beauty.
                  We believe in sustainable, slow craft, and the joy of gifting handmade pieces that last a lifetime.
                </motion.p>

                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5, rotate: [0, -3, 3, -3, 0] }}
                    className="bg-white p-6 rounded-[2rem] shadow-lg shadow-pink-100/50 border-2 border-pink-50"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#ffe4e6] flex items-center justify-center mb-4">
                      <Feather className="w-7 h-7 text-[#fb7185]" />
                    </div>
                    <p className="font-medium text-xl text-[#1e293b]">Soft Fibers</p>
                    <p className="mt-2 text-base text-[#64748b] font-medium">Premium yarns chosen for utmost comfort.</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5, rotate: [0, 3, -3, 3, 0] }}
                    className="bg-white p-6 rounded-[2rem] shadow-lg shadow-purple-100/50 border-2 border-purple-50"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#ede9fe] flex items-center justify-center mb-4">
                      <Sparkles className="w-7 h-7 text-[#a855f7]" />
                    </div>
                    <p className="font-medium text-xl text-[#1e293b]">Unique Details</p>
                    <p className="mt-2 text-base text-[#64748b] font-medium">No two are exactly the same. Every stitch is human.</p>
                  </motion.div>
                </div>
              </div>

              <div className="relative min-h-[400px] md:h-full hidden md:block overflow-hidden bg-gradient-to-br from-[#fbcfe8] via-[#e9d5ff] to-[#fecdd3] p-8">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                {/* Visual Magic Elements */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 mix-blend-overlay">
                  <div className="text-[25rem] text-white" style={{ fontFamily: '"Great Vibes", cursive' }}>P</div>
                </div>
                {/* Floating parallax decorative elements */}
                <ParallaxFloater scrollYProgress={scrollYProgress} delay={0} speed={0.4} className="top-[20%] left-[20%]">
                  <div className="w-32 h-32 rounded-full bg-white/40 backdrop-blur-md shadow-xl border-2 border-white/50 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-[#f472b6]" />
                  </div>
                </ParallaxFloater>
                <ParallaxFloater scrollYProgress={scrollYProgress} delay={1.5} speed={0.6} direction={-1} className="bottom-[20%] right-[15%]">
                  <div className="w-40 h-40 rounded-full bg-white/50 backdrop-blur-md shadow-xl border-2 border-white/50 flex items-center justify-center">
                    <Coffee className="w-16 h-16 text-[#a855f7]" />
                  </div>
                </ParallaxFloater>
                <ParallaxFloater scrollYProgress={scrollYProgress} delay={0.8} speed={0.3} className="top-[30%] right-[10%]">
                  <div className="w-20 h-20 rounded-full bg-[#fef3c7]/50 backdrop-blur-md shadow-lg border-2 border-white/50 flex items-center justify-center">
                    <Star className="w-8 h-8 text-[#facc15]" />
                  </div>
                </ParallaxFloater>
                <ParallaxFloater scrollYProgress={scrollYProgress} delay={2} speed={0.5} direction={-1} className="bottom-[10%] left-[10%]">
                  <div className="w-24 h-24 rounded-full bg-[#bfdbfe]/50 backdrop-blur-md shadow-lg border-2 border-white/50 flex items-center justify-center">
                    <Cloud className="w-10 h-10 text-[#60a5fa]" />
                  </div>
                </ParallaxFloater>
              </div>
            </div>
          </motion.div>
        </div>

      </section>

      {/* Testimonials - Bouncy Spring Animations */}
      <section className="py-16 md:py-20 relative" style={{backgroundColor: '#F7F3ED', color: '#BC8F8F'}}>
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-center"
          >
            <h2 className="font-display text-5xl font-medium tracking-tight md:text-6xl" style={{color: '#91766E'}}>
              Customer Reviews
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mt-20 grid gap-8 md:grid-cols-3"
          >
            {reviewsLoading ? (
              <div className="col-span-full text-center text-[#94a3b8] font-medium text-xl">Loading sweet words...</div>
            ) : reviews.length === 0 ? (
              <div className="col-span-full text-center text-[#94a3b8] bg-[#f8fafc] rounded-[3rem] p-16 font-medium text-xl">No reviews yet. Check back soon!</div>
            ) : (
              reviews.slice(0, 3).map((r, i) => (
                <motion.div
                  key={r.id}
                  variants={fadeUp}
                  custom={i + 1}
                  whileHover={{ y: -15, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onHoverStart={playPopSound}
                >
                  {/* Matching exact Strict Color Palette requested */}
                  <Card className="h-full border-none shadow-2xl shadow-[#EFD8D6]/50 rounded-[2.5rem] bg-gradient-to-b from-[#ffffff] to-[#F7F3ED] overflow-hidden relative cursor-none">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#BC8F8F] via-[#EFD8D6] to-[#BC8F8F]" />
                    <CardContent className="flex h-full flex-col p-10 pt-12">
                      <div className="flex gap-1.5 mb-6 bg-[#EFD8D6]/30 border border-[#BC8F8F]/20 w-fit px-4 py-2 rounded-full">
                        {Array.from({ length: Math.max(1, Math.min(5, r.rating)) }).map((_, j) => (
                          <Star key={j} className="h-5 w-5 fill-[#BC8F8F] text-[#BC8F8F]" />
                        ))}
                      </div>
                      <p className="flex-1 text-[#475569] leading-relaxed text-xl font-medium italic">
                        "{r.comment}"
                      </p>
                      <div className="mt-10 flex items-center gap-4 border-t border-[#f1f5f9] pt-6">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f9a8d4] to-[#c084fc] flex items-center justify-center text-white font-medium font-display text-2xl shadow-md border-2 border-white">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-lg font-medium text-[#1e293b]">{r.name}</p>
                          <div className="flex text-[#ec4899] text-sm font-medium mt-1 items-center gap-1">
                            <Heart className="w-3.5 h-3.5 fill-[#ec4899]" /> Verified Buyer
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>

          {reviews.length > 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f8fafc] text-[#64748b] font-medium text-lg border-2 border-slate-100">
                <Heart className="w-5 h-5 text-[#f472b6] fill-[#f472b6]" />
                + {reviews.length - 3} more happy customers!
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
