import localFont from "next/font/local";

/**
 * Typeface loading. See docs/typography.md for the rules these files exist
 * to serve. Everything is self-hosted: no third-party request, no layout
 * shift on first paint.
 */

/**
 * Default display face, Redaction at wear level 10.
 *
 * `optional` rather than `swap` because this face renders the largest text
 * on the page and is therefore almost always the LCP element. If it has not
 * arrived in time, keeping the fallback is preferable to reflowing a
 * headline that occupies half the viewport.
 */
export const displayClean = localFont({
  src: "../fonts/Redaction_10-Regular.woff2",
  variable: "--font-redaction-10",
  weight: "400",
  style: "normal",
  display: "optional",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/**
 * Worn display face, Redaction at wear level 50, used for older pieces of
 * the archive. Never preloaded and never part of the global bundle: only
 * the routes that actually render it pull it in.
 */
export const displayWorn = localFont({
  src: "../fonts/Redaction_50-Regular.woff2",
  variable: "--font-redaction-50",
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/** Reading face. One variable file covers weights 400 through 600. */
export const text = localFont({
  src: "../fonts/Author-Variable.woff2",
  variable: "--font-author",
  weight: "200 700",
  style: "normal",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
});

/** Archive punctuation: references, dates, tags, field labels. */
export const meta = localFont({
  src: "../fonts/Sligoil-Micro.woff2",
  variable: "--font-sligoil",
  weight: "400",
  style: "normal",
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
});

export const fontVariables = [
  displayClean.variable,
  text.variable,
  meta.variable,
].join(" ");
