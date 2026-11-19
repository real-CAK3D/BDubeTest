import { NextResponse } from "next/server";
import { endSession } from "@/lib/admin-security";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const token = req.headers.get("cookie")?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  const sid = await verifySessionToken(token);
  if (sid) await endSession(sid).catch(() => {});
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
