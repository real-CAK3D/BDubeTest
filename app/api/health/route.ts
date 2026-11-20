import { NextResponse } from "next/server";
import { storeWorks } from "@/lib/health";

// For an uptime monitor (UptimeRobot etc.): 200 when the shop is up and can save, 503 if not. Shows nothing private.
export const dynamic = "force-dynamic";
export async function GET() {
  const ok = await storeWorks().catch(() => false);
  return NextResponse.json({ ok }, { status: ok ? 200 : 503, headers: { "cache-control": "no-store" } });
}
