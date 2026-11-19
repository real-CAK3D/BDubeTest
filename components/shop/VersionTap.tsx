"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

/*
 * The app's version and build number. Tapping it 7 times in a row opens the
 * owner login, the same way phones hide their developer options. There is no
 * visible login link anywhere on the shop.
 */
export function VersionTap() {
  const router = useRouter();
  const taps = useRef<number[]>([]);
  const [hint, setHint] = useState("");
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0";
  const build = process.env.NEXT_PUBLIC_BUILD ?? "dev";

  function tap() {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 3000), now];
    const n = taps.current.length;
    if (n >= 7) {
      taps.current = [];
      setHint("");
      router.push("/admin/login");
    } else if (n >= 4) setHint(`${7 - n}`);
    else setHint("");
  }

  return (
    <button type="button" className="version-tap" onClick={tap} aria-label={`Version ${version}, build ${build}`}>
      Version {version} (build {build}){hint ? <span aria-hidden> · {hint}</span> : null}
    </button>
  );
}
