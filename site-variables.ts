/*
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
 *  - Text goes in "double quotes". Use \n\n inside text for a new paragraph.
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

  // Pages & menu
  // Every page of the shop, in menu order. page is shop, gallery, custom, about, contact, status, review,
  // page:<slug> for a page from extraPages, or link:<name> with a link for an outside address.
  // inMenu: top menu.  inFooter: footer.  on: false switches the page off (shows "not found").
  menu: [
    { page: "shop", label: "Shop", inMenu: true, inFooter: false, on: true },
    { page: "gallery", label: "Our work", inMenu: true, inFooter: false, on: true },
    { page: "custom", label: "Custom orders", inMenu: true, inFooter: false, on: true },
    { page: "about", label: "About", inMenu: true, inFooter: false, on: true },
    { page: "contact", label: "Contact", inMenu: true, inFooter: true, on: true },
    { page: "page:faq", label: "FAQ", inMenu: false, inFooter: true, on: true },
    { page: "status", label: "Order status", inMenu: false, inFooter: true, on: true },
    { page: "review", label: "Leave a review", inMenu: false, inFooter: false, on: true },
    { page: "military", label: "Military discount", inMenu: false, inFooter: true, on: true },
    { page: "giftcards", label: "Gift cards", inMenu: false, inFooter: true, on: true },
  ],

  // Links
  // Links with a picture in the footer and on the contact page. icon is one of: facebook, instagram, tiktok, youtube, x,
  // pinterest, etsy, google, whatsapp, linkedin, threads, snapchat, amazon, discord, reddit, spotify, twitch, telegram, messenger, github,
  // phone, text, email, website, map, reviews, link.
  // label: leave "" to use the usual name. For phone, text and email, url is just the number or address.
  links: [
    { icon: "facebook", label: "", url: "https://www.facebook.com/groups/2154317351855824/" },
  ],

  // Payments
  // Ways to pay besides Stripe's card checkout. Keys for Stripe and PayPal go in the dashboard (Accounts & keys), never here.
  // manual: pay us directly. handle is your $cashtag, Venmo @username or Zelle email/phone. Those orders wait until you mark them paid.
  payments: {
    stripe: true,
    paypal: false,
    paypalMode: "live",
    manual: [
      {
        id: "cashapp",
        on: false,
        handle: "",
        note: ""
      },
      {
        id: "venmo",
        on: false,
        handle: "",
        note: ""
      },
      {
        id: "zelle",
        on: false,
        handle: "",
        note: ""
      },
      {
        id: "cash",
        on: false,
        handle: "",
        note: ""
      }
    ],
    accepts: true
  },

  // Link page
  // The Socials page (/socials), a link-in-bio page. "" = use the usual (business name, tagline, logo, theme colors).
  // bg: theme, color, gradient or image. button: fill, outline, soft, shadow or glass. shape: pill, round or square. iconsAt: top or bottom.
  // On each link above, place: button, icon or both (social networks default to both), thumb: a picture for its button, featured: true makes it wiggle.
  linkPage: {
    title: "",
    handle: "",
    bio: "",
    avatar: "",
    bg: "theme",
    color1: "#1f2a44",
    color2: "#7a2e3a",
    image: "",
    button: "fill",
    shape: "pill",
    btnColor: "",
    btnText: "",
    textColor: "",
    iconsAt: "top",
    shopButton: true,
    share: true,
    subscribe: false,
    footer: ""
  },

  // Hidden text
  // Names of text kept in this file but not shown on the shop (the eye button in Dashboard > Words & logos).
  hiddenText: [],

  // Seasonal banners
  // Holiday banners at the top of the shop. Holidays not listed here use their usual settings (lib/seasons.ts).
  // daysBefore / daysAfter: how long the banner shows around the day. style: patriotic, remembrance, winter, christmas, newyear, love, irish, spring, summer, fall, spooky, thanks, plain.
  seasons: {
    on: true, // false = no holiday banners at all
    items: [
    ],
  },

  // What's to come
  // New things on the way, shown on the home page and the What's to come page.
  // stage: idea, working or soon. when: e.g. "This spring" ("" = no date). hidden: true keeps it but doesn't show it.
  upcoming: {
    on: true, // show the section on the home page
    heading: "What's to come",
    intro: "New things we're working on for more custom creations. Tap “I want this” so we know what to make first, or ask us to let you know when it's ready.",
    items: [
      { id: "photo-engraving", title: "Photo engraving", text: "Your favorite photo engraved onto a tumbler, slate or wood. Great for memorials and gifts.", image: "", when: "", stage: "working" },
      { id: "unit-coins", title: "Unit & challenge coin displays", text: "Custom display cases built around your unit's coins, patches and insignia.", image: "", when: "", stage: "idea" },
      { id: "more-colors", title: "More tumbler colors", text: "More colors and finishes to engrave, beyond what's in the shop now.", image: "", when: "", stage: "soon" },
    ],
  },

  // Shop categories
  // In the order they show in the shop. Each product's category should match one of these.
  categories: ["Drinkware", "Home decor", "Leather goods", "Patriotic & military", "Gifts & keepsakes"],

  // Chat
  // The 'Ask us' chat on the shop. It answers from these questions and answers (and the shop's own info).
  // topic: the group it's filed under in the dashboard. alsoAsked: other ways customers word the same question. hidden: true keeps an answer but stops the chat using it.
  chat: {
    on: true, // show the chat button on the shop
    useAI: true, // let an AI write the replies when a key is saved; false = the shop's own answers only
    live: true, // offer live chat with a person while someone is signed in to the dashboard and available
    ai: { provider: "anthropic", model: "", baseUrl: "" }, // provider: anthropic, openai, gemini, groq, openrouter, ollama, ollama-own, custom ("" = its usual model / address)
    title: "Questions? Ask us",
    greeting: "Hi! Ask me anything about our tumblers, signs, custom orders, shipping or discounts.",
    questions: [
      { id: "ship-time", topic: "Shipping & pickup", question: "How long does shipping take?", answer: "Ready-made items ship within 3-5 business days. Custom and engraved pieces are made to order and usually ship within 1-2 weeks. You get an email with tracking as soon as it ships.", alsoAsked: ["When will my order get here?", "How fast do you ship?", "How long until I get it?", "When will it arrive?", "How long does it take to make?"] },
      { id: "ship-cost", topic: "Shipping & pickup", question: "How much is shipping?", answer: "Shipping is worked out from your ZIP code in the cart, so you see the price before checkout. Orders over the free-shipping amount ship free, and local pickup is free too.", alsoAsked: ["What does shipping cost?", "Is shipping free?", "How much to mail it?"] },
      { id: "pickup", topic: "Shipping & pickup", question: "Can I pick up my order instead of shipping?", answer: "Yes. Choose Local pickup in the cart and there's no shipping charge. We'll message you to set up a pickup time once your order is ready.", alsoAsked: ["Can I pick it up?", "Do you do local pickup?", "Can I get it in person?"] },
      { id: "intl", topic: "Shipping & pickup", question: "Do you ship outside the US?", answer: "We mainly ship within the US. For an address outside the US, tick 'Shipping outside the US' in the cart to see if we can send it and what it costs.", alsoAsked: ["Do you ship to Canada?", "Do you ship internationally?", "Can you send it overseas?"] },
      { id: "track", topic: "Orders & changes", question: "Where is my order? How do I track it?", answer: "Use the Order status page (link at the bottom of the site) with your order number and email. Once it ships you'll also get an email with the tracking number.", alsoAsked: ["What's the status of my order?", "Has my order shipped?", "Where's my package?", "Do you have a tracking number?"] },
      { id: "custom", topic: "Custom work & designs", question: "Do you make custom orders?", answer: "Yes! Use the Custom orders page to tell us what you'd like, with photos if you have them. We'll reply with a price. Because of sizing and how much our equipment would need changing, we can't take every custom job, but larger orders are often possible.", alsoAsked: ["Can you make something special for me?", "Do you take custom requests?", "Can I get a quote?"] },
      { id: "decline", topic: "Custom work & designs", question: "Why was my custom request declined?", answer: "Some designs need more changes to our laser setup than one piece allows, or don't fit the item well. It's never about the idea itself. Larger orders can make it workable, so feel free to ask again with a different size or quantity." },
      { id: "logo", topic: "Custom work & designs", question: "Can you engrave my own logo or picture?", answer: "Often, yes. On items that allow it, pick 'Your own logo' and upload it (a PNG with a see-through background works best). Otherwise send it through the Custom orders page and we'll tell you how it will turn out.", alsoAsked: ["Can you put my company logo on it?", "Can you engrave a photo?", "Can I send my own artwork?"] },
      { id: "designs", topic: "Custom work & designs", question: "Why can't I pick every design on every size?", answer: "Not every design fits every item. Each size only shows the designs that fit it well, so bigger or smaller tumblers may have different choices." },
      { id: "text", topic: "Custom work & designs", question: "Can you add a name or date?", answer: "Yes. Many items have a box for the text to engrave. It's used exactly as typed, so double-check spelling, capitals and dates before you order.", alsoAsked: ["Can you engrave a name?", "Can I personalize it?", "Can you put a date on it?"] },
      { id: "proof", topic: "Orders & changes", question: "Will I see a proof before you engrave?", answer: "For custom orders we talk through the design before starting. For regular items, the preview on the item page shows roughly how your design will look, and the text is engraved exactly as you type it.", alsoAsked: ["Can I see it before you make it?", "Do I get to approve the design?"] },
      { id: "change", topic: "Orders & changes", question: "Can I change or cancel my order?", answer: "Message us right away. Once we start cutting or engraving, an order can't be changed or cancelled, but we'll do our best to catch it in time.", alsoAsked: ["I need to change my order", "Can I cancel?", "I made a mistake on my order"] },
      { id: "returns", topic: "Returns & problems", question: "What is your return policy?", answer: "Ready-made items can be returned within 30 days if unused. Custom, personalized and engraved items are made just for you, so they can't be returned unless they arrive damaged or we made a mistake; then send a photo within 7 days and we'll fix or replace it.", alsoAsked: ["Can I return it?", "Do you give refunds?", "Can I exchange it?", "I want to send it back"] },
      { id: "damaged", topic: "Returns & problems", question: "My item arrived damaged. What do I do?", answer: "We're sorry! Send us a photo through the Contact page within 7 days of delivery and we'll make it right.", alsoAsked: ["It arrived broken", "My order came damaged", "Something's wrong with my item"] },
      { id: "care", topic: "Care & materials", question: "How do I care for an engraved tumbler?", answer: "Hand wash with warm soapy water and skip the dishwasher to keep the finish and engraving looking their best. Wood should stay out of soaking water; slate wipes clean.", alsoAsked: ["How do I clean it?", "How do I wash it?", "Will the engraving fade?"] },
      { id: "dishwasher", topic: "Care & materials", question: "Are the tumblers dishwasher safe?", answer: "We recommend hand washing. Dishwashers can wear down the coating and engraving over time.", alsoAsked: ["Can it go in the dishwasher?", "Is it dishwasher safe?"] },
      { id: "material", topic: "Care & materials", question: "What do you engrave on?", answer: "Mostly stainless tumblers, wood signs, slate and leather. Natural materials vary piece to piece, so yours may look a little different from the photos, and that's part of what makes it one of a kind.", alsoAsked: ["What materials do you use?", "What can you engrave?"] },
      { id: "military", topic: "Discounts & payment", question: "Do you have a military or veteran discount?", answer: "Yes. Veterans, active duty, Guard and Reserve, police, firefighters and EMTs get a discount. Visit the Military discount page (link at the bottom of the site) to get your code.", alsoAsked: ["Do you have a first responder discount?", "I'm a veteran, any deals?", "Police discount?"] },
      { id: "bulk", topic: "Discounts & payment", question: "Do you offer bulk or group pricing?", answer: "Yes. The more items in one order, the bigger the discount; it comes off automatically in the cart. For large unit, team or event orders, send a custom request with the quantity.", alsoAsked: ["Do you do wholesale?", "Discount for a big order?", "Can I order 50 for my team?"] },
      { id: "gift", topic: "Discounts & payment", question: "Do you sell gift cards?", answer: "Yes. Visit the Gift cards page, pick an amount, and we'll email the code to whoever it's for. It's used in one order." },
      { id: "codes", topic: "Discounts & payment", question: "How do I use a promo code?", answer: "Type it in the promo code box on the checkout page, before you pay.", alsoAsked: ["Where do I put my coupon?", "My code isn't working"] },
      { id: "pay", topic: "Discounts & payment", question: "How can I pay?", answer: "We take {payments}. Pick how you'd like to pay in the cart.", alsoAsked: ["Do you take Apple Pay?", "Can I pay with PayPal?", "What payment do you accept?", "Do you take Venmo?", "Can I pay with Cash App?", "Do you take Zelle?"] },
      { id: "rush", topic: "Orders & changes", question: "I need it by a certain date. Can you rush it?", answer: "Send us a message or a custom request with the date before you order, and we'll tell you honestly whether we can make it.", alsoAsked: ["Can I get it by Friday?", "I need it fast", "Can you have it done by a certain date?"] },
      { id: "who", topic: "About us", question: "Who are you?", answer: "We're a veteran-owned family business. Everything is made by hand in our workshop, much of it with our laser engraver.", alsoAsked: ["Who makes these?", "Who runs this shop?", "Is this a small business?"] },
      { id: "contact", topic: "About us", question: "How do I contact you?", answer: "Use the Contact page to send us a message, or reach us through our Facebook group. We usually reply within a day or two.", alsoAsked: ["How do I reach you?", "Can I talk to a real person?", "What's your email?"] },
    ],
  },

  // Discounts
  // Promo codes themselves are made in Dashboard > Discounts (they live in Stripe). These are the programs.
  discounts: {
    thankYouCode: { on: false, percentOff: 10, validDays: 60 }, // a code for their next order after each purchase
    military: {
      on: true, // the Military & first responder page
      percentOff: 10,
      checkFirst: true, // true: they ask and you approve each one; false: everyone sees the code below
      code: "", // the shared code when checkFirst is false
      heading: "Military & first responder discount",
      text: "Thank you for your service. Veterans, active duty, Guard and Reserve, police, firefighters and EMTs get {percent}% off.", // {percent} is filled in
    },
    bulk: [ // the more items in one order, the bigger the discount
      { fromItems: 10, percentOff: 5 },
      { fromItems: 25, percentOff: 10 },
      { fromItems: 50, percentOff: 15 },
    ],
    giftCards: {
      on: true, // the Gift cards page
      amounts: [25, 50, 100], // dollars
      heading: "Gift cards",
      text: "Let them pick their own piece. Sent by email with a code to use at checkout.",
    },
    checkoutReminders: { on: true, afterHours: 2 }, // email people who left checkout without paying (1 to 24 hours later)
  },

  // Watermark
  // A stamp on shop photos so they can't be reused without credit. The original photos are never changed.
  watermark: {
    on: false, // true stamps shop photos; false shows them clean
    text: "", // "" uses the business name
    withLogo: true, // add the logo next to the text
    position: "tiled", // "corner" | "center" (one big diagonal) | "tiled" (diagonal all over)
    opacity: 30, // 5 (faint) to 90 (strong)
    size: 30, // 10 to 60, how big the stamp is
    onOurWork: true, // Our work photos too
    onDesigns: false, // design library artwork too
  },

  // Design library
  // Decals and engraving artwork customers pick from. Which designs fit which item and size is set on each
  // product (designs.bySize). id: short unique name.  group: e.g. "Military", "Patriotic", "Family".
  // extraPrice: added to the item's price in dollars (0 for none).  show: false hides it everywhere.
  // note (optional): private laser settings or file name, shown on orders; customers never see it.
  designs: [
    { id: "flag", name: "American flag", group: "Patriotic", extraPrice: 0, show: true, image: "/images/designs/flag.svg" },
    { id: "thin-line-flag", name: "Thin blue line flag", group: "Police", extraPrice: 0, show: true, image: "/images/designs/thin-line-flag.svg" },
    { id: "veteran-star", name: "Veteran star", group: "Military", extraPrice: 0, show: true, image: "/images/designs/veteran-star.svg" },
    { id: "dog-tags", name: "Dog tags", group: "Military", extraPrice: 0, show: true, image: "/images/designs/dog-tags.svg" },
    { id: "monogram", name: "Family monogram", group: "Family", extraPrice: 0, show: true, image: "/images/designs/monogram.svg" },
    { id: "anchor", name: "Anchor", group: "Military", extraPrice: 0, show: true, image: "/images/designs/anchor.svg" },
    { id: "mountains", name: "Mountains", group: "Outdoors", extraPrice: 0, show: true, image: "/images/designs/mountains.svg" },
    { id: "compass", name: "Compass", group: "Outdoors", extraPrice: 0, show: true, image: "/images/designs/compass.svg" },
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
        category: "Drinkware",
        description: "Northern lights over mountains and a lake, engraved through the iridescent finish so every angle catches a different color. Made on 30 oz and 40 oz Stanleys, and the design can go on other Stanley styles too.",
        photos: ["/images/work/aurora-1.webp", "/images/work/aurora-2.webp", "/images/work/aurora-3.webp"],
        featured: true,
        productSlug: "stanley-aurora-tumbler-40oz",
      },
      {
        slug: "marine-veteran-tumbler",
        title: "Marine Veteran Tumbler",
        category: "Drinkware",
        description: "Personalized for a Marine veteran with his name and years served: a gold eagle, globe and anchor, a waving flag and dog tags, all engraved in brushed gold.",
        photos: ["/images/work/marine-1.webp", "/images/work/marine-2.webp", "/images/work/marine-3.webp"],
        featured: true,
        productSlug: "",
      },
      {
        slug: "sea-turtle-tumbler",
        title: "Sea Turtle Tumbler",
        category: "Drinkware",
        description: "Sea turtles swimming through bubbles and coral, wrapped all the way around the tumbler.",
        photos: ["/images/work/turtle-1.webp", "/images/work/turtle-2.webp", "/images/work/turtle-3.webp"],
        featured: true,
        productSlug: "",
      },
      {
        slug: "hibiscus-tumbler",
        title: "Hibiscus Tumbler",
        category: "Drinkware",
        description: "Hibiscus flowers and leaves engraved around a red Stanley.",
        photos: ["/images/work/hibiscus-1.webp", "/images/work/hibiscus-2.webp", "/images/work/hibiscus-3.webp"],
        featured: true,
        productSlug: "",
      },
      {
        slug: "campsite-signs",
        title: "Campsite & Family Name Signs",
        category: "Home decor",
        description: "Made for two customers who wanted something special to stand out at their home and their campsite. Your name with a scene that fits you: lake and loons, mountains, campfire, camper. Signs come unfinished or stained and sealed.",
        photos: ["/images/work/sign-dube.webp", "/images/work/sign-jensen.webp"],
        featured: true,
        productSlug: "",
      },
      {
        slug: "leather-card-holder",
        title: "Engraved Leather Card Holder",
        category: "Leather goods",
        description: "Our first try at engraving leather, with our own logo, and it came out sharp. Personalized leather accessories make great gifts and everyday pieces.",
        photos: ["/images/work/card-holder.webp"],
        featured: true,
        productSlug: "",
      },
      {
        slug: "slate-coaster",
        title: "Engraved Slate Coaster",
        category: "Home decor",
        description: "Testing laser engraving on slate. The contrast against the dark stone gives designs a sharp, clean look. Custom slate coasters, family names and patriotic artwork are coming.",
        photos: ["/images/work/slate-coaster.webp"],
        featured: true,
        productSlug: "",
      },
    ],
  },

  // Footer
  footer: {
    note: "", // small print after the copyright line
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
    githubRepo: "", // e.g. "owner/repo"; found by itself on Vercel
    vercelProject: "",
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
  //   sizes        sizes with their own price, e.g. [{ name: "30 oz", price: 40 }], or null
  //   designs      which designs from the design library fit each size, or null:
  //                { label: "Design", required: true, bySize: { "30 oz": ["flag", "eagle"] } }
  //                (with no sizes, use "*" as the size name)
  //   preview      extra ways to see the item, or null: mockup (a photo with a box, in % of the photo,
  //                where the chosen design is shown), shape3d (tumbler | mug | sign | round | square | card)
  //                with color3d, scan3d (a .glb 3D scan file), spin360 (photos taken all the way around)
  //   photos       leave out to keep photos added in the dashboard
  products: [
    {
      slug: "stanley-aurora-tumbler-40oz",
      name: "Stanley Aurora Tumbler, 40 oz",
      price: 90,
      wasPrice: null,
      summary: "Northern lights engraved through an iridescent 40 oz Stanley.",
      description: "Northern lights over mountains and a lake, engraved through the iridescent finish so every angle catches a different color.\n\nThese Stanleys are discontinued, so stock is limited. The design can also be made on a different style of Stanley; contact us to ask.",
      category: "Drinkware",
      stock: 2,
      madeToOrder: false,
      featured: true,
      visible: true,
      choice: null,
      engraving: null,
      sizes: null,
      designs: null,
      preview: null,
      photos: ["/images/work/aurora-1.webp", "/images/work/aurora-2.webp", "/images/work/aurora-3.webp"],
    },
    {
      slug: "stanley-aurora-tumbler-30oz",
      name: "Stanley Aurora Tumbler, 30 oz",
      price: 80,
      wasPrice: null,
      summary: "The same aurora design on a 30 oz Stanley with a straw lid.",
      description: "Northern lights over mountains and a lake, engraved through the iridescent finish.\n\nThese Stanleys are discontinued, so stock is limited. The design can also be made on a different style of Stanley; contact us to ask.",
      category: "Drinkware",
      stock: 1,
      madeToOrder: false,
      featured: true,
      visible: true,
      choice: null,
      engraving: null,
      sizes: null,
      designs: null,
      preview: null,
      photos: ["/images/work/aurora-3.webp", "/images/work/aurora-1.webp"],
    },
    {
      slug: "stanley-aurora-tumbler-flawed",
      name: "Aurora Tumbler (flawed, as is)",
      price: 20,
      wasPrice: 90,
      summary: "A band around the taper burned through the color. Sold as is.",
      description: "This one didn't come out perfect: a band around the taper was burned through the color. Everything else about it is fine, and it's sold as is at a big discount.",
      category: "Drinkware",
      stock: 0,
      madeToOrder: false,
      featured: false,
      visible: false,
      choice: null,
      engraving: null,
      sizes: null,
      designs: null,
      preview: null,
      photos: ["/images/work/aurora-flawed-1.webp", "/images/work/aurora-flawed-2.webp", "/images/work/aurora-flawed-3.webp"],
    },
    {
      slug: "custom-campsite-sign",
      name: "Custom Campsite or Family Name Sign",
      price: 0,
      wasPrice: null,
      summary: "Your name and a scene that fits you, engraved in wood.",
      description: "Pick the name and tell us the scene: lake and loons, mountains, campfire, camper, or your own idea. Made to order.",
      category: "Home decor",
      stock: null,
      madeToOrder: true,
      featured: false,
      visible: false,
      choice: { label: "Finish", options: ["Unfinished", "Stained and sealed"] },
      engraving: { label: "Name and the scene you'd like", maxLength: 120, required: true },
      sizes: null,
      designs: null,
      preview: null,
      photos: ["/images/work/sign-dube.webp", "/images/work/sign-jensen.webp"],
    },
    {
      slug: "custom-engraved-tumbler",
      name: "Custom Engraved Tumbler",
      price: 0,
      wasPrice: null,
      summary: "Pick a size, then a design that fits it. Add a name if you like.",
      description: "Tell us the design and the text. Great for veterans, birthdays and gifts. Made to order.",
      category: "Drinkware",
      stock: null,
      madeToOrder: true,
      featured: false,
      visible: false,
      choice: null,
      engraving: { label: "Name or text to add", maxLength: 60, required: false },
      sizes: [{ name: "16 oz", price: 0 }, { name: "20 oz", price: 0 }, { name: "30 oz", price: 0 }, { name: "40 oz", price: 0 }],
      designs: {
        label: "Design",
        required: false,
        bySize: {
          "16 oz": ["flag", "thin-line-flag", "veteran-star", "dog-tags", "monogram", "anchor", "mountains", "compass"],
          "20 oz": ["flag", "thin-line-flag", "veteran-star", "monogram", "mountains", "compass"],
          "30 oz": ["flag", "veteran-star", "monogram"],
          "40 oz": ["flag", "veteran-star"],
        },
      },
      preview: { shape3d: "tumbler", color3d: "#24364f" },
      photos: ["/images/work/marine-3.webp", "/images/work/turtle-1.webp"],
    },
    {
      slug: "engraved-leather-card-holder",
      name: "Engraved Leather Card Holder",
      price: 0,
      wasPrice: null,
      summary: "Leather card holder with your initials, name or logo.",
      description: "A slim leather card holder, laser engraved with the text or logo you choose.",
      category: "Leather goods",
      stock: null,
      madeToOrder: true,
      featured: false,
      visible: false,
      choice: null,
      engraving: { label: "Initials, name or logo idea", maxLength: 40, required: false },
      sizes: null,
      designs: null,
      preview: null,
      photos: ["/images/work/card-holder.webp"],
    },
    {
      slug: "engraved-slate-coaster",
      name: "Engraved Slate Coaster",
      price: 0,
      wasPrice: null,
      summary: "Natural slate with a family name or patriotic design.",
      description: "Laser engraved natural slate. The design comes out bright against the dark stone.",
      category: "Home decor",
      stock: null,
      madeToOrder: true,
      featured: false,
      visible: false,
      choice: null,
      engraving: { label: "Family name or design idea", maxLength: 40, required: false },
      sizes: null,
      designs: null,
      preview: null,
      photos: ["/images/work/slate-coaster.webp"],
    },
  ],
} satisfies SiteVariables;
