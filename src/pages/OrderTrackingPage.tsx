import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Clock, CheckCircle2, Truck, CheckCircle, XCircle, Copy, Check, Calendar, Mail, Phone, User, Gift } from "lucide-react";
import { searchOrderById, type OrderRecord } from "@/lib/supabaseOrders";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const [searchId, setSearchId] = useState("");
  const [results, setResults] = useState<OrderRecord[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Auto-fill search if order ID is in URL
  useEffect(() => {
    const orderId = searchParams.get("order");
    if (orderId) {
      setSearchId(orderId);
      // Auto-search after a short delay to show the loading state
      setTimeout(() => {
        handleSearch(orderId);
      }, 500);
    }
  }, [searchParams]);

  const handleSearch = async (orderId?: string) => {
    const idToSearch = orderId || searchId.trim();
    if (!idToSearch) return;

    setLoading(true);
    try {
      const orders = await searchOrderById(idToSearch);
      setResults(orders);
      setSearched(true);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    handleSearch();
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Under Process":
        return <Package className="h-5 w-5" />;
      case "Confirmed":
        return <CheckCircle2 className="h-5 w-5" />;
      case "In Progress":
        return <Clock className="h-5 w-5" />;
      case "Ready":
        return <CheckCircle className="h-5 w-5" />;
      case "Dispatched":
        return <Truck className="h-5 w-5" />;
      case "Completed":
        return <CheckCircle className="h-5 w-5" />;
      case "Delivered":
        return <CheckCircle className="h-5 w-5" />;
      case "Cancelled":
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const statusSteps = [
    { key: "Under Process", label: "Order Placed", icon: Package },
    { key: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
    { key: "In Progress", label: "In Progress", icon: Clock },
    { key: "Ready", label: "Ready", icon: CheckCircle },
    { key: "Dispatched", label: "Dispatched", icon: Truck },
    { key: "Completed", label: "Completed", icon: CheckCircle },
    { key: "Delivered", label: "Delivered", icon: CheckCircle },
    { key: "Cancelled", label: "Cancelled", icon: XCircle },
  ];

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Search className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl mb-4">
              Track Your Order
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter your order ID to check the status of your Phool Shop order
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl mx-auto mb-8"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Enter your Order ID (e.g., PS-ABC-123)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearchClick} disabled={loading}>
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>

          {searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {results.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Order not found</h3>
                  <p className="text-muted-foreground">
                    Please check your order ID and try again. If you continue to have issues, contact us at{" "}
                    <a href="mailto:phoolshopstore@gmail.com" className="text-primary hover:underline">
                      phoolshopstore@gmail.com
                    </a>
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {results.map((order, index) => (
                    <motion.div
                      key={order.order_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="border-border/40">
                        <CardHeader>
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(order.status || "Under Process")}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-bold text-primary">
                                    {order.order_id}
                                  </span>
                                  <button
                                    onClick={() => copyId(order.order_id)}
                                    className="rounded p-1 hover:bg-muted transition-colors"
                                  >
                                    {copied === order.order_id ? (
                                      <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                  </button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(order.created_at || "")}
                                </p>
                              </div>
                            </div>
                            <OrderStatusBadge status={order.status} />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-6">
                            {/* Customer Information */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Customer Information
                              </h4>
                              <div className="grid gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Name:</span>
                                  <span>{order.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span>{order.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span>{order.phone}</span>
                                </div>
                                {order.address && (
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium">Address:</span>
                                    <span className="text-sm">{order.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Order Details */}
                            <div>
                              <h4 className="font-medium mb-3">Order Details</h4>
                              <div className="bg-muted/30 rounded-lg p-4">
                                <div className="space-y-2 text-sm">
                                  <div className="whitespace-pre-line">{order.products}</div>
                                  <div className="flex justify-between items-center pt-2 border-t border-border/40">
                                    <span>Quantity: {order.quantity}</span>
                                    <span className="font-bold text-lg text-primary">PKR {order.total}</span>
                                  </div>
                                  {order.gift_wrap && (
                                    <div className="flex items-center gap-2 text-pink-600">
                                      <Gift className="h-4 w-4" />
                                      <span className="text-sm">Gift wrapped</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Order Status Timeline */}
                            <div>
                              <h4 className="font-medium mb-3">Order Status</h4>
                              <div className="flex items-center justify-between">
                                {statusSteps.map((step, i) => {
                                  const currentStatusIndex = statusSteps.findIndex(s => s.key === order.status);
                                  const isActive = i <= currentStatusIndex && currentStatusIndex !== -1;
                                  const Icon = step.icon;
                                  return (
                                    <div key={step.key} className="flex flex-col items-center flex-1">
                                      <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                          isActive
                                            ? "bg-primary text-white"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        <Icon className="h-4 w-4" />
                                      </div>
                                      <span
                                        className={`mt-2 text-xs font-medium text-center ${
                                          isActive ? "text-primary" : "text-muted-foreground"
                                        }`}
                                      >
                                        {step.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Payment Information */}
                            {order.payment_method && (
                              <div>
                                <h4 className="font-medium mb-3">Payment Information</h4>
                                <div className="bg-muted/30 rounded-lg p-4 text-sm">
                                  <div className="flex justify-between">
                                    <span>Payment Method:</span>
                                    <span className="font-medium">{order.payment_method}</span>
                                  </div>
                                  {order.promo_code && (
                                    <div className="flex justify-between mt-2">
                                      <span>Promo Code:</span>
                                      <span className="font-medium">{order.promo_code}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            {order.notes && (
                              <div>
                                <h4 className="font-medium mb-3">Notes</h4>
                                <div className="bg-muted/30 rounded-lg p-4 text-sm">
                                  {order.notes}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default OrderTrackingPage;
