"use client";
import { useState } from "react";

/** Big photo with thumbnails; swipe left/right on phones. */
export function PhotoViewer({ photos, title }: { photos: string[]; title: string }) {
  const [i, setI] = useState(0);
  const [x0, setX0] = useState<number | null>(null);
  const go = (d: number) => setI((n) => (n + d + photos.length) % photos.length);
  return (
    <div className="gallery">
      <div
        className="gallery-main viewer"
        onTouchStart={(e) => setX0(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (x0 === null) return;
          const dx = e.changedTouches[0].clientX - x0;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          setX0(null);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[i]} alt={`${title}, photo ${i + 1} of ${photos.length}`} />
        {photos.length > 1 ? (
          <>
            <button type="button" className="viewer-btn prev" onClick={() => go(-1)} aria-label="Previous photo">‹</button>
            <button type="button" className="viewer-btn next" onClick={() => go(1)} aria-label="Next photo">›</button>
          </>
        ) : null}
      </div>
      {photos.length > 1 ? (
        <div className="gallery-thumbs">
          {photos.map((src, n) => (
            <button key={src} type="button" onClick={() => setI(n)} aria-label={`Photo ${n + 1}`} aria-pressed={n === i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
