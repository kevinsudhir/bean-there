"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/**
 * Login page. Sends a one-time "magic link" to the entered email via Supabase
 * Auth. Clicking the link in the email signs the user in. No passwords.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function sendLink() {
    if (!supabase) {
      setStatus("error");
      setMessage("Supabase isn't configured.");
      return;
    }
    if (!email.trim()) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
      setMessage("Check your email for the sign-in link.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center gap-5 px-6">
      <Link
        href="/"
        className="font-mono text-[11px] uppercase tracking-wide text-dim hover:text-ink"
      >
        ← Back
      </Link>

      <h1 className="font-display text-4xl font-extrabold">Sign in</h1>
      <p className="font-voice italic text-dim">
        For the two of us to add cafés. We&apos;ll email you a one-time link.
      </p>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendLink()}
        placeholder="you@example.com"
        className="h-12 w-full rounded-pill border-[1.5px] border-line bg-transparent px-5 font-mono text-sm text-ink outline-none focus:border-ink"
      />

      <button
        onClick={sendLink}
        disabled={status === "sending"}
        className="h-12 rounded-pill bg-ink font-mono text-xs uppercase tracking-wide text-bg disabled:opacity-40"
      >
        {status === "sending" ? "Sending…" : "Email me a link"}
      </button>

      {message && (
        <p
          className={`font-mono text-xs ${status === "error" ? "text-red-700" : "text-amber"}`}
        >
          {message}
        </p>
      )}
    </main>
  );
}
