import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { Minus, Plus, Trash } from "lucide-react";

const Tokri = () => {
  const { items, updateQuantity, removeItem, totalPrice, clear } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // pass current cart items to the order page via navigation state
    navigate("/order", { state: { items } });
  };

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <h1 className="font-display text-3xl font-bold">Tokri</h1>
          {items.length === 0 ? (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">Your Tokri is empty.</p>
              <div className="mt-4">
                <Button asChild>
                  <Link to="/catalog">Browse Products</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {items.map((it) => (
                <div key={`${it.id}-${it.customText ?? ""}`} className="flex items-center gap-4 rounded-lg border border-border/40 p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-accent text-3xl">{it.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-sm text-muted-foreground">PKR {it.price} each</div>
                      </div>
                      <div className="text-sm font-semibold">PKR {(it.price * it.quantity).toFixed(0)}</div>
                    </div>

                    {it.customText && (
                      <div className="mt-2 text-sm text-muted-foreground">Message: "{it.customText}"</div>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <button onClick={() => updateQuantity(it.id, it.quantity - 1, it.customText)} className="rounded-md p-2">
                        <Minus />
                      </button>
                      <div className="w-8 text-center">{it.quantity}</div>
                      <button onClick={() => updateQuantity(it.id, it.quantity + 1, it.customText)} className="rounded-md p-2">
                        <Plus />
                      </button>
                      <button onClick={() => removeItem(it.id, it.customText)} className="ml-4 rounded-md p-2 text-muted-foreground">
                        <Trash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
                <div className="text-lg font-medium">Total</div>
                <div className="text-lg font-semibold">PKR {totalPrice.toFixed(0)}</div>
              </div>

              <div className="flex gap-3">
                <Button className="rounded-full flex-1" onClick={handleCheckout}>Checkout</Button>
                <Button variant="outline" className="rounded-full" onClick={clear}>Clear</Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Tokri;
