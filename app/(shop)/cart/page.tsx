import { CartView } from "@/components/shop/CartView";
import { shopSettings } from "@/lib/shop-data";

export const metadata = { title: "Your cart" };

export default async function CartPage() {
  const s = await shopSettings();
  return (
    <section className="section cart">
      <h1>Your cart</h1>
      <CartView currency={s.currency} ships={s.collectShipping} freeOver={s.freeShippingOver} intl={s.intlShipping} pickup={s.localPickup} pickupNote={s.pickupNote} storeOpen={s.storeOpen} closedMessage={s.closedMessage} promoCodes={s.allowPromoCodes} tax={s.stripeTax} giftNotes={s.giftNotes} />
    </section>
  );
}
