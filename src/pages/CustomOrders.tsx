import { useState } from "react";
import { motion } from "framer-motion";
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

const CustomOrders = () => {
  const [submitted, setSubmitted] = useState(false);

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
    const emailPayload = {
      ...orderData,
      ...orderData.customDetails,
      order_summary: `Custom Order: ${orderData.customDetails.description}`,
      total_amount: 'To be quoted',
      timestamp: new Date().toLocaleString(),
      payment_details: "To be discussed with customer",
      custom_request: true,
    };

    // Send email via EmailJS
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

    try {
      await send(serviceId, templateId, emailPayload, publicKey);
      console.log("Custom order email sent successfully");
    } catch (err) {
      console.error("Email send failed:", err);
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
            <Button className="mt-8 rounded-full px-8" onClick={() => setSubmitted(false)}>
              Submit Another Request
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
                      <Input id="name" placeholder="Jane Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="jane@email.com" required />
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
