// =============================================================================
// KICK 3 — Supabase client
// =============================================================================
// Initialises the Supabase client used by the optional sign-in feature.
//
// The publishable key below is INTENTIONALLY public — it ships in the front-end
// bundle to all visitors. Security is enforced via Row-Level Security policies
// on the Supabase database, not by hiding this key. The matching secret key
// must NEVER appear in front-end code or git history.
//
// Phase 2, Deploy 5 / Stage 17 — sign-in foundation, optional throughout.
// =============================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pfaclcpnoxcfckdvalsw.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_JTD1kKkiTeoDzCvSScxBoQ_JRH4MTR3';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // Persist the session in localStorage so the user stays signed in across visits.
    persistSession: true,
    // Auto-refresh the access token before it expires.
    autoRefreshToken: true,
    // Detect session via the URL hash (used by some auth flows — harmless here).
    detectSessionInUrl: false,
  },
});

// Small helper used elsewhere — returns the current user (or null if signed out).
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data?.user || null;
  } catch {
    return null;
  }
}

// Small helper — returns the profile row (handle, created_at, etc.) for the
// current user, or null. Safe to call when signed out — returns null.
export async function getCurrentProfile() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, handle, created_at')
      .eq('id', user.id)
      .single();
    if (error) return null;
    return data || null;
  } catch {
    return null;
  }
}
