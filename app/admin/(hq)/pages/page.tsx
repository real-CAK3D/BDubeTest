import { PagesManager } from "@/components/admin/PagesManager";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Pages & menu" };

export default async function PagesPage() {
  return <PagesManager initial={await getSettings()} />;
}
