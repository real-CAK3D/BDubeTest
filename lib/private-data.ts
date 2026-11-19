import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { kv } from "./store";

/*
 * EDIT-POINT: PRIVATE-DATA
 * Customer details (orders, addresses, emails, phone numbers, messages,
 * custom requests, sign-ups) are stored encrypted (AES-256-GCM). Someone who
 * got hold of the database would see scrambled text; only this website, with
 * its AUTH_SECRET, can read it, and only the signed-in owner sees it.
 *
 * Never change AUTH_SECRET in Vercel once the shop has real orders: the saved
 * customer details can only be read with the secret they were saved with.
 */

type Sealed = { sealed: 1; iv: string; tag: string; data: string };

function key() {
  const base = process.env.AUTH_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "local-development-only";
  return createHash("sha256").update("shop-data:" + base).digest();
}

const isSealed = (v: unknown): v is Sealed => Boolean(v && typeof v === "object" && (v as Sealed).sealed === 1 && (v as Sealed).data);

export async function getPrivate<T>(name: string, fallback: T): Promise<T> {
  const raw = await kv.get<unknown>(name);
  if (raw == null) return fallback;
  if (!isSealed(raw)) return raw as T; // saved before encryption was added; sealed on the next save
  try {
    const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(raw.iv, "base64"));
    d.setAuthTag(Buffer.from(raw.tag, "base64"));
    return JSON.parse(Buffer.concat([d.update(Buffer.from(raw.data, "base64")), d.final()]).toString("utf8")) as T;
  } catch {
    // Never hand back an empty list here: the next save would wipe the real data.
    throw new Error(`Saved ${name} can't be unlocked. AUTH_SECRET in Vercel was changed; put the old value back and redeploy.`);
  }
}

export async function setPrivate<T>(name: string, value: T) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(JSON.stringify(value), "utf8"), c.final()]);
  await kv.set(name, { sealed: 1, iv: iv.toString("base64"), tag: c.getAuthTag().toString("base64"), data: data.toString("base64") } satisfies Sealed);
}
