/*
 *  EDIT-POINT: HELP
 *  The owner's guide. This one file feeds both:
 *    - the Help page in the dashboard (the ? icon), and
 *    - GUIDE.md on GitHub (regenerate it with: npm run guide)
 *  "match" ties a topic to dashboard pages, so the ? icon opens the right one.
 *  Text supports **bold** and `code`.
 */

export type HelpBlock =
  | { p: string }
  | { list: string[] }
  | { steps: string[] }
  | { tip: string }
  | { h: string };

export type HelpTopic = { id: string; title: string; match?: string[]; summary: string; blocks: HelpBlock[] };
export type HelpGroup = { title: string; topics: HelpTopic[] };

export const HELP: HelpGroup[] = [
  {
    title: "Start here",
    topics: [
      {
        id: "overview",
        title: "How it all fits together",
        summary: "The shop customers see, the dashboard you run it from, and the services behind them.",
        blocks: [
          { p: "Your site has two sides:" },
          {
            list: [
              "**The shop** (your web address, e.g. `yourshop.com`). What customers see: your items, your story and the checkout.",
              "**The dashboard** (`yourshop.com/admin`). Only you can get in, with your password. Customers never see it and nothing on the shop links to it.",
            ],
          },
          { p: "It runs on a few outside services:" },
          {
            list: [
              "**Stripe** takes payments (card, Apple Pay, Google Pay) and sends the money to your bank.",
              "**GitHub** stores the site's files, including `site-variables.ts`, the one file with all your words, prices and products.",
              "**Vercel** runs the website. When something changes on GitHub, Vercel updates the live site in about a minute.",
              "**Supabase** (connected through Vercel) is the database. It saves your orders, products, settings, messages and visitor counts, and stores the photos and logos you upload.",
            ],
          },
          { p: "API keys for Stripe and any other service go on the **Keys** page. The **Setup** page walks through connecting everything, with a checkmark as each step is done." },
          { tip: "You can change most things two ways: in the dashboard, or by editing `site-variables.ts` on GitHub (handy with ChatGPT). See **Editing with ChatGPT**." },
        ],
      },
      {
        id: "setup",
        title: "Setting everything up",
        match: ["/admin/setup"],
        summary: "GitHub, Vercel, Supabase and Stripe, step by step.",
        blocks: [
          { p: "Open **Setup** in the menu. It lists every step in order (accounts, your own copy of the site, Supabase, Stripe, Apple Pay and Google Pay, notifications, going live) with exact clicks and links. Each step turns green on its own once it's done; refresh the page to re-check." },
          { p: "The same steps are in `SETUP.md` on GitHub, so you can follow along on another screen." },
          { tip: "The dashboard's **Finish setting up** box shows how many required steps are left and disappears when they're all done." },
        ],
      },
      {
        id: "phone-app",
        title: "Put the dashboard on your iPhone",
        match: ["/admin/more"],
        summary: "Install it like an app and get a buzz for every order.",
        blocks: [
          {
            steps: [
              "Open Safari and go to your site's address with `/admin` on the end. Log in.",
              "Tap the **Share** button (square with an arrow), then **Add to Home Screen**, then **Add**.",
              "Open the new **Shop HQ** icon from your home screen.",
              "Go to **Settings** and tap **Turn on notifications**, then **Allow**.",
              "Tap **Send a test** to make sure it works.",
            ],
          },
          { p: "You stay logged in for 60 days. On Android, Chrome offers **Install app** from its menu, and notifications work the same way." },
          { tip: "iPhones only allow notifications from the home-screen app, not from a Safari tab, and need iOS 16.4 or newer." },
        ],
      },
      {
        id: "first-steps",
        title: "First-day checklist",
        summary: "Make the site yours before sharing the link.",
        blocks: [
          {
            steps: [
              "**Words & logos**: set your business name, headline, about story and service line. Upload your logo.",
              "**Products**: delete the three sample items and add your real ones with photos.",
              "**Look & layout**: pick a theme and page layout.",
              "**Setup**: work through anything not green yet, especially Stripe and Supabase.",
              "**Settings**: check shipping prices and your checkout options.",
              "Place a test order (see **Payments**) and watch it arrive in **Orders**.",
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Dashboard pages",
    topics: [
      {
        id: "dashboard",
        title: "Dashboard",
        match: ["/admin"],
        summary: "Sales, orders, profit and visitors.",
        blocks: [
          { p: "Pick **7 days**, **30 days**, **90 days** or **1 yr** at the top to change the time period for everything on the page." },
          {
            list: [
              "**Sales**: money from paid orders (refunds left out).",
              "**Orders**: how many orders came in.",
              "**Profit after expenses**: sales minus the expenses you logged under **Money**.",
              "**Visitors**: people who opened the shop (each person counts once a day). The line under it shows how many visitors bought something.",
              "**Charts**: sales and visitors per day. Hover over or tap a bar to see its number. **Show as table** lists the numbers.",
              "**Best sellers**, **Most viewed** and **Where visitors came from** (e.g. facebook.com) help you see what's working.",
            ],
          },
          { p: "Boxes under the totals flag things that need you: orders waiting to ship and items that are low or sold out. Tap one to go there." },
          { tip: "**Finish setting up** shows what's left to connect. Tap a line to jump to that step. It disappears once everything is done." },
        ],
      },
      {
        id: "orders",
        title: "Orders",
        match: ["/admin/orders"],
        summary: "Every paid order, where to ship it, and its status.",
        blocks: [
          { p: "Orders show up here automatically when a customer pays. Tap one to open it." },
          {
            list: [
              "**Items**, **shipping cost** and how they paid (Apple Pay, Google Pay or card).",
              "**Ship to**: the customer's name and address. Tap their email or phone to contact them.",
              "**Status**: **To ship**, then **Shipped**, then **Delivered**. Mark **Refunded** or **Cancelled** if needed. Refunds made in Stripe update here on their own.",
              "**Private note**: tracking numbers, engraving text, anything to remember. Customers never see it. It saves when you tap outside the box.",
              "**Open in Stripe**: the payment in your Stripe account, where you can issue a refund.",
            ],
          },
          { h: "Shipping an order" },
          {
            steps: [
              "Buy and print the label wherever you like (Pirate Ship, USPS, UPS...).",
              "Open the order. Any engraving text is highlighted in yellow under the item, exactly as the customer typed it; copy it straight into your engraving software.",
              "Choose the **Carrier** and paste the **Tracking number**.",
              "Tap **Mark shipped & email customer**. The customer gets an email with a tracking link. Without email set up, the button opens your own mail app with the message written for you.",
            ],
          },
          { p: "The filter buttons at the top show only orders waiting to ship, shipped, or delivered. **Download spreadsheet** saves every order for your records or taxes. Discounts, promo codes and sales tax show on each order when used." },
          { tip: "Customers get their payment receipt from Stripe (turn it on in Stripe > Settings > Customer emails). Changing a status by itself doesn't email anyone; the ship button does." },
        ],
      },
      {
        id: "products",
        title: "Products",
        match: ["/admin/products"],
        summary: "Add, edit, hide and price your items.",
        blocks: [
          { p: "Tap **Add item**, or tap an existing item to edit it. The switch on the right of each item shows or hides it in the shop instantly." },
          { h: "Fields" },
          {
            list: [
              "**Name** and **Price**. **Was price** is optional: fill it in higher than the price to show a sale.",
              "**Short description**: one line shown on the shop page. **Full description**: shown on the item's own page. Leave a blank line between paragraphs.",
              "**Category**: items with the same category are grouped together in some layouts.",
              "**Photos**: tap **Add photos**. Big phone photos are shrunk automatically. The first photo (gold outline) is the cover; use the arrows to reorder.",
              "**Stock**: how many you have. Leave it empty for unlimited. It goes down by itself when someone buys. **Made to order** shows that label instead.",
              "**Choices**: one pick-list for customers, like Color with Black, Brown, Natural.",
              "**Personalization**: turn on to give customers a box for engraving text (a name, date, unit or message). Set the label, the most characters, and whether it's required.",
              "**Show in the shop** and **Feature at the top**.",
            ],
          },
          { h: "Items from Stripe" },
          { p: "Products you make in Stripe show up here on their own, marked **From Stripe**. Change their name, price, description and photos in Stripe. Stock, category, choices and featured can be set in either place. **Sync from Stripe** pulls everything again if something looks out of date. See **Selling items made in Stripe**." },
          { tip: "Hiding an item is safer than deleting it: you keep the details for later." },
        ],
      },
      {
        id: "money",
        title: "Money (income & expenses)",
        match: ["/admin/money"],
        summary: "What came in, what went out, and what you kept.",
        blocks: [
          { p: "**Income** is your paid, shipped and delivered orders. **Expenses** are what you log here. **Profit** and **Margin** are worked out for you." },
          {
            steps: [
              "Under **Log an expense**, pick the date, type what it was for, choose a category and enter the amount.",
              "Tap **Add expense**. It shows in the totals and charts right away.",
            ],
          },
          { p: "**Sales spreadsheet** and **Expenses spreadsheet** download everything for your tax preparer." },
          { tip: "Stripe keeps a small fee from each payment. It's listed in your Stripe dashboard. Log it here under **Fees** if you want it counted in profit. Keep receipts for taxes; this page is a helper, not an accountant." },
        ],
      },
      {
        id: "customers",
        title: "Customers",
        match: ["/admin/customers"],
        summary: "Who's buying, how often, and how much.",
        blocks: [
          { p: "Everyone who has placed an order, with their total spent and last order date. **Came back for more** counts repeat customers. Tap an email to write to them." },
          { p: "**Email sign-ups** lists people who asked for updates from your shop's footer. **Download list** saves it for an email tool like Mailchimp or Kit. **Download spreadsheet** saves your customer list." },
        ],
      },
      {
        id: "words",
        title: "Words & logos",
        match: ["/admin/content"],
        summary: "Every word customers see, plus logos, photos, policies and extra pages.",
        blocks: [
          { p: "Everything written on the shop can be changed here, split into tabs:" },
          {
            list: [
              "**Home page**: business name, top banner, headline, intro, the button labels, section headings, and the custom order steps (Workshop layout).",
              "**About page**: your story, service line and the veteran badge. The first paragraph also shows on the home page.",
              "**Contact page**: heading, intro, email, phone, location and social links (the Facebook group is already linked).",
              "**Logos & photos**: main logo, the round patch, the browser tab icon, the big welcome photo and an about photo. Tap the box to take a picture or pick one from your phone.",
              "**Reviews**: turn the reviews section on or off and change its words.",
              "**Policies & footer**: shipping, returns, custom & engraved orders, privacy, terms of service and disclaimer, each its own page linked in the footer, plus the small print under the copyright.",
              "**Pages**: add any other page, like the FAQ, events or care instructions.",
            ],
          },
          { p: "Tap **Save changes** at the bottom when you're done. Changes show on the site right away, and are also saved to GitHub if that's set up." },
          { tip: "Policies are plain starting points, not legal advice. {business}, {email} and {state} fill in automatically." },
        ],
      },
      {
        id: "gallery",
        title: "Our work (gallery)",
        match: ["/admin/gallery"],
        summary: "Show off finished pieces with photos and a description.",
        blocks: [
          { p: "\"Our work\" is for pieces you want people to see, whether or not they're for sale: custom orders, one-offs, new materials you're testing." },
          {
            steps: [
              "Tap **Add a piece**.",
              "Give it a title and a kind (Tumblers, Signs, Leather...), and write a few lines about it.",
              "Tap **Add photos** and take pictures or pick several from your phone. The first one is the cover; use the arrows to reorder.",
              "Leave **In the rotating showcase** ticked to have it spin in the 3D showcase on the home page.",
              "If it's for sale, link it to the shop item. Otherwise customers get an **Order one like this** button that opens the contact form with the piece already mentioned.",
              "Tap **Save changes**.",
            ],
          },
          { tip: "Use the up and down arrows on the list to choose the order pieces appear in." },
        ],
      },
      {
        id: "requests",
        title: "Custom order requests",
        match: ["/admin/requests"],
        summary: "The request form, quoting a price, and saying no politely.",
        blocks: [
          { p: "Customers fill in the **Custom orders** form: what they want, how many, engraving text, a needed-by date, a budget and up to 3 reference photos. Each one lands on the **Requests** page and sends you a notification." },
          {
            list: [
              "**Email a quote** opens your mail app with a reply already written. Fill in the price and time, then send. The request moves to **In progress**.",
              "**Politely decline** writes a friendly no, for jobs your equipment can't handle without major changes.",
              "**Private note**: what you quoted, materials, dates. Only you see it.",
              "When they agree to a price, make a product for it (it can be hidden, and you can send them its link) or send a payment link from Stripe. Mark the request **Done** when it's finished.",
            ],
          },
          { p: "The heading, intro, the notice above the form, and the list of kinds of pieces are all in **Words & logos > Custom orders**. Turn the form off there to hide it from the menu." },
          { tip: "The notice tells customers up front that not every custom job can be accepted, and that large orders may be possible, so a no doesn't come as a surprise." },
        ],
      },
      {
        id: "reviews",
        title: "Reviews",
        match: ["/admin/reviews"],
        summary: "Customer reviews with photos. You approve each one.",
        blocks: [
          { p: "Customers tap **Leave a review** on the home page (or go to /review), pick 1 to 5 stars, write a few words and can add a photo. You get a notification." },
          {
            list: [
              "**Waiting**: new reviews. Nothing shows on the site until you tap **Approve**.",
              "**On the site**: approved reviews. **Pin to home page** to choose exactly which ones show there; otherwise the newest approved ones show.",
              "**Hidden**: ones you took down. You can approve them again later.",
            ],
          },
          { tip: "Text a happy customer the link yourshop.com/review. A review with a photo of their piece is the best advertising there is." },
        ],
      },
      {
        id: "look",
        title: "Look & layout",
        match: ["/admin/appearance"],
        summary: "Themes and page layouts, with a live preview.",
        blocks: [
          { p: "Tap a **theme** (colors and fonts) and a **page layout**. The preview at the bottom updates. Customers keep seeing the old look until you tap **Save changes**." },
          { h: "Themes" },
          {
            list: [
              "**Military**: Olive Drab, OCP Field, Dress Blues, Black & Gold (Army colors with stars), Desert Camo and Woodland Camo.",
              "**Police**: Military Police (MP green and gold with a black armband-style header), Thin Blue Line, and Night Patrol (dark).",
              "**USA & support**: Old Glory (flag navy and red), Americana (faded denim and barn red with stripes) and Yellow Ribbon (Support Our Troops yellow and navy).",
              "**Workshop**: Burnt Birch (plywood and laser-burn brown), Maple & Walnut, Etched Slate (slate and copper) and Brass & Leather.",
              "**Plain**: Clean Dispatch, for a modern look with no theme.",
            ],
          },
          { h: "Layouts" },
          {
            list: [
              "**Garrison**: big welcome with your patch, featured items and category tiles. The Shop page is a grid.",
              "**Field Manual**: a sidebar with your categories on every page.",
              "**Showroom**: full-width photo on top and large rows for each item. Upload a welcome photo for this one.",
              "**Quartermaster**: compact list with add-to-cart buttons. Best with lots of items.",
              "**Workshop**: a photo wall of your work and a \"how custom orders work\" section. Made for engraving and crafts.",
              "**Tribute**: centered and formal, with shadow-box frames. Suits memorial and honor pieces.",
            ],
          },
          { p: "Every layout splits the shop into pages instead of one long scroll: a home page (welcome, featured items, categories, a short about), a **Shop** page with category tabs and page numbers, plus **About** and **Contact** pages." },
        ],
      },
      {
        id: "settings",
        title: "Settings",
        match: ["/admin/settings"],
        summary: "Store options, checkout, notifications, password and your accounts.",
        blocks: [
          {
            list: [
              "**Store**: open or pause ordering (vacation, craft show), shipping by distance, free-shipping amount, local pickup, countries you ship to, and the low-stock alert level.",
              "**Checkout & emails**: promo codes on or off, sales tax by Stripe, the gift message box, the contact form, the email sign-up box, and the address tracking emails come from.",
              "**Notifications on this device**: turn on order alerts for the phone or computer you're using.",
              "**Accounts & links**: one-tap links to Stripe, Supabase, Vercel and GitHub, and **Save to GitHub now** with the time of the last save.",
              "**My links**: your own shortcuts (shipping labels, suppliers, your bank).",
              "**Password**: change your dashboard password.",
            ],
          },
          { p: "Tap **Save changes** at the bottom after changing anything. API keys are on the **Keys** page." },
          { h: "Shipping by distance" },
          {
            steps: [
              "Enter your **Ship-from ZIP** (where packages leave from).",
              "Add a row for each distance band, like **Up to 50 miles: $6**, **Up to 250 miles: $9**. Use **Add a distance** for more rows.",
              "Set the price for **Farther than that** (also used if a ZIP can't be found) and for **Outside the US**.",
              "Customers type their ZIP in the cart and see their shipping price right away. The price is checked again at checkout, so it can't be changed in the browser.",
            ],
          },
          { p: "Orders over the free-shipping amount ship free. **Local pickup** adds a pickup choice in the cart with no shipping charge; the note tells customers where and when. If the address entered at Stripe has a different ZIP than the one quoted, the order shows a warning so you can check the postage." },
          { h: "Getting to the dashboard" },
          { p: "Go to your site address with `/admin` on the end, or tap the small **Owner login** link at the very bottom of any shop page. On a phone, add the dashboard to your home screen (see **The phone app**)." },
        ],
      },
      {
        id: "keys",
        title: "Keys",
        match: ["/admin/keys"],
        summary: "Where API keys for Stripe and other services go.",
        blocks: [
          { p: "An API key is a long password that lets the shop talk to another service. Paste it in, press **Save**, and the site checks it before storing it encrypted. Nobody, including you, can read a saved key back; you can only replace or remove it." },
          {
            list: [
              "**Stripe secret key**: connects payments. Saving it also pulls in your Stripe products.",
              "**Connect Stripe webhook**: one tap. Tells Stripe to send orders, refunds and product changes to your site instantly, and saves the webhook secret for you.",
              "**Create notification keys**: one tap. Needed for phone alerts.",
              "**Resend API key** (optional): lets the site email tracking numbers.",
              "**Add another key**: for any other service you start using later.",
            ],
          },
          { tip: "A key that says **Set in Vercel** is an environment variable in Vercel; those always win. Change them in Vercel > Settings > Environment Variables." },
        ],
      },
      {
        id: "inbox",
        title: "Inbox",
        match: ["/admin/inbox"],
        summary: "Messages from your shop's contact form.",
        blocks: [
          { p: "When a customer fills in the form on your shop's **Contact** page, the message lands here and you get a notification. Tap one to read it, and **Reply** to answer from your own email." },
          { p: "Turn the form on or off in **Settings > Checkout & emails**." },
        ],
      },
      {
        id: "discounts",
        title: "Discounts",
        match: ["/admin/discounts"],
        summary: "Coupons and promo codes, made in Stripe.",
        blocks: [
          {
            steps: [
              "Tap **Make a coupon in Stripe**.",
              "Choose a percent or amount off and how long it lasts.",
              "Under **Customer-facing codes**, add the code customers will type, like `VETERAN10`. You can limit how many times it's used or when it expires.",
              "Share the code. Customers type it on the checkout page.",
            ],
          },
          { p: "This page lists your codes, how many times each was used, and the total discounted. Each order shows the code that was used." },
        ],
      },
      {
        id: "notifications",
        title: "Notifications",
        match: ["/admin/notifications"],
        summary: "New orders, refunds and low stock.",
        blocks: [
          { p: "The bell at the top shows a gold number when something new happens. Everything is listed here even if phone notifications are off. Tap one to jump to the order or item." },
          { p: "To get them on your phone, see **Put the dashboard on your iPhone**." },
        ],
      },
    ],
  },
  {
    title: "Editing on GitHub",
    topics: [
      {
        id: "site-variables",
        title: "Editing with ChatGPT (site-variables.ts)",
        summary: "One file on GitHub with every word, price and product.",
        blocks: [
          { p: "The file `site-variables.ts` holds the business name, headlines, story, contact info, policies, theme, layout, shipping and every product. Each value has a note saying what it does, and the top of the file has instructions for ChatGPT." },
          {
            steps: [
              "On GitHub, open `site-variables.ts` and click the **Copy raw file** icon.",
              "Paste it into ChatGPT and say what you want, e.g. \"Add a walnut pen for $35, 10 in stock\" or \"Rewrite my about story\".",
              "Copy the whole file ChatGPT gives back.",
              "On GitHub, click the **pencil** (Edit), select everything, paste, and click **Commit changes**.",
              "Wait about a minute, then refresh your site.",
            ],
          },
          { h: "How it works with the dashboard" },
          {
            list: [
              "When the file changes, only the values that changed in it are applied. Everything else keeps what you set in the dashboard. Whichever was changed last wins.",
              "Removing a product from the file removes it from the shop. Use `visible: false` to hide it instead.",
              "Photos: upload them in the dashboard, or to the `public/images` folder on GitHub and write `\"/images/name.jpg\"` in the file.",
            ],
          },
          { tip: "If the file has a mistake, Vercel won't publish it and the current site stays up. Vercel emails you the error; paste it into ChatGPT for a fix, or open the commit on GitHub and click **Revert**." },
        ],
      },
      {
        id: "edit-points",
        title: "Code edit points",
        summary: "Labeled spots in the code for bigger changes.",
        blocks: [
          { p: "For things the variables file can't do (new themes, menu links, checkout options), the code has labeled blocks that start with `EDIT-POINT:` and explain what to change. Search the repository on GitHub for `EDIT-POINT` to find them. `CUSTOMIZE.md` lists them all." },
          { p: "To get ChatGPT's help: copy the code under the label into ChatGPT, describe the change, and paste its answer back on GitHub the same way as the variables file." },
          { tip: "Passwords and keys never go in any file. They live in Vercel > Settings > Environment Variables." },
        ],
      },
    ],
  },
  {
    title: "Payments & services",
    topics: [
      {
        id: "payments",
        title: "Payments: Stripe, Apple Pay, Google Pay",
        summary: "How customers pay and how you get paid.",
        blocks: [
          { p: "When a customer taps **Check out**, they go to Stripe's secure payment page. Card, **Apple Pay** and **Google Pay** appear there automatically on phones and browsers that support them. Prices always come from your site, so nobody can change them in their cart." },
          { p: "Stripe sends the money to your bank on a regular schedule (see **Payouts** in Stripe) and keeps a small fee per payment." },
          { h: "Test before going live" },
          {
            steps: [
              "While your Stripe key starts with `sk_test`, payments are pretend. Settings shows **Test mode**.",
              "Buy something using card `4242 4242 4242 4242`, any future date and any 3-digit code.",
              "Check that the order shows in **Orders** and you got a notification.",
              "When ready, follow **Setup > Go live**: paste your live key (`sk_live…`) on **Keys** and press **Connect Stripe webhook** again.",
            ],
          },
          { h: "Promo codes and sales tax" },
          { p: "Customers can type promo codes made in Stripe (see **Discounts**). If you turn on **Sales tax by Stripe** in Settings, Stripe adds the right tax at checkout. Set up Stripe Tax first in Stripe > Settings > Tax." },
          { h: "Refunds" },
          { p: "Open the order, tap **Open in Stripe**, and refund it there. The order here switches to **Refunded** by itself." },
        ],
      },
      {
        id: "stripe-products",
        title: "Selling items made in Stripe",
        summary: "Make products in Stripe and they appear in the shop.",
        blocks: [
          {
            steps: [
              "In Stripe, go to **Product catalog > + Add product**.",
              "Fill in the name, description and photos. Under pricing choose **One-off** and enter the price.",
              "Optional: at the bottom, under **Metadata**, add extra details (below).",
              "Save. The item appears in your shop within seconds (or press **Sync from Stripe** on Products).",
            ],
          },
          { h: "Metadata you can add in Stripe" },
          {
            list: [
              "`category`: e.g. Woodwork",
              "`summary`: the one line shown on the shop page",
              "`stock`: how many you have; the shop counts down as they sell",
              "`was_price`: a higher old price to show a sale, e.g. 45",
              "`featured`: true",
              "`made_to_order`: true",
              "`choice_label` and `choice_options`: e.g. Color and Black, Brown, Natural",
              "`engraving_label`, `engraving_max` and `engraving_required`: e.g. Name to engrave, 30 and true",
            ],
          },
          { p: "Archiving or deleting a product in Stripe hides it in the shop. Past orders keep their details." },
          { tip: "Test-mode products and live-mode products are separate in Stripe. When you go live, make your products again in live mode." },
        ],
      },
      {
        id: "services",
        title: "GitHub, Vercel and storage",
        summary: "Where the site lives and where your data is kept.",
        blocks: [
          {
            list: [
              "**GitHub** holds the site's files. Every change there makes Vercel publish a new version.",
              "**Vercel** hosts the site. **Deployments** shows each version; you can roll back to an earlier one. **Settings > Environment Variables** holds your password and keys.",
              "**Supabase** (Vercel > Storage) is the database and photo storage. The site creates its own table and photo folder the first time it runs. Open it from Vercel > Storage if you ever want to look inside.",
            ],
          },
          { tip: "Your owner password is the `ADMIN_PASSWORD` setting in Vercel. To change it, edit it there and redeploy." },
        ],
      },
      {
        id: "customer-view",
        title: "What customers see",
        summary: "A walk through the shop from a customer's side.",
        blocks: [
          {
            steps: [
              "The home page shows your banner, headline, patch or logo, featured items, categories and the start of your story, arranged by your chosen layout.",
              "**Shop** lists everything for sale, with a tab for each category. **Our work** shows finished pieces with photos and descriptions. **About** has your full story and **Contact** has your details and the message form.",
              "The footer links to the shipping, returns, custom orders, privacy, terms and disclaimer pages, your extra pages (like the FAQ) and the review form.",
              "Tapping an item opens its page: photos, price, description, the choice list and quantity, and **Add to cart**.",
              "The cart shows the subtotal, shipping, and how much more is needed for free shipping.",
              "The cart asks for their ZIP to price shipping (or offers local pickup), and has an optional gift message at checkout.",
              "**Check out** opens Stripe, where they enter shipping details and pay.",
              "They land on a thank-you page with their order number, and Stripe emails a receipt.",
            ],
          },
          { p: "**Custom orders** has the request form. **Order status** in the footer lets customers look up an order with their order number and email. The shop has a search box once there are more than 6 items." },
          { p: "The only link to the dashboard is the small **Owner login** at the very bottom, which still needs your password. Search engines are told not to list it." },
        ],
      },
    ],
  },
  {
    title: "Troubleshooting",
    topics: [
      {
        id: "faq",
        title: "Common problems",
        summary: "Quick fixes for things that go sideways.",
        blocks: [
          { h: "I changed site-variables.ts but the site didn't change" },
          { p: "Give it a minute, then refresh. In Vercel > Deployments, check that the newest one says **Ready**. If it says **Error**, the file has a mistake: open the error, paste it into ChatGPT with the file, and commit the fix. The old site stays up meanwhile." },
          { h: "A customer paid but there's no order" },
          { p: "Orders usually appear when the customer reaches the thank-you page. If they closed the page early, the Stripe webhook delivers it. Check **Setup > Webhook connected** is green; if not, press **Connect Stripe webhook** on **Keys**." },
          { h: "Phone notifications don't arrive" },
          { p: "On iPhone they only work from the home-screen app (iOS 16.4+). Open it, go to **Settings**, and tap **Send a test**. If notifications are blocked, allow them in iPhone Settings > Notifications > Shop HQ. New orders still show under the bell either way." },
          { h: "Photo upload fails" },
          { p: "Check that the database step on **Setup** is green (Supabase connected). Use JPG, PNG or WebP photos." },
          { h: "My changes disappear after a while" },
          { p: "The database step on **Setup** needs to be green. If it says it's saving to this computer only, connect Supabase in Vercel > Storage and redeploy." },
          { h: "A product I made in Stripe isn't showing" },
          { p: "It needs a **one-off** price in US dollars and must not be archived. Press **Sync from Stripe** on Products. If you're in Stripe test mode, make sure the site is using your test key too (and the same for live)." },
          { h: "A key says \"Needs re-entering\"" },
          { p: "The secret that protects saved keys changed (usually AUTH_SECRET was added or edited in Vercel). Paste the key in again on **Keys**." },
          { h: "My edit isn't on GitHub" },
          { p: "Open **Settings > Accounts & links**. The GitHub box shows the last save and any error. Usually the token expired or doesn't have **Contents: Read and write**; make a new one (Setup > Save dashboard edits to GitHub) and paste it on **Keys**, then press **Save to GitHub now**." },
          { h: "I forgot my password" },
          { p: "If you never changed it in Settings: in Vercel > your project > Settings > Environment Variables, edit `ADMIN_PASSWORD`, then redeploy (Deployments > ⋯ > Redeploy). If you changed it in Settings, open Supabase (Vercel > Storage > Open in Supabase) > Table Editor > `shop_kv`, delete the row named `ownerPassword`, and the Vercel password works again." },
          { h: "Checkout says it isn't switched on" },
          { p: "The Stripe key is missing. Paste it on the **Keys** page." },
        ],
      },
    ],
  },
];

export function topicForPath(path: string): string {
  let best: { id: string; len: number } | null = null;
  for (const t of HELP.flatMap((g) => g.topics)) {
    for (const m of t.match ?? []) {
      const hit = path === m || (m !== "/admin" && path.startsWith(m + "/"));
      if (hit && (!best || m.length > best.len)) best = { id: t.id, len: m.length };
    }
  }
  return best?.id ?? "overview";
}
