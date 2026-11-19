import { NextResponse } from "next/server";
import { addSession, clearFails, lockedFor, lockInfo, recordFail, visitorKey } from "@/lib/admin-security";
import { createSessionToken, GATE_COOKIE, SESSION_COOKIE, SESSION_DAYS, verifyGateToken } from "@/lib/auth";
import { checkPassword } from "@/lib/password";

export async function POST(req: Request) {
  const { password, name } = await req.json().catch(() => ({ password: "" }));
  const who = visitorKey(req, "login");
  const wait = await lockedFor(who);
  if (wait) return NextResponse.json({ error: `Too many wrong tries. Try again in ${wait} minute${wait === 1 ? "" : "s"}.` }, { status: 429 });
  // with the PIN lock on, the password only works after the PIN was entered
  if ((await lockInfo()).on) {
    const gate = req.headers.get("cookie")?.match(new RegExp(`${GATE_COOKIE}=([^;]+)`))?.[1];
    if (!(await verifyGateToken(gate))) return NextResponse.json({ error: "Enter the lock code first.", locked: true }, { status: 403 });
  }
  const ok = typeof password === "string" && password ? await checkPassword(password) : false;
  if (ok === null) {
    return NextResponse.json(
      { error: "No owner password is set. Add ADMIN_PASSWORD in Vercel > Settings > Environment Variables, then redeploy." },
      { status: 500 }
    );
  }
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    const left = await recordFail(who);
    return NextResponse.json({ error: `That password isn't right.${left <= 2 ? ` ${left} more tr${left === 1 ? "y" : "ies"} before a 15-minute lockout.` : ""}` }, { status: 401 });
  }
  await clearFails(who);
  const sid = await addSession(String(name ?? ""), req.headers.get("user-agent") ?? "");
  const res = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, await createSessionToken(sid), { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86400 });
  res.cookies.set(GATE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
