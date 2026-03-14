import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_556UgFYK4KS95tgTe7wQrg_bHA6pk51';

// Log initialization state
console.log('🌐 Supabase URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('🔑 Supabase Publishable Key:', supabasePublishableKey ? 'SET' : 'MISSING');

const clientConfig: any = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
};

export const supabase = createClient(supabaseUrl || '', supabasePublishableKey || supabaseAnonKey || '', clientConfig);

// Add cache-busting helper
export const fetchFreshProducts = () => {
  const timestamp = Date.now();
  return supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .eq('cache_bust', timestamp); // This forces a fresh query
};

// Immediate test connection
if (supabaseUrl && supabaseAnonKey) {
  supabase.from('products').select('id').limit(1).then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase Test Connection Failed:', error.message);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
      console.error('Code:', error.code);
    } else {
      console.log('✅ Supabase Test Connection Successful! Found', data?.length, 'products');
    }
  });
}

