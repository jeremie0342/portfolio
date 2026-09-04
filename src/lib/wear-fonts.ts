import localFont from "next/font/local";

/**
 * The wear sequence used by the opening loader.
 *
 * Redaction ships each degree of print wear as its own family, so animating
 * from a coarse halftone to a sharp letter means loading several files rather
 * than interpolating an axis. Each of these is subset to the seven glyphs of
 * the wordmark, which brings the whole sequence to about four kilobytes:
 * cheaper than a small logo image, and it is the typeface doing the work
 * rather than a picture of it.
 *
 * Counter-intuitively the coarse degrees are the small files. A finer halftone
 * means more dots to describe, so degree 10 is the heaviest of the family and
 * degree 100 the lightest.
 *
 * Every call repeats its options rather than spreading a shared object:
 * next/font is evaluated at build time and reads these literals directly, so a
 * spread is not something it can follow.
 *
 * `display: "block"` rather than "swap" because a fallback face flashing
 * through the sequence would read as a glitch rather than as a document coming
 * into focus. The block period is short and these files are tiny.
 */

const wear100 = localFont({
  src: "../fonts/wear/Redaction100-Flemart.woff2",
  variable: "--font-wear-100",
  weight: "400",
  style: "normal",
  display: "block",
  preload: true,
});

const wear70 = localFont({
  src: "../fonts/wear/Redaction70-Flemart.woff2",
  variable: "--font-wear-70",
  weight: "400",
  style: "normal",
  display: "block",
  preload: true,
});

const wear50 = localFont({
  src: "../fonts/wear/Redaction50-Flemart.woff2",
  variable: "--font-wear-50",
  weight: "400",
  style: "normal",
  display: "block",
  preload: true,
});

const wear35 = localFont({
  src: "../fonts/wear/Redaction35-Flemart.woff2",
  variable: "--font-wear-35",
  weight: "400",
  style: "normal",
  display: "block",
  preload: true,
});

const wear20 = localFont({
  src: "../fonts/wear/Redaction20-Flemart.woff2",
  variable: "--font-wear-20",
  weight: "400",
  style: "normal",
  display: "block",
  preload: true,
});

export const wearVariables = [
  wear100.variable,
  wear70.variable,
  wear50.variable,
  wear35.variable,
  wear20.variable,
].join(" ");

/**
 * The sequence, coarsest first. The last step is the ordinary display face,
 * already loaded for the page itself, so arriving at it is literally the
 * document settling into the type the rest of the site is set in.
 */
export const wearSequence = [
  "var(--font-wear-100)",
  "var(--font-wear-70)",
  "var(--font-wear-50)",
  "var(--font-wear-35)",
  "var(--font-wear-20)",
  "var(--font-redaction-10)",
] as const;
