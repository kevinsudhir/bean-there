"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

/**
 * "Edit" link for a café detail page — only shown when logged in. Client
 * component because login state lives in the browser.
 */
export default function EditCafeLink({ slug }: { slug: string }) {
  const { session } = useAuth();
  if (!session) return null;

  return (
    <Link
      href={`/cafe/${slug}/edit`}
      className="rounded-pill border-[1.5px] border-line px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-ink hover:border-ink"
    >
      Edit
    </Link>
  );
}
