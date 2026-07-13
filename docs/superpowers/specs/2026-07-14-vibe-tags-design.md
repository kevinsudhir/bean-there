# Vibe tags — design

## Goal

Let each café carry a few "vibe" tags (aesthetic, brunch, cosy…) so visitors
can filter the wall by vibe, and so the tags appear as hashtags on the
shareable card. Tags come from a suggested set but any custom tag can be added.

## Data

- `Cafe` gains `tags?: string[]` — plain labels only, e.g. `["Aesthetic",
  "Brunch", "Canalside"]`. No emoji or `#` stored; those are presentation.
- Supabase: `tags jsonb not null default '[]'`; migration note added to
  `schema.sql` (`alter table ... add column if not exists tags jsonb ...`).
- Saves send `tags` only when non-empty or when the café already had them
  (same guard pattern as `photoTags`/`lat`/`lng`), so an un-migrated database
  keeps working.

## Suggested tags (config)

`lib/config.ts` exports `SUGGESTED_TAGS` (label → emoji):

📸 Aesthetic · 💻 Laptop-friendly · 🥐 Brunch · 🛋️ Cosy · 👥 Group-friendly ·
🌿 Outdoor seating

Helpers:
- `tagEmoji(label)` → the emoji for a suggested label, or `undefined` (custom).
- `tagHash(label)` → `"#" + label.toLowerCase().replace(/[^a-z0-9]+/g, "")`
  (e.g. `"Laptop-friendly"` → `"#laptopfriendly"`, `"Canalside"` →
  `"#canalside"`).

## Editor (AddCafeForm)

A "Vibe tags" section:
- The suggested tags as toggle chips (emoji + label); tapping adds/removes.
- A small text input + "Add" to append a custom tag (trimmed; ignores blanks
  and duplicates, case-insensitive).
- Selected tags render as removable chips.

## Website display (ReviewContent)

Under the area/date line, a row of chips reading `📸 #aesthetic` (emoji from the
map when known + hashtag; custom tags show just `#canalside`). Not shown on the
wall cards — cards stay clean.

## Filter

- `FilterState` gains `tags: string[]`.
- `Wall` derives `allTags` = the unique, sorted set of tags across the loaded
  cafés (like `areas`), and passes it down.
- `useFilteredCafes`: when `tags` is non-empty, keep cafés whose `tags` include
  **all** selected tags (AND). Match by trimmed, case-insensitive label so a
  stray-whitespace tag still matches (same lesson as the photo-tag fix).
- Desktop `Controls`: a "Vibe" chip group (wraps below the existing row).
  Mobile `MobileControls`: a "Vibe" section inside the "More" panel, after Area.

## Downloaded card (cafe/[slug]/card)

- Cover slide shows a hashtag row **and** the category pills, between the café
  name and the pills (as previewed).
- Emoji on the card: the 6 suggested emojis are embedded as small SVG images
  (base64, like the fonts/cups) and drawn as `<img>` inside each chip — no
  external fetch, so it stays reliable. A custom tag with no known emoji shows
  just `#label`.
- Long tag rows wrap; if a café has many tags, the cover shows the first few
  (cap ~4) to avoid overcrowding — remaining tags still appear on the website.

## Bean wobble (separate small touch)

A one-shot CSS wobble on the amber bean glyph beside the header title on page
load. Defined in `globals.css` as a keyframe animation; disabled under
`prefers-reduced-motion`.

## Testing

- `tagHash` / `tagEmoji` — unit tests in `lib/__tests__/config.test.ts`.
- Tag filtering (AND, trim/case-insensitive) — extend `useFilteredCafes`
  coverage if present, otherwise a small unit test of the filter logic.

## Out of scope

- Global tag management (rename/merge across cafés), tag counts, tag search.
- Tags on the wall cards.
- Rendering arbitrary custom-tag emoji on the card (only the suggested six).
