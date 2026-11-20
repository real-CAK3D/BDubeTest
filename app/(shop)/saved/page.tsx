import { SavedList } from "@/components/shop/SavedList";

export const metadata = { title: "Saved items", robots: { index: false } };

export default function SavedPage() {
  return (
    <section className="section">
      <h1>Saved items</h1>
      <SavedList />
    </section>
  );
}
