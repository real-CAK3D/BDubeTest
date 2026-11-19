import { ChatManager } from "@/components/admin/ChatManager";
import { chatSuggestions, getChatLog } from "@/lib/chat";
import { getSettings } from "@/lib/db";
import { getKey } from "@/lib/keys";

export const metadata = { title: "Chat" };

export default async function ChatPage() {
  const [s, log, key] = await Promise.all([getSettings(), getChatLog(), getKey("AI_API_KEY").then(async (k) => k ?? (await getKey("ANTHROPIC_API_KEY")))]);
  const suggestions = await chatSuggestions(log, s).catch(() => []);
  return <ChatManager initial={s} log={log} hasKey={Boolean(key)} suggestions={suggestions} />;
}
