import { NextResponse } from "next/server";
import { setOwnPassword } from "@/lib/admin-accounts";
import { finishSession, getSession } from "@/lib/admin-security";
import { isEmail } from "@/lib/guard";
import { checkPassword } from "@/lib/password";
import { currentSession } from "@/lib/session";

// Right after signing in with the starter password: choose your own.
export async function POST(req: Request) {
  const sid = await currentSession();
  const s = sid ? await getSession(sid) : null;
  if (!sid || !s?.pending) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { password, email } = await req.json().catch(() => ({}));
  if (typeof password !== "string" || password.length < 8) return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });
  if (await checkPassword(password)) return NextResponse.json({ error: "Pick something different from the starter password." }, { status: 400 });
  const mail = String(email ?? "").trim();
  if (mail && !isEmail(mail)) return NextResponse.json({ error: "Check the email address." }, { status: 400 });
  const a = await setOwnPassword(s.name, password, mail);
  await finishSession(sid, a.id);
  return NextResponse.json({ ok: true });
}
