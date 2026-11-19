"use client";
import { useEffect, useRef, useState } from "react";
import type { Shape3D } from "@/lib/types";

/*
 * EDIT-POINT: 3D-SHAPES
 * A 3D model of the item drawn in the browser (no files needed), wearing the
 * design the customer picked. Drag to turn it, pinch or scroll to zoom.
 * Each shape below is built from simple parts; sizes are roughly in cm.
 */

type Props = { shape: Shape3D; color: string; design?: string; label: string };

// What a laser mark looks like on each material: bare steel through powder coat,
// pale on slate, burnt on wood and leather
const ENGRAVE: Record<Shape3D, [number, number, number]> = {
  tumbler: [226, 229, 233],
  mug: [226, 229, 233],
  round: [205, 205, 200],
  square: [205, 205, 200],
  sign: [58, 34, 18],
  card: [30, 18, 10],
};

// Wood and stone colors for the items that aren't painted
const MATERIAL: Partial<Record<Shape3D, { color: string; metal: number; rough: number }>> = {
  sign: { color: "#b98a5a", metal: 0, rough: 0.85 },
  round: { color: "#2f3236", metal: 0, rough: 0.9 },
  square: { color: "#2f3236", metal: 0, rough: 0.9 },
  card: { color: "#5a3a24", metal: 0, rough: 0.7 },
};

