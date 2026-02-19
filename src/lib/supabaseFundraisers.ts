import { supabase } from './supabase';
import type { Fundraiser } from './supabaseTypes';

// Fundraisers CRUD operations

type CacheEntry<T> = {
  ts: number;
  data: T;
};

const FUNDRAISERS_TTL_MS = 60_000;
let fundraisersCache: CacheEntry<Fundraiser[]> | null = null;
let fundraisersInFlight: Promise<Fundraiser[]> | null = null;

export async function loadFundraisers(): Promise<Fundraiser[]> {
  const now = Date.now();
  if (fundraisersCache && now - fundraisersCache.ts < FUNDRAISERS_TTL_MS) return fundraisersCache.data;
  if (fundraisersInFlight) return fundraisersInFlight;

  fundraisersInFlight = (async () => {
    const { data, error } = await supabase
      .from('fundraisers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading fundraisers:', error);
      return fundraisersCache?.data ?? [];
    }
    
    const next = (data || []) as Fundraiser[];
    fundraisersCache = { ts: Date.now(), data: next };
    return next;
  })();

  try {
    return await fundraisersInFlight;
  } finally {
    fundraisersInFlight = null;
  }
}

export async function loadFundraiserById(id: number): Promise<Fundraiser | null> {
  if (!Number.isFinite(id)) return null;

  if (fundraisersCache) {
    const cached = fundraisersCache.data.find((f) => f.id === id);
    if (cached) return cached;
  }

  const { data, error } = await supabase
    .from('fundraisers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error loading fundraiser:', error);
    return null;
  }

  const normalized = (data ?? null) as Fundraiser | null;
  if (!normalized) return null;

  if (fundraisersCache) {
    const idx = fundraisersCache.data.findIndex((f) => f.id === id);
    if (idx >= 0) {
      const next = [...fundraisersCache.data];
      next[idx] = normalized;
      fundraisersCache = { ts: fundraisersCache.ts, data: next };
    }
  }

  return normalized;
}

export async function createFundraiser(fundraiser: Omit<Fundraiser, 'id' | 'created_at'>): Promise<Fundraiser | null> {
  const { data, error } = await supabase
    .from('fundraisers')
    .insert(fundraiser)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating fundraiser:', error);
    return null;
  }

  // Best-effort cache update
  if (data && fundraisersCache) {
    fundraisersCache = { ts: fundraisersCache.ts, data: [data as Fundraiser, ...fundraisersCache.data] };
  }

  return data;
}

export async function updateFundraiser(id: number, updates: Partial<Fundraiser>): Promise<Fundraiser | null> {
  const { data, error } = await supabase
    .from('fundraisers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating fundraiser:', error);
    return null;
  }

  // Best-effort cache update
  if (data && fundraisersCache) {
    fundraisersCache = {
      ts: fundraisersCache.ts,
      data: fundraisersCache.data.map((f) => (f.id === id ? (data as Fundraiser) : f)),
    };
  }

  return data;
}

export async function deleteFundraiser(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('fundraisers')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting fundraiser:', error);
    return false;
  }

  if (fundraisersCache) {
    fundraisersCache = { ts: fundraisersCache.ts, data: fundraisersCache.data.filter((f) => f.id !== id) };
  }
  
  return true;
}
