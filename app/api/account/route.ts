import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { checkSignInCode, cleanEmail, currentCustomer, CUSTOMER_COOKIE, customerCookie, saveCustomerSaved, sendSignInCode } from "@/lib/customer";
import { getOrders } from "@/lib/db";
import { isEmail, tooMany } from "@/lib/guard";

const same = (a = "", b = "") => a.length > 0 && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// Customer sign-in (email code), signing in right after buying, saved items, signing out.
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const action = String(b.action ?? "");
  if (action === "saved") {
    const email = await currentCustomer();
    if (email && Array.isArray(b.ids)) await saveCustomerSaved(email, b.ids.map(String));
    return NextResponse.json({ ok: true });
  }
  if (action === "signout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(CUSTOMER_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }
  if (tooMany(req, 10, 10 * 60_000)) return NextResponse.json({ error: "Too many tries. Wait a few minutes." }, { status: 429 });
  if (action === "code") {
    const email = cleanEmail(b.email);
    if (!isEmail(email)) return NextResponse.json({ error: "Type your email address." }, { status: 400 });
    const r = await sendSignInCode(email);
    if (!r.ok) return NextResponse.json({ error: "Signing in by email isn't switched on yet. You can still look up any order on Order status." }, { status: 503 });
    return NextResponse.json({ ok: true });
  }
  if (action === "verify") {
    const email = cleanEmail(b.email);
    if (!(await checkSignInCode(email, String(b.code ?? "")))) return NextResponse.json({ error: "That code didn't work. Check it, or ask for a new one." }, { status: 400 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(customerCookie(email));
    return res;
  }
  if (action === "claim") {
    // right after buying: the private thank-you link proves it's their order
    const id = String(b.order ?? "");
    const o = (await getOrders()).find((x) => x.id === id);
    // card orders: only within 2 hours of buying (the checkout id is in the thank-you link)
    const ok = o && (id.startsWith("cs_") ? Date.now() - Date.parse(o.createdAt) < 2 * 3600_000 : same(o.viewKey, String(b.k ?? "")));
    if (!o || !ok || !isEmail(o.email)) return NextResponse.json({ ok: false });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(customerCookie(o.email));
    return res;
  }
  return NextResponse.json({ error: "Unknown request." }, { status: 400 });
}
