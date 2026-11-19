import "server-only";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { getMessages, newId, saveMessages } from "./db";
import { getPrivate, setPrivate } from "./private-data";
import { notifyOwner } from "./push";
import { kv } from "./store";

/*
 * EDIT-POINT: LIVE-CHAT
 * Live chat between a customer and whoever is signed in to the dashboard.
 *  - An admin counts as "available" while a dashboard page is open on screen
 *    (it checks in every 30 seconds) and their Available switch is on.
 *  - The shop's chat button shows a slow red pulse while someone is available.
 *  - Conversations are stored encrypted, like orders. A customer can only read
 *    their own conversation, using a secret token their browser holds.
 *  - Closed chats are kept 30 days, then removed.
 */

export type LiveMsg = { at: string; from: "customer" | "admin" | "system"; text: string; by?: string };
export type LiveChat = {
  id: string;
  token: string; // the customer's secret for this chat
  createdAt: string;
  updatedAt: string;
  status: "waiting" | "open" | "closed";
  name: string; // what the customer called themselves ("" = Guest)
  email: string;
  page: string; // the shop page they started on
  msgs: LiveMsg[];
  adminRead: number; // how many messages an admin has seen
};
type Agents = Record<string, { name: string; at: number; on: boolean }>;

const AGENTS = "liveAgents";
const CHATS = "liveChats";
export const AGENT_MS = 75_000; // an admin who hasn't checked in for this long is away

// ---------- who's available ----------

export async function agentHere(sessionId: string, name: string, on?: boolean) {
  const all = (await kv.get<Agents>(AGENTS)) ?? {};
  const now = Date.now();
  for (const [k, v] of Object.entries(all)) if (now - v.at > 24 * 3600_000) delete all[k];
  const prev = all[sessionId];
  all[sessionId] = { name, at: now, on: on ?? prev?.on ?? true };
  await kv.set(AGENTS, all);
  return all[sessionId].on;
}

export async function agentLeave(sessionId: string) {
  const all = (await kv.get<Agents>(AGENTS)) ?? {};
  if (all[sessionId]) {
    all[sessionId].at = 0;
    await kv.set(AGENTS, all);
  }
}

/** First names of the admins available right now. */
export async function availableAgents() {
  const all = (await kv.get<Agents>(AGENTS)) ?? {};
  const now = Date.now();
  return [...new Set(Object.values(all).filter((a) => a.on && now - a.at < AGENT_MS).map((a) => a.name.split(" ")[0]))];
}

// ---------- conversations ----------

const load = () => getPrivate<LiveChat[]>(CHATS, []);
async function save(list: LiveChat[]) {
  const cutoff = Date.now() - 30 * 86400_000;
  await setPrivate(CHATS, list.filter((c) => c.status !== "closed" || Date.parse(c.updatedAt) > cutoff).slice(0, 200));
}
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const clean = (s: unknown, n: number) => String(s ?? "").replace(/[\u0000-\u0008\u000b-\u001f]/g, "").trim().slice(0, n);

export async function startChat(opts: { name?: string; text?: string; page?: string; earlier?: string[] }) {
  const list = await load();
  const now = new Date().toISOString();
  const name = clean(opts.name, 60);
  const c: LiveChat = {
    id: newId(),
    token: randomBytes(18).toString("base64url"),
    createdAt: now,
    updatedAt: now,
    status: "waiting",
    name,
    email: "",
    page: clean(opts.page, 120),
    msgs: [],
    adminRead: 0,
  };
  // what they asked the chat helper before asking for a person, so you have the context
  const before = (opts.earlier ?? []).map((x) => clean(x, 300)).filter(Boolean).slice(-4);
  if (before.length) c.msgs.push({ at: now, from: "system", text: `Asked the chat helper first: ${before.map((x) => `"${x}"`).join(", ")}` });
  const text = clean(opts.text, 1500);
  if (text) c.msgs.push({ at: now, from: "customer", text });
  list.unshift(c);
  await save(list);
  await notifyOwner(`Live chat: ${name || "a customer"} wants to talk`, text.slice(0, 120) || "Open the dashboard to answer.", "/admin/live");
  return c;
}

