import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  name: string;
  full_name: string;
  role: 'admin' | 'user';
  user_type?: string | null; // GoHighLevel user ID (same as ghl_user_id)
  ghl_user_id?: string | null; // GoHighLevel user ID
  profile_photo?: string | null;
  created_at: string;
  last_login?: string | null;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  query: string;
  response: string;
  query_type: string;
  created_at: string;
}

export interface ChatHistory {
  id: string;
  user_id: string;
  query: string;
  response: string;
  query_type: string;
  created_at: string;
}
