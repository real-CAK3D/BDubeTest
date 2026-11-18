import { NextResponse } from "next/server";
import { getRequests, getSettings, newId, saveRequests } from "@/lib/db";
import { isEmail, tooMany } from "@/lib/guard";
import { notifyOwner } from "@/lib/push";
import { saveImage } from "@/lib/upload";

// The custom order request form (multipart). Requests land in Dashboard > Requests.
export async function POST(req: Request) {
  const s = await getSettings();
  if (!s.showCustomOrders) return NextResponse.json({ error: "We're not taking custom requests right now." }, { status: 403 });
  const f = await req.formData().catch(() => null);
  if (!f) return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  if (f.get("website")) return NextResponse.json({ ok: true }); // bot trap
  if (tooMany(req, 4, 60 * 60_000)) return NextResponse.json({ error: "You've sent a few requests already. We'll be in touch, or email us directly." }, { status: 429 });

  const get = (k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
  const name = get("name", 80);
  const email = get("email", 200);
  const details = get("details", 4000);
  if (!name) return NextResponse.json({ error: "Add your name." }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Add an email address so we can send you a quote." }, { status: 400 });
  if (details.length < 10) return NextResponse.json({ error: "Tell us a bit about what you'd like made." }, { status: 400 });

  const photos: string[] = [];
  for (const file of f.getAll("photos").slice(0, 3)) {
    if (file instanceof File && file.size > 0) {
      try {
        photos.push(await saveImage(file, "requests"));
      } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 400 });
      }
    }
  }

  const list = await getRequests();
  const number = list.reduce((m, r) => Math.max(m, r.number), 100) + 1;
  const kind = get("kind", 60);
  const quantity = Math.min(10000, Math.max(1, parseInt(get("quantity", 6), 10) || 1));
  list.unshift({
    id: newId(),
    number,
    createdAt: new Date().toISOString(),
    name,
    email,
    phone: get("phone", 40),
    kind,
    quantity,
    details,
    engraving: get("engraving", 500),
    neededBy: /^\d{4}-\d{2}-\d{2}$/.test(get("neededBy", 10)) ? get("neededBy", 10) : "",
    budget: get("budget", 60),
    zip: get("zip", 10),
    photos,
    status: "new",
    note: "",
  });
  await saveRequests(list);
  await notifyOwner(`Custom request #${number}: ${quantity > 1 ? `${quantity} x ` : ""}${kind || "custom piece"}`, `${name}: ${details.slice(0, 100)}`, "/admin/requests");
  return NextResponse.json({ ok: true, number });
}
