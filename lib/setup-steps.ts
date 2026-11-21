/*
 *  EDIT-POINT: SETUP-STEPS
 *  The step-by-step setup. Feeds both the Setup page in the dashboard (with
 *  live checkmarks) and SETUP.md on GitHub (regenerate: npm run guide).
 *  "check" names a field from lib/status.ts that turns the step green.
 */
import type { HelpBlock } from "./help";

export type SetupStep = {
  id: string;
  title: string;
  time: string;
  check?: "githubSync" | "github" | "vercel" | "password" | "secret" | "database" | "photos" | "stripe" | "webhook" | "wallets" | "push" | "email" | "live";
  optional?: boolean;
  blocks: HelpBlock[];
  links?: { label: string; url: string }[];
};

/** Where the shop's code lives on GitHub (used by the optional Deploy button only). */
export const TEMPLATE_REPO = "https://github.com/real-CAK3D/BDubeTest";

export const DEPLOY_URL =
  "https://vercel.com/new/clone?" +
  new URLSearchParams({
    "repository-url": TEMPLATE_REPO,
    "project-name": "shop",
    "repository-name": "shop",
    env: "ADMIN_PASSWORD,AUTH_SECRET",
    envDescription: "ADMIN_PASSWORD is your dashboard login. AUTH_SECRET is any long random text (mash the keyboard, 40+ characters).",
  }).toString();

