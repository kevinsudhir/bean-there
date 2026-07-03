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
  if (!supabase) return SAMPLE_CAFES;

  const { data, error } = await supabase
    .from("cafes")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Failed to load cafes:", error.message);
    return SAMPLE_CAFES;
  }
  return (data ?? []) as Cafe[];
}

/** Fetch a single cafe by its slug, or null if not found. */
export async function getCafeBySlug(slug: string): Promise<Cafe | null> {
  if (!supabase) {
    return SAMPLE_CAFES.find((c) => c.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("cafes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Cafe;
}

/** Payload for creating a cafe (id/slug are derived server-side). */
export type NewCafe = Omit<Cafe, "id" | "slug"> & { slug?: string };

/** Insert a new cafe. Requires Supabase to be configured. */
export async function createCafe(input: NewCafe): Promise<Cafe> {
  if (!supabase) {
    throw new Error(
      "Supabase isn't configured. Add your credentials to .env.local to save cafes.",
    );
  }

  const slug = input.slug ?? toSlug(input.name);
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
    .single();

  if (error) return null;
  return data as Cafe;
}

/** Update an existing cafe. Slug is re-derived from the (possibly new) name. */
export async function updateCafe(
  id: string,
  input: NewCafe,
): Promise<Cafe> {
  if (!supabase) {
    throw new Error("Supabase isn't configured.");
  }

  const slug = input.slug ?? toSlug(input.name);
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
