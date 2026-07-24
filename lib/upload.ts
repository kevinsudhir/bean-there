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

/**
 * Shrink a picked image to a share-friendly size and re-encode as JPEG, so
 * huge phone photos don't bloat the page or make the share-card renderer
 * choke. Falls back to the original file if the browser can't decode it
 * (e.g. HEIC). Browser-only (uses canvas).
 */
export async function downscaleImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1600;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", 0.85),
    );
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
      type: "image/jpeg",
    });
  } catch {
    return file;
  }
}
