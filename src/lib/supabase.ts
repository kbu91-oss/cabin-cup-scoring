// Supabase client + cross-device sync wiring.
// If env vars aren't set (e.g. local dev without Supabase), this stays null
// and the app falls back to pure localStorage.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        realtime: { params: { eventsPerSecond: 10 } },
        auth: { persistSession: false },
      })
    : null;

export const SUPABASE_ENABLED = !!supabase;

// We key everything by the cup year so multiple years can share the same project.
export const CUP_YEAR = 2026;
