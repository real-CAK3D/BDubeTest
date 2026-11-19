import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

/** The signed-in session id, or null. */
export async function currentSession() {
  const c = await cookies();
  return verifySessionToken(c.get(SESSION_COOKIE)?.value);
}

export async function isOwner() {
  return Boolean(await currentSession());
}
