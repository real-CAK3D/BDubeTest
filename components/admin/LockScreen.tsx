"use client";
import { useState } from "react";

/** The PIN pad (or passcode box) that has to be passed before the login screen shows. */
export function LockScreen({ kind }: { kind: "pin" | "passcode" }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(value: string) {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/auth/unlock", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: value }) });
    if (res.ok) return window.location.reload();
    setErr((await res.json().catch(() => ({}))).error ?? "Wrong code.");
    setCode("");
    setBusy(false);
  }

  if (kind === "passcode")
    return (
      <form className="stack" onSubmit={(e) => (e.preventDefault(), send(code))}>
        <label className="f">
          <span>Passcode</span>
          <input type="password" value={code} onChange={(e) => setCode(e.target.value)} autoFocus required autoComplete="off" />
        </label>
        <button className="b b-primary b-block" disabled={busy}>{busy ? "Checking…" : "Unlock"}</button>
        {err ? <p className="err" role="alert">{err}</p> : null}
      </form>
    );

  const press = (d: string) => {
    if (busy) return;
    const next = (code + d).slice(0, 4);
    setCode(next);
    if (next.length === 4) send(next);
  };
  return (
    <div className="pinpad">
      <div className="pin-dots" aria-label={`${code.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => <span key={i} className={i < code.length ? "on" : ""} />)}
      </div>
      <div className="pin-keys">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => <button key={d} type="button" onClick={() => press(d)}>{d}</button>)}
        <span />
        <button type="button" onClick={() => press("0")}>0</button>
        <button type="button" aria-label="Delete" onClick={() => setCode(code.slice(0, -1))}>⌫</button>
      </div>
      {err ? <p className="err" role="alert">{err}</p> : null}
    </div>
  );
}
