import "server-only";
import { getSettings } from "./db";
import { emailReady, sendEmail } from "./email";
import { money } from "./format";
import { getPrivate, setPrivate } from "./private-data";
import { notifyOwner } from "./push";
import { stripe } from "./stripe";
import type { Abandoned } from "./types";
import { withLock } from "./store";

/*
 * EDIT-POINT: CHECKOUT-REMINDERS
 * When someone gets to Stripe's checkout page, types their email, and leaves
 * without paying, the checkout runs out after a few hours (Dashboard >
 * Discounts > Deals). Stripe then gives a link that reopens their cart, and
 * this emails it to them once. The wording of that email is below.
 */
export const getAbandoned = () => getPrivate<Abandoned[]>("abandoned", []);
const saveAbandoned = (l: Abandoned[]) => setPrivate("abandoned", l.slice(0, 1000));

/** A reminded customer came back through the link and paid. */
async function _markRecovered(sessionId: string) {
  const list = await getAbandoned();
  const a = list.find((x) => x.id === sessionId);
  if (!a) return;
  a.recovered = true;
  await saveAbandoned(list);
}

async function _remindAbandoned(sessionId: string) {
  const s = await stripe();
  if (!s) return;
  const session = await s.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
  const email = session.customer_details?.email;
  const url = session.after_expiration?.recovery?.url;
  if (!email || !url || session.metadata?.kind === "giftcard") return;
  if ((await getAbandoned()).some((x) => x.id === sessionId)) return; // already handled (Stripe can send the same event twice)
  if (session.consent?.promotions === "opt_out") return; // they said no to emails
  const settings = await getSettings();
  const items = (session.line_items?.data ?? []).map((li) => `${li.quantity} x ${li.description}`).join(", ");
  const rec: Abandoned = {
    id: session.id,
    createdAt: new Date().toISOString(),
    email,
    name: session.customer_details?.name ?? "",
    amount: session.amount_total ?? 0,
    items: items.slice(0, 500),
    url,
  };
  if (await emailReady(settings.emailFrom)) {
    try {
      await sendEmail({
        from: settings.emailFrom,
        to: email,
        subject: `Still thinking it over? Your cart at ${settings.businessName} is saved`,
        text: [
          rec.name ? `Hi ${rec.name.split(" ")[0]},` : "Hi,",
          "",
          `You left a few things in your cart: ${items}.`,
          "",
          `Pick up where you left off (the link works for 30 days): ${url}`,
          "",
          "Questions about sizes, designs or engraving? Just reply to this email.",
          "",
          settings.businessName,
        ].join("\n"),
        replyTo: settings.contactEmail || undefined,
      });
      rec.emailedAt = new Date().toISOString();
    } catch (e) {
      console.error("reminder email:", e);
    }
  }
  const list = await getAbandoned();
  if (list.some((x) => x.id === rec.id)) return;
  list.unshift(rec);
  await saveAbandoned(list);
  await notifyOwner("Unfinished checkout", `${rec.name || email} left ${money(rec.amount, session.currency ?? "usd")} in their cart${rec.emailedAt ? " (reminder sent)" : ""}.`, "/admin/discounts?tab=reminders");
}

// one change at a time (see withLock in lib/store.ts)
export function markRecovered(...a: Parameters<typeof _markRecovered>) {
  return withLock("write", () => _markRecovered(...a));
}
export function remindAbandoned(...a: Parameters<typeof _remindAbandoned>) {
  return withLock("write", () => _remindAbandoned(...a));
}
