"use client";
import { useEffect, useState } from "react";

export function LoginForm({ next }: { next: string }) {
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  // remember who uses this device, so the dashboard can show who's signed in
  useEffect(() => {
    try {
      setName(localStorage.getItem("admin:name") ?? "");
    } catch {}
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      localStorage.setItem("admin:name", name.trim());
    } catch {}
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: pw, name }) });
    if (res.ok) window.location.href = next;
    else {
      const data = await res.json().catch(() => ({}));
      if (data.locked) return window.location.reload();
      setErr(data.error ?? "Login failed.");
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="stack">
      <label className="f">
        <span>Your name <em className="muted">(shows which device is signed in)</em></span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} autoComplete="nickname" placeholder="e.g. Brandon" />
      </label>
      <label className="f">
        <span>Password</span>
        <input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus required />
      </label>
      <button className="b b-primary b-block" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      {err ? <p className="err" role="alert">{err}</p> : null}
    </form>
  );
}
