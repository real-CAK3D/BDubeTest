# Handover: getting Dube Family Creations ready to sell

This is the step-by-step list for taking the shop live. Every step says exactly where to go, what to click, and what to paste.

- **Part 1** is for **CAK3D** (the builder) before handing over. About 15 minutes.
- **Parts 2 to 6** are for **the owner**. Most of it happens inside the shop's own dashboard, on a phone or computer.
- **Part 7** is for later, when the shop gets its own web address (domain).
- **Part 8** is for later, if the shop moves onto the owner's own accounts.

The live shop is **https://bdubetest.vercel.app** and the dashboard is **https://bdubetest.vercel.app/admin**.

**Every secret, key and password** the shop uses is listed in **[.env.example](.env.example)**: what each one is for, where to get it, where to paste it, and whether it's done yet. Real values are never stored on GitHub (this repository is public). They live in Vercel's Environment Variables or the dashboard's **Accounts & keys**, and a copy of each belongs in a password manager.

Everything below is on free plans. The only costs are the usual payment fees (Stripe or PayPal, about 3% per sale) and, later, a domain name (about $10 to $20 a year).

---

## What's already done

These are set up and working. Nothing to do.

- The website, hosted on **Vercel** (project `bdtest`), saved on **GitHub** (`real-CAK3D/bdubetest`).
- The **database** on **Supabase** (project "Dube Family Creations"): table, photo storage and security rules are created. It only needs its key connected (Part 1, step 1).
- **Security settings** on Vercel: the login secret, the dashboard password, the site address and a secret that protects the daily self-check (`CRON_SECRET`).
- **GitHub**: every change is checked automatically (it must build and pass a security audit). Dependabot opens a pull request each week when a package the shop uses gets a security fix.
- **Daily self-check**: every day the shop checks itself, sends the owner's phone a notification if something important is broken, and saves a weekly backup.
- **Sales tax**: automatic. Once the shop's ZIP is typed in (Part 2), the shop knows its state and charges that state's typical rate on orders shipped there. Orders to other states get no tax. The rate can be changed in one box.

---

## Part 1: CAK3D, before handing over (about 15 minutes)

### 1. Connect the database key (2 minutes)

The database is created, but the website needs its secret key. Supabase never lets software read that key, so it's a quick copy and paste.