/** The customer's view: only with the right token. */
export async function customerChat(id: string, token: string) {
  const c = (await load()).find((x) => x.id === id);
  return c && same(c.token, token) ? c : null;
}

export async function customerSend(id: string, token: string, text: string) {
  const list = await load();
  const c = list.find((x) => x.id === id);
  if (!c || !same(c.token, token) || c.status === "closed") return null;
  const t = clean(text, 1500);
  if (!t) return c;
  // an email typed in the chat is kept so you can follow up later
  const email = t.match(/[^\s@<>()"',;]+@[^\s@<>()"',;]+\.[a-z]{2,}/i)?.[0];
  if (email) c.email = email.slice(0, 200);
  c.msgs.push({ at: new Date().toISOString(), from: "customer", text: t });
  c.updatedAt = new Date().toISOString();
  await save(list);
  return c;
}

export async function customerEnd(id: string, token: string) {
  const list = await load();
  const c = list.find((x) => x.id === id);
  if (!c || !same(c.token, token)) return;
  if (c.status !== "closed") c.msgs.push({ at: new Date().toISOString(), from: "system", text: "The customer left the chat." });
  c.status = "closed";
  c.updatedAt = new Date().toISOString();
  await save(list);
}

/** What the customer's browser gets: never the token or other chats. */
export const forCustomer = (c: LiveChat) => ({ status: c.status, msgs: c.msgs.filter((m) => m.from !== "system" || !m.text.startsWith("Asked the chat helper")).map((m) => ({ at: m.at, from: m.from, text: m.text, by: m.by })) });

// ---------- the dashboard side ----------

export async function listChats() {
  return (await load()).map(({ token: _t, ...c }) => ({ ...c, unread: c.msgs.length - c.adminRead }));
}

export async function adminSend(id: string, text: string, by: string) {
  const list = await load();
  const c = list.find((x) => x.id === id);
  if (!c) return null;
  const t = clean(text, 1500);
  if (!t) return c;
  if (c.status === "waiting") c.msgs.push({ at: new Date().toISOString(), from: "system", text: `${by} joined the chat.` });
  c.status = c.status === "closed" ? "closed" : "open";
  c.msgs.push({ at: new Date().toISOString(), from: "admin", text: t, by });
  c.adminRead = c.msgs.length;
  c.updatedAt = new Date().toISOString();
  await save(list);
  return c;
}

export async function adminRead(id: string) {
  const list = await load();
  const c = list.find((x) => x.id === id);
  if (c && c.adminRead !== c.msgs.length) {
    c.adminRead = c.msgs.length;
    await save(list);
  }
}

export async function adminClose(id: string, by: string) {
  const list = await load();
  const c = list.find((x) => x.id === id);
  if (!c) return;
  if (c.status !== "closed") c.msgs.push({ at: new Date().toISOString(), from: "system", text: `${by} ended the chat.` });
  c.status = "closed";
  c.adminRead = c.msgs.length;
  c.updatedAt = new Date().toISOString();
  await save(list);
}

export async function adminDelete(id: string) {
  await save((await load()).filter((c) => c.id !== id));
}

/** Copies the conversation into the Inbox, to answer by email later. */
export async function chatToInbox(id: string) {
  const c = (await load()).find((x) => x.id === id);
  if (!c) return false;
  const msgs = await getMessages();
  const transcript = c.msgs.map((m) => `${m.from === "admin" ? m.by || "Us" : m.from === "customer" ? c.name || "Customer" : "·"}: ${m.text}`).join("\n");
  msgs.unshift({ id: newId(), createdAt: new Date().toISOString(), name: c.name, email: c.email, message: `Live chat from ${new Date(c.createdAt).toLocaleString("en-US")}\n\n${transcript}`.slice(0, 5000), read: false });
  await saveMessages(msgs);
  return true;
}
