import "server-only";
import { randomInt } from "crypto";
import { getSettings, newId } from "./db";
import { emailReady, sendEmail } from "./email";
import { getPrivate, setPrivate } from "./private-data";
import { siteUrl, stripe } from "./stripe";
import type { GiftCard, VetRequest } from "./types";

/*
 * EDIT-POINT: DISCOUNTS
 * Promo codes made from the dashboard. They live in Stripe (so the code box on
 * Stripe's checkout page knows them), and are made, switched off and sent from
 * Dashboard > Discounts. Gift cards and military discounts are codes too.
 */

// letters and digits only (Stripe's rule), without look-alikes like O/0 and I/1
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const randomCode = (prefix = "", len = 6) => prefix + Array.from({ length: len }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

export type NewCode = {
  code?: string;
  name: string;
  percent?: number; // or
  amount?: number; // cents
  maxUses?: number | null;
  expiresDays?: number | null;
  minOrder?: number | null; // cents
  firstOrderOnly?: boolean;
  kind?: string; // "manual" | "thanks" | "military" | "gift"
};

export async function createCode(n: NewCode): Promise<{ id: string; code: string }> {
  const s = await stripe();
  if (!s) throw new Error("Connect Stripe first (Accounts & keys). Codes live in Stripe so the checkout page can check them.");
  const settings = await getSettings();
  const code = (n.code || randomCode()).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 30);
  if (code.length < 3) throw new Error("Codes need at least 3 letters or numbers.");
  const coupon = await s.coupons.create({
    name: n.name.slice(0, 40) || code,
    duration: "once",
    ...(n.amount ? { amount_off: Math.round(n.amount), currency: settings.currency } : { percent_off: Math.min(100, Math.max(1, Number(n.percent) || 10)) }),
    metadata: { kind: n.kind ?? "manual" },
  });
  try {
    const promo = await s.promotionCodes.create({
      coupon: coupon.id,
      code,
      ...(n.maxUses ? { max_redemptions: n.maxUses } : {}),
      ...(n.expiresDays ? { expires_at: Math.floor(Date.now() / 1000) + n.expiresDays * 86400 } : {}),
      ...(n.minOrder || n.firstOrderOnly
        ? { restrictions: { ...(n.minOrder ? { minimum_amount: n.minOrder, minimum_amount_currency: settings.currency } : {}), ...(n.firstOrderOnly ? { first_time_transaction: true } : {}) } }
        : {}),
      metadata: { kind: n.kind ?? "manual" },
    });
    return { id: promo.id, code: promo.code };
  } catch (e) {
    await s.coupons.del(coupon.id).catch(() => {});
    const msg = (e as Error).message;
    throw new Error(/already exists|in use/i.test(msg) ? `The code ${code} is already taken. Pick another.` : msg);
  }
}

export async function setCodeActive(id: string, active: boolean) {
  const s = await stripe();
  if (!s) throw new Error("Connect Stripe first.");
  await s.promotionCodes.update(id, { active });
}

/** Email a code to people one at a time (nobody sees the others' addresses). Returns how many were sent. */
export async function emailCode(code: string, label: string, to: string[], note: string) {
  const s = await getSettings();
  if (!(await emailReady(s.emailFrom))) throw new Error("Email isn't set up (Setup > Tracking emails). Use the copy button instead.");
  const shop = siteUrl();
  let sent = 0;
  for (const email of [...new Set(to)].slice(0, 200)) {
    await sendEmail({
      from: s.emailFrom,
      to: email,
      subject: `A code for you from ${s.businessName}`,
      text: `${note ? `${note}\n\n` : ""}Your code: ${code} (${label})\n\nUse it at checkout: ${shop}\n\n${s.businessName}`,
      replyTo: s.contactEmail || undefined,
    });
    sent++;
  }
  return sent;
}

// ---------- military & first responder requests ----------

export const getVetRequests = () => getPrivate<VetRequest[]>("vetRequests", []);
export const saveVetRequests = (l: VetRequest[]) => setPrivate("vetRequests", l.slice(0, 2000));

export async function addVetRequest(r: Omit<VetRequest, "id" | "createdAt" | "status">) {
  const list = await getVetRequests();
  list.unshift({ ...r, id: newId(), createdAt: new Date().toISOString(), status: "new" });
  await saveVetRequests(list);
}

// ---------- gift cards ----------

export const getGiftCards = () => getPrivate<GiftCard[]>("giftCards", []);
export const saveGiftCards = (l: GiftCard[]) => setPrivate("giftCards", l.slice(0, 5000));

/** Makes a one-time code worth `amount` cents, saves it, and emails the recipient if email is set up. */
export async function issueGiftCard(g: Omit<GiftCard, "id" | "code" | "promoId" | "createdAt" | "sentAt">): Promise<GiftCard> {
  const { id, code } = await createCode({ code: randomCode("GIFT", 8), name: `Gift card $${(g.amount / 100).toFixed(0)}`, amount: g.amount, maxUses: 1, kind: "gift" });
  const card: GiftCard = { ...g, id: newId(), code, promoId: id, createdAt: new Date().toISOString() };
  const s = await getSettings();
  const to = g.toEmail || g.buyerEmail;
  if (to && (await emailReady(s.emailFrom))) {
    try {
      await sendEmail({
        from: s.emailFrom,
        to,
        subject: `${g.fromName ? `${g.fromName} sent you` : "You've got"} a $${(g.amount / 100).toFixed(2)} gift card from ${s.businessName}`,
        text: [
          g.toName ? `Hi ${g.toName},` : "Hi,",
          "",
          `${g.fromName || "Someone"} sent you a gift card for ${s.businessName}.`,
          g.message ? `\n"${g.message}"\n` : "",
          `Amount: $${(g.amount / 100).toFixed(2)}`,
          `Code: ${code}`,
          "",
          `Pick something out at ${siteUrl()} and type the code on the checkout page. It's used up in one order, so choose items worth at least the gift card amount.`,
          "",
          s.businessName,
        ].join("\n"),
        replyTo: s.contactEmail || undefined,
      });
      card.sentAt = new Date().toISOString();
    } catch {}
  }
  const list = await getGiftCards();
  list.unshift(card);
  await saveGiftCards(list);
  return card;
}
