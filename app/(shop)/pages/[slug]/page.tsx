import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/db";
import { paragraphs } from "@/lib/format";
import { fillPolicy } from "@/lib/policy-text";

// Extra pages the owner adds in the dashboard (Words & logos > Pages), e.g. /pages/faq
type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = (await getSettings()).extraPages.find((p) => p.slug === slug);
  return page ? { title: page.title } : {};
}

export default async function ExtraPage({ params }: Params) {
  const { slug } = await params;
  const s = await getSettings();
  const page = s.extraPages.find((p) => p.slug === slug);
  if (!page) notFound();
  // A paragraph whose first line is short and ends with "?" or ":" reads as a question/heading
  return (
    <article className="section policy prose">
      <h1>{page.title}</h1>
      {paragraphs(fillPolicy(page.body, s)).map((p, i) => {
        const [first, ...rest] = p.split("\n");
        return rest.length && first.length < 120 ? (
          <div key={i} className="qa">
            <h2>{first}</h2>
            <p>{rest.join(" ")}</p>
          </div>
        ) : (
          <p key={i}>{p}</p>
        );
      })}
    </article>
  );
}
