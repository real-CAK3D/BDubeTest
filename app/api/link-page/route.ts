import { NextResponse } from "next/server";
import { tooMany } from "@/lib/guard";
import { countLinkPage } from "@/lib/link-stats";

// Counts a visit ("v") or a tap on one of the Socials page links (its id). Anonymous.
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|preview|lighthouse|headless|facebookexternalhit/i.test(ua) || tooMany(req, 60, 60_000)) return NextResponse.json({ ok: true });
  const body = await req.json().catch(() => ({}));
  const what = String(body?.what ?? "");
  if (/^(v|shop|[a-z0-9]{1,20})$/i.test(what)) await countLinkPage(what).catch(() => {});
  return NextResponse.json({ ok: true });
}
