"use client";
import { useEffect } from "react";

/** Keeps this device marked as "signed in now" while a dashboard page is open. */
export function AdminPing() {
  useEffect(() => {
    const ping = () => document.visibilityState === "visible" && fetch("/api/admin/ping", { method: "POST" }).catch(() => {});
    const t = setInterval(ping, 120_000);
    document.addEventListener("visibilitychange", ping);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", ping);
    };
  }, []);
  return null;
}
