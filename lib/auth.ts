// Works in both the edge middleware and Node route handlers (Web Crypto only).
export const SESSION_COOKIE = "owner_session";
/*
 * EDIT-POINT: LOGIN
 * How many days the owner stays logged in. The password itself is the
 * ADMIN_PASSWORD environment variable in Vercel, not in the code.
 */
export const SESSION_DAYS = 60;

function secret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  // on the live site a guessable key would let anyone fake a login, so it's required there
  if (process.env.VERCEL) throw new Error("AUTH_SECRET isn't set. Add it in Vercel > Settings > Environment Variables, then redeploy.");
  return "fallback:" + (process.env.ADMIN_PASSWORD || "changeme"); // your own computer only
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Signed login token: expiry, session id (one per phone or computer), signature. */
export async function createSessionToken(sessionId: string) {
  const exp = Date.now() + SESSION_DAYS * 86400_000;
  return `${exp}.${sessionId}.${await hmac(`${exp}.${sessionId}`)}`;
}

/** The session id if the token is genuine and not expired, else null. */
export async function verifySessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const [exp, sid, sig] = token.split(".");
  if (!exp || !sid || !sig || Number(exp) < Date.now()) return null;
  try {
    return (await same(sig, await hmac(`${exp}.${sid}`))) ? sid : null;
  } catch {
    return null; // no AUTH_SECRET: nobody is signed in
  }
}

// The PIN lock hands out a short pass that lets the login screen show.
export const GATE_COOKIE = "owner_gate";
export const GATE_MINUTES = 10;

export async function createGateToken() {
  const exp = Date.now() + GATE_MINUTES * 60_000;
  return `${exp}.${await hmac(`gate.${exp}`)}`;
}

export async function verifyGateToken(token: string | undefined | null) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, await hmac(`gate.${exp}`)).catch(() => false);
}

async function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  // Only allow the default password while developing on your own computer.
  return process.env.NODE_ENV === "production" ? null : "changeme";
}
