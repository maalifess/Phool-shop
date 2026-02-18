import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Trash2, Calendar, User, Phone, Mail, Package } from "lucide-react";
import { getOrdersFromStorage } from "@/services/googleSheets";

interface Order {
  timestamp: string;
  orderType: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  products: string;
  quantity: string;
  paymentMethod: string;
  notes: string;
  customDescription?: string;
  customColors?: string;
  customTimeline?: string;
  error?: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const storedOrders = getOrdersFromStorage();
    setOrders(storedOrders.reverse()); // Show newest first
  }, []);

  const downloadOrdersAsCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      'Timestamp', 'Order Type', 'Name', 'Email', 'Phone', 'Address', 
      'Products', 'Quantity', 'Payment Method', 'Notes', 
      'Custom Description', 'Custom Colors', 'Custom Timeline'
    ];
    
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        `"${order.timestamp}"`,
        `"${order.orderType}"`,
        `"${order.name}"`,
        `"${order.email}"`,
        `"${order.phone}"`,
        `"${order.address}"`,
        `"${order.products}"`,
        `"${order.quantity}"`,
        `"${order.paymentMethod}"`,
        `"${order.notes}"`,
        `"${order.customDescription || ''}"`,
        `"${order.customColors || ''}"`,
        `"${order.customTimeline || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phoolshop-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearOrders = () => {
    if (confirm('Are you sure you want to clear all stored orders? This action cannot be undone.')) {
      localStorage.removeItem('phool_orders_backup');
      setOrders([]);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Order Management</h1>
              <p className="mt-2 text-muted-foreground">
                View and manage customer orders ({orders.length} total)
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadOrdersAsCSV} disabled={orders.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
              <Button variant="destructive" onClick={clearOrders} disabled={orders.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>
          </motion.div>

          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Package className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
              <p className="mt-2 text-muted-foreground">
                Orders will appear here once customers start placing them.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order, index) => (
                <motion.div
                  key={`${order.timestamp}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-border/40 hover:border-border/60 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Badge variant={order.orderType === 'custom' ? 'secondary' : 'default'}>
                            {order.orderType === 'custom' ? 'Custom Order' : 'Regular Order'}
                          </Badge>
                          {order.error && (
                            <Badge variant="destructive">Sync Error</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.timestamp)}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{order.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {order.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {order.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Products:</span> {order.products} (Qty: {order.quantity})
                        </div>
                        {order.address && (
                          <div>
                            <span className="font-medium">Address:</span> {order.address}
                          </div>
                        )}
                        {order.paymentMethod && (
                          <div>
                            <span className="font-medium">Payment:</span> {order.paymentMethod}
                          </div>
                        )}
                        {order.orderType === 'custom' && (
                          <div className="mt-2 p-3 bg-muted/30 rounded-md">
                            <div className="font-medium mb-1">Custom Details:</div>
                            {order.customDescription && (
                              <div><span className="font-medium">Description:</span> {order.customDescription}</div>
                            )}
                            {order.customColors && (
                              <div><span className="font-medium">Colors:</span> {order.customColors}</div>
                            )}
                            {order.customTimeline && (
                              <div><span className="font-medium">Timeline:</span> {order.customTimeline}</div>
                            )}
                          </div>
                        )}
                        {order.notes && (
                          <div>
                            <span className="font-medium">Notes:</span> {order.notes}
                          </div>
                        )}
                        {order.error && (
                          <div className="text-destructive text-xs mt-2">
                            <span className="font-medium">Error:</span> {order.error}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedOrder(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                    ×
                  </Button>
                </div>
                <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
                  {JSON.stringify(selectedOrder, null, 2)}
                </pre>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default AdminOrders;
