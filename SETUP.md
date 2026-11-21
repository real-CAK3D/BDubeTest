# Setting up the shop

<!-- Generated from lib/setup-steps.ts by `npm run guide`. Edit that file, not this one. -->

Getting the shop online, in order: GitHub, Vercel, Supabase, then Stripe (which also handles Apple Pay and Google Pay). Once you can log in (step 3), the dashboard has a Setup page with the same list that checks steps off as you finish them.

Handing the shop over to a new owner? Start with [HANDOFF.md](HANDOFF.md).

**Get online**

1. [Your shop is online](#accounts), done
2. [Check your login](#password), 1 min
3. [Database (Supabase)](#supabase), 5 min
4. [Your ZIP, address and contact details](#your-info), 10 min

**Payments**

5. [Connect Stripe](#stripe), 3 min
6. [Webhook connected](#webhook), 1 click
7. [Turn on Apple Pay and Google Pay](#wallets), 2 min
8. [Turn on customer receipts](#receipts), 1 min
18. [PayPal, Venmo, Cash App, Zelle (optional)](#paypal) (optional), 10 min

**Products**

9. [Add products (here or in Stripe)](#products), as long as you like
12. [Set your shipping prices](#shipping), 5 min
10. [Coupons and promo codes](#coupons) (optional), 2 min
11. [Phone notifications](#push), 3 min
13. [List your items on Facebook, Instagram and Google](#listings) (optional), 20 min
14. [Place a test order](#test-order), 3 min

**Extras**

15. [Save dashboard edits to GitHub](#github-sync), 5 min
20. [A free business phone number (Google Voice)](#business-phone) (optional), 10 min
19. [Get told if the site goes down (UptimeRobot)](#uptime) (optional), 5 min
21. [Sales tax](#tax) (optional), 10 min
17. [Your own web address](#domain) (optional), 10 min
16. [Customer emails](#email) (optional), 10 min

**Go live**

22. [Go live](#live), 15 min

## Get online

<a id="accounts"></a>
### 1. Your shop is online

The website is built and running, saved on GitHub and hosted on Vercel. You don't need accounts there to run the shop: everything happens in this dashboard.

> **Tip:** The full click-by-click list (your own GitHub, Supabase and Vercel, connecting them, and adding your own web address later) is in **HANDOVER.md** in your GitHub repository.

Links: [Open HANDOVER.md](https://github.com/real-CAK3D/bdubetest/blob/main/HANDOVER.md)

<a id="password"></a>
### 2. Check your login

Go to your new web address with `/admin` on the end and log in with your ADMIN_PASSWORD. You're in the dashboard you're reading now.

To change the password later, use **Settings > Password**.

> **Tip:** If AUTH_SECRET shows a warning below, add it in Vercel > your project > Settings > Environment Variables, then redeploy (Deployments > ⋯ > Redeploy).

<a id="supabase"></a>
### 3. Database (Supabase)

Your orders, customers and photos are kept in your own Supabase database. Vercel needs two values from it; Supabase needs nothing back.

1. supabase.com/dashboard > **New project** (name `Dube Family Creations`, **Generate a password** and save it, region **East US**) > **Create new project**.
2. **SQL Editor** > **New query** > paste the SQL shown under this step (also in `supabase/schema.sql`) > **Run**.
3. Copy the **Project URL** (**Connect** at the top) and the **secret key** (**Project Settings** > **API Keys**, starts with `sb_secret_`).
4. Vercel > your project > **Settings** > **Environment Variables**: add `SUPABASE_URL` and `SUPABASE_SECRET_KEY` with those values, then **Deployments** > **⋯** > **Redeploy**.

Links: [Supabase dashboard](https://supabase.com/dashboard)

<a id="your-info"></a>
### 4. Your ZIP, address and contact details

1. **Settings > Store**: type your **ZIP code (ship from)**. This also sets your state for sales tax: orders shipped in your state (and local pickups) get its typical rate; other states get none.
2. Same page, lower down: your **return address** for shipping labels.
3. **Words & logos > Contact page**: email, phone, city. Add your Facebook/Instagram links under **Socials**.
4. **Words & logos > Policies & footer**: **State whose laws apply**.
5. Check the tax under **Settings > Payments & tax > Sales tax**. Type your exact local rate there if it's different.

Links: Open Settings (dashboard, `/admin/settings`)

## Payments

<a id="stripe"></a>
### 5. Connect Stripe

1. In Stripe, make sure **Test mode** is on (top right) while you set up.
2. Go to **Developers > API keys** and click **Reveal** next to **Secret key** (starts with `sk_test_`). Copy it.
3. In this dashboard, open **Keys**, paste it into **Stripe secret key** and press **Save**. That's all: the site checks the key, pulls in any products you've made in Stripe, and connects the webhook so orders and refunds reach you instantly.

Links: [Stripe API keys](https://dashboard.stripe.com/test/apikeys), Open Keys (dashboard, `/admin/keys`)

<a id="webhook"></a>
### 6. Webhook connected

This connects by itself when you save your Stripe key. If it's not green, open **Keys** on your live web address and press **Connect Stripe webhook**.

Links: Open Keys (dashboard, `/admin/keys`)

<a id="wallets"></a>
### 7. Turn on Apple Pay and Google Pay

1. In Stripe, go to **Settings > Payments > Payment methods**.
2. Make sure **Cards**, **Apple Pay** and **Google Pay** are on. Link (Stripe's one-click checkout) is a nice extra.
3. That's it. Stripe shows the Apple Pay button on iPhones and Macs with Safari, and Google Pay in Chrome and on Android.

> **Tip:** No Apple developer account or domain verification is needed, because checkout happens on Stripe's own page.

Links: [Stripe payment methods](https://dashboard.stripe.com/settings/payment_methods)

<a id="receipts"></a>
### 8. Turn on customer receipts

In Stripe, go to **Settings > Customer emails** and turn on **Successful payments**. Customers then get a receipt from Stripe with your business name.

While you're there, **Settings > Business > Public details** sets the name and support email shown on receipts and the checkout page, and **Branding** sets your logo and colors on the checkout page.

Links: [Stripe customer emails](https://dashboard.stripe.com/settings/emails), [Stripe branding](https://dashboard.stripe.com/settings/branding)

## Products

<a id="products"></a>
### 9. Add products (here or in Stripe)

Either way works, and you can mix them:

- **In this dashboard**: Products > **Add item**. Good for photos straight from your phone.
- **In Stripe**: Product catalog > **+ Add product**. Give it a name, description, photos and a **one-off** price. It appears in the shop within seconds.

Extra details for Stripe products go in the product's **Metadata** (bottom of the product page in Stripe): `category`, `stock`, `summary`, `featured` = true, `made_to_order` = true, `choice_label` = Color and `choice_options` = Black, Brown, and for engraving `engraving_label` = Name to engrave and `engraving_max` = 30.

Links: [Stripe: add a product](https://dashboard.stripe.com/products/create), Open Products (dashboard, `/admin/products`)

<a id="coupons"></a>
### 10. Coupons and promo codes (optional)

1. In Stripe, go to **Product catalog > Coupons > + New**.
2. Choose a percentage or amount off and how long it lasts.
3. Under **Customer-facing codes**, add a code customers can type, like `VETERAN10`.
4. Customers enter it on the checkout page. The **Discounts** page in this dashboard lists your codes and how often they've been used.

Links: [Stripe: new coupon](https://dashboard.stripe.com/coupons/create), Open Discounts (dashboard, `/admin/discounts`)

<a id="push"></a>
### 11. Phone notifications

1. On your iPhone, open your site's `/admin` in Safari, tap **Share > Add to Home Screen**.
2. Open **Shop HQ** from the home screen, go to **Settings**, tap **Turn on notifications**, then **Send a test**.

Links: Open Settings (dashboard, `/admin/settings`)

<a id="shipping"></a>
### 12. Set your shipping prices

1. Open **Settings > Store**.
2. Enter your **Ship-from ZIP**.
3. Set a price for each distance band, plus **Farther than that** and **Outside the US**.
4. Turn on **Local pickup** if people can collect orders, and write where and when in the note.
5. Tap **Save changes**, then add something to the cart and try a few ZIP codes.

> **Tip:** Weigh a typical package and price a label at Pirate Ship or USPS for a near and a far ZIP. That gives you good numbers for the bands.

<a id="listings"></a>
### 13. List your items on Facebook, Instagram and Google (optional)

Your shop publishes a product list at **your-site/feed.xml** (for example https://your-shop.vercel.app/feed.xml). Facebook, Instagram and Google read it and keep your items, prices and stock up to date by themselves.

#### Facebook and Instagram Shop

1. Open Meta Commerce Manager and create a catalog (type: Ecommerce).
2. Choose **Data sources > Add items > Data feed > Use a URL**, paste your feed address and pick **Update daily**.
3. Connect the catalog to your Facebook Page and Instagram account to tag items in posts and run shop ads.

#### Google (free listings in Search and Shopping)

1. Open Google Merchant Center and add your business (it asks to confirm your website; choose the HTML tag or Google Analytics option, or ask for help).
2. Go to **Products > Add products > Add from a file > Enter a link to your file**, paste the feed address, and schedule a daily fetch.
3. Turn on **Free listings**. Your items can then show in Google Shopping for free.

> **Tip:** Items without a price or a photo are left out of the feed. The feed always uses your clean photos, because ad platforms reject watermarks.

Links: [Meta Commerce Manager](https://business.facebook.com/commerce), [Google Merchant Center](https://merchants.google.com)

<a id="test-order"></a>
### 14. Place a test order

1. Open your shop, add something to the cart and check out.
2. Pay with card `4242 4242 4242 4242`, any future date, any 3-digit code and any ZIP.
3. You should land on the thank-you page, see the order in **Orders**, and get a notification.

## Extras

<a id="github-sync"></a>
### 15. Save dashboard edits to GitHub

Edits made in the dashboard show on the site right away. With a GitHub token, they're also written into `site-variables.ts` on GitHub, so GitHub always has the latest words, prices and products (with history), a backup with history.

1. On GitHub, open the token page (link below): **Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token**.
2. Name it "Shop dashboard", set an expiration (a year is fine), and under **Repository access** choose **Only select repositories** and pick the shop's repository.
3. Under **Permissions > Repository permissions**, set **Contents** to **Read and write**. Click **Generate token** and copy it.
4. In this dashboard, open **Keys**, paste it into **GitHub token** and press **Save**.
5. Open **Settings > Your accounts** and press **Save to GitHub now**. From then on it happens after every save.

> **Tip:** These saves don't make Vercel rebuild the site (it's already up to date), so they don't use up builds.

Links: [Create a GitHub token](https://github.com/settings/personal-access-tokens/new), Open Keys (dashboard, `/admin/keys`)

<a id="email"></a>
### 16. Customer emails (optional)

Lets the shop email customers by itself: gift card codes, how-to-pay details for Cash App / Venmo / Zelle orders, sign-in codes for Your orders, and tracking numbers with one tap from an order.

1. Needs your own web address first (below): Resend only sends from a domain you own. Sign up at resend.com (free) and add it under **Domains** (a subdomain like `mail.yourshop.com` is best), then add the records it shows to your DNS and press **Verify**.
2. Create an API key under **API Keys** and save it on the **Keys** page as **Resend API key**.
3. In **Settings > Checkout & emails**, set the sender, e.g. `Your Shop <orders@yourshop.com>`.

> **Tip:** Without this, the order page still has an email link that opens your own mail app with the tracking details filled in.

Links: [Resend](https://resend.com/signup)

<a id="domain"></a>
### 17. Your own web address (optional)

1. Buy a domain: easiest in Vercel (project > **Settings > Domains > Buy**, DNS is done for you), or at any registrar.
2. Vercel > project > **Settings > Domains > Add Existing** > type it. If you bought it elsewhere, add the A and CNAME records Vercel shows at your registrar's DNS page.
3. Vercel > **Settings > Environment Variables** > edit **NEXT_PUBLIC_SITE_URL** to `https://yourshop.com`, then **Deployments > ⋯ > Redeploy**.
4. Here on **Accounts & keys**, press **Connect Stripe webhook** again. Then set up customer emails (Resend, the step above) and update your social bios and UptimeRobot with the new address.

Links: [Vercel domains](https://vercel.com/domains)

## Payments

<a id="paypal"></a>
### 18. PayPal, Venmo, Cash App, Zelle (optional) (optional)

1. PayPal: with a PayPal **Business** account, go to developer.paypal.com > **Log in to Dashboard** > switch to **Live** > **Apps & Credentials** > **Create App** (or the Default Application). Copy the **Client ID** and **Secret**.
2. Paste both on **Accounts & keys** (PayPal & Venmo), then tick **PayPal, Venmo and Pay Later** in **Settings > Payments & tax**.
3. Cash App / Venmo / Zelle / cash: in **Settings > Payments & tax** tick each one and type your $cashtag, @username or Zelle email/phone.

Links: [PayPal developer dashboard](https://developer.paypal.com/dashboard/)

## Extras

<a id="uptime"></a>
### 19. Get told if the site goes down (UptimeRobot) (optional)

1. Sign up free at uptimerobot.com.
2. **New monitor** > type **HTTP(s)** > URL: your shop address followed by `/api/health` (copy it from **Site health**) > every 5 minutes.
3. Tick your email as the alert contact (and install the UptimeRobot app for push alerts) > **Create monitor**.

Links: [UptimeRobot](https://uptimerobot.com), Site health (dashboard, `/admin/health`)

<a id="business-phone"></a>
### 20. A free business phone number (Google Voice) (optional)

Give customers a separate number for calls and texts instead of your personal cell. Google Voice gives you a free US number that rings and texts on your own phone through the Google Voice app (iPhone and Android), with voicemail that's typed out for you. You can set business hours so it doesn't ring at night.

1. On your phone, install **Google Voice** (App Store or Google Play) and sign in with a Google account (a separate one for the shop is a good idea).
2. Pick a number in your area code. It asks for your existing cell number once, to confirm it's you.
3. In the app's settings, turn on **Do not disturb** hours or a greeting with your business hours if you like.
4. In the dashboard, put the new number in **Words & logos > Contact page** (Phone), and add **Call** and **Text** links on your **Link page**.

> **Tip:** Apple doesn't have a free second-number service like this. An iPhone can hold two lines (eSIM), but the second line is a paid plan from a phone carrier. Google Voice works fine on an iPhone.

Links: [Google Voice](https://voice.google.com)

<a id="tax"></a>
### 21. Sales tax (optional)

Sales tax is added by where each order ships, with every way to pay. In **Settings > Payments & tax** choose **My own rates** (type the rate for each state you're registered in) or **Stripe Tax** (exact city and county rates; set it up in Stripe under **Settings > Tax** first; small fee per order).

Fill in your shop's ZIP under **Settings > Store** too, so local pickup orders are taxed for your state.

> **Tip:** Rules depend on your state. A quick call with a tax preparer about selling online is worth it.

Links: [Stripe Tax](https://dashboard.stripe.com/settings/tax)

## Go live

<a id="live"></a>
### 22. Go live

1. In Stripe, finish **Activate payments** (business details and bank account).
2. Switch off **Test mode**, go to **Developers > API keys** and copy the live **Secret key** (`sk_live_`).
3. On **Keys**, press **Replace** on **Stripe secret key**, paste it and **Save**.
4. The webhook for live mode connects by itself when you save the live key.
5. Products made in test mode don't carry over to live mode in Stripe. Re-create them in live mode, or keep them in the dashboard instead.
6. Mark any test orders as **Cancelled** so they stay out of your totals, and share your link.

Links: [Stripe: activate](https://dashboard.stripe.com/account/onboarding), Open Keys (dashboard, `/admin/keys`)
