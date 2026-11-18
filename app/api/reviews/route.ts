import { NextResponse } from "next/server";
import { getReviews, getSettings, newId, saveReviews } from "@/lib/db";
import { tooMany } from "@/lib/guard";
import { notifyOwner } from "@/lib/push";
import { saveImage } from "@/lib/upload";

// Customers send reviews here (multipart form). They wait for the owner's approval.
export async function POST(req: Request) {
  const s = await getSettings();
  if (!s.showReviews) return NextResponse.json({ error: "Reviews are turned off right now." }, { status: 403 });
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  if (form.get("website")) return NextResponse.json({ ok: true }); // bot trap
  if (tooMany(req, 3, 60 * 60_000)) return NextResponse.json({ error: "Thanks! You've already sent a few reviews. Please try again later." }, { status: 429 });

  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const location = String(form.get("location") ?? "").trim().slice(0, 60);
  const item = String(form.get("item") ?? "").trim().slice(0, 80);
  const text = String(form.get("text") ?? "").trim().slice(0, 1500);
  const rating = Math.min(5, Math.max(1, Math.round(Number(form.get("rating")) || 5)));
  if (!name) return NextResponse.json({ error: "Add your name (first name is fine)." }, { status: 400 });
  if (text.length < 5) return NextResponse.json({ error: "Write a few words about your experience." }, { status: 400 });

  let photo = "";
  const file = form.get("photo");
  if (file instanceof File && file.size > 0) {
    try {
      photo = await saveImage(file, "reviews");
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
  }

  const list = await getReviews();
  list.unshift({ id: newId(), createdAt: new Date().toISOString(), name, location, item, text, rating, photo, status: "pending", featured: false });
  await saveReviews(list);
  await notifyOwner(`New review from ${name} (${"★".repeat(rating)})`, `${text.slice(0, 100)} Approve it in Reviews.`, "/admin/reviews");
  return NextResponse.json({ ok: true });
}
