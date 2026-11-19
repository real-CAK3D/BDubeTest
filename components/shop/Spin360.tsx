"use client";
import { useEffect, useRef, useState } from "react";

/** Photos taken all the way around the item, played as you drag: a 360° turn of the real piece. */
export function Spin360({ frames, label }: { frames: string[]; label: string }) {
  const [i, setI] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const drag = useRef<{ x: number; i: number } | null>(null);
  const [auto, setAuto] = useState(true);
  const n = frames.length;

  // load every frame first so turning is smooth
  useEffect(() => {
    let count = 0;
    frames.forEach((f) => {
      const img = new Image();
      img.onload = img.onerror = () => setLoaded(++count);
      img.src = f;
    });
  }, [frames]);

  useEffect(() => {
    if (!auto || loaded < n || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 120);
    return () => clearInterval(t);
  }, [auto, loaded, n]);

  return (
    <div className="viewer3d spin360">
      <div
        className="viewer3d-stage"
        role="img"
        aria-label={`${label}, 360 degree view`}
        onPointerDown={(e) => {
          setAuto(false);
          drag.current = { x: e.clientX, i };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const step = Math.round((e.clientX - drag.current.x) / 12);
          setI((((drag.current.i - step) % n) + n) % n);
        }}
        onPointerUp={() => (drag.current = null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={frames[i]} alt="" draggable={false} />
      </div>
      {loaded < n ? <p className="viewer-note">Loading {Math.round((loaded / n) * 100)}%</p> : null}
      <div className="viewer-controls">
        <button type="button" onClick={() => (setAuto(false), setI((i - 1 + n) % n))} aria-label="Turn left">‹</button>
        <span>Drag to turn</span>
        <button type="button" onClick={() => (setAuto(false), setI((i + 1) % n))} aria-label="Turn right">›</button>
      </div>
    </div>
  );
}
