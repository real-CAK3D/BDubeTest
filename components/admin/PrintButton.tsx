"use client";
export function PrintButton({ label = "Print" }: { label?: string }) {
  return <button className="b b-primary" onClick={() => window.print()}>{label}</button>;
}
