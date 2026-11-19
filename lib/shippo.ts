import "server-only";
import { getKey } from "./keys";
import type { Parcel, ShipFrom, ShipTo } from "./types";

/*
 * EDIT-POINT: SHIPPING-LABELS
 * Buying postage through Shippo (USPS, UPS, FedEx...) from an order in the
 * dashboard. Shippo's own discounted rates; pay-as-you-go, no monthly fee.
 * Docs: https://docs.goshippo.com/shippoapi/public-api/
 */
const API = "https://api.goshippo.com";

async function call<T>(path: string, body: unknown): Promise<T> {
  const key = await getKey("SHIPPO_API_KEY");
  if (!key) throw new Error("Add your Shippo token on the Keys page first.");
  const r = await fetch(API + path, { method: "POST", headers: { authorization: `ShippoToken ${key}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = (await r.json().catch(() => ({}))) as T & { detail?: string };
  if (!r.ok) throw new Error(`Shippo: ${data.detail ?? JSON.stringify(data).slice(0, 200)}`);
  return data;
}

export type Rate = { id: string; carrier: string; service: string; amount: number; days: number | null };

export async function getRates(from: ShipFrom, to: ShipTo, parcel: Parcel): Promise<Rate[]> {
  if (!from.street1 || !from.zip) throw new Error("Add your ship-from address in Settings > Store first.");
  type R = { object_id: string; provider: string; servicelevel?: { name?: string }; amount: string; estimated_days?: number };
  const shipment = await call<{ rates?: R[]; messages?: { text: string }[] }>("/shipments/", {
    address_from: { name: from.name, company: from.company, street1: from.street1, street2: from.street2, city: from.city, state: from.state, zip: from.zip, country: "US", phone: from.phone, email: from.email },
    address_to: { name: to.name, street1: to.line1, street2: to.line2 ?? "", city: to.city, state: to.state, zip: to.zip, country: to.country || "US", phone: to.phone ?? "", email: to.email ?? "" },
    parcels: [{ length: String(parcel.length), width: String(parcel.width), height: String(parcel.height), distance_unit: "in", weight: String(parcel.weightOz), mass_unit: "oz" }],
    async: false,
  });
  const rates = (shipment.rates ?? []).map((r) => ({ id: r.object_id, carrier: r.provider, service: r.servicelevel?.name ?? "", amount: Math.round(Number(r.amount) * 100), days: r.estimated_days ?? null }));
  if (!rates.length) throw new Error(shipment.messages?.[0]?.text ?? "No rates came back. Check both addresses and the box size.");
  return rates.sort((a, b) => a.amount - b.amount);
}

export async function buyLabel(rateId: string) {
  const t = await call<{ status: string; label_url?: string; tracking_number?: string; messages?: { text: string }[] }>("/transactions/", { rate: rateId, label_file_type: "PDF_4x6", async: false });
  if (t.status !== "SUCCESS" || !t.label_url) throw new Error(t.messages?.map((m) => m.text).join(" ") || "Shippo couldn't make the label.");
  return { url: t.label_url, tracking: t.tracking_number ?? "" };
}

/** Shippo's carrier name in the form the tracking links use. */
export const carrierName = (provider: string) => (/usps/i.test(provider) ? "USPS" : /ups/i.test(provider) ? "UPS" : /fedex/i.test(provider) ? "FedEx" : /dhl/i.test(provider) ? "DHL" : "Other");
