import { notFound } from "next/navigation";
import Link from "next/link";
import type { Who } from "@/lib/types";
import { getCafeBySlug } from "@/lib/cafes";
import { overallScore, isLoved, formatVisitDate, SITE } from "@/lib/config";
import CupIcon from "@/components/CupIcon";
import ScorePills from "@/components/ScorePills";
import EditCafeLink from "@/components/EditCafeLink";

export const dynamic = "force-dynamic";

const whoLabel: Record<Who, string> = {
  him: SITE.reviewers.him,
  her: SITE.reviewers.her,
  shared: "Shared",
};

/**
 * A dedicated, shareable page for one cafe (e.g. /cafe/pollen). The wall opens
 * cafes in a modal for quick browsing; this page gives each review its own URL
 * for sharing/bookmarking. Same content, laid out as a full page.
 */
export default async function CafePage({
  params,
}: {
  params: { slug: string };
}) {
  const cafe = await getCafeBySlug(params.slug);
  if (!cafe) notFound();

  const overall = overallScore(cafe.scores);
  const loved = isLoved(cafe);

  return (
    <main className="mx-auto flex max-w-[1100px] flex-col items-center gap-4 px-6 py-10 text-center">
      <div className="flex w-full items-center justify-between">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-wide text-dim hover:text-ink"
        >
          ← All cafés
        </Link>
        <EditCafeLink slug={cafe.slug} />
      </div>

      <div className="font-mono text-[11px] uppercase tracking-widest text-amber">
        {cafe.area} · Reviewed {formatVisitDate(cafe.date)}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6">
        <h1 className="font-display text-[clamp(42px,6vw,78px)] font-extrabold leading-[0.86] tracking-tight">
          {cafe.name}
        </h1>
        <div
          className={`flex h-24 w-24 flex-none flex-col items-center justify-center rounded-full border-[3px] border-amber ${loved ? "bg-amber" : ""}`}
        >
          <span
            className={`font-display text-4xl font-extrabold leading-none ${loved ? "text-white" : "text-amber"}`}
          >
            {overall.toFixed(1)}
          </span>
          <span
            className={`mt-0.5 font-mono text-[10px] ${loved ? "text-white/80" : "text-dim"}`}
          >
            /5
          </span>
        </div>
      </div>

      <ScorePills scores={cafe.scores} />

      <div className="flex w-full flex-wrap justify-center gap-x-14 gap-y-4 py-2">
        {cafe.items.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <CupIcon type={item.type} fill={item.rating / 5} size={140} />
            <div className="flex items-center gap-2 font-display text-xl font-extrabold">
              {item.name}
              {item.star && <span className="text-[0.7em] text-amber">★</span>}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-dim">
              {whoLabel[item.who]}
            </div>
            <div className="font-display text-3xl font-extrabold">
              {item.rating.toFixed(1)}
              <small className="text-[0.4em] font-normal text-dim"> / 5</small>
            </div>
          </div>
        ))}
      </div>

      <p className="max-w-[760px] font-voice text-[clamp(17px,1.5vw,21px)] italic leading-relaxed">
        {cafe.verdict}
      </p>

      {cafe.photos.length > 0 && (
        <div className="no-scrollbar flex w-full snap-x justify-center gap-3 overflow-x-auto pb-2 [justify-content:safe_center]">
          {cafe.photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`${cafe.name} photo ${i + 1}`}
              className="h-[180px] w-[260px] flex-none snap-start rounded-xl border-[1.5px] border-line object-cover"
            />
          ))}
        </div>
      )}

      <div className="font-mono text-[10px] uppercase tracking-widest text-dim">
        Reviewed by <b className="text-amber">{SITE.reviewers.him}</b> &amp;{" "}
        <b className="text-amber">{SITE.reviewers.her}</b>
      </div>
    </main>
  );
}
