-- Bean There — Supabase schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.

-- 1) The cafes table. Scores, items, and photos are stored as JSON so each
--    cafe is a single row that maps directly to the Cafe type in lib/types.ts.
create table if not exists public.cafes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  area text not null,
  date date not null,
  scores jsonb not null,
  items jsonb not null default '[]',
  verdict text not null default '',
  photos jsonb not null default '[]',
  -- Per-photo item tag, parallel to photos (item name or null). Quoted so the
  -- column keeps its camelCase name and matches the JSON key sent by the app.
  "photoTags" jsonb not null default '[]',
  -- Vibe tags (array of plain labels, e.g. ["Aesthetic","Brunch"]).
  tags jsonb not null default '[]',
  -- Optional map pin (WGS84). Null = café not located yet.
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

-- Already ran the schema before these features existed? Add the columns with:
--   alter table public.cafes add column if not exists lat double precision;
--   alter table public.cafes add column if not exists lng double precision;
--   alter table public.cafes add column if not exists "photoTags" jsonb not null default '[]';
--   alter table public.cafes add column if not exists tags jsonb not null default '[]';

-- Helpful index for sorting by visit date.
create index if not exists cafes_date_idx on public.cafes (date desc);

-- 2) Row Level Security.
--    Reads are public (anyone can view the site). Writes (adding cafes) require
--    an authenticated user, so only you and your wife — once logged in — can add.
--
--    IMPORTANT: "authenticated" means ANY signed-in user, so this is only safe
--    when new sign-ups are impossible. The login page passes
--    shouldCreateUser: false, and you should also disable sign-ups in
--    Dashboard → Authentication → Providers → Email. For belt-and-braces,
--    replace the write policies with an email allowlist, e.g.:
--      with check ((auth.jwt() ->> 'email') in ('you@example.com', 'her@example.com'))
alter table public.cafes enable row level security;

create policy "Public can read cafes"
  on public.cafes for select
  using (true);

create policy "Authenticated can insert cafes"
  on public.cafes for insert
  to authenticated
  with check (true);

create policy "Authenticated can update cafes"
  on public.cafes for update
  to authenticated
  using (true);

create policy "Authenticated can delete cafes"
  on public.cafes for delete
  to authenticated
  using (true);

-- 3) Storage bucket for photos (public read).
--    Create a bucket named "cafe-photos" in Dashboard → Storage, mark it Public,
--    OR run the following:
insert into storage.buckets (id, name, public)
values ('cafe-photos', 'cafe-photos', true)
on conflict (id) do nothing;

-- Allow public read of photos, authenticated upload.
create policy "Public can read photos"
  on storage.objects for select
  using (bucket_id = 'cafe-photos');

create policy "Authenticated can upload photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cafe-photos');
