import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { loadProducts } from "@/lib/supabaseProducts";
import type { Product } from "@/lib/supabaseProducts";
import { useCart } from "@/lib/cart";
import { ArrowLeft } from "lucide-react";
import { loadReviews, saveReview, Review } from "@/lib/reviews";

const ProductDetails = () => {
  const { id } = useParams();
  const pid = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
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
  const [productsList, setProductsList] = useState<Product[]>([]);

  const isImageUrl = (v?: string) => {
    if (!v) return false;
    return v.startsWith("data:image/") || v.startsWith("http://") || v.startsWith("https://");
  };

  // Load products once and memoize lookup
  const allProducts = useMemo(() => {
    const arr = [];
    for (const prod of productsList) {
      const images = typeof prod.images === 'string' ? JSON.parse(prod.images || '[]') : prod.images;
      arr.push({ ...prod, images });
    }
    return arr;
  }, [productsList]);

  const foundProduct = useMemo(() => allProducts.find((p) => p.id === pid) || null, [allProducts, pid]);

  // Load custom message limit
  useEffect(() => {
    try {
      const raw = localStorage.getItem("phool_custom_message_limit");
      if (raw) setCustomLimit(Number(raw) || 150);
    } catch (e) { }
  }, []);

  // Load products once
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await loadProducts();
      setProductsList(data);
      setLoading(false);
    })();
  }, []);

  // Load reviews for this product
  useEffect(() => {
    if (!foundProduct) return;
    setReviews(loadReviews(foundProduct.id));
  }, [foundProduct?.id]);

  // Auto slideshow
  useEffect(() => {
    if (!auto || !foundProduct) return;
    const images = typeof foundProduct.images === 'string' ? JSON.parse(foundProduct.images || '[]') : foundProduct.images;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 3500);
    return () => clearInterval(t);
  }, [foundProduct, auto]);

  const handleAdd = () => {
    addItem({ id: foundProduct.id, name: foundProduct.name, price: foundProduct.price, image: (() => {
      const images = typeof foundProduct.images === 'string' ? JSON.parse(foundProduct.images || '[]') : foundProduct.images;
      return images[0];
    })(), customText: foundProduct.is_custom ? customText : undefined }, 1);
    setAdded(true);
    setShowAddAnim(true);
    setTimeout(() => setShowAddAnim(false), 900);
    setTimeout(() => setAdded(false), 1400);
  };

  const avgRating = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    const text = reviewText.trim().slice(0, 150);
    saveReview({ productId: foundProduct.id, rating, text });
    setReviews(loadReviews(foundProduct.id));
    setRating(null);
    setReviewText("");
    setReviewAnim(true);
    setTimeout(() => setReviewAnim(false), 1200);
  };

  if (!foundProduct) {
    return (
      <Layout>
        <div className="py-24 text-center">Product not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <Link to="/catalog" className="text-sm text-muted-foreground hover:underline">
              <ArrowLeft className="inline-block mr-2" /> Back to catalog
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Slideshow */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border border-border/40 p-6"
                onMouseEnter={() => setAuto(false)}
                onMouseLeave={() => setAuto(true)}
              >
                <div className="relative flex h-72 items-center justify-center text-6xl">
                  <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {(() => {
                      const images = typeof foundProduct.images === 'string' ? JSON.parse(foundProduct.images || '[]') : foundProduct.images;
                      const img = images[index];
                      return isImageUrl(img) ? (
                        <img src={img} alt={foundProduct.name} className="h-72 w-full rounded-xl object-cover" />
                      ) : (
                        img
                      );
                    })()}
                  </motion.div>

                  {showAddAnim && (
                    <motion.div initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1.2, y: -40 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="pointer-events-none absolute -top-6 right-6 text-4xl">
                      💌
                    </motion.div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  {(() => {
                    const images = typeof foundProduct.images === 'string' ? JSON.parse(foundProduct.images || '[]') : foundProduct.images;
                    return images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { setIndex(i); setAuto(false); }}
                        className={`rounded-md px-3 py-2 text-2xl ${i === index ? "ring-2 ring-primary" : "bg-muted/10"}`}
                        aria-label={`Show image ${i + 1}`}
                      >
                        {isImageUrl(img) ? (
                          <img src={img} alt={foundProduct.name} className="h-10 w-10 rounded object-cover" />
                        ) : (
                          img
                        )}
                      </button>
                    ));
                  })()}
                </div>
              </motion.div>
            </div>

            {/* Details */}
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
                <h1 className="font-display text-3xl font-bold text-foreground">{foundProduct.name}</h1>
                <p className="mt-2 text-lg font-medium text-primary">PKR {foundProduct.price}</p>
                <p className="mt-4 text-muted-foreground">{foundProduct.description}</p>

                <div className="mt-6 flex gap-3">
                  <div className="flex-1">
                    {foundProduct.is_custom && (
                      <div className="mb-4">
                        <label className="text-sm font-medium">Text for card</label>
                        <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} className="mt-2 w-full rounded-md border p-2" rows={3} />
                        <div className="mt-1 text-sm text-muted-foreground">{customText.length}/{customLimit} chars</div>
                      </div>
                    )}
                    <Button size="lg" className="rounded-full w-full" onClick={handleAdd} disabled={foundProduct.is_custom && (customText.trim().length === 0 || customText.length > customLimit)}>
                      {added ? "Added" : foundProduct.is_custom ? "Add Card to Tokri" : "Add to Tokri"}
                    </Button>
                  </div>
                  <Button asChild variant="outline" size="lg" className="rounded-full">
                    <Link to="/tokri">Go to Tokri</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold">Reviews</h2>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-semibold">{avgRating || "—"}</div>
                <div className="text-sm text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded border border-border/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const filled = i < r.rating;
                          return (
                            <span key={i} className={`${filled ? 'text-pink-300' : 'text-pink-100'} text-2xl`}>{filled ? '♥' : '♡'}</span>
                          );
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">{r.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={submitReview} className="mt-6 space-y-3">
              <div>
                <label className="text-sm font-medium">Your rating</label>
                <div className="mt-2 flex gap-2 items-center">
                  {[1,2,3,4,5].map((n) => (
                    <motion.button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      aria-label={`${n} heart`}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-md px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <motion.span
                        animate={rating && rating >= n ? { scale: 1.25 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                        className={`${rating && rating >= n ? 'text-pink-300' : 'text-pink-100'} text-3xl`}
                      >
                        {rating && rating >= n ? '♥' : '♡'}
                      </motion.span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Your review</label>
                <textarea maxLength={150} value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="mt-2 w-full rounded-md border p-2" rows={3} />
                <div className="mt-1 text-sm text-muted-foreground">{reviewText.length}/150 chars</div>
              </div>

              <div>
                <Button type="submit" disabled={!rating || reviewText.trim().length === 0}>Submit review</Button>
              </div>
              {reviewAnim && (
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1.05, opacity: 1 }} transition={{ duration: 0.35 }} className="mt-2 text-center text-primary">
                  🎉 Review posted!
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetails;
