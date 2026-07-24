"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Cafe, CafeItem, ItemType, Scores, Who } from "@/lib/types";
import { SCORE_CATEGORIES } from "@/lib/types";
import { overallScore, SITE, SUGGESTED_TAGS } from "@/lib/config";
import { createCafe, updateCafe, deleteCafe, getCafeBySlug } from "@/lib/cafes";
import { revalidateCafes } from "@/lib/actions";
import { toSlug } from "@/lib/config";
import { uploadPhoto } from "@/lib/upload";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const ITEM_TYPES: ItemType[] = [
  "mocha",
  "latte",
  "cappuccino",
  "filter",
  "cold",
  "bake",
  "dessert",
  "food",
];

// How each item type is shown in the dropdown. Only differs from the raw value
// where a friendlier word reads better (e.g. the "food" type shows as "bites").
const TYPE_LABEL: Partial<Record<ItemType, string>> = {
  food: "bites",
};
const WHO: Who[] = ["him", "her", "shared"];

const emptyItem = (): CafeItem => ({
  type: "latte",
  name: "",
  who: "shared",
  rating: 4,
  star: false,
});

// min/max on a number input only constrain the spinner, not typed values, so
// every score/rating is clamped to 0–5 (and NaN from a cleared field becomes 0).
const clampScore = (n: number): number =>
  Number.isFinite(n) ? Math.min(5, Math.max(0, Math.round(n * 10) / 10)) : 0;

