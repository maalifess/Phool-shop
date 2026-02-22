import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 DEBUG - Supabase URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('🔍 DEBUG - Supabase Key:', supabaseAnonKey ? 'SET' : 'MISSING');
console.log('🔍 DEBUG - URL contains localhost:', supabaseUrl?.includes('localhost') || false);
console.log('🔍 DEBUG - Key contains placeholder:', supabaseAnonKey?.includes('your_anon_key') || false);
try {
  const host = supabaseUrl ? new URL(supabaseUrl).host : null;
  console.log('🔍 DEBUG - Supabase host:', host || 'MISSING');
} catch {
  console.log('🔍 DEBUG - Supabase host: INVALID_URL');
}
console.log('🔍 DEBUG - Supabase anon key length:', supabaseAnonKey ? String(supabaseAnonKey).length : 0);

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('localhost') || supabaseAnonKey.includes('your_anon_key')) {
  console.error('❌ SUPABASE NOT CONFIGURED: Missing or invalid VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  console.error('🗄️ Database features disabled. To fix: set Supabase env vars in Vercel dashboard and redeploy');
  // Create a mock client that won't crash the app with proper method chaining
  const mockQuery = {
    data: [],
    error: null,
    select: () => mockQuery,
    order: () => mockQuery,
    eq: () => mockQuery,
    limit: () => mockQuery,
    single: () => ({ data: null, error: new Error('Supabase not configured') }),
    then: (resolve: any) => resolve({ data: [], error: null }),
    catch: () => mockQuery
  };

  supabase = {
    from: () => mockQuery,
    insert: () => ({ data: null, error: new Error('Supabase not configured') }),
    update: () => ({ data: null, error: new Error('Supabase not configured') }),
    delete: () => ({ data: null, error: new Error('Supabase not configured') })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
