"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ChartNote, Insights } from "@/lib/insights";
import { api } from "./api";

/*
 * Detailed charts (Apache ECharts): a zoomable sales timeline with markers
 * for big orders, refunds and your own notes; what's selling as a pie; best
 * sellers; busy days and hours; and a map of where orders ship. Each chart can
 * be switched on or off; the choice is remembered on this device.
 */
type ECharts = typeof import("echarts");
type Chart = ReturnType<ECharts["init"]>;

const CHARTS = [
  { id: "timeline", label: "Sales over time" },
  { id: "pie", label: "What's selling" },
  { id: "top", label: "Best sellers" },
  { id: "busy", label: "Busy days & hours" },
  { id: "map", label: "Where orders go" },
] as const;
type ChartId = (typeof CHARTS)[number]["id"];
const SPLITS = [
  { id: "byCategory", label: "By category ($)" },
  { id: "byDesign", label: "By design" },
  { id: "byPayment", label: "By payment" },
  { id: "byDelivery", label: "Shipped vs pickup" },
] as const;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATE: Record<string, string> = { AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming" };

export function InsightsCharts({ data }: { data: Insights }) {
  const router = useRouter();
  const [on, setOn] = useState<Record<ChartId, boolean>>({ timeline: true, pie: true, top: true, busy: true, map: true });
  const [split, setSplit] = useState<(typeof SPLITS)[number]["id"]>("byCategory");
  const [notes, setNotes] = useState<ChartNote[]>(data.notes);
  const [note, setNote] = useState({ date: new Date().toISOString().slice(0, 10), text: "" });
  const [lib, setLib] = useState<ECharts | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const refs = useRef<Partial<Record<ChartId, HTMLDivElement | null>>>({});
  const charts = useRef<Partial<Record<ChartId, Chart>>>({});
  const money = (c: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: data.currency.toUpperCase(), maximumFractionDigits: 0 }).format(c / 100);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("insights:on") ?? "null");
      if (saved) setOn((o) => ({ ...o, ...saved }));
    } catch {}
    import("echarts").then(setLib);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("insights:on", JSON.stringify(on));
    } catch {}
  }, [on]);

  // the US map: state outlines drawn with an Albers projection (Alaska and Hawaii tucked in)
  useEffect(() => {
    if (!lib || mapReady) return;
    Promise.all([fetch("/maps/us-states.json").then((r) => r.json()), import("d3-geo")]).then(([geo, d3]) => {
      lib.registerMap("USA", geo);
      (window as unknown as { __albers?: ReturnType<typeof d3.geoAlbersUsa> }).__albers = d3.geoAlbersUsa().scale(1).translate([0, 0]);
      setMapReady(true);
    });
  }, [lib, mapReady]);

  useEffect(() => {
    if (!lib) return;
    const css = getComputedStyle(document.querySelector(".hq-shell") ?? document.body);
    const ink = css.getPropertyValue("--ink").trim() || "#222";
    const muted = css.getPropertyValue("--muted").trim() || "#777";
    const line = css.getPropertyValue("--line").trim() || "#ddd";
    const accent = css.getPropertyValue("--accent").trim() || "#1E4D36";
    const gold = css.getPropertyValue("--gold").trim() || "#B8901C";
    const base = { backgroundColor: "transparent", textStyle: { color: ink, fontFamily: "Barlow, system-ui, sans-serif" }, color: [accent, gold, "#5b8def", "#c0504d", "#8064a2", "#4bacc6", "#f79646", "#9bbb59"] };
    const axis = { axisLine: { lineStyle: { color: line } }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: line } } };
    const make = (id: ChartId) => {
      const el = refs.current[id];
      if (!el || !on[id]) {
        charts.current[id]?.dispose();
        delete charts.current[id];
        return null;
      }
      return (charts.current[id] ??= lib.init(el, undefined, { renderer: "canvas" }));
    };

    make("timeline")?.setOption(
      {
        ...base,
        tooltip: { trigger: "axis", valueFormatter: (v: number) => (typeof v === "number" && v > 50 ? money(v) : String(v)) },
        legend: { data: ["Sales", "Orders", "Expenses"], textStyle: { color: ink } },
        toolbox: { feature: { dataZoom: { yAxisIndex: "none", title: { zoom: "Zoom", back: "Undo zoom" } }, magicType: { type: ["line", "bar"], title: { line: "Line", bar: "Bars" } }, restore: { title: "Reset" }, saveAsImage: { title: "Save picture" } }, iconStyle: { borderColor: muted } },
        grid: { left: 50, right: 40, top: 50, bottom: 70 },
        dataZoom: [{ type: "inside" }, { type: "slider", height: 22, bottom: 18 }],
        xAxis: { type: "category", data: data.series.map((d) => d.date), ...axis },
        yAxis: [
          { type: "value", ...axis, axisLabel: { color: muted, formatter: (v: number) => money(v) } },
          { type: "value", ...axis, splitLine: { show: false }, minInterval: 1 },
        ],
        series: [
          {
            name: "Sales",
            type: "line",
            smooth: true,
            symbol: "none",
            areaStyle: { opacity: 0.15 },
            data: data.series.map((d) => d.revenue),
            markPoint: {
              symbolSize: 42,
              label: { fontSize: 9 },
              data: data.markers.map((m) => ({ coord: [m.date, data.series.find((d) => d.date === m.date)?.revenue ?? 0], value: m.label, itemStyle: { color: m.kind === "refund" ? "#c0504d" : "#2fa35a" } })),
            },
            markLine: {
              symbol: "none",
              lineStyle: { color: gold, type: "dashed" },
              label: { formatter: "{b}", color: ink, fontSize: 11 },
              data: notes.filter((n) => data.series.some((d) => d.date === n.date)).map((n) => ({ xAxis: n.date, name: n.text })),
            },
          },
          { name: "Orders", type: "bar", yAxisIndex: 1, barMaxWidth: 10, itemStyle: { opacity: 0.45 }, data: data.series.map((d) => d.orders) },
          { name: "Expenses", type: "line", step: "middle", symbol: "none", lineStyle: { width: 1, type: "dotted" }, data: data.series.map((d) => d.expenses) },
        ],
      },
      true
    );

    const pieData = data[split];
    make("pie")?.setOption(
      {
        ...base,
        tooltip: { trigger: "item", valueFormatter: (v: number) => (split === "byCategory" ? money(v) : String(v)) },
        legend: { type: "scroll", bottom: 0, textStyle: { color: ink } },
        series: [
          {
            type: "pie",
            radius: ["38%", "70%"],
            roseType: pieData.length > 3 ? "radius" : undefined,
            itemStyle: { borderRadius: 6, borderColor: "transparent", borderWidth: 2 },
            label: { color: ink, formatter: "{b}\n{d}%" },
            data: pieData.length ? pieData : [{ name: "Nothing yet", value: 1 }],
          },
        ],
      },
      true
    );

    make("top")?.setOption(
      {
        ...base,
        tooltip: { trigger: "axis" },
        grid: { left: 10, right: 30, top: 10, bottom: 10, containLabel: true },
        xAxis: { type: "value", minInterval: 1, ...axis },
        yAxis: { type: "category", inverse: true, data: data.topItems.map((t) => (t.name.length > 28 ? t.name.slice(0, 27) + "…" : t.name)), ...axis },
        series: [{ type: "bar", data: data.topItems.map((t) => t.value), itemStyle: { borderRadius: [0, 6, 6, 0] }, label: { show: true, position: "right", color: ink } }],
      },
      true
    );

    make("busy")?.setOption(
      {
        ...base,
        tooltip: { formatter: (p: { value: [number, number, number] }) => `${DAYS[p.value[1]]} ${p.value[0]}:00: ${p.value[2]} order${p.value[2] === 1 ? "" : "s"}` },
        grid: { left: 40, right: 10, top: 10, bottom: 60 },
        xAxis: { type: "category", data: Array.from({ length: 24 }, (_, h) => (h % 12 || 12) + (h < 12 ? "a" : "p")), splitArea: { show: true }, ...axis },
        yAxis: { type: "category", data: DAYS, splitArea: { show: true }, ...axis },
        visualMap: { min: 0, max: Math.max(1, ...data.heat.map((h) => h[2])), calculable: true, orient: "horizontal", left: "center", bottom: 0, inRange: { color: ["#f3f4ef", accent] }, textStyle: { color: muted } },
        series: [{ type: "heatmap", data: data.heat, label: { show: false } }],
      },
      true
    );

    const albers = (window as unknown as { __albers?: (p: [number, number]) => [number, number] | null }).__albers;
    if (mapReady && albers) {
      const maxState = Math.max(1, ...data.byState.map((s) => s.value));
      make("map")?.setOption(
        {
          ...base,
          tooltip: { trigger: "item", formatter: (p: { seriesType: string; name: string; value: number | [number, number, number] }) => (Array.isArray(p.value) ? `${p.name}: ${p.value[2]} order${p.value[2] === 1 ? "" : "s"}` : `${p.name}: ${p.value || 0}`) },
          visualMap: { seriesIndex: 0, min: 0, max: maxState, left: 10, bottom: 10, calculable: true, inRange: { color: ["#eef0ec", gold, "#c0504d"] }, textStyle: { color: muted }, text: ["More orders", "Fewer"] },
          geo: {
            map: "USA",
            roam: true,
            projection: { project: (pt: [number, number]) => albers(pt) ?? [0, 0], unproject: (pt: [number, number]) => pt },
            itemStyle: { areaColor: "transparent", borderColor: muted },
            emphasis: { itemStyle: { areaColor: "rgba(0,0,0,0.08)" }, label: { show: false } },
          },
          series: [
            { type: "map", map: "USA", geoIndex: 0, data: data.byState.map((s) => ({ name: STATE[s.name.toUpperCase()] ?? s.name, value: s.value })) },
            { type: "effectScatter", coordinateSystem: "geo", data: data.points, symbolSize: (v: [number, number, number]) => 6 + Math.sqrt(v[2]) * 5, itemStyle: { color: accent }, rippleEffect: { scale: 2.5 }, zlevel: 1 },
          ],
        },
        true
      );
    }

    const resize = () => Object.values(charts.current).forEach((c) => c?.resize());
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lib, on, split, notes, mapReady, data]);

  useEffect(() => () => Object.values(charts.current).forEach((c) => c?.dispose()), []);

  async function addNote() {
    try {
      setNotes(await api<ChartNote[]>("/api/admin/chart-notes", "POST", note));
      setNote({ ...note, text: "" });
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <>
      <div className="chips" role="group" aria-label="Charts to show">
        {CHARTS.map((c) => (
          <button key={c.id} type="button" className={on[c.id] ? "on" : ""} aria-pressed={on[c.id]} onClick={() => setOn({ ...on, [c.id]: !on[c.id] })}>{c.label}</button>
        ))}
      </div>
      <div className="tiles">
        <div className="tile"><span>Sales</span><strong>{money(data.totals.revenue)}</strong></div>
        <div className="tile"><span>Orders</span><strong>{data.totals.orders}</strong></div>
        <div className="tile"><span>Items sold</span><strong>{data.totals.items}</strong></div>
      </div>
      {on.timeline ? (
        <section className="panel">
          <div className="panel-head"><h2>Sales over time</h2><span className="muted small">Pinch or drag to zoom · green = biggest orders · red = refunds</span></div>
          <div className="chart tall" ref={(el) => void (refs.current.timeline = el)} />
          <div className="row wrap note-add">
            <input type="date" value={note.date} onChange={(e) => setNote({ ...note, date: e.target.value })} aria-label="Day" />
            <input value={note.text} maxLength={80} onChange={(e) => setNote({ ...note, text: e.target.value })} placeholder="Add a note on the chart, e.g. Craft fair, Facebook post" style={{ flex: 1 }} />
            <button className="b b-sm" disabled={!note.text.trim()} onClick={addNote}>Add note</button>
          </div>
          {notes.length ? (
            <ul className="chart-notes">
              {notes.map((n) => (
                <li key={n.id}>
                  <span className="muted small">{n.date}</span> {n.text}
                  <button className="linkish small" onClick={async () => setNotes(await api<ChartNote[]>("/api/admin/chart-notes", "POST", { action: "delete", id: n.id }))}>remove</button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
      <div className="chart-pair">
        {on.pie ? (
          <section className="panel">
            <div className="panel-head"><h2>What&apos;s selling</h2></div>
            <div className="chips small-chips">
              {SPLITS.map((s) => <button key={s.id} type="button" className={split === s.id ? "on" : ""} onClick={() => setSplit(s.id)}>{s.label}</button>)}
            </div>
            <div className="chart" ref={(el) => void (refs.current.pie = el)} />
          </section>
        ) : null}
        {on.top ? (
          <section className="panel">
            <div className="panel-head"><h2>Best sellers</h2><span className="muted small">items sold</span></div>
            <div className="chart" ref={(el) => void (refs.current.top = el)} />
          </section>
        ) : null}
      </div>
      {on.busy ? (
        <section className="panel">
          <div className="panel-head"><h2>Busy days &amp; hours</h2><span className="muted small">when orders come in (Central time)</span></div>
          <div className="chart" ref={(el) => void (refs.current.busy = el)} />
        </section>
      ) : null}
      {on.map ? (
        <section className="panel">
          <div className="panel-head"><h2>Where orders go</h2><span className="muted small">states shaded by orders, dots by town · drag and pinch to explore</span></div>
          <div className="chart tall" ref={(el) => void (refs.current.map = el)} />
        </section>
      ) : null}
      <button className="b b-ghost b-sm" onClick={() => router.refresh()}>Refresh</button>
    </>
  );
}
