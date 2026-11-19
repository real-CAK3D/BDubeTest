import { pageOn } from "@/lib/site-structure";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Contact } from "@/components/shop/Sections";
import { Tracker } from "@/components/shop/Tracker";
import { shopSettings } from "@/lib/shop-data";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await shopSettings()).contactHeading };
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ about?: string }> }) {
  const [s, sp] = await Promise.all([shopSettings(), searchParams]);
  if (!pageOn(s, "contact")) notFound();
  return (
    <>
      <Tracker />
      <Contact s={s} always about={(sp.about ?? "").slice(0, 100)} />
    </>
  );
}
