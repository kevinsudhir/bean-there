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
          // Detect and complete the sign-in when the user lands back here from
          // the magic-link email (handles both the ?code= and #token styles).
          detectSessionInUrl: true,
          flowType: "pkce",
        },
        global: {
          // Next.js patches fetch to cache GET requests. That was causing the
          // server to replay a stale café list. Force every Supabase request
          // to skip the cache so reads are always fresh.
          fetch: (input, init) =>
            fetch(input, { ...init, cache: "no-store" }),
        },
      })
    : null;

export const isSupabaseConfigured = Boolean(supabase);
