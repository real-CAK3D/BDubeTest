import { readFileSync } from "fs";

// Version and build number shown at the bottom of the shop (tap it 7 times for the owner login)
const version = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")).version;
const d = new Date();
const pad = (n) => String(n).padStart(2, "0");
const build = `${String(d.getUTCFullYear()).slice(2)}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;

const MEANING_FILES = ["./models/minilm/**", "./node_modules/onnxruntime-web/dist/ort.node.min.mjs", "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs", "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm"];

/*
 * EDIT-POINT: SECURITY-POLICY
 * What a page is allowed to load (Content-Security-Policy). Scripts only from
 * this site and PayPal's buttons; pages can't be framed by other sites; forms
 * only post here. If you add a service that runs in the browser (a chat
 * widget, analytics...), add its address to the matching line below.
 */
const dev = process.env.NODE_ENV !== "production";
const PAYPAL = "https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com https://*.venmo.com";
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${dev ? "'unsafe-eval' " : ""}${PAYPAL}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  `connect-src 'self' ${PAYPAL} https://www.gstatic.com${dev ? " ws: http://localhost:*" : ""}`,
  `frame-src 'self' ${PAYPAL}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${PAYPAL}`,
  "frame-ancestors 'self'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { NEXT_PUBLIC_APP_VERSION: version, NEXT_PUBLIC_BUILD: build },
  poweredByHeader: false,
  // basic protections on every page
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(self \"https://www.paypal.com\"), usb=()" },
          { key: "Content-Security-Policy", value: CSP },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
  images: { unoptimized: true },
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  // the watermark's font has to ship with the function that stamps photos
  // the chat's meaning model (lib/meaning.ts): its files and the WebAssembly runtime ship with the functions that use it
  serverExternalPackages: ["onnxruntime-web"],
  outputFileTracingIncludes: {
    "/api/wm": ["./assets/fonts/**"],
    "/api/chat": MEANING_FILES,
    "/api/admin/chat": MEANING_FILES,
    "/admin/chat": MEANING_FILES,
  },
};
export default nextConfig;
