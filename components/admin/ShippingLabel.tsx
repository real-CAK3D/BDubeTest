"use client";
import { useState } from "react";
import { money } from "@/lib/format";
import type { Order, Parcel } from "@/lib/types";
import { api } from "./api";

type Rate = { id: string; carrier: string; service: string; amount: number; days: number | null };

/** Get postage prices for an order and buy the label; the tracking number fills itself in. */
export function ShippingLabel({ order, parcels, ready, onBought }: { order: Order; parcels: Parcel[]; ready: boolean; onBought: (o: Order) => void }) {
  const [box, setBox] = useState<Parcel>(parcels[0] ?? { name: "", length: 10, width: 8, height: 4, weightOz: 16 });
  const [rates, setRates] = useState<Rate[] | null>(null);
  const [pick, setPick] = useState("");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  if (order.label)
    return (
      <div className="label-box">
        <a className="b b-primary b-sm" href={order.label.url} target="_blank" rel="noreferrer">Print label</a>
        <span className="muted small">{order.label.carrier} {order.label.service} · {money(order.label.cost, order.currency)} · bought {new Date(order.label.boughtAt).toLocaleDateString()}</span>
      </div>
    );
  if (!ready) return <p className="muted small">Buy postage right here: add a Shippo token on the <a href="/admin/keys">Accounts &amp; keys</a> page and your return address in Settings &gt; Store.</p>;
  if (!order.shipTo) return null;

  async function getRates() {
    setBusy("rates");
    setErr("");
    try {
      const r = await api<{ rates: Rate[] }>("/api/admin/labels", "POST", { action: "rates", orderId: order.id, parcel: box });
      setRates(r.rates);
      setPick(r.rates[0]?.id ?? "");
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy("");
  }

  async function buy() {
    const rate = rates?.find((r) => r.id === pick);
    if (!rate || !confirm(`Buy a ${rate.carrier} ${rate.service} label for ${money(rate.amount, order.currency)}?`)) return;
    setBusy("buy");
    setErr("");
    try {
      const r = await api<{ order: Order }>("/api/admin/labels", "POST", { action: "buy", orderId: order.id, rateId: rate.id, rate });
      onBought(r.order);
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy("");
  }

  const num = (v: string) => Math.max(0, Number(v.replace(/[^0-9.]/g, "")) || 0);
  return (
    <div className="label-box stack">
      <div className="row wrap">
        <label className="f inline">
          <span>Box</span>
          <select onChange={(e) => setBox(parcels[Number(e.target.value)] ?? box)} defaultValue="0">
            {parcels.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
          </select>
        </label>
        <label className="f inline"><span>L×W×H in</span>
          <span className="row">
            <input className="num" value={box.length} onChange={(e) => setBox({ ...box, length: num(e.target.value) })} aria-label="Length" />
            <input className="num" value={box.width} onChange={(e) => setBox({ ...box, width: num(e.target.value) })} aria-label="Width" />
            <input className="num" value={box.height} onChange={(e) => setBox({ ...box, height: num(e.target.value) })} aria-label="Height" />
          </span>
        </label>
        <label className="f inline"><span>Weight oz</span><input className="num" value={box.weightOz} onChange={(e) => setBox({ ...box, weightOz: num(e.target.value) })} /></label>
        <button className="b b-sm" disabled={Boolean(busy)} onClick={getRates}>{busy === "rates" ? "Getting prices…" : "Get postage prices"}</button>
      </div>
      {rates ? (
        <>
          <ul className="rates">
            {rates.slice(0, 8).map((r) => (
              <li key={r.id}>
                <label className="check small">
                  <input type="radio" name={`rate-${order.id}`} checked={pick === r.id} onChange={() => setPick(r.id)} />
                  <strong>{money(r.amount, order.currency)}</strong> {r.carrier} {r.service}
                  {r.days ? <span className="muted"> · about {r.days} day{r.days === 1 ? "" : "s"}</span> : null}
                </label>
              </li>
            ))}
          </ul>
          <div><button className="b b-primary b-sm" disabled={Boolean(busy) || !pick} onClick={buy}>{busy === "buy" ? "Buying…" : "Buy label"}</button></div>
        </>
      ) : null}
      {err ? <p className="err">{err}</p> : null}
    </div>
  );
}
