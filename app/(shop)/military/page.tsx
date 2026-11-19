import { notFound } from "next/navigation";
import { MilitaryForm } from "@/components/shop/MilitaryForm";
import { shopSettings } from "@/lib/shop-data";
import { pageOn } from "@/lib/site-structure";

export const metadata = { title: "Military & first responder discount" };

export default async function MilitaryPage() {
  const s = await shopSettings();
  const v = s.discounts.veteran;
  if (!v.on || !pageOn(s, "military")) notFound();
  return (
    <section className="section review-page">
      <h1>{v.heading}</h1>
      <p className="lede">{v.text.replaceAll("{percent}", String(v.percent))}</p>
      <MilitaryForm verify={v.verify} code={v.code} percent={v.percent} />
    </section>
  );
}
