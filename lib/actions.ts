"use server";

import { revalidatePath } from "next/cache";

/**
 * Server action to clear Next.js's cached render of the pages that show café
 * data, so an add/edit/delete is reflected immediately. Called from the form
 * after a successful save.
 */
export async function revalidateCafes(slug?: string) {
  revalidatePath("/"); // the wall
  if (slug) revalidatePath(`/cafe/${slug}`); // that café's detail page
}
