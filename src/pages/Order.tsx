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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Handle image upload with aggressive compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Always compress images for email compatibility
      const compressedImage = await compressImage(file);
      setUploadedImage(compressedImage);
    }
  };

  // Aggressive compression function
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 600px for aggressive compression)
        let width = img.width;
        let height = img.height;
        const maxSize = 600;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress aggressively
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with very aggressive quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.3);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

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
  const totalAmount = Math.max(0, subtotal - promoDiscount);

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
    } catch { }
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
      instagram: String(fd.get("instagram") || ""),
      quantity: String(fd.get("quantity") || ""),
      address: String(fd.get("address") || ""),
      products: String(fd.get("products") || ""),
      notes: String(fd.get("notes") || "") + (appliedPromo ? `\n[PROMO: ${appliedPromo} — ${promoData?.label}]` : ""),
      paymentMethod: paymentMethod || "",
      orderType: 'regular' as const,
      custom_image: uploadedImage || "",
    };

    const emailPayload = {
      order_id: newOrderId,
      name: orderData.name,
      email: orderData.email,
      phone: orderData.phone,
      instagram: orderData.instagram,
      address: orderData.address || "",
      order_summary: incomingItems
        ? incomingItems.map(item => `${item.quantity}x ${item.name} - PKR ${item.price}${item.customText ? ` (Message: ${item.customText})` : ''}`).join('\n')
        : orderData.products,
      total_amount: totalAmount,
      subtotal: subtotal,
      discount: promoDiscount > 0 ? `PKR ${promoDiscount} (${appliedPromo})` : 'None',
      promo_code: appliedPromo || 'None',
      payment_method: paymentMethod || 'Not selected',
      payment_details: paymentMethod === "jazzcash"
        ? "JazzCash: 0321-8476467 (Laiba Athar)"
        : paymentMethod === "bank"
          ? "Bank: Bank of Punjab, Account number: 5340359690500017, Account Name: Laiba Athar"
          : "Not selected",
      order_type: 'regular',
      status: 'Under Process',
      items_count: incomingItems ? incomingItems.length : 1,
      timestamp: new Date().toLocaleString(),
      delivery_note: 'Free delivery - We will contact you to arrange delivery details',
      contact_email: import.meta.env.VITE_SHOP_CONTACT_EMAIL || 'orders@example.com',
      contact_phone: import.meta.env.VITE_SHOP_CONTACT_PHONE || '0321-000-0000',
      customer_notes: String(fd.get("notes") || ""),
      special_instructions: 'No special instructions',
      custom_image: uploadedImage || "",
    };

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const customerTemplateId = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // Save order to Supabase first so UI can progress even if EmailJS hangs/fails
    try {
      await createOrder({
        order_id: newOrderId,
        name: orderData.name,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address || "",
        instagram: orderData.instagram || "",
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
        gift_wrap: false,
        gift_wrap_cost: 0,
        gift_message: "",
        custom_description: "",
        custom_colors: "",
        custom_timeline: "",
        custom_image: uploadedImage || "",
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
      instagram: orderData.instagram || '',
      address: orderData.address || '',
      products: orderData.products,
      quantity: orderData.quantity,
      notes: orderData.notes,
      paymentMethod: orderData.paymentMethod || '',
      orderType: 'regular',
      status: 'Under Process',
      custom_image: uploadedImage || '',
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

    // Check if EmailJS is configured
    if (!serviceId || !templateId || !publicKey || serviceId.includes('YOUR_') || publicKey.includes('YOUR_')) {
      console.error('❌ EMAILJS NOT CONFIGURED: Missing VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, or VITE_EMAILJS_PUBLIC_KEY');
      console.error('📧 Admin email NOT sent. To fix: set EmailJS env vars in .env and rebuild');
    } else {
      send(serviceId, templateId, adminEmailPayload, publicKey)
        .then((response) => {
          console.log("✅ Admin email sent successfully!", response.status, response.text);
        })
        .catch((err) => {
          console.error("❌ Admin email send failed:", err);
          console.error("🔍 Full error details:", JSON.stringify(err, null, 2));
          console.error("📧 EmailJS Config:", { serviceId, templateId, publicKey: publicKey.substring(0, 10) + "..." });
        });
    }

    // 2. Send customer confirmation email (to customer)
    const customerEmailPayload = {
      ...emailPayload,
      to_email: orderData.email, // Customer's email
      to_name: orderData.name,
      shop_name: 'Phool Shop',
      thank_you_message: 'Thank you for your order! We will process it as soon as possible and contact you with delivery details.',
      recipient_type: 'customer',
    };

    // Check if EmailJS is configured
    if (!serviceId || !customerTemplateId || !publicKey || serviceId.includes('YOUR_') || publicKey.includes('YOUR_')) {
      console.error('❌ EMAILJS NOT CONFIGURED: Missing VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_CUSTOMER_TEMPLATE_ID, or VITE_EMAILJS_PUBLIC_KEY');
      console.error('📧 Customer email NOT sent. To fix: set EmailJS env vars in .env and rebuild');
    } else {
      send(serviceId, customerTemplateId, customerEmailPayload, publicKey)
        .then((response) => {
          console.log("✅ Customer email sent successfully!", response.status, response.text);
        })
        .catch((err) => {
          console.error("❌ Customer email send failed:", err);
          console.error("🔍 Full error details:", JSON.stringify(err, null, 2));
          console.error("📧 Customer EmailJS Config:", { serviceId, customerTemplateId, publicKey: publicKey.substring(0, 10) + "..." });
        });
    }
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
              <motion.span initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}></motion.span>
              <motion.span initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}></motion.span>
              <motion.span initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}></motion.span>
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
                      <Label htmlFor="instagram">Instagram @ (optional)</Label>
                      <Input id="instagram" name="instagram" type="text" placeholder="@username" />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Reference Image (optional)</Label>
                      <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageUpload} />
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
                        <div className="text-sm text-muted-foreground mt-1">Number: <strong>0321-8476467</strong></div>
                        <div className="text-sm text-muted-foreground">Account Name: <strong>Laiba Athar</strong></div>
                      </div>
                    )}

                    {paymentMethod === "bank" && (
                      <div className="mt-2 rounded-md border border-border/40 bg-muted/10 p-3 text-sm">
                        <div className="font-medium">Bank Transfer Details</div>
                        <div className="text-sm text-muted-foreground mt-1">Bank: <strong>Bank of Punjab</strong></div>
                        <div className="text-sm text-muted-foreground">Account number: <strong>5340359690500017</strong></div>
                        <div className="text-sm text-muted-foreground">Account Name: <strong>Laiba Athar</strong></div>
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
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="button" onClick={applyPromo} className="rounded-full">
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>

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
