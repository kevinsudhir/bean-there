import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client. Reads credentials from environment variables
 * (see .env.local.example). We keep the client creation in one module so the
 * rest of the app imports a single, configured instance.
 *
 * If env vars are missing, `supabase` is null and the data layer falls back to
 * bundled sample data, so the app still runs for local development/demo.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      })
    : null;

export const isSupabaseConfigured = Boolean(supabase);
