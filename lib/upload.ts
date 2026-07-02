import { supabase } from "./supabase";

/** Storage bucket name for cafe photos (create this in Supabase). */
export const PHOTO_BUCKET = "cafe-photos";

/**
 * Upload one image file to Supabase storage and return its public URL.
 * Throws if Supabase isn't configured or the upload fails.
 */
export async function uploadPhoto(file: File): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase isn't configured — can't upload photos.");
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
