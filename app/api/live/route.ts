import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";
import { tooMany } from "@/lib/guard";
import { availableAgents, customerChat, customerEnd, customerSend, forCustomer, startChat } from "@/lib/live-chat";

// Live chat, the customer's side.
//  GET               -> { available, names }   (is anyone free to chat?)
//  GET ?id&token     -> the customer's own conversation
//  POST start | send | end
export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("id");
  const token = u.searchParams.get("token") ?? "";
  if (id) {
    const c = await customerChat(id, token);
    if (!c) return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    return NextResponse.json({ ...forCustomer(c), available: (await availableAgents()).length > 0 });
  }
  const s = await getSettings();
  const names = s.chat.live === false ? [] : await availableAgents();
  return NextResponse.json({ available: names.length > 0, names });
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (b.action === "start") {
    if (tooMany(req, 5, 60 * 60_000)) return NextResponse.json({ error: "You've started a few chats already. Leave us a message on the Contact page instead." }, { status: 429 });
    const s = await getSettings();
    if (s.chat.live === false || !(await availableAgents()).length) return NextResponse.json({ error: "Nobody's free to chat right now." }, { status: 409 });
    const c = await startChat({ name: b.name, text: b.text, page: b.page, earlier: Array.isArray(b.earlier) ? b.earlier : [] });
    return NextResponse.json({ id: c.id, token: c.token, ...forCustomer(c) });
  }
  const id = String(b.id ?? "");
  const token = String(b.token ?? "");
  if (b.action === "send") {
    if (tooMany(new Request(new URL("/api/live/send", req.url), { headers: req.headers }), 60, 10 * 60_000)) return NextResponse.json({ error: "Slow down a little, please." }, { status: 429 });
    const c = await customerSend(id, token, String(b.text ?? ""));
    if (!c) return NextResponse.json({ error: "This chat has ended." }, { status: 410 });
    return NextResponse.json(forCustomer(c));
  }
  if (b.action === "end") {
    await customerEnd(id, token);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
