import type { SiteVariables } from "./site-variables-type";
import type { Product, SiteSettings } from "./types";

/*
 * EDIT-POINT: VARIABLES-FILE
 * Writes site-variables.ts from the shop's current settings and products.
 * Used when dashboard edits are copied to GitHub, so the file on GitHub
 * always matches the live site. The comments below are what appear in that file.
 */

const dollars = (c: number | null | undefined) => (c == null ? null : Math.round(c) / 100);

export function settingsToVariables(s: SiteSettings, products: Product[]): SiteVariables {
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
 *  HOW TO CHANGE THE SITE WITH CHATGPT
 *  1. On GitHub, open this file and click the "Copy raw file" button.
 *  2. Paste it into ChatGPT and say what you want, for example:
 *       "Add a walnut pen for $35, 10 in stock, in Woodwork. Write the descriptions."
 *       "Rewrite my about story. I was an MP from 2006 to 2014."
 *       "Put everything in Leather on sale for 15% off."
 *       "Switch to the Dress Blues theme."
 *  3. Copy the whole file ChatGPT gives back.
 *  4. On GitHub, click the pencil (Edit), select everything, paste, then click
 *     "Commit changes". The site updates by itself in about a minute.
 *     Wait for that before changing things in the dashboard, or the dashboard
 *     will save over your edit.
 *
 *  If something goes wrong, nothing breaks: Vercel won't publish a file with a
 *  mistake in it, and the current site stays up. Open the commit on GitHub and
 *  click "Revert", or ask ChatGPT to fix the error message Vercel emails you.
 *
 *  RULES FOR CHATGPT (read these before editing this file)
 *  - Return the COMPLETE file every time, from the first line to the last.
 *  - Only change the values the owner asked about. Keep every key, every
 *    comment, the import line and the "satisfies SiteVariables" line at the end.
 *  - Text goes in "double quotes". Use \\n\\n inside text for a new paragraph.
 *    Write apostrophes as ' and avoid curly quotes.
 *  - Prices are plain numbers in dollars: 35 or 35.5 (no $ sign, no quotes).
 *  - Each product needs a unique "slug": lowercase words joined by dashes,
 *    e.g. "walnut-pen". The slug becomes the item's web address. Don't change
 *    the slug of an existing item unless asked.
 *  - Removing a product from the list removes it from the shop. To hide it but
 *    keep it, set visible: false.
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
 *  - If a request can't be done in this file, say so and name the closest
 *    "EDIT-POINT" from CUSTOMIZE.md instead of guessing.
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
    ...v.homePage.customSteps.map((s) => `  { title: ${q(s.title)}, text: ${q(s.text)} },`),
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
    field("githubRepo", v.owner.githubRepo, 'e.g. "owner/repo"'),
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
      ...(p.photos ? [`      ${field("photos", p.photos)}`] : []),
      "    },"
    );
  }
  L.push("  ],", "} satisfies SiteVariables;", "");
  return HEADER + "\n" + L.join("\n");
}
