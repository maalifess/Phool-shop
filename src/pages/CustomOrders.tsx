import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { CheckCircle2 } from "lucide-react";
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

    const orderId = `CUSTOM-${Date.now()}`;

    // Save custom order to Supabase
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

    if (!serviceId || !templateId || !customerTemplateId || !publicKey || serviceId.includes('YOUR_') || publicKey.includes('YOUR_')) {
      console.error('❌ EMAILJS NOT CONFIGURED: Missing EmailJS environment variables');
    } else {
      try {
        const adminEmailPayload = {
          ...emailPayload,
          to_email: import.meta.env.VITE_SHOP_CONTACT_EMAIL || 'phoolshopstore@gmail.com',
          to_name: 'Phool Shop Admin',
          recipient_type: 'admin',
        };

        const response = await send(serviceId, templateId, adminEmailPayload, publicKey);
        console.log("✅ Admin email sent successfully!", response.status, response.text);

        const customerEmailPayload = {
          ...emailPayload,
          to_email: orderData.email,
          to_name: orderData.name,
          shop_name: 'Phool Shop',
          thank_you_message: 'Thank you for your custom order request! We will review your requirements and get back to you within 2-3 business days with a quote and timeline.',
          recipient_type: 'customer',
        };

        const customerResponse = await send(serviceId, customerTemplateId, customerEmailPayload, publicKey);
        console.log("✅ Customer email sent successfully!", customerResponse.status, customerResponse.text);
      } catch (err) {
        console.error("❌ Custom order email send failed:", err);
      }
    }

    try {
      const sheetSuccess = await addOrderToGoogleSheet(orderData);
      if (sheetSuccess) {
        console.log("Custom order added to Google Sheets successfully");
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
        <div className="relative">
          <PageHero scriptTitle="sirf aapke liye" />
        </div>

        <section className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="retro-card bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-secondary" />
            <p className="font-heading text-xl mt-6">Request received</p>
            <p className="text-muted-foreground mt-2">
              We'll get back to you within 2–3 business days.
            </p>

            {customOrderId && (
              <div className="mt-6 rounded-2xl border-2 border-foreground bg-seashell p-4">
                <p className="text-xs text-muted-foreground">Your Custom Order ID</p>
                <p className="font-mono font-bold text-lg text-foreground mt-1">{customOrderId}</p>
              </div>
            )}

            <div className="mt-8 flex flex-col items-center gap-3">
              <button type="button" className="pill-btn-primary text-xs" onClick={() => setSubmitted(false)}>
                Submit Another Request
              </button>
              {customOrderId && (
                <Link to={`/track-order?order=${customOrderId}`} className="pill-btn-outline text-xs">
                  Track Your Request
                </Link>
              )}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative">
        <PageHero scriptTitle="sirf aapke liye" />
      </div>

      <section className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="retro-card bg-card p-8">
          <h2 className="font-heading text-2xl text-foreground mb-6">Request Form</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-heading mb-2">Your Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-heading mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="jane@email.com"
                  className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-heading mb-2">Phone or WhatsApp (optional)</label>
              <input
                name="phone"
                type="tel"
                placeholder="03XX-XXX-XXXX"
                className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-heading mb-2">What would you like made?</label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Describe the item: type, size, special requests, and any inspiration links"
                className="w-full rounded-3xl border-2 border-foreground bg-card px-4 py-3 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-heading mb-2">Preferred Colors</label>
              <input
                name="colors"
                type="text"
                placeholder="e.g., pastel pink, sage green, cream"
                className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-heading mb-2">Timeline</label>
              <select
                name="timeline"
                className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none"
              >
                <option value="">When do you need it?</option>
                <option value="no-rush">No rush</option>
                <option value="2-weeks">Within 2 weeks</option>
                <option value="1-month">Within 1 month</option>
                <option value="specific">Specific date (mention below)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-heading mb-2">Special notes (optional)</label>
              <input
                name="special_notes"
                type="text"
                placeholder="e.g., Ready by 10 Mar, or Pickup only"
                className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none"
              />
            </div>

            <button type="submit" className="pill-btn-primary text-xs w-full">
              Submit Request
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default CustomOrders;
