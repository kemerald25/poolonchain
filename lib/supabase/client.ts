import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { env } from '../env';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
