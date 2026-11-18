import { RequestManager } from "@/components/admin/RequestManager";
import { getRequests, getSettings } from "@/lib/db";

export const metadata = { title: "Custom requests" };

export default async function RequestsPage() {
  const [list, s] = await Promise.all([getRequests(), getSettings()]);
  return <RequestManager initial={list} business={s.businessName} on={s.showCustomOrders} />;
}
