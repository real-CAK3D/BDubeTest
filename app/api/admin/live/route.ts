import { NextResponse } from "next/server";
import { listSessions, ONLINE_MS } from "@/lib/admin-security";
import { shoppersNow } from "@/lib/presence";

export async function GET() {
  const [shoppers, sessions] = await Promise.all([shoppersNow(), listSessions()]);
  const admins = sessions.filter((s) => Date.now() - Date.parse(s.lastSeen) < ONLINE_MS).map((s) => ({ name: s.name, device: s.device }));
  return NextResponse.json({ shoppers, admins });
}
