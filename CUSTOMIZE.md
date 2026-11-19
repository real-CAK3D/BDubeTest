# Customizing the shop

Two ways to change things. The first covers almost everything.

## 1. Words, prices, products and settings: `site-variables.ts`

Everything on the shop that isn't code (words, products, prices, designs, discounts, pages, theme...) is changed in the **dashboard**, and shows on the shop right away. A copy of all of it is also saved in **`site-variables.ts`** on GitHub as a backup with history (once a GitHub token is added), and that's what a fresh copy of the shop starts from.

You can also edit `site-variables.ts` by hand on GitHub (pencil, change the value, **Commit changes**); every value has a note saying what it does. If there's a mistake, Vercel won't publish it and the live site stays up.

### Photos

Upload them in the dashboard (**Products**, **Designs**, **Words & logos**). Or, on GitHub, upload to the `public/images` folder and refer to them as `"/images/file-name.jpg"`.

### The file and the dashboard together

Both can change the same things. When `site-variables.ts` changes, **only the values that changed in the file** are applied; everything else keeps what was set in the dashboard. So whichever was changed most recently wins.

- Removing a product from the file removes it from the shop. To hide one but keep it, set `visible: false`.
- Products added only in the dashboard aren't touched by the file.
- Orders, expenses and customers live only in the dashboard.

## 2. Code changes: EDIT-POINT markers

Places in the code meant to be edited are labeled like this:

```ts
/*
 * EDIT-POINT: THEMES
 * The color + font themes the owner picks under Look & layout.
 * ...
 */
```

Find one by searching the repository for `EDIT-POINT: NAME` (on GitHub press `/` and type it), or run `npm run edit-points` for a list with file and line numbers.

| Edit point | File | What you change there |
|---|---|---|
| `SITE-VARIABLES` | `site-variables.ts` | All words, prices, products and settings (see above) |
| `THEMES` | `lib/themes.ts` | Add or change color/font themes |
| `LAYOUTS` | `lib/themes.ts` | The four layouts for the home and Shop pages |
| `STOREFRONT-STYLES` | `app/shop.css` | Shape, spacing and sizes on the shop |
| `HOME-PAGE-SECTIONS` | `components/shop/Sections.tsx` | The About and Contact pages |
| `FOOTER` | `components/shop/Footer.tsx` | Small print at the bottom |
| `EMBLEM` | `components/shop/Emblem.tsx` | Built-in badge shown before a logo is uploaded |
| `SOCIAL-NETWORKS` | `components/shop/Social.tsx` | Which social sites can be linked |
| `CHECKOUT` | `app/api/checkout/route.ts` | Stripe checkout options |
| `SHIPPING` | `lib/shipping.ts` | How shipping is priced by distance (the prices themselves are in Settings > Store) |
| `NOTIFICATION-TEXT` | `lib/orders.ts` | Wording of new-order phone alerts |
| `ADMIN-MENU` | `lib/admin-pages.ts` | Owner dashboard pages (the owner orders and hides them in Customize dashboard) |
| `ADMIN-DEFAULTS` | `lib/site-structure.ts` | How the dashboard looks before it's customized; dashboard home sections |
| `PAGES` | `lib/site-structure.ts` | The shop's built-in pages (ordered and switched on/off in Pages & menu) |
| `PRICING` | `lib/pricing.ts` | How size and design choices set an item's price |
| `WATERMARK` | `lib/watermark.ts` | Which photos get the watermark (the stamping is in `app/api/wm/route.ts`) |
| `3D-SHAPES` | `components/shop/Viewer3D.tsx` | The 3D shapes (tumbler, mug, sign...) and how a laser mark looks on each |
| `PRODUCT-FEED` | `app/feed.xml/route.ts` | The product list for Facebook/Instagram Shops and Google |
| `APP-ICON` | `app/api/manifest/route.ts` | Home-screen app name and icon |
| `LOGIN` | `lib/auth.ts` | How long the owner stays logged in |
| `VARIABLES-FILE` | `lib/variables-file.ts` | How the dashboard writes site-variables.ts (and its comments) |
| `GITHUB-SYNC` | `lib/github-sync.ts` | Saving dashboard edits to GitHub |
| `HELP` | `lib/help.ts` | The Help page and GUIDE.md (run `npm run guide` after editing) |
| `SETUP-STEPS` | `lib/setup-steps.ts` | The Setup page and SETUP.md (run `npm run guide` after editing) |
| `API-KEYS` | `lib/keys.ts` | The keys listed on Accounts & keys; how to use a new service's key |
| `STRIPE-CATALOG` | `lib/stripe-catalog.ts` | How products made in Stripe map to shop items |
| `EMAILS` | `lib/email.ts` | Wording of the "your order shipped" email |

### Making a code change

1. Open the file on GitHub and find the `EDIT-POINT` block; it explains what the code does.
2. Click the pencil, make the change, and click **Commit changes**. Vercel rebuilds automatically, and if the change breaks the build, the current site stays up.

Passwords and keys never go in any file. They live in Vercel > Settings > Environment Variables.
