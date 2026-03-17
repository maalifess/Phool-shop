import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loadProductWithReviews, loadProducts, loadProductById, loadProductFast, loadCardFast, optimizeImageUrl } from "@/lib/supabaseProducts";
import { loadCardById, loadCards } from "@/lib/supabaseCards";
import type { Product, ProductWithReviews } from "@/lib/supabaseProducts";
import type { Card as SupabaseCard } from "@/lib/supabaseTypes";
import { useCart } from "@/lib/cart";
import { loadApprovedReviews, createReview } from "@/lib/supabaseReviews";
import type { Review } from "@/lib/supabaseTypes";
import { Share2, X, Copy, Check, ShoppingBag } from "lucide-react";

// Simple confetti animation component
const Confetti = ({ buttonRef }: { buttonRef: React.RefObject<HTMLButtonElement> }) => {
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const pieces = [...Array(30)].map((_, i) => ({
      id: i,
      x: centerX + (Math.random() - 0.5) * rect.width,
      y: centerY + (Math.random() - 0.5) * rect.height,
      color: ['#ec4899', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 6)]
    }));

    setConfettiPieces(pieces);
  }, [buttonRef]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: piece.x,
            y: piece.y,
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: piece.x + (Math.random() - 0.5) * 200,
            y: piece.y + (Math.random() - 0.5) * 200,
            scale: 1,
            rotate: Math.random() * 360,
            opacity: 0
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut"
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const pid = Number(id);
  const [product, setProduct] = useState<Product | SupabaseCard | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [index, setIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [showAddAnim, setShowAddAnim] = useState(false);
  const [auto, setAuto] = useState(true);
  const [customText, setCustomText] = useState("");
  const [customLimit, setCustomLimit] = useState(150);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewAnim, setReviewAnim] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Related products state
  const [relatedProducts, setRelatedProducts] = useState<(Product | SupabaseCard)[]>([]);

  // Social sharing state
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isImageUrl = (v?: string) => {
    if (!v) return false;
    return v.startsWith("data:image/") || v.startsWith("http://") || v.startsWith("https://");
  };

  const foundProduct = product;

  // Get a random sticker for placeholder
  const getRandomSticker = () => `/assets/stickers/${Math.floor(Math.random() * 26) + 1}.png`;

  // Load custom message limit
  useEffect(() => {
    try {
      const raw = localStorage.getItem("phool_custom_message_limit");
      if (raw) setCustomLimit(Number(raw) || 150);
    } catch (e) { }
  }, []);

  // Ultra-fast: Load product only essential fields
  useEffect(() => {
    (async () => {
      setLoading(true);
      console.log(`⚡ Starting ULTRA-FAST load for ID: ${pid}`);
      
      if (!Number.isFinite(pid)) {
        console.log('❌ Invalid product ID');
        setProduct(null);
        setLoading(false);
        return;
      }

      try {
        // Use ultra-fast functions (only essential fields)
        console.log('⚡ Loading product and card FAST...');
        const [p, c] = await Promise.all([
          loadProductFast(pid),
          loadCardFast(pid),
        ]);
        
        const foundProduct = p ?? c;
        if (foundProduct) {
          console.log(`⚡ Successfully loaded product: ${foundProduct.name}`);
          setProduct(foundProduct);
        } else {
          console.log('❌ No product or card found');
          setProduct(null);
        }
      } catch (error) {
        console.error('💥 Error loading product:', error);
        setProduct(null);
      }
      
      setLoading(false);
    })();
  }, [pid]);

  // Load reviews separately (delayed for performance)
  useEffect(() => {
    if (!foundProduct) return;
    
    // Load reviews after main content loads
    const timeoutId = setTimeout(async () => {
      try {
        console.log('📡 Loading reviews...');
        const productReviews = await loadApprovedReviews(foundProduct.id);
        console.log(`✅ Loaded ${productReviews.length} reviews`);
        setReviews(productReviews);
      } catch (error) {
        console.error('⚠️ Error loading reviews:', error);
        setReviews([]);
      }
    }, 300); // Load reviews after 300ms
    
    return () => clearTimeout(timeoutId);
  }, [foundProduct?.id]);

  // Social sharing helpers
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = foundProduct ? `Check out ${foundProduct.name} on Phool Shop!` : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank');
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, '_blank');

  // Auto slideshow
  useEffect(() => {
    if (!auto || !foundProduct) return;
    const images = foundProduct.images;
    if (!images || images.length === 0) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 3500);
    return () => clearInterval(t);
  }, [foundProduct, auto]);

  const handleAdd = () => {
    addItem({
      id: foundProduct.id,
      name: foundProduct.name,
      price: foundProduct.price,
      image: (() => {
        const images = foundProduct.images;
        return images && images.length > 0 ? images[0] : undefined;
      })(),
      customText: foundProduct.is_custom ? customText : undefined
    }, quantity);
    setAdded(true);
    setShowAddAnim(true);
    setShowConfetti(true);
    setTimeout(() => setShowAddAnim(false), 900);
    setTimeout(() => setAdded(false), 1400);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const avgRating = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    const comment = reviewText.trim().slice(0, 150);
    await createReview({
      product_id: foundProduct.id,
      name: "Anonymous",
      rating,
      comment,
      approved: true
    });
    // Reload reviews to show the new one immediately
    const productReviews = await loadApprovedReviews(foundProduct.id);
    setReviews(productReviews);
    setRating(null);
    setReviewText("");
    setReviewAnim(true);
    setTimeout(() => setReviewAnim(false), 1200);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#fcf2e3] flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-8"
            >
              <img 
                src="/assets/branding/phool.png" 
                alt="Phool Shop" 
                className="w-40 h-40 object-contain mx-auto"
              />
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="font-script text-2xl text-[#6e4248]"
            >
              Loading...
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!foundProduct) {
    return (
      <Layout>
        <div className="py-24 text-center bg-[#fcf2e3]">
          <div className="font-script text-4xl text-[#6e4248]">Product not found.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {showConfetti && <Confetti buttonRef={buttonRef} />}
      <section className="min-h-screen bg-[#fcf2e3] relative">
        <div className="container max-w-6xl mx-auto px-6 py-12 relative z-10">
          {/* Breadcrumbs */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm" style={{ color: '#6e4248' }}>
              <Link to="/" className="hover:text-[#c5878c] transition-colors font-body">Home</Link>
              <span>/</span>
              <Link to="/catalog" className="hover:text-[#c5878c] transition-colors font-body">Catalog</Link>
              <span>/</span>
              <span className="text-[#6e4248] font-medium font-body">{foundProduct.name}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Product Image - Left Side */}
            <div className="relative">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#cfd9b6] cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                <motion.div key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full h-full group"
                >
                  {(() => {
                    const images = typeof foundProduct.images === 'string' ? JSON.parse(foundProduct.images || '[]') : foundProduct.images;
                    const img = images[index];
                    return isImageUrl(img) ? (
                      <img
                        src={optimizeImageUrl(img, 800, 85)}
                        alt={foundProduct.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="eager"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src={getRandomSticker()} 
                          alt="Sticker" 
                          className="w-32 h-32 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-8xl">{img}</div>';
                          }}
                        />
                      </div>
                    );
                  })()}
                </motion.div>

                {/* Add to Cart Animation */}
                {showAddAnim && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, y: 20 }}
                    animate={{ opacity: 1, scale: 1.2, y: -40 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9 }}
                    className="pointer-events-none absolute top-8 right-8 text-5xl"
                    style={{ color: '#6e4248' }}
                  >
                    Contact
                  </motion.div>
                )}
              </div>

              {/* Image Progress Indicators */}
              {(() => {
                const images = typeof foundProduct.images === 'string' ? JSON.parse(foundProduct.images || '[]') : foundProduct.images;
                if (images.length <= 1) return null;

                return (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setIndex(i); setAuto(false); }}
                        className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-8" : "bg-[#cfd9b6] hover:bg-[#c5878c]"}`}
                        style={{ backgroundColor: i === index ? '#6e4248' : undefined }}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                    <button
                      onClick={() => setAuto(!auto)}
                      className={`ml-4 px-3 py-1 text-xs rounded-full transition-colors font-body ${auto ? "bg-[#6e4248] text-[#fcf2e3]" : "bg-[#cfd9b6] text-[#6e4248]"}`}
                    >
                      {auto ? "⏸ Pause" : "▶ Play"}
                    </button>
                  </div>
                );
              })()}

              {/* Image Thumbnails */}
              {(() => {
                const images = typeof foundProduct.images === 'string' ? JSON.parse(foundProduct.images || '[]') : foundProduct.images;
                if (images.length <= 1) return null;

                return (
                  <div className="mt-6 flex gap-3 justify-center">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { setIndex(i); setAuto(false); }}
                        className={`rounded-xl overflow-hidden transition-all duration-300 ${i === index ? "ring-2 ring-[#6e4248] ring-offset-2 scale-110" : "opacity-60 hover:opacity-100"}`}
                        aria-label={`Show image ${i + 1}`}
                      >
                        {isImageUrl(img) ? (
                          <img src={optimizeImageUrl(img, 64, 70)} alt={foundProduct.name} className="w-16 h-16 object-cover" loading="lazy" decoding="async" />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center text-2xl bg-[#cfd9b6]">
                            {img}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Product Details - Right Side */}
            <div className="space-y-8">
              {/* Product Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <h1 className="font-heading text-5xl lg:text-6xl text-[#6e4248] leading-tight">
                    {foundProduct.name}
                  </h1>
                </div>

                <div className="flex items-baseline space-x-4">
                  <span className="text-4xl font-bold text-[#6e4248] font-body">PKR {foundProduct.price}</span>
                </div>

                <div className="flex items-center space-x-4 mt-4">
                  {foundProduct.in_stock ? (
                    <span className="text-green-600 text-sm font-medium font-body">• In Stock</span>
                  ) : (
                    <span className="text-red-600 text-sm font-medium font-body">• Out of Stock</span>
                  )}
                </div>

                {/* Social sharing */}
                <div className="relative mt-2">
                  <button 
                    className="rounded-full gap-2 text-[#6e4248] font-body border-2 border-[#6e4248] px-4 py-2 hover:bg-[#6e4248] hover:text-[#fcf2e3] transition-all" 
                    onClick={() => setShareOpen(!shareOpen)}
                  >
                    <Share2 className="h-4 w-4 inline mr-2" /> Share
                  </button>
                  {shareOpen && (
                    <div className="absolute left-0 top-16 z-20 flex items-center gap-2 rounded-xl border-2 border-[#6e4248] bg-[#FFFAF2] p-3 shadow-lg">
                      <button onClick={shareWhatsApp} className="rounded-full bg-green-500 p-2 text-white hover:bg-green-600 transition-colors" title="WhatsApp">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.685-1.228A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.332-.658-6.093-1.791l-.427-.274-3.09.81.845-3.001-.3-.446A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" /></svg>
                      </button>
                      <button onClick={shareFacebook} className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 transition-colors" title="Facebook">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                      </button>
                      <button onClick={shareTwitter} className="rounded-full bg-sky-500 p-2 text-white hover:bg-sky-600 transition-colors" title="Twitter">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                      </button>
                      <button onClick={copyLink} className="rounded-full bg-[#cfd9b6] p-2 text-[#6e4248] hover:bg-[#c5878c] transition-colors" title="Copy link">
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setShareOpen(false)} className="rounded-full p-1 text-[#6e4248] hover:text-[#c5878c]">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Extended Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <p className="text-[#6e4248] leading-relaxed text-lg font-body whitespace-pre-wrap">
                  {foundProduct.description}
                </p>
              </motion.div>

              {/* Custom Text Input for Cards */}
              {foundProduct.is_custom && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="space-y-3"
                >
                  <label className="text-sm font-medium text-[#6e4248] uppercase tracking-wide font-body">Personalize Your Message</label>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full rounded-2xl border-2 border-[#6e4248] p-4 text-base focus:border-[#c5878c] focus:ring-2 focus:ring-[#c5878c]/20 transition-all resize-none font-body bg-[#FFFAF2]"
                    rows={3}
                    placeholder="Write your heartfelt message here..."
                  />
                  <div className="text-sm text-[#6e4248] text-right font-body">
                    {customText.length}/{customLimit} characters
                  </div>
                </motion.div>
              )}

              {/* Quantity & Add to Cart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center rounded-2xl border-2 border-[#6e4248] bg-[#FFFAF2]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 text-[#6e4248] hover:bg-[#cfd9b6] transition-colors rounded-l-2xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-6 py-3 text-center font-medium min-w-[60px] text-[#6e4248] font-body">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 text-[#6e4248] hover:bg-[#cfd9b6] transition-colors rounded-r-2xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    ref={buttonRef}
                    className="pill-btn-primary text-lg font-medium px-12 py-6 shadow-[4px_4px_0px_#6e4248] border-2 border-[#6e4248]"
                    onClick={handleAdd}
                    disabled={!foundProduct.in_stock || (foundProduct.is_custom && (customText.trim().length === 0 || customText.length > customLimit))}
                  >
                    {!foundProduct.in_stock ? "Out of Stock" : added ? "Added to Tokri" : foundProduct.is_custom ? "Add Card to Tokri" : "Add to Tokri"}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-24 border-t-2 border-[#6e4248] pt-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-3xl font-medium text-[#6e4248] mb-8">Customer Reviews</h2>

              {/* Reviews Summary */}
              <div className="flex items-center justify-between mb-12 pb-8 border-b-2 border-[#6e4248]">
                <div className="flex items-center space-x-6">
                  <div className="text-5xl font-medium text-[#6e4248] font-body">{avgRating || "—"}</div>
                  <div>
                    <div className="flex items-center space-x-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const filled = i < Math.round(avgRating);
                        return (
                          <span key={i} className={`${filled ? 'text-[#c5878c]' : 'text-[#cfd9b6]'} text-2xl`}>
                            {filled ? '♥' : '♡'}
                          </span>
                        );
                      })}
                    </div>
                    <div className="text-sm text-[#6e4248] font-body">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-8 mb-16">
                {reviews.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b-2 border-[#cfd9b6] pb-8 last:border-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="font-medium text-[#6e4248] font-body">{r.name}</div>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const filled = i < r.rating;
                              return (
                                <span key={i} className={`${filled ? 'text-[#c5878c]' : 'text-[#cfd9b6]'} text-lg`}>
                                  {filled ? '♥' : '♡'}
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-sm text-[#6e4248] font-body">
                            {new Date(r.created_at || '').toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-[#6e4248] leading-relaxed font-body">{r.comment}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {reviews.length === 0 && (
                  <div className="text-center py-16 text-[#6e4248]">
                    <div className="font-script text-6xl mb-4">Reviews</div>
                    <p className="text-lg font-body">No reviews yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div className="bg-[#FFFAF2] rounded-3xl p-8 border-2 border-[#6e4248] shadow-[4px_4px_0px_#6e4248]">
                <h3 className="text-xl font-medium text-[#6e4248] mb-6 font-heading">Share Your Experience</h3>
                <form onSubmit={submitReview} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-[#6e4248] uppercase tracking-wide block mb-3 font-body">Your Rating</label>
                    <div className="flex items-center space-x-3">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <motion.button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          aria-label={`${n} heart`}
                          whileTap={{ scale: 0.9 }}
                          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5878c] rounded-xl p-2"
                        >
                          <motion.span
                            animate={rating && rating >= n ? { scale: 1.25 } : { scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                            className={`${rating && rating >= n ? 'text-[#c5878c]' : 'text-[#cfd9b6]'} text-4xl`}
                          >
                            {rating && rating >= n ? '♥' : '♡'}
                          </motion.span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#6e4248] uppercase tracking-wide block mb-3 font-body">Your Review</label>
                    <textarea
                      maxLength={150}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full rounded-2xl border-2 border-[#6e4248] p-4 text-base focus:border-[#c5878c] focus:ring-2 focus:ring-[#c5878c]/20 transition-all resize-none font-body bg-[#FFFAF2]"
                      rows={4}
                      placeholder="Tell us about your experience with this product..."
                    />
                    <div className="mt-2 text-sm text-[#6e4248] text-right font-body">
                      {reviewText.length}/150 characters
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={!rating || reviewText.trim().length === 0}
                      className="pill-btn-primary px-8 py-4 font-medium shadow-[4px_4px_0px_#6e4248] border-2 border-[#6e4248]"
                    >
                      Submit Review
                    </button>
                    {reviewAnim && (
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1.05, opacity: 1 }}
                        transition={{ duration: 0.35 }}
                        className="text-[#c5878c] font-medium font-body"
                      >
                        Review posted!
                      </motion.div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-24 border-t-2 border-[#6e4248] pt-16">
              <h2 className="font-heading text-3xl font-medium text-[#6e4248] mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((rp) => {
                  const rpImages = typeof rp.images === 'string' ? (() => { try { return JSON.parse(rp.images || '[]'); } catch { return []; } })() : rp.images;
                  const rpImg = (rpImages || []).find((v: string) => v && v.trim() !== "") || "";
                  return (
                    <Link key={rp.id} to={`/product/${rp.id}`} className="group">
                      <div className="h-full border-2 border-[#6e4248] rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#6e4248] bg-[#FFFAF2]">
                        <div className="p-0">
                          <div className="relative aspect-square overflow-hidden">
                            {isImageUrl(rpImg) ? (
                              <img src={rpImg} alt={rp.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl bg-[#cfd9b6]">
                                {rpImg}
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <span className="text-xs pill-btn-outline py-1 px-3 mb-2 inline-block font-body">{rp.category}</span>
                            <h3 className="font-heading text-lg text-[#6e4248] mt-2">{rp.name}</h3>
                            <p className="font-body text-[#6e4248] font-bold text-lg mt-1">PKR {rp.price}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetails;
