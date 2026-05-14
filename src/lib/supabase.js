import { createClient } from '@supabase/supabase-js'

// Mengambil URL dan Key dengan fallback string kosong untuk mencegah error crash saat inisialisasi
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

// Validasi manual sebelum memanggil createClient
if (!supabaseUrl || !supabaseUrl.startsWith('https')) {
  console.error("CRITICAL ERROR: VITE_SUPABASE_URL is not defined or invalid in environment variables.");
}

// Inisialisasi client hanya jika URL valid, jika tidak gunakan dummy agar tidak crash saat build
export const supabase = (supabaseUrl && supabaseUrl.startsWith('https'))
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'bintangai-supabase-token'
      }
    })
  : null;

if (!supabase) {
  console.warn("Supabase client failed to initialize. Check your Vercel Environment Variables.");
}
