"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Waiting = { id: string; name: string; unread: number; status: string };

/*
 * The "Live" switch in the dashboard's top bar. While a dashboard page is on
 * screen and it's on (pulsing red), customers see that someone can chat.
 * Checks in every 30 seconds; when a customer is waiting, a box pops up.
 */
export function LiveAgent() {
  const path = usePathname();
  const [on, setOn] = useState<boolean | null>(null);
  const [waiting, setWaiting] = useState<Waiting[]>([]);
  const [hide, setHide] = useState("");
  const onRef = useRef<boolean | undefined>(undefined);

  async function here(next?: boolean) {
    if (document.visibilityState !== "visible") return;
    const r = await fetch("/api/admin/live-chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "here", ...(typeof next === "boolean" ? { on: next } : {}) }) }).catch(() => null);
    const d = r?.ok ? await r.json() : null;
    if (!d) return;
    setOn(d.on);
    onRef.current = d.on;
    setWaiting((d.chats as Waiting[]).filter((c) => c.unread > 0));
  }

  useEffect(() => {
    here();
    const t = setInterval(() => here(), 30_000);
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

  const show = waiting.filter((w) => w.id !== hide);
  const onLive = path?.startsWith("/admin/live");
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
      ) : null}
    </>
  );
}
