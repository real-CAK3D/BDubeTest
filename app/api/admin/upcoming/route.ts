import { NextResponse } from "next/server";
import { clearInterest } from "@/lib/upcoming";

// { action: "clear", id } resets the "I want this" count and email list for one item
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (b.action === "clear" && typeof b.id === "string") {
    await clearInterest(b.id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
