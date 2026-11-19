import type { SiteVariables } from "./site-variables-type";
import type { Product, SiteSettings } from "./types";

/*
 * EDIT-POINT: VARIABLES-FILE
 * Writes site-variables.ts from the shop's current settings and products.
 * Used when dashboard edits are copied to GitHub, so the file on GitHub
 * always matches the live site. The comments below are what appear in that file.
 */

const dollars = (c: number | null | undefined) => (c == null ? null : Math.round(c) / 100);

export function settingsToVariables(s: Omit<SiteSettings, "admin" | "shipFrom" | "parcels">, products: Product[]): SiteVariables {
  return {
    brand: { businessName: s.businessName, tagline: s.tagline, announcement: s.announcement },
    homePage: {
      headline: s.heroHeadline,
      intro: s.heroText,
      shopButton: s.shopButton,
      customButton: s.customButton,
      featuredHeading: s.featuredHeading,
      categoriesHeading: s.categoriesHeading,
      aboutButton: s.aboutButton,
      allItemsHeading: s.allItemsHeading,
      stepsHeading: s.stepsHeading,
      customSteps: s.customSteps,
    },
    reviews: { show: s.showReviews, heading: s.reviewsHeading, text: s.reviewsText },
    customOrders: { show: s.showCustomOrders, heading: s.customOrderHeading, intro: s.customOrderIntro, notice: s.customOrderNotice, types: s.customOrderTypes },
    about: { heading: s.aboutTitle, story: s.about, serviceLine: s.serviceLine, showVeteranBadge: s.showVeteranBadge },
    contact: { heading: s.contactHeading, text: s.contactText, email: s.contactEmail, phone: s.contactPhone, location: s.location, showContactForm: s.showContactForm },
    newsletter: { show: s.showNewsletter, text: s.newsletterText },
    social: {
      facebook: s.social.facebook ?? "",
      instagram: s.social.instagram ?? "",
      tiktok: s.social.tiktok ?? "",
      youtube: s.social.youtube ?? "",
      x: s.social.x ?? "",
      etsy: s.social.etsy ?? "",
    },
    policies: {
      shipping: s.shippingPolicy,
      returns: s.returnPolicy,
      customOrders: s.customOrderPolicy,
      privacy: s.privacyPolicy,
      terms: s.termsOfService,
      disclaimer: s.disclaimer,
      state: s.legalState,
    },
    extraPages: s.extraPages,
    menu: s.menu.map((m) => ({ page: m.id, label: m.label, ...(m.href ? { link: m.href } : {}), inMenu: m.top, inFooter: m.footer, on: !m.off })),
    categories: s.categories,
    hiddenText: s.hiddenFields,
    links: s.links.map((l) => ({ icon: l.icon, label: l.label, url: l.url, ...(l.hidden ? { hidden: true } : {}) })),
    chat: { on: s.chat.on, useAI: s.chat.useAI, live: s.chat.live !== false, ai: s.chat.ai ?? { provider: "anthropic", model: "", baseUrl: "" }, title: s.chat.title, greeting: s.chat.greeting, questions: s.chat.faqs.map((x) => ({ id: x.id, ...(x.topic ? { topic: x.topic } : {}), question: x.q, answer: x.a, ...(x.alts?.length ? { alsoAsked: x.alts } : {}), ...(x.hidden ? { hidden: true } : {}) })) },
    discounts: {
      thankYouCode: { on: s.discounts.thankYou.on, percentOff: s.discounts.thankYou.percent, validDays: s.discounts.thankYou.days },
      military: { on: s.discounts.veteran.on, percentOff: s.discounts.veteran.percent, checkFirst: s.discounts.veteran.verify, code: s.discounts.veteran.code, heading: s.discounts.veteran.heading, text: s.discounts.veteran.text },
      bulk: s.discounts.bulk.map((t) => ({ fromItems: t.minQty, percentOff: t.percent })),
      giftCards: s.discounts.giftCards,
      checkoutReminders: { on: s.discounts.reminders.on, afterHours: s.discounts.reminders.hours },
    },
    watermark: { on: s.watermark.on, text: s.watermark.text, withLogo: s.watermark.useLogo, position: s.watermark.position, opacity: s.watermark.opacity, size: s.watermark.size, onOurWork: s.watermark.onGallery, onDesigns: s.watermark.onDesigns },
    designs: s.designs.map((d) => ({ id: d.id, name: d.name, image: d.image, group: d.group, extraPrice: dollars(d.extra) ?? 0, show: d.active, ...(d.note ? { note: d.note } : {}) })),
    footer: { note: s.footerNote },
    gallery: { heading: s.galleryHeading, text: s.galleryText, items: s.gallery },
    images: { logo: s.logo, patch: s.emblem, tabIcon: s.favicon, welcomePhoto: s.heroImage, aboutPhoto: s.aboutImage },
    look: { theme: s.theme as SiteVariables["look"]["theme"], layout: s.layout as SiteVariables["look"]["layout"] },
    store: {
      open: s.storeOpen,
      closedMessage: s.closedMessage,
      askForShippingAddress: s.collectShipping,
      shippingPrice: dollars(s.shippingFlat) ?? 0,
      freeShippingOver: dollars(s.freeShippingOver) ?? 0,
      shipToCountries: s.shipCountries,
      shipFromZip: s.shipFromZip,
      shippingByDistance: s.shippingTiers.map((t) => ({ upToMiles: t.upToMiles, price: dollars(t.price) ?? 0 })),
      internationalShipping: dollars(s.intlShipping) ?? 0,
      localPickup: s.localPickup,
      pickupNote: s.pickupNote,
      giftNotes: s.giftNotes,
      lowStockAlert: s.lowStockAlert,
      allowPromoCodes: s.allowPromoCodes,
      salesTaxByStripe: s.stripeTax,
      emailFrom: s.emailFrom,
    },
    owner: { expenseCategories: s.expenseCategories, githubRepo: s.githubRepo, vercelProject: s.vercelProject, links: s.customLinks },
    products: products.map((p) => ({
      slug: p.slug,
      name: p.name,
      price: dollars(p.price) ?? 0,
      wasPrice: dollars(p.compareAtPrice ?? null),
      summary: p.summary,
      description: p.description,
      category: p.category,
      stock: p.stock,
      madeToOrder: p.madeToOrder,
      featured: p.featured,
      visible: p.active,
      choice: p.option ? { label: p.option.label, options: p.option.values } : null,
      engraving: p.personalize ? { ...p.personalize } : null,
      sizes: p.sizes?.length ? p.sizes.map((x) => ({ name: x.name, price: dollars(x.price) ?? 0, ...(x.blank ? { blank: x.blank } : {}) })) : null,
      ...(p.blank ? { blank: p.blank } : {}),
      designs: p.designs
        ? {
            label: p.designs.label,
            required: p.designs.required,
            bySize: p.designs.fit,
            ...(p.designs.allowUpload ? { customerUpload: true, customerUploadPrice: dollars(p.designs.uploadExtra ?? 0) ?? 0 } : {}),
          }
        : null,
      preview: p.preview
        ? {
            ...(p.preview.mockup ? { mockup: { photo: p.preview.mockup.image, x: p.preview.mockup.x, y: p.preview.mockup.y, width: p.preview.mockup.w, height: p.preview.mockup.h } } : {}),
            ...(p.preview.shape ? { shape3d: p.preview.shape, color3d: p.preview.color ?? "#2b2f36" } : {}),
            ...(p.preview.model ? { scan3d: p.preview.model } : {}),
            ...(p.preview.spin?.length ? { spin360: p.preview.spin } : {}),
          }
        : null,
      ...(p.images.length ? { photos: p.images } : {}),
    })),
  };
}

