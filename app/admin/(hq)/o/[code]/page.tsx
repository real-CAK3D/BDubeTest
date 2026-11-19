import { notFound, redirect } from "next/navigation";
import { getOrders, getSettings } from "@/lib/db";
import { orderCode } from "@/lib/order-code";

// Where an order's QR code points. Signed-in admins land on the order; anyone else gets the login page.
export default async function OpenOrder({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [orders, s] = await Promise.all([getOrders(), getSettings()]);
  const want = decodeURIComponent(code).toUpperCase();
  const o = orders.find((x) => orderCode(x, s.businessName) === want || String(x.number) === want.replace(/\D/g, ""));
  if (!o) notFound();
  redirect(`/admin/orders?open=${encodeURIComponent(o.id)}`);
}
