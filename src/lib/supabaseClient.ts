import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 DEBUG - Supabase URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('🔍 DEBUG - Supabase Anon Key:', supabaseAnonKey ? 'SET' : 'MISSING');
console.log('🔍 DEBUG - Supabase Publishable Key:', supabasePublishableKey ? 'SET' : 'MISSING');
console.log('🔍 DEBUG - URL contains localhost:', supabaseUrl?.includes('localhost') || false);
console.log('🔍 DEBUG - Anon key starts with eyJ:', supabaseAnonKey?.startsWith('eyJ') || false);
console.log('🔍 DEBUG - Publishable key starts with sb:', supabasePublishableKey?.startsWith('sb') || false);

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
});

// Test the connection
if (supabaseUrl && supabaseAnonKey) {
  console.log('🧪 TESTING - Supabase client initialized');
  
  // Test a simple query
  supabase.from('products').select('count').then(result => {
    if (result.error) {
      console.error('❌ TEST FAILED - Supabase connection error:', result.error);
      console.error('🔍 ERROR DETAILS:', {
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        code: result.error.code
      });
    } else {
      console.log('✅ TEST PASSED - Supabase connection working!');
    }
  });
}
