import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";
import { listSitemapEntries } from "@/lib/entries";

/**
 * Every page, in every language, with each one pointing at its counterpart.
 *
 * The alternates matter more than the list does. Two languages of the same
 * page are not duplicates, but a crawler has to be told that, and the
 * declaration has to be reciprocal: each URL names every language including
 * itself, plus an x-default for a reader whose language matches neither.
 */
export const revalidate = 3600;

type Alternates = Record<string, string>;

function alternates(path: string): Alternates {
  const languages: Alternates = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`]),
  );

  languages["x-default"] = `${siteUrl}/${routing.defaultLocale}${path}`;

  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await listSitemapEntries();

  /* The front page is the entry point, the archive is the reason to stay, and
     the career and contact pages are what a recruiter came for. The priorities
     say so rather than defaulting to a flat 0.5 everywhere. */
  const pages = [
    { path: "", priority: 1, frequency: "weekly" as const },
    { path: "/archive", priority: 0.9, frequency: "weekly" as const },
    { path: "/about", priority: 0.8, frequency: "monthly" as const },
    { path: "/contact", priority: 0.7, frequency: "yearly" as const },
  ];

  const fixed = pages.flatMap(({ path, priority, frequency }) =>
    routing.locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: frequency,
      priority,
      alternates: { languages: alternates(path) },
    })),
  );

  const archive = entries.flatMap((entry) =>
    routing.locales.map((locale) => ({
      url: `${siteUrl}/${locale}/archive/${entry.slug}`,
      lastModified: entry.updatedAt,
      changeFrequency: "monthly" as const,
      /* Featured entries are the ones worth landing on. */
      priority: entry.featured ? 0.8 : 0.6,
      alternates: { languages: alternates(`/archive/${entry.slug}`) },
    })),
  );

  return [...fixed, ...archive];
}
