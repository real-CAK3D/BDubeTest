"use client";
import { createElement, useEffect, useState } from "react";

/*
 * Shows a 3D scan of the real item (a .glb file). Customers can turn it, zoom,
 * and on most phones tap "View in your space" to see it on their table (AR).
 */
export function ModelView({ src, poster, label }: { src: string; poster?: string; label: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    import("@google/model-viewer").then(() => setReady(true)).catch(() => setReady(false));
  }, []);
  if (!ready) return <div className="viewer3d"><p className="viewer-note">Loading 3D view…</p></div>;
  return (
    <div className="viewer3d">
      {createElement(
        "model-viewer",
        {
          src,
          poster,
          alt: label,
          "camera-controls": "",
          "auto-rotate": "",
          "touch-action": "pan-y",
          "shadow-intensity": "1",
          exposure: "1",
          ar: "",
          "ar-modes": "webxr scene-viewer quick-look",
          class: "viewer3d-stage",
        },
        createElement("button", { slot: "ar-button", className: "btn btn-sm ar-btn", type: "button" }, "View in your space")
      )}
    </div>
  );
}
