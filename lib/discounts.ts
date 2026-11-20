import "server-only";
import { randomInt } from "crypto";
import { getSettings, newId } from "./db";
import { emailReady, sendEmail } from "./email";
import { getPrivate, setPrivate } from "./private-data";
import { siteUrl, stripe } from "./stripe";
import type { GiftCard, VetRequest } from "./types";
import { kv, withLock } from "./store";

const dollars = (c: number) => `$${(c / 100).toFixed(2)}`;

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

async function _addVetRequest(r: Omit<VetRequest, "id" | "createdAt" | "status">) {
  const list = await getVetRequests();
  list.unshift({ ...r, id: newId(), createdAt: new Date().toISOString(), status: "new" });
  await saveVetRequests(list);
}

// ---------- gift cards ----------

export const getGiftCards = () => getPrivate<GiftCard[]>("giftCards", []);
export const saveGiftCards = (l: GiftCard[]) => setPrivate("giftCards", l.slice(0, 5000));

/**
 * Makes a gift card: the shop's own code with a balance (no Stripe needed), saves
 * it, and emails the recipient if email is set up. It works with every way to
 * pay; whatever isn't spent stays on the card for next time.
 */
async function _issueGiftCard(g: Omit<GiftCard, "id" | "code" | "promoId" | "createdAt" | "sentAt">): Promise<GiftCard> {
  const list = await getGiftCards();
  let code = randomCode("GIFT", 8);
  while (list.some((c) => c.code === code)) code = randomCode("GIFT", 8);
  const card: GiftCard = { ...g, id: newId(), code, promoId: "", balance: g.amount, createdAt: new Date().toISOString() };
  const s = await getSettings();
  const to = g.toEmail || g.buyerEmail;
  if (to && (await emailReady(s.emailFrom))) {
    try {
      await sendEmail({
        from: s.emailFrom,
        to,
        subject: `${g.fromName ? `${g.fromName} sent you` : "You've got"} a ${dollars(g.amount)} gift card from ${s.businessName}`,
        text: [
          g.toName ? `Hi ${g.toName},` : "Hi,",
          "",
          `${g.fromName || "Someone"} sent you a gift card for ${s.businessName}.`,
          g.message ? `\n"${g.message}"\n` : "",
          `Amount: ${dollars(g.amount)}`,
          `Code: ${code}`,
          "",
          `Pick something out at ${siteUrl()} and type the code in your cart. Anything you don't spend stays on the card for next time.`,
          "",
          s.businessName,
        ].join("\n"),
        replyTo: s.contactEmail || undefined,
      });
      card.sentAt = new Date().toISOString();
    } catch {}
  }
  list.unshift(card);
  await saveGiftCards(list);
  return card;
}

/** Takes money off a gift card for an order. Returns what it could take (less if it was spent elsewhere meanwhile). */
async function _redeemGift(id: string, amount: number, order: number) {
  const list = await getGiftCards();
  const c = list.find((x) => x.id === id);
  if (!c || c.promoId || c.disabled) return 0;
  const take = Math.min(amount, c.balance ?? 0);
  if (take <= 0) return 0;
  c.balance = (c.balance ?? 0) - take;
  c.uses = [...(c.uses ?? []), { at: new Date().toISOString(), order, amount: take }].slice(-50);
  await saveGiftCards(list);
  return take;
}

// one change at a time (see withLock in lib/store.ts)
export function addVetRequest(...a: Parameters<typeof _addVetRequest>) {
  return withLock("write", () => _addVetRequest(...a));
}
export function redeemGift(...a: Parameters<typeof _redeemGift>) {
  return withLock("write", () => _redeemGift(...a));
}
export function issueGiftCard(...a: Parameters<typeof _issueGiftCard>) {
  return withLock("write", () => _issueGiftCard(...a));
}

// ---------- codes typed in the cart when paying by PayPal or directly ----------
// (Stripe's own checkout page checks codes itself; these reuse the same codes from Stripe)


/** Checks a promo or gift card code against an order subtotal (cents). */
export async function checkCode(raw: string, subtotal: number): Promise<{ promoId: string; code: string; off: number } | { error: string }> {
  const code = String(raw ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 30);
  if (!code) return { error: "Type a code." };
  const s = await stripe();
  if (!s) return { error: `${code} isn't a working code.` };
  const found = (await s.promotionCodes.list({ code, active: true, limit: 1 }).catch(() => null))?.data[0];
  if (!found || !found.coupon.valid) return { error: `${code} isn't a working code.` };
  if (found.expires_at && found.expires_at * 1000 < Date.now()) return { error: `${code} has expired.` };
  const outside = Number((await kv.hgetall("codeUsesOutside").catch(() => ({}) as Record<string, number>))[found.id] ?? 0);
  if (found.max_redemptions && found.times_redeemed + outside >= found.max_redemptions) return { error: `${code} has already been used.` };
  const min = found.restrictions?.minimum_amount;
  if (min && subtotal < min) return { error: `${code} needs an order of at least ${dollars(min)}.` };
  const c = found.coupon;
  const off = Math.min(subtotal, c.amount_off ? c.amount_off : Math.round((subtotal * (c.percent_off ?? 0)) / 100));
  if (off <= 0) return { error: `${code} doesn't take anything off this order.` };
  return { promoId: found.id, code: found.code, off };
}

/** Counts a code used outside Stripe, and switches it off in Stripe once it's used up. */
export async function useCodeOutside(promoId: string) {
  await kv.hincrby("codeUsesOutside", promoId, 1);
  const s = await stripe();
  const p = s ? await s.promotionCodes.retrieve(promoId).catch(() => null) : null;
  const outside = Number((await kv.hgetall("codeUsesOutside"))[promoId] ?? 0);
  if (s && p?.max_redemptions && p.times_redeemed + outside >= p.max_redemptions) await s.promotionCodes.update(promoId, { active: false }).catch(() => {});
}
