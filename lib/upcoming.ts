import "server-only";
import { getPrivate, setPrivate } from "./private-data";
import { notifyOwner } from "./push";
import { withLock } from "./store";

/*
 * Who's interested in each "What's to come" item: a count of "I want this"
 * taps, and the emails of people who asked to hear when it's ready (kept
 * encrypted, shown only in the dashboard).
 */
export type Interest = Record<string, { wants: number; emails: { email: string; at: string }[] }>;
const KEY = "upcomingInterest";

export const getInterest = () => getPrivate<Interest>(KEY, {});

/** Public numbers only: how many people want each item. */
export async function wantCounts() {
  const all = await getInterest().catch(() => ({}) as Interest);
  return Object.fromEntries(Object.entries(all).map(([id, v]) => [id, v.wants]));
}

export function addWant(id: string, undo = false) {
  return withLock("write", async () => {
    const all = await getInterest();
    const v = (all[id] ??= { wants: 0, emails: [] });
    v.wants = Math.max(0, v.wants + (undo ? -1 : 1));
    await setPrivate(KEY, all);
    return v.wants;
  });
}

export function addNotify(id: string, title: string, email: string) {
  return withLock("write", async () => {
    const all = await getInterest();
    const v = (all[id] ??= { wants: 0, emails: [] });
    if (!v.emails.some((e) => e.email.toLowerCase() === email.toLowerCase())) {
      v.emails.push({ email, at: new Date().toISOString() });
      await setPrivate(KEY, all);
      await notifyOwner(`Someone wants "${title}"`, `${email} asked to hear when it's ready (${v.emails.length} waiting).`, "/admin/coming-soon");
    }
    return v.emails.length;
  });
}

export function clearInterest(id: string) {
  return withLock("write", async () => {
    const all = await getInterest();
    delete all[id];
    await setPrivate(KEY, all);
  });
}
