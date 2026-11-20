import { CartView } from "@/components/shop/CartView";
import { pageOn } from "@/lib/site-structure";
import { shopSettings } from "@/lib/shop-data";
import { payOptions } from "@/lib/pay-options";

export const metadata = { title: "Your cart" };

export default async function CartPage() {
  const s = await shopSettings();
  const pay = await payOptions(s);
  return (
    <section className="section cart">
      <h1>Your cart</h1>
      <CartView currency={s.currency} ships={s.collectShipping} freeOver={s.freeShippingOver} intl={s.intlShipping} pickup={s.localPickup} pickupNote={s.pickupNote} storeOpen={s.storeOpen} closedMessage={s.closedMessage} promoCodes={s.allowPromoCodes} tax={s.stripeTax} giftNotes={s.giftNotes} bulk={s.discounts.bulk} military={s.discounts.veteran.on && pageOn(s, "military") ? { percent: s.discounts.veteran.percent, href: "/military" } : null} pay={pay} />
    </section>
  );
}
