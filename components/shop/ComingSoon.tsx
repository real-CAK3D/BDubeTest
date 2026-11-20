import Link from "next/link";
import { pageOn } from "@/lib/site-structure";
import { wantCounts } from "@/lib/upcoming";
import type { SiteSettings, UpcomingItem } from "@/lib/types";
import { WantButton } from "./WantButton";

const STAGE: Record<UpcomingItem["stage"], string> = { idea: "Just an idea", working: "In the works", soon: "Coming soon" };

/** The "What's to come" cards (Dashboard > What's to come). `limit` for the home page. */
export function ComingSoon({ s, counts, limit, page }: { s: SiteSettings; counts: Record<string, number>; limit?: number; page?: boolean }) {
  const u = s.upcoming;
  const items = u.items.filter((x) => !x.hidden);
  if (!items.length || (!page && !u.on)) return null;
  const shown = limit ? items.slice(0, limit) : items;
  const Head = page ? "h1" : "h2";
  return (
    <section className={`section coming ${page ? "coming-page" : ""}`}>
      <div className="section-head">
        <Head>{u.heading || "What's to come"}</Head>
        {u.intro ? <p className="lede">{u.intro}</p> : null}
      </div>
      <ul className="coming-list">
        {shown.map((x) => (
          <li key={x.id} className="coming-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {x.image ? <img src={x.image} alt="" loading="lazy" /> : <div className="coming-art" aria-hidden>✦</div>}
            <div className="coming-body">
              <span className={`coming-stage s-${x.stage}`}>{STAGE[x.stage]}{x.when ? ` · ${x.when}` : ""}</span>
              <h2 className="coming-title">{x.title}</h2>
              {x.text ? <p>{x.text}</p> : null}
              <WantButton id={x.id} count={counts[x.id] ?? 0} />
            </div>
          </li>
        ))}
      </ul>
      {limit && items.length > limit ? <p className="coming-more"><Link href="/coming-soon" className="btn btn-ghost">See everything that&apos;s coming</Link></p> : null}
      {page && s.showCustomOrders ? <p className="coming-more">Have an idea we should make? <Link href="/custom-order">Tell us about it</Link>.</p> : null}
    </section>
  );
}

/** The home page version: the first three, when the section and its page are on. */
export async function ComingSoonHome({ s }: { s: SiteSettings }) {
  if (!s.upcoming.on || !pageOn(s, "coming")) return null;
  return <ComingSoon s={s} counts={await wantCounts()} limit={3} />;
}
