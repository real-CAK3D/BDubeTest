"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Review, ReviewStatus } from "@/lib/types";
import { api } from "./api";
import { Tabs } from "./Tabs";

export function ReviewManager({ initial, showing }: { initial: Review[]; showing: boolean }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [busy, setBusy] = useState("");

  async function act(r: Review, action: "approve" | "hide" | "delete" | "feature" | "unfeature") {
    if (action === "delete" && !confirm(`Delete ${r.name}'s review for good?`)) return;
    setBusy(r.id + action);
    try {
      const res = await api<{ review?: Review }>("/api/admin/reviews", "POST", { id: r.id, action });
      setList((l) => (action === "delete" ? l.filter((x) => x.id !== r.id) : l.map((x) => (x.id === r.id && res.review ? res.review : x))));
      router.refresh();
    } catch (e) {
      alert((e as Error).message);
    }
    setBusy("");
  }

  const card = (r: Review) => (
    <li key={r.id} className={`panel review-admin ${r.featured ? "pinned" : ""}`}>
      {r.photo ? (
        <a href={r.photo} target="_blank" rel="noreferrer" className="review-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.photo} alt="" />
        </a>
      ) : null}
      <div className="review-body">
        <div className="review-meta">
          <span className="gold">{"★".repeat(r.rating)}<span className="muted">{"★".repeat(5 - r.rating)}</span></span>
          <strong>{r.name}</strong>
          {r.location ? <span className="muted">{r.location}</span> : null}
          <span className="muted small">{new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          {r.featured ? <span className="pill s-shipped">On home page</span> : null}
        </div>
        {r.item ? <p className="muted small">About: {r.item}</p> : null}
        <p className="review-text">{r.text}</p>
        <div className="row wrap">
          {r.status !== "approved" ? <button className="b b-primary b-sm" disabled={Boolean(busy)} onClick={() => act(r, "approve")}>Approve</button> : null}
          {r.status === "approved" ? (
            r.featured ? (
              <button className="b b-sm" disabled={Boolean(busy)} onClick={() => act(r, "unfeature")}>Take off home page</button>
            ) : (
              <button className="b b-sm" disabled={Boolean(busy)} onClick={() => act(r, "feature")}>Pin to home page</button>
            )
          ) : null}
          {r.status !== "hidden" ? <button className="b b-ghost b-sm" disabled={Boolean(busy)} onClick={() => act(r, "hide")}>Hide</button> : null}
          <button className="b b-danger b-sm" disabled={Boolean(busy)} onClick={() => act(r, "delete")}>Delete</button>
        </div>
      </div>
    </li>
  );

  const of = (st: ReviewStatus) => list.filter((r) => r.status === st);
  const pinned = list.filter((r) => r.featured).length;

  return (
    <>
      <div className="page-head">
        <h1>Reviews</h1>
        <a className="b b-ghost b-sm" href="/review" target="_blank" rel="noreferrer">Open the review form</a>
      </div>
      <p className="muted lead">
        Customers send reviews (with a photo if they like) from the &quot;Leave a review&quot; button on your home page. Nothing shows on the site until you approve it.
        {pinned ? ` The ${pinned} you pinned show on the home page.` : " The home page shows your newest approved reviews, or only the ones you pin."}
        {showing ? "" : " The reviews section is turned off in Words & logos."}
      </p>
      <Tabs
        label="Review lists"
        initial={of("pending").length ? "pending" : "approved"}
        tabs={[
          { id: "pending", label: "Waiting", badge: of("pending").length || undefined, content: of("pending").length ? <ul className="reviews-admin">{of("pending").map(card)}</ul> : <div className="panel"><p>No reviews waiting. You&apos;ll get a notification when one comes in.</p></div> },
          { id: "approved", label: "On the site", badge: of("approved").length, content: of("approved").length ? <ul className="reviews-admin">{of("approved").map(card)}</ul> : <div className="panel"><p>No approved reviews yet. Share the review link with happy customers: <Link href="/review">/review</Link></p></div> },
          { id: "hidden", label: "Hidden", badge: of("hidden").length || undefined, content: of("hidden").length ? <ul className="reviews-admin">{of("hidden").map(card)}</ul> : <div className="panel"><p>Nothing hidden.</p></div> },
        ]}
      />
    </>
  );
}
