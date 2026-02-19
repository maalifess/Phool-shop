import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, Clock, CheckCircle2, Copy, Check } from "lucide-react";

interface StoredOrder {
  id: string;
  items: { id: number; name: string; price: number; quantity: number; customText?: string }[];
  subtotal: number;
  discount: number;
  giftWrap: boolean;
  giftWrapCost: number;
  total: number;
  promo: string | null;
  date: string;
  status: string;
  name: string;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Package },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const OrderTracking = () => {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [searchId, setSearchId] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<StoredOrder[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("phool_orders");
      if (raw) {
        const parsed = JSON.parse(raw) as StoredOrder[];
        setOrders(parsed.reverse());
        setFilteredOrders(parsed);
      }
    } catch {}
  }, []);

  const handleSearch = () => {
    const q = searchId.trim().toUpperCase();
    if (!q) {
      setFilteredOrders(orders);
      return;
    }
    setFilteredOrders(orders.filter((o) => o.id.toUpperCase().includes(q)));
  };

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const getStatusIndex = (status: string) => {
    const idx = statusSteps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Package className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">Track Your Orders</h1>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              View your order history and track status.
            </p>
          </motion.div>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-md">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search by Order ID..."
                  className="pl-10 rounded-full"
                />
              </div>
              <Button onClick={handleSearch} className="rounded-full">Search</Button>
            </div>
          </div>

          {/* Orders list */}
          <div className="mt-10 space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg">{orders.length === 0 ? "No orders yet." : "No orders match your search."}</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const statusIdx = getStatusIndex(order.status);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-border/40">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
                              <button onClick={() => copyId(order.id)} className="rounded p-1 hover:bg-muted transition-colors">
                                {copied === order.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                              </button>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                            </p>
                            {order.name && <p className="text-sm text-muted-foreground">Placed by: {order.name}</p>}
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-primary">PKR {order.total}</span>
                            {order.discount > 0 && (
                              <p className="text-xs text-green-600">Saved PKR {order.discount}</p>
                            )}
                            {order.giftWrap && (
                              <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                <span>Gift wrapped</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Items */}
                        {order.items.length > 0 && (
                          <div className="mt-4 space-y-1">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                                <span>PKR {item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Status tracker */}
                        <div className="mt-6">
                          <div className="flex items-center justify-between">
                            {statusSteps.map((step, i) => {
                              const active = i <= statusIdx;
                              const Icon = step.icon;
                              return (
                                <div key={step.key} className="flex flex-col items-center flex-1">
                                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${active ? "bg-primary text-white" : "bg-muted text-muted-foreground"} transition-colors`}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <span className={`mt-2 text-xs font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                                    {step.label}
                                  </span>
                                  {i < statusSteps.length - 1 && (
                                    <div className={`absolute h-0.5 ${active ? "bg-primary" : "bg-muted"}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-1 flex">
                            {statusSteps.slice(0, -1).map((_, i) => (
                              <div key={i} className={`flex-1 h-0.5 mx-4 rounded ${i < statusIdx ? "bg-primary" : "bg-muted"}`} />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OrderTracking;
