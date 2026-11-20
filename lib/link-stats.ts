import "server-only";
import { kv } from "./store";

// Visits to the Socials page and taps on each of its links, counted per day.
// Kept in one counter per month: "linkPage:2026-11" -> { "20|v": 12, "20|l3": 4 }
const monthKey = (d: Date) => `linkPage:${d.toISOString().slice(0, 7)}`;

export async function countLinkPage(what: string) {
  const now = new Date();
  await kv.hincrby(monthKey(now), `${now.toISOString().slice(8, 10)}|${what}`, 1);
}

/** Visits and taps over the last `days` days (up to 60), newest month first. */
export async function linkPageStats(days = 30) {
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15));
  const prev2 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 15));
  const months = await Promise.all([now, prev, prev2].map(async (d) => [d.toISOString().slice(0, 7), await kv.hgetall(monthKey(d)).catch(() => ({}) as Record<string, number>)] as const));
  const from = new Date(now.getTime() - (Math.min(60, days) - 1) * 86400_000).toISOString().slice(0, 10);
  let views = 0;
  const taps: Record<string, number> = {};
  const daily: Record<string, number> = {};
  for (const [month, rows] of months) {
    for (const [field, n] of Object.entries(rows)) {
      const [dd, what] = field.split("|");
      const day = `${month}-${dd}`;
      if (day < from) continue;
      if (what === "v") {
        views += Number(n) || 0;
        daily[day] = (daily[day] ?? 0) + (Number(n) || 0);
      } else taps[what] = (taps[what] ?? 0) + (Number(n) || 0);
    }
  }
  return { days, views, taps, daily };
}
