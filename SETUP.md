# Setting up the shop

<!-- Generated from lib/setup-steps.ts by `npm run guide`. Edit that file, not this one. -->

Getting the shop online, in order: GitHub, Vercel, Supabase, then Stripe (which also handles Apple Pay and Google Pay). Once you can log in (step 3), the dashboard has a Setup page with the same list that checks steps off as you finish them.

Handing the shop over to a new owner? Start with [HANDOFF.md](HANDOFF.md).

**Get online**

1. [Make your accounts](#accounts), 10 min
2. [Take over the repository and put it online](#copy), 10 min
3. [Check your login](#password), 1 min
4. [Connect Supabase (your database and photo storage)](#supabase), 3 min

**Payments**

5. [Connect Stripe](#stripe), 3 min
6. [Webhook connected](#webhook), 1 click
7. [Turn on Apple Pay and Google Pay](#wallets), 2 min
8. [Turn on customer receipts](#receipts), 1 min

**Products**

9. [Add products (here or in Stripe)](#products), as long as you like
12. [Set your shipping prices](#shipping), 5 min
10. [Coupons and promo codes](#coupons) (optional), 2 min
11. [Phone notifications](#push), 3 min
13. [List your items on Facebook, Instagram and Google](#listings) (optional), 20 min
14. [Place a test order](#test-order), 3 min

**Extras**

15. [Save dashboard edits to GitHub](#github-sync), 5 min
16. [Tracking emails](#email) (optional), 10 min
17. [Your own web address](#domain) (optional), 10 min
18. [Sales tax](#tax) (optional), 10 min

**Go live**

19. [Go live](#live), 15 min

## Get online

<a id="accounts"></a>
### 1. Make your accounts

You need three free accounts. Use the same email for all of them to keep things simple.

1. **GitHub** (stores the site's files): sign up at github.com and pick a username. Send that username to whoever built the site, so they can hand the shop's repository over to you.
2. **Vercel** (runs the website): go to vercel.com, choose **Sign Up**, then **Continue with GitHub**. This links the two.
3. **Stripe** (takes payments, including Apple Pay and Google Pay): sign up at stripe.com. You can test right away; Stripe asks for business and bank details before real payments.

> **Tip:** Supabase (the database) doesn't need its own sign-up. Vercel creates it for you in step 4.

Links: [GitHub sign up](https://github.com/signup), [Vercel sign up](https://vercel.com/signup), [Stripe sign up](https://dashboard.stripe.com/register)

<a id="copy"></a>
### 2. Take over the repository and put it online

The shop's repository is transferred to your GitHub account, so it's fully yours (not a fork or a copy). Everything comes with it: every page, product, photo and setting.

1. Watch for an email from GitHub saying a repository is being transferred to you, and click **Accept** (it expires after a day). The repository now shows under your account.
2. In Vercel, click **Add New > Project**. Your repository is in the list (if not, click **Adjust GitHub App Permissions** and allow it). Click **Import**.
3. Leave every setting as it is. Open **Environment Variables** and add **ADMIN_PASSWORD** with the password you'll use for the dashboard.
4. Add **AUTH_SECRET** too: 40+ random characters (mash the keyboard). You'll never need to remember it.
5. Click **Deploy** and wait about two minutes. You get a web address like `bdubetest.vercel.app`. To pick your own name, open the project's **Settings > Domains**, click **Add Domain** and type a name ending in `.vercel.app`.

Links: [Vercel: import a project](https://vercel.com/new)

<a id="password"></a>
### 3. Check your login

Go to your new web address with `/admin` on the end and log in with your ADMIN_PASSWORD. You're in the dashboard you're reading now.

To change the password later, use **Settings > Password**.

> **Tip:** If AUTH_SECRET shows a warning below, add it in Vercel > your project > Settings > Environment Variables, then redeploy (Deployments > ⋯ > Redeploy).

<a id="supabase"></a>
### 4. Connect Supabase (your database and photo storage)

1. In Vercel, open your project and click the **Storage** tab.
2. Click **Create Database**, choose **Supabase**, and follow the prompts (the free plan is plenty). Pick the region closest to you.
3. When asked which project to connect, choose your shop and keep all environments ticked.
4. Go to **Deployments**, click **⋯** on the newest one, then **Redeploy**.
5. Come back to this page. The database and photo steps should turn green. The site creates its table and photo folder by itself on the first visit.

> **Tip:** If the database step shows an error about the table, open Supabase (Vercel > Storage > your database > Open in Supabase), go to **SQL Editor**, paste the SQL shown under this step, and press **Run**.

Links: [Vercel dashboard](https://vercel.com/dashboard)

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
- **In site-variables.ts on GitHub**: handy with ChatGPT. See Help > Editing with ChatGPT.

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

Edits made in the dashboard show on the site right away. With a GitHub token, they're also written into `site-variables.ts` on GitHub, so GitHub always has the latest words, prices and products (with history), ready for code changes or ChatGPT edits.

1. On GitHub, open the token page (link below): **Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token**.
2. Name it "Shop dashboard", set an expiration (a year is fine), and under **Repository access** choose **Only select repositories** and pick the shop's repository.
3. Under **Permissions > Repository permissions**, set **Contents** to **Read and write**. Click **Generate token** and copy it.
4. In this dashboard, open **Keys**, paste it into **GitHub token** and press **Save**.
5. Open **Settings > Your accounts** and press **Save to GitHub now**. From then on it happens after every save.

> **Tip:** These saves don't make Vercel rebuild the site (it's already up to date), so they don't use up builds.

Links: [Create a GitHub token](https://github.com/settings/personal-access-tokens/new), Open Keys (dashboard, `/admin/keys`)

<a id="email"></a>
### 16. Tracking emails (optional)

Lets you email customers their tracking number with one tap from an order.

1. Sign up at resend.com (free for small shops) and add your domain under **Domains** (needs a custom domain, below).
2. Create an API key under **API Keys** and save it on the **Keys** page as **Resend API key**.
3. In **Settings > Checkout & emails**, set the sender, e.g. `Your Shop <orders@yourshop.com>`.

> **Tip:** Without this, the order page still has an email link that opens your own mail app with the tracking details filled in.

Links: [Resend](https://resend.com/signup)

<a id="domain"></a>
### 17. Your own web address (optional)

1. Buy a domain (for example in Vercel > Domains, or any registrar).
2. In Vercel, open your project > **Settings > Domains**, add it, and follow the instructions to point it at Vercel.
3. After it works, open **Keys** and press **Connect Stripe webhook** again from the new address.

Links: [Vercel domains](https://vercel.com/domains)

<a id="tax"></a>
### 18. Sales tax (optional)

Stripe Tax works out and adds the right sales tax at checkout. Set it up in Stripe under **Settings > Tax** (add your address and where you're registered), then turn on **Sales tax by Stripe** in **Settings > Checkout & emails**.

> **Tip:** Rules depend on your state. A quick call with a tax preparer about selling online is worth it.

Links: [Stripe Tax](https://dashboard.stripe.com/settings/tax)

## Go live

<a id="live"></a>
### 19. Go live

1. In Stripe, finish **Activate payments** (business details and bank account).
2. Switch off **Test mode**, go to **Developers > API keys** and copy the live **Secret key** (`sk_live_`).
3. On **Keys**, press **Replace** on **Stripe secret key**, paste it and **Save**.
4. The webhook for live mode connects by itself when you save the live key.
5. Products made in test mode don't carry over to live mode in Stripe. Re-create them in live mode, or keep them in the dashboard instead.
6. Mark any test orders as **Cancelled** so they stay out of your totals, and share your link.

Links: [Stripe: activate](https://dashboard.stripe.com/account/onboarding), Open Keys (dashboard, `/admin/keys`)