export const SETUP_STEPS: SetupStep[] = [
  {
    id: "accounts",
    title: "Your shop is online",
    time: "done",
    check: "vercel",
    blocks: [
      { p: "The website is built and running, saved on GitHub and hosted on Vercel. You don't need accounts there to run the shop: everything happens in this dashboard." },
      { tip: "The full click-by-click list (including moving everything onto your own accounts later, and adding your own web address) is in **HANDOVER.md** in the shop's GitHub repository." },
    ],
    links: [{ label: "Open HANDOVER.md", url: "https://github.com/real-CAK3D/bdubetest/blob/main/HANDOVER.md" }],
  },
  {
    id: "password",
    title: "Check your login",
    time: "1 min",
    check: "password",
    blocks: [
      { p: "Go to your new web address with `/admin` on the end and log in with your ADMIN_PASSWORD. You're in the dashboard you're reading now." },
      { p: "To change the password later, use **Settings > Password**." },
      { tip: "If AUTH_SECRET shows a warning below, add it in Vercel > your project > Settings > Environment Variables, then redeploy (Deployments > ⋯ > Redeploy)." },
    ],
  },
  {
    id: "supabase",
    title: "Database (Supabase)",
    time: "2 min",
    check: "database",
    blocks: [
      { p: "Your orders, customers and photos are kept in a Supabase database. It's already created and locked so only this website can read it." },
      {
        steps: [
          "If this step isn't green: open supabase.com/dashboard > project **Dube Family Creations** > **Project Settings** > **API Keys**, and copy the **secret key** (starts with `sb_secret_`).",
          "In Vercel: project > **Settings** > **Environment Variables** > **Add Environment Variable**: key `SUPABASE_SECRET_KEY`, paste the value, type **Secret**, save.",
          "Go to **Deployments**, click **⋯** on the newest one, then **Redeploy**.",
        ],
      },
      { tip: "If it shows an error about the table, open Supabase > **SQL Editor**, paste the SQL shown under this step, and press **Run**." },
    ],
    links: [{ label: "Supabase dashboard", url: "https://supabase.com/dashboard" }],
  },
  {
    id: "your-info",
    title: "Your ZIP, address and contact details",
    time: "10 min",
    blocks: [
      {
        steps: [
          "**Settings > Store**: type your **ZIP code (ship from)**. This also sets your state for sales tax: orders shipped in your state (and local pickups) get its typical rate; other states get none.",
          "Same page, lower down: your **return address** for shipping labels.",
          "**Words & logos > Contact page**: email, phone, city. Add your Facebook/Instagram links under **Socials**.",
          "**Words & logos > Policies & footer**: **State whose laws apply**.",
          "Check the tax under **Settings > Payments & tax > Sales tax**. Type your exact local rate there if it's different.",
        ],
      },
    ],
    links: [{ label: "Open Settings", url: "/admin/settings" }],
  },
  {
    id: "stripe",
    title: "Connect Stripe",
    time: "3 min",
    check: "stripe",
    blocks: [
      {
        steps: [
          "In Stripe, make sure **Test mode** is on (top right) while you set up.",
          "Go to **Developers > API keys** and click **Reveal** next to **Secret key** (starts with `sk_test_`). Copy it.",
          "In this dashboard, open **Keys**, paste it into **Stripe secret key** and press **Save**. That's all: the site checks the key, pulls in any products you've made in Stripe, and connects the webhook so orders and refunds reach you instantly.",
        ],
      },
    ],
    links: [
      { label: "Stripe API keys", url: "https://dashboard.stripe.com/test/apikeys" },
      { label: "Open Keys", url: "/admin/keys" },
    ],
  },
  {
    id: "webhook",
    title: "Webhook connected",
    time: "1 click",
    check: "webhook",
    blocks: [{ p: "This connects by itself when you save your Stripe key. If it's not green, open **Keys** on your live web address and press **Connect Stripe webhook**." }],
    links: [{ label: "Open Keys", url: "/admin/keys" }],
  },
  {
    id: "wallets",
    title: "Turn on Apple Pay and Google Pay",
    time: "2 min",
    check: "wallets",
    blocks: [
      {
        steps: [
          "In Stripe, go to **Settings > Payments > Payment methods**.",
          "Make sure **Cards**, **Apple Pay** and **Google Pay** are on. Link (Stripe's one-click checkout) is a nice extra.",
          "That's it. Stripe shows the Apple Pay button on iPhones and Macs with Safari, and Google Pay in Chrome and on Android.",
        ],
      },
      { tip: "No Apple developer account or domain verification is needed, because checkout happens on Stripe's own page." },
    ],
    links: [{ label: "Stripe payment methods", url: "https://dashboard.stripe.com/settings/payment_methods" }],
  },
  {
    id: "receipts",
    title: "Turn on customer receipts",
    time: "1 min",
    blocks: [
      { p: "In Stripe, go to **Settings > Customer emails** and turn on **Successful payments**. Customers then get a receipt from Stripe with your business name." },
      { p: "While you're there, **Settings > Business > Public details** sets the name and support email shown on receipts and the checkout page, and **Branding** sets your logo and colors on the checkout page." },
    ],
    links: [
      { label: "Stripe customer emails", url: "https://dashboard.stripe.com/settings/emails" },
      { label: "Stripe branding", url: "https://dashboard.stripe.com/settings/branding" },
    ],
  },
  {
    id: "products",
    title: "Add products (here or in Stripe)",
    time: "as long as you like",
    blocks: [
      { p: "Either way works, and you can mix them:" },
      {
        list: [
          "**In this dashboard**: Products > **Add item**. Good for photos straight from your phone.",
          "**In Stripe**: Product catalog > **+ Add product**. Give it a name, description, photos and a **one-off** price. It appears in the shop within seconds.",
        ],
      },
      { p: "Extra details for Stripe products go in the product's **Metadata** (bottom of the product page in Stripe): `category`, `stock`, `summary`, `featured` = true, `made_to_order` = true, `choice_label` = Color and `choice_options` = Black, Brown, and for engraving `engraving_label` = Name to engrave and `engraving_max` = 30." },
    ],
    links: [
      { label: "Stripe: add a product", url: "https://dashboard.stripe.com/products/create" },
      { label: "Open Products", url: "/admin/products" },
    ],
  },
  {
    id: "coupons",
    title: "Coupons and promo codes",
    time: "2 min",
    optional: true,
    blocks: [
      {
        steps: [
          "In Stripe, go to **Product catalog > Coupons > + New**.",
          "Choose a percentage or amount off and how long it lasts.",
          "Under **Customer-facing codes**, add a code customers can type, like `VETERAN10`.",
          "Customers enter it on the checkout page. The **Discounts** page in this dashboard lists your codes and how often they've been used.",
        ],
      },
    ],
    links: [
      { label: "Stripe: new coupon", url: "https://dashboard.stripe.com/coupons/create" },
      { label: "Open Discounts", url: "/admin/discounts" },
    ],
  },
  {
    id: "push",
    title: "Phone notifications",
    time: "3 min",
    check: "push",
    blocks: [
      {
        steps: [
          "On your iPhone, open your site's `/admin` in Safari, tap **Share > Add to Home Screen**.",
          "Open **Shop HQ** from the home screen, go to **Settings**, tap **Turn on notifications**, then **Send a test**.",
        ],
      },
    ],
    links: [{ label: "Open Settings", url: "/admin/settings" }],
  },
  {
    id: "shipping",
    title: "Set your shipping prices",
    time: "5 min",
    blocks: [
      {
        steps: [
          "Open **Settings > Store**.",
          "Enter your **Ship-from ZIP**.",
          "Set a price for each distance band, plus **Farther than that** and **Outside the US**.",
          "Turn on **Local pickup** if people can collect orders, and write where and when in the note.",
          "Tap **Save changes**, then add something to the cart and try a few ZIP codes.",
        ],
      },
      { tip: "Weigh a typical package and price a label at Pirate Ship or USPS for a near and a far ZIP. That gives you good numbers for the bands." },
    ],
  },
  {
    id: "listings",
    title: "List your items on Facebook, Instagram and Google",
    time: "20 min",
    optional: true,
    blocks: [
      { p: "Your shop publishes a product list at **your-site/feed.xml** (for example https://your-shop.vercel.app/feed.xml). Facebook, Instagram and Google read it and keep your items, prices and stock up to date by themselves." },
      { h: "Facebook and Instagram Shop" },
      {
        steps: [
          "Open Meta Commerce Manager and create a catalog (type: Ecommerce).",
          "Choose **Data sources > Add items > Data feed > Use a URL**, paste your feed address and pick **Update daily**.",
          "Connect the catalog to your Facebook Page and Instagram account to tag items in posts and run shop ads.",
        ],
      },
      { h: "Google (free listings in Search and Shopping)" },
      {
        steps: [
          "Open Google Merchant Center and add your business (it asks to confirm your website; choose the HTML tag or Google Analytics option, or ask for help).",
          "Go to **Products > Add products > Add from a file > Enter a link to your file**, paste the feed address, and schedule a daily fetch.",
          "Turn on **Free listings**. Your items can then show in Google Shopping for free.",
        ],
      },
      { tip: "Items without a price or a photo are left out of the feed. The feed always uses your clean photos, because ad platforms reject watermarks." },
    ],
    links: [
      { label: "Meta Commerce Manager", url: "https://business.facebook.com/commerce" },
      { label: "Google Merchant Center", url: "https://merchants.google.com" },
    ],
  },
  {
    id: "test-order",
    title: "Place a test order",
    time: "3 min",
    blocks: [
      {
        steps: [
          "Open your shop, add something to the cart and check out.",
          "Pay with card `4242 4242 4242 4242`, any future date, any 3-digit code and any ZIP.",
          "You should land on the thank-you page, see the order in **Orders**, and get a notification.",
        ],
      },
    ],
  },
  {
    id: "github-sync",
    title: "Save dashboard edits to GitHub",
    time: "5 min",
    check: "githubSync",
    blocks: [
      { p: "Edits made in the dashboard show on the site right away. With a GitHub token, they're also written into `site-variables.ts` on GitHub, so GitHub always has the latest words, prices and products (with history), a backup with history." },
      {
        steps: [
          "On GitHub, open the token page (link below): **Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token**.",
          "Name it \"Shop dashboard\", set an expiration (a year is fine), and under **Repository access** choose **Only select repositories** and pick the shop's repository.",
          "Under **Permissions > Repository permissions**, set **Contents** to **Read and write**. Click **Generate token** and copy it.",
          "In this dashboard, open **Keys**, paste it into **GitHub token** and press **Save**.",
          "Open **Settings > Your accounts** and press **Save to GitHub now**. From then on it happens after every save.",
        ],
      },
      { tip: "These saves don't make Vercel rebuild the site (it's already up to date), so they don't use up builds." },
    ],
    links: [
      { label: "Create a GitHub token", url: "https://github.com/settings/personal-access-tokens/new" },
      { label: "Open Keys", url: "/admin/keys" },
    ],
  },
  {
    id: "email",
    title: "Customer emails",
    time: "10 min",
    optional: true,
    check: "email",
    blocks: [
      { p: "Lets the shop email customers by itself: gift card codes, how-to-pay details for Cash App / Venmo / Zelle orders, sign-in codes for Your orders, and tracking numbers with one tap from an order." },
      {
        steps: [
          "Needs your own web address first (below): Resend only sends from a domain you own. Sign up at resend.com (free) and add it under **Domains** (a subdomain like `mail.yourshop.com` is best), then add the records it shows to your DNS and press **Verify**.",
          "Create an API key under **API Keys** and save it on the **Keys** page as **Resend API key**.",
          "In **Settings > Checkout & emails**, set the sender, e.g. `Your Shop <orders@yourshop.com>`.",
        ],
      },
      { tip: "Without this, the order page still has an email link that opens your own mail app with the tracking details filled in." },
    ],
    links: [{ label: "Resend", url: "https://resend.com/signup" }],
  },
  {
    id: "domain",
    title: "Your own web address",
    time: "10 min",
    optional: true,
    blocks: [
      {
        steps: [
          "Buy a domain: easiest in Vercel (project > **Settings > Domains > Buy**, DNS is done for you), or at any registrar.",
          "Vercel > project > **Settings > Domains > Add Existing** > type it. If you bought it elsewhere, add the A and CNAME records Vercel shows at your registrar's DNS page.",
          "Vercel > **Settings > Environment Variables** > edit **NEXT_PUBLIC_SITE_URL** to `https://yourshop.com`, then **Deployments > ⋯ > Redeploy**.",
          "Here on **Accounts & keys**, press **Connect Stripe webhook** again. Then set up customer emails (Resend, the step above) and update your social bios and UptimeRobot with the new address.",
        ],
      },
    ],
    links: [{ label: "Vercel domains", url: "https://vercel.com/domains" }],
  },
  {
    id: "paypal",
    title: "PayPal, Venmo, Cash App, Zelle (optional)",
    time: "10 min",
    optional: true,
    blocks: [
      {
        steps: [
          "PayPal: with a PayPal **Business** account, go to developer.paypal.com > **Log in to Dashboard** > switch to **Live** > **Apps & Credentials** > **Create App** (or the Default Application). Copy the **Client ID** and **Secret**.",
          "Paste both on **Accounts & keys** (PayPal & Venmo), then tick **PayPal, Venmo and Pay Later** in **Settings > Payments & tax**.",
          "Cash App / Venmo / Zelle / cash: in **Settings > Payments & tax** tick each one and type your $cashtag, @username or Zelle email/phone.",
        ],
      },
    ],
    links: [{ label: "PayPal developer dashboard", url: "https://developer.paypal.com/dashboard/" }],
  },
  {
    id: "uptime",
    title: "Get told if the site goes down (UptimeRobot)",
    time: "5 min",
    optional: true,
    blocks: [
      {
        steps: [
          "Sign up free at uptimerobot.com.",
          "**New monitor** > type **HTTP(s)** > URL: your shop address followed by `/api/health` (copy it from **Site health**) > every 5 minutes.",
          "Tick your email as the alert contact (and install the UptimeRobot app for push alerts) > **Create monitor**.",
        ],
      },
    ],
    links: [{ label: "UptimeRobot", url: "https://uptimerobot.com" }, { label: "Site health", url: "/admin/health" }],
  },
  {
    id: "business-phone",
    title: "A free business phone number (Google Voice)",
    time: "10 min",
    optional: true,
    blocks: [
      { p: "Give customers a separate number for calls and texts instead of your personal cell. Google Voice gives you a free US number that rings and texts on your own phone through the Google Voice app (iPhone and Android), with voicemail that's typed out for you. You can set business hours so it doesn't ring at night." },
      {
        steps: [
          "On your phone, install **Google Voice** (App Store or Google Play) and sign in with a Google account (a separate one for the shop is a good idea).",
          "Pick a number in your area code. It asks for your existing cell number once, to confirm it's you.",
          "In the app's settings, turn on **Do not disturb** hours or a greeting with your business hours if you like.",
          "In the dashboard, put the new number in **Words & logos > Contact page** (Phone), and add **Call** and **Text** links on your **Link page**.",
        ],
      },
      { tip: "Apple doesn't have a free second-number service like this. An iPhone can hold two lines (eSIM), but the second line is a paid plan from a phone carrier. Google Voice works fine on an iPhone." },
    ],
    links: [{ label: "Google Voice", url: "https://voice.google.com" }],
  },
  {
    id: "tax",
    title: "Sales tax",
    time: "10 min",
    optional: true,
    blocks: [
      { p: "Sales tax is added by where each order ships, with every way to pay. In **Settings > Payments & tax** choose **My own rates** (type the rate for each state you're registered in) or **Stripe Tax** (exact city and county rates; set it up in Stripe under **Settings > Tax** first; small fee per order)." },
      { p: "Fill in your shop's ZIP under **Settings > Store** too, so local pickup orders are taxed for your state." },
      { tip: "Rules depend on your state. A quick call with a tax preparer about selling online is worth it." },
    ],
    links: [{ label: "Stripe Tax", url: "https://dashboard.stripe.com/settings/tax" }],
  },
  {
    id: "live",
    title: "Go live",
    time: "15 min",
    check: "live",
    blocks: [
      {
        steps: [
          "In Stripe, finish **Activate payments** (business details and bank account).",
          "Switch off **Test mode**, go to **Developers > API keys** and copy the live **Secret key** (`sk_live_`).",
          "On **Keys**, press **Replace** on **Stripe secret key**, paste it and **Save**.",
          "The webhook for live mode connects by itself when you save the live key.",
          "Products made in test mode don't carry over to live mode in Stripe. Re-create them in live mode, or keep them in the dashboard instead.",
          "Mark any test orders as **Cancelled** so they stay out of your totals, and share your link.",
        ],
      },
    ],
    links: [
      { label: "Stripe: activate", url: "https://dashboard.stripe.com/account/onboarding" },
      { label: "Open Keys", url: "/admin/keys" },
    ],
  },
];

/** The tabs on the Setup page. Every step id must be in exactly one phase. */
export const PHASES: { id: string; title: string; steps: string[] }[] = [
  { id: "online", title: "Get online", steps: ["accounts", "password", "supabase", "your-info"] },
  { id: "payments", title: "Payments", steps: ["stripe", "webhook", "wallets", "receipts", "paypal"] },
  { id: "products", title: "Products", steps: ["products", "shipping", "coupons", "push", "listings", "test-order"] },
  { id: "extras", title: "Extras", steps: ["github-sync", "business-phone", "uptime", "tax", "domain", "email"] },
  { id: "live", title: "Go live", steps: ["live"] },
];
