"use client";

import { useState } from "react";
import { SUGGESTED_TAGS } from "@/lib/config";
import { field, label } from "./shared";

/**
 * Vibe tags: the suggested set as toggle chips plus a small input for custom
 * tags. Owns only the custom-tag input text; the selected tags live in the
 * parent form.
 */
export default function TagsSection({
  tags,
  onTags,
}: {
  tags: string[];
  onTags: (next: string[]) => void;
}) {
  const [customTag, setCustomTag] = useState("");

  const hasTag = (l: string) =>
    tags.some((t) => t.toLowerCase() === l.toLowerCase());
  const toggleTag = (l: string) =>
    onTags(
      hasTag(l)
        ? tags.filter((t) => t.toLowerCase() !== l.toLowerCase())
        : [...tags, l],
    );
  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !hasTag(t)) onTags([...tags, t]);
    setCustomTag("");
  };
  // Custom tags = selected tags that aren't in the suggested set.
  const customTags = tags.filter(
    (t) => !SUGGESTED_TAGS.some((s) => s.label.toLowerCase() === t.toLowerCase()),
  );

  return (
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
  );
}
