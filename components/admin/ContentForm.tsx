"use client";
import type { SiteSettings, SocialLinks } from "@/lib/types";
import { ImageField } from "./ImageField";
import { Tabs } from "./Tabs";
import { useSettings } from "./useSettings";

export function ContentForm({ initial }: { initial: SiteSettings }) {
  const { s, set, bar } = useSettings(initial);
  const text = (k: keyof SiteSettings, label: string, opts: { rows?: number; hint?: string; placeholder?: string } = {}) => (
    <label className="f">
      <span>{label}</span>
      {opts.rows ? (
        <textarea rows={opts.rows} value={String(s[k] ?? "")} onChange={(e) => set({ [k]: e.target.value } as Partial<SiteSettings>)} placeholder={opts.placeholder} />
      ) : (
        <input value={String(s[k] ?? "")} onChange={(e) => set({ [k]: e.target.value } as Partial<SiteSettings>)} placeholder={opts.placeholder} />
      )}
      {opts.hint ? <em className="hint">{opts.hint}</em> : null}
    </label>
  );
  const social = (k: keyof SocialLinks, label: string) => (
    <label className="f">
      <span>{label}</span>
      <input type="url" value={s.social[k] ?? ""} onChange={(e) => set({ social: { ...s.social, [k]: e.target.value } })} placeholder="https://" />
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
                    <button type="button" className="b b-ghost b-sm" onClick={() => set({ customSteps: s.customSteps.filter((_, j) => j !== i) })}>Remove</button>
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
                <h2>Social links</h2>
                {social("facebook", "Facebook")}
                {social("instagram", "Instagram")}
                {social("tiktok", "TikTok")}
                {social("youtube", "YouTube")}
                {social("x", "X")}
                {social("etsy", "Etsy")}
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
            badge: s.extraPages.length || undefined,
            content: (
              <section className="panel stack">
                <p className="hint">Add any other page: FAQ, events, care instructions. Each gets its own web address. In the text, a short first line followed by an answer on the next line shows as a question and answer.</p>
                {s.extraPages.map((pg, i) => {
                  const up = (patch: Partial<typeof pg>) => set({ extraPages: s.extraPages.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
                  return (
                    <div key={i} className="page-edit">
                      <div className="row2">
                        <label className="f"><span>Title</span><input value={pg.title} onChange={(e) => up({ title: e.target.value })} /></label>
                        <label className="f"><span>Web address</span><input value={pg.slug} onChange={(e) => up({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })} /><em className="hint">/pages/{pg.slug || "..."}</em></label>
                      </div>
                      <label className="f"><span>Text</span><textarea rows={10} value={pg.body} onChange={(e) => up({ body: e.target.value })} /></label>
                      <div className="row wrap">
                        <label className="check"><input type="checkbox" checked={pg.inFooter} onChange={(e) => up({ inFooter: e.target.checked })} /> Link it in the footer</label>
                        <a className="b b-ghost b-sm" href={`/pages/${pg.slug}`} target="_blank" rel="noreferrer">View</a>
                        <button type="button" className="b b-danger b-sm" onClick={() => confirm(`Delete the "${pg.title}" page?`) && set({ extraPages: s.extraPages.filter((_, j) => j !== i) })}>Delete page</button>
                      </div>
                    </div>
                  );
                })}
                <button type="button" className="b b-sm" onClick={() => set({ extraPages: [...s.extraPages, { slug: `page-${s.extraPages.length + 1}`, title: "New page", body: "", inFooter: true }] })}>Add a page</button>
              </section>
            ),
          },
        ]}
      />
      {bar}
    </>
  );
}
