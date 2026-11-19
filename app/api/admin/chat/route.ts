import { NextResponse } from "next/server";
import { answer, clearChatLog, getChatLog } from "@/lib/chat";

export async function GET() {
  return NextResponse.json(await getChatLog());
}

// { action: "clear", q? } removes one question (or all) from the list; { action: "test", q } tries the chat
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (b.action === "clear") {
    await clearChatLog(typeof b.q === "string" ? b.q : undefined);
    return NextResponse.json(await getChatLog());
  }
  if (b.action === "test" && typeof b.q === "string") return NextResponse.json(await answer([{ role: "user", content: b.q.slice(0, 800) }], { req }));
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
