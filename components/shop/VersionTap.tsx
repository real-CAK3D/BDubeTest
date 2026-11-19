"use client";
import { useRouter } from "next/navigation";
import { useRef } from "react";

/*
 * The app's version and build number. Tapping it 15 times in a row (within a
 * few seconds of each tap) opens the owner login; nothing on screen hints at
 * it. Once signed in, the shop shows the owner a Shop HQ button instead, so
 * this is only needed on a new device.
 */
const TAPS = 15;

export function VersionTap() {
  const router = useRouter();
  const taps = useRef<number[]>([]);
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0";
  const build = process.env.NEXT_PUBLIC_BUILD ?? "dev";

  function tap() {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 1500 * TAPS && now - t >= 0), now];
    // a pause of more than 1.5 seconds starts the count again
    const last = taps.current.at(-2);
    if (last && now - last > 1500) taps.current = [now];
    if (taps.current.length >= TAPS) {
      taps.current = [];
      router.push("/admin/login");
    }
  }

  return (
    <button type="button" className="version-tap" onClick={tap} aria-label={`Version ${version}, build ${build}`}>
      Version {version} (build {build})
    </button>
  );
}
