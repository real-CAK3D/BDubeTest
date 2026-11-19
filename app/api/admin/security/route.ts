import { NextResponse } from "next/server";
import { clearLock, endOtherSessions, endSession, listSessions, lockInfo, setLock, sharedStorage } from "@/lib/admin-security";
import { currentSession } from "@/lib/session";

export async function GET() {
  const [lock, sessions, me] = await Promise.all([lockInfo(), listSessions(), currentSession()]);
  return NextResponse.json({ lock, sessions, me, shared: sharedStorage() });
}

// { action: "lock", kind, code } | { action: "unlock" } | { action: "signout", id } | { action: "signoutOthers" }
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const me = await currentSession();
  if (b.action === "lock") {
    const kind = b.kind === "passcode" ? "passcode" : "pin";
    const code = String(b.code ?? "");
    if (kind === "pin" && !/^\d{4}$/.test(code)) return NextResponse.json({ error: "The PIN must be exactly 4 digits." }, { status: 400 });
    if (kind === "passcode" && code.length < 6) return NextResponse.json({ error: "Use at least 6 characters for the passcode." }, { status: 400 });
    await setLock(kind, code);
  } else if (b.action === "unlock") await clearLock();
  else if (b.action === "signout" && typeof b.id === "string") await endSession(b.id);
  else if (b.action === "signoutOthers" && me) await endOtherSessions(me);
  else return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  const [lock, sessions] = await Promise.all([lockInfo(), listSessions()]);
  return NextResponse.json({ ok: true, lock, sessions, me, shared: sharedStorage() });
}
