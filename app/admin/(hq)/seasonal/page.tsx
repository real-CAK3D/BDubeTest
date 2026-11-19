import { SeasonsManager } from "@/components/admin/SeasonsManager";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Seasonal banners" };

export default async function SeasonalPage() {
  return <SeasonsManager initial={await getSettings()} />;
}
