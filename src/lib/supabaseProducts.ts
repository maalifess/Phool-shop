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

type CacheEntry<T> = {
  ts: number;
  data: T;
};

const PRODUCTS_TTL_MS = 5 * 60_000; // 5 minutes instead of 1 minute
let productsCache: CacheEntry<Product[]> | null = null;
let productsInFlight: Promise<Product[]> | null = null;

/** Fetch all products from Supabase (public read) */
export async function loadProducts(): Promise<Product[]> {
  const now = Date.now();
  if (productsCache && now - productsCache.ts < PRODUCTS_TTL_MS) return productsCache.data;
  if (productsInFlight) return productsInFlight;

  productsInFlight = (async () => {
    const { data, error } = await supabase
      .from('Products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load products from Supabase', error);
      return productsCache?.data ?? [];
    }

    const next = (data || []).map((p: any) => {
      const images = typeof p.images === 'string' ? (() => {
        try { return JSON.parse(p.images || '[]'); } catch { return []; }
      })() : p.images;
      return { ...p, images } as Product;
    });

    productsCache = { ts: Date.now(), data: next };
    return next;
  })();

  try {
    return await productsInFlight;
  } finally {
    productsInFlight = null;
  }
}

/** Fetch a single product by id from Supabase (public read) */
export async function loadProductById(id: number): Promise<Product | null> {
  if (!Number.isFinite(id)) return null;

  // Try cache first
  if (productsCache) {
    const cached = productsCache.data.find((p) => p.id === id);
    if (cached) return cached;
  }

  const { data, error } = await supabase
    .from('Products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Failed to load product from Supabase', error);
    return null;
  }

  if (!data) return null;

  const images = typeof (data as any).images === 'string' ? (() => {
    try { return JSON.parse((data as any).images || '[]'); } catch { return []; }
  })() : (data as any).images;
  const normalized = { ...(data as any), images } as Product;

  // Merge into cache
  if (productsCache) {
    const idx = productsCache.data.findIndex((p) => p.id === id);
    if (idx >= 0) {
      const next = [...productsCache.data];
      next[idx] = normalized;
      productsCache = { ts: productsCache.ts, data: next };
    }
  }

  return normalized;
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
