import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { shopSettings } from "@/lib/shop-data";
import { paragraphs } from "@/lib/format";
import { fillPolicy, POLICY_PAGES } from "@/lib/policy-text";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = POLICY_PAGES[(await params).slug];
  return p ? { title: p.title } : {};
}

export default async function Policy({ params }: Params) {
  const page = POLICY_PAGES[(await params).slug];
  if (!page) notFound();
  const s = await shopSettings();
  const text = fillPolicy(String(s[page.field] ?? ""), s);
  return (
    <article className="section policy prose">
      <h1>{page.title}</h1>
      {text ? paragraphs(text).map((p, i) => <p key={i}>{p}</p>) : <p className="muted">Coming soon.</p>}
    </article>
  );
}
