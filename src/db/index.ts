import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xfcbfyjvpbrtnmplornu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; 

// The New Web-Ready Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey || '');

// DUMMY DB: This prevents other files from crashing while we migrate
export const db = null as any;