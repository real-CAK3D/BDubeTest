import { NextResponse } from "next/server";
import { getOrders, getSettings, getSubscribers } from "@/lib/db";
import { createCode, emailCode, getGiftCards, getVetRequests, issueGiftCard, randomCode, saveVetRequests, setCodeActive } from "@/lib/discounts";
import { getAbandoned } from "@/lib/abandoned";
import { emailReady } from "@/lib/email";
import { isEmail } from "@/lib/guard";
import { listDiscounts } from "@/lib/stripe-catalog";

// Everyone he could send a code to: past buyers and email sign-ups (one entry per email)
async function customers() {
  const [orders, subs] = await Promise.all([getOrders(), getSubscribers()]);
  const map = new Map<string, { email: string; name: string; orders: number }>();
  for (const o of orders) {
    if (!o.email) continue;
    const k = o.email.toLowerCase();
    const c = map.get(k) ?? { email: o.email, name: o.name, orders: 0 };
    c.orders++;
    map.set(k, c);
  }
  for (const s of subs) if (s.email && !map.has(s.email.toLowerCase())) map.set(s.email.toLowerCase(), { email: s.email, name: "", orders: 0 });
  return [...map.values()].sort((a, b) => b.orders - a.orders);
}

export async function GET() {
  const s = await getSettings();
  const [codes, vets, gifts, people, canEmail, abandoned] = await Promise.all([
    listDiscounts().catch((e) => ({ codes: [], coupons: [], error: (e as Error).message })),
    getVetRequests(),
    getGiftCards(),
    customers(),
    emailReady(s.emailFrom),
    getAbandoned(),
  ]);
  return NextResponse.json({ ...codes, vets, gifts, customers: people, canEmail, abandoned });
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const s = await getSettings();
  try {
    if (b.action === "create") {
      const kind = b.type === "amount" ? "amount" : "percent";
      const value = Number(b.value) || 0;
      if (value <= 0) return NextResponse.json({ error: "Enter how much it takes off." }, { status: 400 });
      const made = await createCode({
        code: String(b.code ?? ""),
        name: String(b.name ?? "").slice(0, 40) || (kind === "percent" ? `${value}% off` : `$${value} off`),
        ...(kind === "percent" ? { percent: Math.min(100, value) } : { amount: Math.round(value * 100) }),
        maxUses: Number(b.maxUses) > 0 ? Math.round(Number(b.maxUses)) : null,
        expiresDays: Number(b.expiresDays) > 0 ? Math.round(Number(b.expiresDays)) : null,
        minOrder: Number(b.minOrder) > 0 ? Math.round(Number(b.minOrder) * 100) : null,
        firstOrderOnly: Boolean(b.firstOrderOnly),
      });
      return NextResponse.json({ ok: true, message: `Code ${made.code} is ready.`, code: made.code });
    }
    if (b.action === "toggle") {
      await setCodeActive(String(b.id), Boolean(b.active));
      return NextResponse.json({ ok: true });
    }
    if (b.action === "send") {
      const to = (Array.isArray(b.to) ? b.to : []).map(String).filter(isEmail);
      if (!to.length) return NextResponse.json({ error: "Pick at least one person." }, { status: 400 });
      const n = await emailCode(String(b.code), String(b.label ?? ""), to, String(b.note ?? "").slice(0, 1000));
      return NextResponse.json({ ok: true, message: `Sent to ${n} ${n === 1 ? "person" : "people"}.` });
    }
    if (b.action === "approveVet" || b.action === "declineVet") {
      const list = await getVetRequests();
      const r = list.find((x) => x.id === b.id);
      if (!r) return NextResponse.json({ error: "That request is gone." }, { status: 404 });
      if (b.action === "approveVet") {
        const v = s.discounts.veteran;
        const made = await createCode({ code: randomCode("VET", 6), name: `Military ${v.percent}% off`, percent: v.percent, kind: "military" });
        r.code = made.code;
        r.status = "approved";
        if (await emailReady(s.emailFrom)) await emailCode(made.code, `${v.percent}% off`, [r.email], `Thank you for your service, ${r.name.split(" ")[0]}. Here's your personal code.`).catch(() => {});
      } else r.status = "declined";
      await saveVetRequests(list);
      return NextResponse.json({ ok: true, request: r });
    }
    if (b.action === "giftCard") {
      const amount = Math.round((Number(b.amount) || 0) * 100);
      if (amount < 100) return NextResponse.json({ error: "Enter an amount." }, { status: 400 });
      const toEmail = String(b.toEmail ?? "").trim();
      if (toEmail && !isEmail(toEmail)) return NextResponse.json({ error: "Check the email address." }, { status: 400 });
      const card = await issueGiftCard({ amount, fromName: s.businessName, buyerEmail: "", toName: String(b.toName ?? "").slice(0, 60), toEmail, message: String(b.message ?? "").slice(0, 300) });
      return NextResponse.json({ ok: true, card, message: `Gift card ${card.code} made${card.sentAt ? " and emailed" : ""}.` });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
