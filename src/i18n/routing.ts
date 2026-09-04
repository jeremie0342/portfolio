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
});

export type Locale = (typeof routing.locales)[number];
