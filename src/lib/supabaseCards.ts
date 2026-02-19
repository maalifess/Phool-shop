import { supabase } from './supabase';
import type { Card } from './supabaseTypes';

// Cards CRUD operations

type CacheEntry<T> = {
  ts: number;
  data: T;
};

const CARDS_TTL_MS = 60_000;
let cardsCache: CacheEntry<Card[]> | null = null;
let cardsInFlight: Promise<Card[]> | null = null;

export async function loadCards(): Promise<Card[]> {
  const now = Date.now();
  if (cardsCache && now - cardsCache.ts < CARDS_TTL_MS) return cardsCache.data;
  if (cardsInFlight) return cardsInFlight;

  cardsInFlight = (async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading cards:', error);
      return cardsCache?.data ?? [];
    }

    const next = (data || []) as Card[];
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
