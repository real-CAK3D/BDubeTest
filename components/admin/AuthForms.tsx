"use client";
import { useState } from "react";

async function post(url: string, body: unknown) {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error ?? "Something went wrong.");
  return d as { message?: string };
}

/** Shown right after signing in with the starter password. */
export function ChoosePassword({ name }: { name: string }) {
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== again) return setErr("The two passwords don't match.");
    setBusy(true);
    setErr("");
    try {
      await post("/api/auth/choose-password", { password: pw, email });
      window.location.reload();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <form className="stack" onSubmit={save}>
      <p>Welcome, {name}! Choose your own password. From now on you&apos;ll sign in with your name and this password; the starter password won&apos;t work for you anymore.</p>
      <label className="f"><span>Your new password <em className="muted">(8+ characters)</em></span><input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} required autoFocus /></label>
      <label className="f"><span>Again</span><input type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} required /></label>
      <label className="f"><span>Your email <em className="muted">(optional, for resetting a forgotten password)</em></span><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <button className="b b-primary b-block" disabled={busy}>{busy ? "Saving…" : "Save and continue"}</button>
      {err ? <p className="err" role="alert">{err}</p> : null}
    </form>
  );
}

/** Forgot password: email link, or the owner reset code from Vercel. */
export function ForgotForm() {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"email" | "code">("email");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  async function send(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const r = await post("/api/auth/forgot", mode === "email" ? { name } : { name, code, password: pw });
      setMsg(r.message ?? "Done.");
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  return (
    <form className="stack" onSubmit={send}>
      <label className="f"><span>Your name</span><input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="nickname" /></label>
      {mode === "code" ? (
        <>
          <label className="f"><span>Owner reset code <em className="muted">(OWNER_RESET_CODE in Vercel)</em></span><input type="password" value={code} onChange={(e) => setCode(e.target.value)} required /></label>
          <label className="f"><span>New password</span><input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} required /></label>
        </>
      ) : null}
      <button className="b b-primary b-block">{mode === "email" ? "Email me a reset link" : "Set new password"}</button>
      {msg ? <p role="status">{msg} <a href="/admin/login">Back to sign in</a></p> : null}
      {err ? <p className="err" role="alert">{err}</p> : null}
      <p className="muted small">
        Easiest: ask the other admin to tap <strong>Reset password</strong> next to your name in Settings &gt; Password &amp; security, then sign in with the starter password and choose a new one.
        {mode === "email" ? <> Or <button type="button" className="linkish" onClick={() => setMode("code")}>use the owner reset code</button>.</> : null}
      </p>
    </form>
  );
}

/** The page from the emailed link. */
export function ResetForm({ token }: { token: string }) {
  const [pw, setPw] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  async function send(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await post("/api/auth/reset", { token, password: pw });
      setDone(true);
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  if (done) return <p>Password changed. <a href="/admin/login">Sign in</a></p>;
  return (
    <form className="stack" onSubmit={send}>
      <label className="f"><span>New password <em className="muted">(8+ characters)</em></span><input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} required autoFocus /></label>
      <button className="b b-primary b-block">Set password</button>
      {err ? <p className="err" role="alert">{err}</p> : null}
    </form>
  );
}
