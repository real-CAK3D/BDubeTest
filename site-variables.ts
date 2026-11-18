/*
 *  EDIT-POINT: SITE-VARIABLES
 *  Every word, price, product and setting on the shop, in one file.
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
 *
 *  If something goes wrong, nothing breaks: Vercel won't publish a file with a
 *  mistake in it, and the current site stays up. Open the commit on GitHub and
 *  click "Revert", or ask ChatGPT to fix the error message Vercel emails you.
 *
 *  RULES FOR CHATGPT (read these before editing this file)
 *  - Return the COMPLETE file every time, from the first line to the last.
 *  - Only change the values the owner asked about. Keep every key, every
 *    comment, the import line and the "satisfies SiteVariables" line at the end.
 *  - Text goes in "double quotes". Use \n\n inside text for a new paragraph.
 *    Write apostrophes as ' and avoid curly quotes.
 *  - Prices are plain numbers in dollars: 35 or 35.5 (no $ sign, no quotes).
 *  - Each product needs a unique "slug": lowercase words joined by dashes,
 *    e.g. "walnut-pen". The slug becomes the item's web address. Don't change
 *    the slug of an existing item unless asked.
 *  - Removing a product from the list removes it from the shop. To hide it but
 *    keep it, set visible: false.
 *  - theme must be one of:
 *      military: "olive-drab", "ocp-field", "dress-blues", "black-gold", "desert-camo", "woodland-camo"
 *      police: "military-police", "thin-blue-line", "night-patrol"
 *      USA & support our troops: "old-glory", "americana", "yellow-ribbon"
 *      workshop & crafts: "burnt-birch", "maple-walnut", "etched-slate", "brass-leather"
 *      plain: "clean-dispatch"
 *  - layout must be one of: "garrison", "field-manual", "showroom", "quartermaster",
 *    "workshop", "tribute".
 *  - Photos: never invent links. Use photos the owner uploaded to the
 *    public/images folder on GitHub, written as "/images/file-name.jpg",
 *    or leave photos out and he adds them in the dashboard.
 *  - If a request can't be done in this file, say so and name the closest
 *    "EDIT-POINT" from CUSTOMIZE.md instead of guessing.
 *
 *  HOW THIS FILE AND THE DASHBOARD WORK TOGETHER
 *  The dashboard can change most of these too. When this file changes, only the
 *  values that changed here are applied. Everything else keeps what was set in
 *  the dashboard. Whichever was changed most recently wins.
 *  Orders, expenses and customers live in the dashboard, not here.
 */

import type { SiteVariables } from "./lib/site-variables-type";

