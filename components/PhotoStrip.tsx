"use client";

import Image from "next/image";

/** Centered horizontal filmstrip of photos. Renders nothing if empty. */
export default function PhotoStrip({
  photos,
  onOpen,
}: {
  photos: string[];
  onOpen: (index: number) => void;
}) {
  if (photos.length === 0) return null;

  return (
    <div className="no-scrollbar flex w-full max-w-full snap-x justify-center gap-2.5 overflow-x-auto px-0.5 pb-2 [justify-content:safe_center]">
      {photos.map((src, i) => (
        <button
          key={i}
          onClick={() => onOpen(i)}
          aria-label={`Enlarge photo ${i + 1}`}
          className="relative h-[168px] w-[126px] flex-none snap-start overflow-hidden rounded-xl border-[1.5px] border-line transition-transform hover:scale-[1.02]"
        >
          <Image
            src={src}
            alt={`Café photo ${i + 1}`}
            fill
            sizes="126px"
            className="object-cover"
          />
        </button>
      ))}
    </div>
  );
}
