import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { kv, storageMode } from "./store";

/*
 * EDIT-POINT: ADMIN-SECURITY
 * Who is signed in to the dashboard (each phone or computer is its own
 * session, so he and his wife can both be signed in), the optional PIN lock in
 * front of the login screen, and lockouts after too many wrong tries.
 * IP addresses are never stored; only a one-way fingerprint for lockouts.
 */

export type AdminSession = { id: string; name: string; device: string; createdAt: string; lastSeen: string };
type Sessions = Record<string, AdminSession>;
const SESSIONS = "adminSessions";

export const ONLINE_MS = 5 * 60_000; // counts as "online" if active in the last 5 minutes

export async function listSessions(): Promise<AdminSession[]> {
  const all = (await kv.get<Sessions>(SESSIONS)) ?? {};
  return Object.values(all).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
}

export async function addSession(name: string, userAgent: string): Promise<string> {
  const id = randomBytes(12).toString("hex");
  const now = new Date().toISOString();
  const all = (await kv.get<Sessions>(SESSIONS)) ?? {};
  // forget sessions unused for 60 days
  for (const [k, v] of Object.entries(all)) if (Date.now() - Date.parse(v.lastSeen) > 60 * 86400_000) delete all[k];
  all[id] = { id, name: name.trim().slice(0, 30) || "Owner", device: deviceName(userAgent), createdAt: now, lastSeen: now };
  await kv.set(SESSIONS, all);
  return id;
}

// Without a shared database (Supabase not connected yet on Vercel), each server
// keeps its own scratch copy, so the device list can't be relied on: a validly
// signed login is enough until Supabase is connected.
export const sharedStorage = () => storageMode !== "file" || !process.env.VERCEL;

/** Is this session still allowed? Also marks it as active (at most once a minute). */
export async function touchSession(id: string): Promise<boolean> {
  const all = (await kv.get<Sessions>(SESSIONS)) ?? {};
  const s = all[id];
  if (!s) return !sharedStorage();
  if (Date.now() - Date.parse(s.lastSeen) > 60_000) {
    s.lastSeen = new Date().toISOString();
    await kv.set(SESSIONS, all);
  }
  return true;
}

export async function endSession(id: string) {
  const all = (await kv.get<Sessions>(SESSIONS)) ?? {};
  delete all[id];
  await kv.set(SESSIONS, all);
}

export async function endOtherSessions(keep: string) {
  const all = (await kv.get<Sessions>(SESSIONS)) ?? {};
  await kv.set(SESSIONS, all[keep] ? { [keep]: all[keep] } : {});
}

function deviceName(ua: string) {
  const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows PC" : /Linux/.test(ua) ? "Linux" : "Device";
  const app = /Edg\//.test(ua) ? "Edge" : /CriOS|Chrome\//.test(ua) ? "Chrome" : /FxiOS|Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "";
  return app ? `${os}, ${app}` : os;
}

// ---------- PIN lock in front of the login screen ----------

export type LockInfo = { on: boolean; kind: "pin" | "passcode" };
type Lock = LockInfo & { salt: string; hash: string };
const LOCK = "adminLock";
const hashOf = (code: string, salt: string) => scryptSync(code, salt, 64).toString("hex");

export async function lockInfo(): Promise<LockInfo> {
  const l = await kv.get<Lock>(LOCK).catch(() => null);
  return { on: Boolean(l?.on && l.hash), kind: l?.kind ?? "pin" };
}

export async function setLock(kind: "pin" | "passcode", code: string) {
  const salt = randomBytes(16).toString("hex");
  await kv.set(LOCK, { on: true, kind, salt, hash: hashOf(code, salt) } satisfies Lock);
}

export async function clearLock() {
  await kv.set(LOCK, { on: false, kind: "pin", salt: "", hash: "" } satisfies Lock);
}

export async function checkLock(code: string) {
  const l = await kv.get<Lock>(LOCK);
  if (!l?.on || !l.hash) return true;
  const a = Buffer.from(hashOf(code, l.salt), "hex");
  const b = Buffer.from(l.hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---------- lockouts after wrong tries (PIN and password) ----------

type Fails = Record<string, { n: number; until: number }>;
const FAILS = "authFails";
const MAX_TRIES = 5;
const LOCK_MINUTES = 15;

/** A one-way fingerprint of the visitor's address, so no IP is ever stored. */
export function visitorKey(req: Request, what: string) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  return createHash("sha256").update(`${what}:${ip}:${process.env.AUTH_SECRET ?? ""}`).digest("hex").slice(0, 24);
}

/** Minutes left on a lockout, or 0. */
export async function lockedFor(key: string) {
  const f = ((await kv.get<Fails>(FAILS)) ?? {})[key];
  return f && f.until > Date.now() ? Math.ceil((f.until - Date.now()) / 60_000) : 0;
}

export async function recordFail(key: string) {
  const all = (await kv.get<Fails>(FAILS)) ?? {};
  for (const [k, v] of Object.entries(all)) if (v.until && v.until < Date.now() - 86400_000) delete all[k];
  const f = all[key] ?? { n: 0, until: 0 };
  f.n += 1;
  if (f.n >= MAX_TRIES) {
    f.until = Date.now() + LOCK_MINUTES * 60_000;
    f.n = 0;
  }
  all[key] = f;
  await kv.set(FAILS, all);
  return MAX_TRIES - f.n;
}

export async function clearFails(key: string) {
  const all = (await kv.get<Fails>(FAILS)) ?? {};
  if (all[key]) {
    delete all[key];
    await kv.set(FAILS, all);
  }
}
