export type ThemeGroup = "Military" | "Police" | "USA & support" | "Workshop" | "Plain";
export type Texture = "none" | "stars" | "stripes" | "camo" | "woodgrain";

export type Theme = {
  id: string;
  name: string;
  group: ThemeGroup;
  texture: Texture; // a light pattern on the header, footer and welcome area
  description: string;
  fonts: { display: string; body: string };
  displayCase: "uppercase" | "none";
  displayTracking: string;
  radius: string;
  colors: {
    bg: string;
    surface: string;
    surface2: string;
    ink: string;
    muted: string;
    line: string;
    accent: string;
    accentInk: string;
    band: string; // header band
    bandInk: string;
    stitch: string; // patch stitching
  };
};

/*
 * EDIT-POINT: THEMES
 * The color + font themes the owner picks under Look & layout.
 * Add a theme: copy one { ... } entry below, give it a new unique id and name,
 * and change the colors (hex) and Google Font names. It shows up automatically.
 *   bg/surface/surface2 = page and card backgrounds   ink/muted = text
 *   accent = buttons   band = header/footer   stitch = patch stitching + highlights
 * Fonts must be on fonts.google.com, spelled exactly as listed there.
 */
export const THEMES: Theme[] = [
  {
    id: "dube-family",
    name: "Dube Family",
    group: "USA & support",
    texture: "stars",
    description: "Matched to the Dube Family Creations logo: black, metallic gold and flag red.",
    fonts: { display: "Cinzel", body: "Libre Franklin" },
    displayCase: "none",
    displayTracking: "0.01em",
    radius: "4px",
    colors: {
      bg: "#F7F3EA",
      surface: "#FFFFFF",
      surface2: "#EDE5D3",
      ink: "#15120D",
      muted: "#5A5244",
      line: "#DDD3BD",
      accent: "#15120D",
      accentInk: "#E4BC5C",
      band: "#0E0C09",
      bandInk: "#E4BC5C",
      stitch: "#C99A3A",
    },
  },
  {
    id: "military-police",
    group: "Police",
    texture: "none",
    name: "Military Police",
    description: "MP branch green and gold with a black brassard band.",
    fonts: { display: "Saira Stencil One", body: "Barlow" },
    displayCase: "uppercase",
    displayTracking: "0.02em",
    radius: "4px",
    colors: {
      bg: "#F3F2EC",
      surface: "#FFFFFF",
      surface2: "#E6E5DC",
      ink: "#15181A",
      muted: "#555B57",
      line: "#CFCEC3",
      accent: "#1E4D36",
      accentInk: "#FFFFFF",
      band: "#121314",
      bandInk: "#F2C84B",
      stitch: "#C9A227",
    },
  },
  {
    id: "olive-drab",
    group: "Military",
    texture: "none",
    name: "Olive Drab",
    description: "Field-issue OD green, canvas and stenciled type.",
    fonts: { display: "Big Shoulders Stencil Display", body: "Barlow" },
    displayCase: "uppercase",
    displayTracking: "0.03em",
    radius: "2px",
    colors: {
      bg: "#E9E4D3",
      surface: "#F6F2E6",
      surface2: "#DAD3BC",
      ink: "#22251A",
      muted: "#585B48",
      line: "#C4BCA2",
      accent: "#4B5320",
      accentInk: "#F6F2E6",
      band: "#3A4019",
      bandInk: "#EDE6CC",
      stitch: "#9AA161",
    },
  },
  {
    id: "ocp-field",
    group: "Military",
    texture: "camo",
    name: "OCP Field",
    description: "Coyote brown and sand from the operational camo pattern.",
    fonts: { display: "Oswald", body: "Barlow" },
    displayCase: "uppercase",
    displayTracking: "0.01em",
    radius: "6px",
    colors: {
      bg: "#EDE5D3",
      surface: "#FAF6EC",
      surface2: "#DCCFB4",
      ink: "#2B2419",
      muted: "#6A5D48",
      line: "#CDBF9F",
      accent: "#7A5C3C",
      accentInk: "#FFFFFF",
      band: "#5C4A33",
      bandInk: "#F0E6CF",
      stitch: "#A38B6D",
    },
  },
  {
    id: "dress-blues",
    group: "Military",
    texture: "stars",
    name: "Dress Blues",
    description: "Army Service Uniform blue with polished gold.",
    fonts: { display: "Cinzel", body: "Source Sans 3" },
    displayCase: "none",
    displayTracking: "0.01em",
    radius: "3px",
    colors: {
      bg: "#F4F3EF",
      surface: "#FFFFFF",
      surface2: "#E5E6EC",
      ink: "#141B2E",
      muted: "#4F5770",
      line: "#CDD0DA",
      accent: "#1C2841",
      accentInk: "#F3D77A",
      band: "#1C2841",
      bandInk: "#E3C463",
      stitch: "#D4AF37",
    },
  },
  {
    id: "night-patrol",
    group: "Police",
    texture: "none",
    name: "Night Patrol",
    description: "Dark mode for after lights-out, with steel-blue highlights.",
    fonts: { display: "Chakra Petch", body: "Barlow" },
    displayCase: "uppercase",
    displayTracking: "0.02em",
    radius: "4px",
    colors: {
      bg: "#16191D",
      surface: "#1F2328",
      surface2: "#292E35",
      ink: "#E8ECEF",
      muted: "#A1AAB3",
      line: "#363C44",
      accent: "#8FB3D4",
      accentInk: "#0F1A25",
      band: "#0D0F12",
      bandInk: "#C6D7E6",
      stitch: "#5D7A94",
    },
  },
  {
    id: "old-glory",
    group: "USA & support",
    texture: "stars",
    name: "Old Glory",
    description: "Flag navy and red on crisp white.",
    fonts: { display: "Alfa Slab One", body: "Libre Franklin" },
    displayCase: "none",
    displayTracking: "0",
    radius: "4px",
    colors: {
      bg: "#FFFFFF",
      surface: "#F5F6F9",
      surface2: "#E7EAF1",
      ink: "#0A1B33",
      muted: "#4E5A6E",
      line: "#D5DAE4",
      accent: "#B31942",
      accentInk: "#FFFFFF",
      band: "#0A3161",
      bandInk: "#FFFFFF",
      stitch: "#B31942",
    },
  },
  {
    id: "brass-leather",
    group: "Workshop",
    texture: "woodgrain",
    name: "Brass & Leather",
    description: "Workshop browns and brass, for handmade goods.",
    fonts: { display: "Bitter", body: "Bitter" },
    displayCase: "none",
    displayTracking: "0",
    radius: "8px",
    colors: {
      bg: "#2A1E16",
      surface: "#35271D",
      surface2: "#423125",
      ink: "#F1E6D6",
      muted: "#C3B096",
      line: "#54402F",
      accent: "#C99A3E",
      accentInk: "#24180F",
      band: "#1E150F",
      bandInk: "#E2BC6A",
      stitch: "#C99A3E",
    },
  },
  {
    id: "clean-dispatch",
    group: "Plain",
    texture: "none",
    name: "Clean Dispatch",
    description: "Plain, bright and modern. No uniform required.",
    fonts: { display: "Archivo", body: "Archivo" },
    displayCase: "none",
    displayTracking: "-0.01em",
    radius: "10px",
    colors: {
      bg: "#FAFAFA",
      surface: "#FFFFFF",
      surface2: "#EFEFEF",
      ink: "#161616",
      muted: "#5E5E5E",
      line: "#DEDEDE",
      accent: "#1F5AA6",
      accentInk: "#FFFFFF",
      band: "#FFFFFF",
      bandInk: "#161616",
      stitch: "#9DB4D2",
    },
  },
  {
    id: "thin-blue-line",
    name: "Thin Blue Line",
    group: "Police",
    texture: "none",
    description: "Black and steel with one sharp blue line. Built for law enforcement pride.",
    fonts: { display: "Anton", body: "Barlow" },
    displayCase: "uppercase",
    displayTracking: "0.02em",
    radius: "3px",
    colors: {
      bg: "#F3F4F6",
      surface: "#FFFFFF",
      surface2: "#E3E6EB",
      ink: "#12161C",
      muted: "#4D5562",
      line: "#CDD2DA",
      accent: "#1D4E9E",
      accentInk: "#FFFFFF",
      band: "#0B0D10",
      bandInk: "#E8ECF2",
      stitch: "#2F6FD6",
    },
  },
  {
    id: "black-gold",
    name: "Black & Gold",
    group: "Military",
    texture: "stars",
    description: "The Army's own colors: black, gold and a few stars.",
    fonts: { display: "Graduate", body: "Barlow" },
    displayCase: "uppercase",
    displayTracking: "0.01em",
    radius: "2px",
    colors: {
      bg: "#F5F2E8",
      surface: "#FFFFFF",
      surface2: "#E9E3D2",
      ink: "#141414",
      muted: "#57524A",
      line: "#D6CFBC",
      accent: "#141414",
      accentInk: "#F7C948",
      band: "#0A0A0A",
      bandInk: "#F7C948",
      stitch: "#F7C948",
    },
  },
  {
    id: "desert-camo",
    name: "Desert Camo",
    group: "Military",
    texture: "camo",
    description: "Sand, khaki and chocolate-chip browns with a stencil headline.",
    fonts: { display: "Black Ops One", body: "Barlow" },
    displayCase: "uppercase",
    displayTracking: "0.02em",
    radius: "4px",
    colors: {
      bg: "#EFE6D2",
      surface: "#F8F2E4",
      surface2: "#DED0B1",
      ink: "#2C251C",
      muted: "#655642",
      line: "#D2C2A0",
      accent: "#6B4E31",
      accentInk: "#FFFFFF",
      band: "#6E5A3F",
      bandInk: "#F8F2E4",
      stitch: "#D8C49A",
    },
  },
  {
    id: "woodland-camo",
    name: "Woodland Camo",
    group: "Military",
    texture: "camo",
    description: "Forest greens and earth tones from the classic woodland pattern.",
    fonts: { display: "Allerta Stencil", body: "Barlow" },
    displayCase: "uppercase",
    displayTracking: "0.03em",
    radius: "4px",
    colors: {
      bg: "#E7EAE0",
      surface: "#F4F6EF",
      surface2: "#D5DBC9",
      ink: "#1D2419",
      muted: "#4F5847",
      line: "#C3CBB4",
      accent: "#3E5A2E",
      accentInk: "#FFFFFF",
      band: "#2E3A24",
      bandInk: "#E7EAE0",
      stitch: "#9AA86C",
    },
  },
  {
    id: "yellow-ribbon",
    name: "Yellow Ribbon",
    group: "USA & support",
    texture: "stars",
    description: "Support Our Troops: ribbon yellow with navy, warm and welcoming.",
    fonts: { display: "Patua One", body: "Libre Franklin" },
    displayCase: "none",
    displayTracking: "0",
    radius: "8px",
    colors: {
      bg: "#FFFBEF",
      surface: "#FFFFFF",
      surface2: "#FBEFC8",
      ink: "#1D2433",
      muted: "#525A6A",
      line: "#EADFB8",
      accent: "#1F3A68",
      accentInk: "#FFFFFF",
      band: "#1F3A68",
      bandInk: "#FFE07A",
      stitch: "#F2C230",
    },
  },
  {
    id: "americana",
    name: "Americana",
    group: "USA & support",
    texture: "stripes",
    description: "Faded denim, barn red and old paper, like a flag that's flown a while.",
    fonts: { display: "Ultra", body: "Libre Franklin" },
    displayCase: "none",
    displayTracking: "0",
    radius: "3px",
    colors: {
      bg: "#F3EBDD",
      surface: "#FBF6EC",
      surface2: "#E8DCC5",
      ink: "#1E2433",
      muted: "#585C64",
      line: "#D7C8AC",
      accent: "#A3302B",
      accentInk: "#FFFFFF",
      band: "#23375F",
      bandInk: "#F3EBDD",
      stitch: "#C9A25A",
    },
  },
  {
    id: "burnt-birch",
    name: "Burnt Birch",
    group: "Workshop",
    texture: "woodgrain",
    description: "Birch plywood and laser-burn brown. Made for engraved woodwork.",
    fonts: { display: "Josefin Slab", body: "Work Sans" },
    displayCase: "uppercase",
    displayTracking: "0.04em",
    radius: "6px",
    colors: {
      bg: "#F1E4CC",
      surface: "#FAF2E3",
      surface2: "#E6D3B0",
      ink: "#2E1D12",
      muted: "#665040",
      line: "#D9C39C",
      accent: "#8A3B12",
      accentInk: "#FFFFFF",
      band: "#3A2416",
      bandInk: "#F1E4CC",
      stitch: "#D08A45",
    },
  },
  {
    id: "etched-slate",
    name: "Etched Slate",
    group: "Workshop",
    texture: "none",
    description: "Cool slate grays with a copper edge, like engraved stone and metal.",
    fonts: { display: "Space Grotesk", body: "Space Grotesk" },
    displayCase: "none",
    displayTracking: "-0.01em",
    radius: "6px",
    colors: {
      bg: "#E9EBEC",
      surface: "#F6F7F7",
      surface2: "#D9DDDF",
      ink: "#1C2124",
      muted: "#525A5F",
      line: "#C8CED1",
      accent: "#2F3B42",
      accentInk: "#FFFFFF",
      band: "#2A3135",
      bandInk: "#E8ECEE",
      stitch: "#C08550",
    },
  },
  {
    id: "maple-walnut",
    name: "Maple & Walnut",
    group: "Workshop",
    texture: "woodgrain",
    description: "Light maple and dark walnut, for handmade gifts and keepsakes.",
    fonts: { display: "Zilla Slab", body: "Zilla Slab" },
    displayCase: "none",
    displayTracking: "0",
    radius: "8px",
    colors: {
      bg: "#FBF4E8",
      surface: "#FFFDF8",
      surface2: "#F0E2C8",
      ink: "#2B1B12",
      muted: "#6A5343",
      line: "#E3D2B2",
      accent: "#6E3B22",
      accentInk: "#FFFFFF",
      band: "#4B2E1F",
      bandInk: "#F6E7CB",
      stitch: "#D9A55B",
    },
  },
];

