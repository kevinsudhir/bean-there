# Bean There ☕

Two people drinking their way round Manchester's cafés and scoring every cup, so your next one isn't a gamble.

A deployable web app built with **Next.js (App Router) · React · TypeScript · Tailwind CSS · Supabase**. Every café is an illustrated coffee cup filled to its score; tap one for the full review, browse them on a map, and share a café as an Instagram-ready image.

> For how the codebase is organised and the ideas behind it, see
> [`docs/architecture.md`](docs/architecture.md) (or open `docs/architecture.html` in a browser).

---

## Features

- **The wall** — every café as a cup filled to its overall score; grid or map view (desktop), list / gallery / map (mobile).
- **Reviews** — per-item cups and ratings, category scores, verdict, and a photo carousel with a peek-style lightbox. Each café also has its own shareable page at `/cafe/<slug>`.
- **Map** — Leaflet + free OpenStreetMap tiles; pins show each café's score. Café names link out to Google Maps.
- **Vibe tags** — tag cafés (Aesthetic, Brunch, Cosy, …, or custom) and filter the wall by them.
- **Add / edit** — a no-code form (owner-only) to publish, edit, or delete a café, with photo upload and per-photo tagging.
- **AI-drafted verdicts** — an optional "Draft with AI" button (server-side Gemini; owner-only).
- **Share images** — download a café as a branded Instagram carousel (cover + photos + scorecard), or share its link.
- **Light / dark theme** and magic-link login for the two owners.

---

## Quick start

Needs [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Open http://localhost:3000. It runs immediately on **sample data** — no Supabase needed to see it working. To save cafés, upload photos, and log in, connect Supabase below.

---

## Connect Supabase

Supabase is a free hosted database with file storage and auth.

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query**, paste `supabase/schema.sql`, and **Run**. This creates the `cafes` table (including the `photoTags` and `tags` columns), the security rules, and the `cafe-photos` storage bucket. *(If you set the DB up earlier, the file also lists the `alter table … add column` statements to add newer columns.)*
3. **Project Settings → API** → copy the **Project URL** and **anon public** key.
4. Copy `.env.local.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   GEMINI_API_KEY=your-gemini-key           # optional, enables AI verdicts (server-only)
   NEXT_PUBLIC_SITE_URL=https://your-domain # optional, for absolute share/preview URLs
   ```
5. Restart `npm run dev`.

**Login** — writes require an authenticated user, so only the owners can add or edit. Enable **Authentication → Providers → Email** (magic link), **turn off new sign-ups**, and add the owner accounts under **Authentication → Users**. The RLS policies in `schema.sql` can be tightened to an email allowlist.

---

## Deploy (Railway)

The app is hosted on [Railway](https://railway.app), which redeploys on every push to `main`.

1. Push to a GitHub repo and create a Railway project from it.
2. Add the environment variables from step 4 above (at least the two `NEXT_PUBLIC_SUPABASE_*`; plus `GEMINI_API_KEY` and `NEXT_PUBLIC_SITE_URL` if used).
3. For a custom domain, add it under the service's **Networking** settings and point your DNS at the CNAME target Railway gives you, then set `NEXT_PUBLIC_SITE_URL` to that domain.

---

## Project structure

```
app/                         # Pages, routing, and image routes (App Router)
  layout.tsx  globals.css    # Shell + design tokens (all colours, light + dark)
  page.tsx                   # Home — the wall
  add/  cafe/[slug]/edit/    # Owner-only add / edit
  cafe/[slug]/page.tsx       # Shareable per-café page
  cafe/[slug]/card/          # Renders the share-card carousel slides as PNGs
  api/verdict/               # Server route: AI verdict via Gemini
  opengraph-image · logo · icon

components/                  # UI (props in → JSX out)
  Wall → Desktop/MobileWall  # Layout container + the two views
  CafeCard · CafeListRow · CafeMap
  ReviewContent · ReviewModal · ReviewSheet · PhotoStrip · Lightbox
  Controls · MobileControls  # Search, sort, area, vibe, view, theme
  AddCafeForm  CupIcon · WallCup · ScorePills · Header
  Auth/ThemeProvider · RequireAuth · PourGame

lib/                         # Logic & data (no UI)
  types.ts  config.ts        # The Cafe contract + site text/rules/tag helpers
  cafes.ts  supabase.ts  sample-data.ts  upload.ts  actions.ts
  useFilteredCafes.ts        # Shared search/sort/filter
  shareSlides.ts  cupSvg.ts  ogFonts*.ts  tagEmojiData.ts   # Share-card pieces

supabase/schema.sql          # Database + storage setup
docs/architecture.md         # How it all fits together
```

---

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
npm run test     # unit tests (vitest)
npm run format   # prettier
```

---

Built with care. Now go rate some coffee.
