import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default to env variables if available, otherwise check localStorage for user-provided credentials
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const getSupabaseConfig = () => {
  const customUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('fde_supabase_url') : null;
  const customKey = typeof localStorage !== 'undefined' ? localStorage.getItem('fde_supabase_anon_key') : null;
  return {
    url: customUrl || ENV_SUPABASE_URL,
    anonKey: customKey || ENV_SUPABASE_ANON_KEY,
    isConfigured: Boolean((customUrl || ENV_SUPABASE_URL) && (customKey || ENV_SUPABASE_ANON_KEY))
  };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: typeof window !== 'undefined'
        }
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
};

export const setCustomSupabaseCredentials = (url: string, key: string) => {
  if (typeof localStorage !== 'undefined') {
    if (url && key) {
      localStorage.setItem('fde_supabase_url', url.trim());
      localStorage.setItem('fde_supabase_anon_key', key.trim());
    } else {
      localStorage.removeItem('fde_supabase_url');
      localStorage.removeItem('fde_supabase_anon_key');
    }
  }
  supabaseInstance = null; // force re-initialization
};
