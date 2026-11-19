import { NextResponse } from "next/server";
import { answer, logQuestion, type ChatTurn } from "@/lib/chat";
import { getSettings } from "@/lib/db";
import { tooMany } from "@/lib/guard";

// The shop's "Ask us" chat: { messages: [{ role, content }, ...] } -> { reply }
export async function POST(req: Request) {
  const s = await getSettings();
  if (!s.chat.on) return NextResponse.json({ error: "Chat is off." }, { status: 404 });
  if (tooMany(req, 25, 10 * 60_000)) return NextResponse.json({ reply: "You've asked a lot of questions in a short time. Send us a message on the Contact page and we'll answer them all." });
  const b = await req.json().catch(() => ({}));
  const turns: ChatTurn[] = (Array.isArray(b.messages) ? b.messages : [])
    .slice(-10)
    .map((m: { role?: string; content?: unknown }) => ({ role: m.role === "assistant" ? ("assistant" as const) : ("user" as const), content: String(m.content ?? "").slice(0, 800) }))
    .filter((m: ChatTurn) => m.content.trim());
  if (!turns.length || turns.at(-1)!.role !== "user") return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
  while (turns[0]?.role === "assistant") turns.shift(); // the conversation has to start with the customer
  const out = await answer(turns);
  await logQuestion({ at: new Date().toISOString(), q: turns.at(-1)!.content.slice(0, 300), answered: out.answered, faq: out.faq }).catch(() => {});
  return NextResponse.json({ reply: out.reply });
}
