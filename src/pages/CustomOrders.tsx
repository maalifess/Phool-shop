import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { CheckCircle2, Upload, MessageSquare, Instagram, Phone, Camera } from "lucide-react";
import { send } from "@emailjs/browser";
import { addOrderToGoogleSheet } from "@/services/googleSheets";
import { createOrder } from "@/lib/supabaseOrders";

const CustomOrders = () => {
  const [submitted, setSubmitted] = useState(false);
  const [customOrderId, setCustomOrderId] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Handle image upload with compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress image if it's large
      if (file.size > 100000) { // 100KB threshold
        const compressedImage = await compressImage(file);
        setUploadedImage(compressedImage);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Compress image function
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with reduced quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const orderData = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      instagram: String(fd.get("instagram") || ""),
      address: String(fd.get("address") || ""),
      products: "Custom Order Request",
      quantity: "1",
      notes: String(fd.get("special_notes") || ""),
      paymentMethod: "To be discussed",
      orderType: 'custom' as const,
      customDetails: {
        description: String(fd.get("description") || ""),
        colors: String(fd.get("colors") || ""),
        timeline: String(fd.get("timeline") || ""),
      },
      custom_image: uploadedImage || "",
    };

    const orderId = `CUSTOM-${Date.now()}`;

    // Save custom order to Supabase
    try {
      await createOrder({
        order_id: orderId,
        name: orderData.name,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address,
        instagram: orderData.instagram,
        products: "Custom Order Request",
        quantity: "1",
        payment_method: "To be discussed",
        notes: [
          orderData.customDetails.timeline ? `Timeline: ${orderData.customDetails.timeline}` : "",
          orderData.notes ? `Special Notes: ${orderData.notes}` : "",
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
        custom_image: uploadedImage || "",
      });
    } catch (err) {
      console.error("Supabase custom order save failed:", err);
    }

    const emailPayload = {
      order_id: orderId,
      name: orderData.name,
      email: orderData.email,
      phone: orderData.phone,
      instagram: orderData.instagram,
      address: orderData.address,
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
      customer_notes: orderData.notes,
      special_instructions: `Custom order - ${orderData.customDetails.description}`,
      custom_image: uploadedImage || "",
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
      await addOrderToGoogleSheet(orderData);
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
          <PageHero scriptTitle="sirf aapke liye" title="CUSTOM ORDERS" />
        </div>

        <section className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="retro-card bg-card p-8 text-center shadow-retro">
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
        <PageHero scriptTitle="sirf aapke liye" title="CUSTOM ORDERS" />
      </div>

      <section className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="retro-card bg-card p-8 shadow-retro border-2 border-foreground">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="font-heading text-2xl text-foreground">Request Form</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-heading mb-2">Your Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-heading mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="jane@email.com"
                  className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-heading mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-secondary" /> Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="03XX-XXXXXXX"
                  className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-heading mb-2 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-secondary" /> Instagram @
                </label>
                <input
                  name="instagram"
                  type="text"
                  placeholder="@yourusername"
                  className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-heading mb-2">Shipping Address</label>
              <textarea
                name="address"
                required
                rows={3}
                placeholder="Enter your complete shipping address"
                className="w-full rounded-3xl border-2 border-foreground bg-card px-4 py-3 outline-none resize-none focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-heading mb-2">Describe Your Vision</label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Describe the item: type, size, and any inspiration links..."
                className="w-full rounded-3xl border-2 border-foreground bg-card px-4 py-3 outline-none resize-none focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-heading mb-2 flex items-center gap-2">
                <Camera className="w-4 h-4 text-secondary" /> Reference Image (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="custom-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="custom-image"
                  className="flex items-center justify-center gap-3 w-full rounded-full border-2 border-dashed border-foreground/40 bg-card/50 px-4 py-4 cursor-pointer hover:bg-card hover:border-foreground transition-all group"
                >
                  {uploadedImage ? (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle2 className="w-5 h-5" /> Image attached
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                      <span className="text-muted-foreground font-heading text-sm">Upload an inspiration photo</span>
                    </>
                  )}
                </label>
                {uploadedImage && (
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center shadow-md"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-heading mb-2">Timeline</label>
                <select
                  name="timeline"
                  required
                  className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none cursor-pointer focus:bg-white transition-colors"
                >
                  <option value="">When do you need it?</option>
                  <option value="no-rush">No rush</option>
                  <option value="2-weeks">Within 2 weeks</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="specific">Specific date (mention in notes)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-heading mb-2">Preferred Colors</label>
                <input
                  name="colors"
                  type="text"
                  placeholder="e.g., pastel pink, cream"
                  className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-heading mb-2">Special Notes</label>
              <input
                name="special_notes"
                type="text"
                placeholder="Any other details we should know?"
                className="w-full rounded-full border-2 border-foreground bg-card px-4 py-3 outline-none focus:bg-white transition-colors"
              />
            </div>

            <button type="submit" className="pill-btn-primary text-xs w-full py-4 shadow-retro hover:shadow-none transition-all">
              Submit Request
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default CustomOrders;
