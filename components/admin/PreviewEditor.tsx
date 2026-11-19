"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { Design, ProductPreview, Shape3D } from "@/lib/types";
import { uploadFile, uploadImage } from "./api";
import { ImageList } from "./ImageField";
import { SpinCapture } from "./SpinCapture";

const Viewer3D = dynamic(() => import("@/components/shop/Viewer3D").then((m) => m.Viewer3D), { ssr: false });

const SHAPES: { id: Shape3D; label: string }[] = [
  { id: "tumbler", label: "Tumbler" },
  { id: "mug", label: "Mug" },
  { id: "sign", label: "Sign / plank" },
  { id: "round", label: "Round coaster" },
  { id: "square", label: "Square coaster / tile" },
  { id: "card", label: "Card holder / box" },
];

/*
 * Extra ways for customers to see an item: the chosen design on a photo,
 * a 3D model wearing the design, a 3D scan of the real piece, a 360° spin.
 */
export function PreviewEditor({ value, onChange, photos, library }: { value: ProductPreview | null; onChange: (v: ProductPreview | null) => void; photos: string[]; library: Design[] }) {
  const pv = value ?? {};
  const up = (patch: Partial<ProductPreview>) => {
    const next = { ...pv, ...patch };
    (Object.keys(next) as (keyof ProductPreview)[]).forEach((k) => (next[k] === undefined || next[k] === null || next[k] === "") && delete next[k]);
    onChange(Object.keys(next).length ? next : null);
  };
  const sample = library.find((d) => d.active)?.image;
  const [busy, setBusy] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [err, setErr] = useState("");
  const pickRef = useRef<HTMLInputElement>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  // drawing the design box on the photo
  const imgBox = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const at = (e: React.PointerEvent) => {
    const r = imgBox.current!.getBoundingClientRect();
    return { x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)), y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)) };
  };
  const m = pv.mockup;

  async function upload(file: File | undefined, kind: "photo" | "scan") {
    if (!file) return;
    setErr("");
    setBusy(kind === "scan" ? "Uploading the 3D scan…" : "Uploading…");
    try {
      if (kind === "scan") up({ model: await uploadFile(file, "models") });
      else up({ mockup: { image: await uploadImage(file, "products"), x: 30, y: 30, w: 40, h: 35 } });
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy("");
  }

  return (
    <>
      <h2>Previews</h2>
      <p className="hint">Extra ways for customers to see the item. All optional; each one adds a tab above the photos.</p>
      {err ? <p className="err">{err}</p> : null}
      {busy ? <p className="hint">{busy}</p> : null}

      <h3 className="sub">Design on a photo</h3>
      <p className="hint">Pick a photo of the plain item, then drag across it to mark where the design goes. Customers see the design they pick drawn there.</p>
      <div className="row wrap">
        {photos.map((u) => (
          <button key={u} type="button" className={`thumb-pick ${m?.image === u ? "on" : ""}`} onClick={() => up({ mockup: { image: u, x: m?.x ?? 30, y: m?.y ?? 30, w: m?.w ?? 40, h: m?.h ?? 35 } })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" />
          </button>
        ))}
        <button type="button" className="b b-sm" onClick={() => pickRef.current?.click()}>Upload a photo</button>
        {m ? <button type="button" className="b b-ghost b-sm" onClick={() => up({ mockup: null })}>Remove</button> : null}
        <input ref={pickRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0], "photo")} />
      </div>
      {m ? (
        <div
          ref={imgBox}
          className="mock-edit"
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            start.current = at(e);
          }}
          onPointerMove={(e) => {
            if (!start.current) return;
            const b = at(e);
            const s = start.current;
            up({ mockup: { ...m, x: Math.min(s.x, b.x), y: Math.min(s.y, b.y), w: Math.max(2, Math.abs(b.x - s.x)), h: Math.max(2, Math.abs(b.y - s.y)) } });
          }}
          onPointerUp={() => (start.current = null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.image} alt="" draggable={false} />
          <span className="mock-rect" style={{ left: `${m.x}%`, top: `${m.y}%`, width: `${m.w}%`, height: `${m.h}%` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {sample ? <img src={sample} alt="" draggable={false} /> : null}
          </span>
        </div>
      ) : null}

      <h3 className="sub">3D model</h3>
      <p className="hint">The site draws a 3D version of the item that customers can turn, wearing the design they pick. Choose the closest shape.</p>
      <div className="row2">
        <label className="f">
          <span>Shape</span>
          <select value={pv.shape ?? ""} onChange={(e) => up({ shape: (e.target.value || null) as Shape3D | null, color: pv.color ?? "#2b2f36" })}>
            <option value="">None</option>
            {SHAPES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        {pv.shape === "tumbler" || pv.shape === "mug" ? (
          <label className="f"><span>Color</span><input type="color" value={pv.color ?? "#2b2f36"} onChange={(e) => up({ color: e.target.value })} /></label>
        ) : null}
      </div>
      {pv.shape ? (
        <div className="mini-3d">
          <Viewer3D shape={pv.shape} color={pv.color ?? "#2b2f36"} design={sample} label="3D preview" />
        </div>
      ) : null}

      <h3 className="sub">3D scan of the real piece</h3>
      <p className="hint">
        Scan the finished item with a phone app (Polycam or KIRI Engine work on both iPhone and Android; Scaniverse and Apple&apos;s Reality Composer on iPhone), export a <strong>.glb</strong> file under 4 MB, and upload it here.
        Customers can turn it, and on most phones see it on their own table. Bigger files: put them in the <code>public/models</code> folder on GitHub and paste <code>/models/name.glb</code>.
      </p>
      <div className="row wrap">
        <button type="button" className="b b-sm" onClick={() => scanRef.current?.click()}>Upload a .glb file</button>
        <input ref={scanRef} type="file" accept=".glb,model/gltf-binary" hidden onChange={(e) => upload(e.target.files?.[0], "scan")} />
        <input aria-label="Link to a .glb file" style={{ flex: "1 1 14rem" }} value={pv.model ?? ""} placeholder="or paste a link: /models/flag-case.glb" onChange={(e) => up({ model: e.target.value.trim() })} />
      </div>

      <h3 className="sub">360° spin</h3>
      <p className="hint">Put the item on a lazy Susan and let the phone take the photos while you turn it. Works on iPhone and Android. Or add photos you took yourself, in order.</p>
      {capturing ? (
        <SpinCapture onDone={(spin) => { up({ spin }); setCapturing(false); }} onClose={() => setCapturing(false)} />
      ) : (
        <div><button type="button" className="b b-sm" onClick={() => setCapturing(true)}>Take 360° photos with the camera</button></div>
      )}
      <ImageList value={pv.spin ?? []} onChange={(spin) => up({ spin })} folder="spin" />
      {pv.spin?.length && pv.spin.length < 4 ? <p className="hint">Add at least 4 photos for the spin to show.</p> : null}
    </>
  );
}
