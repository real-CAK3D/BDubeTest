import { NextResponse } from "next/server";
import { getPushSubs, savePushSubs, type PushSub } from "@/lib/db";
import { notifyOwner, pushConfigured } from "@/lib/push";
import { mutating } from "@/lib/store";
import { getSession } from "@/lib/admin-security";
import { currentSession } from "@/lib/session";

async function handlePOST(req: Request) {
  const b = await req.json();
  if (b.test) {
    if (!(await pushConfigured())) return NextResponse.json({ error: "Notification keys aren't set up yet." }, { status: 400 });
    await notifyOwner("Test notification", "Notifications are working on this device.", "/admin");
    return NextResponse.json({ ok: true });
  }
  const sub = b.subscription as PushSub;
  if (!sub?.endpoint || !sub.keys?.p256dh) return NextResponse.json({ error: "Bad subscription" }, { status: 400 });
  const subs = (await getPushSubs()).filter((s) => s.endpoint !== sub.endpoint);
  const sid = await currentSession();
  const who = sid ? (await getSession(sid))?.name : undefined;
  const old = (await getPushSubs()).find((s) => s.endpoint === sub.endpoint);
  subs.push({ endpoint: sub.endpoint, keys: sub.keys, label: String(b.label ?? old?.label ?? "").slice(0, 60), ...(who ? { who } : {}) });
  await savePushSubs(subs);
  return NextResponse.json({ ok: true, devices: subs.length });
}

async function handleDELETE(req: Request) {
  const { endpoint } = await req.json();
  await savePushSubs((await getPushSubs()).filter((s) => s.endpoint !== endpoint));
  return NextResponse.json({ ok: true });
}

export const POST = mutating(handlePOST);

export const DELETE = mutating(handleDELETE);
