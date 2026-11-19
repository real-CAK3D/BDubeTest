import { notFound } from "next/navigation";
import { shopSettings } from "@/lib/shop-data";
import { pageOn } from "@/lib/site-structure";
import Link from "next/link";
import { OrderLookup } from "@/components/shop/OrderLookup";

export const metadata = { title: "Order status" };

export default async function OrderStatusPage() {
  if (!pageOn(await shopSettings(), "status")) notFound();
  return (
    <section className="section review-page">
      <h1>Check on an order</h1>
      <p className="lede">Enter the order number from your receipt email and the email address you used. Questions? <Link href="/contact">Get in touch</Link>.</p>
      <OrderLookup />
    </section>
  );
}
