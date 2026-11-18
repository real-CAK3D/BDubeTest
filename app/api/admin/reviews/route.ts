import { NextResponse } from "next/server";
import { getReviews, saveReviews } from "@/lib/db";
import type { Review } from "@/lib/types";

// { id, action: "approve" | "hide" | "delete" | "feature" | "unfeature" }
export async function POST(req: Request) {
  const { id, action } = await req.json().catch(() => ({}));
  let list = await getReviews();
  const r = list.find((x) => x.id === id);
  if (!r) return NextResponse.json({ error: "That review is gone." }, { status: 404 });
  if (action === "delete") list = list.filter((x) => x.id !== id);
  else if (action === "approve") r.status = "approved";
  else if (action === "hide") (r.status = "hidden"), (r.featured = false);
  else if (action === "feature") (r.featured = true), (r.status = "approved");
  else if (action === "unfeature") r.featured = false;
  else return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  await saveReviews(list);
  return NextResponse.json({ ok: true, review: list.find((x) => x.id === id) as Review | undefined });
}
