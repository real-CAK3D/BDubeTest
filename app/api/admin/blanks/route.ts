import { NextResponse } from "next/server";
import { getBlanks, saveBlanks } from "@/lib/blanks";
import { newId } from "@/lib/db";
import type { Blank } from "@/lib/types";
import { mutating } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await getBlanks());
}

// The whole list, saved at once
async function handlePUT(req: Request) {
  const body = await req.json().catch(() => []);
  const list: Blank[] = (Array.isArray(body) ? body : []).slice(0, 500).map((b: Partial<Blank>) => ({
    id: typeof b.id === "string" && b.id ? b.id.slice(0, 40) : newId(),
    name: String(b.name ?? "").trim().slice(0, 80) || "Blank",
    qty: Math.max(0, Math.round(Number(b.qty) || 0)),
    low: Math.max(0, Math.round(Number(b.low) || 0)),
    cost: Math.max(0, Math.round(Number(b.cost) || 0)),
    note: String(b.note ?? "").slice(0, 200),
  }));
  await saveBlanks(list);
  return NextResponse.json(list);
}

export const PUT = mutating(handlePUT);
