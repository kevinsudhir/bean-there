import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-6xl font-extrabold">Lost the plot</h1>
      <p className="font-voice text-xl italic text-dim">
        That café isn&apos;t on our list — yet.
      </p>
      <Link
        href="/"
        className="rounded-pill border-[1.5px] border-ink px-6 py-3 font-mono text-xs uppercase tracking-wide"
      >
        Back to the wall
      </Link>
    </main>
  );
}
