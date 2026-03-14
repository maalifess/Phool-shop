import { supabase } from './supabaseClient';
import type { Review } from './supabaseTypes';


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

export type ProductCatalog = {
  id: number;
  name: string;
  price: number;
  category: string;
  images: string[];
  in_stock: boolean;
  is_custom?: boolean;
};

export type ProductWithReviews = Product & {
  reviews: Review[];
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
  // Clear all caches immediately
  productsCache = null;
  productsInFlight = null;
  
  const tablesToTry = ['products']; // Only use lowercase products table
  const allProductsMap = new Map<number, Product>();

  console.log('📦 Gathering products from products table only (all caches cleared)...');

  // 1. Skip Hardcoded Defaults - only load from Supabase
  console.log('📚 Skipped hardcoded default products (cache cleared)');

  // 2. Skip LocalStorage completely - only use Supabase
  console.log('🏠 Skipped LocalStorage products (cache cleared)');

  // 3. Load Supabase (Real-time DB) - only from products table
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
          
          // Debug: Log image URLs for each product
          console.log(`🖼️ Product "${p.name}" (${p.id}) images:`, normalizedImages);
          
          // Add fallback placeholder if no images
          if (!normalizedImages || normalizedImages.length === 0) {
            normalizedImages.push(`https://picsum.photos/seed/phool-${p.id}/400/400.jpg`);
            console.log(`🖼️ Added placeholder image for product "${p.name}"`);
          }
        });
      } else if (tableError) {
        console.error(`❌ Error loading from ${table}:`, tableError);
      }
    } catch (err) {
      console.error(`❌ Exception loading from ${table}:`, err);
    }
  }

  const next = Array.from(allProductsMap.values());
  console.log(`✨ Total unified products: ${next.length}`);

  productsCache = { ts: Date.now(), data: next };
  return next;
}


/** Ultra-fast paginated catalog loading - only load what we need */
export async function loadProductsPaginated(limit: number = 20, offset: number = 0): Promise<ProductCatalog[]> {
  try {
    console.log(`⚡ Loading paginated products FAST (limit: ${limit}, offset: ${offset})...`);
    
    // Only load essential fields + pagination
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, category, images, in_stock')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    console.log(`⚡ Loaded ${data?.length || 0} products FAST (paginated)`);

    if (error) {
      console.error('❌ Error in paginated products load:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('💥 Error in loadProductsPaginated:', error);
    return [];
  }
}

/** Ultra-fast paginated cards loading */
export async function loadCardsPaginated(limit: number = 20, offset: number = 0): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('id, name, price, category, images, in_stock')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error in paginated cards load:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in loadCardsPaginated:', error);
    return [];
  }
}

/** Get total count of products (for pagination) */
export async function getProductsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting products count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getProductsCount:', error);
    return 0;
  }
}

/** Ultra-fast catalog loading - only essential fields for list view */
export async function loadProductsFast(): Promise<ProductCatalog[]> {
  try {
    console.log('⚡ Loading ALL products FAST (catalog mode)...');
    
    // Only load fields needed for catalog display
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, category, images, in_stock')
      .order('created_at', { ascending: false });

    console.log(`⚡ Loaded ${data?.length || 0} products FAST`);

    if (error) {
      console.error('❌ Error in fast products load:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('💥 Error in loadProductsFast:', error);
    return [];
  }
}

/** Ultra-fast cards loading - only essential fields for list view */
export async function loadCardsFast(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('id, name, price, category, images, in_stock')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in fast cards load:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in loadCardsFast:', error);
    return [];
  }
}

/** Ultra-fast product loading - only essential fields */
export async function loadProductFast(id: number): Promise<Product | null> {
  if (!Number.isFinite(id)) return null;

  try {
    console.log(`⚡ Loading product FAST for ID: ${id}`);
    
    // Only load essential fields for speed
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, category, images, description, in_stock, is_custom')
      .eq('id', id)
      .maybeSingle();

    console.log('⚡ Fast product result:', { data: !!data, error });

    if (error) {
      console.error('❌ Error in fast product load:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('💥 Error in loadProductFast:', error);
    return null;
  }
}

/** Ultra-fast card loading - only essential fields */
export async function loadCardFast(id: number): Promise<any | null> {
  if (!Number.isFinite(id)) return null;

  try {
    const { data, error } = await supabase
      .from('cards')
      .select('id, name, price, category, images, description, in_stock, is_custom')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error in fast card load:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in loadCardFast:', error);
    return null;
  }
}

/** Optimize image URL with Supabase transformations */
export function optimizeImageUrl(url: string, width: number, quality: number = 80): string {
  if (!url || !url.startsWith('http')) return url;
  
  // Add Supabase transformation parameters
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}&quality=${quality}&format=webp`;
}

/** Fetch product with reviews in single query (optimized) */
export async function loadProductWithReviews(id: number): Promise<ProductWithReviews | null> {
  if (!Number.isFinite(id)) return null;

  try {
    console.log(`🔍 Loading product with reviews for ID: ${id}`);
    
    // First, just load the product (simpler query)
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    console.log('📊 Product query result:', { product, productError });

    if (productError) {
      console.error('❌ Error loading product:', productError);
      return null;
    }

    if (!product) {
      console.log(`❌ No product found with ID: ${id}`);
      return null;
    }

    // Load reviews separately if needed
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', id)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    console.log('📊 Reviews query result:', { reviews, reviewsError });

    if (reviewsError) {
      console.error('⚠️ Error loading reviews:', reviewsError);
      // Still return product even if reviews fail
    }

    const productWithReviews = {
      ...product,
      reviews: reviews || []
    };

    console.log(`✅ Found product "${product.name}" with ${productWithReviews.reviews.length} reviews`);
    return productWithReviews;
    
  } catch (error) {
    console.error('💥 Error in loadProductWithReviews:', error);
    return null;
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

  // Only try the products table
  const table = 'products';
  const res = await trySelectProductByIdFrom(table, id);
  const data = res.data;
  const error = res.error;

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
  const table = 'products'; // Only use products table
  const res = await tryInsertProductInto(table, product);
  const data = res.data;
  const error = res.error;

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
  const table = 'products'; // Only use products table
  const res = await tryUpdateProductIn(table, id, updates);
  const data = res.data;
  const error = res.error;

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
  const table = 'products'; // Only use products table
  const res = await tryDeleteProductFrom(table, id);
  const error = res.error;
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
