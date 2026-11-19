import Link from "next/link";
import { getProducts } from "@/lib/db";

export const metadata = { title: "3D & 360" };

const SHAPES: Record<string, string> = { tumbler: "Tumbler", mug: "Mug", sign: "Sign", round: "Round", square: "Square", card: "Card" };

export default async function Studio() {
  const products = await getProducts();
  return (
    <>
      <div className="page-head"><h1>3D &amp; 360</h1></div>
      <section className="panel">
        <p>Three ways to let customers turn an item around before they buy. Tap <strong>Set up</strong> on any item; it opens that item at its <em>Previews</em> section.</p>
        <ul className="hint">
          <li><strong>3D model</strong>: pick a shape (tumbler, mug, sign...) and color; the shop draws it wearing the design the customer picks. No equipment needed.</li>
          <li><strong>3D scan</strong>: upload a .glb file of the real item (made with a phone scanning app such as Polycam or Scaniverse, exported as GLB).</li>
          <li><strong>360° photos</strong>: tap <em>Take 360° photos with the camera</em>, set the item on a turntable or walk around it, and the phone snaps the photos for you.</li>
        </ul>
      </section>
      <section className="panel">
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Item</th><th>3D model</th><th>3D scan</th><th>360° photos</th><th /></tr></thead>
          <tbody>
            {products.map((p) => {
              const v = p.preview ?? {};
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{v.shape ? SHAPES[v.shape] ?? v.shape : <span className="muted">none</span>}</td>
                  <td>{v.model ? "✓ uploaded" : <span className="muted">none</span>}</td>
                  <td>{v.spin?.length ? `✓ ${v.spin.length} photos` : <span className="muted">none</span>}</td>
                  <td><Link className="b b-sm" href={`/admin/products?edit=${encodeURIComponent(p.id)}#previews`}>Set up</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
        {products.length ? null : <p className="muted">Add an item in Products first.</p>}
      </section>
    </>
  );
}
