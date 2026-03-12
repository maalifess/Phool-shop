import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { send } from "@emailjs/browser";
import { addOrderToGoogleSheet } from "@/services/googleSheets";
import { createOrder } from "@/lib/supabaseOrders";
import { MouseTrail } from "@/components/MouseTrail";

// Import sticker images
import sticker1 from '@/assets/stickers/1.png';
import sticker2 from '@/assets/stickers/2.png';

const CustomOrders = () => {
  const [submitted, setSubmitted] = useState(false);
  const [customOrderId, setCustomOrderId] = useState("");
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Scroll-based navbar hiding
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <Layout hideNavbar hideFooter>
        <MouseTrail />
        <div className="min-h-screen" style={{ backgroundColor: '#FFF5EE' }}>
          {/* Desktop Navigation */}
          <div className={`hidden lg:flex left-1/2 -translate-x-1/2 w-[93vw] lg:max-w-[1280px] fixed top-10 z-50 h-min transition-transform duration-500 ${navVisible ? 'translate-y-0' : '-translate-y-[200%]'}`}>
            <div className="flex items-center justify-between w-full gap-6">
              <div className="flex items-center justify-center gap-2 border-2 rounded-full px-4 py-2.5 w-full" style={{ backgroundColor: '#FFF5EE', borderColor: '#442f2a' }}>
                <Link to="/" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Home</Link>
                <Link to="/#custom-orders" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Custom Orders</Link>
                <Link to="/catalog" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Shop</Link>
              </div>
              <div className="w-full flex items-center justify-center">
                <Link to="/" className="text-3xl font-bold tracking-tight" style={{ color: '#442f2a', fontFamily: '"Fredoka One", cursive' }}>Phool</Link>
              </div>
              <div className="flex items-center justify-center gap-2 border-2 rounded-full px-4 py-2.5 w-full" style={{ backgroundColor: '#FFF5EE', borderColor: '#442f2a' }}>
                <Link to="/fundraisers" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Fundraisers</Link>
                <Link to="/tokri" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Tokri</Link>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`lg:hidden fixed w-full top-0 left-0 right-0 z-50 bg-transparent p-4 transition-transform duration-500 ${navVisible ? 'translate-y-0' : '-translate-y-[200%]'}`}>
            <div className="relative w-full flex items-center">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 border-2 rounded-full" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                <span className="text-xl">≡</span>
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-shrink-0">
                <Link to="/" className="text-xl font-bold" style={{ color: '#442f2a', fontFamily: '"Fredoka One", cursive' }}>Phool</Link>
              </div>
              <div className="flex items-center gap-3 ml-auto flex-shrink-0">
                <Link to="/tokri" className="w-14 h-14 flex items-center justify-center border-2 rounded-full text-xs font-bold" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}>Tokri</Link>
              </div>
            </div>
          </div>

          {/* Success Section */}
          <div className="xl:max-w-[1360px] mx-auto">
            <section className="w-full border-x-2 border-[#442f2a] bg-[#F7F3ED] text-[#442f2a] max-w-[90vw] md:max-w-[95vw] mx-auto relative py-16 md:py-24">
              <div className="max-w-[1080px] flex flex-col items-center justify-center gap-10 px-4 mx-auto">
                <div className="w-full flex items-center justify-between gap-6 mt-16">
                  <div className="hidden md:flex w-16 h-16 border-2 rounded-full items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                    <ArrowRight className="h-6 w-6" />
                  </div>
                  <h2 className="text-[4rem] md:text-[8rem] leading-[1] rotate-[-10deg]" style={{ fontFamily: '"Sacramento", cursive' }}>Success!</h2>
                  <div className="hidden md:flex w-16 h-16 border-2 rounded-full items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                    <ArrowRight className="h-6 w-6 rotate-180" />
                  </div>
                </div>

                <div className="text-center max-w-2xl">
                  <CheckCircle2 className="mx-auto h-16 w-16" style={{ color: '#442f2a' }} />
                  <p className="mt-6 text-base md:text-lg leading-[1.6]">
                    We'll get back to you within 2–3 business days. Please send a proof of payment screenshot to WhatsApp on 0333-XXXXXXX.
                  </p>
                  {customOrderId && (
                    <div className="mt-6 p-4 border-2 rounded-[1.5rem]" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                      <p className="text-sm" style={{ color: '#442f2a' }}>Your Custom Order ID:</p>
                      <p className="font-mono font-bold text-lg mt-1" style={{ color: '#442f2a' }}>{customOrderId}</p>
                      <p className="text-xs mt-1" style={{ color: '#BC8F8F' }}>Save this ID to track your custom order</p>
                    </div>
                  )}
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <Button onClick={() => setSubmitted(false)} className="rounded-full px-6 border-2" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>
                      Submit Another Request
                    </Button>
                    {customOrderId && (
                      <Button asChild variant="outline" className="rounded-full px-6 border-2" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}>
                        <Link to={`/track-order?order=${customOrderId}`}>Track Your Request</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNavbar hideFooter>
      <MouseTrail />
      <div className="min-h-screen" style={{ backgroundColor: '#FFF5EE' }}>
        {/* Desktop Navigation */}
        <div className={`hidden lg:flex left-1/2 -translate-x-1/2 w-[93vw] lg:max-w-[1280px] fixed top-10 z-50 h-min transition-transform duration-500 ${navVisible ? 'translate-y-0' : '-translate-y-[200%]'}`}>
          <div className="flex items-center justify-between w-full gap-6">
            <div className="flex items-center justify-center gap-2 border-2 rounded-full px-4 py-2.5 w-full" style={{ backgroundColor: '#FFF5EE', borderColor: '#442f2a' }}>
              <Link to="/" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Home</Link>
              <Link to="/#custom-orders" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Custom Orders</Link>
              <Link to="/catalog" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Shop</Link>
            </div>
            <div className="w-full flex items-center justify-center">
              <Link to="/" className="text-3xl font-bold tracking-tight" style={{ color: '#442f2a', fontFamily: '"Fredoka One", cursive' }}>Phool</Link>
            </div>
            <div className="flex items-center justify-center gap-2 border-2 rounded-full px-4 py-2.5 w-full" style={{ backgroundColor: '#FFF5EE', borderColor: '#442f2a' }}>
              <Link to="/fundraisers" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Fundraisers</Link>
              <Link to="/tokri" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Tokri</Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden fixed w-full top-0 left-0 right-0 z-50 bg-transparent p-4 transition-transform duration-500 ${navVisible ? 'translate-y-0' : '-translate-y-[200%]'}`}>
          <div className="relative w-full flex items-center">
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 border-2 rounded-full" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
              <span className="text-xl">≡</span>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-shrink-0">
              <Link to="/" className="text-xl font-bold" style={{ color: '#442f2a', fontFamily: '"Fredoka One", cursive' }}>Phool</Link>
            </div>
            <div className="flex items-center gap-3 ml-auto flex-shrink-0">
              <Link to="/tokri" className="w-14 h-14 flex items-center justify-center border-2 rounded-full text-xs font-bold" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}>Tokri</Link>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="pt-[5dvh] md:pt-0">
          <div className="xl:max-w-[1360px] mx-auto">
            <div className="w-full flex items-center justify-center relative">
              <div className="border-2 border-[#442f2a] lg:w-[95vw] w-[90vw] min-h-[50dvh] md:min-h-[60dvh] overflow-hidden mt-[8dvh] md:mt-[2dvh] px-6 md:px-8 grid place-items-center" style={{ borderRadius: '3.5rem 3.5rem 0 0', backgroundColor: '#EFD8D6' }}>
                <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center justify-center gap-6 py-12">
                  <h1 className="text-[4rem] md:text-[8rem] leading-[1] rotate-[-10deg]" style={{ fontFamily: '"Sacramento", cursive', color: '#FFF5EE' }}>
                    Custom Orders
                  </h1>
                  <p className="max-w-[44ch] text-base md:text-lg text-center" style={{ color: '#442f2a' }}>
                    Got a custom order? We're here to curate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="xl:max-w-[1360px] mx-auto">
          <section className="w-full border-x-2 border-[#442f2a] bg-[#F7F3ED] text-[#442f2a] max-w-[90vw] md:max-w-[95vw] mx-auto relative py-16 md:py-20">
            <div className="max-w-[1080px] flex flex-col items-center justify-center gap-10 px-4 mx-auto">
              <div className="w-full flex items-center justify-between gap-6 mt-16">
                <div className="hidden md:flex w-16 h-16 border-2 rounded-full items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <ArrowRight className="h-6 w-6" />
                </div>
                <h2 className="text-[4rem] md:text-[8rem] leading-[1] rotate-[-10deg]" style={{ fontFamily: '"Sacramento", cursive' }}>Request Form</h2>
                <div className="hidden md:flex w-16 h-16 border-2 rounded-full items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <ArrowRight className="h-6 w-6 rotate-180" />
                </div>
              </div>

              <div className="w-full max-w-2xl">
                <div className="border-2 rounded-[2rem] overflow-hidden" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#442f2a' }}>Your Name</label>
                          <input 
                            name="name" 
                            type="text" 
                            required 
                            placeholder="Jane Doe"
                            className="w-full border-2 rounded-xl px-4 py-2 outline-none"
                            style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#442f2a' }}>Email</label>
                          <input 
                            name="email" 
                            type="email" 
                            required 
                            placeholder="jane@email.com"
                            className="w-full border-2 rounded-xl px-4 py-2 outline-none"
                            style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#442f2a' }}>Phone or WhatsApp (optional)</label>
                        <input 
                          name="phone" 
                          type="tel" 
                          placeholder="03XX-XXX-XXXX"
                          className="w-full border-2 rounded-xl px-4 py-2 outline-none"
                          style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#442f2a' }}>What would you like made?</label>
                        <textarea 
                          name="description"
                          required 
                          rows={4}
                          placeholder="Describe the item: type (toy, blanket), size, special requests, and any inspiration links"
                          className="w-full border-2 rounded-xl px-4 py-2 outline-none resize-none"
                          style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#442f2a' }}>Preferred Colors</label>
                        <input 
                          name="colors" 
                          type="text" 
                          placeholder="e.g., pastel pink, sage green, cream"
                          className="w-full border-2 rounded-xl px-4 py-2 outline-none"
                          style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#442f2a' }}>Timeline</label>
                        <select 
                          name="timeline"
                          className="w-full border-2 rounded-xl px-4 py-2 outline-none"
                          style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                        >
                          <option value="">When do you need it?</option>
                          <option value="no-rush">No rush</option>
                          <option value="2-weeks">Within 2 weeks</option>
                          <option value="1-month">Within 1 month</option>
                          <option value="specific">Specific date (mention below)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#442f2a' }}>Special notes (optional)</label>
                        <input 
                          name="special_notes" 
                          type="text" 
                          placeholder="e.g., Ready by 10 Mar, or Pickup only"
                          className="w-full border-2 rounded-xl px-4 py-2 outline-none"
                          style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full border-2 rounded-full px-6 py-3 font-bold transition-colors duration-200"
                        style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}
                      >
                        Submit Request
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default CustomOrders;
