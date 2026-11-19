import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";
import { addVetRequest } from "@/lib/discounts";
import { isEmail, tooMany } from "@/lib/guard";
import { notifyOwner } from "@/lib/push";

// Asking for the military & first responder discount (when he checks each one first)
export async function POST(req: Request) {
  const s = await getSettings();
  if (!s.discounts.veteran.on || !s.discounts.veteran.verify) return NextResponse.json({ error: "This isn't available right now." }, { status: 400 });
  const b = await req.json().catch(() => ({}));
  if (b.website) return NextResponse.json({ ok: true });
  if (tooMany(req, 3, 60 * 60_000)) return NextResponse.json({ error: "We've got your request. We'll be in touch soon." }, { status: 429 });
  const name = String(b.name ?? "").trim().slice(0, 80);
  const email = String(b.email ?? "").trim().slice(0, 200);
  const group = String(b.group ?? "").trim().slice(0, 60);
  if (!name || !isEmail(email) || !group) return NextResponse.json({ error: "Add your name, email, and which group you're in." }, { status: 400 });
  await addVetRequest({ name, email, group, note: String(b.note ?? "").trim().slice(0, 500) });
  await notifyOwner("Military discount request", `${name} (${group})`, "/admin/discounts?tab=military");
  return NextResponse.json({ ok: true });
}
