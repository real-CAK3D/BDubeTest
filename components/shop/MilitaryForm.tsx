"use client";
import { useState } from "react";

const GROUPS = ["Veteran", "Active duty", "National Guard / Reserve", "Military spouse / Gold Star family", "Police", "Firefighter", "EMT / Paramedic", "Other first responder"];

/** Ask for the discount (he checks and emails a code), or, if he shares one code, show it on an honor basis. */
export function MilitaryForm({ verify, code, percent }: { verify: boolean; code: string; percent: number }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState("");
  const [shown, setShown] = useState(false);

  if (!verify)
    return code ? (
      <div className="code-box">
        <label className="check-sm"><input type="checkbox" checked={shown} onChange={(e) => setShown(e.target.checked)} /> I&apos;m a veteran, serving, or a first responder</label>
        {shown ? (
          <>
            <code>{code}</code>
            <p className="muted small">Type it in the promo code box on the checkout page for {percent}% off.</p>
          </>
        ) : null}
      </div>
    ) : (
      <p className="muted">Contact us and we&apos;ll set you up with a code.</p>
    );

  if (state === "sent")
    return (
      <div className="form-done" role="status">
        <p>Thank you for your service. We&apos;ll email your code soon.</p>
      </div>
    );

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setState("sending");
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/military", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(f)) });
    if (res.ok) setState("sent");
    else {
      setErr((await res.json().catch(() => ({}))).error ?? "That didn't send. Please try again.");
      setState("idle");
    }
  }
  return (
    <form className="review-form" onSubmit={send}>
      <label className="field"><span>Your name</span><input name="name" required maxLength={80} autoComplete="name" /></label>
      <label className="field"><span>Email (your code goes here)</span><input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
      <label className="field full">
        <span>I am</span>
        <select name="group" required defaultValue="">
          <option value="" disabled>Choose one</option>
          {GROUPS.map((g) => <option key={g}>{g}</option>)}
        </select>
      </label>
      <label className="field full"><span>Anything to add <em>(optional)</em></span><textarea name="note" rows={3} maxLength={500} placeholder="Branch, unit or department, years served..." /></label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden />
      <p className="muted small full">Please don&apos;t send photos of IDs. We may ask a question or two before sending your code.</p>
      <button className="btn btn-lg" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Request my code"}</button>
      {err ? <p className="error full" role="alert">{err}</p> : null}
    </form>
  );
}
