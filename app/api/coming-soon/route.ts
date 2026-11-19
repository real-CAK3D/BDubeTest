import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";
import { isEmail, tooMany } from "@/lib/guard";
import { addNotify, addWant } from "@/lib/upcoming";

// "What's to come": { id, action: "want" | "unwant" } or { id, action: "notify", email }
export async function POST(req: Request) {
  if (tooMany(req, 30, 10 * 60_000)) return NextResponse.json({ error: "Too many taps. Try again in a bit." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const item = (await getSettings()).upcoming.items.find((x) => x.id === b.id && !x.hidden);
  if (!item) return NextResponse.json({ error: "That isn't on the list any more." }, { status: 404 });
  if (b.action === "want" || b.action === "unwant") return NextResponse.json({ wants: await addWant(item.id, b.action === "unwant") });
  if (b.action === "notify") {
    const email = String(b.email ?? "").trim().slice(0, 200);
    if (!isEmail(email)) return NextResponse.json({ error: "Type your email so we can tell you." }, { status: 400 });
    await addNotify(item.id, item.title, email);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
