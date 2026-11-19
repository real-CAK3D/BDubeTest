import { notFound } from "next/navigation";
import { CustomOrderForm } from "@/components/shop/CustomOrderForm";
import { shopSettings } from "@/lib/shop-data";

export const metadata = { title: "Request a custom order" };

export default async function CustomOrderPage({ searchParams }: { searchParams: Promise<{ about?: string }> }) {
  const [s, sp] = await Promise.all([shopSettings(), searchParams]);
  if (!s.showCustomOrders) notFound();
  return (
    <section className="section review-page custom-page">
      <h1>{s.customOrderHeading || "Request a custom order"}</h1>
      {s.customOrderIntro ? <p className="lede">{s.customOrderIntro}</p> : null}
      {s.customOrderNotice ? (
        <div className="notice" role="note">
          {/^please note/i.test(s.customOrderNotice) ? null : <strong>Please note</strong>}
          <p>{s.customOrderNotice}</p>
        </div>
      ) : null}
      <CustomOrderForm types={s.customOrderTypes} about={String(sp.about ?? "").slice(0, 120)} />
    </section>
  );
}
