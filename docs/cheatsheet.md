# Bean There — Mental Model Cheat Sheet

A one-page map of the whole project. Read this before an interview.

> This is the source; `cheatsheet.html` is the same content as a styled,
> theme-aware page you can open in a browser. Keep the two in sync.

---

## The one big idea

Data flows **one direction**:

```
lib/  (the brain: data + rules)
  │        a page fetches data
  ▼
app/  (pages/URLs: assemble + fetch)
  │        passes data down as props
  ▼
components/  (UI pieces: props in → JSX out)
```

Components are **handed** their data (props). They never fetch their own.
Events flow **back up** via callback functions (`onOpen`, `onChange`).

> **Data flows down (props). Events flow up (callbacks).**

---

## The three layers

| Layer | Job | Contains |
| --- | --- | --- |
| `lib/` | Brain — no UI | types, rules, data access, share-card model |
| `components/` | Body — reusable UI | cups, cards, map, modal/sheet, form |
| `app/` | Skeleton — pages/URLs | routes that fetch + assemble, plus image routes |

### Inside `lib/`
- **`types.ts`** — the *shape* of data (the `Cafe` contract, incl. `items`, `photos`, `photoTags`, `lat`/`lng`). Change data shape here.
- **`config.ts`** — *settings + all site text*: `title`, `tagline`, `reviewers`, `badgeThreshold`, `city`, plus scoring logic (`overallScore`, `isLoved`), `toSlug`, `formatVisitDate`, `mapsSearchUrl`.
- **`sample-data.ts`** — sample café *data* used when Supabase isn't configured.
- **`cafes.ts`** — data access + writes: `getCafes`, `getCafeBySlug`, `getCafeById`, `createCafe`, `updateCafe`, `deleteCafe`.
- **`supabase.ts`** — the configured Supabase client (null → sample-data fallback).
- **`upload.ts`** — `uploadPhoto` → Supabase Storage, returns a public URL.
- **`actions.ts`** — the `revalidateCafes` **server action** (clears cached pages after a write).
- **`useFilteredCafes.ts`** — shared search/sort/filter logic (custom hook).
- **`shareSlides.ts`** — `buildSlides(cafe)`: the Instagram carousel model (cover → per-photo → scorecard). Used by both the client and the card route.
- **`cupSvg.ts`** — a cup/muffin/cloche as a standalone SVG data URI, for the share cards.
- **`ogFonts.ts` / `ogFontsData.ts`** — the site fonts, base64-embedded, for the server-rendered share images.

### Key `components/`
- **`CupIcon`** — draws a cup/glass/muffin/cloche filled to a score (`type`, `fill`, `size`).
- **`WallCup`** — the big ceramic wall cup (full + `compact` variants).
- **`CafeCard` / `CafeListRow`** — a café on the wall as a card / a compact row.
- **`CafeMap`** — the Leaflet map view; custom score pins, theme-aware tiles.
- **`Wall`** — owns shared state; renders **`DesktopWall`** (grid/map + `ReviewModal`) and **`MobileWall`** (list/gallery/map + `ReviewSheet`); CSS breakpoints pick which shows.
- **`ReviewContent`** — the review body (shared by modal + sheet); Save/Share carousel buttons.
- **`Controls` / `MobileControls`** — search, sort, area, Loved filter, Grid/Map (desktop) or list/gallery/map cycle (mobile), theme.
- **`AddCafeForm`** — the no-code add/edit form; photo upload + per-photo item tagging + cover choice; writes via `createCafe`/`updateCafe`/`deleteCafe`.
- **`AuthProvider` / `RequireAuth` / `AddCafeButton` / `EditCafeLink`** — login state (context) and the UI that appears only when signed in.
- **`ThemeProvider` / `ThemeToggle`** — light/dark via React Context.
- **`PourGame` / `WallEmpty` / `WallLoading`** — the empty/loading states (with the mini pour game).

### Key `app/` routes
- **`page.tsx`** — home; fetches cafés (server) → `Wall`.
- **`layout.tsx`** — wraps every page: fonts + `ThemeProvider` + `AuthProvider` + metadata/OG.
- **`add/page.tsx`**, **`cafe/[slug]/edit/page.tsx`** — auth-guarded add/edit.
- **`cafe/[slug]/page.tsx`** — a shareable page per café (`/cafe/pollen`).
- **`cafe/[slug]/card/route.tsx`** — renders one Instagram carousel slide as a 1080×1350 PNG (`?i=N`).
- **`api/verdict/route.ts`** — server route that drafts a verdict via Gemini (key stays server-side; login required).
- **`opengraph-image.tsx` / `icon.svg` / `logo/route.tsx`** — link-preview card, favicon, downloadable logo.
- **`globals.css`** — design tokens (all colours, light + dark, in one place).

---

## Server vs Client Components (the #1 interview topic)

| | Server Component (default) | Client Component (`"use client"`) |
| --- | --- | --- |
| Runs | On the server | In the browser |
| Can | `await` data directly | `useState`, `onClick`, effects |
| Can't | use state/handlers | be `async` / fetch DB directly |
| Ships JS? | No (fast) | Yes (cost of interactivity) |

**Rule:** *fetch high on the server, go interactive low on the client.*
`app/page.tsx` fetches (server) → hands data to `Wall` (`"use client"`) which
handles filtering + the modal.

