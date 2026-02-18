import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { send } from "@emailjs/browser";
import { addOrderToGoogleSheet } from "@/services/googleSheets";

const Order = () => {
  const [submitted, setSubmitted] = useState(false);
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    
    const orderData = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      quantity: String(fd.get("quantity") || ""),
      address: String(fd.get("address") || ""),
      products: String(fd.get("products") || ""),
      notes: String(fd.get("notes") || ""),
      paymentMethod: paymentMethod || "",
      orderType: 'regular' as const,
    };

    // Enhanced email payload with complete order details
    const emailPayload = {
      ...orderData,
      order_summary: incomingItems 
        ? incomingItems.map(item => `${item.quantity}x ${item.name} - PKR ${item.price}${item.customText ? ` (Message: ${item.customText})` : ''}`).join('\n')
        : orderData.products,
      total_amount: incomingItems 
        ? incomingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        : 'N/A',
      timestamp: new Date().toLocaleString(),
      payment_details: paymentMethod === "jazzcash" 
        ? "JazzCash: 0321-000-0000 (Phool Shop)"
        : paymentMethod === "bank"
        ? "Bank: Example Bank, IBAN: PK00EXAM00000000000000 (Phool Shop)"
        : "Not selected",
    };

    // Send email via EmailJS
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

    try {
      await send(serviceId, templateId, emailPayload, publicKey);
      console.log("Order email sent successfully");
    } catch (err) {
      console.error("Order email send failed:", err);
    }

    // Add order to Google Sheets
    try {
      const sheetSuccess = await addOrderToGoogleSheet(orderData);
      if (sheetSuccess) {
        console.log("Order added to Google Sheets successfully");
      } else {
        console.log("Order saved to local storage (Google Sheets not configured)");
      }
    } catch (err) {
      console.error("Google Sheets integration failed:", err);
    }

    setSubmitted(true);
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
            <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="mt-4 text-muted-foreground">
              Thank you! Please send a proof of payment screenshot to WhatsApp on 0333-XXXXXXX.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6 flex justify-center gap-2 text-2xl">
              <motion.span initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>🎉</motion.span>
              <motion.span initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>✨</motion.span>
              <motion.span initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}>💐</motion.span>
            </motion.div>

            <Button className="mt-8 rounded-full px-8" onClick={() => setSubmitted(false)}>
              Place Another Order
            </Button>
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

                    <div className="rounded-lg border border-border/60 bg-accent/50 p-4 text-sm text-muted-foreground">
                    💡 <strong>Payment:</strong> Send screenshot of proof of payment to email or phone below. We'll contact you to confirm and arrange delivery. There are no delivery charges — delivery is free.
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
