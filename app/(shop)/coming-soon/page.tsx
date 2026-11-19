import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/shop/ComingSoon";
import { Tracker } from "@/components/shop/Tracker";
import { shopSettings } from "@/lib/shop-data";
import { pageOn } from "@/lib/site-structure";
import { wantCounts } from "@/lib/upcoming";

export async function generateMetadata(): Promise<Metadata> {
  const s = await shopSettings();
  return { title: s.upcoming.heading || "What's to come", description: s.upcoming.intro };
}

export default async function ComingSoonPage() {
  const s = await shopSettings();
  if (!pageOn(s, "coming") || !s.upcoming.items.some((x) => !x.hidden)) notFound();
  return (
    <>
      <Tracker />
      <ComingSoon s={s} counts={await wantCounts()} page />
    </>
  );
}
