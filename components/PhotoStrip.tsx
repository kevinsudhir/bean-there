"use client";

/** Centered horizontal filmstrip of photos. Renders nothing if empty. */
export default function PhotoStrip({
  photos,
  onOpen,
}: {
  photos: string[];
  onOpen: (src: string) => void;
}) {
  if (photos.length === 0) return null;

  return (
    <div className="no-scrollbar flex w-full max-w-full snap-x justify-center gap-2.5 overflow-x-auto px-0.5 pb-2 [justify-content:safe_center]">
      {photos.map((src, i) => (
        <button
          key={i}
          onClick={() => onOpen(src)}
          aria-label={`Enlarge photo ${i + 1}`}
          className="h-[112px] w-[170px] flex-none snap-start rounded-xl border-[1.5px] border-line bg-cover bg-center transition-transform hover:scale-[1.02]"
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}
    </div>
  );
}
