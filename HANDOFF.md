# Handing the shop over

This is the whole process for giving Dube Family Creations its own shop, owned outright by the new owner. Nothing is forked or copied: the GitHub repository moves to his account, and he connects his own Vercel, Supabase and Stripe.

- **Part 1** is for the person handing it over (about 10 minutes).
- **Part 2** is for the new owner, one service at a time (about an hour in total, mostly waiting on sign-ups).
- **Part 3** lists what the site does by itself, plus fixes if something doesn't turn green.

When it's done, he owns everything:

| Service | What it's for | Who owns it | Cost |
|---|---|---|---|
| GitHub | The site's files and its history | Him (transferred) | Free |
| Vercel | Runs the website | Him | Free (Hobby plan) |
| Supabase | Database and photo storage | Him (made through his Vercel) | Free plan is plenty |
| Stripe | Payments, Apple Pay, Google Pay | Him | No monthly fee; about 2.9% + 30¢ per sale |

All the words, products, prices, photos, designs and settings travel inside the repository (`site-variables.ts` and `public/images`). His new site starts out exactly like the current one, with nothing to re-enter.

---

## Part 1: For the person handing it over

### 1. Get his GitHub username
He signs up at github.com (Part 2, step 1) and sends you his **username**, not his email.

### 2. Transfer the repository to him
1. On GitHub, open **real-CAK3D/BDubeTest** and click **Settings** (the gear in the repository's top bar).
2. Stay on **General** and scroll all the way down to **Danger Zone**.
3. Click **Transfer**.
4. Under **New owner**, choose **Specify an organization or username** and type his username.
5. Type the repository name to confirm, then click **I understand, transfer this repository**.
6. GitHub emails him. **He has one day to accept**, or the transfer is cancelled and you can start again.

Good to know:
- Everything goes with it: files, history and settings. Old links to your copy redirect to his.
- He must **not** already have a repository with the same name (for example a fork), or GitHub refuses the transfer.
- After the transfer you lose access. If you want to keep helping, he can add you under **Settings > Collaborators > Add people**.
- The shop doesn't care which account owns it. It reads the owner and repository name from Vercel by itself.

### 3. Free up the web address
The address `bdubytest.vercel.app` belongs to your Vercel project. Once your project stops using it, he can claim it.

1. In Vercel, open your project, then **Settings > Domains**.
2. Click **⋯** next to `bdubytest.vercel.app`, then **Remove**.
3. After his site is working (Part 2, step 2), delete your project under **Settings > General**, at the bottom (**Delete Project**). The transferred repository is no longer linked to it anyway.

### 4. Optional
- Change the name in `LICENSE` to his, or to Dube Family Creations.
- Don't give him your dashboard password. He picks his own in Part 2.

---

## Part 2: For the new owner

Do these in order. When you reach step 3 you can log in to your dashboard, and its **Setup** page has the same list with checkmarks that turn green as each part starts working.

### Step 1: GitHub (your site's files), 5 minutes
1. Go to **github.com/signup** and create an account. Use the email you'll use for everything else.
2. Send your **username** to whoever built the site.
3. Watch your email for **"…has requested to transfer the repository…"** and click the link, then **Accept**. It must be accepted within a day.
4. The repository now shows under **Your repositories**. It's yours.

Optional: rename it under the repository's **Settings > General > Repository name** (for example `dube-family-creations`). Do this **before** step 2 if you want it.

### Step 2: Vercel (puts the site online), 10 minutes
1. Go to **vercel.com/signup** and choose **Continue with GitHub**. Approve the access it asks for.
2. Click **Add New… > Project**.
3. Find your repository in the list and click **Import**.
   - Not in the list? Click **Adjust GitHub App Permissions**, allow the repository, and come back.
4. Leave every setting as it is. The framework is found automatically.
5. Open **Environment Variables** and add these two:

   | Name | Value |
   |---|---|
   | `ADMIN_PASSWORD` | The dashboard password. Use `bdube123` for now; change it any time in **Settings > Password & security**. |
   | `AUTH_SECRET` | 40 or more random characters. Mash the keyboard; you'll never type it again. **Never change it once you have real orders**: customer details are stored encrypted with it. |

6. Click **Deploy** and wait about two minutes.
7. Choose your web address: open the project's **Settings > Domains**, click **Add Domain**, and type the name you want ending in `.vercel.app`, for example `bdubytest.vercel.app` once Part 1, step 3 has freed it up. Vercel tells you right away if a name is taken.

> Want your own domain like `dubefamilycreations.com`? On the same **Domains** page, click **Buy** (about $12 a year) or **Add** one you already own. Vercel walks you through it.

### Step 3: Log in to your dashboard, 1 minute
1. Open your web address with `/admin` on the end, for example `https://bdubytest.vercel.app/admin`.
2. Type your name (so you can tell your phones apart later) and the password (`bdube123` for now).
3. Change the password in **Settings > Password & security**. Your wife signs in with the same password on her phone; both of you can be signed in at once.
4. On your iPhone, open the same address in **Safari** and tap **Share > Add to Home Screen**. It becomes an app called Shop HQ.
5. Optional but recommended: in **Settings > Password & security**, turn on the **lock screen** (a 4-digit PIN asked for before the password).

Hidden way in from the shop: tap the **version and build number** at the very bottom of any page **7 times** in a row. There's no visible login link, so customers never see one.

### Step 4: Supabase (database and photo storage), 5 minutes
This is what makes your changes, orders and photos permanent. Until it's done, edits can disappear when Vercel restarts.

1. In Vercel, open your project and click the **Storage** tab.
2. Click **Create Database**, choose **Supabase**, and click **Continue**.
3. Accept the terms, pick the **free plan** and the **region closest to you**, and create it.
4. When it asks which project to connect, choose your shop. Keep **all environments** ticked and click **Connect**.
5. Go to **Deployments**, click **⋯** on the newest one, then **Redeploy**.
6. Open your dashboard's **Setup** page. **Database** and **Photos** turn green.

**You don't need to make any tables.** The site creates its table, its counters and its photo folder by itself the first time it runs. It then fills them with your products, words and settings from `site-variables.ts`.

If the Setup page ever says the table couldn't be made, use the backup: open Supabase (Vercel > Storage > your database > **Open in Supabase**), go to **SQL Editor**, paste all of [`supabase/schema.sql`](supabase/schema.sql), and press **Run**.

### Step 5: Stripe (payments, Apple Pay, Google Pay), 10 minutes
1. Go to **dashboard.stripe.com/register** and create an account.
2. Make sure **Test mode** is on (top right) for now.
3. Go to **Developers > API keys**, click **Reveal** next to **Secret key** (it starts with `sk_test_`) and copy it.
4. In your dashboard, open **Keys**, paste it into **Stripe secret key** and press **Save**.

That's all for connecting. Saving the key does the rest by itself:
- checks the key with Stripe,
- pulls in any products you made in Stripe,
- connects the **webhook**, so orders and refunds appear in your dashboard and on your phone the moment they happen.

Then, in Stripe:

5. **Settings > Payments > Payment methods**: make sure **Cards**, **Apple Pay** and **Google Pay** are on. (No Apple account or domain verification is needed, because checkout happens on Stripe's page.)
6. **Settings > Customer emails**: turn on **Successful payments**, so customers get a receipt.
7. **Settings > Business > Public details** and **Branding**: your business name, support email, logo and colors for the checkout page.

> **You don't have to list your items in Stripe.** Items live in your dashboard (**Products**), and checkout charges the right price for each size and design. Stripe products are optional. Anything you do make in Stripe (**Product catalog > Add product**) shows up in the shop automatically.

### Step 6: Save dashboard edits to GitHub, 5 minutes
Your edits show on the site right away. With this token, every change is also written to `site-variables.ts` on GitHub, so GitHub always has the latest version and its history.

1. On GitHub, click your picture > **Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token** (or go to **github.com/settings/personal-access-tokens/new**).
2. Name it `Shop dashboard` and set an expiration (1 year is fine).
3. **Repository access**: choose **Only select repositories** and pick the shop's repository.
4. **Permissions > Repository permissions > Contents**: set it to **Read and write**.
5. Click **Generate token** and copy it. You won't see it again.
6. In your dashboard, open **Keys**, paste it into **GitHub token** and press **Save**.
7. Open **Settings > Accounts & links** and press **Save to GitHub now**. From then on it happens after every save.

When the token expires, make a new one the same way and press **Replace** on the Keys page.

### Step 7: Phone notifications, 2 minutes
1. Open **Shop HQ** from your iPhone home screen (step 3). It has to be the home-screen app, not a Safari tab.
2. Go to **Settings**, tap **Turn on notifications** and allow them.
3. Tap **Send a test**.

The notification keys are made automatically. You get a ping for each order, custom request, review and low-stock item.

### Step 8: Fill in your business details, 15 minutes
Things only you know:

| Where in the dashboard | What |
|---|---|
| **Settings > Store** | Your **ship-from ZIP** and shipping prices by distance; turn **local pickup** on or off |
| **Products** | Prices for the hidden items (custom tumbler sizes, signs, leather, slate), then switch them on |
| **Designs** | Replace the 8 starter designs with your own artwork; tick which items and sizes each one fits |
| **Words & logos > Contact page** | Your public email (and phone, if you want) |
| **Words & logos > About page** | Your story |
| **Words & logos > Policies** | Read each policy and set **State whose laws apply** |
| **Look & layout** | Theme, layout, and the **Watermark** if you want one on your photos |

### Step 9: Place a test order, 3 minutes
1. Open your shop, add something to the cart, enter a ZIP and check out.
2. Pay with card `4242 4242 4242 4242`, any future date, any 3-digit code.
3. You should land on the thank-you page, see the order under **Orders**, and get a notification.
4. Mark the test order **Cancelled** so it stays out of your totals.

### Step 10: Go live, 15 minutes
1. In Stripe, click **Activate payments** and enter your business and bank details.
2. Switch **Test mode** off, go to **Developers > API keys** and copy the **live** secret key (`sk_live_`).
3. In your dashboard's **Keys**, press **Replace** on **Stripe secret key**, paste it and **Save**. The live webhook connects by itself.
4. Share your link.

### Optional extras (any time)
- **Shipping labels from an order:** a free Shippo account; see Help > Shipping labels.
- **Discounts:** codes, the military discount, bulk pricing, gift cards and cart reminders are all on the **Discounts** page.
- **Blanks:** count your plain stock on the **Blanks** page and link it to item sizes.
- **Shipped emails with tracking links:** **Setup > Tracking emails** (a free Resend account).
- **Sales tax:** turn on Stripe Tax in Stripe (**Settings > Tax**), then **Settings > Checkout & emails** in your dashboard. Check your state's seller's permit rules.
- **Facebook / Instagram Shop and Google Shopping:** **Setup > List your items**. Your shop already publishes the product list they need at `/feed.xml`.
- **Your own domain:** see the box in step 2.

---

## Part 3: What runs by itself, and fixes

### Automatic, nothing to do
- **Database table, counters and photo folder** are created on the first visit after Supabase is connected.
- **Products, words, photos, designs and settings** are loaded from `site-variables.ts` into the new database.
- **Repository and Vercel project** are detected from Vercel, so links and GitHub saves point at your copy.
- **Stripe products and webhook** are set up when you save your Stripe key (test or live).
- **Notification keys** are made the first time you open Settings.
- **Customer details** (orders, addresses, emails, phones, messages, requests) are stored encrypted.
- **Every dashboard edit** goes live instantly and is saved to GitHub (once the token is in). Those saves don't trigger a rebuild.
- **Every change pushed to GitHub** is rebuilt and published by Vercel in about a minute.

### If something isn't green on the Setup page

| Problem | Fix |
|---|---|
| Can't log in at `/admin` | Check `ADMIN_PASSWORD` in Vercel (**Settings > Environment Variables**), then **Deployments > ⋯ > Redeploy**. Changes to variables only apply after a redeploy. Once the password has been changed in Settings, the Vercel one is no longer used. |
| "Too many wrong tries" | Wait 15 minutes; it unlocks by itself. |
| "Saved orders can't be unlocked" | `AUTH_SECRET` in Vercel was changed. Put the old value back and redeploy. |
| Database or Photos not green | Make sure step 4 ended with a **Redeploy**. Still red? Run `supabase/schema.sql` as described in step 4. |
| "Photo storage isn't connected yet" when uploading | Same as above: Supabase isn't connected or the site wasn't redeployed. |
| Stripe saved but the webhook isn't green | Open **Keys** from your live web address (not a preview link) and press **Connect Stripe webhook**. |
| Orders don't appear after paying | The webhook isn't connected for the mode you're in. Test and live each need it; saving each key connects it. |
| "Save to GitHub" says the token wasn't accepted | The token needs **Contents: Read and write** on this repository. Make a new one (step 6). |
| No phone notifications | Open the dashboard from the **home-screen app**, not Safari, and turn notifications on again in Settings. |
| The transfer email expired | Ask for the transfer again (Part 1, step 2). |

### Checklist
- [ ] GitHub account made and the repository transfer accepted
- [ ] Vercel project imported with `ADMIN_PASSWORD` and `AUTH_SECRET`
- [ ] Logged in at `/admin` and added Shop HQ to the home screen
- [ ] Supabase connected and redeployed (Database and Photos green)
- [ ] Stripe test key saved (Stripe and Webhook green)
- [ ] Apple Pay and Google Pay on, receipts on
- [ ] GitHub token saved and **Save to GitHub now** pressed
- [ ] Notifications on
- [ ] Ship-from ZIP, prices, contact email, story and legal state filled in
- [ ] Test order placed and cancelled
- [ ] Stripe activated and live key saved

The full guide to every dashboard page is in [GUIDE.md](GUIDE.md), and the **?** button in the dashboard opens the right part for whatever page you're on.
