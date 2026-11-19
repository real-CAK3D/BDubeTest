"use client";
import type { SiteSettings } from "@/lib/types";
import { ImageField } from "./ImageField";
import { LinksEditor } from "./LinksEditor";
import { Tabs } from "./Tabs";
import { useSettings } from "./useSettings";

export function ContentForm({ initial }: { initial: SiteSettings }) {
  const { s, set, bar } = useSettings(initial);
  const hidden = (k: string) => s.hiddenFields.includes(k);
  const eye = (k: string) => (
    <button
      type="button"
      className={`eye ${hidden(k) ? "off" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        set({ hiddenFields: hidden(k) ? s.hiddenFields.filter((x) => x !== k) : [...s.hiddenFields, k] });
      }}
      aria-pressed={hidden(k)}
      title={hidden(k) ? "Hidden on the shop (tap to show)" : "Shown on the shop (tap to hide, keeps the text)"}
    >
      {hidden(k) ? "Hidden" : "Shown"}
    </button>
  );
  const text = (k: keyof SiteSettings, label: string, opts: { rows?: number; hint?: string; placeholder?: string } = {}) => (
    <label className={`f ${hidden(k) ? "is-hidden" : ""}`}>
      <span className="f-row">{label}{k !== "businessName" ? eye(k) : null}</span>
      {opts.rows ? (
        <textarea rows={opts.rows} value={String(s[k] ?? "")} onChange={(e) => set({ [k]: e.target.value } as Partial<SiteSettings>)} placeholder={opts.placeholder} />
      ) : (
        <input value={String(s[k] ?? "")} onChange={(e) => set({ [k]: e.target.value } as Partial<SiteSettings>)} placeholder={opts.placeholder} />
      )}
      {opts.hint ? <em className="hint">{opts.hint}</em> : null}
    </label>
  );
  return (
    <>
      <div className="page-head"><h1>Words & logos</h1></div>
      <p className="muted">These also live in <code>site-variables.ts</code> on GitHub. Whichever is changed most recently wins.</p>
      <Tabs
        label="Words and logos sections"
        tabs={[
          {
            id: "home",
            label: "Home page",
            content: (
              <section className="panel stack">
                <h2>Business</h2>
                {text("businessName", "Business name")}
                {text("tagline", "Tagline", { hint: "Shows in search results and the Field Manual sidebar." })}
                {text("announcement", "Top banner message", { hint: "Leave empty to hide the banner." })}
                <h2>Welcome section</h2>
                {text("heroHeadline", "Headline")}
                {text("heroText", "Intro text", { rows: 3 })}
                {text("shopButton", "Main button", { hint: "Under the headline. Goes to the Shop page." })}
                {text("customButton", "Second button", { hint: "Workshop layout. Goes to the Contact page." })}
                {text("featuredHeading", "Heading above featured items")}
                {text("categoriesHeading", "Heading above the category tiles")}
                {text("aboutButton", "Button under the short about section")}
                {text("allItemsHeading", "Shop page heading", { hint: "Shown at the top of the page that lists every item." })}
                <h2>Custom order steps</h2>
                <p className="hint">Shown on the home page with the Workshop layout. Leave a title empty to skip that step.</p>
                {text("stepsHeading", "Heading")}
                {s.customSteps.map((st, i) => (
                  <div key={i} className="step-edit">
                    <span className="step-num">{i + 1}</span>
                    <input aria-label={`Step ${i + 1} title`} value={st.title} placeholder="Title" onChange={(e) => set({ customSteps: s.customSteps.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                    <textarea aria-label={`Step ${i + 1} text`} rows={2} value={st.text} placeholder="One or two sentences" onChange={(e) => set({ customSteps: s.customSteps.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
                    <button type="button" className="b b-ghost b-sm" onClick={() => set({ customSteps: s.customSteps.map((x, j) => (j === i ? { ...x, hidden: !x.hidden } : x)) })}>{st.hidden ? "Show" : "Hide"}</button>
                    <button type="button" className="b b-ghost b-sm" onClick={() => confirm("Delete this step? (Hide keeps it.)") && set({ customSteps: s.customSteps.filter((_, j) => j !== i) })}>Delete</button>
                  </div>
                ))}
                {s.customSteps.length < 6 ? <button type="button" className="b b-sm" onClick={() => set({ customSteps: [...s.customSteps, { title: "", text: "" }] })}>Add a step</button> : null}
              </section>
            ),
          },
          {
            id: "about",
            label: "About page",
            content: (
              <section className="panel stack">
                {text("aboutTitle", "About heading")}
                {text("about", "Your story", { rows: 10, hint: "Leave a blank line between paragraphs. The first paragraph also shows on the home page." })}
                {text("serviceLine", "Service line", { placeholder: "U.S. Army Military Police, 2004-2012" })}
                <label className="check"><input type="checkbox" checked={s.showVeteranBadge} onChange={(e) => set({ showVeteranBadge: e.target.checked })} /> Show the veteran-owned badge</label>
              </section>
            ),
          },
          {
            id: "contact",
            label: "Contact page",
            content: (
              <section className="panel stack">
                {text("contactHeading", "Contact heading")}
                {text("contactText", "Contact intro")}
                {text("contactEmail", "Email")}
                {text("contactPhone", "Phone")}
                {text("location", "Location", { placeholder: "e.g. Fort Leonard Wood, MO" })}
                <h2>Socials</h2>
                <p className="hint">Facebook, Instagram, TikTok, a phone number to call or text, an email, your website... They all show on your <strong>Socials</strong> page, a link-tree style page (<a href="/socials" target="_blank" rel="noreferrer">see it</a>). The footer, contact page and About page show one <strong>Socials</strong> button that opens it.</p>
                <LinksEditor value={s.links} onChange={(links) => set({ links })} />
              </section>
            ),
          },
          {
            id: "images",
            label: "Logos & photos",
            content: (
              <section className="panel image-grid">
                <ImageField label="Main logo" hint="Shown in the header and footer. A PNG with a transparent background works best." value={s.logo} onChange={(logo) => set({ logo })} folder="brand" shape="square" />
                <ImageField label="Patch / badge" hint="The round emblem on the home page. Uses the main logo if empty." value={s.emblem} onChange={(emblem) => set({ emblem })} folder="brand" shape="square" />
                <ImageField label="Browser tab icon" hint="Square image, at least 180 × 180." value={s.favicon} onChange={(favicon) => set({ favicon })} folder="brand" shape="square" />
                <ImageField label="Big welcome photo" hint="Used by the Showroom layout. Wide photos look best." value={s.heroImage} onChange={(heroImage) => set({ heroImage })} folder="brand" />
                <ImageField label="About photo" hint="A photo of you or the workshop." value={s.aboutImage} onChange={(aboutImage) => set({ aboutImage })} folder="brand" />
              </section>
            ),
          },
          {
            id: "reviews",
            label: "Reviews",
            content: (
              <section className="panel stack">
                <label className="check"><input type="checkbox" checked={s.showReviews} onChange={(e) => set({ showReviews: e.target.checked })} /> Show the reviews section and the Leave a review form</label>
                {text("reviewsHeading", "Heading")}
                {text("reviewsText", "Text next to the Leave a review button", { rows: 2 })}
                <p className="hint">Approve, pin or hide reviews on the <a href="/admin/reviews">Reviews</a> page.</p>
              </section>
            ),
          },
          {
            id: "custom",
            label: "Custom orders",
            content: (
              <section className="panel">
                <label className="check"><input type="checkbox" checked={s.showCustomOrders} onChange={(e) => set({ showCustomOrders: e.target.checked })} /> Show the custom order form (adds &quot;Custom orders&quot; to the menu)</label>
                {text("customOrderHeading", "Heading")}
                {text("customOrderIntro", "Intro text", { rows: 3 })}
                {text("customOrderNotice", "Notice shown above the form (sizes, equipment limits, large orders)", { rows: 4 })}
                <label className="field">
                  <span>Kinds of pieces people can pick (one per line)</span>
                  <textarea rows={5} value={s.customOrderTypes.join("\n")} onChange={(e) => set({ customOrderTypes: e.target.value.split("\n") })} />
                </label>
                <p className="hint">Requests show up on the <a href="/admin/requests">Requests</a> page, with buttons to email a quote or politely decline.</p>
              </section>
            ),
          },
          {
            id: "policies",
            label: "Policies & footer",
            content: (
              <section className="panel stack">
                <p className="hint">Each policy is its own page, linked in the footer. {"{business}"}, {"{email}"} and {"{state}"} fill in automatically. These are plain starting points, not legal advice; leave one empty to hide it.</p>
                {text("shippingPolicy", "Shipping", { rows: 5 })}
                {text("returnPolicy", "Returns", { rows: 5 })}
                {text("customOrderPolicy", "Custom & engraved orders", { rows: 6 })}
                {text("privacyPolicy", "Privacy", { rows: 7 })}
                {text("termsOfService", "Terms of service", { rows: 7 })}
                {text("disclaimer", "Disclaimer", { rows: 6 })}
                {text("legalState", "State whose laws apply", { placeholder: "e.g. Oklahoma", hint: "Used in the terms of service." })}
                <h2>Footer</h2>
                {text("footerNote", "Small print after the copyright line", { hint: `Shows as: © ${new Date().getFullYear()} ${s.businessName}. All rights reserved. (your note)` })}
                <h2>Email sign-up</h2>
                {text("newsletterText", "Text next to the sign-up box", { hint: "Turn the box on or off in Settings." })}
              </section>
            ),
          },
          {
            id: "pages",
            label: "Pages",
            content: (
              <section className="panel">
                <p>Your own pages (FAQ, events, care instructions...), the menu order and which pages are switched on are all on the <a href="/admin/pages">Pages &amp; menu</a> page.</p>
              </section>
            ),
          },
        ]}
      />
      {bar}
    </>
  );
}
