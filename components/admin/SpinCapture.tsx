"use client";
import { useEffect, useRef, useState } from "react";
import { uploadImage } from "./api";

/*
 * Takes the 360° photos with the phone's camera, right in the dashboard
 * (iPhone and Android). Prop the phone up, put the piece on a lazy Susan,
 * press Start and turn it slowly; a photo is taken every second or so.
 */
export function SpinCapture({ onDone, onClose }: { onDone: (urls: string[]) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [count, setCount] = useState(24);
  const [every, setEvery] = useState(1.5);
  const [shots, setShots] = useState<Blob[]>([]);
  const [phase, setPhase] = useState<"ready" | "countdown" | "shooting" | "review" | "uploading">("ready");
  const [tick, setTick] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1920 } }, audio: false })
      .then((s) => {
        stream.current = s;
        if (video.current) video.current.srcObject = s;
      })
      .catch(() => setErr("The camera couldn't start. Allow camera access for this site in your phone's settings, then try again."));
    return () => stream.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const grab = () =>
    new Promise<Blob | null>((resolve) => {
      const v = video.current;
      if (!v || !v.videoWidth) return resolve(null);
      const scale = Math.min(1, 1600 / Math.max(v.videoWidth, v.videoHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(v.videoWidth * scale);
      c.height = Math.round(v.videoHeight * scale);
      c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
      c.toBlob((b) => resolve(b), "image/jpeg", 0.85);
    });

  async function start() {
    setShots([]);
    setPhase("countdown");
    for (let i = 3; i > 0; i--) {
      setTick(i);
      await new Promise((r) => setTimeout(r, 1000));
    }
    setPhase("shooting");
    const taken: Blob[] = [];
    for (let i = 0; i < count; i++) {
      const b = await grab();
      if (b) taken.push(b);
      setShots([...taken]);
      if (i < count - 1) await new Promise((r) => setTimeout(r, every * 1000));
    }
    setPhase("review");
  }

  async function save() {
    setPhase("uploading");
    const urls: string[] = [];
    try {
      for (let i = 0; i < shots.length; i++) {
        setTick(i + 1);
        urls.push(await uploadImage(new File([shots[i]], `spin-${i + 1}.jpg`, { type: "image/jpeg" }), "spin"));
      }
      onDone(urls);
    } catch (e) {
      setErr((e as Error).message);
      setPhase("review");
    }
  }

  return (
    <div className="spin-cap panel stack">
      <div className="panel-head"><h2>Take 360° photos</h2><button className="b b-ghost b-sm" onClick={onClose}>Close</button></div>
      {err ? <p className="err">{err}</p> : null}
      <div className="cam">
        <video ref={video} autoPlay playsInline muted />
        <span className="cam-guide" aria-hidden />
        {phase === "countdown" ? <span className="cam-big">{tick}</span> : null}
        {phase === "shooting" ? <span className="cam-count">{shots.length} / {count}</span> : null}
      </div>
      {phase === "ready" ? (
        <>
          <p className="hint">Stand the phone still (a cup or tripod works) with the piece in the middle of the frame. Press Start, then turn the lazy Susan slowly so it goes all the way around once while the photos are taken. It takes about {Math.round(count * every)} seconds.</p>
          <div className="row wrap">
            <label className="f inline"><span>Photos</span><select value={count} onChange={(e) => setCount(Number(e.target.value))}>{[16, 24, 36, 48].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
            <label className="f inline"><span>Every</span><select value={every} onChange={(e) => setEvery(Number(e.target.value))}>{[1, 1.5, 2, 3].map((n) => <option key={n} value={n}>{n} sec</option>)}</select></label>
            <button className="b b-primary" onClick={start} disabled={Boolean(err)}>Start</button>
          </div>
        </>
      ) : null}
      {phase === "review" ? (
        <>
          <div className="spin-thumbs">
            {shots.map((b, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={URL.createObjectURL(b)} alt={`Photo ${i + 1}`} />
            ))}
          </div>
          <div className="row wrap">
            <button className="b b-primary" onClick={save}>Use these {shots.length} photos</button>
            <button className="b" onClick={() => setPhase("ready")}>Take them again</button>
          </div>
        </>
      ) : null}
      {phase === "uploading" ? <p className="hint">Saving photo {tick} of {shots.length}…</p> : null}
    </div>
  );
}
