import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { kv } from "./store";

/*
 * EDIT-POINT: ADMIN-ACCOUNTS
 * Each person who runs the shop (him, his wife) has their own name and
 * password. The first time someone signs in with a new name, they use the
 * starter password (ADMIN_PASSWORD in Vercel, or the one set in Settings),
 * then choose their own; after that the starter no longer works for that name.
 * A forgotten password is reset by the other person (Settings > Password &
 * security), by an emailed link, or with OWNER_RESET_CODE set in Vercel.
 */

export type AdminAccount = {
  id: string;
  name: string;
  salt: string;
  hash: string;
  email: string;
  mustChange: boolean; // reset: sign in with the starter password and choose a new one
  createdAt: string;
  lastLogin?: string;
  reset?: { hash: string; until: number }; // emailed reset link (stored as a fingerprint only)
};
type Accounts = Record<string, AdminAccount>;
const KEY = "adminAccounts";

const nameKey = (n: string) => n.trim().toLowerCase().replace(/\s+/g, " ");
const hashOf = (pw: string, salt: string) => scryptSync(pw, salt, 64).toString("hex");
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export async function listAccounts(): Promise<AdminAccount[]> {
  return Object.values((await kv.get<Accounts>(KEY)) ?? {}).sort((a, b) => a.name.localeCompare(b.name));
}

export async function findAccount(name: string) {
  const all = (await kv.get<Accounts>(KEY)) ?? {};
  return Object.values(all).find((a) => nameKey(a.name) === nameKey(name)) ?? null;
}

async function save(a: AdminAccount) {
  const all = (await kv.get<Accounts>(KEY)) ?? {};
  all[a.id] = a;
  await kv.set(KEY, all);
}

export function checkOwn(a: AdminAccount, pw: string) {
  if (!a.hash) return false;
  const x = Buffer.from(hashOf(pw, a.salt), "hex");
  const y = Buffer.from(a.hash, "hex");
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Sets (or creates the account with) this person's own password. */
export async function setOwnPassword(name: string, pw: string, email?: string) {
  const salt = randomBytes(16).toString("hex");
  const existing = await findAccount(name);
  const a: AdminAccount = existing ?? { id: randomBytes(8).toString("hex"), name: name.trim().slice(0, 30), salt: "", hash: "", email: "", mustChange: false, createdAt: new Date().toISOString() };
  a.salt = salt;
  a.hash = hashOf(pw, salt);
  a.mustChange = false;
  a.reset = undefined;
  if (email !== undefined) a.email = email.trim().slice(0, 200);
  await save(a);
  return a;
}

export async function touchLogin(a: AdminAccount) {
  a.lastLogin = new Date().toISOString();
  await save(a);
}

export async function markForReset(id: string) {
  const all = (await kv.get<Accounts>(KEY)) ?? {};
  if (!all[id]) return;
  all[id].mustChange = true;
  await kv.set(KEY, all);
}

export async function removeAccount(id: string) {
  const all = (await kv.get<Accounts>(KEY)) ?? {};
  delete all[id];
  await kv.set(KEY, all);
}

export async function setEmail(id: string, email: string) {
  const all = (await kv.get<Accounts>(KEY)) ?? {};
  if (!all[id]) return;
  all[id].email = email.trim().slice(0, 200);
  await kv.set(KEY, all);
}

/** A one-time reset link token (valid 30 minutes); only its fingerprint is stored. */
export async function makeResetToken(a: AdminAccount) {
  const token = randomBytes(24).toString("hex");
  a.reset = { hash: sha(token), until: Date.now() + 30 * 60_000 };
  await save(a);
  return `${a.id}.${token}`;
}

export async function redeemResetToken(full: string, pw: string) {
  const [id, token] = full.split(".");
  const all = (await kv.get<Accounts>(KEY)) ?? {};
  const a = id ? all[id] : undefined;
  if (!a?.reset || a.reset.until < Date.now() || a.reset.hash !== sha(token ?? "")) return null;
  return setOwnPassword(a.name, pw);
}

/** OWNER_RESET_CODE in Vercel: the last-resort way back in if everyone forgot. */
export function checkResetCode(code: string) {
  const want = process.env.OWNER_RESET_CODE;
  if (!want || want.length < 8 || !code) return false;
  const x = Buffer.from(sha(code));
  const y = Buffer.from(sha(want));
  return timingSafeEqual(x, y);
}
