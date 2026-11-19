"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Tells the shop "someone is on this page" every 30 seconds, anonymously, while the tab is open. */
export function Presence() {
  const path = usePathname();
  useEffect(() => {
    let id = "";
    try {
      id = sessionStorage.getItem("pid") ?? "";
      if (!id) sessionStorage.setItem("pid", (id = Math.random().toString(36).slice(2) + Date.now().toString(36)));
    } catch {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    const beat = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/presence", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, path }), keepalive: true }).catch(() => {});
    };
    beat();
    const t = setInterval(beat, 30_000);
    document.addEventListener("visibilitychange", beat);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [path]);
  return null;
}
