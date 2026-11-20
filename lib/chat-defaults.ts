import type { ChatSettings } from "./types";

/*
 * EDIT-POINT: CHAT-STARTERS
 * The questions and answers the shop's chat starts with. They're edited,
 * hidden and added to in Dashboard > Chat; these are only the first set.
 */
// which group each starting answer is filed under in Dashboard > Chat
const TOPIC: Record<string, string> = { "ship-time": "Shipping & pickup", "ship-cost": "Shipping & pickup", "pickup": "Shipping & pickup", "intl": "Shipping & pickup", "track": "Orders & changes", "change": "Orders & changes", "rush": "Orders & changes", "proof": "Orders & changes", "custom": "Custom work & designs", "decline": "Custom work & designs", "logo": "Custom work & designs", "designs": "Custom work & designs", "text": "Custom work & designs", "returns": "Returns & problems", "damaged": "Returns & problems", "care": "Care & materials", "dishwasher": "Care & materials", "material": "Care & materials", "military": "Discounts & payment", "bulk": "Discounts & payment", "gift": "Discounts & payment", "codes": "Discounts & payment", "pay": "Discounts & payment", "who": "About us", "contact": "About us" };
const qa = (id: string, q: string, a: string, alts: string[] = []) => ({ id, q, a, hidden: false, ...(alts.length ? { alts } : {}), ...(TOPIC[id] ? { topic: TOPIC[id] } : {}) });

