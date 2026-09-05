import { defineRouting } from "next-intl/routing";

/**
 * Both locales carry a prefix, including the default one.
 *
 * An unprefixed root would mean serving two different documents under one
 * URL depending on the visitor's Accept-Language header, which makes the
 * canonical and alternate tags ambiguous and confuses indexing.
 */
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  localePrefix: "always",
  /**
   * The root always leads to English rather than to whatever the browser asks
   * for. Negotiation is the friendlier default in general, but it makes the
   * site answer differently to two readers at the same address, and it means
   * the language a link was shared in is not the language it opens in. The
   * switch in the masthead is one click away and, unlike a header, it is
   * something the reader chose.
   */
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
