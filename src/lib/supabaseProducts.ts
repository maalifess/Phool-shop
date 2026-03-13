import { supabase } from './supabaseClient';
import { defaultProducts } from './products';


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
const PRODUCTS_TIMEOUT_MS = 10_000; // 10 second timeout for Supabase queries
let productsCache: CacheEntry<Product[]> | null = null;
let productsInFlight: Promise<Product[]> | null = null;

async function trySelectAllProductsFrom(table: string) {
  return await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false });
}

async function trySelectProductByIdFrom(table: string, id: number) {
  return await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .maybeSingle();
}

async function tryInsertProductInto(table: string, product: any) {
  return await supabase
    .from(table)
    .insert(product)
    .select()
    .single();
}

async function tryUpdateProductIn(table: string, id: number, updates: any) {
  return await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

async function tryDeleteProductFrom(table: string, id: number) {
  return await supabase.from(table).delete().eq('id', id);
}

/** Fetch all products from Supabase (public read) */
export async function loadProducts(): Promise<Product[]> {
  const now = Date.now();
  if (productsCache && now - productsCache.ts < PRODUCTS_TTL_MS) return productsCache.data;
  if (productsInFlight) return productsInFlight;

  productsInFlight = (async () => {
    const tablesToTry = ['products', 'Products', 'product'];
    let allData: any[] = [];
    let seenIds = new Set<number>();

    console.log('📦 Scanning all potential tables for products...');

    for (const table of tablesToTry) {
      try {
        const { data: tableData, error: tableError } = await trySelectAllProductsFrom(table);

        if (!tableError && tableData && tableData.length > 0) {
          console.log(`✅ Found ${tableData.length} records in "${table}"`);
          for (const item of tableData) {
            if (!seenIds.has(item.id)) {
              allData.push({ ...item, _source: table });
              seenIds.add(item.id);
            }
          }
        }
      } catch (err) {
        // Silently skip failed tables during merge
      }
    }

    // FALLBACK: If Supabase is empty, use the local default products
    if (allData.length === 0) {
      console.log('ℹ️ Supabase is empty. Falling back to local default products.');
      const localProducts = defaultProducts.map(p => ({
        ...p,
        in_stock: p.inStock, // Map inStock to in_stock
        _source: 'local_fallback'
      }));
      productsCache = { ts: Date.now(), data: localProducts as unknown as Product[] };
      return localProducts as unknown as Product[];
    }

    const next = allData.map((p: any) => {
      // Normalize images: handle JSON strings or arrays
      let images: string[] = [];
      if (Array.isArray(p.images)) {
        images = p.images;
      } else if (typeof p.images === 'string') {
        try {
          images = JSON.parse(p.images || '[]');
        } catch {
          images = p.images.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }

      return {
        ...p,
        images,
        in_stock: p.in_stock ?? true,
        price: Number(p.price) || 0
      } as Product;
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

  const tablesToTry = ['products', 'Products'];
  let data: any = null;
  let error: any = null;

  for (const table of tablesToTry) {
    const res = await trySelectProductByIdFrom(table, id);
    data = res.data;
    error = res.error;
    if (!error) break;
  }

  if (error) {
    console.error('Failed to load product from Supabase', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
    });
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
  const tablesToTry = ['products', 'Products'];
  let data: any = null;
  let error: any = null;

  for (const table of tablesToTry) {
    const res = await tryInsertProductInto(table, product);
    data = res.data;
    error = res.error;
    if (!error) break;
  }

  if (error) {
    console.error('Failed to create product', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
    });
    return null;
  }
  return data;
}

/** Update a product (admin only) */
export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
  const tablesToTry = ['products', 'Products'];
  let data: any = null;
  let error: any = null;

  for (const table of tablesToTry) {
    const res = await tryUpdateProductIn(table, id, updates);
    data = res.data;
    error = res.error;
    if (!error) break;
  }

  if (error) {
    console.error('Failed to update product', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
    });
    return null;
  }
  return data;
}

/** Delete a product (admin only) */
export async function deleteProduct(id: number): Promise<boolean> {
  const tablesToTry = ['products', 'Products'];
  let error: any = null;

  for (const table of tablesToTry) {
    const res = await tryDeleteProductFrom(table, id);
    error = res.error;
    if (!error) break;
  }
  if (error) {
    console.error('Failed to delete product', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
    });
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