export const DEFAULT_CHAT: ChatSettings = {
  on: true,
  useAI: true,
  live: true,
  ai: { provider: "anthropic", model: "", baseUrl: "" },
  title: "Questions? Ask us",
  greeting: "Hi! Ask me anything about our tumblers, signs, custom orders, shipping or discounts.",
  faqs: [
    qa("ship-time", "How long does shipping take?", "Ready-made items ship within 3-5 business days. Custom and engraved pieces are made to order and usually ship within 1-2 weeks. You get an email with tracking as soon as it ships.", ["When will my order get here?", "How fast do you ship?", "How long until I get it?", "When will it arrive?", "How long does it take to make?"]),
    qa("ship-cost", "How much is shipping?", "Shipping is worked out from your ZIP code in the cart, so you see the price before checkout. Orders over the free-shipping amount ship free, and local pickup is free too.", ["What does shipping cost?", "Is shipping free?", "How much to mail it?"]),
    qa("pickup", "Can I pick up my order instead of shipping?", "Yes. Choose Local pickup in the cart and there's no shipping charge. We'll message you to set up a pickup time once your order is ready.", ["Can I pick it up?", "Do you do local pickup?", "Can I get it in person?"]),
    qa("intl", "Do you ship outside the US?", "We mainly ship within the US. For an address outside the US, tick 'Shipping outside the US' in the cart to see if we can send it and what it costs.", ["Do you ship to Canada?", "Do you ship internationally?", "Can you send it overseas?"]),
    qa("track", "Where is my order? How do I track it?", "Use the Order status page (link at the bottom of the site) with your order number and email. Once it ships you'll also get an email with the tracking number.", ["What's the status of my order?", "Has my order shipped?", "Where's my package?", "Do you have a tracking number?"]),
    qa("custom", "Do you make custom orders?", "Yes! Use the Custom orders page to tell us what you'd like, with photos if you have them. We'll reply with a price. Because of sizing and how much our equipment would need changing, we can't take every custom job, but larger orders are often possible.", ["Can you make something special for me?", "Do you take custom requests?", "Can I get a quote?"]),
    qa("decline", "Why was my custom request declined?", "Some designs need more changes to our laser setup than one piece allows, or don't fit the item well. It's never about the idea itself. Larger orders can make it workable, so feel free to ask again with a different size or quantity."),
    qa("logo", "Can you engrave my own logo or picture?", "Often, yes. On items that allow it, pick 'Your own logo' and upload it (a PNG with a see-through background works best). Otherwise send it through the Custom orders page and we'll tell you how it will turn out.", ["Can you put my company logo on it?", "Can you engrave a photo?", "Can I send my own artwork?"]),
    qa("designs", "Why can't I pick every design on every size?", "Not every design fits every item. Each size only shows the designs that fit it well, so bigger or smaller tumblers may have different choices."),
    qa("text", "Can you add a name or date?", "Yes. Many items have a box for the text to engrave. It's used exactly as typed, so double-check spelling, capitals and dates before you order.", ["Can you engrave a name?", "Can I personalize it?", "Can you put a date on it?"]),
    qa("proof", "Will I see a proof before you engrave?", "For custom orders we talk through the design before starting. For regular items, the preview on the item page shows roughly how your design will look, and the text is engraved exactly as you type it.", ["Can I see it before you make it?", "Do I get to approve the design?"]),
    qa("change", "Can I change or cancel my order?", "Message us right away. Once we start cutting or engraving, an order can't be changed or cancelled, but we'll do our best to catch it in time.", ["I need to change my order", "Can I cancel?", "I made a mistake on my order"]),
    qa("returns", "What is your return policy?", "Ready-made items can be returned within 30 days if unused. Custom, personalized and engraved items are made just for you, so they can't be returned unless they arrive damaged or we made a mistake; then send a photo within 7 days and we'll fix or replace it.", ["Can I return it?", "Do you give refunds?", "Can I exchange it?", "I want to send it back"]),
    qa("damaged", "My item arrived damaged. What do I do?", "We're sorry! Send us a photo through the Contact page within 7 days of delivery and we'll make it right.", ["It arrived broken", "My order came damaged", "Something's wrong with my item"]),
    qa("care", "How do I care for an engraved tumbler?", "Hand wash with warm soapy water and skip the dishwasher to keep the finish and engraving looking their best. Wood should stay out of soaking water; slate wipes clean.", ["How do I clean it?", "How do I wash it?", "Will the engraving fade?"]),
    qa("dishwasher", "Are the tumblers dishwasher safe?", "We recommend hand washing. Dishwashers can wear down the coating and engraving over time.", ["Can it go in the dishwasher?", "Is it dishwasher safe?"]),
    qa("material", "What do you engrave on?", "Mostly stainless tumblers, wood signs, slate and leather. Natural materials vary piece to piece, so yours may look a little different from the photos, and that's part of what makes it one of a kind.", ["What materials do you use?", "What can you engrave?"]),
    qa("military", "Do you have a military or veteran discount?", "Yes. Veterans, active duty, Guard and Reserve, police, firefighters and EMTs get a discount. Visit the Military discount page (link at the bottom of the site) to get your code.", ["Do you have a first responder discount?", "I'm a veteran, any deals?", "Police discount?"]),
    qa("bulk", "Do you offer bulk or group pricing?", "Yes. The more items in one order, the bigger the discount; it comes off automatically in the cart. For large unit, team or event orders, send a custom request with the quantity.", ["Do you do wholesale?", "Discount for a big order?", "Can I order 50 for my team?"]),
    qa("gift", "Do you sell gift cards?", "Yes. Visit the Gift cards page, pick an amount, and we'll email the code to whoever it's for. It's used in one order."),
    qa("codes", "How do I use a promo code?", "Type it in the promo code box on the checkout page, before you pay.", ["Where do I put my coupon?", "My code isn't working"]),
    qa("pay", "How can I pay?", "We take {payments}. Pick how you'd like to pay in the cart.", ["Do you take Apple Pay?", "Can I pay with PayPal?", "What payment do you accept?"]),
    qa("rush", "I need it by a certain date. Can you rush it?", "Send us a message or a custom request with the date before you order, and we'll tell you honestly whether we can make it.", ["Can I get it by Friday?", "I need it fast", "Can you have it done by a certain date?"]),
    qa("who", "Who are you?", "We're a veteran-owned family business. Everything is made by hand in our workshop, much of it with our laser engraver.", ["Who makes these?", "Who runs this shop?", "Is this a small business?"]),
    qa("contact", "How do I contact you?", "Use the Contact page to send us a message, or reach us through our Facebook group. We usually reply within a day or two.", ["How do I reach you?", "Can I talk to a real person?", "What's your email?"]),
  ],
};
