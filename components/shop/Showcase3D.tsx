"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type ShowcaseItem = { title: string; image: string; href: string };

/*
 * A ring of photos in 3D that slowly turns. Drag or swipe to spin it, tap a
 * photo to open it. Stops moving for people who ask for reduced motion.
 */
export function Showcase3D({ items, label }: { items: ShowcaseItem[]; label: string }) {
  const ring = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  const paused = useRef(false);
  const [cardW, setCardW] = useState(240);
  const [front, setFront] = useState(0);
  const n = items.length;
  const step = 360 / n;
  const radius = Math.round((cardW * 0.62) / Math.tan(Math.PI / Math.max(n, 3))) + 30;

  useEffect(() => {
    const fit = () => setCardW(window.innerWidth < 560 ? 150 : window.innerWidth < 900 ? 200 : 240);
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      if (!still && !paused.current && !drag.current) angle.current -= dt * 0.012;
      if (ring.current) ring.current.style.transform = `translateZ(${-radius}px) rotateY(${angle.current}deg)`;
      const idx = ((Math.round(-angle.current / step) % n) + n) % n;
      setFront((f) => (f === idx ? f : idx));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [radius, step, n]);

  if (n < 3) return null;

  const turn = (dir: number) => {
    angle.current = Math.round(angle.current / step) * step - dir * step;
  };

  return (
    <div
      className="showcase"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, start: angle.current, moved: false };
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        if (Math.abs(dx) > 4) drag.current.moved = true;
        angle.current = drag.current.start + dx * 0.35;
      }}
      onPointerUp={() => setTimeout(() => (drag.current = null), 0)}
      onPointerCancel={() => (drag.current = null)}
      style={{ ["--card-w" as string]: `${cardW}px` }}
    >
      <div className="showcase-stage">
        <div className="showcase-ring" ref={ring}>
          {items.map((it, i) => (
            <Link
              key={it.href + i}
              href={it.href}
              className={`showcase-card ${i === front ? "front" : ""}`}
              style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)` }}
              tabIndex={i === front ? 0 : -1}
              aria-hidden={i === front ? undefined : true}
              draggable={false}
              onClick={(e) => drag.current?.moved && e.preventDefault()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.image} alt="" draggable={false} loading="lazy" />
              <span>{it.title}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="showcase-controls">
        <button type="button" onClick={() => turn(-1)} aria-label="Previous piece">‹</button>
        <span aria-live="polite">{items[front]?.title}</span>
        <button type="button" onClick={() => turn(1)} aria-label="Next piece">›</button>
      </div>
    </div>
  );
}
