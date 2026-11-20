"use client";
import { useEffect, useState } from "react";
import { LinkBadge } from "@/components/LinkIcon";

type Sheet = { url: string; label: string; page: boolean } | null;

const count = (what: string) => {
  const body = JSON.stringify({ what });
  if (!navigator.sendBeacon?.("/api/link-page", new Blob([body], { type: "application/json" })))
    fetch("/api/link-page", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
};

/**
 * The live parts of the Socials page: counts a visit and each tap on a link
 * (Dashboard > Link page shows the numbers), and the share sheet: copy the
 * link, a QR code, or post it straight to Facebook, X, WhatsApp...
 */
export function LinkPageClient({ pageUrl, title, avatar, qr, share, counting = true }: { pageUrl: string; title: string; avatar: string; qr: string; share: boolean; counting?: boolean }) {
  const [sheet, setSheet] = useState<Sheet>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (counting) try {
      if (!sessionStorage.getItem("lt-seen")) {
        sessionStorage.setItem("lt-seen", "1");
        count("v");
      }
    } catch {
      count("v");
    }
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const more = t.closest<HTMLElement>("[data-share]");
      if (more) {
        e.preventDefault();
        setCopied(false);
        setSheet({ url: more.dataset.share ?? pageUrl, label: more.dataset.label ?? title, page: false });
        return;
      }
      const link = t.closest<HTMLElement>("[data-lt]");
      if (counting && link?.dataset.lt) count(link.dataset.lt);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pageUrl, title, counting]);

  useEffect(() => {
    if (!sheet) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setSheet(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [sheet]);

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const i = document.createElement("input");
      i.value = url;
      document.body.append(i);
      i.select();
      document.execCommand("copy");
      i.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveQr() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([qr], { type: "image/svg+xml" }));
    a.download = "socials-qr-code.svg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const s = sheet;
  const text = s ? (s.page ? `Find ${title} here` : s.label) : "";
  const e = encodeURIComponent;
  const targets = s
    ? [
        { icon: "facebook", name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${e(s.url)}` },
        { icon: "x", name: "X", href: `https://x.com/intent/post?url=${e(s.url)}&text=${e(text)}` },
        { icon: "whatsapp", name: "WhatsApp", href: `https://wa.me/?text=${e(`${text} ${s.url}`)}` },
        { icon: "messenger", name: "Messenger", href: `fb-messenger://share/?link=${e(s.url)}` },
        { icon: "linkedin", name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(s.url)}` },
        { icon: "telegram", name: "Telegram", href: `https://t.me/share/url?url=${e(s.url)}&text=${e(text)}` },
        { icon: "text", name: "Text", href: `sms:?&body=${e(`${text} ${s.url}`)}` },
        { icon: "email", name: "Email", href: `mailto:?subject=${e(text)}&body=${e(s.url)}` },
      ]
    : [];

  return (
    <>
      {share ? (
        <button type="button" className="lt-share" aria-label="Share this page" onClick={() => (setCopied(false), setSheet({ url: pageUrl, label: title, page: true }))}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 15V3M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>
        </button>
      ) : null}
      {s ? (
        <div className="lt-sheet-back" onClick={() => setSheet(null)}>
          <div className="lt-sheet" role="dialog" aria-modal="true" aria-label={s.page ? "Share this page" : "Share this link"} onClick={(ev) => ev.stopPropagation()}>
            <header>
              <strong>{s.page ? "Share this page" : "Share link"}</strong>
              <button type="button" className="lt-x" aria-label="Close" onClick={() => setSheet(null)}>✕</button>
            </header>
            <div className="lt-card">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" />
              ) : null}
              <strong>{s.page ? title : s.label}</strong>
              <span>{s.url.replace(/^https?:\/\//, "")}</span>
            </div>
            {s.page && qr ? (
              <div className="lt-qr">
                <span dangerouslySetInnerHTML={{ __html: qr }} />
                <button type="button" className="lt-opt" onClick={saveQr}>Save the QR code</button>
              </div>
            ) : null}
            <button type="button" className="lt-opt lt-copy" onClick={() => copy(s.url)}>
              {copied ? "Copied!" : "Copy link"}
            </button>
            {typeof navigator !== "undefined" && "share" in navigator ? (
              <button type="button" className="lt-opt" onClick={() => navigator.share({ title: s.page ? title : s.label, url: s.url }).catch(() => {})}>
                More ways to share…
              </button>
            ) : null}
            <ul className="lt-targets">
              {targets.map((t) => (
                <li key={t.icon}>
                  <a href={t.href} target="_blank" rel="noreferrer">
                    <LinkBadge icon={t.icon} size={44} />
                    <span>{t.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
