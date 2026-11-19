"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Waiting = { id: string; name: string; unread: number; status: string };

/*
 * The "Live" switch in the dashboard's top bar. While a dashboard page is on
 * screen and it's on (pulsing red), customers see that someone can chat.
 * Checks in every 15 seconds; when a customer is waiting, a box pops up.
 */
export function LiveAgent() {
  const path = usePathname();
  const [on, setOn] = useState<boolean | null>(null);
  const [waiting, setWaiting] = useState<Waiting[]>([]);
  const [hide, setHide] = useState("");
  const [team, setTeam] = useState<{ unread: number; last: { id: string; by: string; text: string } | null }>({ unread: 0, last: null });
  const [hideTeam, setHideTeam] = useState("");
  const onRef = useRef<boolean | undefined>(undefined);

  async function here(next?: boolean) {
    if (document.visibilityState !== "visible") return;
    const r = await fetch("/api/admin/live-chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "here", ...(typeof next === "boolean" ? { on: next } : {}) }) }).catch(() => null);
    const d = r?.ok ? await r.json() : null;
    if (!d) return;
    setOn(d.on);
    onRef.current = d.on;
    setWaiting((d.chats as Waiting[]).filter((c) => c.unread > 0));
    if (d.team) setTeam(d.team);
    setIconBadge(d.badge);
  }

  useEffect(() => {
    // tag this device's phone notifications with who's signed in, so team messages skip the sender
    navigator.serviceWorker?.ready
      .then((r) => r.pushManager.getSubscription())
      .then((sub) => sub && fetch("/api/admin/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON() }) }))
      .catch(() => {});
    here();
    const t = setInterval(() => here(), 15_000);
    const vis = () => {
      if (document.visibilityState === "visible") here();
      else navigator.sendBeacon?.("/api/admin/live-chat", new Blob([JSON.stringify({ action: "away" })], { type: "application/json" }));
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  // after moving to another page (e.g. Notifications, which marks them read), refresh the icon number
  useEffect(() => {
    const t = setTimeout(() => here(), 2500);
    return () => clearTimeout(t);
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  const show = waiting.filter((w) => w.id !== hide);
  const onLive = path?.startsWith("/admin/live");
  const onTeam = path?.startsWith("/admin/team");
  const teamNote = team.last && team.last.id !== hideTeam && !onTeam ? team.last : null;
  return (
    <>
      <button
        type="button"
        className={`live-switch ${on ? "on" : ""}`}
        onClick={() => here(!on)}
        aria-pressed={Boolean(on)}
        title={on ? "You're available for live chat. Tap to go away." : "Tap to be available for live chat"}
      >
        <span className="live-dot" aria-hidden />
        <span className="live-switch-text">{on ? "Live" : "Away"}</span>
      </button>
      {show.length && !onLive ? (
        <div className="live-toast" role="alert">
          <span className="live-dot" aria-hidden />
          <span>
            <strong>{show[0].name || "A customer"}</strong> {show[0].status === "waiting" ? "wants to chat" : "sent a message"}
            {show.length > 1 ? ` (+${show.length - 1} more)` : ""}
          </span>
          <Link className="b b-primary b-sm" href={`/admin/live?c=${show[0].id}`}>Answer</Link>
          <button className="b b-ghost b-sm" aria-label="Hide" onClick={() => setHide(show[0].id)}>✕</button>
        </div>
      ) : teamNote ? (
        <div className="live-toast team-toast" role="status">
          <span>
            <strong>{teamNote.by}:</strong> {teamNote.text}
            {team.unread > 1 ? <span className="muted small"> (+{team.unread - 1} more)</span> : null}
          </span>
          <Link className="b b-primary b-sm" href="/admin/team">Open</Link>
          <button className="b b-ghost b-sm" aria-label="Hide" onClick={() => setHideTeam(teamNote.id)}>✕</button>
        </div>
      ) : null}
    </>
  );
}

/** The number on the home-screen app icon (iPhone 16.4+ and Android, when added to the home screen). */
export function setIconBadge(n: unknown) {
  const nav = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
  if (typeof n !== "number" || !nav.setAppBadge) return;
  (n > 0 ? nav.setAppBadge(n) : nav.clearAppBadge?.())?.catch(() => {});
}
