/*
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
 *  - Text goes in "double quotes". Use \n\n inside text for a new paragraph.
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

export const SITE_VARIABLES = {
  // Brand
  brand: {
    businessName: "Dube Family Creations", // header, footer, browser tab
    tagline: "Made with care, created with purpose.", // search results and the Field Manual sidebar
    announcement: "Veteran owned and family made. Custom orders welcome.", // thin banner on top of every page; "" hides it
  },

  // Home page
  homePage: {
    headline: "Let's create something unique.", // big headline; best under 8 words
    intro: "Custom laser-engraved tumblers, campsite and family name signs, personalized gifts and handmade crafts from a veteran-owned family workshop. Tell us your idea and we'll turn it into something special.",
    shopButton: "Shop the collection", // main button under the headline
    customButton: "Request a custom order", // second button (Workshop layout), goes to the contact page
    featuredHeading: "Featured", // above items marked featured: true
    categoriesHeading: "Shop by category", // above the category tiles
    aboutButton: "Read our story", // button under the short about section
    allItemsHeading: "Shop", // heading on the Shop page
    stepsHeading: "How custom orders work", // heading above the steps (Workshop layout)
    customSteps: [ // the custom order steps, in order (Workshop layout)
      { title: "Pick a piece", text: "Choose something from the shop, or describe what you have in mind." },
      { title: "Make it yours", text: "Add a name, date, unit or message. Engraving text goes in right on the item page." },
      { title: "Made by hand", text: "Cut, engraved and finished in our workshop, one at a time." },
      { title: "Shipped to you", text: "Packed with care. You'll get tracking as soon as it's on its way." },
    ],
  },

  // Reviews
  // Customers send reviews (with a photo) from the site. They show only after you approve them in the dashboard.
  reviews: {
    show: true, // the reviews section on the home page
    heading: "What customers say",
    text: "Bought something from us? We'd love to see it in its new home and hear what you think.", // next to the Leave a review button
  },

  // Custom orders
  // The custom order request form (/custom-order). Requests land in the dashboard under Requests.
  customOrders: {
    show: true, // the form and its menu link
    heading: "Request a custom order",
    intro: "Tell us what you have in mind and we'll get back to you with a price and a timeline, usually within a couple of days. Nothing is charged until you approve the quote.",
    notice: "Please note: because of sizing and the setup some designs need, we can only take on some custom requests. If we have to decline, please don't be discouraged. It usually means the piece would need too many changes to our equipment, not that it isn't a great idea. Larger orders may be easier for us to make work, so ask!", // shown in a box at the top of the form
    types: ["Tumbler", "Sign", "Leather", "Slate", "Something else"], // choices for "What would you like?"
  },

  // About page
  about: {
    heading: "About the Dube family",
    story: "", // the first paragraph also shows on the home page
    serviceLine: "U.S. Army Military Police veteran", // e.g. "U.S. Army Military Police, 2004-2012"
    showVeteranBadge: true, // the star badge with the service line
  },

  // Contact page
  contact: {
    heading: "Get in touch",
    text: "Custom orders, questions or a status check on your order.",
    email: "", // public email; "" hides it
    phone: "", // public phone; "" hides it
    location: "", // e.g. "Lawton, OK"
    showContactForm: true, // message form; messages land in the dashboard Inbox
  },

  // Newsletter
  newsletter: {
    show: true, // email sign-up box in the footer
    text: "New items and restocks, a few times a year. No spam.",
  },

  // Social
  // Full web addresses starting with https://   "" hides that button.
  social: {
    facebook: "https://www.facebook.com/groups/2154317351855824/",
    instagram: "",
    tiktok: "",
    youtube: "",
    x: "",
    etsy: "",
  },

  // Policies
  // Each one is its own page, linked in the footer. Starting points, not legal advice.
  // {business}, {email} and {state} are filled in automatically.
  policies: {
    shipping: "Ready-made items ship within 3-5 business days. Custom and engraved pieces are made to order and usually ship within 1-2 weeks; we'll tell you if yours will take longer.\n\nYou'll get an email with tracking as soon as your order ships. Shipping costs are shown at checkout before you pay.\n\nIf a package is lost or arrives damaged, contact us at {email} within 7 days of delivery and we'll make it right.", // /policies/shipping
    returns: "Ready-made items can be returned within 30 days of delivery if they're unused and in their original condition. Contact us at {email} first and we'll explain how to send it back. Once it arrives we refund the item price to your original payment method.\n\nCustom, personalized and engraved items are made just for you, so they can't be returned or exchanged unless they arrive damaged or we made a mistake. If that happens, send us a photo within 7 days of delivery and we'll fix or replace it at no cost.\n\nReturn shipping is paid by the customer unless the item arrived damaged or wrong.", // /policies/returns
    customOrders: "Engraving text is used exactly as you type it at checkout, including spelling, capitals and punctuation. Please double-check names, ranks and dates before you order.\n\nOnce we start cutting or engraving, an order can't be changed or cancelled. If you notice a mistake, email {email} right away and we'll do our best to catch it in time.\n\nWood, leather and slate are natural materials. Grain, color and texture vary from piece to piece, so your item may look a little different from the photos. That's part of what makes it one of a kind.\n\nWe may decline engraving requests that include offensive content or logos and trademarks we don't have permission to use. Official military and police insignia are engraved for personal, non-commercial use only.", // /policies/custom-orders
    privacy: "{business} collects only what's needed to fill your order: your name, email, phone number and shipping address. Payments are handled by Stripe; we never see or store your card number.\n\nWe use your details to make and ship your order and to contact you about it. If you sign up for updates, we email you about new items, and you can ask to be removed at any time.\n\nIf you leave a review, the name, location, words and photo you submit may be shown on our site. Leave out anything you don't want public.\n\nWe don't sell or share your information, except with the services that make the shop work (Stripe for payments, our web host and database, and shipping carriers).\n\nThe site uses one small cookie to count daily visitors. It contains no personal information.\n\nTo see, change or delete your information, email {email}.", // /policies/privacy
    terms: "By using this site or ordering from {business} you agree to these terms.\n\nPrices are in US dollars and can change at any time. Your order is confirmed when payment goes through, and you'll get a receipt by email. We may cancel and refund an order if an item turns out to be unavailable or was listed at the wrong price.\n\nHandmade items vary a little from piece to piece. See our custom orders, shipping and returns pages for the details on personalized items, delivery and returns.\n\nWhen you send us a review or photo, you confirm it's yours to share and allow us to show it on our site and social pages. We may edit reviews for length or remove ones that are off-topic or inappropriate.\n\nAll text, photos, designs and logos on this site belong to {business} and can't be copied or used without permission.\n\nThese terms are governed by the laws of {state}. Questions: {email}.", // /policies/terms
    disclaimer: "{business} is a small, independent, family-run business. We are not affiliated with, endorsed by or sponsored by the U.S. Army, the Department of Defense, any branch of the military, or any law enforcement agency. Mentions of military service describe the owner's own background.\n\nProduct photos are examples. Because every piece is made by hand, colors, wood grain and engraving placement may differ slightly.\n\nOur products are decorative and keepsake items. Cutting boards and other kitchen items are finished with food-safe oil, but follow the care instructions included with your order.\n\nInformation on this site is provided as-is, and we do our best to keep it accurate and up to date.", // /policies/disclaimer
    state: "", // whose laws apply in the terms, e.g. "Oklahoma"
  },

  // Extra pages
  // Any other page you want: FAQ, events, care instructions...
  // slug is the web address (/pages/slug). inFooter: true adds a footer link.
  extraPages: [
    { slug: "faq", title: "FAQ", inFooter: true, body: "How long does a custom order take?\nMost engraved pieces ship within 1-2 weeks. If you need something by a certain date, contact us before ordering.\n\nCan you engrave a logo or a photo?\nOften, yes. Send us the image through the contact page and we'll let you know how it will turn out.\n\nDo you take bulk or unit orders?\nYes. Unit coins displays, retirement gifts and team orders are some of our favorite projects. Contact us with the quantity and what you have in mind.\n\nHow do I care for my item?\nKeep wood away from soaking water and direct heat. Wipe cutting boards clean and re-oil them now and then." },
  ],

  // Our work (gallery)
  // Finished pieces to show off, for sale or not. featured: true puts it in the rotating showcase on the home page.
  // productSlug: the slug of a shop item to buy one like it, or "" for an "Order one like this" button instead.
  gallery: {
    heading: "Our work",
    text: "Pieces we've made for customers and for fun. See something you like? We can make one for you.",
    items: [
      {
        slug: "stanley-aurora-tumblers",
        title: "Stanley Aurora Tumblers",
        category: "Tumblers",
        description: "Northern lights over mountains and a lake, engraved through the iridescent finish so every angle catches a different color. Made on 30 oz and 40 oz Stanleys, and the design can go on other Stanley styles too.",
        photos: ["/images/work/aurora-1.webp", "/images/work/aurora-2.webp", "/images/work/aurora-3.webp"],
        featured: true,
        productSlug: "stanley-aurora-tumbler-40oz",
      },
      {
        slug: "marine-veteran-tumbler",
        title: "Marine Veteran Tumbler",
        category: "Tumblers",
        description: "Personalized for a Marine veteran with his name and years served: a gold eagle, globe and anchor, a waving flag and dog tags, all engraved in brushed gold.",
        photos: ["/images/work/marine-1.webp", "/images/work/marine-2.webp", "/images/work/marine-3.webp"],
        featured: true,
        productSlug: "",
      },
      {
        slug: "sea-turtle-tumbler",
        title: "Sea Turtle Tumbler",
        category: "Tumblers",
        description: "Sea turtles swimming through bubbles and coral, wrapped all the way around the tumbler.",
        photos: ["/images/work/turtle-1.webp", "/images/work/turtle-2.webp", "/images/work/turtle-3.webp"],
        featured: true,
        productSlug: "",
      },
      {
        slug: "hibiscus-tumbler",
        title: "Hibiscus Tumbler",
        category: "Tumblers",
        description: "Hibiscus flowers and leaves engraved around a red Stanley.",
        photos: ["/images/work/hibiscus-1.webp", "/images/work/hibiscus-2.webp", "/images/work/hibiscus-3.webp"],
        featured: true,
        productSlug: "",
      },
      {
        slug: "campsite-signs",
        title: "Campsite & Family Name Signs",
        category: "Signs",
        description: "Made for two customers who wanted something special to stand out at their home and their campsite. Your name with a scene that fits you: lake and loons, mountains, campfire, camper. Signs come unfinished or stained and sealed.",
        photos: ["/images/work/sign-dube.webp", "/images/work/sign-jensen.webp"],
        featured: true,
        productSlug: "",
      },
      {
        slug: "leather-card-holder",
        title: "Engraved Leather Card Holder",
        category: "Leather",
        description: "Our first try at engraving leather, with our own logo, and it came out sharp. Personalized leather accessories make great gifts and everyday pieces.",
        photos: ["/images/work/card-holder.webp"],
        featured: true,
        productSlug: "",
      },
      {
        slug: "slate-coaster",
        title: "Engraved Slate Coaster",
        category: "Slate",
        description: "Testing laser engraving on slate. The contrast against the dark stone gives designs a sharp, clean look. Custom slate coasters, family names and patriotic artwork are coming.",
        photos: ["/images/work/slate-coaster.webp"],
        featured: true,
        productSlug: "",
      },
    ],
  },

  // Footer
  footer: {
    note: "Secure checkout by Stripe. Apple Pay and Google Pay accepted.", // small print after the copyright line
  },

  // Images
  // Upload in the dashboard (Words & logos), or to public/images on GitHub and write "/images/name.png".
  images: {
    logo: "/images/logo.webp", // header and footer
    patch: "", // round emblem on the home page; uses the logo if ""
    tabIcon: "/images/favicon.png", // browser tab icon, square
    welcomePhoto: "", // big photo for the showroom and workshop layouts
    aboutPhoto: "",
  },

  // Look
  look: {
    theme: "dube-family", // see the list at the top of this file
    layout: "workshop", // garrison | field-manual | showroom | quartermaster | workshop | tribute
  },

  // Store
  store: {
    open: true, // false pauses ordering; the shop stays visible
    closedMessage: "The shop is on leave for a few days. Orders reopen soon.",
    askForShippingAddress: true, // false for pickup-only items (no shipping charged)
    shipFromZip: "", // your ZIP code; shipping distance is measured from here
    shippingByDistance: [ // nearest first: up to this many miles costs this many dollars
      { upToMiles: 50, price: 6 },
      { upToMiles: 250, price: 9 },
      { upToMiles: 1000, price: 12 },
    ],
    shippingPrice: 15, // farther than the last tier, or if the distance can't be worked out
    internationalShipping: 30, // outside the US, in dollars
    localPickup: true, // let customers choose free local pickup
    pickupNote: "We'll message you to set up a pickup time once your order is ready.", // shown when they choose pickup
    giftNotes: true, // optional gift message box at checkout
    freeShippingOver: 75, // orders this big ship free; 0 = never
    shipToCountries: ["US", "CA"], // two-letter country codes
    lowStockAlert: 2, // phone alert when an item gets down to this many
    allowPromoCodes: true, // coupon codes made in Stripe
    salesTaxByStripe: false, // turn on Stripe Tax first (Stripe > Settings > Tax)
    emailFrom: "", // sender for tracking emails; needs a Resend key
  },

  // Owner (not shown on the site)
  owner: {
    expenseCategories: ["Materials", "Tools", "Shipping supplies", "Postage", "Fees", "Marketing", "Software", "Other"],
    githubRepo: "real-CAK3D/BDubeTest", // e.g. "owner/repo"
    vercelProject: "cak3ds-projects/bdtest",
    links: [ // shortcuts on the Settings page
    ],
  },

  // Products
  // One { ... } block per item. Copy a block to add an item.
  //   slug         unique web name, lowercase-with-dashes
  //   price        dollars;  wasPrice: a higher "was" price to show a sale, or null
  //   summary      one line on the shop page;  description: full text on the item's page
  //   stock        how many you have; null = unlimited
  //   visible      false hides it without deleting it
  //   choice       one pick-list for customers, or null
  //   engraving    a text box for the customer (name, date, unit...), or null
  //   photos       leave out to keep photos added in the dashboard
  products: [
    {
      slug: "stanley-aurora-tumbler-40oz",
      name: "Stanley Aurora Tumbler, 40 oz",
      price: 90,
      wasPrice: null,
      summary: "Northern lights engraved through an iridescent 40 oz Stanley.",
      description: "Northern lights over mountains and a lake, engraved through the iridescent finish so every angle catches a different color.\n\nThese Stanleys are discontinued, so stock is limited. The design can also be made on a different style of Stanley; contact us to ask.",
      category: "Tumblers",
      stock: 2,
      madeToOrder: false,
      featured: true,
      visible: true,
      choice: null,
      engraving: null,
      photos: ["/images/work/aurora-1.webp", "/images/work/aurora-2.webp", "/images/work/aurora-3.webp"],
    },
    {
      slug: "stanley-aurora-tumbler-30oz",
      name: "Stanley Aurora Tumbler, 30 oz",
      price: 80,
      wasPrice: null,
      summary: "The same aurora design on a 30 oz Stanley with a straw lid.",
      description: "Northern lights over mountains and a lake, engraved through the iridescent finish.\n\nThese Stanleys are discontinued, so stock is limited. The design can also be made on a different style of Stanley; contact us to ask.",
      category: "Tumblers",
      stock: 1,
      madeToOrder: false,
      featured: true,
      visible: true,
      choice: null,
      engraving: null,
      photos: ["/images/work/aurora-3.webp", "/images/work/aurora-1.webp"],
    },
    {
      slug: "stanley-aurora-tumbler-flawed",
      name: "Aurora Tumbler (flawed, as is)",
      price: 20,
      wasPrice: 90,
      summary: "A band around the taper burned through the color. Sold as is.",
      description: "This one didn't come out perfect: a band around the taper was burned through the color. Everything else about it is fine, and it's sold as is at a big discount.",
      category: "Tumblers",
      stock: 0,
      madeToOrder: false,
      featured: false,
      visible: false,
      choice: null,
      engraving: null,
      photos: ["/images/work/aurora-flawed-1.webp", "/images/work/aurora-flawed-2.webp", "/images/work/aurora-flawed-3.webp"],
    },
    {
      slug: "custom-campsite-sign",
      name: "Custom Campsite or Family Name Sign",
      price: 0,
      wasPrice: null,
      summary: "Your name and a scene that fits you, engraved in wood.",
      description: "Pick the name and tell us the scene: lake and loons, mountains, campfire, camper, or your own idea. Made to order.",
      category: "Signs",
      stock: null,
      madeToOrder: true,
      featured: false,
      visible: false,
      choice: { label: "Finish", options: ["Unfinished", "Stained and sealed"] },
      engraving: { label: "Name and the scene you'd like", maxLength: 120, required: true },
      photos: ["/images/work/sign-dube.webp", "/images/work/sign-jensen.webp"],
    },
    {
      slug: "custom-engraved-tumbler",
      name: "Custom Engraved Tumbler",
      price: 0,
      wasPrice: null,
      summary: "Your design, name or service details engraved on a Stanley.",
      description: "Tell us the design and the text. Great for veterans, birthdays and gifts. Made to order.",
      category: "Tumblers",
      stock: null,
      madeToOrder: true,
      featured: false,
      visible: false,
      choice: null,
      engraving: { label: "Name, years served or design idea", maxLength: 120, required: true },
      photos: ["/images/work/marine-3.webp", "/images/work/turtle-1.webp"],
    },
    {
      slug: "engraved-leather-card-holder",
      name: "Engraved Leather Card Holder",
      price: 0,
      wasPrice: null,
      summary: "Leather card holder with your initials, name or logo.",
      description: "A slim leather card holder, laser engraved with the text or logo you choose.",
      category: "Leather",
      stock: null,
      madeToOrder: true,
      featured: false,
      visible: false,
      choice: null,
      engraving: { label: "Initials, name or logo idea", maxLength: 40, required: false },
      photos: ["/images/work/card-holder.webp"],
    },
    {
      slug: "engraved-slate-coaster",
      name: "Engraved Slate Coaster",
      price: 0,
      wasPrice: null,
      summary: "Natural slate with a family name or patriotic design.",
      description: "Laser engraved natural slate. The design comes out bright against the dark stone.",
      category: "Slate",
      stock: null,
      madeToOrder: true,
      featured: false,
      visible: false,
      choice: null,
      engraving: { label: "Family name or design idea", maxLength: 40, required: false },
      photos: ["/images/work/slate-coaster.webp"],
    },
  ],
} satisfies SiteVariables;
