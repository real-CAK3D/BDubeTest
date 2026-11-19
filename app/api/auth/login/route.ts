import { NextResponse } from "next/server";
import { checkOwn, findAccount, touchLogin } from "@/lib/admin-accounts";
import { addSession, clearFails, lockedFor, lockInfo, recordFail, visitorKey } from "@/lib/admin-security";
import { createSessionToken, GATE_COOKIE, SESSION_COOKIE, SESSION_DAYS, verifyGateToken } from "@/lib/auth";
import { checkPassword } from "@/lib/password";

// Name + password. A new name (or one that was reset) signs in with the starter
// password and is asked to choose their own straight away.
export async function POST(req: Request) {
  const { password, name } = await req.json().catch(() => ({ password: "" }));
  const who = visitorKey(req, "login");
  const wait = await lockedFor(who);
  if (wait) return NextResponse.json({ error: `Too many wrong tries. Try again in ${wait} minute${wait === 1 ? "" : "s"}.` }, { status: 429 });
  if ((await lockInfo()).on) {
    const gate = req.headers.get("cookie")?.match(new RegExp(`${GATE_COOKIE}=([^;]+)`))?.[1];
    if (!(await verifyGateToken(gate))) return NextResponse.json({ error: "Enter the lock code first.", locked: true }, { status: 403 });
  }
  const person = String(name ?? "").trim().slice(0, 30);
  if (!person) return NextResponse.json({ error: "Type your name." }, { status: 400 });
  if (typeof password !== "string" || !password) return NextResponse.json({ error: "Type your password." }, { status: 400 });

  const account = await findAccount(person);
  let ok: boolean | null;
  let pending = false;
  if (account && !account.mustChange) ok = checkOwn(account, password);
  else {
    ok = await checkPassword(password); // the starter password
    pending = true;
  }
  if (ok === null) {
    return NextResponse.json({ error: "No starter password is set. Add ADMIN_PASSWORD in Vercel > Settings > Environment Variables, then redeploy." }, { status: 500 });
  }
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    const left = await recordFail(who);
    const hint = account && !account.mustChange ? " Use your own password (not the starter one)." : "";
    return NextResponse.json({ error: `That password isn't right.${hint}${left <= 2 ? ` ${left} more tr${left === 1 ? "y" : "ies"} before a 15-minute lockout.` : ""}` }, { status: 401 });
  }
  await clearFails(who);
  if (account && !pending) await touchLogin(account);
  const sid = await addSession(account?.name ?? person, req.headers.get("user-agent") ?? "", { account: account?.id, pending });
  const res = NextResponse.json({ ok: true, choosePassword: pending });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, await createSessionToken(sid), { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86400 });
  res.cookies.set(GATE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
