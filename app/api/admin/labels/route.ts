import { NextResponse } from "next/server";
import { getOrders, getSettings, updateOrder } from "@/lib/db";
import { buyLabel, carrierName, getRates } from "@/lib/shippo";

// { action: "rates", orderId, parcel } -> prices to choose from; { action: "buy", orderId, rateId, rate } -> the label
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const [orders, s] = await Promise.all([getOrders(), getSettings()]);
  const o = orders.find((x) => x.id === b.orderId);
  if (!o) return NextResponse.json({ error: "That order is gone." }, { status: 404 });
  if (!o.shipTo) return NextResponse.json({ error: "This order doesn't have a full shipping address saved (it came in before labels were added). Buy this one on Shippo's site." }, { status: 400 });
  try {
    if (b.action === "rates") {
      const p = b.parcel ?? {};
      const parcel = { name: "", length: Number(p.length) || 10, width: Number(p.width) || 8, height: Number(p.height) || 4, weightOz: Number(p.weightOz) || 16 };
      return NextResponse.json({ rates: await getRates(s.shipFrom, o.shipTo, parcel) });
    }
    if (b.action === "buy") {
      const label = await buyLabel(String(b.rateId));
      const carrier = carrierName(String(b.rate?.carrier ?? ""));
      const saved = await updateOrder(o.id, {
        trackingNumber: label.tracking || o.trackingNumber,
        carrier,
        label: { url: label.url, carrier, service: String(b.rate?.service ?? ""), cost: Math.round(Number(b.rate?.amount) || 0), boughtAt: new Date().toISOString() },
      });
      return NextResponse.json({ ok: true, order: saved });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
