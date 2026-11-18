import { pageOn } from "@/lib/site-structure";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { About } from "@/components/shop/Sections";
import { Tracker } from "@/components/shop/Tracker";
import { getSettings } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getSettings()).aboutTitle };
}

export default async function AboutPage() {
  const s = await getSettings();
  if (!pageOn(s, "about")) notFound();
  return (
    <>
      <Tracker />
      <About s={s} />
      <p className="page-next">
        <Link href="/shop" className="btn">{s.shopButton}</Link>
        <Link href="/contact" className="btn btn-ghost">Get in touch</Link>
      </p>
    </>
  );
}
