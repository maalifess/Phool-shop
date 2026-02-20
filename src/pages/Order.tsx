import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ShoppingBag, Gift, Tag, Copy, Check } from "lucide-react";
import { send } from "@emailjs/browser";
import { createOrder } from "@/lib/supabaseOrders";
import { addOrderToGoogleSheet } from "@/services/googleSheets";

const PROMO_CODES: Record<string, { discount: number; type: "percent" | "fixed"; label: string }> = {
  "PHOOL10": { discount: 10, type: "percent", label: "10% off" },
  "PHOOL20": { discount: 20, type: "percent", label: "20% off" },
  "SAVE100": { discount: 100, type: "fixed", label: "PKR 100 off" },
  "WELCOME": { discount: 15, type: "percent", label: "15% off (Welcome)" },
};

const GIFT_WRAP_PRICE = 50;

const generateOrderId = () => {
  const prefix = "PS";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
};

const Order = () => {
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderIdCopied, setOrderIdCopied] = useState(false);
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  // If arriving from Tokri checkout, location.state.items will contain the cart items
  const stateItems = (location.state as any)?.items as { id: number; name: string; price: number; quantity: number; customText?: string }[] | undefined;
  let incomingItems = stateItems;
  if (!incomingItems || incomingItems.length === 0) {
    try {
      const raw = localStorage.getItem("phool_cart_v1");
      if (raw) incomingItems = JSON.parse(raw) as typeof stateItems;
    } catch (e) {
      incomingItems = undefined;
    }
  }
  const incomingProductsText = incomingItems && incomingItems.length > 0
    ? incomingItems.map((it) => `${it.quantity}x ${it.name} (PKR ${it.price})${it.customText ? ` — Message: ${it.customText}` : ""}`).join("\n")
    : undefined;

  // Promo code logic
  const subtotal = incomingItems ? incomingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  const promoData = appliedPromo ? PROMO_CODES[appliedPromo] : null;
  const promoDiscount = promoData
    ? promoData.type === "percent" ? Math.round(subtotal * promoData.discount / 100) : promoData.discount
    : 0;
  const giftWrapCost = giftWrap ? GIFT_WRAP_PRICE : 0;
  const totalAmount = Math.max(0, subtotal - promoDiscount + giftWrapCost);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code");
      setAppliedPromo(null);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  };

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setOrderIdCopied(true);
      setTimeout(() => setOrderIdCopied(false), 2000);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const newOrderId = generateOrderId();
    
    const orderData = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      quantity: String(fd.get("quantity") || ""),
      address: String(fd.get("address") || ""),
      products: String(fd.get("products") || ""),
      notes: String(fd.get("notes") || "") + (giftWrap ? `\n[GIFT WRAP] Message: ${giftMessage || "No message"}` : "") + (appliedPromo ? `\n[PROMO: ${appliedPromo} — ${promoData?.label}]` : ""),
      paymentMethod: paymentMethod || "",
      orderType: 'regular' as const,
    };

    const emailPayload = {
      order_id: newOrderId,
      name: orderData.name,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address || "",
      order_summary: incomingItems 
        ? incomingItems.map(item => `${item.quantity}x ${item.name} - PKR ${item.price}${item.customText ? ` (Message: ${item.customText})` : ''}`).join('\n')
        : orderData.products,
      total_amount: totalAmount,
      subtotal: subtotal,
      discount: promoDiscount > 0 ? `PKR ${promoDiscount} (${appliedPromo})` : 'None',
      promo_code: appliedPromo || 'None',
      gift_wrap: giftWrap ? 'Yes' : 'No',
      gift_wrap_cost: giftWrapCost,
      gift_message: giftMessage || 'No message',
      payment_method: paymentMethod || 'Not selected',
      payment_details: paymentMethod === "jazzcash" 
        ? "JazzCash: 0321-000-0000 (Phool Shop)"
        : paymentMethod === "bank"
        ? "Bank: Example Bank, IBAN: PK00EXAM00000000000000 (Phool Shop)"
        : "Not selected",
      order_type: 'regular',
      status: 'Under Process',
      items_count: incomingItems ? incomingItems.length : 1,
      timestamp: new Date().toLocaleString(),
      delivery_note: 'Free delivery - We will contact you to arrange delivery details',
      contact_email: import.meta.env.VITE_SHOP_CONTACT_EMAIL || 'orders@example.com',
      contact_phone: import.meta.env.VITE_SHOP_CONTACT_PHONE || '0321-000-0000',
      customer_notes: String(fd.get("notes") || ""),
      special_instructions: giftWrap ? `Gift wrap requested: ${giftMessage || 'No message'}` : 'No special instructions',
    };

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
    const customerTemplateId = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID || "YOUR_CUSTOMER_TEMPLATE_ID";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

    // Save order to Supabase first so UI can progress even if EmailJS hangs/fails
    try {
      await createOrder({
        order_id: newOrderId,
        name: orderData.name,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address || "",
        products: orderData.products,
        quantity: orderData.quantity,
        payment_method: orderData.paymentMethod || "",
        notes: String(fd.get("notes") || ""),
        order_type: orderData.orderType,
        status: "Under Process",
        items: incomingItems || [],
        subtotal,
        discount: promoDiscount,
        total: totalAmount,
        promo_code: appliedPromo,
        gift_wrap: giftWrap,
        gift_wrap_cost: giftWrapCost,
        gift_message: giftMessage,
        custom_description: "",
        custom_colors: "",
        custom_timeline: "",
      });
    } catch (err) {
      console.error("Supabase order save failed:", err);
    }

    // Show success UI immediately
    setOrderId(newOrderId);
    setSubmitted(true);

    // Send to Google Sheets in background (non-blocking)
    addOrderToGoogleSheet({
      name: orderData.name,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address || '',
      products: orderData.products,
      quantity: orderData.quantity,
      notes: orderData.notes,
      paymentMethod: orderData.paymentMethod || '',
      orderType: 'regular',
      status: 'Under Process',
    }).catch((err) => {
      console.error('Google Sheets integration failed:', err);
    });

    // Send emails in background (do not block checkout)
    
    // 1. Send admin notification email (to shop owner)
    const adminEmailPayload = {
      ...emailPayload,
      to_email: import.meta.env.VITE_SHOP_CONTACT_EMAIL || 'phoolshopstore@gmail.com', // Send to shop owner
      to_name: 'Phool Shop Admin',
      recipient_type: 'admin',
    };

    send(serviceId, templateId, adminEmailPayload, publicKey)
      .then((response) => {
        console.log("✅ Admin email sent successfully!", response.status, response.text);
      })
      .catch((err) => {
        console.error("❌ Admin email send failed:", err);
        console.error("🔍 Full error details:", JSON.stringify(err, null, 2));
        console.error("📧 EmailJS Config:", { serviceId, templateId, publicKey: publicKey.substring(0, 10) + "..." });
      });

    // 2. Send customer confirmation email (to customer)
    const customerEmailPayload = {
      ...emailPayload,
      to_email: orderData.email, // Customer's email
      to_name: orderData.name,
      shop_name: 'Phool Shop',
      thank_you_message: 'Thank you for your order! We will process it as soon as possible and contact you with delivery details.',
      recipient_type: 'customer',
    };

    send(serviceId, customerTemplateId, customerEmailPayload, publicKey)
      .then((response) => {
        console.log("✅ Customer email sent successfully!", response.status, response.text);
      })
      .catch((err) => {
        console.error("❌ Customer email send failed:", err);
        console.error("🔍 Full error details:", JSON.stringify(err, null, 2));
        console.error("📧 Customer EmailJS Config:", { serviceId, customerTemplateId, publicKey: publicKey.substring(0, 10) + "..." });
      });
  };

  if (submitted) {
    return (
      <Layout>
        <section className="flex min-h-[60vh] items-center justify-center py-16">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-md text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
              <CheckCircle2 className="mx-auto h-20 w-20 text-primary" />
            </motion.div>
            <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="mt-6 font-display text-3xl font-bold text-foreground">Order Placed!</motion.h2>
            
            {orderId && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 rounded-xl border border-border/40 bg-accent/50 p-4">
                <p className="text-sm text-muted-foreground mb-1">Your Order ID</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-lg font-bold text-foreground">{orderId}</span>
                  <button onClick={copyOrderId} className="rounded-md p-1 hover:bg-muted transition-colors" title="Copy order ID">
                    {orderIdCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Save this ID to track your order</p>
              </motion.div>
            )}

            <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="mt-4 text-muted-foreground">
              Thank you! Please send a proof of payment screenshot to WhatsApp on 0333-XXXXXXX.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6 flex justify-center gap-2 text-2xl">
              <motion.span initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>🎉</motion.span>
              <motion.span initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>✨</motion.span>
              <motion.span initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}>💐</motion.span>
            </motion.div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <Button className="rounded-full px-8" onClick={() => setSubmitted(false)}>
                Place Another Order
              </Button>
              <Button asChild variant="outline" className="rounded-full px-8">
                <Link to={`/track-order?order=${orderId}`}>Track Your Order</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <ShoppingBag className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">Place an Order</h1>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Fill in your details below. No online payment required — we'll reach out to confirm and arrange payment.
            </p>
          </motion.div>

          {/* If coming from Tokri checkout, show a summary of items being checked out */}
          {incomingItems && incomingItems.length > 0 && (
            <div className="mt-6 rounded-lg border border-border/40 bg-accent/50 p-4">
              <h3 className="font-medium">You're checking out:</h3>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                {incomingItems.map((it) => (
                  <li key={`${it.id}-${it.customText ?? ''}`}>{it.quantity} × {it.name} — PKR {it.price}{it.customText ? ` — Message: ${it.customText}` : ''}</li>
                ))}
              </ul>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="mt-12 border-border/40">
              <CardHeader>
                <CardTitle className="font-display text-xl">Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Shipping Address</Label>
                    <Textarea id="address" name="address" rows={2} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="products">Product(s) You'd Like to Order</Label>
                    <Textarea
                      id="products"
                      name="products"
                      rows={3}
                      defaultValue={incomingProductsText}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (optional)</Label>
                    <Textarea id="notes" name="notes" rows={2} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment">Payment Method</Label>
                    <Select onValueChange={(v) => setPaymentMethod(v)}>
                      <SelectTrigger id="payment">
                        <SelectValue placeholder="Choose payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jazzcash">JazzCash</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>

                    {paymentMethod === "jazzcash" && (
                      <div className="mt-2 rounded-md border border-border/40 bg-muted/10 p-3 text-sm">
                        <div className="font-medium">JazzCash Details</div>
                        <div className="text-sm text-muted-foreground mt-1">Number: <strong>0321-000-0000</strong></div>
                        <div className="text-sm text-muted-foreground">Account Name: <strong>Phool Shop</strong></div>
                      </div>
                    )}

                    {paymentMethod === "bank" && (
                      <div className="mt-2 rounded-md border border-border/40 bg-muted/10 p-3 text-sm">
                        <div className="font-medium">Bank Transfer Details</div>
                        <div className="text-sm text-muted-foreground mt-1">Bank: <strong>Example Bank</strong></div>
                        <div className="text-sm text-muted-foreground">IBAN: <strong>PK00EXAM00000000000000</strong></div>
                        <div className="text-sm text-muted-foreground">Account Name: <strong>Phool Shop</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Promo Code */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /> Promo Code</Label>
                    {appliedPromo ? (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-700">{appliedPromo}</span>
                        <span className="text-green-600">— {promoData?.label}</span>
                        <button type="button" onClick={removePromo} className="ml-auto text-red-500 hover:text-red-700 text-xs font-medium">Remove</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter promo code"
                          value={promoInput}
                          onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                        />
                        <Button type="button" variant="outline" onClick={applyPromo} className="shrink-0">Apply</Button>
                      </div>
                    )}
                    {promoError && <p className="text-sm text-red-500">{promoError}</p>}
                  </div>

                  {/* Gift Wrapping */}
                  <div className="space-y-3 rounded-lg border border-border/40 p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={giftWrap}
                        onChange={(e) => setGiftWrap(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Gift className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Add Gift Wrapping</span>
                      <span className="ml-auto text-sm text-muted-foreground">+ PKR {GIFT_WRAP_PRICE}</span>
                    </label>
                    {giftWrap && (
                      <div className="space-y-2 pl-7">
                        <Label htmlFor="giftMsg">Gift Message (optional)</Label>
                        <Textarea
                          id="giftMsg"
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          rows={2}
                          placeholder="Write a message for the recipient..."
                          maxLength={200}
                        />
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  {incomingItems && incomingItems.length > 0 && (
                    <div className="rounded-lg border border-border/40 bg-accent/30 p-4 space-y-2 text-sm">
                      <div className="font-semibold text-foreground">Order Summary</div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>PKR {subtotal}</span></div>
                      {promoDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({appliedPromo})</span><span>- PKR {promoDiscount}</span></div>}
                      {giftWrap && <div className="flex justify-between"><span className="text-muted-foreground">Gift Wrapping</span><span>PKR {GIFT_WRAP_PRICE}</span></div>}
                      <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="text-green-600 font-medium">Free</span></div>
                      <div className="border-t border-border/40 pt-2 flex justify-between font-bold text-foreground text-base">
                        <span>Total</span><span className="text-primary">PKR {totalAmount}</span>
                      </div>
                    </div>
                  )}

                    <div className="rounded-lg border border-border/60 bg-accent/50 p-4 text-sm text-muted-foreground">
                    <strong>Payment:</strong> Send screenshot of proof of payment to email or phone below. We'll contact you to confirm and arrange delivery. There are no delivery charges — delivery is free.
                    <div className="mt-3 space-y-1 text-sm">
                      <div>Email: <strong>{import.meta.env.VITE_SHOP_CONTACT_EMAIL || 'orders@example.com'}</strong></div>
                      <div>Phone/WhatsApp: <strong>{import.meta.env.VITE_SHOP_CONTACT_PHONE || '0321-000-0000'}</strong></div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full rounded-full">
                    Submit Order
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Order;
