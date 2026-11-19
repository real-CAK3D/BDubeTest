import type { UpcomingSettings } from "./types";

/*
 * EDIT-POINT: WHATS-TO-COME
 * The "What's to come" section starts with these. They're edited, hidden and
 * added to in Dashboard > What's to come.
 */
export const DEFAULT_UPCOMING: UpcomingSettings = {
  on: true,
  heading: "What's to come",
  intro: "New things we're working on for more custom creations. Tap \u201cI want this\u201d so we know what to make first, or ask us to let you know when it's ready.",
  items: [
    { id: "photo-engraving", title: "Photo engraving", text: "Your favorite photo engraved onto a tumbler, slate or wood. Great for memorials and gifts.", image: "", when: "", stage: "working" },
    { id: "unit-coins", title: "Unit & challenge coin displays", text: "Custom display cases built around your unit's coins, patches and insignia.", image: "", when: "", stage: "idea" },
    { id: "more-colors", title: "More tumbler colors", text: "More colors and finishes to engrave, beyond what's in the shop now.", image: "", when: "", stage: "soon" },
  ],
};
