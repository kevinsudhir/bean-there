import type { Cafe } from "./types";
import { supabase } from "./supabase";
import { SAMPLE_CAFES } from "./sample-data";
import { toSlug } from "./config";

/**
 * Data-access layer. The rest of the app calls these functions and doesn't care
 * whether the data comes from Supabase or the sample fallback. This separation
 * means we could swap the backend later by only touching this file.
 *
 * Database shape (table "cafes"): the columns map 1:1 to the Cafe type, with
 * `scores`, `items`, and `photos` stored as JSON columns. See supabase/schema.sql.
 */

/** Fetch all cafes, newest visit first. */
export async function getCafes(): Promise<Cafe[]> {
  // No Supabase configured → local/demo mode, use bundled samples.
  if (!supabase) return SAMPLE_CAFES;

  const { data, error } = await supabase
    .from("cafes")
    .select("*")
    .order("date", { ascending: false });

  // A real database error is different from "no cafés yet". We throw so the
  // page can show an honest error state instead of silently faking data.
  if (error) {
    console.error("Failed to load cafes:", error.message);
    throw new Error("Could not load cafés from the database.");
  }
  return (data ?? []) as Cafe[];
}

/** Fetch a single cafe by its slug, or null if not found. */
export async function getCafeBySlug(slug: string): Promise<Cafe | null> {
  if (!supabase) {
    return SAMPLE_CAFES.find((c) => c.slug === slug) ?? null;
  }

  // limit(1) + maybeSingle: unlike .single(), this doesn't error out (and 404
  // the page) if duplicate slugs ever sneak into the table.
  const { data, error } = await supabase
    .from("cafes")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load cafe by slug:", error.message);
    return null;
  }
  return (data as Cafe) ?? null;
}

/** Payload for creating a cafe (id/slug are derived server-side). */
export type NewCafe = Omit<Cafe, "id" | "slug"> & { slug?: string };

/**
 * Derive a cafe's slug. A name with no ASCII letters/numbers (e.g. all emoji
 * or accented script) would slugify to "", which breaks the /cafe/[slug] URL —
 * fall back to a short random handle instead.
 */
function deriveSlug(input: NewCafe): string {
  return (
    input.slug ?? (toSlug(input.name) || `cafe-${crypto.randomUUID().slice(0, 8)}`)
  );
}

/** Insert a new cafe. Requires Supabase to be configured. */
export async function createCafe(input: NewCafe): Promise<Cafe> {
  if (!supabase) {
    throw new Error(
      "Supabase isn't configured. Add your credentials to .env.local to save cafes.",
    );
  }

  const slug = deriveSlug(input);
  const { data, error } = await supabase
    .from("cafes")
    .insert({ ...input, slug })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Cafe;
}

/** Fetch a single cafe by its id, or null if not found. */
export async function getCafeById(id: string): Promise<Cafe | null> {
  if (!supabase) {
    return SAMPLE_CAFES.find((c) => c.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("cafes")
    .select("*")
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load cafe by id:", error.message);
    return null;
  }
  return (data as Cafe) ?? null;
}

/** Update an existing cafe. Slug is re-derived from the (possibly new) name. */
export async function updateCafe(
  id: string,
  input: NewCafe,
): Promise<Cafe> {
  if (!supabase) {
    throw new Error("Supabase isn't configured.");
  }

  const slug = deriveSlug(input);
  const { data, error } = await supabase
    .from("cafes")
    .update({ ...input, slug })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Cafe;
}

/** Delete a cafe by id. */
export async function deleteCafe(id: string): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase isn't configured.");
  }

  const { error } = await supabase.from("cafes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
