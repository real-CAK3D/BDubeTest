"use client";
import Link from "next/link";
import { useState } from "react";
import type { SyncStatus } from "@/lib/github-sync";
import { api } from "./api";

export function GitHubSave({ token, last }: { token: boolean; last: SyncStatus | null }) {
  const [st, setSt] = useState(last);
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try {
      const r = await api<{ message: string }>("/api/admin/github", "POST");
      setSt({ at: new Date().toISOString(), ok: true, message: r.message });
    } catch (e) {
      setSt({ at: new Date().toISOString(), ok: false, message: (e as Error).message });
    }
    setBusy(false);
  }
  return (
    <div className="integ">
      <div className="integ-head"><strong>Saving edits to GitHub</strong><span className={`dot ${token && st?.ok ? "ok" : "no"}`}>{token ? (st?.ok ? "On" : "Check below") : "Needs a token"}</span></div>
      <p className="muted">Every save in the dashboard is also written to site-variables.ts on GitHub. {token ? "" : <>Add a GitHub token on the <Link href="/admin/keys">Accounts &amp; keys</Link> page first (Setup has the steps).</>}</p>
      {st ? <p className={st.ok ? "small" : "err small"}>{new Date(st.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}: {st.message}</p> : null}
      <div className="row wrap"><button className="b b-sm" onClick={run} disabled={!token || busy}>{busy ? "Saving…" : "Save to GitHub now"}</button></div>
    </div>
  );
}

