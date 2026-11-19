import { NextResponse } from "next/server";
import { getNotifications, saveNotifications } from "@/lib/db";
import { mutating } from "@/lib/store";

async function handlePOST() {
  const list = await getNotifications();
  list.forEach((n) => (n.read = true));
  await saveNotifications(list);
  return NextResponse.json({ ok: true });
}

async function handleDELETE() {
  await saveNotifications([]);
  return NextResponse.json({ ok: true });
}

export const POST = mutating(handlePOST);

export const DELETE = mutating(handleDELETE);
