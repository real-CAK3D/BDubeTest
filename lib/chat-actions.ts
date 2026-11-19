import "server-only";
import { lockedFor, recordFail, visitorKey } from "./admin-security";
import { getMessages, getOrders, getRequests, newId, saveMessages, saveRequests } from "./db";
import { trackingLink } from "./email";
import { isEmail, tooMany } from "./guard";
import { orderCode } from "./order-code";
import { fillPolicy } from "./policy-text";
import { notifyOwner } from "./push";
import { quoteShipping } from "./shipping";
import type { SiteSettings } from "./types";

/*
 * EDIT-POINT: CHAT-ACTIONS
 * Things the chat can DO, not just say (no AI needed for any of them):
 *  - look up an order: order number or receipt code + the email used
 *  - quote shipping to a ZIP code, with the same math as the cart
 *  - find the sentence in your policies that answers a question
 *  - take a custom order request (lands in Dashboard > Requests)
 *  - pass a message to you (lands in Dashboard > Inbox), with a phone ping
 * A conversation that's collecting details carries a small "state" back and
 * forth with the shop page; it only ever fills the same forms customers can
 * already send from the site.
 */

export type ChatState = { flow: "custom" | "message"; name?: string; email?: string; notes: string[]; turns: number } | { offer: "custom" | "message" } | null;
export type ActionTurn = { role: "user" | "assistant"; content: string };
export type ActionReply = { reply: string; answered: boolean; state?: ChatState; kind?: "zip" };

