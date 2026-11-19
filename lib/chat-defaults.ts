import type { ChatSettings } from "./types";

/*
 * EDIT-POINT: CHAT-STARTERS
 * The questions and answers the shop's chat starts with. They're edited,
 * hidden and added to in Dashboard > Chat; these are only the first set.
 */
const qa = (id: string, q: string, a: string) => ({ id, q, a, hidden: false });

export const DEFAULT_CHAT: ChatSettings = {
  on: true,
  useAI: true,
  title: "Questions? Ask us",
  greeting: "Hi! Ask me anything about our tumblers, signs, custom orders, shipping or discounts.",
  faqs: [
    qa("ship-time", "How long does shipping take?", "Ready-made items ship within 3-5 business days. Custom and engraved pieces are made to order and usually ship within 1-2 weeks. You get an email with tracking as soon as it ships."),
    qa("ship-cost", "How much is shipping?", "Shipping is worked out from your ZIP code in the cart, so you see the price before checkout. Orders over the free-shipping amount ship free, and local pickup is free too."),
    qa("pickup", "Can I pick up my order instead of shipping?", "Yes. Choose Local pickup in the cart and there's no shipping charge. We'll message you to set up a pickup time once your order is ready."),
    qa("intl", "Do you ship outside the US?", "We mainly ship within the US. For an address outside the US, tick 'Shipping outside the US' in the cart to see if we can send it and what it costs."),
    qa("track", "Where is my order? How do I track it?", "Use the Order status page (link at the bottom of the site) with your order number and email. Once it ships you'll also get an email with the tracking number."),
    qa("custom", "Do you make custom orders?", "Yes! Use the Custom orders page to tell us what you'd like, with photos if you have them. We'll reply with a price. Because of sizing and how much our equipment would need changing, we can't take every custom job, but larger orders are often possible."),
    qa("decline", "Why was my custom request declined?", "Some designs need more changes to our laser setup than one piece allows, or don't fit the item well. It's never about the idea itself. Larger orders can make it workable, so feel free to ask again with a different size or quantity."),
    qa("logo", "Can you engrave my own logo or picture?", "Often, yes. On items that allow it, pick 'Your own logo' and upload it (a PNG with a see-through background works best). Otherwise send it through the Custom orders page and we'll tell you how it will turn out."),
    qa("designs", "Why can't I pick every design on every size?", "Not every design fits every item. Each size only shows the designs that fit it well, so bigger or smaller tumblers may have different choices."),
    qa("text", "Can you add a name or date?", "Yes. Many items have a box for the text to engrave. It's used exactly as typed, so double-check spelling, capitals and dates before you order."),
    qa("proof", "Will I see a proof before you engrave?", "For custom orders we talk through the design before starting. For regular items, the preview on the item page shows roughly how your design will look, and the text is engraved exactly as you type it."),
    qa("change", "Can I change or cancel my order?", "Message us right away. Once we start cutting or engraving, an order can't be changed or cancelled, but we'll do our best to catch it in time."),
    qa("returns", "What is your return policy?", "Ready-made items can be returned within 30 days if unused. Custom, personalized and engraved items are made just for you, so they can't be returned unless they arrive damaged or we made a mistake; then send a photo within 7 days and we'll fix or replace it."),
    qa("damaged", "My item arrived damaged. What do I do?", "We're sorry! Send us a photo through the Contact page within 7 days of delivery and we'll make it right."),
    qa("care", "How do I care for an engraved tumbler?", "Hand wash with warm soapy water and skip the dishwasher to keep the finish and engraving looking their best. Wood should stay out of soaking water; slate wipes clean."),
    qa("dishwasher", "Are the tumblers dishwasher safe?", "We recommend hand washing. Dishwashers can wear down the coating and engraving over time."),
    qa("material", "What do you engrave on?", "Mostly stainless tumblers, wood signs, slate and leather. Natural materials vary piece to piece, so yours may look a little different from the photos, and that's part of what makes it one of a kind."),
    qa("military", "Do you have a military or veteran discount?", "Yes. Veterans, active duty, Guard and Reserve, police, firefighters and EMTs get a discount. Visit the Military discount page (link at the bottom of the site) to get your code."),
    qa("bulk", "Do you offer bulk or group pricing?", "Yes. The more items in one order, the bigger the discount; it comes off automatically in the cart. For large unit, team or event orders, send a custom request with the quantity."),
    qa("gift", "Do you sell gift cards?", "Yes. Visit the Gift cards page, pick an amount, and we'll email the code to whoever it's for. It's used in one order."),
    qa("codes", "How do I use a promo code?", "Type it in the promo code box on the checkout page, before you pay."),
    qa("pay", "How can I pay?", "All major cards, Apple Pay and Google Pay, through Stripe's secure checkout. Your card details never touch our site."),
    qa("rush", "I need it by a certain date. Can you rush it?", "Send us a message or a custom request with the date before you order, and we'll tell you honestly whether we can make it."),
    qa("who", "Who are you?", "We're a veteran-owned family business. Everything is made by hand in our workshop, much of it with our laser engraver."),
    qa("contact", "How do I contact you?", "Use the Contact page to send us a message, or reach us through our Facebook group. We usually reply within a day or two."),
  ],
};
