import type { Cafe } from "./types";

/**
 * Sample data used when Supabase isn't configured yet, so the app runs
 * immediately after `npm run dev`. Once your Supabase project is connected,
 * real data from the database takes over and this is ignored.
 */
export const SAMPLE_CAFES: Cafe[] = [
  {
    id: "sample-1",
    slug: "foundation",
    name: "Foundation",
    area: "Piccadilly",
    date: "2026-06-24",
    scores: { coffee: 4.5, food: 4.5, vibe: 5, service: 4.5, value: 4.5 },
    verdict:
      "Cavernous warehouse vibes and a flat white that lives up to the hype. The best all-rounder we've hit so far.",
    items: [
      { type: "latte", name: "Latte", who: "him", rating: 4.5 },
      { type: "cappuccino", name: "Cappuccino", who: "her", rating: 4.5 },
      { type: "bake", name: "Brownie", who: "shared", rating: 5, star: true },
    ],
    photos: [],
  },
  {
    id: "sample-2",
    slug: "takk",
    name: "Takk",
    area: "Northern Quarter",
    date: "2026-06-02",
    scores: { coffee: 5, food: 3.5, vibe: 4.5, service: 4.5, value: 4 },
    verdict:
      "Nordic-cool bolthole with some of the most consistent espresso in the city. We'll be back for the coffee alone.",
    items: [
      { type: "mocha", name: "Mocha", who: "him", rating: 5, star: true },
      { type: "cappuccino", name: "Cappuccino", who: "her", rating: 4.5 },
      { type: "bake", name: "Cardamom bun", who: "shared", rating: 3.5 },
    ],
    photos: [],
  },
  {
    id: "sample-3",
    slug: "pollen",
    name: "Pollen",
    area: "Ancoats",
    date: "2026-06-12",
    scores: { coffee: 4.5, food: 5, vibe: 4.5, service: 4, value: 3.5 },
    verdict:
      "A canalside bakery firing on all cylinders. The pastry is the main event here — flawless lamination — and the coffee more than holds its own.",
    items: [
      { type: "latte", name: "Latte", who: "him", rating: 4.5 },
      { type: "cappuccino", name: "Cappuccino", who: "her", rating: 4.5 },
      {
        type: "bake",
        name: "Kouign-amann",
        who: "shared",
        rating: 5,
        star: true,
      },
      { type: "dessert", name: "Cruffin", who: "shared", rating: 4.5 },
    ],
    photos: [],
  },
  {
    id: "sample-4",
    slug: "idle-hands",
    name: "Idle Hands",
    area: "Northern Quarter",
    date: "2026-06-20",
    scores: { coffee: 5, food: 4, vibe: 4, service: 4.5, value: 4 },
    verdict:
      "A proper coffee nerd's spot. Ask them about the beans and settle in. Small food menu but everything's done well.",
    items: [
      { type: "latte", name: "Latte", who: "him", rating: 4.5 },
      { type: "cappuccino", name: "Cappuccino", who: "her", rating: 4 },
    ],
    photos: [],
  },
];
