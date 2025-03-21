import { createClient } from '@supabase/supabase-js';

// Tyto hodnoty budou později v prostředí Vercel nahrazeny skutečnými hodnotami
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 