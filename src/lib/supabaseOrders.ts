import { supabase } from './supabaseClient';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  customText?: string;
}

export interface OrderRecord {
  id?: number;
  order_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  products: string;
  quantity: string;
  payment_method: string;
  notes: string;
  order_type: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  promo_code: string | null;
  gift_wrap: boolean;
  gift_wrap_cost: number;
  gift_message: string;
  custom_description: string;
  custom_colors: string;
  custom_timeline: string;
  created_at?: string;
}

/** Create a new order */
export async function createOrder(order: Omit<OrderRecord, 'id' | 'created_at'>): Promise<OrderRecord | null> {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) {
    console.error('Failed to create order:', error);
    return null;
  }
  return data as OrderRecord;
}

/** Load all orders (for admin dashboard), newest first */
export async function loadAllOrders(): Promise<OrderRecord[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load orders:', error);
    return [];
  }
  return (data || []) as OrderRecord[];
}

/** Search orders by order_id (for tracking page) */
export async function searchOrderById(orderId: string): Promise<OrderRecord[]> {
  const q = orderId.trim().toUpperCase();
  if (!q) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .ilike('order_id', `%${q}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to search orders:', error);
    return [];
  }
  return (data || []) as OrderRecord[];
}

/** Load orders by email (for customer tracking page) */
export async function loadOrdersByEmail(email: string): Promise<OrderRecord[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load orders by email:', error);
    return [];
  }
  return (data || []) as OrderRecord[];
}

/** Update order status (admin) */
export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('order_id', orderId);

  if (error) {
    console.error('Failed to update order status:', error);
    return false;
  }
  return true;
}

/** Delete an order (admin) */
export async function deleteOrderByOrderId(orderId: string): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('order_id', orderId);

  if (error) {
    console.error('Failed to delete order:', error);
    return false;
  }
  return true;
}
