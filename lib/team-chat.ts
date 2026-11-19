import "server-only";
import { listSessions, ONLINE_MS } from "./admin-security";
import { newId } from "./ids";
import { getPrivate, setPrivate } from "./private-data";
import { notifyOwner } from "./push";
import { kv, withLock } from "./store";

/*
 * EDIT-POINT: TEAM-CHAT
 * A private chat between the people who run the shop (Dashboard > Team chat).
 * Stored encrypted; customers never see it. A message pings the others' phones
 * (not the sender's), and shows a pop-up and a badge in their dashboard.
 */
export type TeamMsg = { id: string; at: string; by: string; text: string; link?: string };
const KEY = "teamChat";
const READ = "teamRead"; // name (lowercase) -> time they last looked

export const getTeamChat = () => getPrivate<TeamMsg[]>(KEY, []);
const me = (name: string) => name.trim().toLowerCase();

export function postTeam(by: string, text: string, link?: string) {
  return withLock("teamChat", async () => {
    const t = text.replace(/[\u0000-\u0008\u000b-\u001f]/g, "").trim().slice(0, 2000);
    if (!t) return null;
    const list = await getTeamChat();
    const m: TeamMsg = { id: newId(), at: new Date().toISOString(), by, text: t, ...(link ? { link } : {}) };
    list.push(m);
    await setPrivate(KEY, list.slice(-500));
    await markTeamRead(by);
    await notifyOwner(`${by.split(" ")[0]} (team chat)`, t.slice(0, 140), "/admin/team", { except: by, bell: false }).catch(() => {});
    return m;
  });
}

export async function markTeamRead(name: string) {
  await withLock("teamRead", async () => {
    const r = (await kv.get<Record<string, string>>(READ)) ?? {};
    r[me(name)] = new Date().toISOString();
    await kv.set(READ, r);
  });
}

/** For the top-bar check-in: how many unread, and the newest one from someone else. */
export async function teamSummary(name: string) {
  const [list, r] = await Promise.all([getTeamChat().catch(() => [] as TeamMsg[]), kv.get<Record<string, string>>(READ)]);
  const since = r?.[me(name)] ?? "";
  const unread = list.filter((m) => m.at > since && me(m.by) !== me(name));
  const last = unread.at(-1);
  return { unread: unread.length, last: last ? { id: last.id, by: last.by.split(" ")[0], text: last.text.slice(0, 120) } : null };
}

/** Who else is signed in to the dashboard right now. */
export async function teamOnline() {
  const s = await listSessions();
  return [...new Set(s.filter((x) => !x.pending && Date.now() - Date.parse(x.lastSeen) < ONLINE_MS).map((x) => x.name.split(" ")[0]))];
}
