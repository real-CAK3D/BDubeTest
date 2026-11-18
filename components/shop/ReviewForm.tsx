"use client";
import { useRef, useState } from "react";
import { shrink } from "@/lib/shrink-image";

export function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function pick(f: File | undefined) {
    if (!f) return;
    setErr("");
    try {
      const blob = await shrink(f, 1600);
      setPhoto({ blob, url: URL.createObjectURL(blob) });
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setState("sending");
    const form = new FormData(e.currentTarget);
    form.set("rating", String(rating));
    form.delete("photo-input");
    if (photo) form.set("photo", new File([photo.blob], photo.blob.type === "image/png" ? "review.png" : "review.jpg", { type: photo.blob.type || "image/jpeg" }));
    const res = await fetch("/api/reviews", { method: "POST", body: form });
    if (res.ok) setState("sent");
    else {
      setErr((await res.json().catch(() => ({}))).error ?? "That didn't send. Please try again.");
      setState("idle");
    }
  }

  if (state === "sent")
    return (
      <div className="form-done" role="status">
        <p>Thank you! Your review has been sent.</p>
        <p className="muted">It will show on the site once it&apos;s been checked, usually within a day or two.</p>
      </div>
    );

  return (
    <form className="review-form" onSubmit={send}>
      <fieldset className="stars-pick">
        <legend>Your rating</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={n <= rating ? "on" : ""}>
            <input type="radio" name="rating-pick" value={n} checked={rating === n} onChange={() => setRating(n)} />
            <span aria-hidden>★</span>
            <span className="sr">{n} star{n === 1 ? "" : "s"}</span>
          </label>
        ))}
      </fieldset>
      <label className="field"><span>Your name</span><input name="name" required maxLength={60} autoComplete="given-name" placeholder="First name is fine" /></label>
      <label className="field"><span>Where you&apos;re from <em>(optional)</em></span><input name="location" maxLength={60} placeholder="e.g. Lawton, OK" /></label>
      <label className="field full"><span>What did you get? <em>(optional)</em></span><input name="item" maxLength={80} placeholder="e.g. Memorial flag case" /></label>
      <label className="field full"><span>Your review</span><textarea name="text" required rows={5} maxLength={1500} placeholder="How did it turn out? Who was it for?" /></label>
      <div className="field full">
        <span>Add a photo <em>(optional)</em></span>
        <div className="photo-pick">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.url} alt="Your photo" />
          ) : null}
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>{photo ? "Choose a different photo" : "Choose or take a photo"}</button>
          {photo ? <button type="button" className="linkish" onClick={() => setPhoto(null)}>Remove</button> : null}
        </div>
        <input ref={fileRef} name="photo-input" type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden />
      <p className="muted small full">By sending a review you agree it can be shown on this site, as described in our terms.</p>
      <button className="btn btn-lg" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send review"}</button>
      {err ? <p className="error full" role="alert">{err}</p> : null}
    </form>
  );
}