// Shrink a picked image to a share-friendly size and re-encode as JPEG, so huge
// phone photos don't bloat the page or make the share-card renderer choke/500.
// Falls back to the original file if the browser can't decode it (e.g. HEIC).
async function downscaleImage(file: File): Promise<File> {
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

// A photo in the form: either one already saved (URL) or a newly picked file.
// `url` is the src to preview (public URL, or an object URL for new files).
type PhotoEntry =
  | { kind: "existing"; url: string; tag: string | null }
  | { kind: "new"; file: File; url: string; tag: string | null };

const label = "mb-1.5 block font-mono text-xs uppercase tracking-wide text-dim";
const field =
  "w-full min-w-0 max-w-full rounded-lg border-[1.5px] border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus:border-ink";

/**
 * The café form, used for BOTH adding and editing. Pass `existing` to edit a
 * café (fields pre-fill, a Delete button appears, and saving updates instead
 * of inserting). With no `existing`, it's a blank "add" form.
 *
 * Fills in name/area/date, the five scores (overall + badge calculated live),
 * any number of items with a star for the standout, photo uploads, and the
 * verdict — then saves to Supabase.
 */
export default function AddCafeForm({ existing }: { existing?: Cafe }) {
  const router = useRouter();
  const isEdit = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? "");
  const [area, setArea] = useState(existing?.area ?? "");
  const [date, setDate] = useState(
    existing?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [scores, setScores] = useState<Scores>(
    existing?.scores ?? {
      coffee: 4,
      food: 4,
      vibe: 4,
      service: 4,
      value: 4,
    },
  );
  const [items, setItems] = useState<CafeItem[]>(
    existing?.items?.length ? existing.items : [emptyItem()],
  );
  const [verdict, setVerdict] = useState(existing?.verdict ?? "");
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [customTag, setCustomTag] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  // All photos as one ordered list (saved URLs + newly picked files), each with
  // its item tag. The first entry is the cover; the order is chosen in the UI.
  const [photos, setPhotos] = useState<PhotoEntry[]>(
    (existing?.photos ?? []).map((url, i) => ({
      kind: "existing" as const,
      url,
      tag: existing?.photoTags?.[i] ?? null,
    })),
  );
  const objectUrls = useRef<string[]>([]);
  // Optional map pin. Found via the geocoder button or typed in manually.
  const [lat, setLat] = useState<number | null>(existing?.lat ?? null);
  const [lng, setLng] = useState<number | null>(existing?.lng ?? null);
  const [locating, setLocating] = useState(false);
  const [locMessage, setLocMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overall = useMemo(() => overallScore(scores), [scores]);
  const loved = overall >= SITE.badgeThreshold;

  // Item names that a photo can be tagged with (drives the tag dropdowns).
  const itemNames = items.map((it) => it.name.trim()).filter(Boolean);

  const hasTag = (label: string) =>
    tags.some((t) => t.toLowerCase() === label.toLowerCase());
  const toggleTag = (label: string) =>
    setTags((cur) =>
      hasTag(label)
        ? cur.filter((t) => t.toLowerCase() !== label.toLowerCase())
        : [...cur, label],
    );
  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !hasTag(t)) setTags((cur) => [...cur, t]);
    setCustomTag("");
  };
  // Custom tags = selected tags that aren't in the suggested set.
  const customTags = tags.filter(
    (t) => !SUGGESTED_TAGS.some((s) => s.label.toLowerCase() === t.toLowerCase()),
  );

  // Revoke any object URLs created for new-file previews when we unmount.
  useEffect(() => () => objectUrls.current.forEach(URL.revokeObjectURL), []);

  const addFiles = (list: File[]) =>
    setPhotos((p) => [
      ...p,
      ...list.map((file) => {
        const url = URL.createObjectURL(file);
        objectUrls.current.push(url);
        return { kind: "new" as const, file, url, tag: null };
      }),
    ]);
  const removePhoto = (i: number) =>
    setPhotos((p) => p.filter((_, j) => j !== i));
  const makeCover = (i: number) =>
    setPhotos((p) => {
      const next = [...p];
      const [chosen] = next.splice(i, 1);
      next.unshift(chosen);
      return next;
    });
  const setPhotoTag = (i: number, tag: string | null) =>
    setPhotos((p) => p.map((e, j) => (j === i ? { ...e, tag } : e)));

  // A small "tag this photo with an item" dropdown, shared by both photo lists.
  const tagSelect = (value: string | null, onChange: (v: string | null) => void) => (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      aria-label="Tag photo with an item"
      className="mt-1 w-[76px] rounded border-[1.5px] border-line bg-card px-1 py-1 font-mono text-[9px] text-ink outline-none"
    >
      <option value="">— tag —</option>
      {itemNames.map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );

  const setScore = (cat: keyof Scores, value: number) =>
    setScores((s) => ({ ...s, [cat]: clampScore(value) }));
  const setItem = (i: number, patch: Partial<CafeItem>) => {
    // Renaming an item drags its photo tags along, so a photo tagged "Mocha"
    // still labels the right slide after the item becomes "Iced Mocha".
    if (patch.name !== undefined) {
      const oldName = items[i]?.name.trim();
      const newName = patch.name.trim();
      if (oldName && oldName !== newName) {
        setPhotos((ps) =>
          ps.map((p) => (p.tag === oldName ? { ...p, tag: newName || null } : p)),
        );
      }
    }
    setItems((list) => list.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  };
  const addItem = () => setItems((list) => [...list, emptyItem()]);

  // Quick-pick presets: one tap adds a pre-filled item (type, name, who) with a
  // default 4.0 rating you then adjust. Speeds up the common orders.
  const QUICK_PICKS: {
    label: string;
    type: ItemType;
    name: string;
    who: Who;
  }[] = [
    { label: "Mocha", type: "mocha", name: "Mocha", who: "him" },
    { label: "Latte", type: "latte", name: "Latte", who: "him" },
    { label: "Cappuccino", type: "cappuccino", name: "Cappuccino", who: "her" },
    { label: "Flat white", type: "latte", name: "Flat White", who: "him" },
    { label: "Bake", type: "bake", name: "", who: "shared" },
    { label: "Bites", type: "food", name: "", who: "shared" },
  ];

  const addQuickItem = (p: (typeof QUICK_PICKS)[number]) =>
    setItems((list) => {
      const next: CafeItem = {
        type: p.type,
        name: p.name,
        who: p.who,
        rating: 4,
        star: false,
      };
      // If the only row is a blank starter, replace it; otherwise append.
      const onlyBlankStarter =
        list.length === 1 && !list[0].name.trim();
      return onlyBlankStarter ? [next] : [...list, next];
    });
  const removeItem = (i: number) => {
    // Clear photo tags that pointed at the removed item.
    const gone = items[i]?.name.trim();
    if (gone) {
      setPhotos((ps) =>
        ps.map((p) => (p.tag === gone ? { ...p, tag: null } : p)),
      );
    }
    setItems((list) => list.filter((_, j) => j !== i));
  };

  // Look the café up on OpenStreetMap's free geocoder (Nominatim) by
  // name + area + city. No API key; fine at our do-it-once-per-café volume.
  async function findLocation() {
    setLocMessage(null);
    if (!name.trim()) {
      setLocMessage("Add the café name first.");
      return;
    }
    // Don't silently clobber coordinates that were pasted in by hand — the
    // geocoder's guess is often less accurate than a copied Google Maps spot.
    if (
      (lat !== null || lng !== null) &&
      !window.confirm(
        "Replace the coordinates already entered with a lookup by name?",
      )
    ) {
      return;
    }
    setLocating(true);
    try {
      const q = [name.trim(), area.trim(), SITE.city].filter(Boolean).join(", ");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      );
      if (!res.ok) throw new Error();
      const results: { lat: string; lon: string; display_name: string }[] =
        await res.json();
      if (!results.length) {
        setLocMessage(
          "Couldn't find it — try tweaking the name/area, or paste coordinates below.",
        );
        return;
      }
      setLat(Math.round(Number(results[0].lat) * 1e6) / 1e6);
      setLng(Math.round(Number(results[0].lon) * 1e6) / 1e6);
      setLocMessage(`Pinned: ${results[0].display_name}`);
    } catch {
      setLocMessage("Lookup failed — paste coordinates below instead.");
    } finally {
      setLocating(false);
    }
  }

  async function draftVerdict() {
    setDraftError(null);
    if (!name.trim()) {
      setDraftError("Add the café name first.");
      return;
    }
    setDrafting(true);
    try {
      // The verdict route requires a logged-in user (it spends Gemini quota),
      // so pass the Supabase access token for it to verify.
      const token = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : undefined;
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          area: area.trim(),
          scores,
          items: items
            .filter((it) => it.name.trim())
            .map((it) => ({ ...it, name: it.name.trim() })),
          reviewers: SITE.reviewers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't draft a verdict.");
      setVerdict(data.verdict);
    } catch (e) {
      setDraftError(e instanceof Error ? e.message : "Couldn't draft a verdict.");
    } finally {
      setDrafting(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim() || !area.trim()) {
      setError("Café name and area are required.");
      return;
    }
    // The date input can be cleared, and an empty date would render as "—"
    // on the wall and break date sorting.
    if (!date) {
      setError("Add the date you visited.");
      return;
    }
    if ((lat === null) !== (lng === null)) {
      setError("Location needs both latitude and longitude — or clear both.");
      return;
    }
    setSaving(true);
    try {
      // Adding a café whose slug already exists would hit the DB's unique
      // constraint with a cryptic error (and orphan any uploaded photos), so
      // check up front and point at the edit flow instead.
      if (!isEdit) {
        const slug = toSlug(name.trim());
        const dupe = slug ? await getCafeBySlug(slug) : null;
        if (dupe) {
          setError(
            `You've already reviewed "${dupe.name}" — open it on the wall and use Edit instead.`,
          );
          setSaving(false);
          return;
        }
      }

      const itemsPayload = items
        .filter((it) => it.name.trim())
        .map((it) => ({ ...it, name: it.name.trim() }));
      const validTagNames = new Set(itemsPayload.map((it) => it.name));

      // Walk the ordered photo list: keep existing URLs as-is, upload new
      // files (downscaled), preserving order and item tags throughout. Tags
      // that no longer match a saved item are dropped rather than stored
      // dangling.
      const photoUrls: string[] = [];
      const photoTags: (string | null)[] = [];
      for (const entry of photos) {
        photoUrls.push(
          entry.kind === "existing"
            ? entry.url
            : await uploadPhoto(await downscaleImage(entry.file)),
        );
        const tag = entry.tag?.trim() ?? null;
        photoTags.push(tag && validTagNames.has(tag) ? tag : null);
      }

      const payload = {
        name: name.trim(),
        area: area.trim(),
        date,
        scores,
        items: itemsPayload,
        verdict: verdict.trim(),
        photos: photoUrls,
        // Only send lat/lng and photoTags when they carry something (or the
        // café already had them) — a database that predates these columns
        // would otherwise reject every save.
        ...(lat !== null || existing?.lat != null ? { lat, lng } : {}),
        ...(photoTags.some(Boolean) || existing?.photoTags
          ? { photoTags }
          : {}),
        ...(tags.length || existing?.tags ? { tags } : {}),
      };

      if (isEdit && existing) {
        // Keep the slug stable on edit: links already shared (Instagram, chats)
        // must survive a rename — updateCafe would otherwise re-derive it.
        await updateCafe(existing.id, { ...payload, slug: existing.slug });
      } else {
        await createCafe(payload);
      }

      // Clear the server-side cached render of the wall and this café's page,
      // then refresh + navigate, so the change shows immediately.
      await revalidateCafes(toSlug(payload.name));
      router.refresh();
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    if (
      !window.confirm(
        `Delete "${existing.name}"? This can't be undone.`,
      )
    )
      return;
    setDeleting(true);
    setError(null);
    try {
      await deleteCafe(existing.id);
      await revalidateCafes(existing.slug);
      router.refresh();
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't delete.");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[720px] overflow-x-hidden px-6 pb-28 pt-10">
      <h1 className="mb-1 font-display text-4xl font-extrabold">
        {isEdit ? "Edit café" : "Add a café"}
      </h1>
      <p className="mb-6 font-voice italic text-dim">
        Fill this in after a visit — the overall score and badge are worked out
        for you.
      </p>

      {!isSupabaseConfigured && (
        <div className="mb-6 rounded-lg border-[1.5px] border-amber bg-card p-4 font-mono text-xs leading-relaxed text-ink">
          Supabase isn&apos;t connected yet, so saving is disabled. Add your
          credentials to <code>.env.local</code> (see the README) to enable
          saving and photo uploads.
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Café name</label>
            <input
              className={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pollen"
            />
          </div>
          <div>
            <label className={label}>Area</label>
            <input
              className={field}
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ancoats"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Date visited</label>
            <input
              type="date"
              className={field}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>
              Photos{isEdit ? " (new ones add to existing)" : ""}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                addFiles(Array.from(e.target.files ?? []));
                e.target.value = ""; // allow re-picking / adding more
              }}
              className={`${field} file:mr-3 file:rounded file:border-0 file:bg-ink file:px-3 file:py-1 file:text-bg`}
            />
          </div>
        </div>

        {photos.length > 0 && (
          <div>
            <label className={label}>
              Photos — pick the cover and tag each with the item it shows
            </label>
            <div className="flex flex-wrap gap-3">
              {photos.map((p, i) => (
                <div key={p.url} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.kind === "new" ? "New photo" : "Review photo"}
                      className={`h-24 w-[76px] rounded-lg border-[1.5px] object-cover ${p.kind === "new" ? "border-amber" : "border-line"}`}
                    />
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-amber px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label="Remove photo"
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] border-line bg-bg text-[10px] text-ink"
                    >
                      ✕
                    </button>
                  </div>
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeCover(i)}
                      className="font-mono text-[8px] uppercase tracking-wide text-amber"
                    >
                      Make cover
                    </button>
                  )}
                  {tagSelect(p.tag, (v) => setPhotoTag(i, v))}
                </div>
              ))}
            </div>
            <p className="mt-1.5 font-mono text-[10px] italic text-dim">
              The cover is the carousel&apos;s first slide. Tagged photos get
              that item&apos;s score on their slide; untagged ones show the
              overall score.
            </p>
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={`${label} mb-0`}>
              Location (for the map view)
            </label>
            <button
              type="button"
              onClick={findLocation}
              disabled={locating}
              className="rounded-pill border-[1.5px] border-amber px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-amber disabled:opacity-40"
            >
              {locating ? "Finding…" : "◎ Find location"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:max-w-[420px]">
            <input
              type="number"
              step="any"
              className={field}
              value={lat ?? ""}
              onChange={(e) =>
                setLat(e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder="Latitude"
              aria-label="Latitude"
            />
            <input
              type="number"
              step="any"
              className={field}
              value={lng ?? ""}
              onChange={(e) =>
                setLng(e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder="Longitude"
              aria-label="Longitude"
            />
          </div>
          {locMessage && (
            <p className="mt-1.5 font-mono text-[10px] text-dim">{locMessage}</p>
          )}
          <p className="mt-1.5 font-mono text-[10px] italic text-dim">
            Optional — pins the café on the map. Pasting from Google Maps is
            most accurate (right-click the café → click the numbers to copy) —
            paste, then save without pressing Find. Find looks it up by name
            and replaces whatever is in the boxes.
          </p>
        </div>

        <div>
          <label className={label}>Scores</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {SCORE_CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="flex flex-col items-center rounded-lg bg-card p-3"
              >
                <span className="font-mono text-[10px] uppercase tracking-wide text-dim">
                  {cat}
                </span>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={scores[cat]}
                  onChange={(e) => setScore(cat, Number(e.target.value))}
                  aria-label={`${cat} score`}
                  className="my-1 w-16 rounded-md border-[1.5px] border-line bg-transparent text-center font-display text-xl font-extrabold text-ink outline-none focus:border-amber"
                />
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.1}
                  value={scores[cat]}
                  onChange={(e) => setScore(cat, Number(e.target.value))}
                  aria-label={`${cat} slider`}
                  className="w-full accent-amber"
                />
              </div>
            ))}
          </div>
          <div className="mt-2 font-mono text-xs text-amber">
            Overall {overall.toFixed(1)} / 5{loved ? " — ★ Loved" : ""}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className={`${label} mb-0`}>What we had</label>
            <button
              onClick={addItem}
              className="rounded-pill border-[1.5px] border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide"
            >
              + Add item
            </button>
          </div>

          {/* Quick-pick presets — one tap adds a pre-filled item */}
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_PICKS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => addQuickItem(p)}
                className="rounded-pill border-[1.5px] border-amber px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-amber"
              >
                + {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {items.map((it, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-2 rounded-lg border-[1.5px] border-line p-3 [&>*]:min-w-0 sm:grid-cols-[1fr_1fr_auto_auto_auto_auto] sm:items-center"
              >
                <input
                  className={field}
                  value={it.name}
                  onChange={(e) => setItem(i, { name: e.target.value })}
                  placeholder="Item name (e.g. Cappuccino)"
                />
                <select
                  className={field}
                  value={it.type}
                  onChange={(e) =>
                    setItem(i, { type: e.target.value as ItemType })
                  }
                >
                  {ITEM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABEL[t] ?? t}
                    </option>
                  ))}
                </select>
                <select
                  className={field}
                  value={it.who}
                  onChange={(e) => setItem(i, { who: e.target.value as Who })}
                >
                  {WHO.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  className={`${field} sm:w-20`}
                  value={it.rating}
                  onChange={(e) =>
                    setItem(i, { rating: clampScore(Number(e.target.value)) })
                  }
                />
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  className={`${field} sm:w-24`}
                  value={it.price ?? ""}
                  onChange={(e) =>
                    setItem(i, {
                      price:
                        e.target.value === ""
                          ? undefined
                          : Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  placeholder="£ price"
                  aria-label="Price in pounds"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setItem(i, { star: !it.star })}
                    aria-label="Mark as standout"
                    className={`h-9 w-9 rounded-full border-[1.5px] ${it.star ? "border-amber text-amber" : "border-line text-dim"}`}
                  >
                    ★
                  </button>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(i)}
                      aria-label="Remove item"
                      className="h-9 w-9 rounded-full border-[1.5px] border-line text-dim"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>Vibe tags</label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map(({ label: l, emoji }) => (
              <button
                key={l}
                type="button"
                onClick={() => toggleTag(l)}
                className={`rounded-pill border-[1.5px] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide ${
                  hasTag(l)
                    ? "border-amber bg-amber text-white"
                    : "border-line text-ink"
                }`}
              >
                {emoji} {l}
              </button>
            ))}
            {customTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                aria-label={`Remove ${t}`}
                className="rounded-pill border-[1.5px] border-amber bg-amber px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-white"
              >
                {t} ✕
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTag();
                }
              }}
              placeholder="Add a custom tag"
              className={`${field} max-w-[240px]`}
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="flex-none rounded-pill border-[1.5px] border-line px-4 font-mono text-[11px] uppercase tracking-wide"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={`${label} mb-0`}>Verdict</label>
            <button
              type="button"
              onClick={draftVerdict}
              disabled={drafting}
              className="rounded-pill border-[1.5px] border-amber px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-amber disabled:opacity-40"
            >
              {drafting ? "Drafting…" : "✨ Draft with AI"}
            </button>
          </div>
          <textarea
            className={`${field} min-h-[90px] font-voice italic`}
            value={verdict}
            onChange={(e) => setVerdict(e.target.value)}
            placeholder="A canalside bakery firing on all cylinders…"
          />
          {draftError && (
            <p className="mt-1.5 font-mono text-xs text-red-700">{draftError}</p>
          )}
          <p className="mt-1.5 font-mono text-[10px] italic text-dim">
            AI draft — always read it over and make it yours before saving.
          </p>
        </div>

        {error && (
          <p className="font-mono text-xs text-red-700">{error}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving || deleting || !isSupabaseConfigured}
            className="h-11 rounded-pill bg-ink px-6 font-mono text-xs uppercase tracking-wide text-bg disabled:opacity-40"
          >
            {saving
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Publish café"}
          </button>
          <button
            onClick={() => router.push("/")}
            className="h-11 rounded-pill border-[1.5px] border-line px-6 font-mono text-xs uppercase tracking-wide"
          >
            Cancel
          </button>
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={saving || deleting}
              className="ml-auto h-11 rounded-pill border-[1.5px] border-red-700 px-6 font-mono text-xs uppercase tracking-wide text-red-700 disabled:opacity-40"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
