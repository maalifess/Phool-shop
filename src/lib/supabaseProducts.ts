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

const PRODUCTS_TTL_MS = 0; // Disable cache completely
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

/** Fetch all products from Supabase + LocalStorage + Default (merging everything) */
export async function loadProducts(): Promise<Product[]> {
  const now = Date.now();
  if (productsCache && now - productsCache.ts < PRODUCTS_TTL_MS) return productsCache.data;
  if (productsInFlight) return productsInFlight;

  productsInFlight = (async () => {
    const tablesToTry = ['products', 'Products', 'product'];
    const allProductsMap = new Map<number, Product>();

    console.log('📦 Gathering products from Supabase only (defaults disabled)...');

    // 1. Skip Hardcoded Defaults - only load from Supabase
    console.log(`📚 Skipped ${defaultProducts.length} products from Hardcoded Defaults (cache cleared)`);

    // 2. Clear LocalStorage to remove any cached products
    try {
      localStorage.removeItem('phool_products_v1');
      console.log('🗑️ Cleared LocalStorage products cache');
    } catch (e) {
      console.warn('⚠️ Could not clear LocalStorage', e);
    }


    // 2. Load LocalStorage (for products added 'before' we switched to Supabase)
    try {
      const localRaw = localStorage.getItem('phool_products_v1');
      if (localRaw) {
        const localParsed = JSON.parse(localRaw) as any[];
        localParsed.forEach(p => {
          allProductsMap.set(p.id, {
            ...p,
            in_stock: p.inStock ?? p.in_stock ?? true,
            _source: 'local_storage'
          } as unknown as Product);
        });
        console.log(`🏠 Loaded ${localParsed.length} products from LocalStorage`);
      }
    } catch (e) {
      console.warn('⚠️ Could not load products from LocalStorage', e);
    }

    // 3. Load Supabase (Real-time DB)
    for (const table of tablesToTry) {
      try {
        const { data: tableData, error: tableError } = await trySelectAllProductsFrom(table);
        if (!tableError && tableData && tableData.length > 0) {
          console.log(`☁️ Found ${tableData.length} records in Supabase table "${table}"`);
          tableData.forEach(p => {
            // Supabase data takes priority over local data for the same ID
            const normalizedImages = Array.isArray(p.images)
              ? p.images
              : (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })();

            allProductsMap.set(p.id, {
              ...p,
              images: normalizedImages,
              in_stock: p.in_stock ?? true,
              price: Number(p.price) || 0,
              _source: `supabase_${table}`
            } as Product);
          });
        }
      } catch (err) {
        // Skip failed tables
      }
    }

    const next = Array.from(allProductsMap.values());
    console.log(`✨ Total unified products: ${next.length}`);

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