export const SITE_VARIABLES = {
  // Brand
  brand: {
    businessName: "Your Business Name", // header, footer, browser tab
    tagline: "Handcrafted, laser-engraved gifts from a veteran's workshop.", // search results and the Field Manual sidebar
    announcement: "Veteran owned and operated. Custom engraving on most items.", // thin banner on top of every page; "" hides it
  },

  // Home page
  homePage: {
    headline: "Handcrafted. Engraved. Built to last.", // big headline; best under 8 words
    intro:
      "Engraved keepsakes, shadow boxes and gifts, cut and finished by hand by a U.S. Army Military Police veteran. Most pieces can carry a name, a date or a unit. Just tell us what to engrave.",
    featuredHeading: "Featured", // above items marked featured: true
    allItemsHeading: "Shop", // heading on the Shop page (the page with every item)
  },

  // About
  about: {
    heading: "About the maker",
    story:
      "Tell your story here. Where you served, what you make, and why you make it.\n\nCustomers love knowing who is behind the work. A few short paragraphs is plenty.",
    serviceLine: "U.S. Army Military Police veteran", // e.g. "U.S. Army Military Police, 2004-2012"
    showVeteranBadge: true, // the star badge with the service line
  },

  // Contact
  contact: {
    heading: "Get in touch",
    text: "Custom orders, questions or a status check on your order.",
    email: "", // public email; "" hides it
    phone: "", // public phone; "" hides it
    location: "", // e.g. "Fort Leonard Wood, MO"
    showContactForm: true, // a message form customers can fill in; messages land in the dashboard Inbox
  },

  // Newsletter
  newsletter: {
    show: true, // email sign-up box in the footer; the list is under Customers in the dashboard
    text: "New items and restocks, a few times a year. No spam.",
  },

  // Social
  // Full web addresses starting with https://   "" hides that button.
  social: {
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    x: "",
    etsy: "",
  },

  // Policies
  policies: {
    shipping:
      "Orders ship within 3-5 business days. Made-to-order items may take a little longer; you'll get an email when yours ships.",
    returns: "If something isn't right, reach out within 30 days and we'll make it right.",
    // Shown at /policies/privacy and /policies/terms, linked in the footer. These are plain starting
    // points, not legal advice. {business} and {email} are filled in automatically.
    privacy:
      "{business} collects only what's needed to fill your order: your name, email, phone number and shipping address. Payments are handled by Stripe; we never see or store your card number.\n\nWe use your details to ship your order and contact you about it. If you sign up for updates, we email you about new items, and you can ask to be removed at any time.\n\nWe don't sell or share your information, except with the services that make the shop work (Stripe for payments, our web host, and shipping carriers).\n\nThe site uses one small cookie to count daily visitors. It contains no personal information.\n\nTo see, change or delete your information, email {email}.",
    terms:
      "By ordering from {business} you agree to these terms.\n\nPrices are in US dollars and can change at any time. Your order is confirmed when payment goes through, and you'll get a receipt by email.\n\nHandmade items vary a little from piece to piece, and that's part of their character. Photos are as accurate as we can make them.\n\nShipping times are estimates. Once a package is with the carrier, delivery is up to them, but we'll help sort out any problem.\n\nSee our shipping and returns policies for the rest. Questions: {email}.",
  },

  // Images
  // Upload images to the public/images folder on GitHub and write "/images/name.png",
  // or upload them in the dashboard (Words & logos). "" uses the built-in badge / no photo.
  images: {
    logo: "", // header and footer; a PNG with a transparent background works best
    patch: "", // round emblem on the home page; uses the logo if ""
    tabIcon: "", // browser tab icon, square
    welcomePhoto: "", // big wide photo for the "showroom" layout
    aboutPhoto: "", // photo of the owner or workshop
  },

  // Look
  look: {
    theme: "military-police", // see the list at the top of this file
    layout: "garrison", // garrison | field-manual | showroom | quartermaster | workshop | tribute
  },

  // Store
  store: {
    open: true, // false pauses ordering; the shop stays visible
    closedMessage: "The shop is on leave for a few days. Orders reopen soon.",
    askForShippingAddress: true, // false for pickup-only / digital items (no shipping charged)
    shippingPrice: 8, // flat shipping per order, in dollars
    freeShippingOver: 75, // orders this big ship free; 0 = never free
    shipToCountries: ["US", "CA"], // two-letter country codes
    lowStockAlert: 2, // phone alert when an item gets down to this many
    allowPromoCodes: true, // lets customers type a coupon code made in Stripe (Product catalog > Coupons)
    salesTaxByStripe: false, // true adds sales tax at checkout; turn on Stripe Tax first (Stripe > Settings > Tax)
    emailFrom: "", // sender for tracking emails, e.g. "Your Shop <orders@yourshop.com>"; needs a Resend key and verified domain
  },

  // ---------------------------------------------------- OWNER (not public)
  owner: {
    expenseCategories: ["Materials", "Tools", "Shipping supplies", "Postage", "Fees", "Marketing", "Software", "Other"],
    githubRepo: "", // e.g. "owner/repo"; adds a shortcut on the Settings page
    vercelProject: "", // e.g. "my-team/my-shop"
    links: [
      // shortcuts on the owner's Settings page
      // { label: "Shipping labels", url: "https://www.pirateship.com" },
    ],
  },

  // Products
  // One { ... } block per item. Copy a block to add an item.
  //   slug         unique web name, lowercase-with-dashes
  //   price        dollars;  wasPrice: a higher "was" price to show a sale, or null
  //   summary      one line on the shop page;  description: full text on the item's page
  //   category     items with the same category are grouped together
  //   stock        how many you have; null = unlimited
  //   madeToOrder  shows "Made to order"     featured: shows in the Featured row
  //   visible      false hides it without deleting it
  //   choice       one pick-list for customers, or null
  //   engraving    a text box for the customer (name, date, unit...), or null
  //                maxLength = most characters, required = must be filled in
  //   photos       leave out to keep photos added in the dashboard
  products: [
    {
      slug: "engraved-walnut-cutting-board",
      name: "Engraved Walnut Cutting Board",
      price: 55,
      wasPrice: null,
      summary: "Solid walnut board, laser engraved with your name or message.",
      description:
        "Edge-grain walnut, sanded smooth and finished with food-safe oil. The engraving goes on the face so it can hang on the wall or go to work in the kitchen.\n\nA good wedding, housewarming or retirement gift. This is a sample item. Change or delete it.",
      category: "Laser engraved",
      stock: null,
      madeToOrder: true,
      featured: true,
      visible: true,
      choice: { label: "Size", options: ["11 x 8 in", "15 x 10 in"] },
      engraving: { label: "Name or message to engrave", maxLength: 40, required: false },
    },
    {
      slug: "challenge-coin-display",
      name: "Challenge Coin Display",
      price: 65,
      wasPrice: null,
      summary: "Hardwood rack for 24 coins, with your unit or name engraved on the top rail.",
      description:
        "Solid hardwood with routed slots for 24 standard coins, finished with three coats of oil. Leave the engraving box empty for a plain rail.\n\nThis is a sample item.",
      category: "Woodwork",
      stock: 5,
      madeToOrder: false,
      featured: true,
      visible: true,
      choice: { label: "Wood", options: ["Walnut", "Oak", "Cherry"] },
      engraving: { label: "Unit, rank or name for the top rail", maxLength: 30, required: false },
    },
    {
      slug: "memorial-flag-case",
      name: "Memorial Flag Case",
      price: 120,
      wasPrice: 140,
      summary: "Glass-front case for a 5' x 9.5' burial flag, with an engraved plate.",
      description: "Hand-cut mitered frame with a glass front. The plate is laser engraved with the name, rank and dates you give us.\n\nThis is a sample item.",
      category: "Tributes",
      stock: null,
      madeToOrder: true,
      featured: true,
      visible: true,
      choice: null,
      engraving: { label: "Name, rank and service dates", maxLength: 80, required: true },
    },
    {
      slug: "slate-coaster-set",
      name: "Engraved Slate Coaster Set",
      price: 32,
      wasPrice: null,
      summary: "Four natural slate coasters with a flag, star or family name.",
      description: "Natural slate with felt feet. Choose a design, and add a family name if you like.\n\nThis is a sample item.",
      category: "Laser engraved",
      stock: 12,
      madeToOrder: false,
      featured: false,
      visible: true,
      choice: { label: "Design", options: ["American flag", "Thin blue line", "Army star", "Family name only"] },
      engraving: { label: "Family name (optional)", maxLength: 20, required: false },
    },
    {
      slug: "dog-tag-ornament",
      name: "Dog Tag Ornament",
      price: 16,
      wasPrice: null,
      summary: "Engraved dog tag ornament on a ball chain. Made for each order.",
      description: "Stainless dog tag, engraved with the name and year you choose. Comes on a ball chain with a ribbon for hanging.\n\nThis is a sample item.",
      category: "Gifts",
      stock: null,
      madeToOrder: true,
      featured: false,
      visible: true,
      choice: null,
      engraving: { label: "Name and year", maxLength: 24, required: true },
    },
    {
      slug: "leather-keychain",
      name: "Leather Keychain",
      price: 18,
      wasPrice: null,
      summary: "Stitched leather fob with a solid brass ring and your initials.",
      description: "Veg-tan leather, saddle stitched, edges burnished. Initials are laser engraved.\n\nThis is a sample item.",
      category: "Leather",
      stock: 20,
      madeToOrder: false,
      featured: false,
      visible: true,
      choice: { label: "Color", options: ["Natural", "Brown", "Black"] },
      engraving: { label: "Initials", maxLength: 4, required: false },
    },
  ],
} satisfies SiteVariables;
