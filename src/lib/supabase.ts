import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(url?: string, anonKey?: string): SupabaseClient | null {
  const finalUrl = url || import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('tiktok_monitor_supabase_url');
  const finalKey = anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('tiktok_monitor_supabase_anon_key');

  if (!finalUrl || !finalKey) {
    return null;
  }

  if (!supabaseInstance || supabaseInstance['supabaseUrl'] !== finalUrl) {
    supabaseInstance = createClient(finalUrl, finalKey);
  }

  return supabaseInstance;
}
