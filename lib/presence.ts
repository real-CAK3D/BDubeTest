import "server-only";
import { kv } from "./store";

/*
 * Who is looking at the shop right now. Each browser tab sends a random,
 * anonymous id every 30 seconds while the page is open; nothing about the
 * person (no IP, no name) is kept, and entries vanish after 90 seconds.
 */
type Presence = Record<string, { t: number; path: string }>;
const KEY = "presence";
export const LIVE_MS = 90_000;

export async function heartbeat(id: string, path: string) {
  const all = (await kv.get<Presence>(KEY)) ?? {};
  const now = Date.now();
  for (const [k, v] of Object.entries(all)) if (now - v.t > LIVE_MS) delete all[k];
  all[id] = { t: now, path };
  await kv.set(KEY, all);
}

export async function shoppersNow() {
  const all = (await kv.get<Presence>(KEY)) ?? {};
  const now = Date.now();
  const live = Object.values(all).filter((v) => now - v.t < LIVE_MS);
  const pages: Record<string, number> = {};
  for (const v of live) pages[v.path] = (pages[v.path] ?? 0) + 1;
  return { count: live.length, pages: Object.entries(pages).sort((a, b) => b[1] - a[1]).map(([path, n]) => ({ path, n })) };
}
