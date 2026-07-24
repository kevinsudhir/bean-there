"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Cafe, CafeItem, Scores } from "@/lib/types";
import { overallScore, SITE, toSlug } from "@/lib/config";
import { createCafe, updateCafe, deleteCafe, getCafeBySlug } from "@/lib/cafes";
import { revalidateCafes } from "@/lib/actions";
import { uploadPhoto, downscaleImage } from "@/lib/upload";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { field, label, clampScore } from "./form/shared";
import PhotosSection, { type PhotoEntry } from "./form/PhotosSection";
import LocationSection from "./form/LocationSection";
import ScoresSection from "./form/ScoresSection";
import ItemsSection, { type QuickPick } from "./form/ItemsSection";
import TagsSection from "./form/TagsSection";
import VerdictSection from "./form/VerdictSection";

const emptyItem = (): CafeItem => ({
  type: "latte",
  name: "",
  who: "shared",
  rating: 4,
  star: false,
});

/**
 * The café form, used for BOTH adding and editing. Pass `existing` to edit a
 * café (fields pre-fill, a Delete button appears, and saving updates instead
 * of inserting). With no `existing`, it's a blank "add" form.
 *
 * This component owns all the state and the save/delete/draft/geocode
 * handlers; the visual sections live in components/form/ and are handed
 * state + callbacks.
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
  const addQuickItem = (p: QuickPick) =>
    setItems((list) => {
      const next: CafeItem = {
        type: p.type,
        name: p.name,
        who: p.who,
        rating: 4,
        star: false,
      };
      // If the only row is a blank starter, replace it; otherwise append.
      const onlyBlankStarter = list.length === 1 && !list[0].name.trim();
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
    if (!window.confirm(`Delete "${existing.name}"? This can't be undone.`))
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

        <PhotosSection
          photos={photos}
          itemNames={itemNames}
          onRemove={removePhoto}
          onMakeCover={makeCover}
          onTag={setPhotoTag}
        />

        <LocationSection
          lat={lat}
          lng={lng}
          locating={locating}
          message={locMessage}
          onLat={setLat}
          onLng={setLng}
          onFind={findLocation}
        />

        <ScoresSection
          scores={scores}
          overall={overall}
          loved={loved}
          onScore={setScore}
        />

        <ItemsSection
          items={items}
          onSet={setItem}
          onAdd={addItem}
          onQuick={addQuickItem}
          onRemove={removeItem}
        />

        <TagsSection tags={tags} onTags={setTags} />

        <VerdictSection
          verdict={verdict}
          drafting={drafting}
          error={draftError}
          onVerdict={setVerdict}
          onDraft={draftVerdict}
        />

        {error && <p className="font-mono text-xs text-red-700">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving || deleting || !isSupabaseConfigured}
            className="h-11 rounded-pill bg-ink px-6 font-mono text-xs uppercase tracking-wide text-bg disabled:opacity-40"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Publish café"}
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
