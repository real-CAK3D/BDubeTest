import { ChatManager } from "@/components/admin/ChatManager";
import { getChatLog } from "@/lib/chat";
import { getSettings } from "@/lib/db";
import { getKey } from "@/lib/keys";

export const metadata = { title: "Chat" };

export default async function ChatPage() {
  const [s, log, key] = await Promise.all([getSettings(), getChatLog(), getKey("ANTHROPIC_API_KEY")]);
  return <ChatManager initial={s} log={log} hasKey={Boolean(key)} />;
}
