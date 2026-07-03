import WallCup from "./WallCup";

/**
 * Loading state for the wall: a single ceramic cup that gently bobs up and down
 * over its saucer, with a rotating little message. Shown while café data loads.
 */
export default function WallLoading() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
      <div className="w-40 cup-bob">
        <WallCup
          scores={{ coffee: 4, food: 4, vibe: 4, service: 4, value: 4 }}
          overall={4}
        />
      </div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-dim">
        Pouring the cafés…
      </p>
    </div>
  );
}
