import type { SiteVariables } from "./site-variables-type";
import { DEFAULT_CHAT } from "./chat-defaults";
import { DEFAULT_DISCOUNTS } from "./discount-defaults";
import { DEFAULT_WATERMARK } from "./watermark";
import type { Product, SiteSettings } from "./types";

const cents = (d: number | null | undefined) => (d == null ? null : Math.max(0, Math.round(d * 100)));

export type FileSettings = Omit<SiteSettings, "admin" | "shipFrom" | "parcels">;

const idOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);

export function variablesToSettings(v: SiteVariables): FileSettings {
  return {
    menu: (v.menu ?? []).map((m) => ({ id: m.page, label: m.label, ...(m.link ? { href: m.link } : {}), top: m.inMenu, footer: m.inFooter, ...(m.on === false ? { off: true } : {}) })),
    categories: [...(v.categories ?? [])],
    chat: v.chat
      ? { on: v.chat.on, useAI: v.chat.useAI, title: v.chat.title, greeting: v.chat.greeting, faqs: v.chat.questions.map((f) => ({ id: f.id, q: f.question, a: f.answer, hidden: Boolean(f.hidden) })) }
      : structuredClone(DEFAULT_CHAT),
    discounts: v.discounts
      ? {
          thankYou: { on: v.discounts.thankYouCode.on, percent: v.discounts.thankYouCode.percentOff, days: v.discounts.thankYouCode.validDays },
          veteran: { on: v.discounts.military.on, percent: v.discounts.military.percentOff, verify: v.discounts.military.checkFirst, code: v.discounts.military.code, heading: v.discounts.military.heading, text: v.discounts.military.text },
          bulk: v.discounts.bulk.map((t) => ({ minQty: t.fromItems, percent: t.percentOff })),
          giftCards: { on: v.discounts.giftCards.on, amounts: [...v.discounts.giftCards.amounts], heading: v.discounts.giftCards.heading, text: v.discounts.giftCards.text },
          reminders: v.discounts.checkoutReminders ? { on: v.discounts.checkoutReminders.on, hours: v.discounts.checkoutReminders.afterHours } : { ...DEFAULT_DISCOUNTS.reminders },
        }
      : structuredClone(DEFAULT_DISCOUNTS),
    watermark: v.watermark
      ? {
          on: v.watermark.on,
          text: v.watermark.text,
          useLogo: v.watermark.withLogo,
          position: v.watermark.position,
          opacity: Math.min(90, Math.max(5, v.watermark.opacity)),
          size: Math.min(60, Math.max(10, v.watermark.size)),
          onGallery: v.watermark.onOurWork,
          onDesigns: v.watermark.onDesigns,
        }
      : { ...DEFAULT_WATERMARK },
    designs: (v.designs ?? []).map((d) => ({ id: idOf(d.id || d.name), name: d.name, image: d.image, group: d.group, extra: cents(d.extraPrice) ?? 0, active: d.show, ...(d.note ? { note: d.note } : {}) })),
    businessName: v.brand.businessName,
    tagline: v.brand.tagline,
    announcement: v.brand.announcement,
    heroHeadline: v.homePage.headline,
    heroText: v.homePage.intro,
    featuredHeading: v.homePage.featuredHeading,
    allItemsHeading: v.homePage.allItemsHeading,
    shopButton: v.homePage.shopButton,
    customButton: v.homePage.customButton,
    categoriesHeading: v.homePage.categoriesHeading,
    aboutButton: v.homePage.aboutButton,
    stepsHeading: v.homePage.stepsHeading,
    customSteps: v.homePage.customSteps.map((s) => ({ title: s.title, text: s.text, ...(s.hidden ? { hidden: true } : {}) })),
    hiddenFields: [...(v.hiddenText ?? [])],
    links: v.links
      ? v.links.map((l, i) => ({ id: `l${i + 1}`, icon: l.icon, label: l.label, url: l.url, ...(l.hidden ? { hidden: true } : {}) }))
      : (Object.entries(v.social) as [string, string][]).filter(([, u]) => u).map(([k, u], i) => ({ id: `l${i + 1}`, icon: k, label: "", url: u })),
    showCustomOrders: v.customOrders.show,
    customOrderHeading: v.customOrders.heading,
    customOrderIntro: v.customOrders.intro,
    customOrderNotice: v.customOrders.notice,
    customOrderTypes: [...v.customOrders.types],
    shipFromZip: v.store.shipFromZip,
    shippingTiers: v.store.shippingByDistance.map((t) => ({ upToMiles: t.upToMiles, price: cents(t.price) ?? 0 })),
    intlShipping: cents(v.store.internationalShipping) ?? 0,
    localPickup: v.store.localPickup,
    pickupNote: v.store.pickupNote,
    giftNotes: v.store.giftNotes,
    showReviews: v.reviews.show,
    reviewsHeading: v.reviews.heading,
    reviewsText: v.reviews.text,
    footerNote: v.footer.note,
    galleryHeading: v.gallery.heading,
    galleryText: v.gallery.text,
    gallery: v.gallery.items.map((g) => ({ ...g, photos: [...g.photos] })),
    disclaimer: v.policies.disclaimer,
    customOrderPolicy: v.policies.customOrders,
    legalState: v.policies.state,
    extraPages: v.extraPages.map((p) => ({ slug: p.slug, title: p.title, body: p.body, inFooter: p.inFooter })),
    aboutTitle: v.about.heading,
    about: v.about.story,
    serviceLine: v.about.serviceLine,
    showVeteranBadge: v.about.showVeteranBadge,
    contactHeading: v.contact.heading,
    contactText: v.contact.text,
    contactEmail: v.contact.email,
    contactPhone: v.contact.phone,
    location: v.contact.location,
    showContactForm: v.contact.showContactForm,
    showNewsletter: v.newsletter.show,
    newsletterText: v.newsletter.text,
    privacyPolicy: v.policies.privacy,
    termsOfService: v.policies.terms,
    allowPromoCodes: v.store.allowPromoCodes,
    stripeTax: v.store.salesTaxByStripe,
    emailFrom: v.store.emailFrom,
    social: { ...v.social },
    shippingPolicy: v.policies.shipping,
    returnPolicy: v.policies.returns,
    logo: v.images.logo,
    emblem: v.images.patch,
    favicon: v.images.tabIcon,
    heroImage: v.images.welcomePhoto,
    aboutImage: v.images.aboutPhoto,
    theme: v.look.theme,
    layout: v.look.layout,
    currency: "usd",
    storeOpen: v.store.open,
    closedMessage: v.store.closedMessage,
    collectShipping: v.store.askForShippingAddress,
    shippingFlat: cents(v.store.shippingPrice) ?? 0,
    freeShippingOver: cents(v.store.freeShippingOver) ?? 0,
    shipCountries: v.store.shipToCountries.map((c) => c.trim().toUpperCase()).filter((c) => /^[A-Z]{2}$/.test(c)),
    lowStockAlert: v.store.lowStockAlert,
    expenseCategories: v.owner.expenseCategories,
    githubRepo: v.owner.githubRepo,
    vercelProject: v.owner.vercelProject,
    customLinks: v.owner.links.map((l) => ({ label: l.label, url: l.url })),
  };
}

