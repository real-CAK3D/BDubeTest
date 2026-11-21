# Handover: getting Dube Family Creations ready to sell

This is the step-by-step list for putting the shop on the owner's own accounts and taking it live. Every step says exactly where to go, what to click, and what to paste.

- **Part 0** is for **CAK3D** (the builder): handing over the code, and cleaning up afterwards.
- **Part 1** is for **the owner**: his own GitHub, Supabase (database) and Vercel (website), connected to each other. About 30 minutes, once.
- **Parts 2 to 6**: the owner fills in the shop and connects payments. Almost all of it happens inside the shop's own dashboard.
- **Part 7** is for later, when the shop gets its own web address (domain).

**Every secret, key and password** the shop uses is listed in **[.env.example](.env.example)**: what each one is for, where to get it, and where to paste it. Real values never go on GitHub. They go in Vercel's Environment Variables or the dashboard's **Accounts & keys**, and a copy of each belongs in a password manager (Bitwarden, 1Password, iCloud Keychain or Google Password Manager).

Everything below is on free plans. The only costs are the usual payment fees (Stripe or PayPal, about 3% per sale) and, later, a domain name (about $10 to $20 a year).

### What comes with the code

- The whole shop: pages, products, photos, words, settings, the dashboard.
- **Automatic checks on GitHub**: every change must build and pass a security audit, and Dependabot opens a pull request each week when a package the shop uses gets a security fix.
- **A daily self-check** (it sends the owner's phone a notification if something important breaks) and a weekly backup.
- **Automatic sales tax**: once the shop's ZIP is typed in (Part 2), the shop knows its state and charges that state's typical rate on orders shipped there; other states get no tax.

---

## Part 0: CAK3D (the builder)

### Before handing over: test on your own accounts (optional)

Your test copy runs at **https://bdubetest.vercel.app** with a test database on your Supabase ("Dube Family Creations"). To make it save to that database, paste its secret key into your Vercel once: supabase.com/dashboard › **Dube Family Creations** › **Project Settings** › **API Keys** › copy the **secret key** (`sb_secret_...`) › vercel.com › project **bdtest** › **Settings** › **Environment Variables** › **Add Environment Variable**: key `SUPABASE_SECRET_KEY`, the value, **Save** › **Deployments** › **⋯** › **Redeploy**. **Site health** in the dashboard then says "Saved in Supabase".

### Handing over the code (2 minutes)

1. Get the owner's **GitHub username** (after he does Part 1, step 1).
2. On GitHub, open the repository **real-CAK3D/bdubetest** › **Settings** (top of the repository) › scroll to the bottom, **Danger Zone** › **Transfer**.
3. **New owner:** choose **Specify an organization or username** and type his username.
4. Type `bdubetest` to confirm › **I understand, transfer this repository**.
5. He gets an email and must accept it **within one day**. You stay on as a collaborator; GitHub redirects the old address to the new one.

### After his shop is live (5 minutes)

Delete your test copies so only his runs:
1. Vercel › project **bdtest** › **Settings** › **General** › bottom › **Delete Project**.
2. Supabase › project **Dube Family Creations** › **Project Settings** › **General** › bottom › **Delete project**. (Unpause Arachnotes afterwards if you want it back: Supabase › **Arachnotes** › **Restore project**.)
3. In GitHub, he can remove you as a collaborator if he likes: repository › **Settings** › **Collaborators**.

---

## Part 1: The owner, your own accounts (about 30 minutes, once)

Use the same email for all three accounts. Keep a note open in your password manager as you go: you'll save a few values there.

### 1. Make your three free accounts (10 minutes)

1. **GitHub** (stores the shop's code): **https://github.com/signup**. Pick a username and send it to CAK3D.
2. **Supabase** (the database: orders, customers, photos): **https://supabase.com/dashboard/sign-up** › **Continue with GitHub**.
3. **Vercel** (runs the website): **https://vercel.com/signup** › choose **Hobby** (free) › **Continue with GitHub**. This links Vercel to your GitHub so it can see your code.

### 2. Accept the shop's code (1 minute)

1. Watch for an email from GitHub: "**CAK3D** wants to transfer **bdubetest** to you".
2. Click the link and **accept** (it expires after one day).
3. The repository now shows under your account: `https://github.com/YOUR-USERNAME/bdubetest`.

### 3. Create the database in Supabase (5 minutes)

1. Go to **https://supabase.com/dashboard** › **New project**.
2. Fill in:
   - **Organization:** your own (it was made when you signed up).
   - **Project name:** `Dube Family Creations`
   - **Database Password:** click **Generate a password**, then **copy it into your password manager** as "Dube shop database password" (you'll rarely need it, but keep it).
   - **Region:** **East US** (closest to most US customers and to the website).
3. Click **Create new project** and wait about 2 minutes until it's ready.
4. **Make the shop's table.** In the left sidebar, click **SQL Editor** › **New query**. Open the file [`supabase/schema.sql`](supabase/schema.sql) in your GitHub repository, click the **copy** icon (top right of the file), paste it into the editor, and click **Run**. It should say **Success. No rows returned.** (Safe to run again if unsure.)
5. **Copy the two values the website needs** (save both in your password manager):
   - **Project URL:** click **Connect** at the top of the project. Copy the URL that looks like `https://abcdefgh.supabase.co`.
   - **Secret key:** left sidebar › gear icon **Project Settings** › **API Keys**. Under **Secret keys**, copy the key that starts with `sb_secret_` (create one if there isn't one). If you only see the older keys, copy the **service_role** key.

> The secret key opens the whole database. Paste it only into Vercel (next step) and your password manager. Never in a text, email or chat.

### 4. Make two passwords for the website (2 minutes)

In your password manager, generate and save:
- **AUTH_SECRET:** 40+ random letters and numbers (use the password generator, length 40+, no symbols). It locks logins and the customer details. **Never change it once there are real orders**, and keep the copy: Vercel never shows it again.
- **CRON_SECRET:** another 40+ random letters and numbers (protects the daily self-check).

And pick a **starter password** for the dashboard (**ADMIN_PASSWORD**). You use it once, the first time you sign in, then choose your own.

### 5. Put the website on Vercel and connect the database (5 minutes)

1. Go to **https://vercel.com/new**.
2. Under **Import Git Repository**, find **bdubetest** and click **Import**. (Not listed? Click **Adjust GitHub App Permissions** › allow access to **bdubetest** › back to Vercel.)
3. **Project Name:** type the name you want, e.g. `dube-family-creations`. Your web address becomes `dube-family-creations.vercel.app` (Vercel adds a few letters if it's taken).
4. Leave **Framework Preset** (Next.js) and the build settings as they are.
5. Open **Environment Variables** and add these one at a time (type the **Key**, paste the **Value**, click **Add**):

   | Key | Value |
   | --- | --- |
   | `ADMIN_PASSWORD` | your starter password |
   | `AUTH_SECRET` | from your password manager |
   | `CRON_SECRET` | from your password manager |
   | `SUPABASE_URL` | the Project URL from Supabase |
   | `SUPABASE_SECRET_KEY` | the secret key from Supabase |

6. Click **Deploy** and wait about 2 minutes. You'll see "Congratulations" and your web address.
7. **Tell the shop its address:** project › **Settings** › **Environment Variables** › **Add Environment Variable**: key `NEXT_PUBLIC_SITE_URL`, value your address with `https://` (e.g. `https://dube-family-creations.vercel.app`) › **Save**. Then **Deployments** › **⋯** next to the newest › **Redeploy** › **Redeploy**.

That's the only back and forth: **Vercel needs the two values from Supabase**, and Supabase needs nothing from Vercel.

### 6. First sign-in and check it all connected (3 minutes)

1. Open your address with **`/admin`** on the end, e.g. `https://dube-family-creations.vercel.app/admin`. Bookmark it, or add it to your home screen (Safari: **Share** › **Add to Home Screen**; Chrome: **⋮** › **Add to Home screen**).
2. **Your name:** your first name. **Password:** your starter password.
3. Choose your own password (8+ characters) and add your email (used if you ever forget it). **Save and continue**.
4. Menu › **Site health**: **Saving data** should say **Saved in Supabase** with a green check. (If it says it can't save, check the two Supabase values in Vercel for typos, then redeploy. If it mentions the table, run step 3.4 again.)

> The shop's **Help** button (the **?** at the top) explains every page. **Setup** in the menu shows these steps with green checkmarks as you finish them.

### 7. Let the dashboard save to your GitHub (3 minutes)

Changes made in the dashboard (prices, words, products) are saved back into your GitHub repository, so nothing is ever lost.

1. On GitHub, click your profile picture (top right) › **Settings**.
2. Left sidebar, at the bottom › **Developer settings** › **Personal access tokens** › **Fine-grained tokens** › **Generate new token**.
3. Fill in:
   - **Token name:** `Dube shop dashboard`
   - **Expiration:** the longest offered, or No expiration
   - **Resource owner:** you
   - **Repository access:** **Only select repositories** › pick **bdubetest**
   - **Permissions** › **Repository permissions** › **Contents:** **Read and write**
4. **Generate token** and copy it (starts with `github_pat_`; shown only once).
5. Dashboard › **Accounts & keys** › **GitHub token** › paste › **Save**.

> Tip: making the repository **private** (repository › **Settings** › **General** › bottom › **Change visibility** › **Make private**) also turns on a weekly locked backup copy into it. Vercel keeps deploying either way.

---

## Part 2: Your shop's details (15 minutes)

### 1. Your shop's location (this sets your sales tax)

1. Menu › **Settings** › **Store**.
2. **Your ZIP code (ship from):** type the ZIP code you ship from (your home or shop).
3. Lower on the same page, fill in your **return address** (name, street, city, state, ZIP, phone). It goes on shipping labels and is never shown on the shop.
4. Press **Save changes** at the bottom.

That's it for tax. The shop now knows your state:
- Orders **shipped to your state** are charged your state's typical sales tax (state rate plus the usual city and county rate).
- **Local pickup** orders are charged your state's tax.
- Orders **shipped to other states** get **no tax** (you only collect where you're registered).

To check or fine-tune it: **Settings** › **Payments & tax** › **Sales tax**. Your state shows with its typical rate. If your exact local rate is different (your county or city adds more or less), type it in the **Rate %** box. If you ever register in another state, pick it under **Also collect in**. Want exact rates for every address automatically? Choose **Stripe Tax** there instead (Stripe charges a small fee per order; it needs Stripe connected, Part 3).

> Ask a tax preparer once which states you need to collect in and whether your state taxes shipping (there's a **Tax shipping too** box per state).

### 2. Your contact details and words

1. Menu › **Words & logos** › **Contact page**: your email, phone (use the Google Voice number from Part 4), and location (city, state).
2. **Socials** (same page): paste your Facebook, Instagram, TikTok links; pick more under **Add a link**.
3. Check the **About** tab (your story) and **Policies & footer** (the small print at the bottom).
4. **Save changes**.

### 3. Which state's laws apply to your terms

Menu › **Words & logos** › **Policies & footer** › **State whose laws apply**: type your state, e.g. `Oklahoma`. **Save changes**.

The shipping, returns, privacy and terms pages are already written for how this shop works. Read them once (they're linked at the bottom of the shop). For full peace of mind, have a local attorney look them over once.

### 4. Your link page (for your Instagram/TikTok/Facebook bio)

Menu › **Link page**: your picture, name, short bio and a look. Copy **Your link** and paste it in your social media bios. It shows how to do that on each app.

---

## Part 3: Getting paid (20 minutes)

Pick any or all. Customers choose in the cart.

### Card, Apple Pay, Google Pay (Stripe)

1. Sign up at **https://dashboard.stripe.com/register** (free). Stripe asks for business and bank details before real payments go through.
2. In Stripe, switch **Test mode** on (top right) while setting up.
3. **Developers** › **API keys** › next to **Secret key** click **Reveal**, then copy (starts with `sk_test_`).
4. Shop dashboard › **Accounts & keys** › **Stripe secret key** › paste › **Save**. The shop connects the rest by itself (it shows "Webhook connected").
5. Try a test order with card `4242 4242 4242 4242`, any future date, any CVC.
6. When ready for real money: in Stripe switch **Test mode** off, copy the live **Secret key** (`sk_live_`), paste it in **Accounts & keys** the same way, and press **Connect Stripe webhook** if it asks.

### PayPal, Venmo and Pay Later

1. You need a **PayPal Business** account (free): **https://www.paypal.com/business**. You can upgrade a personal account.
2. Go to **https://developer.paypal.com/dashboard/** and **Log in to Dashboard** with that account.
3. At the top, switch to **Live** (Sandbox is practice money).
4. **Apps & Credentials** › under **REST API apps** click **Create App** (name it `Dube shop`, type Merchant) or open the **Default Application**.
5. Copy the **Client ID**, then click **Show** under **Secret key 1** and copy it.
6. Shop dashboard › **Accounts & keys** › paste into **PayPal client ID** and **PayPal secret** › **Save**.
7. **Settings** › **Payments & tax** › tick **PayPal, Venmo and Pay Later**, leave it on **Live** › **Save changes**.

### Cash App, Venmo, Zelle, cash at pickup ("pay us directly")

1. **Settings** › **Payments & tax** › under **Pay us directly**, tick each one you use and type your **$cashtag**, **Venmo @username**, or **Zelle email/phone**. **Save changes**.
2. Customers place the order and get your details. The order waits under **Orders** › **Waiting for payment**. When the money arrives, open the order and tap **Got it: mark paid**.

> Use business profiles on Cash App and Venmo for sales (their personal accounts aren't meant for selling).

### Gift cards and promo codes

- **Gift cards** work right away with every way to pay (menu › **Discounts** › **Gift cards**).
- **Promo codes** are made in **Discounts** and need Stripe connected.

---

## Part 4: A free business phone number (Google Voice, 10 minutes)

Keeps your personal number private. Calls and texts ring on your phone through the app.

1. Install **Google Voice** from the App Store (iPhone) or Google Play (Android).
2. Open it and sign in with a Google (Gmail) account. A separate one just for the shop is a good idea.
3. Accept the terms › **Continue** › tap **Search** and type your city or area code › tap **Select** next to the number you like.
4. It asks for your existing cell number once and texts you a code to confirm. Basic Google Voice is free in the US.
5. In the app's **Settings**: set a **voicemail greeting** and, if you like, **Do not disturb** hours.
6. Shop dashboard › **Words & logos** › **Contact page** › **Phone**: type the new number › **Save changes**.
7. Menu › **Link page** › **Links**: add **Call** and **Text** with the new number.

> Apple doesn't have a free second-number service. An iPhone can hold a second line (eSIM), but that's a paid plan from a phone company. Google Voice works fine on an iPhone.

---

## Part 5: Phone notifications and alerts (10 minutes)

### New orders on your phone

1. Add the dashboard to your home screen (Part 1, step 6) and open it from there.
2. Menu › **Settings** › **Notifications** › **Turn on notifications** › **Allow**.
3. Press **Send a test**. You'll also see the number of unread notifications on the app icon.

### Get told if the website goes down (UptimeRobot, free)

The shop checks itself every day, but if the whole site is down it can't send anything. A free outside service checks every 5 minutes.

1. Sign up at **https://uptimerobot.com** (free plan).
2. Click **New monitor** (or **+ Add New Monitor**).
3. **Monitor type:** **HTTP(s)**.
4. **URL:** `https://YOUR-SHOP.vercel.app/api/health` (also shown on the dashboard's **Site health** page with a **Copy** button).
5. **Friendly name:** `Dube shop`. **Monitoring interval:** 5 minutes (the free plan's fastest).
6. Under alert contacts / **How will we notify you?**, tick your **email**. Install the **UptimeRobot** app and sign in to get push alerts too (text messages cost extra).
7. **Create monitor**. Make sure your email is ticked for this monitor, or no alerts are sent.

### Backups

Menu › **Site health** › **Download a backup** about once a month, and keep the file in Google Drive, iCloud or on a USB stick. It's locked (encrypted) and only opens on your shop.

---

## Part 6: Optional extras

- **Shipping labels from the dashboard:** free account at **https://goshippo.com** › **Settings** › **API** › copy the live token › **Accounts & keys** › **Shippo** › **Save**.
- **Sell on Facebook, Instagram, Google and Pinterest:** menu › **Sell online** has click-by-click steps for each (your product list is already published at `/feed.xml`).
- **Chat with AI answers:** the chat already answers by itself. For smarter wording, add an AI key on **Accounts & keys** (instructions there).

---

## Part 7: When the shop gets its own web address (domain)

Buying a domain isn't part of this handover. Once you have one, here's where it goes and what to update, in this order.

**Buy it.** Easiest: in Vercel (your project › **Settings** › **Domains** › **Buy**). DNS is then done for you. Or buy at Namecheap, Cloudflare, Squarespace Domains or GoDaddy.

1. **Point it at the shop.** Vercel › your project › **Settings** › **Domains** › **Add Existing** › type `yourshop.com` › **Add**. Accept adding `www.yourshop.com` too (redirect one to the other).
   - If you bought it in Vercel: nothing else to do.
   - If you bought it elsewhere: Vercel shows the exact records to add. Usually an **A** record for `yourshop.com` and a **CNAME** for `www`, with values Vercel shows for this project. Log in to where you bought the domain › **DNS** / **DNS records** › add them exactly as shown. It turns green in minutes to a few hours.
2. **Tell the shop its new address.** Vercel › your project › **Settings** › **Environment Variables** › **NEXT_PUBLIC_SITE_URL** › **⋯ Edit** › `https://yourshop.com` › **Save**, then **Deployments** › **⋯** › **Redeploy**.
3. **Stripe:** shop dashboard › **Accounts & keys** › **Connect Stripe webhook** (moves it to the new address). For Apple Pay: Stripe › **Settings** › **Payment methods** › **Apple Pay** › add the new domain.
4. **Customer emails (Resend), now possible with a domain.** These let the shop email customers by itself: gift card codes, how-to-pay details, sign-in codes and tracking numbers.
   1. Sign up at **https://resend.com** (free plan).
   2. **Domains** › **Add Domain** › type `mail.yourshop.com` (a subdomain is recommended).
   3. Resend shows a few records (**TXT** and **MX**, sometimes **CNAME**) in the domain's **Records** tab. Add each one exactly at the place you manage DNS (Vercel › **Domains** › your domain › **DNS Records** › **Add**, or your registrar). If you use Cloudflare, turn the orange cloud **off** for them.
   4. Back in Resend, click **Verify**. Usually done in 15 minutes (can take up to 72 hours).
   5. **API Keys** › **Create API Key** › name `Dube shop`, permission **Sending access** › copy it (shown once).
   6. Shop dashboard › **Accounts & keys** › **Resend API key** › paste › **Save**.
   7. **Settings** › **Checkout & emails** › **Send customer emails from:** `Dube Family Creations <orders@mail.yourshop.com>` › **Save changes**.
5. **Update the places that use the address:** your social media bios (copy the new link from **Link page**), the UptimeRobot monitor URL (`https://yourshop.com/api/health`), and, if you set them up, Google Merchant Center / Meta Commerce Manager (**Sell online** page, re-verify with the new address).

---

## Where things are (quick reference)

Replace `YOUR-SHOP` with your Vercel address (or your domain later).

| What | Where |
| --- | --- |
| Shop | https://YOUR-SHOP.vercel.app |
| Dashboard | https://YOUR-SHOP.vercel.app/admin |
| Health check address (for UptimeRobot) | https://YOUR-SHOP.vercel.app/api/health |
| Product list for Google / Facebook | https://YOUR-SHOP.vercel.app/feed.xml |
| Link-in-bio page | https://YOUR-SHOP.vercel.app/socials |
| Website hosting and its secrets | vercel.com › your project › **Settings** › **Environment Variables** |
| Code | github.com › your **bdubetest** repository |
| Database and photos | supabase.com › your project **Dube Family Creations** |
| Keys (Stripe, PayPal, Resend, GitHub, Shippo, AI) | Dashboard › **Accounts & keys** (stored encrypted) |
| Everything else (prices, words, tax, payments) | Dashboard |
| List of every secret | [.env.example](.env.example) |
