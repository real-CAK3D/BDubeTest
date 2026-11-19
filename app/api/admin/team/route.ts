import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-security";
import { currentSession } from "@/lib/session";
import { getTeamChat, markTeamRead, postTeam, teamOnline } from "@/lib/team-chat";

async function who() {
  const sid = await currentSession();
  return (sid ? (await getSession(sid))?.name : "") || "Owner";
}

// Team chat: GET -> the conversation; POST { text, link? } sends, { action: "read" } marks it read
export async function GET() {
  const [msgs, online, name] = await Promise.all([getTeamChat(), teamOnline(), who()]);
  return NextResponse.json({ msgs: msgs.slice(-200), online, me: name });
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = await who();
  if (b.action === "read") {
    await markTeamRead(name);
    return NextResponse.json({ ok: true });
  }
  const link = typeof b.link === "string" && /^\/admin(\/[\w/?=&.-]*)?$/.test(b.link) ? b.link : undefined;
  const m = await postTeam(name, String(b.text ?? ""), link);
  return m ? NextResponse.json({ ok: true, msg: m }) : NextResponse.json({ error: "Type a message first." }, { status: 400 });
}
