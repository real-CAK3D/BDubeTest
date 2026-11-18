export type ProductOption = { label: string; values: string[] };
// Lets the customer type text for the item, e.g. a name to engrave.
export type Personalize = { label: string; maxLength: number; required: boolean };
// A size (or style) of an item with its own price, e.g. "30 oz" at $80.
export type ProductSize = { name: string; price: number }; // cents
// Which designs from the design library fit this item. "fit" is keyed by size
// name ("*" when the item has no sizes) and lists design ids, so each size can
// offer a different set (a 40 oz tumbler might fit 2 designs, a 16 oz 10).
export type ProductDesigns = { label: string; required: boolean; fit: Record<string, string[]> };
// One decal / engraving artwork in the design library.
export type Design = { id: string; name: string; image: string; group: string; extra: number; active: boolean };
// One entry in the shop's page list (top menu and footer).
export type MenuItem = { id: string; label: string; href?: string; top: boolean; footer: boolean; off?: boolean };
// How the owner's dashboard looks and what it shows.
export type AdminPrefs = {
  title: string; // name in the dashboard's top bar ("" = business name)
  accent: string; // main color, e.g. "#2f5d3a"
  mode: "auto" | "light" | "dark";
  density: "comfy" | "compact";
  textSize: "normal" | "large";
  startPage: string; // where the dashboard opens after login
  nav: { href: string; hidden: boolean }[]; // menu order
  tabs: string[]; // up to 4 hrefs for the phone's bottom bar
  widgets: { id: string; hidden: boolean }[]; // dashboard home sections, in order
  quickLinks: { label: string; url: string }[]; // buttons on the dashboard home
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number; // in cents
  compareAtPrice?: number | null; // cents, shows a "was" price
  summary: string; // one or two lines for cards
  description: string; // full details, paragraphs separated by blank lines
  category: string;
  images: string[];
  stock: number | null; // null = unlimited / made to order
  madeToOrder: boolean;
  featured: boolean;
  active: boolean; // visible to customers
  option?: ProductOption | null;
  personalize?: Personalize | null;
  sizes?: ProductSize[] | null; // price then comes from the chosen size
  designs?: ProductDesigns | null;
  // Set when the item comes from Stripe (Stripe > Product catalog)
  stripeProductId?: string;
  stripeStockSeen?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  option?: string;
  custom?: string; // engraving / personalization text
  quantity: number;
  unitAmount: number; // cents
};

export type OrderStatus = "paid" | "shipped" | "delivered" | "refunded" | "cancelled";

export type Order = {
  id: string; // Stripe checkout session id
  number: number;
  createdAt: string;
  email: string;
  name: string;
  phone?: string;
  shippingAddress?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount?: number;
  tax?: number;
  promoCode?: string;
  trackingNumber?: string;
  carrier?: string;
  shippedEmailAt?: string;
  total: number;
  currency: string;
  paymentMethod?: string;
  status: OrderStatus;
  delivery?: "ship" | "pickup";
  giftNote?: string;
  shipNote?: string; // e.g. shipping ZIP differs from the one quoted
  note?: string;
};

export type Expense = {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: string;
  amount: number; // cents
};

export type AppNotification = {
  id: string;
  createdAt: string;
  title: string;
  body: string;
  url?: string;
  read: boolean;
};

export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
  etsy?: string;
};

export type CustomLink = { label: string; url: string };
export type Step = { title: string; text: string };
export type ShippingTier = { upToMiles: number; price: number }; // price in cents
// A finished piece shown in "Our work". Not necessarily for sale.
export type GalleryItem = {
  slug: string;
  title: string;
  category: string;
  description: string;
  photos: string[];
  featured: boolean; // in the rotating showcase on the home page
  productSlug: string; // optional: shop item to buy one like it
};
// Extra pages the owner adds himself (FAQ, Events...), shown at /pages/<slug>
export type InfoPage = { slug: string; title: string; body: string; inFooter: boolean };

export type SiteSettings = {
  // Brand
  businessName: string;
  tagline: string;
  logo: string; // main logo image url ("" = built-in emblem)
  emblem: string; // secondary badge / patch image
  favicon: string;
  heroImage: string;
  aboutImage: string;
  // Words
  announcement: string;
  heroHeadline: string;
  heroText: string;
  featuredHeading: string;
  allItemsHeading: string;
  shopButton: string;
  customButton: string;
  categoriesHeading: string;
  aboutButton: string;
  stepsHeading: string;
  customSteps: Step[];
  showReviews: boolean;
  reviewsHeading: string;
  reviewsText: string;
  footerNote: string;
  showCustomOrders: boolean;
  customOrderHeading: string;
  customOrderIntro: string;
  customOrderNotice: string;
  customOrderTypes: string[];
  galleryHeading: string;
  galleryText: string;
  gallery: GalleryItem[];
  contactHeading: string;
  contactText: string;
  aboutTitle: string;
  about: string;
  serviceLine: string; // e.g. "U.S. Army Military Police, 2004–2012"
  showVeteranBadge: boolean;
  shippingPolicy: string;
  returnPolicy: string;
  privacyPolicy: string;
  termsOfService: string;
  disclaimer: string;
  customOrderPolicy: string;
  legalState: string; // which state's laws apply in the terms, e.g. "Oklahoma"
  extraPages: InfoPage[];
  menu: MenuItem[]; // order and visibility of pages in the menu and footer
  categories: string[]; // shop categories, in display order
  designs: Design[]; // design library for decals / engravings
  showContactForm: boolean;
  showNewsletter: boolean;
  newsletterText: string;
  // Contact
  contactEmail: string;
  contactPhone: string;
  location: string;
  social: SocialLinks;
  // Look
  theme: string;
  layout: string;
  // Store
  currency: string;
  shippingFlat: number; // cents
  freeShippingOver: number; // cents, 0 = never
  collectShipping: boolean;
  storeOpen: boolean;
  closedMessage: string;
  lowStockAlert: number;
  shipCountries: string[];
  shipFromZip: string; // distance is measured from here
  shippingTiers: ShippingTier[]; // nearest first; anything farther uses shippingFlat
  intlShipping: number; // cents, outside the US
  localPickup: boolean;
  pickupNote: string;
  giftNotes: boolean;
  allowPromoCodes: boolean;
  stripeTax: boolean;
  emailFrom: string; // sender for customer emails, e.g. "My Shop <orders@myshop.com>"
  // Owner tools
  githubRepo: string;
  vercelProject: string;
  customLinks: CustomLink[];
  admin: AdminPrefs; // dashboard look and layout (not in site-variables.ts)
  expenseCategories: string[];
};

export type Message = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
};

export type Subscriber = { email: string; createdAt: string };

export type RequestStatus = "new" | "quoted" | "accepted" | "declined" | "done";
export type CustomRequest = {
  id: string;
  number: number;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  kind: string; // tumbler, sign...
  quantity: number;
  details: string;
  engraving: string;
  neededBy: string; // YYYY-MM-DD or ""
  budget: string;
  zip: string;
  photos: string[];
  status: RequestStatus;
  note: string; // private
};

export type ReviewStatus = "pending" | "approved" | "hidden";
export type Review = {
  id: string;
  createdAt: string;
  name: string;
  location: string;
  rating: number; // 1-5
  text: string;
  item: string; // what they bought, in their words (optional)
  photo: string; // image URL or ""
  status: ReviewStatus;
  featured: boolean; // pinned to the home page
};