export type Layout = { id: string; name: string; description: string; sketch: string };

/*
 * EDIT-POINT: LAYOUTS
 * How the home page and the Shop page are arranged. Each id here has a file in
 * components/shop/layouts/ with a Home and a Catalog view, listed in
 * components/shop/layouts/index.tsx. To add one: copy a layout file, rename
 * the two functions, add them to index.tsx and add an entry here.
 */
export const LAYOUTS: Layout[] = [
  {
    id: "garrison",
    name: "Garrison",
    description: "Big welcome with your patch, featured items and category tiles. Shop page is a grid.",
    sketch: "▬▬▬▬▬▬\n  ◉ HERO  \n▢ ▢ ▢ ▢\n▢ ▢ ▢ ▢\n ABOUT ",
  },
  {
    id: "field-manual",
    name: "Field Manual",
    description: "Sidebar with your categories on every page; pick one to see just those items.",
    sketch: "▌▢ ▢ ▢\n▌▢ ▢ ▢\n▌▢ ▢ ▢\n▌      ",
  },
  {
    id: "showroom",
    name: "Showroom",
    description: "Full-width photo up top and large, story-style rows for each item.",
    sketch: "██████\n██████\n▢▢ ═══\n═══ ▢▢",
  },
  {
    id: "quartermaster",
    name: "Quartermaster",
    description: "Compact list with add-to-cart buttons. Best when there are lots of items.",
    sketch: "▬▬▬▬▬▬\n▪ ─── $\n▪ ─── $\n▪ ─── $",
  },
  {
    id: "workshop",
    name: "Workshop",
    description: "Photo wall of your work, plus a \"how custom orders work\" section. Great for engraving and crafts.",
    sketch: "═══ ███\n① ② ③ ④\n▢ ▯ ▢\n▯ ▢ ▯",
  },
  {
    id: "tribute",
    name: "Tribute",
    description: "Centered and formal, with shadow-box frames around each item. Suits memorial and honor pieces.",
    sketch: "   ◉   \n ═════ \n▣  ▣  ▣\n▣  ▣  ▣",
  },
];

