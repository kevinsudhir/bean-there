"use client";

import type { CafeItem, ItemType, Who } from "@/lib/types";
import { clampScore, field, label } from "./shared";

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

/** A quick-pick preset: one tap adds a pre-filled item you then adjust. */
export interface QuickPick {
  label: string;
  type: ItemType;
  name: string;
  who: Who;
}

const QUICK_PICKS: QuickPick[] = [
  { label: "Mocha", type: "mocha", name: "Mocha", who: "him" },
  { label: "Latte", type: "latte", name: "Latte", who: "him" },
  { label: "Cappuccino", type: "cappuccino", name: "Cappuccino", who: "her" },
  { label: "Flat white", type: "latte", name: "Flat White", who: "him" },
  { label: "Bake", type: "bake", name: "", who: "shared" },
  { label: "Bites", type: "food", name: "", who: "shared" },
];

/** "What we had": quick-pick presets plus one editable row per item. */
export default function ItemsSection({
  items,
  onSet,
  onAdd,
  onQuick,
  onRemove,
}: {
  items: CafeItem[];
  onSet: (i: number, patch: Partial<CafeItem>) => void;
  onAdd: () => void;
  onQuick: (preset: QuickPick) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className={`${label} mb-0`}>What we had</label>
        <button
          onClick={onAdd}
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
            onClick={() => onQuick(p)}
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
              onChange={(e) => onSet(i, { name: e.target.value })}
              placeholder="Item name (e.g. Cappuccino)"
            />
            <select
              className={field}
              value={it.type}
              onChange={(e) => onSet(i, { type: e.target.value as ItemType })}
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
              onChange={(e) => onSet(i, { who: e.target.value as Who })}
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
                onSet(i, { rating: clampScore(Number(e.target.value)) })
              }
            />
            <input
              type="number"
              min={0}
              step={0.1}
              className={`${field} sm:w-24`}
              value={it.price ?? ""}
              onChange={(e) =>
                onSet(i, {
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
                onClick={() => onSet(i, { star: !it.star })}
                aria-label="Mark as standout"
                className={`h-9 w-9 rounded-full border-[1.5px] ${it.star ? "border-amber text-amber" : "border-line text-dim"}`}
              >
                ★
              </button>
              {items.length > 1 && (
                <button
                  onClick={() => onRemove(i)}
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
  );
}
