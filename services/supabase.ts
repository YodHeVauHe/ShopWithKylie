
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  // Alert the user so they know why the app might not work
  if (typeof window !== 'undefined') {
    alert('Missing Supabase environment variables! Check console for details.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
