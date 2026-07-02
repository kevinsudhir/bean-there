"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

/**
 * Floating "Add café" button — only shown to a logged-in user. Whether someone
 * is logged in is client-side state (the Supabase session lives in the
 * browser), so this is a small client component the server page can drop in.
 */
export default function AddCafeButton() {
  const { session } = useAuth();
  if (!session) return null;

  return (
    <Link
      href="/add"
      className="fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2 rounded-pill border-[1.5px] border-ink bg-ink px-6 font-mono text-sm uppercase tracking-wide text-bg shadow-lg"
    >
      + Add café
    </Link>
  );
}
