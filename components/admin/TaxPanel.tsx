"use client";
import { STATES, typicalRate, TYPICAL_RATES, type TaxSettings } from "@/lib/tax";

/**
 * Settings > Payments & tax > Sales tax.
 * Automatic: the shop's own state (from its ZIP) at that state's typical rate, plus any state he adds.
 * Each order is taxed for the state it ships to (pickup: the shop's state).
 */
export function TaxPanel({ value, onChange, homeState }: { value: TaxSettings; onChange: (t: TaxSettings) => void; homeState: string }) {
  const t = value;
  const put = (patch: Partial<TaxSettings>) => onChange({ ...t, ...patch });
  // the home state always shows first, even before it's saved in the list
  const rows = homeState && !t.rates.some((r) => r.state === homeState) ? [{ state: homeState, rate: 0, shipping: false }, ...t.rates] : t.rates;
  const setRow = (state: string, patch: Partial<TaxSettings["rates"][number]>) => {
    const list = rows.map((r) => (r.state === state ? { ...r, ...patch } : r));
    put({ rates: list });
  };
  const add = (state: string) => state && !rows.some((r) => r.state === state) && put({ rates: [...rows, { state, rate: 0, shipping: false }] });
  return (
    <section className="panel stack">
      <div className="panel-head"><h2>Sales tax</h2></div>
      <p className="hint">Each order is taxed for the state it ships to (from the ZIP the customer types in the cart), or your shop&apos;s state for local pickup. The customer sees the tax before paying, with every way to pay.</p>
      <div className="seg">
        <button type="button" className={t.mode === "rates" ? "on" : ""} onClick={() => put({ mode: "rates" })}>Automatic</button>
        <button type="button" className={t.mode === "stripe" ? "on" : ""} onClick={() => put({ mode: "stripe" })}>Stripe Tax (exact local rates)</button>
        <button type="button" className={t.mode === "off" ? "on" : ""} onClick={() => put({ mode: "off" })}>No sales tax</button>
      </div>

      {t.mode === "rates" ? (
        !homeState && !t.rates.length ? (
          <p className="error">Type your shop&apos;s ZIP code under <strong>Store › Ship from ZIP</strong> and save. The shop then knows your state and fills in its rate by itself.</p>
        ) : (
          <>
            <p className="muted small">
              You collect tax in the states below; orders shipped to any other state get no tax. Your home state comes from your shop&apos;s ZIP. The rate is that state&apos;s typical total (state rate plus the usual city and county tax). To use your exact local rate, type it in.
            </p>
            {rows.map((r) => {
              const [base, typical] = TYPICAL_RATES[r.state] ?? [0, 0];
              const home = r.state === homeState;
              return (
                <div key={r.state} className="row wrap tax-row">
                  <strong style={{ minWidth: "10rem" }}>{STATES[r.state]}{home ? " (your state)" : ""}</strong>
                  <label className="f inline">
                    <span>Rate %</span>
                    <input type="number" step="0.001" min={0} max={20} value={r.rate || ""} placeholder={String(typical)} onChange={(e) => setRow(r.state, { rate: Number(e.target.value) || 0 })} style={{ width: "6.5rem" }} />
                  </label>
                  <span className="muted small">{r.rate ? `your rate (typical is ${typical}%)` : `typical: ${typical}% (state ${base}% + local)`}</span>
                  <label className="check"><input type="checkbox" checked={r.shipping} onChange={(e) => setRow(r.state, { shipping: e.target.checked })} /> Tax shipping too</label>
                  {!home ? <button type="button" className="b b-ghost b-sm" aria-label={`Stop collecting in ${STATES[r.state]}`} onClick={() => put({ rates: rows.filter((x) => x.state !== r.state) })}>✕</button> : null}
                </div>
              );
            })}
            <label className="f inline">
              <span>Also collect in</span>
              <select value="" onChange={(e) => add(e.target.value)}>
                <option value="">Add a state you&apos;re registered in…</option>
                {Object.entries(STATES).filter(([k]) => !rows.some((r) => r.state === k) && typicalRate(k) > 0).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
              </select>
            </label>
            <p className="muted small">Only add a state once you&apos;ve registered to collect its tax (usually only after selling a lot there). A tax preparer can tell you exactly.</p>
          </>
        )
      ) : t.mode === "stripe" ? (
        <p className="muted small">
          Stripe works out the exact city, county and state rate for each address. Switch on Stripe Tax and add where you&apos;re registered in Stripe first (<a href="https://dashboard.stripe.com/settings/tax" target="_blank" rel="noreferrer">Stripe › Settings › Tax</a>). Stripe charges a small fee per order. It needs Stripe connected, even for PayPal and pay-directly orders.
        </p>
      ) : (
        <p className="muted small">No sales tax is added to any order.</p>
      )}
    </section>
  );
}
