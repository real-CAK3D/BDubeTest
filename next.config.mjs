/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  // the watermark's font has to ship with the function that stamps photos
  outputFileTracingIncludes: { "/api/wm": ["./assets/fonts/**"] },
};
export default nextConfig;
