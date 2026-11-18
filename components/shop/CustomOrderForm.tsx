"use client";
import { useRef, useState } from "react";
import { shrink } from "@/lib/shrink-image";

type Photo = { blob: Blob; url: string };

export function CustomOrderForm({ types, about }: { types: string[]; about: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [num, setNum] = useState(0);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function pick(files: FileList | null) {
    if (!files) return;
    setErr("");
    const room = 3 - photos.length;
    const next: Photo[] = [];
    for (const f of Array.from(files).slice(0, room)) {
      try {
        const blob = await shrink(f, 1600);
        next.push({ blob, url: URL.createObjectURL(blob) });
      } catch (e) {
        setErr((e as Error).message);
      }
    }
    setPhotos((p) => [...p, ...next]);
  }

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setState("sending");
    const form = new FormData(e.currentTarget);
    form.delete("photo-input");
    photos.forEach((p, i) => form.append("photos", new File([p.blob], `ref-${i + 1}.${p.blob.type === "image/png" ? "png" : "jpg"}`, { type: p.blob.type || "image/jpeg" })));
    const res = await fetch("/api/custom-order", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setNum(data.number ?? 0);
      setState("sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setErr(data.error ?? "That didn't send. Please try again.");
      setState("idle");
    }
  }

  if (state === "sent")
    return (
      <div className="form-done" role="status">
        <p>Thanks! Your request{num ? ` (#${num})` : ""} has been sent.</p>
        <p className="muted">We&apos;ll look it over and email you, usually within a few days, with a price or any questions. Nothing is charged until you agree to a quote.</p>
      </div>
    );

  const today = new Date().toISOString().slice(0, 10);
  return (
    <form className="review-form custom-form" onSubmit={send}>
      <label className="field"><span>Your name</span><input name="name" required maxLength={80} autoComplete="name" /></label>
      <label className="field"><span>Email</span><input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
      <label className="field"><span>Phone <em>(optional)</em></span><input name="phone" type="tel" maxLength={40} autoComplete="tel" /></label>
      <label className="field"><span>ZIP code <em>(for shipping)</em></span><input name="zip" inputMode="numeric" maxLength={10} autoComplete="postal-code" /></label>
      <label className="field">
        <span>What kind of piece?</span>
        <select name="kind" defaultValue={types.find((t) => about.toLowerCase().includes(t.toLowerCase())) ?? ""}>
          <option value="">Choose one</option>
          {types.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="field"><span>How many?</span><input name="quantity" type="number" min={1} max={10000} defaultValue={1} /></label>
      <label className="field full">
        <span>Tell us what you have in mind</span>
        <textarea name="details" required rows={6} maxLength={4000} defaultValue={about ? `Something like: ${about}\n\n` : ""} placeholder="Size, colors, materials, who it's for, and anything else that helps." />
      </label>
      <label className="field full"><span>Words or names to engrave <em>(optional)</em></span><textarea name="engraving" rows={2} maxLength={500} placeholder="Spell it exactly how you want it." /></label>
      <label className="field"><span>Needed by <em>(optional)</em></span><input name="neededBy" type="date" min={today} /></label>
      <label className="field"><span>Budget <em>(optional)</em></span><input name="budget" maxLength={60} placeholder="e.g. around $60 each" /></label>
      <div className="field full">
        <span>Reference photos or logos <em>(up to 3, optional)</em></span>
        <div className="photo-pick">
          {photos.map((p, i) => (
            <span key={p.url} className="thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Reference ${i + 1}`} />
              <button type="button" className="linkish" onClick={() => setPhotos((l) => l.filter((x) => x !== p))}>Remove</button>
            </span>
          ))}
          {photos.length < 3 ? <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>Add a photo</button> : null}
        </div>
        <input ref={fileRef} name="photo-input" type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden />
      <button className="btn btn-lg" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send request"}</button>
      {err ? <p className="error full" role="alert">{err}</p> : null}
    </form>
  );
}
