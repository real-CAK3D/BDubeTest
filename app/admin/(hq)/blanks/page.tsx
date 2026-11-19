import { BlanksManager } from "@/components/admin/BlanksManager";
import { getBlanks } from "@/lib/blanks";
import { getProducts } from "@/lib/db";

export const metadata = { title: "Blanks" };

export default async function BlanksPage() {
  const [blanks, products] = await Promise.all([getBlanks(), getProducts()]);
  // which items and sizes use each blank
  const used: Record<string, string[]> = {};
  for (const p of products) {
    if (p.blank) (used[p.blank] ??= []).push(p.name);
    for (const s of p.sizes ?? []) if (s.blank) (used[s.blank] ??= []).push(`${p.name} (${s.name})`);
  }
  return <BlanksManager initial={blanks} used={used} />;
}
