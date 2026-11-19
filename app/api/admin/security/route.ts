import { NextResponse } from "next/server";
import { inviteUntil, listAccounts, markForReset, openInvite, removeAccount, setEmail } from "@/lib/admin-accounts";
import { clearLock, endAccountSessions, endOtherSessions, endSession, getSession, listSessions, lockInfo, setLock, sharedStorage } from "@/lib/admin-security";
import { currentSession } from "@/lib/session";
import { mutating } from "@/lib/store";

export async function GET() {
  const [lock, sessions, me, accounts] = await Promise.all([lockInfo(), listSessions(), currentSession(), accountList()]);
  return NextResponse.json({ lock, sessions, me, shared: sharedStorage(), accounts, invite: await inviteUntil() });
}

// { action: "lock", kind, code } | { action: "unlock" } | { action: "signout", id } | { action: "signoutOthers" }
async function handlePOST(req: Request) {
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
  else if (b.action === "resetAccount" && typeof b.id === "string") {
    await markForReset(b.id);
    await endAccountSessions(b.id);
  } else if (b.action === "removeAccount" && typeof b.id === "string") {
    const mine = me ? (await getSession(me))?.account : undefined;
    if (mine === b.id) return NextResponse.json({ error: "You can't remove yourself while signed in." }, { status: 400 });
    await removeAccount(b.id);
    await endAccountSessions(b.id);
  } else if (b.action === "email" && typeof b.id === "string") await setEmail(b.id, String(b.email ?? ""));
  else if (b.action === "invite") await openInvite(b.close ? 0 : 24);
  else return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  const [lock, sessions, accounts] = await Promise.all([lockInfo(), listSessions(), accountList()]);
  return NextResponse.json({ ok: true, lock, sessions, me, shared: sharedStorage(), accounts, invite: await inviteUntil() });
}

// names, emails and last sign-in only; never password data
async function accountList() {
  return (await listAccounts()).map((a) => ({ id: a.id, name: a.name, email: a.email, lastLogin: a.lastLogin, mustChange: a.mustChange }));
}

export const POST = mutating(handlePOST);
