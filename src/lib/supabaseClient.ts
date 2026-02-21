import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('localhost') || supabaseAnonKey.includes('your_anon_key')) {
  console.error('❌ SUPABASE NOT CONFIGURED: Missing or invalid VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  console.error('🗄️ Database features disabled. To fix: set Supabase env vars in Vercel dashboard and redeploy');
  // Create a mock client that won't crash the app
  supabase = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: () => ({ data: null, error: new Error('Supabase not configured') }),
      eq: () => ({ data: [], error: null }),
      order: () => ({ data: [], error: null }),
      limit: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: new Error('Supabase not configured') }),
      then: (resolve: any) => resolve({ data: [], error: null })
    })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
