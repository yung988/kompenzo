import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Definuji výchozí hodnoty pro development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Vytvoření klienta pouze pokud jsou k dispozici potřebné údaje
// případně vytvořím mock klienta pro statické generování stránek
let supabase: SupabaseClient;

// Konfigurace pro Supabase klienta
const supabaseOptions = {
  auth: {
    debug: true, // Zapnutí logování pro auth
    persistSession: true, 
    autoRefreshToken: true,
    storageKey: 'kompenzo-auth',
  }
};

// Vytvoříme klienta pouze v prohlížeči nebo na straně serveru, ne při statickém generování
if (typeof window !== 'undefined') {
  // V prohlížeči
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL nebo Anon klíč chybí. Zkontrolujte .env.local soubor.');
  }
  
  // Logujeme hodnoty pro debugging (jen pro vývoj, ne pro produkci!)
  console.log('Supabase URL:', supabaseUrl ? 'Nastaven' : 'Chybí');
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Nastaven' : 'Chybí');
  
  supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);
} else {
  // Na straně serveru nebo při statickém generování
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);
  } else {
    // Mock klient pro statické generování
    console.warn('Supabase credentials not available. Using mock client.');
    supabase = createClient('https://example.com', 'mock-key', supabaseOptions) as SupabaseClient;
  }
}

export { supabase }; 