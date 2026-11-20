import "server-only";
import { getKey } from "./keys";

/*
 * PayPal Checkout (REST v2). The customer taps the PayPal, Venmo or Pay Later
 * button on the cart page; we make the PayPal order here with the total the
 * shop worked out, then capture it when they approve. Docs:
 * https://developer.paypal.com/docs/api/orders/v2/
 */

export type PayPalMode = "live" | "sandbox";
// PAYPAL_API_BASE is only for automated tests (a stand-in PayPal); leave it unset
const api = (mode: PayPalMode) => process.env.PAYPAL_API_BASE || (mode === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com");

let token: { key: string; value: string; until: number } | null = null;

export async function paypalKeys() {
  const [id, secret] = await Promise.all([getKey("PAYPAL_CLIENT_ID"), getKey("PAYPAL_CLIENT_SECRET")]);
  return id && secret ? { id, secret } : null;
}

async function accessToken(mode: PayPalMode) {
  const k = await paypalKeys();
  if (!k) throw new Error("PayPal isn't connected (Accounts & keys).");
  const cacheKey = `${mode}:${k.id}`;
  if (token?.key === cacheKey && token.until > Date.now() + 60_000) return token.value;
  const r = await fetch(`${api(mode)}/v1/oauth2/token`, {
    method: "POST",
    headers: { authorization: `Basic ${Buffer.from(`${k.id}:${k.secret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(10_000),
  });
  const d = (await r.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!r.ok || !d.access_token) throw new Error(`PayPal sign-in failed: ${d.error_description ?? r.status}. Check the PayPal keys and Live/Sandbox in Settings > Payments.`);
  token = { key: cacheKey, value: d.access_token, until: Date.now() + (d.expires_in ?? 3000) * 1000 };
  return token.value;
}

async function call<T>(mode: PayPalMode, path: string, body?: unknown, requestId?: string): Promise<T> {
  const r = await fetch(`${api(mode)}${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${await accessToken(mode)}`, "content-type": "application/json", ...(requestId ? { "PayPal-Request-Id": requestId } : {}), prefer: "return=representation" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const d = (await r.json().catch(() => ({}))) as T & { message?: string; details?: { issue?: string; description?: string }[] };
  if (!r.ok) {
    const issue = d.details?.[0];
    const e = new Error(`PayPal: ${issue?.description ?? d.message ?? r.status}`) as Error & { issue?: string };
    e.issue = issue?.issue;
    throw e;
  }
  return d;
}

const usd = (cents: number) => (cents / 100).toFixed(2);

export type PayPalItem = { name: string; quantity: number; unit: number; description?: string };
export async function createPayPalOrder(mode: PayPalMode, o: { ref: string; brand: string; currency: string; items: PayPalItem[]; shipping: number; tax: number; discount: number; ship: boolean }) {
  const cur = o.currency.toUpperCase();
  const itemTotal = o.items.reduce((n, i) => n + i.unit * i.quantity, 0);
  const total = itemTotal + o.shipping + o.tax - o.discount;
  // PayPal only takes a discount up to the items' price; past that (a big gift card) send just the total
  const detailed = o.discount <= itemTotal;
  const res = await call<{ id: string }>(
    mode,
    "/v2/checkout/orders",
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: o.ref,
          custom_id: o.ref,
          amount: {
            currency_code: cur,
            value: usd(total),
            ...(detailed
              ? {
                  breakdown: {
                    item_total: { currency_code: cur, value: usd(itemTotal) },
                    ...(o.shipping ? { shipping: { currency_code: cur, value: usd(o.shipping) } } : {}),
                    ...(o.tax ? { tax_total: { currency_code: cur, value: usd(o.tax) } } : {}),
                    ...(o.discount ? { discount: { currency_code: cur, value: usd(o.discount) } } : {}),
                  },
                }
              : {}),
          },
          items: (detailed ? o.items : []).map((i) => ({
            name: i.name.slice(0, 127),
            ...(i.description ? { description: i.description.slice(0, 127) } : {}),
            quantity: String(i.quantity),
            unit_amount: { currency_code: cur, value: usd(i.unit) },
            category: "PHYSICAL_GOODS",
          })),
        },
      ],
      application_context: { brand_name: o.brand.slice(0, 127), shipping_preference: o.ship ? "GET_FROM_FILE" : "NO_SHIPPING", user_action: "PAY_NOW" },
    },
    `create-${o.ref}`
  );
  return res.id;
}

export type PayPalCapture = {
  id: string;
  status: string;
  payment_source?: Record<string, { email_address?: string; name?: { given_name?: string; surname?: string } }>;
  payer?: { email_address?: string; name?: { given_name?: string; surname?: string }; phone?: { phone_number?: { national_number?: string } } };
  purchase_units?: {
    custom_id?: string;
    shipping?: { name?: { full_name?: string }; address?: { address_line_1?: string; address_line_2?: string; admin_area_2?: string; admin_area_1?: string; postal_code?: string; country_code?: string } };
    payments?: { captures?: { id: string; status: string; amount: { value: string; currency_code: string } }[] };
  }[];
};

export function capturePayPalOrder(mode: PayPalMode, id: string) {
  if (!/^[A-Z0-9]{8,40}$/.test(id)) throw new Error("Not a PayPal order.");
  return call<PayPalCapture>(mode, `/v2/checkout/orders/${id}/capture`, {}, `capture-${id}`);
}

export function getPayPalOrder(mode: PayPalMode, id: string) {
  if (!/^[A-Z0-9]{8,40}$/.test(id)) throw new Error("Not a PayPal order.");
  return accessToken(mode).then((t) =>
    fetch(`${api(mode)}/v2/checkout/orders/${id}`, { headers: { authorization: `Bearer ${t}` }, signal: AbortSignal.timeout(15_000) }).then((r) => r.json() as Promise<PayPalCapture>)
  );
}
