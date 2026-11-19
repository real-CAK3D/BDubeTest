/*
 * The shape of site-variables.ts. If an edit to that file doesn't match this
 * shape (a typo, a missing comma, a theme name that doesn't exist), Vercel's
 * build fails and the current live site stays up untouched.
 */

export type ThemeId =
  | "dube-family"
  | "military-police"
  | "olive-drab"
  | "ocp-field"
  | "dress-blues"
  | "night-patrol"
  | "old-glory"
  | "brass-leather"
  | "clean-dispatch"
  | "thin-blue-line"
  | "black-gold"
  | "desert-camo"
  | "woodland-camo"
  | "yellow-ribbon"
  | "americana"
  | "burnt-birch"
  | "etched-slate"
  | "maple-walnut";

export type LayoutId = "garrison" | "field-manual" | "showroom" | "quartermaster" | "workshop" | "tribute";

export type VariableProduct = {
  slug: string;
  name: string;
  price: number;
  wasPrice?: number | null;
  summary: string;
  description: string;
  category: string;
  stock: number | null;
  madeToOrder?: boolean;
  featured?: boolean;
  visible?: boolean;
  choice?: { label: string; options: string[] } | null;
  engraving?: { label: string; maxLength: number; required: boolean } | null;
  sizes?: { name: string; price: number; blank?: string }[] | null;
  blank?: string;
  designs?: { label: string; required: boolean; bySize: Record<string, string[]>; customerUpload?: boolean; customerUploadPrice?: number } | null;
  preview?: {
    mockup?: { photo: string; x: number; y: number; width: number; height: number } | null;
    shape3d?: "tumbler" | "mug" | "sign" | "round" | "square" | "card" | null;
    color3d?: string;
    scan3d?: string;
    spin360?: string[];
  } | null;
  photos?: string[];
};

export type SiteVariables = {
  brand: { businessName: string; tagline: string; announcement: string };
  homePage: {
    headline: string;
    intro: string;
    shopButton: string;
    customButton: string;
    featuredHeading: string;
    categoriesHeading: string;
    aboutButton: string;
    allItemsHeading: string;
    stepsHeading: string;
    customSteps: { title: string; text: string; hidden?: boolean }[];
  };
  reviews: { show: boolean; heading: string; text: string };
  customOrders: { show: boolean; heading: string; intro: string; notice: string; types: string[] };
  about: { heading: string; story: string; serviceLine: string; showVeteranBadge: boolean };
  contact: { heading: string; text: string; email: string; phone: string; location: string; showContactForm: boolean };
  newsletter: { show: boolean; text: string };
  social: { facebook: string; instagram: string; tiktok: string; youtube: string; x: string; etsy: string };
  policies: {
    shipping: string;
    returns: string;
    customOrders: string;
    privacy: string;
    terms: string;
    disclaimer: string;
    state: string;
  };
  extraPages: { slug: string; title: string; body: string; inFooter: boolean }[];
  menu: { page: string; label: string; link?: string; inMenu: boolean; inFooter: boolean; on: boolean }[];
  categories: string[];
  hiddenText?: string[];
  links?: { icon: string; label: string; url: string; hidden?: boolean }[];
  upcoming?: { on: boolean; heading: string; intro: string; items: { id: string; title: string; text: string; image?: string; when?: string; stage: "idea" | "working" | "soon"; hidden?: boolean }[] };
  chat?: { on: boolean; useAI: boolean; live?: boolean; ai?: { provider: string; model: string; baseUrl: string }; title: string; greeting: string; questions: { id: string; topic?: string; question: string; answer: string; alsoAsked?: string[]; hidden?: boolean }[] };
  discounts?: {
    thankYouCode: { on: boolean; percentOff: number; validDays: number };
    military: { on: boolean; percentOff: number; checkFirst: boolean; code: string; heading: string; text: string };
    bulk: { fromItems: number; percentOff: number }[];
    giftCards: { on: boolean; amounts: number[]; heading: string; text: string };
    checkoutReminders?: { on: boolean; afterHours: number };
  };
  watermark?: { on: boolean; text: string; withLogo: boolean; position: "corner" | "center" | "tiled"; opacity: number; size: number; onOurWork: boolean; onDesigns: boolean };
  designs: { id: string; name: string; image: string; group: string; extraPrice: number; show: boolean; note?: string }[];
  footer: { note: string };
  gallery: {
    heading: string;
    text: string;
    items: { slug: string; title: string; category: string; description: string; photos: string[]; featured: boolean; productSlug: string; hidden?: boolean }[];
  };
  images: { logo: string; patch: string; tabIcon: string; welcomePhoto: string; aboutPhoto: string };
  look: { theme: ThemeId; layout: LayoutId };
  store: {
    open: boolean;
    closedMessage: string;
    askForShippingAddress: boolean;
    shippingPrice: number;
    freeShippingOver: number;
    shipToCountries: string[];
    shipFromZip: string;
    shippingByDistance: { upToMiles: number; price: number }[];
    internationalShipping: number;
    localPickup: boolean;
    pickupNote: string;
    giftNotes: boolean;
    lowStockAlert: number;
    allowPromoCodes: boolean;
    salesTaxByStripe: boolean;
    emailFrom: string;
  };
  owner: {
    expenseCategories: string[];
    githubRepo: string;
    vercelProject: string;
    links: { label: string; url: string }[];
  };
  products: VariableProduct[];
};
