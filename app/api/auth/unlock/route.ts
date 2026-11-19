import { NextResponse } from "next/server";
import { checkLock, clearFails, lockedFor, recordFail, visitorKey } from "@/lib/admin-security";
import { createGateToken, GATE_COOKIE, GATE_MINUTES } from "@/lib/auth";

// The PIN / passcode lock in front of the login screen.
export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({ code: "" }));
  const who = visitorKey(req, "lock");
  const wait = await lockedFor(who);
  if (wait) return NextResponse.json({ error: `Locked. Try again in ${wait} minute${wait === 1 ? "" : "s"}.` }, { status: 429 });
  if (typeof code !== "string" || !code || !(await checkLock(code))) {
    await new Promise((r) => setTimeout(r, 600));
    const left = await recordFail(who);
    return NextResponse.json({ error: left <= 2 ? `Wrong code. ${left} more tr${left === 1 ? "y" : "ies"} before a 15-minute lockout.` : "Wrong code." }, { status: 401 });
  }
  await clearFails(who);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, await createGateToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: GATE_MINUTES * 60 });
  return res;
}
