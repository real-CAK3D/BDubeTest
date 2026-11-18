import type { SiteVariables } from "./site-variables-type";
import type { Product, SiteSettings } from "./types";

const cents = (d: number | null | undefined) => (d == null ? null : Math.max(0, Math.round(d * 100)));

export function variablesToSettings(v: SiteVariables): SiteSettings {
  return {
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
    customSteps: v.homePage.customSteps.map((s) => ({ title: s.title, text: s.text })),
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

export type FileProduct = Pick<Product, "slug" | "name" | "price" | "compareAtPrice" | "summary" | "description" | "category" | "stock" | "madeToOrder" | "featured" | "active" | "option" | "personalize"> & { images?: string[] };

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
    };
    if (p.photos) fp.images = p.photos;
    out.push(fp);
  }
  return out;
}
