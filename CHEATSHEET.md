# Bean There — Mental Model Cheat Sheet

A one-page map of the whole project. Read this before an interview.

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
| `lib/` | Brain — no UI | types, rules, data access |
| `components/` | Body — reusable UI | cups, cards, modal, form |
| `app/` | Skeleton — pages/URLs | routes that fetch + assemble |

### Inside `lib/`
- **`types.ts`** — the *shape* of data (the `Cafe` contract). Change data shape here.
- **`config.ts`** — *settings + all site text*: `tagline`, `title`, `reviewers`, `badgeThreshold`, plus scoring logic (`overallScore`, `isLoved`).
- **`sample-data.ts`** — the actual sample *café data*.
- **`cafes.ts` / `supabase.ts`** — *where data comes from* (DB or fallback).
- **`useFilteredCafes.ts`** — shared search/sort/filter logic (custom hook).

### Key `components/`
- **`CupIcon`** — draws a cup/muffin filled to a score. Shape chosen by `type` prop; fill by `fill` prop; `size` prop (default 120).
- **`CafeCard`** — one café on the wall. Uses `CupIcon` + `overallScore`/`isLoved`.
- **`ReviewModal`** — the full review popup.
- **`Controls`** — search + sort + area + badge filter + theme.
- **`AddCafeForm`** — the no-code form; writes via `createCafe`.
- **`ThemeProvider` / `ThemeToggle`** — light/dark via React Context.

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
- **Context** (`ThemeProvider`) — share global-ish state without prop-drilling.
- **Custom hook** — reusable logic starting with `use` (`useFilteredCafes`).

---

## TypeScript patterns here

- **`interface Cafe { ... }`** — object shape / contract.
- **Union type** — `type Who = "him" | "her" | "shared"` (one of a fixed set).
- **Derived type** — `SCORE_CATEGORIES` (array) → `ScoreCategory` (type) via
  `as const` + `(typeof X)[number]`. One source for the list *and* the type.
- **`Omit<Cafe, "id" | "slug">`** — "this type minus these fields."
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

---

## Stack, in one breath

> "It's a Next.js App Router app in React + TypeScript, styled with Tailwind
> wired to CSS-variable design tokens, with Supabase for the database, photo
> storage, and auth. I fetch on the server and pass data to client components
> for interactivity. Business rules and the data shape each live in one place,
> so changes are localized and the type system catches anything I miss."
