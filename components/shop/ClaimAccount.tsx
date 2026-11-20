"use client";
import { useEffect } from "react";

/** Right after buying: signs this device in to the customer's account (their orders page). */
export function ClaimAccount({ order, k }: { order: string; k?: string }) {
  useEffect(() => {
    fetch("/api/account", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "claim", order, k }) }).catch(() => {});
  }, [order, k]);
  return null;
}