export function Viewer3D({ shape, color, design, label }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const api = useRef<{ turn: (deg: number) => void; setDesign: (src?: string) => void } | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let stop = false;
    let cleanup = () => {};
    (async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
        const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
        const el = box.current;
        if (stop || !el) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        el.appendChild(renderer.domElement);
        renderer.domElement.setAttribute("aria-label", label);
        renderer.domElement.setAttribute("role", "img");

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6));
        const sun = new THREE.DirectionalLight(0xffffff, 1.4);
        sun.position.set(6, 10, 8);
        scene.add(sun);

        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 500);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        controls.autoRotateSpeed = 1.6;
        controls.addEventListener("start", () => (controls.autoRotate = false));

        const item = new THREE.Group();
        scene.add(item);
        const m = MATERIAL[shape];
        const body = new THREE.MeshStandardMaterial({ color: m?.color ?? color, metalness: m?.metal ?? 0.35, roughness: m?.rough ?? 0.4 });
        const dark = new THREE.MeshStandardMaterial({ color: "#1b1b1b", metalness: 0.2, roughness: 0.5 });
        const steel = new THREE.MeshStandardMaterial({ color: "#c9cdd2", metalness: 0.9, roughness: 0.25 });
        const decalMat = new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.6, metalness: 0.1, polygonOffset: true, polygonOffsetFactor: -2 });
        let decal: InstanceType<typeof THREE.Mesh> | null = null;
        // where the design goes, filled in per shape: fits a design of a given width/height ratio
        let placeDecal: (aspect: number) => InstanceType<typeof THREE.BufferGeometry<import("three").NormalBufferAttributes>> = () => new THREE.PlaneGeometry(1, 1);
        let target = new THREE.Vector3(0, 0, 0);
        let dist = 40;

        if (shape === "tumbler" || shape === "mug") {
          const tall = shape === "tumbler";
          const H = tall ? 26 : 10;
          const rBot = tall ? 3.7 : 4;
          const rTop = tall ? 4.9 : 4;
          const radiusAt = (y: number) => (tall ? (y < 9 ? rBot + (4.6 - rBot) * (y / 9) : 4.6 + (rTop - 4.6) * ((y - 9) / (H - 9))) : rBot);
          const pts = [new THREE.Vector2(0, 0)];
          for (let y = 0; y <= H; y += 0.5) pts.push(new THREE.Vector2(radiusAt(y), y));
          pts.push(new THREE.Vector2(radiusAt(H) - 0.3, H));
          item.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 72), body));
          if (tall) {
            const lid = new THREE.Mesh(new THREE.CylinderGeometry(rTop + 0.05, rTop + 0.1, 1.8, 72), steel);
            lid.position.y = H + 0.9;
            const top = new THREE.Mesh(new THREE.CylinderGeometry(rTop - 0.4, rTop, 0.8, 72), dark);
            top.position.y = H + 2.2;
            const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 9, 24), dark);
            straw.position.set(1.2, H + 5.5, 0.6);
            straw.rotation.z = -0.12;
            item.add(lid, top, straw);
          }
          // handle on the left, the design faces the front
          const path = new THREE.CatmullRomCurve3(
            tall
              ? [new THREE.Vector3(-4.7, 21, 0), new THREE.Vector3(-8.5, 20.5, 0), new THREE.Vector3(-9.2, 15, 0), new THREE.Vector3(-8.2, 9.5, 0), new THREE.Vector3(-4.4, 9, 0)]
              : [new THREE.Vector3(-3.9, 8.2, 0), new THREE.Vector3(-7, 7.6, 0), new THREE.Vector3(-7, 3, 0), new THREE.Vector3(-3.9, 2.2, 0)]
          );
          item.add(new THREE.Mesh(new THREE.TubeGeometry(path, 48, tall ? 0.75 : 0.65, 16), tall ? dark : body));
          const y0 = tall ? 11 : 2.2;
          const y1 = tall ? 23 : 8.2;
          placeDecal = (aspect) => {
            const h = y1 - y0;
            const rMid = radiusAt((y0 + y1) / 2);
            const arc = Math.min(Math.PI * 0.9, (h * aspect) / rMid);
            const hh = Math.min(h, (arc * rMid) / aspect);
            const mid = (y0 + y1) / 2;
            const g = new THREE.CylinderGeometry(radiusAt(mid + hh / 2) + 0.03, radiusAt(mid - hh / 2) + 0.03, hh, 64, 1, true, -arc / 2, arc);
            g.translate(0, mid, 0);
            return g;
          };
          target = new THREE.Vector3(0, tall ? 14 : 5, 0);
          dist = tall ? 62 : 30;
        } else if (shape === "sign") {
          item.add(new THREE.Mesh(new THREE.BoxGeometry(32, 13, 1.8), body));
          placeDecal = (aspect) => {
            const w = Math.min(28, 10.5 * aspect);
            const g = new THREE.PlaneGeometry(w, w / aspect);
            g.translate(0, 0, 0.92);
            return g;
          };
          dist = 52;
        } else if (shape === "round" || shape === "square") {
          item.add(new THREE.Mesh(shape === "round" ? new THREE.CylinderGeometry(5.2, 5.2, 0.6, 72) : new THREE.BoxGeometry(10.4, 0.6, 10.4), body));
          placeDecal = (aspect) => {
            const s = shape === "round" ? 6.8 : 8.6;
            const g = new THREE.PlaneGeometry(aspect >= 1 ? s : s * aspect, aspect >= 1 ? s / aspect : s);
            g.rotateX(-Math.PI / 2);
            g.translate(0, 0.31, 0);
            return g;
          };
          item.rotation.x = 0.55; // tilt toward the viewer
          dist = 26;
        } else {
          item.add(new THREE.Mesh(new THREE.BoxGeometry(10, 6.4, 0.7), body));
          placeDecal = (aspect) => {
            const w = Math.min(8.6, 5.2 * aspect);
            const g = new THREE.PlaneGeometry(w, w / aspect);
            g.translate(0, 0, 0.36);
            return g;
          };
          dist = 22;
        }

        controls.target.copy(target);
        camera.position.set(target.x + dist * 0.18, target.y + dist * 0.12, target.z + dist);
        controls.minDistance = dist * 0.45;
        controls.maxDistance = dist * 1.8;

        // draw the design on a canvas first (works for SVG, PNG and JPG alike)
        const setDesign = (src?: string) => {
          if (decal) {
            item.remove(decal);
            decal.geometry.dispose();
            decal = null;
          }
          if (!src) return;
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            if (stop) return;
            const w = img.naturalWidth || 1024;
            const h = img.naturalHeight || 1024;
            const aspect = w / h;
            const c = document.createElement("canvas");
            c.width = 1024;
            c.height = Math.round(1024 / aspect);
            const ctx = c.getContext("2d")!;
            ctx.drawImage(img, 0, 0, c.width, c.height);
            // turn the artwork into a laser mark: dark lines become the engraved color, light areas disappear
            try {
              const data = ctx.getImageData(0, 0, c.width, c.height);
              const [er, eg, eb] = ENGRAVE[shape];
              const px = data.data;
              for (let i = 0; i < px.length; i += 4) {
                const lum = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
                const a = Math.max(0, Math.min(1, (0.82 - lum) / 0.55)) * (px[i + 3] / 255);
                px[i] = er;
                px[i + 1] = eg;
                px[i + 2] = eb;
                px[i + 3] = Math.round(a * 255);
              }
              ctx.putImageData(data, 0, 0);
            } catch {
              // an image from another site without permission: show it as it is
            }
            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 4;
            decalMat.map?.dispose();
            decalMat.map = tex;
            decalMat.needsUpdate = true;
            decal = new THREE.Mesh(placeDecal(aspect), decalMat);
            item.add(decal);
          };
          img.src = src;
        };
        setDesign(design);

        const size = () => {
          const w = el.clientWidth;
          const h = el.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        size();
        const ro = new ResizeObserver(size);
        ro.observe(el);

        let raf = 0;
        const tick = () => {
          controls.update();
          renderer.render(scene, camera);
          raf = requestAnimationFrame(tick);
        };
        tick();
        api.current = {
          turn: (deg) => {
            controls.autoRotate = false;
            item.rotation.y += (deg * Math.PI) / 180;
          },
          setDesign,
        };
        setState("ready");

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          controls.dispose();
          scene.traverse((o) => {
            const mesh = o as InstanceType<typeof THREE.Mesh>;
            if (mesh.geometry) mesh.geometry.dispose();
          });
          [body, dark, steel, decalMat].forEach((mat) => {
            mat.map?.dispose();
            mat.dispose();
          });
          pmrem.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch (e) {
        console.error(e);
        if (!stop) setState("failed");
      }
    })();
    return () => {
      stop = true;
      api.current = null;
      cleanup();
    };
    // the design changes are handled below without rebuilding the scene
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape, color, label]);

  useEffect(() => {
    api.current?.setDesign(design);
  }, [design, state]);

  return (
    <div className="viewer3d">
      <div ref={box} className="viewer3d-stage" />
      {state === "loading" ? <p className="viewer-note">Loading 3D view…</p> : null}
      {state === "failed" ? <p className="viewer-note">This device can&apos;t show the 3D view. The photos show the real piece.</p> : null}
      <div className="viewer-controls">
        <button type="button" onClick={() => api.current?.turn(-30)} aria-label="Turn left">‹</button>
        <span>Drag to turn{design ? "" : " · pick a design to see it on"}</span>
        <button type="button" onClick={() => api.current?.turn(30)} aria-label="Turn right">›</button>
      </div>
    </div>
  );
}
