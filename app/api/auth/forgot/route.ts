import { NextResponse } from "next/server";
import { checkResetCode, findAccount, makeResetToken, setOwnPassword } from "@/lib/admin-accounts";
import { endAccountSessions, lockedFor, recordFail, visitorKey } from "@/lib/admin-security";
import { getSettings } from "@/lib/db";
import { emailReady, sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/stripe";

// { name } emails a reset link (if that person saved an email); { name, code, password } uses OWNER_RESET_CODE
export async function POST(req: Request) {
  const who = visitorKey(req, "forgot");
  const wait = await lockedFor(who);
  if (wait) return NextResponse.json({ error: `Too many tries. Try again in ${wait} minutes.` }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const a = await findAccount(String(b.name ?? ""));
  if (b.code !== undefined) {
    if (!checkResetCode(String(b.code))) {
      await recordFail(who);
      return NextResponse.json({ error: "That reset code isn't right (or OWNER_RESET_CODE isn't set in Vercel)." }, { status: 400 });
    }
    if (typeof b.password !== "string" || b.password.length < 8) return NextResponse.json({ error: "Use at least 8 characters for the new password." }, { status: 400 });
    const acc = await setOwnPassword(a?.name ?? String(b.name ?? "Owner"), b.password);
    await endAccountSessions(acc.id);
    return NextResponse.json({ ok: true, message: "Password set. Sign in with it now." });
  }
  // same answer whether or not the name exists, so names can't be fished for
  const generic = { ok: true, message: "If that name has an email saved, a reset link is on its way. It works for 30 minutes." };
  await recordFail(who); // counts toward the lockout so this can't be used to spam
  const s = await getSettings();
  if (a?.email && (await emailReady(s.emailFrom))) {
    const token = await makeResetToken(a);
    await sendEmail({
      from: s.emailFrom,
      to: a.email,
      subject: `Reset your ${s.businessName} dashboard password`,
      text: `Hi ${a.name},\n\nSomeone (hopefully you) asked to reset your dashboard password. This link works for 30 minutes:\n\n${siteUrl(req)}/admin/reset?t=${token}\n\nIf it wasn't you, ignore this email; nothing changes.`,
    }).catch(() => {});
  }
  return NextResponse.json(generic);
}
