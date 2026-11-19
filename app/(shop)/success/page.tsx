import Link from "next/link";
import { ClearCart } from "@/components/shop/ClearCart";
import { recordOrderFromSession } from "@/lib/orders";
import { getOrders } from "@/lib/db";
import { shopSettings } from "@/lib/shop-data";
import { barcodeSvg } from "@/lib/codes";
import { money } from "@/lib/format";
import { orderCode } from "@/lib/order-code";
import { fillPolicy } from "@/lib/policy-text";

export const metadata = { title: "Thank you" };

export default async function Success({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const s = await shopSettings();
  let order = null;
  if (session_id && /^cs_[A-Za-z0-9_]+$/.test(session_id)) {
    // Records the order now in case the webhook hasn't arrived yet (safe to repeat).
    await recordOrderFromSession(session_id).catch((e) => console.error(e));
    order = (await getOrders()).find((o) => o.id === session_id) ?? null;
  }
  return (
    <section className="section success">
      <ClearCart />
      <h1>{order || session_id ? "Thank you" : "Thanks for stopping by"}{order?.name ? `, ${order.name.split(" ")[0]}` : ""}.</h1>
      {order ? (
        <>
          <p className="lede">
            Order #{order.number} is confirmed. A receipt is on its way to {order.email}.
          </p>
          <div className="receipt-code">
            <span className="muted small">Your order code</span>
            <div dangerouslySetInnerHTML={{ __html: barcodeSvg(orderCode(order, s.businessName)) }} />
            <span className="muted small">Keep this for questions or pickup. Order status works with this code too.</span>
          </div>
          <ul className="receipt">
            {order.items.map((i, n) => (
              <li key={n}>
                <span>
                  {i.quantity} × {i.name}
                  {i.custom ? <em className="custom-line">Engraving: &ldquo;{i.custom}&rdquo;</em> : null}
                </span>
                <span>{money(i.unitAmount * i.quantity, order!.currency)}</span>
              </li>
            ))}
            {order.discount ? <li><span>Discount{order.promoCode ? ` (${order.promoCode})` : ""}</span><span>−{money(order.discount, order.currency)}</span></li> : null}
            {order.shipping ? <li><span>Shipping</span><span>{money(order.shipping, order.currency)}</span></li> : null}
            {order.tax ? <li><span>Tax</span><span>{money(order.tax, order.currency)}</span></li> : null}
            <li className="total"><span>Total paid</span><span>{money(order.total, order.currency)}</span></li>
          </ul>
          {order.giftCodes?.length ? (
            <div className="code-box">
              <strong>Gift card code{order.giftCodes.length > 1 ? "s" : ""}</strong>
              {order.giftCodes.map((c) => <code key={c}>{c}</code>)}
              <p className="muted small">We&apos;ve also emailed {order.giftCodes.length > 1 ? "them" : "it"} where you asked. Keep this page or take a screenshot.</p>
            </div>
          ) : null}
          {order.nextCode ? (
            <div className="code-box">
              <strong>Thank you! {s.discounts.thankYou.percent}% off your next order</strong>
              <code>{order.nextCode}</code>
              <p className="muted small">Use it at checkout within {s.discounts.thankYou.days} days. One use.</p>
            </div>
          ) : null}
        </>
      ) : session_id ? (
        <p className="lede">Your payment went through. A receipt is on its way to your inbox, and you can check on your order any time on <Link href="/order-status">Order status</Link>.</p>
      ) : (
        <p className="lede">There&apos;s no order to show here. If you just paid, your receipt email has everything, or check <Link href="/order-status">Order status</Link>.</p>
      )}
      {order || session_id ? <p>{fillPolicy(s.shippingPolicy, s)}</p> : null}
      <Link href="/" className="btn">Back to the shop</Link>
    </section>
  );
}
