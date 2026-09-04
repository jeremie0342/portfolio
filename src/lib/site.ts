/**
 * Canonical URLs and alternates need an absolute origin. In development it
 * falls back to the local host so metadata output stays inspectable without
 * any configuration.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteName = "Zardonis";
