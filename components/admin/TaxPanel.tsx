"use client";
import { STATES, type TaxSettings } from "@/lib/tax";

/** Settings > Payments > Sales tax: none, your own rate per state, or Stripe Tax. */
export function TaxPanel({ value, onChange, homeState }: { value: TaxSettings; onChange: (t: TaxSettings) => void; homeState: string }) {
  const t = value;
  const put = (patch: Partial<TaxSettings>) => onChange({ ...t, ...patch });
  const setRate = (i: number, patch: Partial<TaxSettings["rates"][number]>) => put({ rates: t.rates.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  const add = (state: string) => state && !t.rates.some((r) => r.state === state) && put({ rates: [...t.rates, { state, rate: 0, shipping: false }] });
  return (
    <section className="panel stack">
      <div className="panel-head"><h2>Sales tax</h2></div>
      <p className="hint">
        Tax is added by where the order goes: the ship-to ZIP code, or your shop&apos;s state for local pickup. It works the same with every way to pay. Only collect tax in states where you&apos;re registered to (usually just your home state until you sell a lot into another state). A tax professional can tell you for sure.
      </p>
      <div className="seg">
        <button type="button" className={t.mode === "off" ? "on" : ""} onClick={() => put({ mode: "off" })}>No sales tax</button>
        <button type="button" className={t.mode === "rates" ? "on" : ""} onClick={() => put({ mode: "rates", rates: t.rates.length || !homeState ? t.rates : [{ state: homeState, rate: 0, shipping: false }] })}>My own rates</button>
        <button type="button" className={t.mode === "stripe" ? "on" : ""} onClick={() => put({ mode: "stripe" })}>Stripe Tax (exact local rates)</button>
      </div>
      {t.mode !== "off" && !homeState ? <p className="error small">Fill in your shop&apos;s ZIP code under <strong>Store</strong> (Ship from ZIP) so local pickup orders are taxed for your state.</p> : null}
      {t.mode === "rates" ? (
        <>
          <p className="muted small">Type the full rate for each state you collect in. Many states add city and county tax on top of the state rate, so use the combined rate for where most of your buyers are (Oklahoma, for example, is 4.5% state plus local tax). For the exact rate on every address, use Stripe Tax instead.</p>
          {t.rates.map((r, i) => (
            <div key={r.state} className="row wrap tax-row">
              <strong style={{ minWidth: "9rem" }}>{STATES[r.state]}</strong>
              <label className="f inline"><span>Rate %</span><input type="number" step="0.001" min={0} max={20} value={r.rate || ""} placeholder="e.g. 8.5" onChange={(e) => setRate(i, { rate: Number(e.target.value) || 0 })} style={{ width: "6rem" }} /></label>
              <label className="check"><input type="checkbox" checked={r.shipping} onChange={(e) => setRate(i, { shipping: e.target.checked })} /> Tax shipping too</label>
              <button type="button" className="b b-ghost b-sm" aria-label={`Remove ${STATES[r.state]}`} onClick={() => put({ rates: t.rates.filter((_, j) => j !== i) })}>✕</button>
            </div>
          ))}
          <label className="f inline">
            <span>Add a state</span>
            <select value="" onChange={(e) => add(e.target.value)}>
              <option value="">Choose…</option>
              {Object.entries(STATES).filter(([k]) => !t.rates.some((r) => r.state === k)).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </select>
          </label>
          {t.rates.some((r) => !r.rate) ? <p className="error small">A state with no rate adds no tax.</p> : null}
        </>
      ) : t.mode === "stripe" ? (
        <p className="muted small">
          Stripe works out the exact city, county and state rate for each address. Switch on Stripe Tax and add your registrations in Stripe first (<a href="https://dashboard.stripe.com/settings/tax" target="_blank" rel="noreferrer">Stripe › Settings › Tax</a>). Stripe charges a small fee per order for this. It needs Stripe connected, even for PayPal and pay-directly orders.
        </p>
      ) : null}
    </section>
  );
}
