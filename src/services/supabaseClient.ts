import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://fepwudkpdouqrqagvzwo.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcHd1ZGtwZG91cXJxYWd2endvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NDMzODAsImV4cCI6MjEwOTIxOTM4MH0.sPl-GXPvhYiMV-qcscAhPBYme9tEb3kAU2S_IWcVT0Y';

// Default to env variables if available, otherwise fallback to project credentials
const ENV_SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
const ENV_SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_ANON_KEY;

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

export const getSupabaseClient = (): SupabaseClient => {
  const config = getSupabaseConfig();
  if (!supabaseInstance) {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: typeof window !== 'undefined'
      }
    });
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
