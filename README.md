# Bean There ☕

Two people drinking their way round Manchester's cafés and scoring them so you don't have to gamble your flat white money.

This is a real, deployable web app built with **Next.js (App Router) + React + TypeScript + Tailwind CSS + Supabase**. It shows every café as an illustrated coffee cup filled to its score, opens a full review when you tap one, and has a built-in form to add new cafés (no code required).

---

## 1. Quick start (run it locally)

You need [Node.js](https://nodejs.org) 18+ installed.

```bash
# from the project folder
npm install
npm run dev
```

Open http://localhost:3000. It runs immediately using **sample data** — you don't need Supabase to see it working.

To enable saving cafés and photo uploads, set up Supabase (section 3).

---

## 2. What's in the box (project structure)

```
bean-there/
├── app/                      # Pages & routing (Next.js App Router)
│   ├── layout.tsx            # Wraps every page: fonts + theme provider
│   ├── globals.css           # ★ DESIGN TOKENS — all colours, light + dark
│   ├── page.tsx              # Home page (the wall of cafés)
│   ├── add/page.tsx          # "Add a café" page
│   ├── cafe/[slug]/page.tsx  # A shareable page per café (e.g. /cafe/pollen)
│   └── not-found.tsx         # 404 page
│
├── components/               # Reusable UI pieces (one job each)
│   ├── Header.tsx            # Title, bean tooltip, tagline
│   ├── Controls.tsx          # Search + sort + area + badge filter + theme
│   ├── Wall.tsx              # Holds filter state; renders the card grid + modal
│   ├── CafeCard.tsx          # One café on the wall (the big cup)
│   ├── CupIcon.tsx           # ★ Draws the cup/muffin SVG filled to a score
│   ├── ScorePills.tsx        # The five category score chips
│   ├── ReviewModal.tsx       # The full review card (opens on tap)
│   ├── PhotoStrip.tsx        # Horizontal photo gallery
│   ├── Lightbox.tsx          # Full-screen photo viewer
│   ├── AddCafeForm.tsx       # The no-code form to add a café
│   ├── ThemeProvider.tsx     # Light/dark state (React Context)
│   └── ThemeToggle.tsx       # The Dark/Light button
│
├── lib/                      # Logic & data (no UI here)
│   ├── types.ts              # ★ The Cafe type — the data contract
│   ├── config.ts             # ★ Site text + scoring/badge rules
│   ├── cafes.ts              # Data access: getCafes, getCafeBySlug, createCafe
│   ├── supabase.ts           # Configured Supabase client
│   ├── sample-data.ts        # Fallback data so it runs without Supabase
│   ├── upload.ts             # Photo upload to Supabase storage
│   └── useFilteredCafes.ts   # Shared search/sort/filter logic
│
├── supabase/
│   └── schema.sql            # Database + storage setup (run once in Supabase)
│
├── tailwind.config.ts        # Tailwind wired to the CSS-variable tokens
└── .env.local.example        # Template for your Supabase credentials
```

The ★ files are the most important to understand — see section 5.

---

## 3. Connect Supabase (enables saving + photos)

Supabase is a free hosted database with file storage and login built in.

1. Create a free account at [supabase.com](https://supabase.com) and make a new project.
2. In the project, go to **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and click **Run**. This creates the `cafes` table, the
   security rules, and the `cafe-photos` storage bucket.
3. Go to **Project Settings → API** and copy the **Project URL** and the
   **anon public** key.
4. In the project folder, copy `.env.local.example` to `.env.local` and paste
   your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Restart `npm run dev`. The app now reads/writes real data.

**Login (so only you two can add cafés):** the write rules require an
authenticated user. The simplest option is Supabase's email magic-link auth —
enable it under **Authentication → Providers → Email**. (Wiring a login button
into the app is a good first exercise; see section 6.)

---

## 4. Deploy it (free)

The easiest host is [Vercel](https://vercel.com) (made by the Next.js team):

1. Push this folder to a GitHub repository.
2. On Vercel, **Add New → Project**, import the repo.
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy. You get a live URL; every push to GitHub redeploys automatically.

---

## 5. How it actually works (the mental model)

**A request becomes a rendered café like this:**

1. You visit `/`. `app/page.tsx` runs **on the server**, calls `getCafes()`
   (`lib/cafes.ts`), which reads from Supabase (or sample data).
2. It passes the cafés to `<Wall>` (`components/Wall.tsx`), a **client
   component** that runs in the browser and handles interactivity.
3. `Wall` keeps the filter state, uses `useFilteredCafes` to narrow/sort the
   list, and renders a `<CafeCard>` for each. Each card draws a `<CupIcon>`
   filled to the café's overall score.
4. Tap a card → `Wall` sets `openCafe` → `<ReviewModal>` renders the full
   review. Everything reads from the same `Cafe` object.

**Two ideas worth internalising for interviews:**

- **Server vs Client Components.** Pages under `app/` are Server Components by
  default (fast, can fetch data directly). Files that start with `"use client"`
  run in the browser and can use state/effects/events. We fetch on the server,
  then hand data to client components for interactivity.
- **One source of truth, twice.** Colours live once in `globals.css`; the data
  shape lives once in `lib/types.ts`. Change either in one place and it ripples
  correctly everywhere. This is the answer to "where would you change X?"

---

## 6. Make-a-change drills (great interview prep)

Try these — each is a small, real change that teaches a concept:

| Change | Where | Concept |
| --- | --- | --- |
| Change the brand amber colour | `app/globals.css` (`--amber`) | Design tokens |
| Make the "Loved" badge need 4.7+ | `lib/config.ts` (`badgeThreshold`) | Single-constant config |
| Add a 6th score category (e.g. "wifi") | `lib/types.ts` (`SCORE_CATEGORIES`) | Typed contract propagation |
| Change the reviewer names | `lib/config.ts` (`reviewers`) | Config |
| Add a new sort option | `components/Controls.tsx` + `lib/useFilteredCafes.ts` | State + pure logic |
| Change the tagline | `lib/config.ts` (`tagline`) | Config |
| Make cups bigger on the wall | `components/CafeCard.tsx` (`size` prop) | Component props |
| Add a login button | new component + `lib/supabase.ts` auth | Auth + Context |

When you add the 6th category, notice how TypeScript immediately flags every
place that must handle it — that's the type system doing your code review.

---

## 7. Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # check for problems
npm run format   # auto-format with Prettier
```

---

Built with care. Now go rate some coffee.
