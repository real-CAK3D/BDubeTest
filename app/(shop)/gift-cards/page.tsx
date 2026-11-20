import { notFound } from "next/navigation";
import { GiftCardForm } from "@/components/shop/GiftCardForm";
import { shopSettings } from "@/lib/shop-data";
import { pageOn } from "@/lib/site-structure";
import { payOptions } from "@/lib/pay-options";

export const metadata = { title: "Gift cards" };

export default async function GiftCardsPage() {
  const s = await shopSettings();
  const g = s.discounts.giftCards;
  if (!g.on || !g.amounts.length || !pageOn(s, "giftcards")) notFound();
  return (
    <section className="section review-page">
      <h1>{g.heading}</h1>
      {g.text ? <p className="lede">{g.text}</p> : null}
      <GiftCardForm amounts={g.amounts} business={s.businessName} pay={await payOptions(s)} currency={s.currency} />
    </section>
  );
}
