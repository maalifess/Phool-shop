import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCart } from "@/lib/cart";
import PageHero from "@/components/PageHero";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

const Tokri = () => {
  const { items, updateQuantity, removeItem, totalPrice, totalItems, clear } = useCart();
  const navigate = useNavigate();

  const isImageUrl = (v?: string) => {
    if (!v) return false;
    return v.startsWith("data:image/") || v.startsWith("http://") || v.startsWith("https://");
  };

  const handleCheckout = () => {
    navigate("/order", { state: { items } });
  };

  return (
    <Layout>
      <PageHero scriptTitle="your" title="TOKRI" />

      <section className="container mx-auto px-4 py-12 max-w-4xl">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="font-script text-4xl text-secondary">still empty :(</p>
            <p className="text-muted-foreground mt-2">browse the phool shop collection and treat yourself, or your loved ones &lt;3</p>
            <Link to="/catalog" className="pill-btn-primary text-xs mt-6 inline-block">Browse Shop</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((it, i) => (
                <div
                  key={`${it.id}-${it.customText ?? ""}`}
                  className="retro-card bg-card p-4 flex gap-4 items-center"
                >
                  <div className="w-20 h-20 rounded-2xl border-2 border-foreground overflow-hidden bg-blush flex items-center justify-center">
                    {isImageUrl(it.image) ? (
                      <img src={it.image} alt={it.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-3xl">{it.image}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-sm text-foreground truncate">{it.name}</h3>
                    <p className="text-secondary font-bold">PKR {it.price}</p>
                    {it.customText && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">Message: {it.customText}</p>
                    )}
                  </div>
                  <div className="flex items-center border-2 border-foreground rounded-full">
                    <button
                      onClick={() => updateQuantity(it.id, Number(it.quantity) - 1, it.customText)}
                      className="p-2 hover:bg-muted rounded-l-full transition-colors"
                      aria-label="Decrease quantity"
                      type="button"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 font-heading text-sm">{it.quantity}</span>
                    <button
                      onClick={() => updateQuantity(it.id, Number(it.quantity) + 1, it.customText)}
                      className="p-2 hover:bg-muted rounded-r-full transition-colors"
                      aria-label="Increase quantity"
                      type="button"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(it.id, it.customText)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                    aria-label="Remove item"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <button type="button" className="pill-btn-outline text-xs" onClick={clear}>Clear Tokri</button>
              </div>
            </div>

            <div className="retro-card bg-card p-6 h-fit sticky top-24">
              <h3 className="font-heading text-lg text-foreground mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm font-body">
                <div className="flex justify-between"><span>Items ({totalItems})</span><span>PKR {totalPrice}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span className="text-secondary">Free</span></div>
                <div className="dotted-line my-4" />
                <div className="flex justify-between font-heading text-lg">
                  <span>Total</span><span>PKR {totalPrice}</span>
                </div>
              </div>
              <button type="button" className="pill-btn-golden w-full text-sm mt-6" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Tokri;
