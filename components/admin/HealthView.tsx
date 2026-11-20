"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Check } from "@/lib/health";
import { CopyButton } from "./CopyButton";

const ICON = { ok: "✓", warn: "!", bad: "✕" } as const;

/** Dashboard > Site health: what's working, backups, and how to get told if the site goes down. */
export function HealthView({ checks, backup, healthUrl }: { checks: Check[]; backup: { at: string; ok: boolean; message: string } | null; healthUrl: string }) {
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");
  const bad = checks.filter((c) => c.level === "bad").length;
  const warn = checks.filter((c) => c.level === "warn").length;

  async function toGitHub() {
    setBusy("gh");
    const r = await fetch("/api/admin/backup?to=github", { method: "POST" }).then((x) => x.json()).catch(() => ({ message: "Couldn't reach the server." }));
    setMsg(r.message ?? r.error);
    setBusy("");
    router.refresh();
  }
  async function restore(f: File | undefined) {
    if (!f) return;
    if (!confirm(`Put back everything from "${f.name}"? What's saved now is replaced by the backup's copy (orders, items, settings...). Download a backup of now first if you're not sure.`)) return;
    setBusy("restore");
    try {
      const r = await fetch("/api/admin/backup", { method: "POST", headers: { "content-type": "application/json" }, body: await f.text() }).then((x) => x.json());
      setMsg(r.message ?? r.error);
    } catch {
      setMsg("That file couldn't be read.");
    }
    setBusy("");
    if (file.current) file.current.value = "";
  }

  return (
    <>
      <div className="page-head">
        <h1>Site health</h1>
        <span className={`pill ${bad ? "s-refunded" : warn ? "s-paid" : "s-shipped"}`}>{bad ? `${bad} problem${bad > 1 ? "s" : ""}` : warn ? `${warn} thing${warn > 1 ? "s" : ""} to look at` : "All good"}</span>
      </div>
      <p className="muted lead">Checked when you open this page and every day by itself. If something important breaks, your phone gets a notification.</p>

      <section className="panel">
        <ul className="health-list">
          {checks.map((c) => (
            <li key={c.id} className={`h-${c.level}`}>
              <span className="h-icon" aria-label={c.level}>{ICON[c.level]}</span>
              <div>
                <strong>{c.label}</strong>
                <p>{c.detail}</p>
                {c.fix ? <p className="muted small">{c.fix}{c.href ? <> <a href={c.href}>Go there</a></> : null}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel stack">
        <h2>Backups</h2>
        <p>A backup is a copy of everything the shop has saved: settings, items, orders, customers, codes, gift cards. Customer details stay locked inside, so it only opens on this site.</p>
        <p className="muted small">{backup ? `Last automatic backup: ${new Date(backup.at).toLocaleString("en-US")} (${backup.message})` : "No automatic backup yet."}</p>
        <div className="row wrap">
          <a className="b b-primary" href="/api/admin/backup">Download a backup</a>
          <button className="b" onClick={toGitHub} disabled={busy === "gh"}>{busy === "gh" ? "Saving…" : "Save a copy to GitHub now"}</button>
          <label className="b b-ghost">
            {busy === "restore" ? "Putting it back…" : "Put back a backup…"}
            <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => restore(e.target.files?.[0])} />
          </label>
        </div>
        <p className="muted small">Automatic: once a week a locked copy is saved to your GitHub repository, if the repository is private. Keep a downloaded copy somewhere safe too (Google Drive, iCloud, a USB stick) once a month.</p>
        {msg ? <p role="status"><strong>{msg}</strong></p> : null}
      </section>

      <section className="panel stack">
        <h2>Get told if the site goes down</h2>
        <p>The daily check can&apos;t run if the whole site is down, so use a free outside service that checks every 5 minutes and texts or emails you:</p>
        <ol className="steps-list">
          <li>Make a free account at <a href="https://uptimerobot.com" target="_blank" rel="noreferrer">uptimerobot.com</a>.</li>
          <li>Add New Monitor › HTTP(s), and paste this address: <code>{healthUrl}</code> <CopyButton text={healthUrl} /></li>
          <li>Every 5 minutes. Under alert contacts add your email, and the UptimeRobot phone app for push alerts (text messages are a paid extra).</li>
        </ol>
        <p className="muted small">That address answers &ldquo;ok&rdquo; when the shop is up and can save orders, and an error if not. It shows nothing private.</p>
      </section>
    </>
  );
}
