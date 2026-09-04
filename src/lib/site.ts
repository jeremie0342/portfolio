/**
 * Canonical URLs and alternates need an absolute origin. In development it
 * falls back to the local host so metadata output stays inspectable without
 * any configuration.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteName = "Zardonis";

/**
 * Language alternates for a path, including x-default.
 *
 * Two languages of one page are not duplicates, but a crawler has to be told
 * so, and the declaration has to be reciprocal: each URL names every language
 * including itself. x-default answers the reader whose language matches
 * neither, and pointing it at the default locale is the honest answer since
 * there is no unprefixed root to send them to.
 */
export function languageAlternates(path: string) {
  return {
    en: `/en${path}`,
    fr: `/fr${path}`,
    "x-default": `/en${path}`,
  };
}
