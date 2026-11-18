import Link from "next/link";
import { pageOn } from "@/lib/site-structure";
import type { SiteSettings } from "@/lib/types";
import { Showcase3D } from "./Showcase3D";

/** "Our work" section on the home page: the rotating showcase of featured pieces. */
export function WorkShowcase({ s }: { s: SiteSettings }) {
  const items = s.gallery.filter((g) => g.featured && g.photos[0]);
  if (items.length < 3 || !pageOn(s, "gallery")) return null;
  return (
    <section className="section work-showcase">
      <div className="reviews-head">
        <div>
          <h2>{s.galleryHeading}</h2>
          {s.galleryText ? <p className="muted">{s.galleryText}</p> : null}
        </div>
        <Link href="/gallery" className="btn btn-ghost">See all our work</Link>
      </div>
      <Showcase3D label={s.galleryHeading} items={items.map((g) => ({ title: g.title, image: g.photos[0], href: `/gallery/${g.slug}` }))} />
    </section>
  );
}
