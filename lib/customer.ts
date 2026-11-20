import "server-only";
import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getOrders, getSettings } from "./db";
import { getGiftCards } from "./discounts";
import { emailReady, sendEmail } from "./email";
import { getPrivate, setPrivate } from "./private-data";
import { withLock } from "./store";

/*
 * EDIT-POINT: CUSTOMER-ACCOUNTS
 * Customers "sign in" with their email: we email a 6-digit code (no
 * passwords to forget or leak), or they're signed in right after they buy.
 * Signed in, /account shows their orders, gift cards and saved items. The
 * sign-in is a signed cookie on their device; nothing else is stored.
 */
export const CUSTOMER_COOKIE = "customer";
const DAYS = 90;

function key() {
  const s = process.env.AUTH_SECRET || (process.env.VERCEL ? "" : "fallback:" + (process.env.ADMIN_PASSWORD || "changeme"));
  if (!s) throw new Error("AUTH_SECRET isn't set.");
  return "customer-sign-in:" + s;
}
const sig = (data: string) => createHmac("sha256", key()).update(data).digest("base64url");
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
export const cleanEmail = (e: unknown) => String(e ?? "").trim().toLowerCase().slice(0, 200);

export function customerToken(email: string) {
  const data = `${Buffer.from(cleanEmail(email)).toString("base64url")}.${Date.now() + DAYS * 86400_000}`;
  return `${data}.${sig(data)}`;
}

export function readCustomerToken(token?: string | null) {
  if (!token) return null;
  const [e, exp, s] = token.split(".");
  if (!e || !exp || !s || Number(exp) < Date.now() || !same(s, sig(`${e}.${exp}`))) return null;
  return Buffer.from(e, "base64url").toString();
}

export const customerCookie = (email: string) => ({ name: CUSTOMER_COOKIE, value: customerToken(email), httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: DAYS * 86400 });

/** The signed-in customer's email, or null. */
export async function currentCustomer() {
  return readCustomerToken((await cookies()).get(CUSTOMER_COOKIE)?.value);
}

// ---------- sign-in codes ----------

type Pending = Record<string, { hash: string; exp: number; tries: number; sent: number }>;
const hashOf = (email: string, code: string) => createHash("sha256").update(`${key()}|${email}|${code}`).digest("hex");

/** Emails a 6-digit code. Says nothing about whether the email has orders. */
export async function sendSignInCode(raw: string) {
  const email = cleanEmail(raw);
  const s = await getSettings();
  if (!(await emailReady(s.emailFrom))) return { ok: false, reason: "email-off" as const };
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const allowed = await withLock("customerCodes", async () => {
    const all = await getPrivate<Pending>("customerCodes", {});
    for (const [k, v] of Object.entries(all)) if (v.exp < Date.now()) delete all[k];
    if (all[email] && Date.now() - all[email].sent < 45_000) return false; // one code per 45 seconds
    all[email] = { hash: hashOf(email, code), exp: Date.now() + 15 * 60_000, tries: 0, sent: Date.now() };
    await setPrivate("customerCodes", all);
    return true;
  });
  if (!allowed) return { ok: true };
  await sendEmail({
    from: s.emailFrom,
    to: email,
    subject: `${code} is your ${s.businessName} sign-in code`,
    text: [`Your sign-in code is ${code}`, "", "It works for 15 minutes. If you didn't ask for it, you can ignore this email.", "", s.businessName].join("\n"),
  });
  return { ok: true };
}

export async function checkSignInCode(raw: string, code: string) {
  const email = cleanEmail(raw);
  return withLock("customerCodes", async () => {
    const all = await getPrivate<Pending>("customerCodes", {});
    const p = all[email];
    if (!p || p.exp < Date.now()) return false;
    p.tries++;
    const ok = same(p.hash, hashOf(email, String(code).replace(/\D/g, "")));
    if (ok || p.tries >= 5) delete all[email]; // 5 wrong tries and the code stops working
    await setPrivate("customerCodes", all);
    return ok;
  });
}

// ---------- what the account page shows ----------

export async function accountFor(email: string) {
  const [orders, cards, saved] = await Promise.all([getOrders(), getGiftCards(), getPrivate<Record<string, string[]>>("customerSaved", {})]);
  const mine = orders.filter((o) => cleanEmail(o.email) === email);
  return {
    email,
    orders: mine.map((o) => ({
      id: o.id,
      number: o.number,
      createdAt: o.createdAt,
      status: o.status,
      delivery: o.delivery,
      total: o.total,
      currency: o.currency,
      paymentMethod: o.paymentMethod,
      items: o.items.map((i) => ({ productId: i.productId, name: i.name, quantity: i.quantity })),
      trackingNumber: o.trackingNumber,
      carrier: o.carrier,
    })),
    lastAddress: mine.find((o) => o.shipTo)?.shipTo ?? null,
    lastName: mine[0]?.name ?? "",
    lastPhone: mine.find((o) => o.phone)?.phone ?? "",
    giftCards: cards
      .filter((c) => !c.promoId && (cleanEmail(c.toEmail) === email || (!c.toEmail && cleanEmail(c.buyerEmail) === email)))
      .map((c) => ({ code: c.code, amount: c.amount, balance: c.balance ?? 0 })),
    saved: saved[email] ?? [],
  };
}

export function saveCustomerSaved(email: string, ids: string[]) {
  return withLock("customerSaved", async () => {
    const all = await getPrivate<Record<string, string[]>>("customerSaved", {});
    all[email] = [...new Set(ids.filter((x) => typeof x === "string" && /^[\w-]{1,40}$/.test(x)))].slice(0, 200);
    await setPrivate("customerSaved", all);
  });
}