const HEADER = `/*
 *  EDIT-POINT: SITE-VARIABLES
 *  Every word, price, product and setting on the shop, in one file.
 *  The dashboard keeps this file up to date: when something is changed on the
 *  phone, it's saved here too, so GitHub always matches the live site.
 *
 *  Day to day, change things in the dashboard; nothing here needs touching.
 *  This file is the backup copy, with history on GitHub, and is used when the
 *  shop is set up somewhere new.
 *
 *  IF YOU EDIT IT BY HAND ON GITHUB
 *  Click the pencil, change only the values you mean to, and "Commit changes".
 *  The site updates by itself in about a minute. If there's a mistake, Vercel
 *  won't publish it and the current site stays up; open the commit and click
 *  "Revert". Rules:
 *  - Keep every key, every comment, the import line and the "satisfies
 *    SiteVariables" line at the end.
 *  - Text goes in "double quotes". Use \\n\\n inside text for a new paragraph.
 *  - Prices are plain numbers in dollars: 35 or 35.5 (no $ sign, no quotes).
 *  - Each product needs a unique "slug": lowercase words joined by dashes.
 *    The slug becomes the item's web address.
 *  - Removing a product removes it from the shop; visible: false hides it.
 *  - theme must be one of:
 *      logo match: "dube-family"
 *      military: "olive-drab", "ocp-field", "dress-blues", "black-gold", "desert-camo", "woodland-camo"
 *      police: "military-police", "thin-blue-line", "night-patrol"
 *      USA & support our troops: "old-glory", "americana", "yellow-ribbon"
 *      workshop & crafts: "burnt-birch", "maple-walnut", "etched-slate", "brass-leather"
 *      plain: "clean-dispatch"
 *  - layout must be one of: "garrison", "field-manual", "showroom", "quartermaster",
 *    "workshop", "tribute".
 *  - Photos: never invent links. Use photos the owner uploaded to the
 *    public/images folder on GitHub, written as "/images/file-name.jpg",
 *    or links that are already in this file.
 *  - Policy text can use {business}, {email} and {state}; they're filled in
 *    automatically. These are plain starting points, not legal advice.
 *
 *  HOW THIS FILE AND THE DASHBOARD WORK TOGETHER
 *  When this file changes on GitHub, only the values that changed here are
 *  applied to the live site. Orders, expenses, customers, messages and
 *  reviews live in the dashboard, not here.
 */

import type { SiteVariables } from "./lib/site-variables-type";
`;

