# Shop guide

<!-- Generated from lib/help.ts by `npm run guide`. Edit that file, not this one. -->

How each part of the site works. The same guide is in the dashboard under the ? button.

## Contents

**Start here**

- [How it all fits together](#overview): The shop customers see, the dashboard you run it from, and the services behind them.
- [Setting everything up](#setup): GitHub, Vercel, Supabase and Stripe, step by step.
- [Put the dashboard on your iPhone](#phone-app): Install it like an app and get a buzz for every order.
- [First-day checklist](#first-steps): Make the site yours before sharing the link.

**Dashboard pages**

- [Dashboard](#dashboard): Sales, orders, profit and visitors.
- [Orders](#orders): Every paid order, where to ship it, and its status.
- [Products](#products): Add, edit, hide and price your items.
- [Designs (decals & engravings)](#designs): Your artwork library, and which items and sizes each design fits.
- [Money (income & expenses)](#money): What came in, what went out, and what you kept.
- [Customers](#customers): Who's buying, how often, and how much.
- [Words & logos](#words): Every word customers see, plus logos, photos, policies and extra pages.
- [Our work (gallery)](#gallery): Show off finished pieces with photos and a description.
- [Password, lock screen and signed-in devices](#security): Who can get in, and how your customers' details are kept private.
- [Live now](#live): How many people are on the shop this minute, and who's signed in to the dashboard.
- [Discounts, codes and gift cards](#discounts): Promo codes, sending them to customers, military and bulk discounts, gift cards, cart reminders.
- [Shipping labels](#labels): Buy and print postage from an order; the tracking number fills itself in.
- [Blanks (stock to engrave)](#blanks): Count the plain pieces you engrave and get warned before you run out.
- [Previews: design on a photo, 3D, scans and 360°](#previews): Extra ways for customers to see an item, set at the bottom of each item in Products.
- [Chat (Ask us)](#chat): A chat button on the shop that answers customers' questions from your own answers.
- [Live chat](#live-chat): Chat with customers on the shop yourself while you're available.
- [Seasonal banners](#seasonal): Holiday banners at the top of the shop that come and go by themselves.
- [What's to come](#coming-soon): Show customers what you're working on and find out what they want most.
- [Team chat](#team-chat): Message each other inside the dashboard.
- [Hide instead of delete](#hiding): Take text, steps, photos, links or chat answers off the shop without losing them.
- [Links (Facebook, Instagram, phone...)](#links): Your social pages and contact links, each with its own icon.
- [Order codes, QR codes, packing slips and labels](#codes): One code per order that ties the receipt, packing slip and box together.
- [Insights (charts)](#insights): Charts of sales, what's selling, busy hours and where orders ship.
- [Watermark](#watermark): Stamp your name or logo on shop photos, on or off at any time.
- [Advertising and getting found](#advertising): Facebook and Instagram Shop, Google free listings, sharing.
- [Pages & menu](#pages): Add, remove, rename and order the shop's pages.
- [Customize dashboard](#customize): Colors, dark mode, home screen sections, menu order and the phone's bottom bar.
- [Custom order requests](#requests): The request form, quoting a price, and saying no politely.
- [Reviews](#reviews): Customer reviews with photos. You approve each one.
- [Look & layout](#look): Themes and page layouts, with a live preview.
- [Settings](#settings): Store options, checkout, notifications, password and your accounts.
- [Accounts & keys](#keys): One spot for every service: sign-in links, API keys, saved logins and your own links.
- [Inbox](#inbox): Messages from your shop's contact form.
- [Discounts](#discounts): Coupons and promo codes, made in Stripe.
- [Notifications](#notifications): New orders, refunds and low stock.

**GitHub**

- [The backup file on GitHub](#site-variables): A copy of every word, price, product and setting, with history.
- [Code edit points](#edit-points): Labeled spots in the code for bigger changes.

**Payments & services**

- [Payments: Stripe, Apple Pay, Google Pay](#payments): How customers pay and how you get paid.
- [Selling items made in Stripe](#stripe-products): Make products in Stripe and they appear in the shop.
- [GitHub, Vercel and storage](#services): Where the site lives and where your data is kept.
- [What customers see](#customer-view): A walk through the shop from a customer's side.

**Troubleshooting**

- [Common problems](#faq): Quick fixes for things that go sideways.

## Start here

<a id="overview"></a>
### How it all fits together

_The shop customers see, the dashboard you run it from, and the services behind them._

Your site has two sides:

- **The shop** (your web address, e.g. `yourshop.com`). What customers see: your items, your story and the checkout.
- **The dashboard** (`yourshop.com/admin`). Only you can get in, with your password. Customers never see it and nothing on the shop links to it.

It runs on a few outside services:

- **Stripe** takes payments (card, Apple Pay, Google Pay) and sends the money to your bank.
- **GitHub** stores the site's files, including `site-variables.ts`, the one file with all your words, prices and products.
- **Vercel** runs the website. When something changes on GitHub, Vercel updates the live site in about a minute.
- **Supabase** (connected through Vercel) is the database. It saves your orders, products, settings, messages and visitor counts, and stores the photos and logos you upload.

API keys for Stripe and any other service go on the **Keys** page. The **Setup** page walks through connecting everything, with a checkmark as each step is done.

> **Tip:** Everything you change in the dashboard shows on the shop right away. A backup copy is also saved to GitHub (see **The backup file on GitHub**).

<a id="setup"></a>
### Setting everything up

_GitHub, Vercel, Supabase and Stripe, step by step._

Open **Setup** in the menu. It lists every step in order (accounts, your own copy of the site, Supabase, Stripe, Apple Pay and Google Pay, notifications, going live) with exact clicks and links. Each step turns green on its own once it's done; refresh the page to re-check.

The same steps are in `SETUP.md` on GitHub, so you can follow along on another screen.

> **Tip:** The dashboard's **Finish setting up** box shows how many required steps are left and disappears when they're all done.

<a id="phone-app"></a>
### Put the dashboard on your iPhone

_Install it like an app and get a buzz for every order._

1. Open Safari and go to your site's address with `/admin` on the end. Log in.
2. Tap the **Share** button (square with an arrow), then **Add to Home Screen**, then **Add**.
3. Open the new **Shop HQ** icon from your home screen.
4. Go to **Settings** and tap **Turn on notifications**, then **Allow**.
5. Tap **Send a test** to make sure it works.

You stay logged in for 60 days. On Android, Chrome offers **Install app** from its menu, and notifications work the same way.

> **Tip:** iPhones only allow notifications from the home-screen app, not from a Safari tab, and need iOS 16.4 or newer.

<a id="first-steps"></a>
### First-day checklist

_Make the site yours before sharing the link._

1. **Words & logos**: set your business name, headline, about story and service line. Upload your logo.
2. **Products**: delete the three sample items and add your real ones with photos.
3. **Look & layout**: pick a theme and page layout.
4. **Setup**: work through anything not green yet, especially Stripe and Supabase.
5. **Settings**: check shipping prices and your checkout options.
6. Place a test order (see **Payments**) and watch it arrive in **Orders**.

## Dashboard pages

<a id="dashboard"></a>
### Dashboard

_Sales, orders, profit and visitors._

Pick **7 days**, **30 days**, **90 days** or **1 yr** at the top to change the time period for everything on the page.

- **Sales**: money from paid orders (refunds left out).
- **Orders**: how many orders came in.
- **Profit after expenses**: sales minus the expenses you logged under **Money**.
- **Visitors**: people who opened the shop (each person counts once a day). The line under it shows how many visitors bought something.
- **Charts**: sales and visitors per day. Hover over or tap a bar to see its number. **Show as table** lists the numbers.
- **Best sellers**, **Most viewed** and **Where visitors came from** (e.g. facebook.com) help you see what's working.

Boxes under the totals flag things that need you: orders waiting to ship and items that are low or sold out. Tap one to go there.

> **Tip:** **Finish setting up** shows what's left to connect. Tap a line to jump to that step. It disappears once everything is done.

<a id="orders"></a>
### Orders

_Every paid order, where to ship it, and its status._

Orders show up here automatically when a customer pays. Tap one to open it.

- **Items**, **shipping cost** and how they paid (Apple Pay, Google Pay or card).
- **Ship to**: the customer's name and address. Tap their email or phone to contact them.
- **Status**: **To ship**, then **Shipped**, then **Delivered**. Mark **Refunded** or **Cancelled** if needed. Refunds made in Stripe update here on their own.
- **Private note**: tracking numbers, engraving text, anything to remember. Customers never see it. It saves when you tap outside the box.
- **Open in Stripe**: the payment in your Stripe account, where you can issue a refund.

#### Shipping an order

1. Buy and print the label wherever you like (Pirate Ship, USPS, UPS...).
2. Open the order. Any engraving text is highlighted in yellow under the item, exactly as the customer typed it; copy it straight into your engraving software.
3. Choose the **Carrier** and paste the **Tracking number**.
4. Tap **Mark shipped & email customer**. The customer gets an email with a tracking link. Without email set up, the button opens your own mail app with the message written for you.

The filter buttons at the top show only orders waiting to ship, shipped, or delivered. **Download spreadsheet** saves every order for your records or taxes. Discounts, promo codes and sales tax show on each order when used.

> **Tip:** Customers get their payment receipt from Stripe (turn it on in Stripe > Settings > Customer emails). Changing a status by itself doesn't email anyone; the ship button does.

<a id="products"></a>
### Products

_Add, edit, hide and price your items._

Tap **Add item**, or tap an existing item to edit it. The switch on the right of each item shows or hides it in the shop instantly.

#### Fields

- **Name** and **Price**. **Was price** is optional: fill it in higher than the price to show a sale.
- **Short description**: one line shown on the shop page. **Full description**: shown on the item's own page. Leave a blank line between paragraphs.
- **Category**: pick from your list (Drinkware, Home decor...) or choose **+ New category**. The **Categories** button at the top of Products renames, removes and orders them; the shop shows them in that order.
- **Photos**: tap **Add photos**. Big phone photos are shrunk automatically. The first photo (gold outline) is the cover; use the arrows to reorder.
- **Stock**: how many you have. Leave it empty for unlimited. It goes down by itself when someone buys. **Made to order** shows that label instead.
- **Sizes**: give each size its own price (16 oz $30, 40 oz $45). Tap **Tumbler sizes** to fill in the usual ones. The shop shows "From" the lowest price.
- **Customers' own artwork**: under Designs, tick **Customers can upload their own logo or artwork** and set an extra charge if you like. Their file shows on the order with a download link.
- **Designs**: tick **Customers pick a decal or engraving**, then for each size tap the designs from your library that fit it. Customers pick a size first and only see the designs that fit that size. **Same as 20 oz** copies the list from the size above.
- **Other choice**: one more pick-list, like Color with Black, Brown, Natural.
- **Personalization**: turn on to give customers a box for engraving text (a name, date, unit or message). Set the label, the most characters, and whether it's required.
- **Show in the shop** and **Feature at the top**.

#### Items from Stripe

Products you make in Stripe show up here on their own, marked **From Stripe**. Change their name, price, description and photos in Stripe. Stock, category, choices and featured can be set in either place. **Sync from Stripe** pulls everything again if something looks out of date. See **Selling items made in Stripe**.

> **Tip:** Hiding an item is safer than deleting it: you keep the details for later.

<a id="designs"></a>
### Designs (decals & engravings)

_Your artwork library, and which items and sizes each design fits._

Every decal or engraving you offer lives here once, and you choose which items and sizes it fits. Not every design fits every product, so a 40 oz tumbler might offer 2 designs while a 16 oz offers 10.

1. Tap **Add designs** and pick one or more images from your phone. PNGs with a see-through background look best.
2. Tap a design to name it, put it in a **group** (Military, Patriotic, Police, Family...) and set an **extra charge** if it costs more.
3. Add **Laser notes** if you like: size, power and speed, file name. Only you see them.
4. Under **Fits on**, tick each item and size it fits (**All sizes** does every size of that item at once).
5. Tap **Save changes**.

You can also set this from the other side: open an item in **Products** and tap the designs for each size. Untick **Offer this design** to hide one everywhere without deleting it.

When someone orders with a design, the order shows that design's picture, your laser notes and a **Download artwork** link, so you know exactly what to engrave.

> **Tip:** The 8 starter designs are simple placeholders. Replace them with your own artwork, or delete them.

<a id="money"></a>
### Money (income & expenses)

_What came in, what went out, and what you kept._

**Income** is your paid, shipped and delivered orders. **Expenses** are what you log here. **Profit** and **Margin** are worked out for you.

1. Under **Log an expense**, pick the date, type what it was for, choose a category and enter the amount.
2. Tap **Add expense**. It shows in the totals and charts right away.

**Sales spreadsheet** and **Expenses spreadsheet** download everything for your tax preparer.

> **Tip:** Stripe keeps a small fee from each payment. It's listed in your Stripe dashboard. Log it here under **Fees** if you want it counted in profit. Keep receipts for taxes; this page is a helper, not an accountant.

<a id="customers"></a>
### Customers

_Who's buying, how often, and how much._

Everyone who has placed an order, with their total spent and last order date. **Came back for more** counts repeat customers. Tap an email to write to them.

**Email sign-ups** lists people who asked for updates from your shop's footer. **Download list** saves it for an email tool like Mailchimp or Kit. **Download spreadsheet** saves your customer list.

<a id="words"></a>
### Words & logos

_Every word customers see, plus logos, photos, policies and extra pages._

Everything written on the shop can be changed here, split into tabs:

- **Home page**: business name, top banner, headline, intro, the button labels, section headings, and the custom order steps (Workshop layout).
- **About page**: your story, service line and the veteran badge. The first paragraph also shows on the home page.
- **Contact page**: heading, intro, email, phone, location and social links (the Facebook group is already linked).
- **Logos & photos**: main logo, the round patch, the browser tab icon, the big welcome photo and an about photo. Tap the box to take a picture or pick one from your phone.
- **Reviews**: turn the reviews section on or off and change its words.
- **Policies & footer**: shipping, returns, custom & engraved orders, privacy, terms of service and disclaimer, each its own page linked in the footer, plus the small print under the copyright.
- **Pages**: a shortcut to **Pages & menu**, where you add your own pages (FAQ, events, care instructions) and set the menu.

Tap **Save changes** at the bottom when you're done. Changes show on the site right away, and are also saved to GitHub if that's set up.

> **Tip:** Policies are plain starting points, not legal advice. {business}, {email} and {state} fill in automatically.

<a id="gallery"></a>
### Our work (gallery)

_Show off finished pieces with photos and a description._

"Our work" is for pieces you want people to see, whether or not they're for sale: custom orders, one-offs, new materials you're testing.

1. Tap **Add a piece**.
2. Give it a title and a kind (Tumblers, Signs, Leather...), and write a few lines about it.
3. Tap **Add photos** and take pictures or pick several from your phone. The first one is the cover; use the arrows to reorder.
4. Leave **In the rotating showcase** ticked to have it spin in the 3D showcase on the home page.
5. If it's for sale, link it to the shop item. Otherwise customers get an **Order one like this** button that opens the contact form with the piece already mentioned.
6. Tap **Save changes**.

> **Tip:** Use the up and down arrows on the list to choose the order pieces appear in.

<a id="security"></a>
### Password, lock screen and signed-in devices

_Who can get in, and how your customers' details are kept private._

#### Getting in

There's no login link on the shop. Tap the **version number** at the very bottom of any page **15 times** quickly (no more than a second or so between taps; nothing on screen counts), or go to your address with `/admin` on the end. The Shop HQ app on your home screen opens straight in. Once you're signed in on a phone, the shop shows you (and only you) a **Shop HQ** button in the corner to jump back to the dashboard, and an edit shortcut for the page you're on; the shop icon in the dashboard's top bar goes the other way.

#### Your own password

The first time each of you signs in, type **your name** and the **starter password** (`bdube123` until you change it). The dashboard then asks you to **choose your own password** (and an email, for resets). From then on you sign in with your name and your own password; your wife does the same with hers.

**Settings > Password & security** lists everyone who can sign in. **Reset** makes that person use the starter password again next time (handy if your wife forgets hers); **Remove** takes them off. The **starter password** can be changed there too.

#### Forgot your password?

Tap **Forgot your password?** on the sign-in page. If you saved an email, a reset link is emailed (needs Resend on Accounts & keys) and works for 30 minutes. No email? Use the **reset code** instead: that's the `OWNER_RESET_CODE` variable in Vercel, if you added one. Or simply ask the other person to tap **Reset** next to your name.

#### Lock screen (optional)

Turn on a **4-digit PIN** or a **passcode** that has to be entered before the password box even shows. Five wrong tries lock it for 15 minutes; the same goes for the password. Forgot the PIN? Anyone still signed in can turn it off there.

#### Signed-in devices

Every phone and computer that's signed in is listed with when it was last used. Lost a phone? Tap **Sign out** next to it and it needs the password again straight away.

#### Your customers' privacy

- Orders, addresses, emails, phone numbers, messages, custom requests and sign-ups are stored **encrypted**. Even someone who got into the database would see scrambled text; only this website can read it, and only when you're signed in.
- Card numbers never touch the site at all: Stripe handles payment on its own page.
- The live visitor count uses a random number per browser tab, not names or IP addresses, and forgets it after 90 seconds.
- The Order status page only answers to the exact order number plus the email used, shows no prices, and locks out anyone guessing.

> **Tip:** Never change AUTH_SECRET in Vercel once you have real orders: it's the key the customer details are locked with.

<a id="live"></a>
### Live now

_How many people are on the shop this minute, and who's signed in to the dashboard._

The **Live now** box on the Dashboard updates every 20 seconds: how many shoppers are on the site and which pages they're looking at, plus who's signed in to the dashboard right now (for example you on your iPhone and your wife on hers). Move or hide it in **Customize dashboard**.

<a id="discounts"></a>
### Discounts, codes and gift cards

_Promo codes, sending them to customers, military and bulk discounts, gift cards, cart reminders._

#### Codes

**Make a code**: type one (like SPRING15) or leave it empty for a random one, choose % or $ off, and optionally a limit on uses, an end date, a smallest order, or first orders only. Customers type it on the checkout page. The switch turns a code off at any time.

**Send** emails a code to the customers you tick (everyone, past buyers, or picked people), one email each so nobody sees the others. Without email set up, it opens your own email app with them in BCC.

#### Deals (always on once switched on)

- **Thank-you code**: after each order the customer gets a one-time code for their next order, shown on their thank-you page.
- **Military & first responder**: adds a page where veterans, active duty, Guard/Reserve, police, firefighters and EMTs ask for the discount. You approve each one on the **Military** tab, which makes a personal code and emails it. Or choose **One shared code** to show a code to anyone who ticks the box.
- **Bulk pricing**: e.g. 10+ items 5% off, 25+ items 10% off. It comes off automatically in the cart and at checkout, and the item page mentions it.
- **Gift cards**: adds a Gift cards page. The buyer picks an amount and who it's for; once paid, a one-time code worth that amount is made and emailed to them. Make free ones for giveaways on the **Gift cards** tab.

#### Cart reminders

If someone types their email on the checkout page and leaves without paying, they get one email a few hours later with a link back to their cart. The **Cart reminders** tab lists them and marks the ones who came back and paid.

> **Tip:** Codes, gift cards and reminders need Stripe connected; emails need email set up (Setup > Tracking emails).

<a id="labels"></a>
### Shipping labels

_Buy and print postage from an order; the tracking number fills itself in._

1. Make a free account at goshippo.com and copy your API token (Settings > API). The test token makes practice labels.
2. Paste it on the **Keys** page under **Shippo API token**.
3. In **Settings > Store > Shipping labels**, enter your return address and the boxes you use (size and typical weight).
4. Open an order, pick the box, tap **Get postage prices**, choose one and tap **Buy label**. **Print label** opens a 4x6 PDF.
5. The carrier and tracking number are filled in; tap **Mark shipped & email customer**.

> **Tip:** Shippo charges the postage only, at discounted rates, with no monthly fee.

<a id="blanks"></a>
### Blanks (stock to engrave)

_Count the plain pieces you engrave and get warned before you run out._

On **Blanks**, add each kind you keep on the shelf (Stanley 40 oz black, slate coaster...) with how many you have, when to warn you, and what each costs. **+ Shipment** adds a delivery.

Then in **Products**, choose the blank next to each size (or for the whole item). Every sale takes one off the shelf, you get a notification when it runs low, and a size with none left shows as **Sold out** in the shop until you add more.

<a id="previews"></a>
### Previews: design on a photo, 3D, scans and 360°

_Extra ways for customers to see an item, set at the bottom of each item in Products._

Quickest way in: **3D & 360** in the dashboard menu lists every item and what it has; **Set up** opens that item's **Previews** section.

- **Design on a photo**: pick a photo of the plain item and drag across it where the design goes. Customers see the design they pick drawn on the photo.
- **3D model**: choose the closest shape (tumbler, mug, sign, round or square coaster, card holder) and a color. The site draws it in 3D wearing the chosen design, shown the way a laser mark looks on that material. Customers drag to turn it.
- **3D scan**: scan the real finished piece with a phone app (Polycam or KIRI Engine on iPhone and Android, Scaniverse on iPhone), export a .glb file and upload it. Customers can turn it and, on most phones, tap **View in your space** to see it on their own table.
- **360° spin**: tap **Take 360° photos with the camera**, prop the phone up, press Start and slowly turn the piece on a lazy Susan; the phone takes the photos (iPhone and Android). Customers drag to turn the real piece.

Each one you set up adds a tab above the item's photos. When a customer picks a design, the Preview or 3D tab opens on its own.

> **Tip:** Free 3D models of products are on Poly Pizza (free to use) and Sketchfab (check each model's license). A scan of your own finished piece shows the real thing, which sells best.

<a id="chat"></a>
### Chat (Ask us)

_A chat button on the shop that answers customers' questions from your own answers._

Customers tap **Ask us** in the corner of the shop and type a question. The chat answers from **your questions & answers** plus what the shop already knows (items, prices, shipping, discounts). It starts with 25 common questions filled in; change them to fit.

#### Adding an answer

1. Open **Chat** in the dashboard.
2. Tap **Add a question**, type the question how a customer would ask it, and your answer.
3. Save. The chat uses it straight away, even if the customer words the question differently.

Answers are filed under topics (Shipping & pickup, Orders & changes...) that fold open and closed. Change an answer's **Topic** box to move it, or type a new topic name to start a new group.

**What people asked** lists every question customers typed (just the question, no names). If one keeps coming up, tap **Answer this** to add it. If it's really a question you already answered in other words, pick it under **Same as…** and the chat learns that wording.

#### What the chat can do for customers

- **Look up an order**: they send the order number (or the code on their receipt) and the email they used, and the chat tells them its status and tracking. Both are needed, so nobody can look up someone else's order.
- **Quote shipping**: "how much to ship to 78701?" gets the same price the cart would charge.
- **Gift ideas**: "something for my dad under $50" suggests items in that price range.
- **Designs**: "do you have a flag design?" searches your design library and says which items offer it.
- **Your policies**: "can I return a personalized item?" quotes the right sentence from your policies.
- **Custom requests**: when someone wants something made, the chat offers to send it; it asks what they want, their name and email, and it lands in **Requests** with a phone ping.
- **Messages to you**: "can I talk to a real person?", something you don't carry, or any question it can't answer: it offers to pass the question on (they just add their email), and it lands in your **Inbox** to answer by email. If you're available, "talk to a person" starts a **live chat** instead.

#### The built-in meaning model (free)

A small model (about 23 MB) lives inside the website. It doesn't write anything; it just understands that "when will my stuff get here" means the same as "how long does shipping take", or that "it arrived broken" is your damaged-item answer, even with no words in common. No key, no outside service, no cost. It also groups questions the chat couldn't answer under **Suggestions** in **What people asked**, with a one-tap **Same as…** when one of your answers fits.

#### Without any AI (free, the default)

- Fixes typos ("shiping", "tumblr") and knows that ship / shipping / delivery mean the same.
- Answers from your items: prices, sizes, in stock or made to order, with a link ("how much is the 40 oz tumbler?").
- Follows up: after an item comes up, "how much is it?" or "is it in stock?" means that item.
- Knows your shipping, free-shipping amount, pickup, bulk savings, military discount, gift cards, payment and contact details from your settings.
- Answers two questions in one message, and offers "Were you asking…" choices when it isn't sure.
- Use **Other ways people ask it** under any answer to teach it new wordings.

#### With an AI (optional)

In **Chat > Settings & try it**, tick **Let an AI write the replies** and pick a service: Anthropic (Claude), OpenAI, Google Gemini, Groq, OpenRouter, Ollama Cloud, **Ollama on your own computer** (free, but the computer must be on and reachable from the internet), or any other OpenAI-compatible service. Paste that service's key on **Accounts & keys** (AI key for the chat). The AI only uses your answers and shop facts, and if it ever fails the chat answers on its own. **Try it** shows which one answered.

> **Tip:** Hide an answer (the switch) instead of deleting it if it's only out of date for now, like a holiday shipping note.

<a id="live-chat"></a>
### Live chat

_Chat with customers on the shop yourself while you're available._

The **Live** switch in the dashboard's top bar decides whether customers can reach you. While it's on (a slow red pulse) **and** a dashboard page is open on your screen, the shop's chat button shows a red pulse and **Live chat**, and the chat window says who's here with a **Talk to a person** button. Asking the chat helper for a real person starts a live chat too.

1. A customer starts a chat: your phone gets a notification and a box pops up in the dashboard.
2. Tap **Answer** (or open **Live chat** in the menu). You'll see what they asked the chat helper first.
3. Type your reply. Their messages appear within a couple of seconds.
4. **End chat** when you're done. **Save to Inbox** keeps a copy with your messages.

#### Two of you signed in

Both of you get the pop-up when a customer starts a chat. Whoever starts typing a reply first gets it: the other one's pop-up goes away and the chat shows **Brandon has it** (or whoever), so nobody answers twice. The customer sees "Brandon is typing…". To step in anyway, open the chat and tap **Take over**.

Switch to **Away**, lock your phone, or close the dashboard and live chat turns off within about a minute; the chat helper answers as usual. If nobody joins a chat within 90 seconds, the customer is asked for their email and the message lands in your **Inbox**.

> **Tip:** Don't want live chat at all? Untick it in **Chat > Settings & try it**.

<a id="seasonal"></a>
### Seasonal banners

_Holiday banners at the top of the shop that come and go by themselves._

Every holiday is listed with its date this year, and when its banner will show. Flip the switch to turn one on or off. Each one shows for a few days before the holiday (you choose how many), then goes away by itself, every year. Holidays that move (Easter, Mother's Day, Thanksgiving...) are worked out automatically.

Tap **Edit** to change the message, the button (the shop, the military discount, gift cards...), the colors, and whether little stars or snowflakes drift across it. The preview shows exactly what customers will see. **Add your own** for anything else: a sale, a craft fair, your shop's anniversary.

While a holiday banner is showing it takes the place of your usual top message. If two overlap, the sooner holiday wins. Customers can close it with the ✕. Untick **Show holiday banners** to turn them all off at once.

> **Tip:** Military dates are in the list too: Armed Forces Day, the Army birthday, and the Military Police Corps birthday (Sept 26). Switch on the ones you want.

<a id="coming-soon"></a>
### What's to come

_Show customers what you're working on and find out what they want most._

Add new products or options you're working on: a name, a sentence about it, how far along it is (just an idea, in the works, coming soon), an optional date and an optional photo or sketch. The first three show on the home page; all of them are on the **What's to come** page (linked in the footer).

Customers tap **I want this** (counted once per phone) and can leave their email to hear when it's ready. You see the count and the emails on each item; **Email them all** opens an email to everyone waiting.

> **Tip:** When something's ready: add it in Products, email the people waiting, then hide or delete it here.

<a id="team-chat"></a>
### Team chat

_Message each other inside the dashboard._

A private chat for the people who run the shop; customers never see it. When one of you sends a message, the other's phone gets a notification (if notifications are on), and it pops up in their dashboard with a badge next to **Team chat** in the menu.

The quick buttons send common ones in one tap: "I've got it", "Can you take this one?", "On my way to the shop", "Order's packed and ready". The top of the page shows who's signed in right now.

<a id="hiding"></a>
### Hide instead of delete

_Take text, steps, photos, links or chat answers off the shop without losing them._

Most things have an **eye** or **Shown / Hidden** switch. Hidden things stay saved in the dashboard and in `site-variables.ts` but customers don't see them. Flip it back any time.

- **Words & logos**: the eye next to each text box.
- **How it works steps**: Hide next to a step.
- **Our work**: untick **Show on the shop**.
- **Links**: the eye next to a link.
- **Chat**: the switch next to an answer.

<a id="links"></a>
### Links (Facebook, Instagram, phone...)

_Your social pages and contact links, each with its own icon._

In **Words & logos > Links**, tap **Add link**, pick an icon (Facebook, Instagram, TikTok, YouTube, Google, Etsy, phone, text message, email, map, reviews, website...), and type the address. For **phone** and **text** just type the number; for **email** the address. Drag the arrows to reorder; the eye hides one.

They show in the shop's footer and anywhere you add a Links section.

<a id="codes"></a>
### Order codes, QR codes, packing slips and labels

_One code per order that ties the receipt, packing slip and box together._

Every order gets an **order code** like `DFC1042-7KQ3` (your initials, the order number, and 4 check letters so a typo can't open the wrong order). It's different from the **tracking number**, which comes from the post office.

- **Customer's receipt** (the thank-you page) shows the code as a **barcode**. They can also type it on **Order status**.
- **Packing slip** (button on each order): print it and put it in the box. It has the barcode and a **QR code**.
- **Scan** (dashboard menu): point the phone camera at the barcode or QR on a slip or receipt and that order opens, with its full **History**: paid, code used, label bought, tracking, shipped, refunds, and who did each.
- **Item labels**: print a QR + barcode sticker for each item and size, for your shelves or bags.

> **Tip:** The QR codes only hold a link into your dashboard, not the customer's details. A lost slip shows nothing to anyone who isn't signed in.

Real **UPC** barcodes (the ones stores scan) have to be bought from GS1 for each product; you don't need them to sell online. The Code 128 barcodes used here are free and work with any scanner.

<a id="insights"></a>
### Insights (charts)

_Charts of sales, what's selling, busy hours and where orders ship._

- **Sales over time**: pinch or drag to zoom. Green markers are your biggest orders, red are refunds. **Add a note** ("Craft fair", "Facebook post") and it shows on the chart so you can see what worked.
- **What's selling**: pie charts by category, design, payment type, or shipped vs pickup.
- **Best sellers**: the items sold most.
- **Busy days & hours**: when orders come in.
- **Where orders go**: a US map shaded by state with a dot for each town.

Tap the buttons at the top to show or hide each chart; the phone remembers your choice. Pick 7, 30, 90 or 365 days at the top right.

<a id="watermark"></a>
### Watermark

_Stamp your name or logo on shop photos, on or off at any time._

In **Look & layout > Watermark**, tick **Stamp a watermark on shop photos**. Choose the text (or leave it empty for your business name), whether to add your logo, where it goes (bottom corner, middle or all over), how strong and how big. The preview updates as you change it; tap **Save changes** to put it on the shop.

Your original photos are never changed, so switching it off brings the clean photos straight back. It covers item photos, and Our work and design artwork if you tick those. Your logo, banner and customers' review photos are never stamped, and the product list for Facebook and Google always uses clean photos.

<a id="advertising"></a>
### Advertising and getting found

_Facebook and Instagram Shop, Google free listings, sharing._

- **Product feed**: your shop publishes your items at /feed.xml. Connect it once to Facebook/Instagram (Commerce Manager) and Google (Merchant Center) and they stay up to date. See **Setup > List your items**.
- **Share buttons** on every item: customers send it to a friend, or post it to Facebook or Pinterest.
- **Google**: each item page tells search engines its price and stock, and the sitemap lists every page.
- **Reviews with photos** build trust. Text the review link (/review) to happy customers.

> **Tip:** Post finished pieces in your Facebook group with a link to the item. Items with a 3D view or a 360° spin are great to share.

<a id="pages"></a>
### Pages & menu

_Add, remove, rename and order the shop's pages._

- **Arrows** set the order of the top menu and the footer.
- Type over a name to rename it in the menu.
- **Top menu** and **Footer** choose where each link shows.
- The **switch** turns a page off: it leaves the menu and customers can't open it. Shop is always on.
- **Add a page** makes your own page (FAQ, events, care instructions); tap **Edit text** to write it.
- **Add a link** puts an outside link in the menu, like your Facebook group or Etsy shop.

Tap **Save changes** when done. Policy pages (shipping, returns, privacy...) are edited in **Words & logos > Policies**.

<a id="customize"></a>
### Customize dashboard

_Colors, dark mode, home screen sections, menu order and the phone's bottom bar._

- **Look**: the name in the top bar, the main color, light or dark, spacing, text size, and which page opens after you log in.
- **Home screen**: turn sections of the Dashboard on or off and put them in order. **Quick links** adds your own buttons (the shop, Stripe, Pirate Ship...).
- **Menu**: the order of the side menu, hiding pages you don't use, and the 4 buttons in the phone's bottom bar.

These only change your dashboard, never the shop. **Reset to default** puts everything back. The shop icon in the top bar opens your shop in a new tab.

<a id="requests"></a>
### Custom order requests

_The request form, quoting a price, and saying no politely._

Customers fill in the **Custom orders** form: what they want, how many, engraving text, a needed-by date, a budget and up to 3 reference photos. Each one lands on the **Requests** page and sends you a notification.

- **Email a quote** opens your mail app with a reply already written. Fill in the price and time, then send. The request moves to **In progress**.
- **Politely decline** writes a friendly no, for jobs your equipment can't handle without major changes.
- **Private note**: what you quoted, materials, dates. Only you see it.
- When they agree to a price, make a product for it (it can be hidden, and you can send them its link) or send a payment link from Stripe. Mark the request **Done** when it's finished.

The heading, intro, the notice above the form, and the list of kinds of pieces are all in **Words & logos > Custom orders**. Turn the form off there to hide it from the menu.

> **Tip:** The notice tells customers up front that not every custom job can be accepted, and that large orders may be possible, so a no doesn't come as a surprise.

<a id="reviews"></a>
### Reviews

_Customer reviews with photos. You approve each one._

Customers tap **Leave a review** on the home page (or go to /review), pick 1 to 5 stars, write a few words and can add a photo. You get a notification.

- **Waiting**: new reviews. Nothing shows on the site until you tap **Approve**.
- **On the site**: approved reviews. **Pin to home page** to choose exactly which ones show there; otherwise the newest approved ones show.
- **Hidden**: ones you took down. You can approve them again later.

> **Tip:** Text a happy customer the link yourshop.com/review. A review with a photo of their piece is the best advertising there is.

<a id="look"></a>
### Look & layout

_Themes and page layouts, with a live preview._

Tap a **theme** (colors and fonts) and a **page layout**. The preview at the bottom updates. Customers keep seeing the old look until you tap **Save changes**.

#### Themes

- **Military**: Olive Drab, OCP Field, Dress Blues, Black & Gold (Army colors with stars), Desert Camo and Woodland Camo.
- **Police**: Military Police (MP green and gold with a black armband-style header), Thin Blue Line, and Night Patrol (dark).
- **USA & support**: Old Glory (flag navy and red), Americana (faded denim and barn red with stripes) and Yellow Ribbon (Support Our Troops yellow and navy).
- **Workshop**: Burnt Birch (plywood and laser-burn brown), Maple & Walnut, Etched Slate (slate and copper) and Brass & Leather.
- **Plain**: Clean Dispatch, for a modern look with no theme.

#### Layouts

- **Garrison**: big welcome with your patch, featured items and category tiles. The Shop page is a grid.
- **Field Manual**: a sidebar with your categories on every page.
- **Showroom**: full-width photo on top and large rows for each item. Upload a welcome photo for this one.
- **Quartermaster**: compact list with add-to-cart buttons. Best with lots of items.
- **Workshop**: a photo wall of your work and a "how custom orders work" section. Made for engraving and crafts.
- **Tribute**: centered and formal, with shadow-box frames. Suits memorial and honor pieces.

Every layout splits the shop into pages instead of one long scroll: a home page (welcome, featured items, categories, a short about), a **Shop** page with category tabs and page numbers, plus **About** and **Contact** pages.

<a id="settings"></a>
### Settings

_Store options, checkout, notifications, password and your accounts._

- **Store**: open or pause ordering (vacation, craft show), shipping by distance, free-shipping amount, local pickup, countries you ship to, and the low-stock alert level.
- **Checkout & emails**: promo codes on or off, sales tax by Stripe, the gift message box, the contact form, the email sign-up box, and the address tracking emails come from.
- **Notifications on this device**: turn on order alerts for the phone or computer you're using.
- **Accounts & links**: one-tap links to Stripe, Supabase, Vercel and GitHub, and **Save to GitHub now** with the time of the last save.
- **My links**: your own shortcuts (shipping labels, suppliers, your bank).
- **Password**: change your dashboard password.

Tap **Save changes** at the bottom after changing anything. API keys are on the **Keys** page.

#### Shipping by distance

1. Enter your **Ship-from ZIP** (where packages leave from).
2. Add a row for each distance band, like **Up to 50 miles: $6**, **Up to 250 miles: $9**. Use **Add a distance** for more rows.
3. Set the price for **Farther than that** (also used if a ZIP can't be found) and for **Outside the US**.
4. Customers type their ZIP in the cart and see their shipping price right away. The price is checked again at checkout, so it can't be changed in the browser.

Orders over the free-shipping amount ship free. **Local pickup** adds a pickup choice in the cart with no shipping charge; the note tells customers where and when. If the address entered at Stripe has a different ZIP than the one quoted, the order shows a warning so you can check the postage.

#### Getting to the dashboard

Go to your site address with `/admin` on the end, or tap the **version and build number** at the very bottom of any shop page 15 times quickly. There's no visible login link, so customers never find it. On a phone, add the dashboard to your home screen (see **The phone app**).

<a id="keys"></a>
### Accounts & keys

_One spot for every service: sign-in links, API keys, saved logins and your own links._

Each service (Stripe, Supabase, Vercel, GitHub, an AI service for the chat (optional), Shippo, Resend, Facebook and Google listings) has a card showing whether it's connected, links to sign in or make a key, and a box to paste the key.

- **Saved logins**: usernames and passwords for any site (supplier, Etsy, the laser's software...). Stored encrypted; the password only shows when you tap **Show**.
- **My links**: bookmarks to the pages you use (Stripe payouts, USPS pickup...).
- **Other keys**: any other service's key.

An API key is a long password that lets the shop talk to another service. Paste it in, press **Save**, and the site checks it before storing it encrypted. Nobody, including you, can read a saved key back; you can only replace or remove it.

- **Stripe secret key**: connects payments. Saving it also pulls in your Stripe products.
- **Connect Stripe webhook**: happens by itself when you save your Stripe key. The button is there to redo it if ever needed (for example after changing your web address).
- **Notification keys**: made automatically the first time you open Settings; **Create notification keys** remakes them if ever needed.
- **Resend API key** (optional): lets the site email tracking numbers.
- **Add another key**: for any other service you start using later.

> **Tip:** A key that says **Set in Vercel** is an environment variable in Vercel; those always win. Change them in Vercel > Settings > Environment Variables.

<a id="inbox"></a>
### Inbox

_Messages from your shop's contact form._

When a customer fills in the form on your shop's **Contact** page, the message lands here and you get a notification. Tap one to read it, and **Reply** to answer from your own email.

Turn the form on or off in **Settings > Checkout & emails**.

<a id="discounts"></a>
### Discounts

_Coupons and promo codes, made in Stripe._

1. Tap **Make a coupon in Stripe**.
2. Choose a percent or amount off and how long it lasts.
3. Under **Customer-facing codes**, add the code customers will type, like `VETERAN10`. You can limit how many times it's used or when it expires.
4. Share the code. Customers type it on the checkout page.

This page lists your codes, how many times each was used, and the total discounted. Each order shows the code that was used.

<a id="notifications"></a>
### Notifications

_New orders, refunds and low stock._

The bell at the top shows a gold number when something new happens. Everything is listed here even if phone notifications are off. Tap one to jump to the order or item.

To get them on your phone, see **Put the dashboard on your iPhone**.

## GitHub

<a id="site-variables"></a>
### The backup file on GitHub

_A copy of every word, price, product and setting, with history._

Once a GitHub token is added (Setup), every change you save in the dashboard is also written to `site-variables.ts` on GitHub. That gives you a full history of your shop's content, and it's what a brand-new copy of the shop starts from.

You never need to open it. If you do edit it by hand on GitHub, only the values you change are applied, and whichever was changed last (the file or the dashboard) wins. If the file has a mistake, Vercel won't publish it and the current site stays up.

<a id="edit-points"></a>
### Code edit points

_Labeled spots in the code for bigger changes._

For things the variables file can't do (new themes, menu links, checkout options), the code has labeled blocks that start with `EDIT-POINT:` and explain what to change. Search the repository on GitHub for `EDIT-POINT` to find them. `CUSTOMIZE.md` lists them all.

> **Tip:** Passwords and keys never go in any file. They live in Vercel > Settings > Environment Variables.

## Payments & services

<a id="payments"></a>
### Payments: Stripe, Apple Pay, Google Pay

_How customers pay and how you get paid._

When a customer taps **Check out**, they go to Stripe's secure payment page. Card, **Apple Pay** and **Google Pay** appear there automatically on phones and browsers that support them. Prices always come from your site, so nobody can change them in their cart.

Stripe sends the money to your bank on a regular schedule (see **Payouts** in Stripe) and keeps a small fee per payment.

#### Test before going live

1. While your Stripe key starts with `sk_test`, payments are pretend. Settings shows **Test mode**.
2. Buy something using card `4242 4242 4242 4242`, any future date and any 3-digit code.
3. Check that the order shows in **Orders** and you got a notification.
4. When ready, follow **Setup > Go live**: paste your live key (`sk_live…`) on **Keys** and press **Connect Stripe webhook** again.

#### Promo codes and sales tax

Customers can type promo codes made in Stripe (see **Discounts**). If you turn on **Sales tax by Stripe** in Settings, Stripe adds the right tax at checkout. Set up Stripe Tax first in Stripe > Settings > Tax.

#### Refunds

Open the order, tap **Open in Stripe**, and refund it there. The order here switches to **Refunded** by itself.

<a id="stripe-products"></a>
### Selling items made in Stripe

_Make products in Stripe and they appear in the shop._

1. In Stripe, go to **Product catalog > + Add product**.
2. Fill in the name, description and photos. Under pricing choose **One-off** and enter the price.
3. Optional: at the bottom, under **Metadata**, add extra details (below).
4. Save. The item appears in your shop within seconds (or press **Sync from Stripe** on Products).

#### Metadata you can add in Stripe

- `category`: e.g. Woodwork
- `summary`: the one line shown on the shop page
- `stock`: how many you have; the shop counts down as they sell
- `was_price`: a higher old price to show a sale, e.g. 45
- `featured`: true
- `made_to_order`: true
- `choice_label` and `choice_options`: e.g. Color and Black, Brown, Natural
- `engraving_label`, `engraving_max` and `engraving_required`: e.g. Name to engrave, 30 and true

Archiving or deleting a product in Stripe hides it in the shop. Past orders keep their details.

> **Tip:** Test-mode products and live-mode products are separate in Stripe. When you go live, make your products again in live mode.

<a id="services"></a>
### GitHub, Vercel and storage

_Where the site lives and where your data is kept._

- **GitHub** holds the site's files. Every change there makes Vercel publish a new version.
- **Vercel** hosts the site. **Deployments** shows each version; you can roll back to an earlier one. **Settings > Environment Variables** holds your password and keys.
- **Supabase** (Vercel > Storage) is the database and photo storage. The site creates its own table and photo folder the first time it runs. Open it from Vercel > Storage if you ever want to look inside.

> **Tip:** Your owner password is the `ADMIN_PASSWORD` setting in Vercel. To change it, edit it there and redeploy.

<a id="customer-view"></a>
### What customers see

_A walk through the shop from a customer's side._

1. The home page shows your banner, headline, patch or logo, featured items, categories and the start of your story, arranged by your chosen layout.
2. **Shop** lists everything for sale, with a tab for each category. **Our work** shows finished pieces with photos and descriptions. **About** has your full story and **Contact** has your details and the message form.
3. The footer links to the shipping, returns, custom orders, privacy, terms and disclaimer pages, your extra pages (like the FAQ) and the review form.
4. Tapping an item opens its page: photos, price, description, the choice list and quantity, and **Add to cart**.
5. The cart shows the subtotal, shipping, and how much more is needed for free shipping.
6. The cart asks for their ZIP to price shipping (or offers local pickup), and has an optional gift message at checkout.
7. **Check out** opens Stripe, where they enter shipping details and pay.
8. They land on a thank-you page with their order number, and Stripe emails a receipt.

**Custom orders** has the request form. **Order status** in the footer lets customers look up an order with their order number and email. The shop has a search box once there are more than 6 items.

There's no link to the dashboard on the shop. The hidden way in is tapping the version number at the bottom 15 times, and it still needs your password (and your PIN, if the lock screen is on). Search engines are told not to list it.

## Troubleshooting

<a id="faq"></a>
### Common problems

_Quick fixes for things that go sideways._

#### I changed site-variables.ts but the site didn't change

Give it a minute, then refresh. In Vercel > Deployments, check that the newest one says **Ready**. If it says **Error**, the file has a mistake: open the commit on GitHub and click **Revert**. The old site stays up meanwhile.

#### A customer paid but there's no order

Orders usually appear when the customer reaches the thank-you page. If they closed the page early, the Stripe webhook delivers it. Check **Setup > Webhook connected** is green; if not, press **Connect Stripe webhook** on **Keys**.

#### Phone notifications don't arrive

On iPhone they only work from the home-screen app (iOS 16.4+). Open it, go to **Settings**, and tap **Send a test**. If notifications are blocked, allow them in iPhone Settings > Notifications > Shop HQ. New orders still show under the bell either way.

#### Photo upload fails

Check that the database step on **Setup** is green (Supabase connected). Use JPG, PNG or WebP photos.

#### My changes disappear after a while

The database step on **Setup** needs to be green. If it says it's saving to this computer only, connect Supabase in Vercel > Storage and redeploy.

#### A product I made in Stripe isn't showing

It needs a **one-off** price in US dollars and must not be archived. Press **Sync from Stripe** on Products. If you're in Stripe test mode, make sure the site is using your test key too (and the same for live).

#### A key says "Needs re-entering"

The secret that protects saved keys changed (usually AUTH_SECRET was added or edited in Vercel). Paste the key in again on **Keys**.

#### My edit isn't on GitHub

Open **Settings > Accounts & links**. The GitHub box shows the last save and any error. Usually the token expired or doesn't have **Contents: Read and write**; make a new one (Setup > Save dashboard edits to GitHub) and paste it on **Keys**, then press **Save to GitHub now**.

#### I forgot my password

If you never changed it in Settings: in Vercel > your project > Settings > Environment Variables, edit `ADMIN_PASSWORD`, then redeploy (Deployments > ⋯ > Redeploy). If you changed it in Settings, open Supabase (Vercel > Storage > Open in Supabase) > Table Editor > `shop_kv`, delete the row named `ownerPassword`, and the Vercel password works again.

#### Checkout says it isn't switched on

The Stripe key is missing. Paste it on the **Keys** page.
