"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { Gallery } from "./Gallery";

// the 3D parts load only when someone opens them
const Viewer3D = dynamic(() => import("./Viewer3D").then((m) => m.Viewer3D), { ssr: false });
const ModelView = dynamic(() => import("./ModelView").then((m) => m.ModelView), { ssr: false });
const Spin360 = dynamic(() => import("./Spin360").then((m) => m.Spin360), { ssr: false });

export type DesignPick = { productId: string; image?: string; name?: string };
export const DESIGN_EVENT = "design-pick";

type View = "photos" | "mockup" | "3d" | "scan" | "spin";

/** The item's photos plus any extra views: the chosen design on a photo, 3D, a 3D scan, a 360° spin. */
export function ProductViews({ p }: { p: Product }) {
  const pv = p.preview;
  const [view, setView] = useState<View>("photos");
  const [design, setDesign] = useState<{ image?: string; name?: string }>({});

  // AddToCart tells us which design was picked
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<DesignPick>).detail;
      if (d.productId !== p.id) return;
      setDesign({ image: d.image, name: d.name });
      if (d.image) setView((v) => (v === "photos" && pv?.mockup ? "mockup" : v === "photos" && pv?.shape ? "3d" : v));
    };
    window.addEventListener(DESIGN_EVENT, on);
    return () => window.removeEventListener(DESIGN_EVENT, on);
  }, [p.id, pv]);

  const tabs: { id: View; label: string }[] = [
    { id: "photos", label: "Photos" },
    ...(pv?.mockup ? [{ id: "mockup" as const, label: "Preview" }] : []),
    ...(pv?.shape ? [{ id: "3d" as const, label: "3D" }] : []),
    ...(pv?.model ? [{ id: "scan" as const, label: "3D scan" }] : []),
    ...(pv?.spin?.length ? [{ id: "spin" as const, label: "360°" }] : []),
  ];
  if (tabs.length === 1) return <Gallery p={p} />;

  return (
    <div className="views">
      <div className="view-tabs" role="tablist" aria-label="Ways to see this item">
        {tabs.map((t) => (
          <button key={t.id} role="tab" type="button" aria-selected={view === t.id} className={view === t.id ? "on" : ""} onClick={() => setView(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {view === "photos" ? <Gallery p={p} /> : null}
      {view === "mockup" && pv?.mockup ? (
        <div className="mockup">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pv.mockup.image} alt={p.name} />
          {design.image ? (
            <span className="mockup-box" style={{ left: `${pv.mockup.x}%`, top: `${pv.mockup.y}%`, width: `${pv.mockup.w}%`, height: `${pv.mockup.h}%` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={design.image} alt={design.name ?? "Chosen design"} />
            </span>
          ) : (
            <p className="viewer-note">Pick a design to see it here.</p>
          )}
        </div>
      ) : null}
      {view === "3d" && pv?.shape ? <Viewer3D shape={pv.shape} color={pv.color ?? "#2b2f36"} design={design.image} label={`${p.name} in 3D`} /> : null}
      {view === "scan" && pv?.model ? <ModelView src={pv.model} poster={p.images[0]} label={`${p.name}, 3D scan`} /> : null}
      {view === "spin" && pv?.spin ? <Spin360 frames={pv.spin} label={p.name} /> : null}
      {view !== "photos" ? <p className="muted small view-note">{view === "mockup" || view === "3d" ? "A preview to help you choose. Each piece is made by hand, so the real one will vary a little." : null}</p> : null}
    </div>
  );
}
