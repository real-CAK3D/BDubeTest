"use client";
import { useState } from "react";

type Result = {
  number: number;
  code: string;
  barcode: string;
  date: string;
  status: string;
  delivery: string;
  items: { name: string; quantity: number }[];
  tracking: { number: string; carrier: string; url: string } | null;
};

const SAY: Record<string, (pickup: boolean) => string> = {
  paid: (p) => (p ? "We're working on it. We'll let you know when it's ready to pick up." : "We're working on it. You'll get an email with tracking when it ships."),
  shipped: (p) => (p ? "Ready for pickup." : "On its way."),
  delivered: (p) => (p ? "Picked up. Thank you!" : "Delivered. Thank you!"),
  refunded: () => "This order was refunded.",
  cancelled: () => "This order was cancelled.",
};

export function OrderLookup() {
  const [r, setR] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function look(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/order-status", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ number: f.get("number"), email: f.get("email") }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setR(data);
    else {
      setR(null);
      setErr(data.error ?? "Something went wrong. Please try again.");
    }
    setBusy(false);
  }

  return (
    <>
      <form className="review-form lookup" onSubmit={look}>
        <label className="field"><span>Order number or code</span><input name="number" required placeholder="e.g. 1042 or DFC1042-7KQ3" /></label>
        <label className="field"><span>Email used at checkout</span><input name="email" type="email" required autoComplete="email" /></label>
        <button className="btn btn-lg" disabled={busy}>{busy ? "Looking…" : "Find my order"}</button>
        {err ? <p className="error full" role="alert">{err}</p> : null}
      </form>
      {r ? (
        <div className="form-done order-result" role="status">
          <p><strong>Order #{r.number}</strong> <span className="muted">placed {new Date(r.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span></p>
          <div className="receipt-code" dangerouslySetInnerHTML={{ __html: r.barcode }} />
          <p>{(SAY[r.status] ?? (() => r.status))(r.delivery === "pickup")}</p>
          {r.tracking ? (
            <p>
              Tracking{r.tracking.carrier ? ` (${r.tracking.carrier})` : ""}:{" "}
              {r.tracking.url ? <a href={r.tracking.url} target="_blank" rel="noreferrer">{r.tracking.number}</a> : r.tracking.number}
            </p>
          ) : null}
          <ul>{r.items.map((i, n) => <li key={n}>{i.quantity} x {i.name}</li>)}</ul>
        </div>
      ) : null}
    </>
  );
}
