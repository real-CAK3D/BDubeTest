import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/shop/ReviewForm";
import { shopSettings } from "@/lib/shop-data";

export const metadata = { title: "Leave a review" };

export default async function ReviewPage() {
  const s = await shopSettings();
  if (!s.showReviews) notFound();
  return (
    <section className="section review-page">
      <h1>Leave a review</h1>
      {s.reviewsText ? <p className="lede">{s.reviewsText}</p> : null}
      <ReviewForm />
    </section>
  );
}
