import { CustomizeForm } from "@/components/admin/CustomizeForm";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Customize dashboard" };

export default async function CustomizePage() {
  return <CustomizeForm initial={await getSettings()} />;
}
