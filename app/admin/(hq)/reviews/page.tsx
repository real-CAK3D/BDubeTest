import { ReviewManager } from "@/components/admin/ReviewManager";
import { getReviews, getSettings } from "@/lib/db";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const [reviews, s] = await Promise.all([getReviews(), getSettings()]);
  return <ReviewManager initial={reviews} showing={s.showReviews} />;
}
