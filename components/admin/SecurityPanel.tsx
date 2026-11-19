"use client";
import { useEffect, useState } from "react";
import type { AdminSession, LockInfo } from "@/lib/admin-security";
import { api } from "./api";

type Account = { id: string; name: string; email: string; lastLogin?: string; mustChange: boolean };
type Data = { lock: LockInfo; sessions: AdminSession[]; me: string | null; shared?: boolean; accounts: Account[]; invite?: number };
const ONLINE_MS = 5 * 60_000;
const ago = (iso: string) => {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} days ago`;
};

/** Lock code in front of the login screen, and every device signed in to the dashboard. */
export function SecurityPanel() {
  const [d, setD] = useState<Data | null>(null);
  const [kind, setKind] = useState<"pin" | "passcode">("pin");
  const [code, setCode] = useState("");
  const [again, setAgain] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api<Data>("/api/admin/security", "GET").then(setD).catch((e) => setErr(e.message));
  }, []);

  async function act(body: Record<string, unknown>, done: string) {
    setErr("");
    setMsg("");
    try {
      const r = await api<Data>("/api/admin/security", "POST", body);
      setD(r);
      setMsg(done);
      setCode("");
      setAgain("");
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  if (!d) return <p className="muted">{err || "Loading…"}</p>;
  const online = d.sessions.filter((s) => Date.now() - Date.parse(s.lastSeen) < ONLINE_MS).length;
  return (
    <>
      {d.shared === false ? (
        <p className="alert">Connect Supabase first (Setup, step 4). Until then the lock screen, the device list and signing devices out can&apos;t be relied on, because the site has nowhere permanent to remember them.</p>
      ) : null}
      <section className="panel stack">
        <div className="panel-head"><h2>Lock screen</h2><span className={`pill ${d.lock.on ? "s-shipped" : ""}`}>{d.lock.on ? "On" : "Off"}</span></div>
        <p className="hint">
          Adds a {kind === "pin" ? "4-digit PIN" : "passcode"} that has to be entered before the password box even shows. Five wrong tries lock it for 15 minutes. Anyone already signed in stays signed in.
        </p>
        <div className="seg">
          <button type="button" className={kind === "pin" ? "on" : ""} onClick={() => setKind("pin")}>4-digit PIN</button>
          <button type="button" className={kind === "passcode" ? "on" : ""} onClick={() => setKind("passcode")}>Passcode</button>
        </div>
        <div className="row2">
          <label className="f"><span>{d.lock.on ? "New " : ""}{kind === "pin" ? "PIN" : "Passcode"}</span><input type="password" inputMode={kind === "pin" ? "numeric" : "text"} maxLength={kind === "pin" ? 4 : 60} value={code} onChange={(e) => setCode(kind === "pin" ? e.target.value.replace(/\D/g, "") : e.target.value)} autoComplete="new-password" /></label>
          <label className="f"><span>Again</span><input type="password" inputMode={kind === "pin" ? "numeric" : "text"} maxLength={kind === "pin" ? 4 : 60} value={again} onChange={(e) => setAgain(kind === "pin" ? e.target.value.replace(/\D/g, "") : e.target.value)} autoComplete="new-password" /></label>
        </div>
        <div className="row wrap">
          <button className="b b-primary" disabled={!code || code !== again} onClick={() => act({ action: "lock", kind, code }, d.lock.on ? "Lock code changed." : "Lock screen turned on.")}>{d.lock.on ? "Change lock code" : "Turn on lock screen"}</button>
          {d.lock.on ? <button className="b b-ghost" onClick={() => confirm("Turn the lock screen off?") && act({ action: "unlock" }, "Lock screen turned off.")}>Turn off</button> : null}
          {code && again && code !== again ? <span className="err">The two don&apos;t match.</span> : null}
        </div>
        <p className="hint">Write the code down somewhere safe. Forgot it? Anyone already signed in can turn it off here.</p>
      </section>

      <section className="panel stack">
        <div className="panel-head"><h2>People who can sign in</h2></div>
        <p className="hint">Each person signs in with their own name and password. Someone new signs in with the <strong>starter password</strong> once and then chooses their own. Once two of you have your own passwords, new names can only sign in while you let them:</p>
        <div className="row wrap">
          {d.invite ? (
            <>
              <span className="pill s-paid" style={{ textTransform: "none" }}>New people can sign in until {new Date(d.invite).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}</span>
              <button className="b b-ghost b-sm" onClick={() => act({ action: "invite", close: true }, "Closed. Only the people below can sign in.")}>Close it now</button>
            </>
          ) : (
            <button className="b b-sm" onClick={() => act({ action: "invite" }, "For the next 24 hours, someone new can sign in with their name and the starter password.")}>Let someone new sign in (24 hours)</button>
          )}
        </div>
        {d.accounts.length ? (
          <ul className="rows devices">
            {d.accounts.map((a) => (
              <li key={a.id}>
                <span><strong>{a.name}</strong> <span className="muted small">· {a.mustChange ? "reset: signs in next with the starter password" : a.lastLogin ? `last signed in ${ago(a.lastLogin)}` : "not signed in yet"}</span></span>
                <input type="email" className="small-input" defaultValue={a.email} placeholder="email for resets" onBlur={(e) => e.target.value !== a.email && act({ action: "email", id: a.id, email: e.target.value }, "Email saved.")} aria-label={`${a.name}'s email`} />
                <button className="b b-ghost b-sm" onClick={() => confirm(`Reset ${a.name}'s password? They'll sign in with the starter password and choose a new one.`) && act({ action: "resetAccount", id: a.id }, `${a.name} can now sign in with the starter password.`)}>Reset password</button>
                <button className="b b-danger b-sm" onClick={() => confirm(`Remove ${a.name}? They can't sign in any more (unless they use the starter password again).`) && act({ action: "removeAccount", id: a.id }, `${a.name} removed.`)}>Remove</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nobody has chosen their own password yet.</p>
        )}
        <StarterPassword />
      </section>

      <section className="panel stack">
        <div className="panel-head"><h2>Signed-in devices</h2><span className="muted small">{online} active now</span></div>
        <ul className="rows devices">
          {d.sessions.map((s) => {
            const live = Date.now() - Date.parse(s.lastSeen) < ONLINE_MS;
            return (
              <li key={s.id}>
                <span className={`dot ${live ? "live" : ""}`} aria-label={live ? "Active now" : "Not active"} />
                <span><strong>{s.name}</strong> <span className="muted">· {s.device}{s.id === d.me ? " · this device" : ""}</span></span>
                <span className="muted small">{live ? "active now" : ago(s.lastSeen)}</span>
                {s.id !== d.me ? <button className="b b-ghost b-sm" onClick={() => confirm(`Sign out ${s.name} on ${s.device}?`) && act({ action: "signout", id: s.id }, "Signed out.")}>Sign out</button> : null}
              </li>
            );
          })}
        </ul>
        {d.sessions.length > 1 ? <button className="b b-sm" onClick={() => confirm("Sign out every other device?") && act({ action: "signoutOthers" }, "Every other device is signed out.")}>Sign out all other devices</button> : null}
        <p className="hint">Lost a phone? Sign it out here; it needs the password again.</p>
      </section>
      {msg ? <p className="alert" role="status">{msg}</p> : null}
      {err ? <p className="err" role="alert">{err}</p> : null}
    </>
  );
}

function StarterPassword() {
  const [f, setF] = useState({ current: "", next: "" });
  const [msg, setMsg] = useState("");
  async function save() {
    try {
      const r = await api<{ message: string }>("/api/admin/password", "POST", { kind: "starter", ...f });
      setMsg(r.message);
      setF({ current: "", next: "" });
    } catch (e) {
      setMsg((e as Error).message);
    }
  }
  return (
    <details>
      <summary className="small">Change the starter password</summary>
      <div className="row2" style={{ marginTop: "0.6rem" }}>
        <label className="f"><span>Current starter password</span><input type="password" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} /></label>
        <label className="f"><span>New starter password</span><input type="password" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} /></label>
      </div>
      <div className="row"><button className="b b-sm" disabled={!f.current || !f.next} onClick={save}>Change starter password</button>{msg ? <span className="small">{msg}</span> : null}</div>
    </details>
  );
}
