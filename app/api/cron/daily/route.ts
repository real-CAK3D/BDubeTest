import { NextResponse } from "next/server";
import { backupToGitHub, lastBackup } from "@/lib/backup";
import { runChecks } from "@/lib/health";
import { notifyOwner } from "@/lib/push";
import { kv } from "@/lib/store";

/*
 * Runs once a day (vercel.json "crons"): checks the shop and tells the owner's
 * phone if something important is broken, and saves the weekly backup.
 * Vercel signs the call with CRON_SECRET when that's set.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret ? req.headers.get("authorization") !== `Bearer ${secret}` : !req.headers.get("user-agent")?.startsWith("vercel-cron")) return new NextResponse("Not allowed", { status: 401 });
  // at most once every 20 hours, however often it's called
  const last = (await kv.get<number>("cron:daily")) ?? 0;
  if (Date.now() - last < 20 * 3600_000) return NextResponse.json({ skipped: true });
  await kv.set("cron:daily", Date.now());

  const checks = await runChecks(true);
  const bad = checks.filter((c) => c.level === "bad");
  if (bad.length) await notifyOwner(`Shop needs attention: ${bad[0].label}`, bad.map((c) => c.detail).join(" "), "/admin/health");

  const b = await lastBackup().catch(() => null);
  let backup = null;
  if (!b || Date.now() - Date.parse(b.at) > 6.5 * 86400_000) backup = await backupToGitHub();
  return NextResponse.json({ checks: checks.length, bad: bad.length, backup });
}
