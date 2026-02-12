import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ShoppingBag } from "lucide-react";

const Order = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Layout>
        <section className="flex min-h-[60vh] items-center justify-center py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md text-center"
          >
            <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
            <h2 className="mt-6 font-display text-3xl font-bold text-foreground">Order Placed!</h2>
            <p className="mt-4 text-muted-foreground">
              Thank you! We'll confirm your order via email. Payment can be made via Venmo or cash on pickup.
            </p>
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
                      <Input id="name" placeholder="Jane Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="jane@email.com" required />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="(555) 123-4567" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" min="1" defaultValue="1" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Shipping Address</Label>
                    <Textarea id="address" placeholder="Street, City, State, ZIP" rows={2} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="products">Product(s) You'd Like to Order</Label>
                    <Textarea
                      id="products"
                      placeholder="List the product name(s) and any specifications..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (optional)</Label>
                    <Textarea id="notes" placeholder="Any special requests, gift wrapping, etc." rows={2} />
                  </div>

                  <div className="rounded-lg border border-border/60 bg-accent/50 p-4 text-sm text-muted-foreground">
                    💡 <strong>Payment:</strong> No online payment needed. We'll contact you to arrange payment via Venmo or cash on pickup/delivery.
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
