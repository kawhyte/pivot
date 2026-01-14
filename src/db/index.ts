import { createClient } from '@supabase/supabase-js';

// These use the VITE_ prefix for security and visibility
const supabaseUrl = 'https://xfcbfyjvpbrtnmplornu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; 

if (!supabaseAnonKey) {
  console.error("CRITICAL: VITE_SUPABASE_ANON_KEY is missing!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || '');