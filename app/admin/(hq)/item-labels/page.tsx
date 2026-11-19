import { PrintButton } from "@/components/admin/PrintButton";
import { barcodeSvg, qrSvg } from "@/lib/codes";
import { getProducts, getSettings } from "@/lib/db";
import { skuOf } from "@/lib/order-code";
import { siteUrl } from "@/lib/stripe";

export const metadata = { title: "Item labels" };

/*
 * A sheet of labels for the shelf or the back of a piece: a stock code
 * barcode (one per item and size) and a QR code that opens the item's page.
 */
export default async function ItemLabels() {
  const [products, s] = await Promise.all([getProducts(), getSettings()]);
  const rows = products.flatMap((p) => (p.sizes?.length ? p.sizes.map((z) => ({ p, size: z.name })) : [{ p, size: "" }]));
  const base = siteUrl();
  return (
    <>
      <div className="page-head no-print">
        <h1>Item labels</h1>
        <PrintButton label="Print labels" />
      </div>
      <p className="muted lead no-print">
        One label per item and size: a barcode with its stock code, and a QR code that opens its page in the shop. Print on plain paper or sticker sheets.
        (Retail UPC barcodes need numbers bought from GS1; these stock codes work with any scanner for your own use.)
      </p>
      <div className="labels-sheet">
        {rows.map(({ p, size }) => {
          const sku = skuOf(s.businessName, p.slug, size);
          return (
            <div key={sku} className="item-label">
              <div dangerouslySetInnerHTML={{ __html: qrSvg(`${base}/product/${p.slug}`) }} />
              <strong>{p.name}{size ? ` · ${size}` : ""}{p.active ? "" : " (hidden)"}</strong>
              <div className="bar" dangerouslySetInnerHTML={{ __html: barcodeSvg(sku) }} />
            </div>
          );
        })}
      </div>
    </>
  );
}
