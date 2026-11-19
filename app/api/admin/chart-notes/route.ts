import { NextResponse } from "next/server";
import { newId } from "@/lib/db";
import { getChartNotes, saveChartNotes } from "@/lib/insights";
import { mutating } from "@/lib/store";

// Notes pinned to a day on the sales chart ("Craft fair", "Facebook ad started")
async function handlePOST(req: Request) {
  const b = await req.json().catch(() => ({}));
  let list = await getChartNotes();
  if (b.action === "delete") list = list.filter((n) => n.id !== b.id);
  else if (/^\d{4}-\d{2}-\d{2}$/.test(String(b.date)) && String(b.text ?? "").trim()) list.push({ id: newId(), date: String(b.date), text: String(b.text).trim().slice(0, 80) });
  else return NextResponse.json({ error: "Pick a day and write a short note." }, { status: 400 });
  await saveChartNotes(list.sort((a, b) => a.date.localeCompare(b.date)));
  return NextResponse.json(list);
}

export const POST = mutating(handlePOST);
