"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { unitPrice } from "@/lib/pricing";
import type { Design, ProductDesigns, ProductSize } from "@/lib/types";

export type CartLine = { productId: string; quantity: number; option?: string; custom?: string; size?: string; design?: string; art?: string };
export type CartProduct = { id: string; name: string; price: number; image?: string; slug: string; stock: number | null; sizes?: ProductSize[] | null; designs?: ProductDesigns | null };
export type CartDesign = Pick<Design, "id" | "name" | "image" | "extra" | "active" | "group">;

type Ctx = {
  lines: CartLine[];
  products: CartProduct[];
  count: number;
  subtotal: number;
  add: (l: CartLine) => void;
  setQty: (line: CartLine, qty: number) => void;
  clear: () => void;
  lastAdded: number;
  linePrice: (l: CartLine) => number;
  designOf: (l: CartLine) => CartDesign | undefined;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "cart:v1";

export function CartProvider({ products, designs = [], children }: { products: CartProduct[]; designs?: CartDesign[]; children: React.ReactNode }) {
  const price = useCallback(
    (l: CartLine) => {
      const p = products.find((x) => x.id === l.productId);
      return p ? unitPrice(p, l.size, l.design, designs as Design[]) : null;
    },
    [products, designs]
  );
  const [lines, setLines] = useState<CartLine[]>([]);
  const [lastAdded, setLastAdded] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // drop anything no longer for sale, or a size/design that was taken away
      if (raw) setLines((JSON.parse(raw) as CartLine[]).filter((l) => price(l) !== null));
    } catch {}
  }, [price]);

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const value = useMemo<Ctx>(() => {
    // same item + same choice + same engraving text = one cart line
    const same = (a: CartLine, b: CartLine) =>
      a.productId === b.productId && (a.option ?? "") === (b.option ?? "") && (a.custom ?? "") === (b.custom ?? "") && (a.size ?? "") === (b.size ?? "") && (a.design ?? "") === (b.design ?? "") && (a.art ?? "") === (b.art ?? "");
    const linePrice = (l: CartLine) => price(l) ?? 0;
    return {
      lines,
      products,
      lastAdded,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + linePrice(l) * l.quantity, 0),
      linePrice,
      designOf: (l) => designs.find((d) => d.id === l.design),
      add(l) {
        const existing = lines.find((x) => same(x, l));
        persist(
          existing
            ? lines.map((x) => (x === existing ? { ...x, quantity: Math.min(99, x.quantity + l.quantity) } : x))
            : [...lines, l]
        );
        setLastAdded(Date.now());
      },
      setQty(line, qty) {
        persist(qty <= 0 ? lines.filter((x) => !same(x, line)) : lines.map((x) => (same(x, line) ? { ...x, quantity: Math.min(99, qty) } : x)));
      },
      clear() {
        persist([]);
      },
    };
  }, [lines, products, designs, lastAdded, persist, price]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
