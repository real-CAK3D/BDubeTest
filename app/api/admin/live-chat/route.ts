import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-security";
import { adminClose, adminDelete, adminRead, adminSend, agentHere, agentLeave, availableAgents, chatToInbox, listChats } from "@/lib/live-chat";
import { currentSession } from "@/lib/session";

async function me() {
  const sid = await currentSession();
  const s = sid ? await getSession(sid) : null;
  return { sid: sid ?? "", name: s?.name || "Owner" };
}

// Live chat, the dashboard's side.
export async function GET() {
  const chats = await listChats();
  return NextResponse.json({ chats, agents: await availableAgents() });
}

//  { action: "here", on? }    checks in (every 30s while a dashboard page is on screen); on = the Available switch
//  { action: "away" }         the dashboard was closed
//  { action: "send", id, text } | "read" | "close" | "delete" | "inbox"
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const { sid, name } = await me();
  const id = String(b.id ?? "");
  switch (b.action) {
    case "here": {
      const on = await agentHere(sid, name, typeof b.on === "boolean" ? b.on : undefined);
      const chats = await listChats();
      return NextResponse.json({ on, waiting: chats.filter((c) => c.status !== "closed" && c.unread > 0).length, chats: chats.filter((c) => c.status !== "closed").map((c) => ({ id: c.id, name: c.name, unread: c.unread, status: c.status })) });
    }
    case "away":
      await agentLeave(sid);
      return NextResponse.json({ ok: true });
    case "send": {
      const c = await adminSend(id, String(b.text ?? ""), name.split(" ")[0]);
      return c ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "That chat is gone." }, { status: 404 });
    }
    case "read":
      await adminRead(id);
      return NextResponse.json({ ok: true });
    case "close":
      await adminClose(id, name.split(" ")[0]);
      return NextResponse.json({ ok: true });
    case "delete":
      await adminDelete(id);
      return NextResponse.json({ ok: true });
    case "inbox":
      return NextResponse.json({ ok: await chatToInbox(id) });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
