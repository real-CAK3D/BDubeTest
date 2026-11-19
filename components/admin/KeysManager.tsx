"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { KeyStatus } from "@/lib/keys";
import { api } from "./api";
import { GitHubSave } from "./GitHubSave";
import { MyLinks, SavedLogins } from "./AccountsExtras";
import { Tabs } from "./Tabs";
import type { CustomLink } from "@/lib/types";
import type { SyncStatus } from "@/lib/github-sync";

const SOURCE: Record<KeyStatus["source"], string> = {
  vercel: "Set in Vercel",
  dashboard: "Saved here",
  unreadable: "Needs re-entering",
  missing: "Not set",
};

function KeyRow({ k, onDone }: { k: KeyStatus; onDone: (msg: string) => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(k.source === "missing" || k.source === "unreadable");

  async function run(action: "save" | "test" | "remove") {
    if (action === "remove" && !confirm(`Remove ${k.label}?`)) return;
    setBusy(action);
    setErr("");
    try {
      const r = await api<{ message: string }>("/api/admin/keys", "POST", { action, name: k.envName, value });
      if (action !== "test") setValue("");
      onDone(r.message);
      if (action === "save") setEditing(false);
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy("");
  }

  return (
    <li className="key-row">
      <div className="key-head">
        <div>
          <strong>{k.label}</strong>
          {!k.custom ? <code className="key-name">{k.envName}</code> : null}
        </div>
        <span className={`dot ${k.source === "vercel" || k.source === "dashboard" ? "ok" : "no"}`}>{SOURCE[k.source]}</span>
      </div>
      <p className="muted small">
        {k.where} {k.link ? <a href={k.link} target="_blank" rel="noreferrer">Open</a> : null}
      </p>
      {k.preview ? <p className="small"><code>{k.preview}</code></p> : null}
      {k.source === "vercel" ? (
        <p className="hint">This one is set in Vercel&apos;s environment variables, which take priority. Change it there.</p>
      ) : editing ? (
        <div className="key-edit">
          <input type={k.secret ? "password" : "text"} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Paste the key here" autoComplete="off" spellCheck={false} aria-label={k.label} />
          <button className="b b-primary b-sm" onClick={() => run("save")} disabled={!value || Boolean(busy)}>{busy === "save" ? "Checking…" : "Save"}</button>
          <button className="b b-sm" onClick={() => run("test")} disabled={!value || Boolean(busy)}>{busy === "test" ? "Testing…" : "Test"}</button>
          {k.source !== "missing" ? <button className="b b-ghost b-sm" onClick={() => setEditing(false)}>Cancel</button> : null}
        </div>
      ) : (
        <div className="row wrap">
          <button className="b b-sm" onClick={() => setEditing(true)}>Replace</button>
          <button className="b b-ghost b-sm" onClick={() => run("remove")} disabled={Boolean(busy)}>Remove</button>
        </div>
      )}
      {err ? <p className="err" role="alert">{err}</p> : null}
    </li>
  );
}

/*
 * EDIT-POINT: ACCOUNTS
 * Every outside service in one place: what it's for, whether it's connected,
 * links to sign up and to its dashboard, and its keys.
 */
type Service = { group: string; name: string; what: string; links: [string, string][]; optional?: boolean };

export function KeysManager({
  initial,
  strong,
  onVercel,
  database,
  repo,
  github,
  stripeTest,
  links,
}: {
  initial: KeyStatus[];
  strong: boolean;
  onVercel: boolean;
  database: { ok: boolean; detail: string };
  repo: string;
  github: { token: boolean; last: SyncStatus | null };
  stripeTest: boolean;
  links: CustomLink[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const [custom, setCustom] = useState({ name: "", value: "" });

  const done = (m: string) => {
    setMsg(m);
    setErr("");
    router.refresh();
  };
  async function act(url: string, body: object, label: string) {
    setBusy(label);
    setErr("");
    setMsg("");
    try {
      done((await api<{ message: string }>(url, "POST", body)).message);
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy("");
  }

  const set = (k: KeyStatus) => k.source === "vercel" || k.source === "dashboard";
  const has = (n: string) => initial.some((k) => k.envName === n && set(k));
  const t = stripeTest ? "test/" : "";
  const SERVICES: Service[] = [
    { group: "Stripe", name: "Stripe", what: "Takes payments (cards, Apple Pay, Google Pay), sends receipts, holds promo codes and gift cards.", links: [["Sign up", "https://dashboard.stripe.com/register"], ["Dashboard", `https://dashboard.stripe.com/${t}dashboard`], ["API keys", `https://dashboard.stripe.com/${t}apikeys`], ["Payouts", "https://dashboard.stripe.com/payouts"]] },
    { group: "Database", name: "Supabase", what: "The database and photo storage. Connected from Vercel (Storage tab), no key to paste.", links: [["Open Supabase", "https://supabase.com/dashboard/projects"], ["Vercel Storage", "https://vercel.com/dashboard/stores"]] },
    { group: "Hosting", name: "Vercel", what: "Runs the website. Environment variables, domains and deployments live here.", links: [["Sign up", "https://vercel.com/signup"], ["Dashboard", "https://vercel.com/dashboard"]] },
    { group: "GitHub", name: "GitHub", what: "Holds the site's files and a backup copy of everything you change here.", links: [["Sign up", "https://github.com/signup"], ["Your repository", repo ? `https://github.com/${repo}` : "https://github.com"], ["Make a token", "https://github.com/settings/personal-access-tokens/new"]] },
    { group: "Phone notifications", name: "Phone notifications", what: "Pings your phone for orders, requests and reviews. The keys are made for you.", links: [] },
    { group: "Chat", name: "AI for the chat", what: "Optional. The Ask us chat already answers without one. Pick a service (Anthropic, OpenAI, Gemini, Groq, OpenRouter, Ollama...) in Chat > Settings, then paste its key here.", links: [["Choose the service", "/admin/chat"]], optional: true },
    { group: "Shipping labels", name: "Shippo (labels)", what: "Buy and print postage from an order.", links: [["Sign up", "https://apps.goshippo.com/join"], ["API token", "https://apps.goshippo.com/settings/api"]], optional: true },
    { group: "Email", name: "Resend (email)", what: "Sends shipped, gift card, reminder and reset emails from the site.", links: [["Sign up", "https://resend.com/signup"], ["API keys", "https://resend.com/api-keys"], ["Domains", "https://resend.com/domains"]], optional: true },
    { group: "Listings", name: "Facebook & Google listings", what: "Your items in Facebook/Instagram Shops and Google Shopping, from your product feed. No key needed.", links: [["Meta Commerce Manager", "https://business.facebook.com/commerce"], ["Google Merchant Center", "https://merchants.google.com"], ["Your feed", "/feed.xml"]], optional: true },
  ];
  const keysOf = (g: string) => initial.filter((k) => k.group === g);
  const status = (sv: Service) => {
    if (sv.group === "Database") return database.ok ? "Connected" : "Not connected";
    if (sv.group === "Hosting") return onVercel ? "Running" : "On this computer";
    if (sv.group === "Listings") return "Optional";
    const ks = keysOf(sv.group);
    if (!ks.length) return "";
    const n = ks.filter(set).length;
    return n === ks.length ? "Connected" : n ? "Partly set up" : sv.optional ? "Not set up (optional)" : "Not set up";
  };

  const card = (sv: Service) => {
    const st = status(sv);
    return (
      <section key={sv.group} className="panel svc">
        <div className="panel-head">
          <h2>{sv.name}</h2>
          {st ? <span className={`pill ${st === "Connected" || st === "Running" ? "s-shipped" : st.startsWith("Not set up (") || st === "Optional" ? "" : "s-paid"}`}>{st}</span> : null}
        </div>
        <p className="muted small">{sv.what}{sv.group === "Database" && !database.ok ? ` ${database.detail}` : ""}</p>
        {sv.links.length ? (
          <div className="row wrap">
            {sv.links.map(([label, url], i) => <a key={url} className={`b b-sm ${i ? "b-ghost" : ""}`} href={url} target={url.startsWith("/") ? undefined : "_blank"} rel="noreferrer">{label}</a>)}
          </div>
        ) : null}
        {sv.group === "Stripe" ? (
          <div className="row wrap key-actions">
            <button className="b b-sm" disabled={!has("STRIPE_SECRET_KEY") || Boolean(busy)} onClick={() => act("/api/admin/stripe", { action: "webhook" }, "webhook")}>
              {busy === "webhook" ? "Connecting…" : "Connect Stripe webhook again"}
            </button>
            <button className="b b-sm" disabled={!has("STRIPE_SECRET_KEY") || Boolean(busy)} onClick={() => act("/api/admin/stripe", { action: "sync" }, "sync")}>
              {busy === "sync" ? "Syncing…" : "Pull products from Stripe"}
            </button>
            {!onVercel ? <span className="hint">The webhook only connects on the live Vercel site.</span> : null}
          </div>
        ) : null}
        {sv.group === "Phone notifications" && !has("VAPID_PRIVATE_KEY") ? (
          <div className="row wrap key-actions">
            <button className="b b-sm" disabled={Boolean(busy)} onClick={() => act("/api/admin/keys", { action: "vapid" }, "vapid")}>{busy === "vapid" ? "Creating…" : "Create notification keys"}</button>
          </div>
        ) : null}
        {sv.group === "GitHub" ? <GitHubSave token={github.token} last={github.last} /> : null}
        {keysOf(sv.group).length ? (
          <ul className="keys">
            {keysOf(sv.group).map((k) => <KeyRow key={k.envName} k={k} onDone={done} />)}
          </ul>
        ) : null}
      </section>
    );
  };
  const known = new Set(SERVICES.map((s) => s.group));
  const other = initial.filter((k) => !known.has(k.group));

  return (
    <>
      <div className="page-head">
        <h1>Accounts &amp; keys</h1>
        <Link href="/admin/setup" className="b b-ghost b-sm">Setup guide</Link>
      </div>
      <p className="muted lead">
        Everything the shop connects to, in one place: links to sign up and to each dashboard, the keys that connect them (checked, then stored encrypted), your saved logins, and your own shortcuts.
        Keys set in Vercel&apos;s environment variables always win over keys saved here.
      </p>
      {!strong ? (
        <p className="alert warn">For stronger protection, add an <code>AUTH_SECRET</code> environment variable in Vercel (Setup, step 2) before saving keys here; keys saved earlier will need re-entering.</p>
      ) : null}
      {msg ? <p className="alert" role="status">{msg}</p> : null}
      {err ? <p className="err" role="alert">{err}</p> : null}

      <Tabs
        label="Accounts"
        tabs={[
          { id: "services", label: "Services", content: <div className="svc-list">{SERVICES.map(card)}</div> },
          { id: "logins", label: "Saved logins", content: <SavedLogins /> },
          { id: "links", label: "My links", content: <MyLinks initial={links} /> },
          {
            id: "other-keys",
            label: "Other keys",
            content: (
              <>
                {other.length ? (
                  <section className="panel">
                    <ul className="keys">{other.map((k) => <KeyRow key={k.envName} k={k} onDone={done} />)}</ul>
                  </section>
                ) : null}
                <section className="panel">
                  <div className="panel-head"><h2>Add another key</h2></div>
                  <p className="muted small">For any other service you start using. Give it the name that service&apos;s instructions use, like <code>SOME_SERVICE_KEY</code>. Code reads it with <code>getKey(&quot;SOME_SERVICE_KEY&quot;)</code> (see the API-KEYS edit point).</p>
                  <form className="key-edit" onSubmit={(e) => { e.preventDefault(); act("/api/admin/keys", { action: "save", ...custom }, "custom").then(() => setCustom({ name: "", value: "" })); }}>
                    <input value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") })} placeholder="NAME_OF_KEY" aria-label="Key name" spellCheck={false} />
                    <input type="password" value={custom.value} onChange={(e) => setCustom({ ...custom, value: e.target.value })} placeholder="Paste the key" aria-label="Key value" autoComplete="off" />
                    <button className="b b-primary b-sm" disabled={!custom.name || !custom.value || Boolean(busy)}>{busy === "custom" ? "Saving…" : "Save key"}</button>
                  </form>
                </section>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
