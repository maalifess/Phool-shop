import { supabase } from './supabaseClient';

export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  in_stock: boolean;
  is_custom?: boolean;
  created_at?: string;
};

/** Fetch all products from Supabase (public read) */
export async function loadProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('Products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load products from Supabase', error);
    return [];
  }
  return data || [];
}

/** Create a new product (admin only) */
export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('Products')
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error('Failed to create product', error);
    return null;
  }
  return data;
}

/** Update a product (admin only) */
export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('Products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update product', error);
    return null;
  }
  return data;
}

/** Delete a product (admin only) */
export async function deleteProduct(id: number): Promise<boolean> {
  const { error } = await supabase.from('Products').delete().eq('id', id);
  if (error) {
    console.error('Failed to delete product', error);
    return false;
  }
  return true;
}

/** Upload an image to Supabase Storage and return its public URL */
export async function uploadProductImage(file: File, productId: number, index: number): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const filename = `${productId}/${Date.now()}-${index}.${ext}`;
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filename, file, { upsert: true });

  if (error) {
    console.error('Failed to upload image', error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/** Delete an image from Supabase Storage */
export async function deleteProductImage(url: string): Promise<boolean> {
  const path = new URL(url).pathname.split('/').pop();
  if (!path) return false;
  const { error } = await supabase.storage.from('product-images').remove([path]);
  if (error) {
    console.error('Failed to delete image', error);
    return false;
  }
  return true;
}
