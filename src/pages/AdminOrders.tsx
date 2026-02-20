import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Trash2, Calendar, User, Phone, Mail, Package, ChevronDown } from "lucide-react";
import { loadAllOrders, updateOrderStatus as updateOrderStatusInSupabase } from "@/lib/supabaseOrders";

interface Order {
  id?: number;
  order_id: string;
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
  status?: string;
  error?: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderStatuses = [
    { value: 'Under Process', label: 'Under Process', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'Confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'Ready', label: 'Ready', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'Dispatched', label: 'Dispatched', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { value: 'Completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'Delivered', label: 'Delivered', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const supabaseOrders = await loadAllOrders();
        // Convert Supabase orders to the format expected by the component
        const formattedOrders = supabaseOrders.map(order => ({
          ...order,
          timestamp: order.created_at || new Date().toISOString(),
          orderType: order.order_type,
          paymentMethod: order.payment_method,
          customDescription: order.custom_description,
          customColors: order.custom_colors,
          customTimeline: order.custom_timeline,
        }));
        setOrders(formattedOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderIndex: number, newStatus: string) => {
    const order = orders[orderIndex];
    if (!order.order_id) {
      console.error('No order_id found for order:', order);
      return;
    }

    try {
      console.log(`Updating order ${order.order_id} status to ${newStatus}`);
      const success = await updateOrderStatusInSupabase(order.order_id, newStatus);
      if (success) {
        const updatedOrders = [...orders];
        updatedOrders[orderIndex].status = newStatus;
        setOrders(updatedOrders);
        console.log(`Order ${order.order_id} status updated to ${newStatus}`);
        
        // Optional: Refresh orders from Supabase to confirm the update
        setTimeout(async () => {
          try {
            const freshOrders = await loadAllOrders();
            const formattedOrders = freshOrders.map(o => ({
              ...o,
              timestamp: o.created_at || new Date().toISOString(),
              orderType: o.order_type,
              paymentMethod: o.payment_method,
              customDescription: o.custom_description,
              customColors: o.custom_colors,
              customTimeline: o.custom_timeline,
            }));
            setOrders(formattedOrders);
          } catch (error) {
            console.error('Failed to refresh orders:', error);
          }
        }, 1000);
      } else {
        console.error('Failed to update order status in Supabase');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const downloadOrdersAsCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      'Order ID', 'Timestamp', 'Order Type', 'Name', 'Email', 'Phone', 'Address', 
      'Products', 'Quantity', 'Payment Method', 'Status', 'Notes', 
      'Custom Description', 'Custom Colors', 'Custom Timeline'
    ];
    
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        `"${order.order_id || ''}"`,
        `"${order.timestamp}"`,
        `"${order.orderType}"`,
        `"${order.name}"`,
        `"${order.email}"`,
        `"${order.phone}"`,
        `"${order.address}"`,
        `"${order.products}"`,
        `"${order.quantity}"`,
        `"${order.paymentMethod}"`,
        `"${order.status || 'Under Process'}"`,
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
    // This function would need to be implemented in Supabase
    // For now, we'll just refresh the orders
    alert('Clear orders functionality needs to be implemented in Supabase. Please contact your developer.');
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

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
              <h3 className="text-lg font-medium">Loading orders...</h3>
              <p className="mt-2 text-muted-foreground">
                Fetching orders from database
              </p>
            </motion.div>
          ) : orders.length === 0 ? (
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
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant={order.orderType === 'custom' ? 'secondary' : 'default'}>
                            {order.orderType === 'custom' ? 'Custom Order' : 'Regular Order'}
                          </Badge>
                          <Badge 
                            className={`border ${orderStatuses.find(s => s.value === (order.status || 'Under Process'))?.color || 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
                          >
                            {order.status || 'Under Process'}
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
                      <div className="flex items-center gap-2 mt-2">
                        <CardTitle className="text-lg">{order.name}</CardTitle>
                        {order.order_id && (
                          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                            ID: {order.order_id}
                          </span>
                        )}
                      </div>
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
                      
                      {/* Order Status Management */}
                      <div className="mt-4 p-3 bg-muted/30 rounded-md">
                        <div className="font-medium mb-2 text-sm">Update Status:</div>
                        <div className="flex flex-wrap gap-2">
                          {orderStatuses.map((status) => (
                            <Button
                              key={status.value}
                              variant={order.status === status.value ? "default" : "outline"}
                              size="sm"
                              className={`text-xs px-2 py-1 h-auto ${
                                order.status === status.value 
                                  ? status.color.replace('bg-', 'bg-').replace('text-', 'text-').replace('border-', 'border-')
                                  : 'hover:' + status.color
                              }`}
                              onClick={() => updateOrderStatus(index, status.value)}
                            >
                              {status.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
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
