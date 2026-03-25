import { supabase } from './supabase';
import type { Card } from './supabaseTypes';

// Cards CRUD operations

type CacheEntry<T> = {
  ts: number;
  data: T;
};

type CardCatalog = {
  id: number;
  name: string;
  price: number;
  category: string;
  images: string[];
  in_stock: boolean;
  is_custom?: boolean;
};

const CARDS_TTL_MS = 0; // Disable cache completely
let cardsCache: CacheEntry<Card[]> | null = null;
let cardsInFlight: Promise<Card[]> | null = null;

let cachedFastCards: CacheEntry<CardCatalog[]> | null = null;
let fastCardsInFlight: Promise<CardCatalog[]> | null = null;

export async function loadCards(): Promise<Card[]> {
  // Clear all caches immediately
  cardsCache = null;
  cardsInFlight = null;

  console.log('📦 Loading cards from Supabase (cache cleared)...');

  cardsInFlight = (async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading cards:', error);
      return [];
    }

    const next = (data || []) as Card[];
    console.log(`✨ Total cards loaded: ${next.length}`);
    cardsCache = { ts: Date.now(), data: next };
    return next;
  })();

  try {
    return await cardsInFlight;
  } finally {
    cardsInFlight = null;
  }
}

export async function loadCardById(id: number): Promise<Card | null> {
  if (!Number.isFinite(id)) return null;

  if (cardsCache) {
    const cached = cardsCache.data.find((c) => c.id === id);
    if (cached) return cached;
  }

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error loading card:', error);
    return null;
  }

  if (!data) return null;

  const normalized = data as Card;

  if (cardsCache) {
    const idx = cardsCache.data.findIndex((c) => c.id === id);
    if (idx >= 0) {
      const next = [...cardsCache.data];
      next[idx] = normalized;
      cardsCache = { ts: cardsCache.ts, data: next };
    }
  }

  return normalized;
}

export async function createCard(card: Omit<Card, 'id' | 'created_at'>): Promise<Card | null> {
  const { data, error } = await supabase
    .from('cards')
    .insert(card)
    .select()
    .single();

  if (error) {
    console.error('Error creating card:', error);
    return null;
  }

  return data;
}

export async function updateCard(id: number, updates: Partial<Card>): Promise<Card | null> {
  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating card:', error);
    return null;
  }

  return data;
}

export async function deleteCard(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting card:', error);
    return false;
  }

  return true;
}

/** Ultra-fast cards loading for catalog - only essential fields */
export async function loadCardsFast(): Promise<CardCatalog[]> {
  if (cachedFastCards) {
    return cachedFastCards.data;
  }

  if (fastCardsInFlight) {
    return await fastCardsInFlight;
  }

  fastCardsInFlight = (async () => {
    try {
      console.log('⚡ Loading ALL cards FAST (catalog mode)...');

      const { data, error } = await supabase
        .from('cards')
        .select('id, name, price, category, images, in_stock')
        .order('created_at', { ascending: false });

      console.log(`⚡ Loaded ${data?.length || 0} cards FAST`);

      if (error) {
        console.error('❌ Error in fast cards load:', error);
        return [];
      }

      const next = data || [];
      cachedFastCards = { ts: Date.now(), data: next };
      return next;
    } catch (error) {
      console.error('💥 Error in loadCardsFast:', error);
      return [];
    }
  })();

  try {
    return await fastCardsInFlight;
  } finally {
    fastCardsInFlight = null;
  }
}

/** Paginated cards loading */
export async function loadCardsPaginated(limit: number = 20, offset: number = 0): Promise<CardCatalog[]> {
  try {
    console.log(`⚡ Loading paginated cards FAST (limit: ${limit}, offset: ${offset})...`);

    const { data, error } = await supabase
      .from('cards')
      .select('id, name, price, category, images, in_stock')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    console.log(`⚡ Loaded ${data?.length || 0} cards FAST (paginated)`);

    if (error) {
      console.error('❌ Error in paginated cards load:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('💥 Error in loadCardsPaginated:', error);
    return [];
  }
}
