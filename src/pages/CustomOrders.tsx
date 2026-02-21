import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { send } from "@emailjs/browser";
import { addOrderToGoogleSheet } from "@/services/googleSheets";
import { createOrder } from "@/lib/supabaseOrders";

const CustomOrders = () => {
  const [submitted, setSubmitted] = useState(false);
  const [customOrderId, setCustomOrderId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    
    const orderData = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      products: "Custom Order Request",
      quantity: "1",
      notes: String(fd.get("timeline") || ""),
      paymentMethod: "To be discussed",
      orderType: 'custom' as const,
      customDetails: {
        description: String(fd.get("description") || ""),
        colors: String(fd.get("colors") || ""),
        timeline: String(fd.get("timeline") || ""),
      },
    };

    // Enhanced email payload for custom orders
    const orderId = `CUSTOM-${Date.now()}`;

    // Save custom order to Supabase so it shows up in Admin Order Management
    try {
      await createOrder({
        order_id: orderId,
        name: orderData.name,
        email: orderData.email,
        phone: orderData.phone,
        address: "",
        products: "Custom Order Request",
        quantity: "1",
        payment_method: "To be discussed",
        notes: [
          orderData.customDetails.timeline ? `Timeline: ${orderData.customDetails.timeline}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        order_type: "custom",
        status: "Quote Request",
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
        promo_code: null,
        gift_wrap: false,
        gift_wrap_cost: 0,
        gift_message: "",
        custom_description: orderData.customDetails.description,
        custom_colors: orderData.customDetails.colors,
        custom_timeline: orderData.customDetails.timeline,
      });
    } catch (err) {
      console.error("Supabase custom order save failed:", err);
    }

    const emailPayload = {
      order_id: orderId,
      name: orderData.name,
      email: orderData.email,
      phone: orderData.phone,
      order_summary: `Custom Order: ${orderData.customDetails.description}`,
      total_amount: 'To be quoted',
      payment_method: 'To be discussed',
      payment_details: "To be discussed with customer",
      order_type: 'custom',
      status: 'Quote Request',
      timestamp: new Date().toLocaleString(),
      delivery_note: 'Delivery timeline to be discussed based on custom order requirements',
      contact_email: import.meta.env.VITE_SHOP_CONTACT_EMAIL || 'orders@example.com',
      contact_phone: import.meta.env.VITE_SHOP_CONTACT_PHONE || '0321-000-0000',
      // Custom order specific fields
      custom_description: orderData.customDetails.description,
      custom_colors: orderData.customDetails.colors,
      custom_timeline: orderData.customDetails.timeline,
      customer_notes: orderData.customDetails.timeline,
      special_instructions: `Custom order - ${orderData.customDetails.description}`,
      custom_request: true,
    };

    // Send emails via EmailJS
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const customerTemplateId = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // Check if EmailJS is configured before attempting to send
    if (!serviceId || !templateId || !customerTemplateId || !publicKey || serviceId.includes('YOUR_') || publicKey.includes('YOUR_')) {
      console.error('❌ EMAILJS NOT CONFIGURED: Missing EmailJS environment variables');
      console.error('📧 Custom order emails NOT sent. To fix: set VITE_EMAILJS_* env vars in .env and rebuild');
    } else {
      try {
        // 1. Send admin notification email (to shop owner)
        const adminEmailPayload = {
          ...emailPayload,
          to_email: import.meta.env.VITE_SHOP_CONTACT_EMAIL || 'phoolshopstore@gmail.com', // Send to shop owner
          to_name: 'Phool Shop Admin',
          recipient_type: 'admin',
        };
        
        const response = await send(serviceId, templateId, adminEmailPayload, publicKey);
        console.log("✅ Admin email sent successfully!", response.status, response.text);
        
        // 2. Send customer confirmation email (to customer)
        const customerEmailPayload = {
          ...emailPayload,
          to_email: orderData.email, // Customer's email
          to_name: orderData.name,
          shop_name: 'Phool Shop',
          thank_you_message: 'Thank you for your custom order request! We will review your requirements and get back to you within 2-3 business days with a quote and timeline.',
          recipient_type: 'customer',
        };
        
        const customerResponse = await send(serviceId, customerTemplateId, customerEmailPayload, publicKey);
        console.log("✅ Customer email sent successfully!", customerResponse.status, customerResponse.text);
      } catch (err) {
        console.error("❌ Custom order email send failed:", err);
        console.error("🔍 Full error details:", JSON.stringify(err, null, 2));
        console.error("📧 EmailJS Config:", { serviceId, templateId, customerTemplateId, publicKey: publicKey.substring(0, 10) + "..." });
      }
    }

    // Add custom order to Google Sheets
    try {
      const sheetSuccess = await addOrderToGoogleSheet(orderData);
      if (sheetSuccess) {
        console.log("Custom order added to Google Sheets successfully");
      } else {
        console.log("Custom order saved to local storage (Google Sheets not configured)");
      }
    } catch (err) {
      console.error("Google Sheets integration failed:", err);
    }

    setCustomOrderId(orderId);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Layout>
        <section className="flex min-h-[60vh] items-center justify-center py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
            <h2 className="mt-6 font-display text-3xl font-bold text-foreground">Request Submitted!</h2>
            <p className="mt-4 text-muted-foreground">We'll get back to you within 2–3 business days. Please send a proof of payment screenshot to WhatsApp on 0333-XXXXXXX.</p>
            {customOrderId && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your Custom Order ID:</p>
                <p className="font-mono font-bold text-primary">{customOrderId}</p>
                <p className="text-xs text-muted-foreground mt-1">Save this ID to track your custom order</p>
              </div>
            )}
            <div className="mt-6 flex flex-col items-center gap-3">
              <Button className="rounded-full px-8" onClick={() => setSubmitted(false)}>
                Submit Another Request
              </Button>
              {customOrderId && (
                <Button asChild variant="outline" className="rounded-full px-8">
                  <Link to={`/track-order?order=${customOrderId}`}>Track Your Request</Link>
                </Button>
              )}
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
            <Sparkles className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">Custom Orders</h1>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Have something specific in mind? Tell us about your dream crochet piece and we'll bring it to life.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="mt-12 border-border/40">
              <CardHeader>
                <CardTitle className="font-display text-xl">Request Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" name="name" placeholder="Jane Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="jane@email.com" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone or WhatsApp (optional)</Label>
                    <Input id="phone" name="phone" placeholder="03XX-XXX-XXXX (WhatsApp preferred)" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">What would you like made?</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the item: type (toy, blanket), size, special requests, and any inspiration links"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colors">Preferred Colors</Label>
                    <Input id="colors" name="colors" placeholder="e.g., pastel pink, sage green, cream (optional)" />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Timeline</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="When do you need it?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-rush">No rush</SelectItem>
                          <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                          <SelectItem value="1-month">Within 1 month</SelectItem>
                          <SelectItem value="specific">Specific date (mention below)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeline">Preferred pickup/delivery note (optional)</Label>
                      <Input id="timeline" name="timeline" placeholder="e.g., Ready by 10 Mar, or Pickup only" />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full rounded-full">
                    Submit Request
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

export default CustomOrders;