export type FileProduct = Pick<Product, "slug" | "name" | "price" | "compareAtPrice" | "summary" | "description" | "category" | "stock" | "madeToOrder" | "featured" | "active" | "option" | "personalize" | "sizes" | "designs" | "preview" | "blank"> & { images?: string[] };

// duplicate slugs: first one wins
export function variablesToProducts(v: SiteVariables): FileProduct[] {
  const seen = new Set<string>();
  const out: FileProduct[] = [];
  for (const p of v.products) {
    const slug = p.slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug || seen.has(slug)) {
      console.warn(`site-variables.ts: skipped product "${p.name}" (missing or duplicate slug "${p.slug}")`);
      continue;
    }
    seen.add(slug);
    const fp: FileProduct = {
      slug,
      name: p.name,
      price: cents(p.price) ?? 0,
      compareAtPrice: cents(p.wasPrice ?? null),
      summary: p.summary,
      description: p.description,
      category: p.category,
      stock: p.stock,
      madeToOrder: p.madeToOrder ?? false,
      featured: p.featured ?? false,
      active: p.visible ?? true,
      option: p.choice && p.choice.label && p.choice.options.length ? { label: p.choice.label, values: p.choice.options } : null,
      personalize: p.engraving ? { label: p.engraving.label, maxLength: p.engraving.maxLength, required: p.engraving.required } : null,
      sizes: p.sizes?.length ? p.sizes.map((x) => ({ name: x.name, price: cents(x.price) ?? 0, ...(x.blank ? { blank: x.blank } : {}) })) : null,
      ...(p.blank ? { blank: p.blank } : {}),
      designs: p.designs
        ? {
            label: p.designs.label,
            required: p.designs.required,
            fit: Object.fromEntries(Object.entries(p.designs.bySize).map(([k, ids]) => [k, ids.map(idOf)])),
            ...(p.designs.customerUpload ? { allowUpload: true, uploadExtra: cents(p.designs.customerUploadPrice ?? 0) ?? 0 } : {}),
          }
        : null,
    };
    fp.preview = p.preview
      ? {
          ...(p.preview.mockup ? { mockup: { image: p.preview.mockup.photo, x: p.preview.mockup.x, y: p.preview.mockup.y, w: p.preview.mockup.width, h: p.preview.mockup.height } } : {}),
          ...(p.preview.shape3d ? { shape: p.preview.shape3d, color: p.preview.color3d ?? "#2b2f36" } : {}),
          ...(p.preview.scan3d ? { model: p.preview.scan3d } : {}),
          ...(p.preview.spin360?.length ? { spin: p.preview.spin360 } : {}),
        }
      : null;
    if (p.photos) fp.images = p.photos;
    out.push(fp);
  }
  return out;
}
