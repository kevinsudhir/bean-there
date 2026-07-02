"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

/**
 * Wraps a page/section that requires login. While the session is loading it
 * shows nothing; if there's no session it redirects to /login; otherwise it
 * renders its children. This is UX-level protection — the database's RLS is
 * what actually stops unauthorised writes.
 */
export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <p className="py-24 text-center font-mono text-xs uppercase tracking-wide text-dim">
        Checking access…
      </p>
    );
  }

  return <>{children}</>;
}
