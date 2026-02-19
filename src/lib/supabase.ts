import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nafwdpmmbphogdctsktq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZndkcG1tYnBob2dkY3Rza3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Mjg4MDksImV4cCI6MjA4NzAwNDgwOX0.rnmsiP9mrzzmMasYQppUOSnpCZiTKnyT0oHOeUdGOeA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
