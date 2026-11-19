"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Detector = { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> };

/*
 * Scan an order's barcode or QR code (receipt, packing slip) to open it. Uses
 * the phone's built-in barcode reader where the browser has one (Chrome on
 * Android); on iPhone, point the normal Camera app at the QR code instead, or
 * type the code.
 */
export function Scanner() {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  const open = (raw: string) => {
    const v = raw.trim();
    const m = v.match(/\/admin\/o\/([^/?#]+)/);
    router.push(`/admin/o/${encodeURIComponent(m ? m[1] : v)}`);
  };

  useEffect(() => {
    const W = window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector };
    if (!W.BarcodeDetector) return setSupported(false);
    setSupported(true);
    const detector = new W.BarcodeDetector({ formats: ["qr_code", "code_128"] });
    let stream: MediaStream | null = null;
    let stop = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then(async (s) => {
        stream = s;
        if (!video.current) return;
        video.current.srcObject = s;
        await video.current.play().catch(() => {});
        while (!stop) {
          const found = await detector.detect(video.current).catch(() => []);
          if (found[0]?.rawValue) {
            setMsg(`Found ${found[0].rawValue}`);
            open(found[0].rawValue);
            return;
          }
          await new Promise((r) => setTimeout(r, 300));
        }
      })
      .catch(() => setMsg("The camera couldn't start. Allow camera access, or type the code below."));
    return () => {
      stop = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="page-head"><h1>Scan an order</h1></div>
      {supported ? (
        <div className="cam"><video ref={video} playsInline muted /><span className="cam-guide" aria-hidden /></div>
      ) : supported === false ? (
        <p className="muted lead">This browser can&apos;t read barcodes itself. On an iPhone, open the normal Camera app and point it at the QR code on the packing slip; it opens the order. Or type the code from the receipt below.</p>
      ) : null}
      {msg ? <p className="small">{msg}</p> : null}
      <form className="row" onSubmit={(e) => (e.preventDefault(), code && open(code))}>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Order code or number, e.g. DFC1042-7KQ3" style={{ flex: 1 }} />
        <button className="b b-primary">Open</button>
      </form>
    </>
  );
}
