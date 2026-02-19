import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { loadProductById } from "@/lib/supabaseProducts";
import { loadCardById } from "@/lib/supabaseCards";
import type { Product } from "@/lib/supabaseProducts";
import type { Card as SupabaseCard } from "@/lib/supabaseTypes";
import { useCart } from "@/lib/cart";
import { loadApprovedReviews, createReview } from "@/lib/supabaseReviews";
import type { Review } from "@/lib/supabaseTypes";

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

  const isImageUrl = (v?: string) => {
    if (!v) return false;
    return v.startsWith("data:image/") || v.startsWith("http://") || v.startsWith("https://");
  };

  const foundProduct = product;

  // Load custom message limit
  useEffect(() => {
    try {
      const raw = localStorage.getItem("phool_custom_message_limit");
      if (raw) setCustomLimit(Number(raw) || 150);
    } catch (e) { }
  }, []);

  // Load only the requested product/card (fast) 
  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!Number.isFinite(pid)) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const [p, c] = await Promise.all([
        loadProductById(pid),
        loadCardById(pid),
      ]);
      setProduct(p ?? c);
      setLoading(false);
    })();
  }, [pid]);

  // Load reviews for this product
  useEffect(() => {
    if (!foundProduct) return;
    (async () => {
      const productReviews = await loadApprovedReviews(foundProduct.id);
      setReviews(productReviews);
    })();
  }, [foundProduct?.id]);

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
        return images[0];
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
        <div className="container py-24 text-center text-muted-foreground">Loading product...</div>
      </Layout>
    );
  }

  if (!foundProduct) {
    return (
      <Layout>
        <div className="py-24 text-center">Product not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {showConfetti && <Confetti buttonRef={buttonRef} />}
      <section className="min-h-screen bg-neutral-50">
        <div className="container max-w-6xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link to="/catalog" className="hover:text-foreground transition-colors">Catalog</Link>
              <span>/</span>
              <span className="text-foreground font-medium">{foundProduct.name}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Product Image - Left Side */}
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
                  <motion.div key={index} 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full h-full"
                  >
                    {(() => {
                      const images = typeof foundProduct.images === 'string' ? JSON.parse(foundProduct.images || '[]') : foundProduct.images;
                      const img = images[index];
                      return isImageUrl(img) ? (
                        <img 
                          src={img} 
                          alt={foundProduct.name} 
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-8xl">
                          {img}
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
                    >
                      💌
                    </motion.div>
                  )}
                </div>

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
                          className={`rounded-xl overflow-hidden transition-all duration-300 ${
                            i === index ? "ring-2 ring-primary ring-offset-2 scale-110" : "opacity-60 hover:opacity-100"
                          }`}
                          aria-label={`Show image ${i + 1}`}
                        >
                          {isImageUrl(img) ? (
                            <img src={img} alt={foundProduct.name} className="w-16 h-16 object-cover" loading="lazy" />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center text-2xl bg-gray-100">
                              {img}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Product Details - Right Side */}
            <div className="space-y-8">
              {/* Product Header */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <h1 className="font-display text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                    {foundProduct.name}
                  </h1>
                </div>

                <div className="flex items-baseline space-x-4">
                  <span className="text-4xl font-bold text-foreground">PKR {foundProduct.price}</span>
                </div>

                <div className="flex items-center space-x-4 mt-4">
                  <span className="text-sm text-muted-foreground font-medium">Handmade with Love</span>
                  <span className="text-green-600 text-sm font-medium">• In Stock</span>
                </div>
              </motion.div>

              {/* Extended Description */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-lg prose-neutral max-w-none"
              >
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {foundProduct.description}
                </p>
              </motion.div>

              {/* Custom Text Input for Cards */}
              {foundProduct.is_custom && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-3"
                >
                  <label className="text-sm font-semibold text-foreground uppercase tracking-wide">Personalize Your Message</label>
                  <textarea 
                    value={customText} 
                    onChange={(e) => setCustomText(e.target.value)} 
                    className="w-full rounded-2xl border border-gray-200 p-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" 
                    rows={3} 
                    placeholder="Write your heartfelt message here..."
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {customText.length}/{customLimit} characters
                  </div>
                </motion.div>
              )}

              {/* Quantity & Add to Cart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center rounded-2xl border border-gray-200">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 text-foreground hover:bg-gray-50 transition-colors rounded-l-2xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-6 py-3 text-center font-semibold min-w-[60px]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 text-foreground hover:bg-gray-50 transition-colors rounded-r-2xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    ref={buttonRef}
                    size="lg" 
                    className="rounded-full px-12 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg"
                    onClick={handleAdd} 
                    disabled={foundProduct.is_custom && (customText.trim().length === 0 || customText.length > customLimit)}
                  >
                    {added ? "✓ Added to Tokri" : foundProduct.is_custom ? "Add Card to Tokri" : "Add to Tokri"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Reviews Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-24 border-t border-gray-200 pt-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground mb-8">Customer Reviews</h2>
              
              {/* Reviews Summary */}
              <div className="flex items-center justify-between mb-12 pb-8 border-b border-gray-200">
                <div className="flex items-center space-x-6">
                  <div className="text-5xl font-bold text-foreground">{avgRating || "—"}</div>
                  <div>
                    <div className="flex items-center space-x-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const filled = i < Math.round(avgRating);
                        return (
                          <span key={i} className={`${filled ? 'text-primary' : 'text-gray-300'} text-2xl`}>
                            {filled ? '♥' : '♡'}
                          </span>
                        );
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
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
                    className="border-b border-gray-100 pb-8 last:border-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="font-semibold text-foreground">{r.name}</div>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const filled = i < r.rating;
                              return (
                                <span key={i} className={`${filled ? 'text-primary' : 'text-gray-300'} text-lg`}>
                                  {filled ? '♥' : '♡'}
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(r.created_at || '').toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{r.comment}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {reviews.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-lg">No reviews yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div className="bg-white rounded-3xl p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-foreground mb-6">Share Your Experience</h3>
                <form onSubmit={submitReview} className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-foreground uppercase tracking-wide block mb-3">Your Rating</label>
                    <div className="flex items-center space-x-3">
                      {[1,2,3,4,5].map((n) => (
                        <motion.button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          aria-label={`${n} heart`}
                          whileTap={{ scale: 0.9 }}
                          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-2"
                        >
                          <motion.span
                            animate={rating && rating >= n ? { scale: 1.25 } : { scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                            className={`${rating && rating >= n ? 'text-primary' : 'text-gray-300'} text-4xl`}
                          >
                            {rating && rating >= n ? '♥' : '♡'}
                          </motion.span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground uppercase tracking-wide block mb-3">Your Review</label>
                    <textarea 
                      maxLength={150} 
                      value={reviewText} 
                      onChange={(e) => setReviewText(e.target.value)} 
                      className="w-full rounded-2xl border border-gray-200 p-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" 
                      rows={4} 
                      placeholder="Tell us about your experience with this product..."
                    />
                    <div className="mt-2 text-sm text-muted-foreground text-right">
                      {reviewText.length}/150 characters
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button 
                      type="submit" 
                      disabled={!rating || reviewText.trim().length === 0}
                      className="rounded-full px-8 py-4 font-semibold bg-primary hover:bg-primary/90 transition-all"
                    >
                      Submit Review
                    </Button>
                    {reviewAnim && (
                      <motion.div 
                        initial={{ scale: 0.6, opacity: 0 }} 
                        animate={{ scale: 1.05, opacity: 1 }} 
                        transition={{ duration: 0.35 }} 
                        className="text-primary font-semibold"
                      >
                        🎉 Review posted!
                      </motion.div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetails;