const EMAIL = /[^\s@<>()"',;]+@[^\s@<>()"',;]+\.[a-z]{2,}/i;
const CODE = /\b([A-Z]{1,3})(\d{3,7})-([A-Z0-9]{4})\b/i;
const NUMBER = /(?:order|#|number|no\.?|num)\s*(?:number|no\.?|#)?\s*:?\s*#?\s*(\d{3,7})\b/i;
const YES = /^\s*(yes|yeah|yep|yup|sure|ok(ay)?|please|please do|y|go ahead|do it|sounds good|that would be great|absolutely|definitely)\b/i;
const NO = /^\s*(no|nope|nah|never ?mind|cancel|stop|forget it|not now|no thanks)\b/i;
const money = (c: number) => `$${(c / 100).toFixed(c % 100 ? 2 : 0)}`;

/** A Request that counts toward its own limit (chat lookups and chat submissions are limited separately from chatting). */
const limitOf = (req: Request, name: string) => new Request(new URL(`/api/chat/${name}`, req.url), { headers: req.headers });

export function cleanState(x: unknown): ChatState {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (o.offer === "custom" || o.offer === "message") return { offer: o.offer };
  if (o.flow !== "custom" && o.flow !== "message") return null;
  const str = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : undefined);
  return {
    flow: o.flow,
    name: str(o.name, 80),
    email: str(o.email, 200),
    notes: Array.isArray(o.notes) ? o.notes.filter((n): n is string => typeof n === "string").map((n) => n.slice(0, 1500)).slice(-8) : [],
    turns: Math.min(20, Number(o.turns) || 0),
  };
}

// ---------- order lookup ----------

const SAY: Record<string, (pickup: boolean) => string> = {
  paid: (p) => (p ? "is being made. We'll let you know when it's ready to pick up." : "is being made. You'll get an email with tracking when it ships."),
  shipped: (p) => (p ? "is ready for pickup." : "is on its way."),
  delivered: (p) => (p ? "was picked up. Thank you!" : "was delivered. Thank you!"),
  refunded: () => "was refunded.",
  cancelled: () => "was cancelled.",
};

async function orderLookup(history: ActionTurn[], req: Request, s: SiteSettings): Promise<ActionReply | null> {
  const last = history.at(-1)!.content;
  const recent = history.filter((t) => t.role === "user").slice(-3).map((t) => t.content).join(" \n ");
  const lastBot = history.filter((t) => t.role === "assistant").at(-1)?.content ?? "";
  const askedForIt = /order number|code on your receipt|What email did you use|What's your order number/i.test(lastBot);
  const wantsTrack = /\b(where('?s| is)|track|tracking|status|shipped|arriv|deliver|eta|when will|did (it|my order) ship|my order|my package)\b/i.test(last);
  // the number can come in an earlier message, right after the chat asked for it
  const lookupTalk = history.slice(-6).some((t) => t.role === "assistant" && /order number|code on your receipt|What email did you use/i.test(t.content));
  const code = recent.match(CODE);
  const bare = lookupTalk ? recent.match(/(?:^|\s|#)(\d{3,7})(?:\s|$)/)?.[1] : undefined;
  const num = code ? Number(code[2]) : Number(recent.match(NUMBER)?.[1] ?? bare ?? NaN);
  const email = recent.match(EMAIL)?.[0].toLowerCase();
  if (!(wantsTrack || askedForIt || CODE.test(last))) return null;
  if (!num && !email) return wantsTrack && /\border|package|purchase\b/i.test(last) ? { reply: "I can look that up for you. Send me your order number (or the code on your receipt) and the email you used.", answered: true } : null;
  if (!num) return { reply: "Thanks! What's your order number? It's on your receipt email (or use the code under the barcode).", answered: true };
  if (!email) return { reply: `Got order ${code ? code[0].toUpperCase() : `#${num}`}. What email did you use for it? (I need both, so nobody else can look up your order.)`, answered: true };

  if (tooMany(limitOf(req, "lookup"), 10, 10 * 60_000)) return { reply: "That's a lot of lookups in a short time. Please try again in a few minutes, or use /order-status.", answered: true };
  const who = visitorKey(req, "lookup");
  const wait = await lockedFor(who);
  if (wait) return { reply: `Too many lookups. Please try again in ${wait} minutes.`, answered: true };
  const o = (await getOrders()).find((x) => x.number === num && x.email.toLowerCase() === email);
  if (!o) {
    await recordFail(who);
    return { reply: "I couldn't find an order with that number and email. Check both on your receipt email and try again, or send us a message on /contact.", answered: true };
  }
  const pickup = o.delivery === "pickup";
  const items = o.items.map((i) => `${i.quantity > 1 ? `${i.quantity} × ` : ""}${i.name}${i.option ? ` (${i.option})` : ""}`);
  const when = new Date(o.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const track = o.trackingNumber ? `\n\nTracking${o.carrier ? ` (${o.carrier})` : ""}: ${o.trackingNumber}${trackingLink(o.carrier, o.trackingNumber) ? `\n${trackingLink(o.carrier, o.trackingNumber)}` : ""}` : "";
  return {
    reply: `Order ${orderCode(o, s.businessName)} from ${when} (${items.join(", ")}) ${(SAY[o.status] ?? (() => `is ${o.status}.`))(pickup)}${track}`,
    answered: true,
  };
}

// ---------- shipping quote ----------

async function zipQuote(history: ActionTurn[], s: SiteSettings): Promise<ActionReply | null> {
  const last = history.at(-1)!.content;
  const lastBot = history.filter((t) => t.role === "assistant").at(-1)?.content ?? "";
  const zip = last.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1];
  if (!zip) return null;
  const shipTalk = /\b(ship|shipping|shipped|deliver|delivery|send|mail|postage|cost to|how much to|zip)\b/i.test(last) || /ZIP code/i.test(lastBot);
  if (!shipTalk || CODE.test(last) || NUMBER.test(last)) return null;
  const q = await quoteShipping(s, { zip, subtotal: 0 });
  const where = q.place ? ` to ${q.place}` : ` to ${zip}`;
  return {
    kind: "zip",
    reply: `Shipping${where} is ${money(q.amount)} for an order.${s.freeShippingOver ? ` It's free on orders over ${money(s.freeShippingOver)}.` : ""}${s.localPickup ? " Local pickup is free." : ""} The cart shows the same price before you pay.`,
    answered: true,
  };
}

// ---------- your policies ----------

const POLICYISH = /\b(return|refund|exchange|cancel|warranty|guarantee|privacy|data|personal info|terms|policy|policies|broken|damaged|wrong item|lost|personaliz|custom order|deposit|non-?refundable|liabilit|cookies)\b/i;

export function policySentences(s: SiteSettings) {
  const docs: [string, string][] = [
    ["Shipping policy", s.shippingPolicy],
    ["Returns policy", s.returnPolicy],
    ["Custom order policy", s.customOrderPolicy],
    ["Privacy policy", s.privacyPolicy],
    ["Terms", s.termsOfService],
  ];
  return docs.flatMap(([title, text]) =>
    fillPolicy(text || "", s)
      .replace(/^#+\s.*$/gm, " ")
      .replace(/\*\*/g, "")
      .split(/(?<=[.!?])\s+|\n+/)
      .map((x) => x.replace(/^[-•*]\s*/, "").trim())
      .filter((x) => x.length > 25 && x.length < 400)
      .map((sentence) => ({ title, sentence }))
  );
}

/** The best 1-2 sentences from the policies, given each sentence's meaning score. */
export function policyAnswer(question: string, picks: { title: string; sentence: string; score: number }[]): ActionReply | null {
  if (!POLICYISH.test(question)) return null;
  const good = picks.filter((p) => p.score >= 0.45).slice(0, 2);
  if (!good.length) return null;
  return { reply: `From our ${good[0].title.toLowerCase()}: ${good.map((g) => g.sentence).join(" ")}\n\nThe full policies are on /policies.`, answered: true };
}

// ---------- taking a request or a message ----------

function nameFrom(text: string) {
  const m = text.match(/\b(?:my name is|my name's|i'?m|i am|this is)\s+([A-Z][a-z'-]+(?:\s+[A-Z][a-z'-]+)?)/);
  if (m && !/^(looking|wanting|interested|trying|hoping|not|just|so|very)$/i.test(m[1].split(" ")[0])) return m[1];
  // "Jane Smith, jane@x.com"
  const before = text.split(EMAIL)[0].trim().replace(/[,;:-]+$/, "").trim();
  if (/^[A-Z][a-z'-]+(\s+[A-Z][a-z'-]+){0,2}$/.test(before)) return before;
  return undefined;
}

async function intake(history: ActionTurn[], state: ChatState, req: Request, s: SiteSettings): Promise<ActionReply | null> {
  const last = history.at(-1)!.content.trim();
  // they said yes to an offer: start collecting
  if (state && "offer" in state) {
    if (NO.test(last)) return { reply: "No problem! Anything else I can help with?", answered: true, state: null };
    if (!YES.test(last)) return null;
    if (state.offer === "custom")
      return {
        reply: `Great! Tell me what you'd like made (the item, size, wording or design, how many, and when you need it), plus your name and email so ${s.businessName} can send you a price.`,
        answered: true,
        state: { flow: "custom", notes: [], turns: 0 },
      };
    return { reply: "Sure! What would you like to ask or tell us? Include your name and email so we can reply.", answered: true, state: { flow: "message", notes: [], turns: 0 } };
  }
  if (!state || !("flow" in state)) return null;
  if (NO.test(last) && last.split(/\s+/).length <= 4) return { reply: "Okay, I won't send anything. Anything else I can help with?", answered: true, state: null };

  const st = { ...state, notes: [...state.notes], turns: state.turns + 1 };
  const email = last.match(EMAIL)?.[0];
  if (email) st.email = email;
  const named = nameFrom(last);
  if (named) st.name = named;
  let rest = last.replace(EMAIL, " ").replace(/\b(?:my email is|email:?|e-mail:?)\s*$/i, "");
  if (named) rest = rest.replace(/\b(?:my name is|my name's|i'?m|i am|this is)\s+/, "").replace(named, "");
  rest = rest.replace(/\s{2,}/g, " ").replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, "");
  if (rest.length > 3 && !/^(my email is|email|thanks|thank you)$/i.test(rest)) st.notes.push(rest);
  if (st.turns > 6) return { reply: "Let's make this easier: the form on /custom-order (or /contact) takes it all in one go. Sorry for the trouble!", answered: true, state: null };

  const details = st.notes.join("\n").trim();
  const needDetails = st.flow === "custom" ? details.length < 10 : details.length < 2;
  if (needDetails) return { reply: st.flow === "custom" ? "What would you like made? Any details help: the item, size, wording, how many and when you need it." : "What would you like to tell us?", answered: true, state: st };
  if (!st.email || !isEmail(st.email)) return { reply: "Got it! What email should we reply to?", answered: true, state: st };
  if (st.flow === "custom" && !st.name) return { reply: "Thanks! And your name?", answered: true, state: { ...st, name: undefined } };

  // send it
  if (tooMany(limitOf(req, "send"), 4, 60 * 60_000)) return { reply: "You've sent a few already, so I'll stop here. We'll be in touch, or email us directly.", answered: true, state: null };
  const fromChat = "(sent from the website chat)";
  if (st.flow === "custom") {
    if (!s.showCustomOrders) return { reply: "We're not taking custom requests right now, sorry! I can pass a message to us instead; just say yes.", answered: true, state: { offer: "message" } };
    const list = await getRequests();
    const number = list.reduce((m, r) => Math.max(m, r.number), 100) + 1;
    const qty = Number(details.match(/\b(\d{1,4})\s*(?:x\b|pcs|pieces|of them|tumblers|signs|coasters|items|cups|mugs)/i)?.[1]) || 1;
    list.unshift({ id: newId(), number, createdAt: new Date().toISOString(), name: st.name!.slice(0, 80), email: st.email, phone: "", kind: "", quantity: Math.min(10000, qty), details: `${details}\n\n${fromChat}`.slice(0, 4000), engraving: "", neededBy: "", budget: "", zip: "", photos: [], status: "new", note: "" });
    await saveRequests(list);
    await notifyOwner(`Custom request #${number} (chat)`, `${st.name}: ${details.slice(0, 100)}`, "/admin/requests");
    return { reply: `Sent! Your request is #${number}. ${s.businessName} will email ${st.email} with a price and any questions. If you have photos or artwork, you can add them on /custom-order.`, answered: true, state: null };
  }
  const msgs = await getMessages();
  msgs.unshift({ id: newId(), createdAt: new Date().toISOString(), name: (st.name ?? "").slice(0, 100), email: st.email, message: `${details}\n\n${fromChat}`.slice(0, 5000), read: false });
  await saveMessages(msgs);
  await notifyOwner(`Message from ${st.name || st.email} (chat)`, details.slice(0, 120), "/admin/inbox");
  return { reply: `Sent! We'll reply to ${st.email} as soon as we can.`, answered: true, state: null };
}

/** Runs before the normal answers. Returns a reply when an action handled the message. */
export async function act(history: ActionTurn[], state: ChatState, req: Request, s: SiteSettings): Promise<ActionReply | null> {
  return (await intake(history, state, req, s)) ?? (await orderLookup(history, req, s)) ?? (await zipQuote(history, s));
}
