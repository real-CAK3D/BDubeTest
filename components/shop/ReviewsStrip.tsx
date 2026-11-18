import Link from "next/link";
import type { Review, SiteSettings } from "@/lib/types";

export function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} out of 5 stars`}>
      {"★".repeat(n)}
      <span className="stars-off">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export function ReviewsStrip({ s, reviews }: { s: SiteSettings; reviews: Review[] }) {
  if (!s.showReviews) return null;
  return (
    <section className="section reviews">
      <div className="reviews-head">
        <div>
          <h2>{s.reviewsHeading}</h2>
          {s.reviewsText ? <p className="muted">{s.reviewsText}</p> : null}
        </div>
        <Link href="/review" className="btn">Leave a review</Link>
      </div>
      {reviews.length ? (
        <div className="review-grid">
          {reviews.map((r) => (
            <figure key={r.id} className="review-card">
              {r.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.photo} alt={`Photo from ${r.name}`} loading="lazy" />
              ) : null}
              <blockquote>
                <Stars n={r.rating} />
                <p>{r.text}</p>
              </blockquote>
              <figcaption>
                <strong>{r.name}</strong>
                {r.location ? <span>{r.location}</span> : null}
                {r.item ? <em>{r.item}</em> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="muted">Be the first to share a photo of your piece.</p>
      )}
    </section>
  );
}