1. Go to **https://supabase.com/dashboard** and sign in.
2. Click the project **Dube Family Creations**.
3. In the left sidebar, click the gear icon **Project Settings**, then **API Keys**.
4. Under **Secret keys**, copy the key that starts with `sb_secret_` (click the copy icon; create one if there isn't one yet). If you only see the older keys, copy the **service_role** key instead.
5. Go to **https://vercel.com/dashboard**, click the project **bdtest**, then **Settings**, then **Environment Variables**.
6. Click **Add Environment Variable** and fill it in:
   - **Key:** `SUPABASE_SECRET_KEY`
   - **Value:** paste the key
   - Type **Secret** (Sensitive), environments **Production** and **Preview**
7. Click **Save**.
8. Don't redeploy yet. Step 2 changes another variable, so redeploy once after both.

> Never paste this key anywhere else (chat, email, code). It opens the whole database.

### 2. Set a fresh login secret, and keep a copy (3 minutes)

`AUTH_SECRET` locks the customer details stored in the database. Vercel never shows it again after it's saved. Without a copy, the shop could never be moved to the owner's own Vercel account (Part 8). The database is brand new and empty, so now is the right moment to set one you keep.

1. Make a long random secret. On a computer, open **https://www.random.org/strings/?num=1&len=20&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new** twice and join the two results together (40 characters). Or use your password manager's generator (40+ characters, letters and numbers).
2. **Save it in a password manager** (Bitwarden, 1Password, iCloud Keychain, Google Password Manager) named "Dube shop AUTH_SECRET". Give the owner a copy the same way, never by text or email in plain view.
3. In Vercel › **bdtest** › **Settings** › **Environment Variables**, find **AUTH_SECRET**, click **⋯** › **Edit**, paste the new value, and **Save**.
4. While you're there, check **ADMIN_PASSWORD**. This is the **starter password** the owner uses the very first time he signs in (he then picks his own). Edit it to something you'll give him, and save.
5. Go to **Deployments**, click **⋯** next to the newest one, then **Redeploy**, then **Redeploy** again. Wait about 2 minutes.

### 3. Check it worked (1 minute)

1. Open **https://bdubetest.vercel.app/admin**. Sign in with your name and the starter password (you'll be asked to choose your own password: do it).
2. In the menu, open **Site health**. **Saving data** should say "Saved in Supabase." with a green check.

> Accounts, test orders and test settings made before this point were in temporary storage and are gone; that's expected. Products, photos and words come from the GitHub file and are still there.

### 4. Let the dashboard save to GitHub (3 minutes)

Changes made in the dashboard (prices, words, products) are saved back into the GitHub repository so nothing is ever lost. That needs a GitHub token from the account that owns the repository (yours, for now).

1. On GitHub, click your profile picture (top right) › **Settings**.
2. In the left sidebar, at the bottom, click **Developer settings**.
3. Click **Personal access tokens** › **Fine-grained tokens** › **Generate new token**.
4. Fill in:
   - **Token name:** `Dube shop dashboard`
   - **Expiration:** the longest offered, or No expiration
   - **Resource owner:** you
   - **Repository access:** **Only select repositories**, then pick `real-CAK3D/bdubetest`
   - **Permissions** › **Repository permissions** › **Contents:** **Read and write**
5. Click **Generate token** and copy it (it starts with `github_pat_`). It is shown only once.
6. In the shop dashboard, open **Accounts & keys**, find **GitHub token**, paste, and **Save**.

### 5. Give the owner access (2 minutes)

- **Shop dashboard:** send him **https://bdubetest.vercel.app/admin**, the starter password from step 2, and tell him to sign in with his first name.
- **GitHub** (so he can see the files; optional): repository **real-CAK3D/bdubetest** › **Settings** › **Collaborators** › **Add people** › type his GitHub username › **Add**. He accepts the email invite.
- **Supabase** (optional): **https://supabase.com/dashboard** › your organization **CAK3D** › **Team** › invite his email as **Developer**. The invite lasts 24 hours.
- **Vercel:** inviting people needs a paid Vercel plan, and he doesn't need it. Everything he does is in the shop dashboard.

---

## Part 2: The owner, first sign-in and shop details (15 minutes)

### 1. Sign in

1. Open **https://bdubetest.vercel.app/admin** (bookmark it, or add it to your home screen: in Safari tap **Share** › **Add to Home Screen**; in Chrome tap **⋮** › **Add to Home screen**).
2. **Your name:** your first name. **Password:** the starter password you were given.
3. Choose your own password (8+ characters) and add your email (used if you ever forget the password). Press **Save and continue**.

> The shop's **Help** button (the **?** at the top) explains every page. **Setup** in the menu shows these steps with green checkmarks as you finish them.

### 2. Your shop's location (this sets your sales tax)

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

### 3. Your contact details and words

1. Menu › **Words & logos** › **Contact page**: your email, phone (use the Google Voice number from Part 4), and location (city, state).
2. **Socials** (same page): paste your Facebook, Instagram, TikTok links; pick more under **Add a link**.
3. Check the **About** tab (your story) and **Policies & footer** (the small print at the bottom).
4. **Save changes**.

### 4. Which state's laws apply to your terms

Menu › **Words & logos** › **Policies & footer** › **State whose laws apply**: type your state, e.g. `Oklahoma`. **Save changes**.

The shipping, returns, privacy and terms pages are already written for how this shop works. Read them once (they're linked at the bottom of the shop). For full peace of mind, have a local attorney look them over once.

### 5. Your link page (for your Instagram/TikTok/Facebook bio)

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

1. Add the dashboard to your home screen (Part 2, step 1) and open it from there.
2. Menu › **Settings** › **Notifications** › **Turn on notifications** › **Allow**.
3. Press **Send a test**. You'll also see the number of unread notifications on the app icon.

### Get told if the website goes down (UptimeRobot, free)

The shop checks itself every day, but if the whole site is down it can't send anything. A free outside service checks every 5 minutes.

1. Sign up at **https://uptimerobot.com** (free plan).
2. Click **New monitor** (or **+ Add New Monitor**).
3. **Monitor type:** **HTTP(s)**.
4. **URL:** `https://bdubetest.vercel.app/api/health` (also shown on the dashboard's **Site health** page with a **Copy** button).
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

**Buy it.** Easiest: in Vercel (project **bdtest** › **Settings** › **Domains** › **Buy**). DNS is then done for you. Or buy at Namecheap, Cloudflare, Squarespace Domains or GoDaddy.

1. **Point it at the shop.** Vercel › **bdtest** › **Settings** › **Domains** › **Add Existing** › type `yourshop.com` › **Add**. Accept adding `www.yourshop.com` too (redirect one to the other).
   - If you bought it in Vercel: nothing else to do.
   - If you bought it elsewhere: Vercel shows the exact records to add. Usually an **A** record for `yourshop.com` and a **CNAME** for `www`, with values Vercel shows for this project. Log in to where you bought the domain › **DNS** / **DNS records** › add them exactly as shown. It turns green in minutes to a few hours.
2. **Tell the shop its new address.** Vercel › **bdtest** › **Settings** › **Environment Variables** › **NEXT_PUBLIC_SITE_URL** › **⋯ Edit** › `https://yourshop.com` › **Save**, then **Deployments** › **⋯** › **Redeploy**.
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

## Part 8: Moving everything onto the owner's own accounts (when ready)

Until then, the shop runs on CAK3D's accounts and the owner runs everything from the dashboard. When it's time to fully own it, do these in order. Customers see no downtime.

**Needed from Part 1:** the **AUTH_SECRET** copy saved in the password manager. Without it, the stored customer details can't be read on the new account.

1. **Accounts:** the owner makes free accounts at **github.com**, **vercel.com** (choose **Continue with GitHub**) and **supabase.com**.
2. **Database (Supabase).** The owner, in Supabase: his organization › **Team** › invite CAK3D's email as **Owner**. CAK3D accepts. Then CAK3D: project **Dube Family Creations** › **Project Settings** › **General** › **Transfer project** › pick the owner's organization › **Transfer Project**. The data, address and keys stay the same.
3. **Files (GitHub).** CAK3D: repository **bdubetest** › **Settings** › **Danger Zone** › **Transfer** › **Specify an organization or username** › the owner's username › type `bdubetest` › **I understand, transfer this repository**. The owner accepts the email within a day.
4. **Website (Vercel).** The free plan can't move projects between people, so the owner sets up his own copy (10 minutes):
   1. Owner's Vercel › **Add New** › **Project** › **Import** `bdubetest`.
   2. Open **Environment Variables** and add (CAK3D's Vercel shows the names; take the values from the password manager or Supabase):
      - `AUTH_SECRET`: the saved copy (Secret)
      - `ADMIN_PASSWORD`: any starter password (Secret)
      - `SUPABASE_URL`: `https://pffizytlxaxskgyjrbgl.supabase.co`
      - `SUPABASE_SECRET_KEY`: from Supabase › **Project Settings** › **API Keys** (Secret)
      - `NEXT_PUBLIC_SITE_URL`: the shop's address
      - `CRON_SECRET`: any new long random text (Secret)
   3. **Deploy**. Sign in to the new address's `/admin`: everything is there.
   4. If there's a domain: remove it from CAK3D's project (**Settings** › **Domains** › **Remove**), add it to the new one (Part 7, step 1), then do Part 7, steps 2 and 3.
   5. Make a new GitHub token from the owner's account (Part 1, step 4, with the owner as **Resource owner**) and save it in **Accounts & keys**.
   6. CAK3D can then delete the old Vercel project.

---

## Where things are (quick reference)

| What | Where |
| --- | --- |
| Shop | https://bdubetest.vercel.app |
| Dashboard | https://bdubetest.vercel.app/admin |
| Health check address (for UptimeRobot) | https://bdubetest.vercel.app/api/health |
| Product list for Google / Facebook | https://bdubetest.vercel.app/feed.xml |
| Link-in-bio page | https://bdubetest.vercel.app/socials |
| Website hosting | Vercel › project `bdtest` |
| Files | GitHub › `real-CAK3D/bdubetest` |
| Database and photos | Supabase › project `Dube Family Creations` |
| Keys (Stripe, PayPal, Resend, GitHub, Shippo, AI) | Dashboard › **Accounts & keys** (stored encrypted) |
| Everything else (prices, words, tax, payments) | Dashboard |
