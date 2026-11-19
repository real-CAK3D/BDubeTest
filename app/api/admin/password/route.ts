import { NextResponse } from "next/server";
import { checkOwn, findAccount, setOwnPassword } from "@/lib/admin-accounts";
import { getSession } from "@/lib/admin-security";
import { checkPassword, setPassword } from "@/lib/password";
import { currentSession } from "@/lib/session";

// { current, next } changes your own password; { kind: "starter", current, next } changes the starter password for new admins
export async function POST(req: Request) {
  const { current, next, kind } = await req.json().catch(() => ({}));
  if (typeof next !== "string" || next.length < 8) return NextResponse.json({ error: "Use at least 8 characters for the new password." }, { status: 400 });
  const sid = await currentSession();
  const s = sid ? await getSession(sid) : null;
  if (kind === "starter" || !s?.name) {
    if (!(await checkPassword(String(current ?? "")))) return NextResponse.json({ error: "The current starter password isn't right." }, { status: 400 });
    await setPassword(next);
    return NextResponse.json({ ok: true, message: "Starter password changed. New admins use it the first time they sign in." });
  }
  const a = await findAccount(s.name);
  if (!a || !checkOwn(a, String(current ?? ""))) return NextResponse.json({ error: "Your current password isn't right." }, { status: 400 });
  await setOwnPassword(a.name, next);
  return NextResponse.json({ ok: true, message: "Password changed. Use the new one next time you sign in." });
}