const q = (v: unknown): string =>
  Array.isArray(v) && v.every((x) => typeof x !== "object") ? `[${v.map((x) => JSON.stringify(x)).join(", ")}]` : JSON.stringify(v);
// an object written like the rest of the file: { key: "value", list: ["a", "b"] }
const lit = (v: unknown): string =>
  v && typeof v === "object" && !Array.isArray(v)
    ? `{ ${Object.entries(v as Record<string, unknown>).map(([k, x]) => `${/^[a-z_$][\w$]*$/i.test(k) ? k : JSON.stringify(k)}: ${lit(x)}`).join(", ")} }`
    : q(v);
const field = (key: string, v: unknown, note?: string) => `${key}: ${q(v)},${note ? ` // ${note}` : ""}`;

/** The complete text of site-variables.ts. */
export function variablesFile(v: SiteVariables): string {
  const L: string[] = [];
  const sec = (title: string, notes: string[] = []) => {
    if (L.length > 1) L.push("");
    L.push(`  // ${title}`, ...notes.map((n) => `  // ${n}`));
  };
  const obj = (name: string, rows: string[]) => {
    L.push(`  ${name}: {`, ...rows.map((r) => `    ${r}`), "  },");
  };

  L.push("export const SITE_VARIABLES = {");
  sec("Brand");
  obj("brand", [
    field("businessName", v.brand.businessName, "header, footer, browser tab"),
    field("tagline", v.brand.tagline, "search results and the Field Manual sidebar"),
    field("announcement", v.brand.announcement, 'thin banner on top of every page; "" hides it'),
  ]);
  sec("Home page");
  obj("homePage", [
    field("headline", v.homePage.headline, "big headline; best under 8 words"),
    field("intro", v.homePage.intro),
    field("shopButton", v.homePage.shopButton, "main button under the headline"),
    field("customButton", v.homePage.customButton, "second button (Workshop layout), goes to the contact page"),
    field("featuredHeading", v.homePage.featuredHeading, "above items marked featured: true"),
    field("categoriesHeading", v.homePage.categoriesHeading, "above the category tiles"),
    field("aboutButton", v.homePage.aboutButton, "button under the short about section"),
    field("allItemsHeading", v.homePage.allItemsHeading, "heading on the Shop page"),
    field("stepsHeading", v.homePage.stepsHeading, "heading above the steps (Workshop layout)"),
    "customSteps: [ // the custom order steps, in order (Workshop layout)",
    ...v.homePage.customSteps.map((s) => `  { title: ${q(s.title)}, text: ${q(s.text)}${s.hidden ? ", hidden: true" : ""} },`),
    "],",
  ]);
  sec("Reviews", ["Customers send reviews (with a photo) from the site. They show only after you approve them in the dashboard."]);
  obj("reviews", [
    field("show", v.reviews.show, "the reviews section on the home page"),
    field("heading", v.reviews.heading),
    field("text", v.reviews.text, "next to the Leave a review button"),
  ]);
  sec("Custom orders", ["The custom order request form (/custom-order). Requests land in the dashboard under Requests."]);
  obj("customOrders", [
    field("show", v.customOrders.show, "the form and its menu link"),
    field("heading", v.customOrders.heading),
    field("intro", v.customOrders.intro),
    field("notice", v.customOrders.notice, "shown in a box at the top of the form"),
    field("types", v.customOrders.types, "choices for \"What would you like?\""),
  ]);
  sec("About page");
  obj("about", [
    field("heading", v.about.heading),
    field("story", v.about.story, "the first paragraph also shows on the home page"),
    field("serviceLine", v.about.serviceLine, 'e.g. "U.S. Army Military Police, 2004-2012"'),
    field("showVeteranBadge", v.about.showVeteranBadge, "the star badge with the service line"),
  ]);
  sec("Contact page");
  obj("contact", [
    field("heading", v.contact.heading),
    field("text", v.contact.text),
    field("email", v.contact.email, 'public email; "" hides it'),
    field("phone", v.contact.phone, 'public phone; "" hides it'),
    field("location", v.contact.location, 'e.g. "Lawton, OK"'),
    field("showContactForm", v.contact.showContactForm, "message form; messages land in the dashboard Inbox"),
  ]);
  sec("Newsletter");
  obj("newsletter", [field("show", v.newsletter.show, "email sign-up box in the footer"), field("text", v.newsletter.text)]);
  sec("Social", ['Full web addresses starting with https://   "" hides that button.']);
  obj("social", [field("facebook", v.social.facebook), field("instagram", v.social.instagram), field("tiktok", v.social.tiktok), field("youtube", v.social.youtube), field("x", v.social.x), field("etsy", v.social.etsy)]);
  sec("Policies", ["Each one is its own page, linked in the footer. Starting points, not legal advice.", "{business}, {email} and {state} are filled in automatically."]);
  obj("policies", [
    field("shipping", v.policies.shipping, "/policies/shipping"),
    field("returns", v.policies.returns, "/policies/returns"),
    field("customOrders", v.policies.customOrders, "/policies/custom-orders"),
    field("privacy", v.policies.privacy, "/policies/privacy"),
    field("terms", v.policies.terms, "/policies/terms"),
    field("disclaimer", v.policies.disclaimer, "/policies/disclaimer"),
    field("state", v.policies.state, 'whose laws apply in the terms, e.g. "Oklahoma"'),
  ]);
  sec("Extra pages", ["Any other page you want: FAQ, events, care instructions...", "slug is the web address (/pages/slug). inFooter: true adds a footer link."]);
  L.push("  extraPages: [", ...v.extraPages.map((p) => `    { slug: ${q(p.slug)}, title: ${q(p.title)}, inFooter: ${q(p.inFooter)}, body: ${q(p.body)} },`), "  ],");
  sec("Pages & menu", [
    "Every page of the shop, in menu order. page is shop, gallery, custom, about, contact, status, review,",
    "page:<slug> for a page from extraPages, or link:<name> with a link for an outside address.",
    "inMenu: top menu.  inFooter: footer.  on: false switches the page off (shows \"not found\").",
  ]);
  L.push(
    "  menu: [",
    ...v.menu.map((m) => `    { page: ${q(m.page)}, label: ${q(m.label)}, ${m.link ? `link: ${q(m.link)}, ` : ""}inMenu: ${m.inMenu}, inFooter: ${m.inFooter}, on: ${m.on} },`),
    "  ],"
  );
  sec("Links", ["Links with a picture in the footer and on the contact page. icon is one of: facebook, instagram, tiktok, youtube, x,", "pinterest, etsy, google, whatsapp, linkedin, threads, snapchat, amazon, phone, text, email, website, map, reviews, link.", "label: leave \"\" to use the usual name. For phone, text and email, url is just the number or address."]);
  L.push("  links: [", ...(v.links ?? []).map((l) => `    { icon: ${q(l.icon)}, label: ${q(l.label)}, url: ${q(l.url)}${l.hidden ? ", hidden: true" : ""} },`), "  ],");
  sec("Hidden text", ["Names of text kept in this file but not shown on the shop (the eye button in Dashboard > Words & logos)."]);
  L.push(`  ${field("hiddenText", v.hiddenText ?? [])}`);
  sec("Shop categories", ["In the order they show in the shop. Each product's category should match one of these."]);
  L.push(`  ${field("categories", v.categories)}`);
  if (v.chat) {
    sec("Chat", ["The 'Ask us' chat on the shop. It answers from these questions and answers (and the shop's own info).", "topic: the group it's filed under in the dashboard. alsoAsked: other ways customers word the same question. hidden: true keeps an answer but stops the chat using it."]);
    const ai = v.chat.ai ?? { provider: "anthropic", model: "", baseUrl: "" };
    L.push(
      "  chat: {",
      `    ${field("on", v.chat.on, "show the chat button on the shop")}`,
      `    ${field("useAI", v.chat.useAI, "let an AI write the replies when a key is saved; false = the shop's own answers only")}`,
      `    ${field("live", v.chat.live !== false, "offer live chat with a person while someone is signed in to the dashboard and available")}`,
      `    ai: { provider: ${q(ai.provider)}, model: ${q(ai.model)}, baseUrl: ${q(ai.baseUrl)} }, // provider: anthropic, openai, gemini, groq, openrouter, ollama, ollama-own, custom ("" = its usual model / address)`,
      `    ${field("title", v.chat.title)}`,
      `    ${field("greeting", v.chat.greeting)}`,
      "    questions: [",
      ...v.chat.questions.map((x) => `      { id: ${q(x.id)}, ${x.topic ? `topic: ${q(x.topic)}, ` : ""}question: ${q(x.question)}, answer: ${q(x.answer)}${x.alsoAsked?.length ? `, alsoAsked: [${x.alsoAsked.map(q).join(", ")}]` : ""}${x.hidden ? ", hidden: true" : ""} },`),
      "    ],",
      "  },"
    );
  }
  if (v.discounts) {
    const d = v.discounts;
    sec("Discounts", ["Promo codes themselves are made in Dashboard > Discounts (they live in Stripe). These are the programs."]);
    L.push(
      "  discounts: {",
      `    thankYouCode: { on: ${d.thankYouCode.on}, percentOff: ${d.thankYouCode.percentOff}, validDays: ${d.thankYouCode.validDays} }, // a code for their next order after each purchase`,
      "    military: {",
      `      ${field("on", d.military.on, "the Military & first responder page")}`,
      `      ${field("percentOff", d.military.percentOff)}`,
      `      ${field("checkFirst", d.military.checkFirst, "true: they ask and you approve each one; false: everyone sees the code below")}`,
      `      ${field("code", d.military.code, "the shared code when checkFirst is false")}`,
      `      ${field("heading", d.military.heading)}`,
      `      ${field("text", d.military.text, "{percent} is filled in")}`,
      "    },",
      "    bulk: [ // the more items in one order, the bigger the discount",
      ...d.bulk.map((t) => `      { fromItems: ${t.fromItems}, percentOff: ${t.percentOff} },`),
      "    ],",
      "    giftCards: {",
      `      ${field("on", d.giftCards.on, "the Gift cards page")}`,
      `      ${field("amounts", d.giftCards.amounts, "dollars")}`,
      `      ${field("heading", d.giftCards.heading)}`,
      `      ${field("text", d.giftCards.text)}`,
      "    },",
      ...(d.checkoutReminders
        ? [`    checkoutReminders: { on: ${d.checkoutReminders.on}, afterHours: ${d.checkoutReminders.afterHours} }, // email people who left checkout without paying (1 to 24 hours later)`]
        : []),
      "  },"
    );
  }
  if (v.watermark) {
    sec("Watermark", ["A stamp on shop photos so they can't be reused without credit. The original photos are never changed."]);
    obj("watermark", [
      field("on", v.watermark.on, "true stamps shop photos; false shows them clean"),
      field("text", v.watermark.text, '"" uses the business name'),
      field("withLogo", v.watermark.withLogo, "add the logo next to the text"),
      field("position", v.watermark.position, '"corner" | "center" (one big diagonal) | "tiled" (diagonal all over)'),
      field("opacity", v.watermark.opacity, "5 (faint) to 90 (strong)"),
      field("size", v.watermark.size, "10 to 60, how big the stamp is"),
      field("onOurWork", v.watermark.onOurWork, "Our work photos too"),
      field("onDesigns", v.watermark.onDesigns, "design library artwork too"),
    ]);
  }
  sec("Design library", [
    "Decals and engraving artwork customers pick from. Which designs fit which item and size is set on each",
    "product (designs.bySize). id: short unique name.  group: e.g. \"Military\", \"Patriotic\", \"Family\".",
    "extraPrice: added to the item's price in dollars (0 for none).  show: false hides it everywhere.",
    "note (optional): private laser settings or file name, shown on orders; customers never see it.",
  ]);
  L.push(
    "  designs: [",
    ...v.designs.map((d) => `    { id: ${q(d.id)}, name: ${q(d.name)}, group: ${q(d.group)}, extraPrice: ${d.extraPrice}, show: ${d.show}, image: ${q(d.image)}${d.note ? `, note: ${q(d.note)}` : ""} },`),
    "  ],"
  );
  sec("Our work (gallery)", [
    "Finished pieces to show off, for sale or not. featured: true puts it in the rotating showcase on the home page.",
    "productSlug: the slug of a shop item to buy one like it, or \"\" for an \"Order one like this\" button instead.",
  ]);
  L.push(
    "  gallery: {",
    `    ${field("heading", v.gallery.heading)}`,
    `    ${field("text", v.gallery.text)}`,
    "    items: [",
    ...v.gallery.items.flatMap((g) => [
      "      {",
      `        ${field("slug", g.slug)}`,
      `        ${field("title", g.title)}`,
      `        ${field("category", g.category)}`,
      `        ${field("description", g.description)}`,
      `        ${field("photos", g.photos)}`,
      `        ${field("featured", g.featured)}`,
      `        ${field("productSlug", g.productSlug)}`,
      ...(g.hidden ? [`        ${field("hidden", true, "kept, but not shown on the shop")}`] : []),
      "      },",
    ]),
    "    ],",
    "  },"
  );
  sec("Footer");
  obj("footer", [field("note", v.footer.note, "small print after the copyright line")]);
  sec("Images", ['Upload in the dashboard (Words & logos), or to public/images on GitHub and write "/images/name.png".']);
  obj("images", [
    field("logo", v.images.logo, "header and footer"),
    field("patch", v.images.patch, 'round emblem on the home page; uses the logo if ""'),
    field("tabIcon", v.images.tabIcon, "browser tab icon, square"),
    field("welcomePhoto", v.images.welcomePhoto, "big photo for the showroom and workshop layouts"),
    field("aboutPhoto", v.images.aboutPhoto),
  ]);
  sec("Look");
  obj("look", [field("theme", v.look.theme, "see the list at the top of this file"), field("layout", v.look.layout, "garrison | field-manual | showroom | quartermaster | workshop | tribute")]);
  sec("Store");
  obj("store", [
    field("open", v.store.open, "false pauses ordering; the shop stays visible"),
    field("closedMessage", v.store.closedMessage),
    field("askForShippingAddress", v.store.askForShippingAddress, "false for pickup-only items (no shipping charged)"),
    field("shipFromZip", v.store.shipFromZip, "your ZIP code; shipping distance is measured from here"),
    "shippingByDistance: [ // nearest first: up to this many miles costs this many dollars",
    ...v.store.shippingByDistance.map((t) => `  { upToMiles: ${t.upToMiles}, price: ${t.price} },`),
    "],",
    field("shippingPrice", v.store.shippingPrice, "farther than the last tier, or if the distance can't be worked out"),
    field("internationalShipping", v.store.internationalShipping, "outside the US, in dollars"),
    field("localPickup", v.store.localPickup, "let customers choose free local pickup"),
    field("pickupNote", v.store.pickupNote, "shown when they choose pickup"),
    field("giftNotes", v.store.giftNotes, "optional gift message box at checkout"),
    field("freeShippingOver", v.store.freeShippingOver, "orders this big ship free; 0 = never"),
    field("shipToCountries", v.store.shipToCountries, "two-letter country codes"),
    field("lowStockAlert", v.store.lowStockAlert, "phone alert when an item gets down to this many"),
    field("allowPromoCodes", v.store.allowPromoCodes, "coupon codes made in Stripe"),
    field("salesTaxByStripe", v.store.salesTaxByStripe, "turn on Stripe Tax first (Stripe > Settings > Tax)"),
    field("emailFrom", v.store.emailFrom, "sender for tracking emails; needs a Resend key"),
  ]);
  sec("Owner (not shown on the site)");
  obj("owner", [
    field("expenseCategories", v.owner.expenseCategories),
    field("githubRepo", v.owner.githubRepo, 'e.g. "owner/repo"; found by itself on Vercel'),
    field("vercelProject", v.owner.vercelProject),
    "links: [ // shortcuts on the Settings page",
    ...v.owner.links.map((l) => `  { label: ${q(l.label)}, url: ${q(l.url)} },`),
    "],",
  ]);
  sec("Products", [
    "One { ... } block per item. Copy a block to add an item.",
    "  slug         unique web name, lowercase-with-dashes",
    "  price        dollars;  wasPrice: a higher \"was\" price to show a sale, or null",
    "  summary      one line on the shop page;  description: full text on the item's page",
    "  stock        how many you have; null = unlimited",
    "  visible      false hides it without deleting it",
    "  choice       one pick-list for customers, or null",
    "  engraving    a text box for the customer (name, date, unit...), or null",
    "  sizes        sizes with their own price, e.g. [{ name: \"30 oz\", price: 40 }], or null",
    "  designs      which designs from the design library fit each size, or null:",
    "               { label: \"Design\", required: true, bySize: { \"30 oz\": [\"flag\", \"eagle\"] } }",
    "               (with no sizes, use \"*\" as the size name)",
    "  preview      extra ways to see the item, or null: mockup (a photo with a box, in % of the photo,",
    "               where the chosen design is shown), shape3d (tumbler | mug | sign | round | square | card)",
    "               with color3d, scan3d (a .glb 3D scan file), spin360 (photos taken all the way around)",
    "  photos       leave out to keep photos added in the dashboard",
  ]);
  L.push("  products: [");
  for (const p of v.products) {
    L.push(
      "    {",
      `      ${field("slug", p.slug)}`,
      `      ${field("name", p.name)}`,
      `      ${field("price", p.price)}`,
      `      ${field("wasPrice", p.wasPrice ?? null)}`,
      `      ${field("summary", p.summary)}`,
      `      ${field("description", p.description)}`,
      `      ${field("category", p.category)}`,
      `      ${field("stock", p.stock)}`,
      `      ${field("madeToOrder", p.madeToOrder ?? false)}`,
      `      ${field("featured", p.featured ?? false)}`,
      `      ${field("visible", p.visible ?? true)}`,
      `      choice: ${p.choice ? `{ label: ${q(p.choice.label)}, options: ${q(p.choice.options)} }` : "null"},`,
      `      engraving: ${p.engraving ? `{ label: ${q(p.engraving.label)}, maxLength: ${p.engraving.maxLength}, required: ${p.engraving.required} }` : "null"},`,
      `      sizes: ${p.sizes?.length ? `[${p.sizes.map((x) => `{ name: ${q(x.name)}, price: ${x.price}${x.blank ? `, blank: ${q(x.blank)}` : ""} }`).join(", ")}]` : "null"},`,
      ...(p.blank ? [`      ${field("blank", p.blank, "the blank one of these uses up (Dashboard > Blanks)")}`] : []),
      ...(p.designs
        ? [
            `      designs: {`,
            `        label: ${q(p.designs.label)},`,
            `        required: ${p.designs.required},`,
            ...(p.designs.customerUpload ? [`        customerUpload: true, // customers can upload their own logo or artwork`, `        customerUploadPrice: ${p.designs.customerUploadPrice ?? 0},`] : []),
            `        bySize: {`,
            ...Object.entries(p.designs.bySize).map(([k, ids]) => `          ${q(k)}: ${q(ids)},`),
            `        },`,
            `      },`,
          ]
        : ["      designs: null,"]),
      `      preview: ${p.preview ? lit(p.preview) : "null"},`,
      ...(p.photos ? [`      ${field("photos", p.photos)}`] : []),
      "    },"
    );
  }
  L.push("  ],", "} satisfies SiteVariables;", "");
  return HEADER + "\n" + L.join("\n");
}
