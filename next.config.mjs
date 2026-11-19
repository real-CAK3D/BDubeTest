import { readFileSync } from "fs";

// Version and build number shown at the bottom of the shop (tap it 7 times for the owner login)
const version = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")).version;
const d = new Date();
const pad = (n) => String(n).padStart(2, "0");
const build = `${String(d.getUTCFullYear()).slice(2)}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;

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
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(self)" },
        ],
      },
    ];
  },
  images: { unoptimized: true },
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  // the watermark's font has to ship with the function that stamps photos
  outputFileTracingIncludes: { "/api/wm": ["./assets/fonts/**"] },
};
export default nextConfig;
