import { supabase } from './supabase';
import type { Review } from './supabaseTypes';

// Reviews CRUD operations
export async function loadReviews(productId?: number): Promise<Review[]> {
  let query = supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (productId) {
    query = query.eq('product_id', productId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error loading reviews:', error);
    return [];
  }
  
  return data || [];
}

export async function loadApprovedReviews(productId?: number): Promise<Review[]> {
  let query = supabase
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });
  
  if (productId) {
    query = query.eq('product_id', productId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error loading approved reviews:', error);
    return [];
  }
  
  return data || [];
}

export async function createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating review:', error);
    return null;
  }
  
  return data;
}

export async function updateReview(id: number, updates: Partial<Review>): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating review:', error);
    return null;
  }
  
  return data;
}

export async function deleteReview(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting review:', error);
    return false;
  }
  
  return true;
}
