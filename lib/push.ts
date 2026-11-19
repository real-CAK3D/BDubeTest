import "server-only";
import webpush from "web-push";
import { getNotifications, getPushSubs, newId, saveNotifications, savePushSubs } from "./db";
import { getKey, saveKey } from "./keys";
import { withLock } from "./store";
import { teamUnread } from "./team-unread";

export async function vapidKeys() {
  const [pub, priv] = await Promise.all([getKey("NEXT_PUBLIC_VAPID_PUBLIC_KEY"), getKey("VAPID_PRIVATE_KEY")]);
  return pub && priv ? { pub, priv } : null;
}
/** The notification keys, made on first use so the owner never has to create them. */
export async function ensureVapidKeys() {
  const have = await vapidKeys();
  if (have) return have;
  const k = webpush.generateVAPIDKeys();
  // one after the other: both live in the same stored list
  await saveKey("NEXT_PUBLIC_VAPID_PUBLIC_KEY", k.publicKey);
  await saveKey("VAPID_PRIVATE_KEY", k.privateKey);
  return { pub: k.publicKey, priv: k.privateKey };
}
export const pushConfigured = async () => Boolean(await vapidKeys());

/** opts.except: don't ping that person's devices (their own team message). opts.bell: false = phone ping only, not the bell list. */
async function _notifyOwner(title: string, body: string, url = "/admin", opts: { except?: string; bell?: boolean } = {}) {
  const list = await getNotifications();
  if (opts.bell !== false) {
    list.unshift({ id: newId(), createdAt: new Date().toISOString(), title, body, url, read: false });
    await saveNotifications(list);
  }
  const unread = list.filter((n) => !n.read).length;

  const keys = await vapidKeys();
  if (!keys) return;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:owner@example.com", keys.pub, keys.priv);
  const subs = await getPushSubs();
  const dead: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      if (opts.except && s.who && s.who.toLowerCase() === opts.except.toLowerCase()) return;
      try {
        // the number on the home-screen icon: unread notifications + this person's unread team messages
        const badge = unread + (s.who ? (await teamUnread(s.who).catch(() => 0)) : 0);
        await webpush.sendNotification(s, JSON.stringify({ title, body, url, badge }));
      } catch (e: unknown) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) dead.push(s.endpoint);
      }
    })
  );
  if (dead.length) await savePushSubs(subs.filter((s) => !dead.includes(s.endpoint)));
}

// one change at a time (see withLock in lib/store.ts)
export function notifyOwner(...a: Parameters<typeof _notifyOwner>) {
  return withLock("notifications", () => _notifyOwner(...a));
}
