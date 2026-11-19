import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

/** The signed-in session id, or null. */
export async function currentSession() {
  const c = await cookies();
  return verifySessionToken(c.get(SESSION_COOKIE)?.value);
}

/** Signed in as the owner, and the device hasn't been signed out. For showing owner-only extras. */
export async function signedInOwner() {
  const sid = await currentSession();
  if (!sid) return false;
  const { touchSession } = await import("./admin-security");
  return touchSession(sid).catch(() => false);
}

export async function isOwner() {
  return Boolean(await currentSession());
}