Two more Next.js server pieces here: **Route Handlers** (`api/verdict`,
`cafe/[slug]/card` — return JSON/images, not pages) and a **Server Action**
(`revalidateCafes` — a server function the form calls after a write).

---

## Feature subsystems (the parts beyond the wall)

| Subsystem | How it works | Files |
| --- | --- | --- |
| **Auth** | Supabase magic-link sign-in; context tracks the session; UI hides when logged out. The *real* guard is Row-Level Security in the DB. | `login/page.tsx`, `AuthProvider`, `RequireAuth`, `supabase/schema.sql` |
| **Writes** | Form → `createCafe`/`updateCafe`/`deleteCafe` → Supabase; then `revalidateCafes` clears the cached pages. | `AddCafeForm`, `cafes.ts`, `actions.ts` |
| **Photos** | Client downscales to ~1600px JPEG → `uploadPhoto` to Storage; each photo can be tagged to an item (`photoTags`). | `upload.ts`, `AddCafeForm` |
| **Map** | Leaflet + free OSM/Carto tiles (no key); cafés carry optional `lat`/`lng`; pins show the score. | `CafeMap`, `types.ts` |
| **Share carousel** | `buildSlides` → `/cafe/[slug]/card?i=N` renders each slide as a PNG with `@vercel/og` (Satori), embedded fonts + cup SVGs. Save downloads; Share sends to apps. | `shareSlides.ts`, `card/route.tsx`, `cupSvg.ts`, `ogFonts*.ts`, `ReviewContent` |
| **AI verdict** | Client posts scores/items → server route adds the secret key → Gemini → text. | `api/verdict/route.ts`, `AddCafeForm` |

---

## Core React vocabulary (say these confidently)

- **Component** — a function that returns JSX (UI).
- **Props** — inputs passed to a component (`<CupIcon fill={0.9} />`). Read-only.
- **State** (`useState`) — data that changes over time; changing it re-renders the UI.
- **Callback prop** — a function passed down so a child can notify the parent.
- **Conditional render** — `{loved && <Badge/>}` shows the badge only if `loved`.
- **List render** — `{items.map(x => <Row key={x.id} />)}`; `key` is required.
- **`useEffect`** — run side-effects (key listeners, body-scroll lock) after render.
- **`useMemo`** — cache derived data; recompute only when dependencies change.
- **`useId`** — stable unique ids (used for SVG clip-paths so they don't collide or mismatch on hydration).
- **Context** (`ThemeProvider`, `AuthProvider`) — share global-ish state without prop-drilling.
- **Custom hook** — reusable logic starting with `use` (`useFilteredCafes`).

---

## TypeScript patterns here

- **`interface Cafe { ... }`** — object shape / contract.
- **Union type** — `type Who = "him" | "her" | "shared"` (one of a fixed set).
- **Derived type** — `SCORE_CATEGORIES` (array) → `ScoreCategory` (type) via
  `as const` + `(typeof X)[number]`. One source for the list *and* the type.
- **`Omit<Cafe, "id" | "slug">`** — "this type minus these fields."
- **Discriminated union** — `Slide` in `shareSlides.ts` (`kind: "cover" | "photo" | "scores"`); the `kind` field narrows which other fields exist.
- **`Promise<Cafe[]>`** — an `async` function returns a Promise; you `await` it.

---

## HOW TO ANSWER "make this change" (the method)

1. **Classify it:** is it *data*, a *rule/text*, or *visual*?
   - Data (one café's info) → `lib/sample-data.ts` / the database
   - Rule or text (applies site-wide) → `lib/config.ts`
   - Visual (how something looks) → `components/…`
   - Data *shape* → `lib/types.ts`
2. **Find the file** for that layer.
3. **Search for the concept** (e.g. "badge", "tagline", "sort").
4. If it spans logic + UI, expect **two files** (logic in `lib/`, button/markup in `components/`), and a **type** may tie them together — TypeScript will flag it if you miss it.

### Worked examples
| Request | File(s) | Edit |
| --- | --- | --- |
| Badge needs 4.7 | `lib/config.ts` | `badgeThreshold: 4.7` |
| Change tagline | `lib/config.ts` | `SITE.tagline` |
| Bigger wall cups | `components/CafeCard.tsx` | `size={180}` |
| Reviewer names | `lib/config.ts` | `SITE.reviewers` |
| Add 6th score (wifi) | `lib/types.ts` | add to `SCORE_CATEGORIES` (TS flags the rest) |
| New sort option | `Controls.tsx` (type + array) + `useFilteredCafes.ts` (logic) | add `SortKey`, `SORTS` entry, `else if` branch |
| Change a share-card slide | `app/cafe/[slug]/card/route.tsx` | edit the slide's JSX; `shareSlides.ts` decides the order |
| New home city | `lib/config.ts` | `SITE.city` (feeds map search) |

---

## Stack, in one breath

> "It's a Next.js App Router app in React + TypeScript, styled with Tailwind
> wired to CSS-variable design tokens, on Supabase for the database, photo
> storage, and magic-link auth. I fetch on the server and pass data to client
> components for interactivity; writes go through a server action that
> revalidates the cache. It also has a Leaflet map, AI-drafted verdicts via a
> server-side Gemini route, and shareable Instagram cards rendered as images
> with @vercel/og. Business rules and the data shape each live in one place,
> so changes are localized and the type system catches anything I miss."
