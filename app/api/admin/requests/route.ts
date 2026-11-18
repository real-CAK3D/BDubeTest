import { NextResponse } from "next/server";
import { getRequests, saveRequests } from "@/lib/db";
import type { RequestStatus } from "@/lib/types";

const STATUSES: RequestStatus[] = ["new", "quoted", "accepted", "declined", "done"];

// { id, status?, note? } or { id, delete: true }
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  let list = await getRequests();
  const r = list.find((x) => x.id === b.id);
  if (!r) return NextResponse.json({ error: "That request is gone." }, { status: 404 });
  if (b.delete) list = list.filter((x) => x.id !== b.id);
  else {
    if (STATUSES.includes(b.status)) r.status = b.status;
    if (typeof b.note === "string") r.note = b.note.slice(0, 4000);
  }
  await saveRequests(list);
  return NextResponse.json({ ok: true, request: b.delete ? null : r });
}
