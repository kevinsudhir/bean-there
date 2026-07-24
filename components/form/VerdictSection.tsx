"use client";

import { field, label } from "./shared";

/** The verdict textarea plus the AI draft button. */
export default function VerdictSection({
  verdict,
  drafting,
  error,
  onVerdict,
  onDraft,
}: {
  verdict: string;
  drafting: boolean;
  error: string | null;
  onVerdict: (v: string) => void;
  onDraft: () => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className={`${label} mb-0`}>Verdict</label>
        <button
          type="button"
          onClick={onDraft}
          disabled={drafting}
          className="rounded-pill border-[1.5px] border-amber px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-amber disabled:opacity-40"
        >
          {drafting ? "Drafting…" : "✨ Draft with AI"}
        </button>
      </div>
      <textarea
        className={`${field} min-h-[90px] font-voice italic`}
        value={verdict}
        onChange={(e) => onVerdict(e.target.value)}
        placeholder="A canalside bakery firing on all cylinders…"
      />
      {error && <p className="mt-1.5 font-mono text-xs text-red-700">{error}</p>}
      <p className="mt-1.5 font-mono text-[10px] italic text-dim">
        AI draft — always read it over and make it yours before saving.
      </p>
    </div>
  );
}
