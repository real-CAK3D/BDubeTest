import { InsightsCharts } from "@/components/admin/InsightsCharts";
import { RangePicker } from "@/components/admin/RangePicker";
import { insightsData } from "@/lib/insights";

export const metadata = { title: "Insights" };

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const d = Number((await searchParams).days);
  const days = [7, 30, 90, 365].includes(d) ? d : 90;
  const data = await insightsData(days);
  return (
    <>
      <div className="page-head">
        <h1>Insights</h1>
        <RangePicker base="/admin/insights" current={days} />
      </div>
      <InsightsCharts data={data} />
    </>
  );
}
