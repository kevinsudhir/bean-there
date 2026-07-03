"use client";

import { useState } from "react";
import Link from "next/link";
import type { Cafe, Who } from "@/lib/types";
import { overallScore, isLoved, formatVisitDate, SITE } from "@/lib/config";
import { useAuth } from "./AuthProvider";
import CupIcon from "./CupIcon";
import ScorePills from "./ScorePills";
import PhotoStrip from "./PhotoStrip";
import Lightbox from "./Lightbox";

const whoLabel: Record<Who, string> = {
  him: SITE.reviewers.him,
  her: SITE.reviewers.her,
  shared: "Shared",
};

/**
 * The review BODY — everything from the brand mark to the byline. Deliberately
 * container-agnostic: the desktop modal and the mobile sheet both render this,
 * so the review is written once and presented two ways (DRY).
 *
 * It owns the `lightbox` state because the photo strip lives inside it.
 */
export default function ReviewContent({ cafe }: { cafe: Cafe }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { session } = useAuth();

  const overall = overallScore(cafe.scores);
  const loved = isLoved(cafe);

  return (
    <>
      <div className="flex items-center justify-center font-display text-base font-extrabold uppercase">
        {SITE.title}
        <svg
          viewBox="0 0 40 50"
          className="ml-1.5 inline-block h-[1em] w-[0.8em] align-[-0.1em]"
          aria-hidden="true"
        >
          <ellipse cx="20" cy="25" rx="15" ry="23" fill="var(--amber)" />
          <path
            d="M20,4 C12,16 12,34 20,46"
            fill="none"
            stroke="var(--bg)"
            strokeWidth="3.4"
          />
        </svg>
      </div>

      <div className="font-mono text-[11px] uppercase tracking-widest text-amber">
        {cafe.area} · Reviewed {formatVisitDate(cafe.date)}
      </div>

      <div className="flex w-full max-w-full flex-wrap items-center justify-center gap-4 sm:gap-8">
        <h2 className="font-display text-[clamp(36px,4.6vw,64px)] font-extrabold leading-[0.86] tracking-tight">
          {cafe.name}
        </h2>
        <div
          className={`flex h-[76px] w-[76px] flex-none flex-col items-center justify-center rounded-full border-[3px] border-amber sm:h-[clamp(80px,6.5vw,92px)] sm:w-[clamp(80px,6.5vw,92px)] ${loved ? "bg-amber" : ""}`}
        >
          <span
            className={`font-display text-[clamp(26px,2.8vw,36px)] font-extrabold leading-none ${loved ? "text-white" : "text-amber"}`}
          >
            {overall.toFixed(1)}
          </span>
          <span
            className={`mt-0.5 font-mono text-[10px] ${loved ? "text-white/80" : "text-dim"}`}
          >
            /5
          </span>
          {loved && <span className="text-xs text-white">★</span>}
        </div>
      </div>

      <ScorePills scores={cafe.scores} />

      <div className="flex w-full max-w-full flex-wrap justify-center gap-x-6 gap-y-3.5 sm:gap-x-[clamp(22px,3.5vw,54px)]">
        {cafe.items.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <CupIcon type={item.type} fill={item.rating / 5} size={100} />
            <div className="flex items-center justify-center gap-2 font-display text-[clamp(16px,1.4vw,21px)] font-extrabold">
              {item.name}
              {item.star && <span className="text-[0.7em] text-amber">★</span>}
            </div>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-dim">
              {whoLabel[item.who]}
              {typeof item.price === "number" && (
                <span className="ml-1.5 text-amber">
                  £{item.price.toFixed(2)}
                </span>
              )}
            </div>
            <div className="font-display text-[clamp(22px,2.4vw,32px)] font-extrabold">
              {item.rating.toFixed(1)}
              <small className="text-[0.4em] font-normal text-dim"> / 5</small>
            </div>
          </div>
        ))}
      </div>

      <p className="w-full max-w-[740px] px-1 font-voice text-[clamp(15px,1.3vw,19px)] italic leading-[1.45]">
        {cafe.verdict}
      </p>

      <PhotoStrip photos={cafe.photos} onOpen={setLightbox} />

      <div className="font-mono text-[10px] uppercase tracking-widest text-dim">
        Reviewed by <b className="text-amber">{SITE.reviewers.him}</b> &amp;{" "}
        <b className="text-amber">{SITE.reviewers.her}</b>
      </div>

      {session && (
        <Link
          href={`/cafe/${cafe.slug}/edit`}
          className="rounded-pill border-[1.5px] border-line px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-ink hover:border-ink"
        >
          Edit this café
        </Link>
      )}

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
