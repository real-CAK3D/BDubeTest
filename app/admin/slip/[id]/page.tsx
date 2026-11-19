import { notFound } from "next/navigation";
import { PrintButton } from "@/components/admin/PrintButton";
import { barcodeSvg, qrSvg } from "@/lib/codes";
import { getOrders, getSettings } from "@/lib/db";
import { money } from "@/lib/format";
import { orderCode } from "@/lib/order-code";
import { siteUrl } from "@/lib/stripe";

export const metadata = { title: "Packing slip" };

/*
 * A packing slip to print and put in the box: the order's barcode (same code
 * as the customer's receipt) and a QR code that opens the order in the
 * dashboard for a signed-in admin.
 */
export default async function Slip({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [orders, s] = await Promise.all([getOrders(), getSettings()]);
  const o = orders.find((x) => x.id === decodeURIComponent(id));
  if (!o) notFound();
  const code = orderCode(o, s.businessName);
  const when = new Date(o.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  return (
    <div className="slip">
      <div className="slip-tools"><PrintButton /></div>
      <header className="slip-head">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {s.logo ? <img src={s.logo} alt="" className="slip-logo" /> : null}
          <h1>{s.businessName}</h1>
          <p>Packing slip</p>
        </div>
        <div className="slip-codes">
          <div className="slip-bar" dangerouslySetInnerHTML={{ __html: barcodeSvg(code) }} />
          <div className="slip-qr" dangerouslySetInnerHTML={{ __html: qrSvg(`${siteUrl()}/admin/o/${code}`) }} />
        </div>
      </header>
      <section className="slip-grid">
        <div>
          <h2>Order</h2>
          <p><strong>{code}</strong><br />Order #{o.number}<br />{when}{o.trackingNumber ? <><br />Tracking ({o.carrier || "carrier"}): {o.trackingNumber}</> : null}</p>
        </div>
        <div>
          <h2>{o.delivery === "pickup" ? "Pickup" : "Ship to"}</h2>
          <p className="pre">{o.name}{o.shippingAddress ? `\n${o.shippingAddress}` : ""}</p>
        </div>
      </section>
      <table className="slip-items">
        <thead><tr><th>Qty</th><th>Item</th><th>Price</th></tr></thead>
        <tbody>
          {o.items.map((i, n) => (
            <tr key={n}>
              <td>{i.quantity}</td>
              <td>{i.name}{i.option && !i.name.includes(i.option) ? ` (${i.option})` : ""}{i.custom ? <div className="engrave">Engrave: &ldquo;{i.custom}&rdquo;</div> : null}</td>
              <td>{money(i.unitAmount * i.quantity, o.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {o.giftNote ? <p className="slip-gift">Gift message: &ldquo;{o.giftNote}&rdquo;</p> : null}
      <p className="slip-thanks">Thank you for supporting a veteran-owned family business. Questions? {s.contactEmail || "Message us through our website."}</p>
    </div>
  );
}
