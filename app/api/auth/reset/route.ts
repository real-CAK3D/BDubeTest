import { NextResponse } from "next/server";
import { redeemResetToken } from "@/lib/admin-accounts";
import { endAccountSessions, recordFail, visitorKey } from "@/lib/admin-security";

// The page from the emailed reset link: { token, password }
export async function POST(req: Request) {
  const { token, password } = await req.json().catch(() => ({}));
  if (typeof password !== "string" || password.length < 8) return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });
  const a = await redeemResetToken(String(token ?? ""), password);
  if (!a) {
    await recordFail(visitorKey(req, "forgot"));
    return NextResponse.json({ error: "That link has expired or was already used. Ask for a new one." }, { status: 400 });
  }
  await endAccountSessions(a.id);
  return NextResponse.json({ ok: true });
}
