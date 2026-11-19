import "server-only";
import { getPrivate } from "./private-data";
import { kv } from "./store";

/** How many team chat messages someone hasn't seen yet (kept apart from team-chat.ts so push.ts can use it). */
export async function teamUnread(name: string) {
  const who = name.trim().toLowerCase();
  const [list, read] = await Promise.all([getPrivate<{ at: string; by: string }[]>("teamChat", []), kv.get<Record<string, string>>("teamRead")]);
  const since = read?.[who] ?? "";
  return list.filter((m) => m.at > since && m.by.trim().toLowerCase() !== who).length;
}