export function getTheme(id: string | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function getLayout(id: string | undefined): Layout {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

export function themeCss(t: Theme): string {
  const c = t.colors;
  return `:root{--bg:${c.bg};--surface:${c.surface};--surface-2:${c.surface2};--ink:${c.ink};--muted:${c.muted};--line:${c.line};--accent:${c.accent};--accent-ink:${c.accentInk};--band:${c.band};--band-ink:${c.bandInk};--stitch:${c.stitch};--radius:${t.radius};--font-display:'${t.fonts.display}',system-ui,sans-serif;--font-body:'${t.fonts.body}',system-ui,sans-serif;--display-case:${t.displayCase};--display-tracking:${t.displayTracking};color-scheme:${isDark(c.bg) ? "dark" : "light"}}`;
}

export function fontHref(t: Theme): string {
  const fam = (f: string, weights: string | null) => `family=${f.replace(/ /g, "+")}${weights ? `:wght@${weights}` : ""}`;
  const body = fam(t.fonts.body, "400;600;700");
  const parts = t.fonts.display === t.fonts.body ? [body] : [fam(t.fonts.display, SINGLE_WEIGHT.includes(t.fonts.display) ? null : "700"), body];
  return `https://fonts.googleapis.com/css2?${parts.join("&")}&display=swap`;
}

// Google Fonts that only come in one weight (asking for 700 would fail)
const SINGLE_WEIGHT = ["Saira Stencil One", "Alfa Slab One", "Anton", "Graduate", "Black Ops One", "Allerta Stencil", "Patua One", "Ultra"];

/** Light background patterns, drawn with CSS so there are no image files to manage. */
export function textureCss(t: Theme): string {
  const c = t.colors;
  const mix = (hex: string, pct: number) => `color-mix(in srgb, ${hex} ${pct}%, transparent)`;
  const star = (hex: string, op: number) =>
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Cpath d='M28 17l3 6.3 6.9 1-5 4.8 1.2 6.9L28 32.7l-6.1 3.3 1.2-6.9-5-4.8 6.9-1z' fill='%23${hex.slice(1)}' fill-opacity='${op}'/%3E%3C/svg%3E")`;
  let band = "none";
  let hero = "none";
  switch (t.texture) {
    case "stars":
      band = star(c.stitch, 0.13);
      hero = star(c.stitch, 0.07);
      break;
    case "stripes":
      band = `repeating-linear-gradient(0deg, ${mix(c.bandInk, 7)} 0 7px, transparent 7px 14px)`;
      hero = `repeating-linear-gradient(0deg, ${mix(c.accent, 5)} 0 12px, transparent 12px 24px)`;
      break;
    case "camo": {
      // three-tone organic blobs on a 240px tile
      const camo = (t1: string, o1: number, t2: string, o2: number, t3: string, o3: number) => {
        const f = (hex: string, o: number) => `fill='%23${hex.slice(1)}' fill-opacity='${o}'`;
        const shapes = [
          `M10 40c20-25 60-20 70 0s-5 40-30 38-55-15-40-38z' ${f(t1, o1)}`,
          `M120 20c30-10 70 5 75 30s-30 30-50 20-55-40-25-50z' ${f(t2, o2)}`,
          `M60 120c25-20 75-10 80 15s-25 50-55 40-45-35-25-55z' ${f(t3, o3)}`,
          `M170 110c20-15 60 0 60 25s-20 45-45 35-35-45-15-60z' ${f(t1, o1)}`,
          `M20 180c25-10 55 0 60 20s-20 35-45 30-35-40-15-50z' ${f(t2, o2)}`,
          `M120 190c30-20 80 0 80 25s-40 25-60 20-45-30-20-45z' ${f(t3, o3)}`,
          `M200 60c12-8 35-2 36 12s-18 20-30 14-18-18-6-26z' ${f(t3, o3)}`,
          `M90 70c10-10 30-6 30 6s-14 18-24 14-14-12-6-20z' ${f(t1, o1)}`,
        ];
        return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E${shapes.map((d) => `%3Cpath d='${d}/%3E`).join("")}%3C/svg%3E")`;
      };
      band = camo("#000000", 0.2, c.stitch, 0.22, c.bg, 0.1);
      hero = camo(c.accent, 0.08, c.stitch, 0.16, c.ink, 0.05);
      break;
    }
    case "woodgrain":
      band = `repeating-linear-gradient(176deg, ${mix(c.bandInk, 5)} 0 2px, transparent 2px 9px, ${mix(c.bandInk, 3)} 9px 10px, transparent 10px 23px)`;
      hero = `repeating-linear-gradient(177deg, ${mix(c.accent, 6)} 0 1px, transparent 1px 11px, ${mix(c.accent, 4)} 11px 13px, transparent 13px 29px)`;
      break;
  }
  const size = t.texture === "camo" ? "240px 240px" : t.texture === "stars" ? "56px 56px" : "auto";
  return `:root{--tex-band:${band};--tex-hero:${hero};--tex-size:${size}}`;
}

function isDark(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
}
