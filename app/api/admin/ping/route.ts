import { NextResponse } from "next/server";

// The login check in middleware.ts marks the device as active; nothing else to do.
export async function POST() {
  return NextResponse.json({ ok: true });
}
