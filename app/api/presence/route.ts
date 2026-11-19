import { NextResponse } from "next/server";
import { tooMany } from "@/lib/guard";
import { heartbeat } from "@/lib/presence";

// "I'm still here" from an open shop page (anonymous random id + which page)
export async function POST(req: Request) {
  if (tooMany(req, 20, 60_000)) return NextResponse.json({ ok: true });
  const ua = req.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|preview|lighthouse|headless/i.test(ua)) return NextResponse.json({ ok: true });
  const b = await req.json().catch(() => ({}));
  const id = String(b.id ?? "");
  const path = String(b.path ?? "/").split("?")[0].slice(0, 80);
  if (/^[a-z0-9]{12,32}$/.test(id) && path.startsWith("/") && !path.startsWith("/admin")) await heartbeat(id, path).catch(() => {});
  return NextResponse.json({ ok: true });
}
