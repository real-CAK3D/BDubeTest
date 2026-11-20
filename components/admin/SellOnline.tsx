"use client";
import type { SiteSettings } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { useSettings } from "./useSettings";

/** Dashboard > Sell online: the product feed and step-by-step for Facebook/Instagram Shops, Google and Pinterest. */
export function SellOnline({ initial, feed, site, counts }: { initial: SiteSettings; feed: string; site: string; counts: { ready: number; all: number } }) {
  const { s, set, bar } = useSettings(initial);
  const v = s.verify ?? { google: "", meta: "", pinterest: "", bing: "" };
  const put = (patch: Partial<typeof v>) => set({ verify: { ...v, ...patch } });
  const field = (k: keyof typeof v, label: string, hint: string) => (
    <label className="f">
      <span>{label}</span>
      <input value={v[k]} onChange={(e) => put({ [k]: e.target.value })} placeholder="Paste the code or the whole <meta> tag" />
      <small className="muted">{hint}</small>
    </label>
  );
  return (
    <>
      <div className="page-head"><h1>Sell on Facebook, Instagram &amp; Google</h1></div>
      <p className="muted lead">Your items can show up in Facebook and Instagram Shops, Google Shopping (free listings) and Pinterest. They all read one product list from your site, so you set it up once; new items, prices and stock update by themselves every day. Checkout still happens on your site.</p>

      <section className="panel stack">
        <h2>Your product list (feed)</h2>
        <div className="row wrap"><code className="lp-url">{feed}</code><CopyButton text={feed} label="Copy" /></div>
        <p className="muted small">{counts.ready} of {counts.all} items are in it. Items need a photo and a price to be listed. Photos go out without the watermark (the platforms reject watermarked photos).</p>
      </section>

      <section className="panel stack">
        <h2>Facebook &amp; Instagram Shops</h2>
        <ol className="steps-list">
          <li>Go to <a href="https://business.facebook.com/commerce" target="_blank" rel="noreferrer">Meta Commerce Manager</a> with the Facebook account that runs your business page, and choose <strong>Add a catalog</strong> › E-commerce.</li>
          <li>Catalog › <strong>Data sources</strong> › Add items › <strong>Data feed</strong> › Scheduled feed. Paste your feed address above, repeat <strong>Daily</strong>, currency USD.</li>
          <li>Business settings › Brand safety › <strong>Domains</strong> › Add your site address, pick <em>Meta-tag verification</em>, and paste the code into &ldquo;Meta&rdquo; below. Save here, then press Verify there.</li>
          <li>In Commerce Manager, <strong>Create a shop</strong>, choose &ldquo;checkout on another website&rdquo;, and connect your Facebook page and Instagram account. Meta reviews it (usually a few days).</li>
          <li>Then tag your items in Instagram and Facebook posts.</li>
        </ol>
      </section>

      <section className="panel stack">
        <h2>Google (Shopping tab, Images, Maps)</h2>
        <ol className="steps-list">
          <li>Sign up free at <a href="https://merchants.google.com" target="_blank" rel="noreferrer">Google Merchant Center</a>. Business info: your site <code>{site}</code>.</li>
          <li>It asks you to verify the site: choose the <strong>HTML tag</strong> way and paste the code into &ldquo;Google&rdquo; below, save, then press Verify there. (The same code also verifies <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer">Search Console</a>, which shows how people find you on Google.)</li>
          <li>Products › Add products › <strong>Add from a file</strong> › Enter a link to your file: paste your feed address, daily.</li>
          <li>Shipping and returns: set your shipping prices and 30-day returns there (by-distance shipping can&apos;t be read from the feed).</li>
          <li>Turn on <strong>free listings</strong>. If you have a Google Business Profile (Maps), link it too.</li>
        </ol>
      </section>

      <section className="panel stack">
        <h2>Pinterest</h2>
        <ol className="steps-list">
          <li>Make a free <a href="https://business.pinterest.com" target="_blank" rel="noreferrer">Pinterest business account</a>, then Settings › Claimed accounts › Claim your website › Add HTML tag: paste the code into &ldquo;Pinterest&rdquo; below.</li>
          <li>Ads › Catalogs › Add data source: paste your feed address. Your items become shoppable Pins.</li>
        </ol>
      </section>

      <section className="panel stack">
        <h2>Verification codes</h2>
        {field("meta", "Meta (Facebook / Instagram)", "From Business settings › Domains")}
        {field("google", "Google", "From Merchant Center or Search Console › HTML tag")}
        {field("pinterest", "Pinterest", "From Claim your website › HTML tag")}
        {field("bing", "Bing (optional)", "From Bing Webmaster Tools › HTML meta tag")}
      </section>
      {bar}
    </>
  );
}
