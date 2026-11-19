"use client";
import { useState } from "react";

/** Share an item: the phone's share sheet where there is one, plus Facebook and copy-link. */
export function ShareButtons({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => window.location.origin + path;
  return (
    <div className="share">
      <span className="muted small">Share:</span>
      <button
        type="button"
        className="linkish"
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ title, url: url() });
            } catch {}
          } else {
            await navigator.clipboard?.writeText(url());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        }}
      >
        {copied ? "Link copied" : "Send to a friend"}
      </button>
      <a className="linkish" href="#" onClick={(e) => { e.preventDefault(); window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`, "_blank", "noopener"); }}>
        Facebook
      </a>
      <a className="linkish" href="#" onClick={(e) => { e.preventDefault(); window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url())}&description=${encodeURIComponent(title)}`, "_blank", "noopener"); }}>
        Pinterest
      </a>
    </div>
  );
}
