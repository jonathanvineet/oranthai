import localFont from "next/font/local";

// Self-hosted from the @fontsource packages through next/font, which adds preloading and
// metric-matched fallbacks (no layout shift when the real font arrives).
export const fraunces = localFont({
  src: [
    { path: "../../node_modules/@fontsource/fraunces/files/fraunces-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../node_modules/@fontsource/fraunces/files/fraunces-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--ff-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const outfit = localFont({
  src: [
    { path: "../../node_modules/@fontsource/outfit/files/outfit-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/outfit/files/outfit-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../node_modules/@fontsource/outfit/files/outfit-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--ff-body",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  // Not preloaded: the metric-matched fallback holds the layout until it swaps in, and keeping
  // these requests off the first-paint path measurably helps LCP on slow phones.
  preload: false,
});

export const notoTamil = localFont({
  src: [{ path: "../../node_modules/@fontsource/noto-sans-tamil/files/noto-sans-tamil-tamil-500-normal.woff2", weight: "500", style: "normal" }],
  variable: "--ff-tamil",
  display: "swap",
  // Only the Kural uses it, well below the fold.
  preload: false,
});
