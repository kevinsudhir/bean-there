"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CafeItem, ItemType, Scores, Who } from "@/lib/types";
import { SCORE_CATEGORIES } from "@/lib/types";
import { overallScore, SITE } from "@/lib/config";
import { createCafe } from "@/lib/cafes";
import { uploadPhoto } from "@/lib/upload";
import { isSupabaseConfigured } from "@/lib/supabase";

const ITEM_TYPES: ItemType[] = [
  "mocha",
  "latte",
  "cappuccino",
  "filter",
  "cold",
  "bake",
  "dessert",
];
const WHO: Who[] = ["him", "her", "shared"];

const emptyItem = (): CafeItem => ({
  type: "latte",
  name: "",
  who: "shared",
  rating: 4,
  star: false,
});

const label = "mb-1.5 block font-mono text-xs uppercase tracking-wide text-dim";
const field =
  "w-full rounded-lg border-[1.5px] border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus:border-ink";

/**
 * The "Add café" form. Fills in name/area/date, the five scores (overall and
 * the badge are calculated live), any number of items with a star for the
 * standout, photo uploads, and the verdict — then saves to Supabase.
 */
export default function AddCafeForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [scores, setScores] = useState<Scores>({
    coffee: 4,
    food: 4,
    vibe: 4,
    service: 4,
    value: 4,
  });
  const [items, setItems] = useState<CafeItem[]>([emptyItem()]);
  const [verdict, setVerdict] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overall = useMemo(() => overallScore(scores), [scores]);
  const loved = overall >= SITE.badgeThreshold;

  const setScore = (cat: keyof Scores, value: number) =>
    setScores((s) => ({ ...s, [cat]: value }));
  const setItem = (i: number, patch: Partial<CafeItem>) =>
    setItems((list) => list.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const addItem = () => setItems((list) => [...list, emptyItem()]);
  const removeItem = (i: number) =>
    setItems((list) => list.filter((_, j) => j !== i));

  async function handleSubmit() {
    setError(null);
    if (!name.trim() || !area.trim()) {
      setError("Café name and area are required.");
      return;
    }
    setSaving(true);
    try {
      const photos: string[] = [];
      for (const file of files) photos.push(await uploadPhoto(file));

      await createCafe({
        name: name.trim(),
        area: area.trim(),
        date,
        scores,
        items: items.filter((it) => it.name.trim()),
        verdict: verdict.trim(),
        photos,
      });

      router.refresh();
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[720px] px-6 py-10">
      <h1 className="mb-1 font-display text-4xl font-extrabold">Add a café</h1>
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
            <label className={label}>Photos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className={`${field} file:mr-3 file:rounded file:border-0 file:bg-ink file:px-3 file:py-1 file:text-bg`}
            />
          </div>
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
                <span className="my-1 font-display text-xl font-extrabold">
                  {scores[cat].toFixed(1)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={scores[cat]}
                  onChange={(e) => setScore(cat, Number(e.target.value))}
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
          <div className="flex flex-col gap-3">
            {items.map((it, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-2 rounded-lg border-[1.5px] border-line p-3 sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-center"
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
                      {t}
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
                  step={0.5}
                  className={`${field} sm:w-20`}
                  value={it.rating}
                  onChange={(e) =>
                    setItem(i, { rating: Number(e.target.value) })
                  }
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
          <label className={label}>Verdict</label>
          <textarea
            className={`${field} min-h-[90px] font-voice italic`}
            value={verdict}
            onChange={(e) => setVerdict(e.target.value)}
            placeholder="A canalside bakery firing on all cylinders…"
          />
        </div>

        {error && (
          <p className="font-mono text-xs text-red-700">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving || !isSupabaseConfigured}
            className="h-11 rounded-pill bg-ink px-6 font-mono text-xs uppercase tracking-wide text-bg disabled:opacity-40"
          >
            {saving ? "Saving…" : "Publish café"}
          </button>
          <button
            onClick={() => router.push("/")}
            className="h-11 rounded-pill border-[1.5px] border-line px-6 font-mono text-xs uppercase tracking-wide"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
