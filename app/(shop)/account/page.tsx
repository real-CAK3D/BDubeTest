import { AccountView } from "@/components/shop/AccountView";
import { accountFor, currentCustomer } from "@/lib/customer";
import { emailReady } from "@/lib/email";
import { shopSettings } from "@/lib/shop-data";

export const metadata = { title: "Your orders", robots: { index: false } };

export default async function AccountPage() {
  const [email, s] = await Promise.all([currentCustomer(), shopSettings()]);
  const data = email ? await accountFor(email) : null;
  return (
    <section className="section account">
      <AccountView data={data} canEmail={await emailReady(s.emailFrom)} currency={s.currency} />
    </section>
  );
}
