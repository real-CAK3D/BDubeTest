import { UpcomingManager } from "@/components/admin/UpcomingManager";
import { getSettings } from "@/lib/db";
import { getInterest } from "@/lib/upcoming";

export const metadata = { title: "What's to come" };

export default async function ComingSoonAdmin() {
  const [s, interest] = await Promise.all([getSettings(), getInterest()]);
  return <UpcomingManager initial={s} interest={interest} />;
}
