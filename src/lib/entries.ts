import { cache } from "react";
import { db } from "./db";
import type { Locale } from "@/i18n/routing";

/**
 * Read side of the archive.
 *
 * Queries return a flattened shape rather than the raw Prisma records. The
 * views should not have to know that a title lives in a translation table or
 * that a repository URL lives in a satellite, and keeping that knowledge here
 * means the storage layout can change without touching a component.
 *
 * `cache` deduplicates within a single render pass: the page and its metadata
 * both need the same entries, and neither should have to pass them to the
 * other to avoid a second round trip.
 */

const localeColumn = { en: "EN", fr: "FR" } as const;

export type ArchiveEntry = {
  slug: string;
  number: number;
  kind: "PROJECT" | "WORLD" | "CREDENTIAL" | "POSITION" | "WRITING";
  dimension: "BUILD" | "LEAD" | "CREATE" | null;
  accent: "GOLD" | "CRIMSON" | "VIOLET";
  wear: "CLEAN" | "WORN";
  featured: boolean;
  startedOn: Date | null;
  endedOn: Date | null;
  title: string;
  summary: string | null;
  body: string | null;
  stack: string[];
  repositoryUrl: string | null;
  liveUrl: string | null;
};

/* Only ever selects published rows. Draft filtering belongs at the query
   layer: leaving it to callers means the first forgotten filter leaks
   unfinished work. */
const publishedOnly = { status: "PUBLISHED" } as const;

export const listEntries = cache(
  async (locale: Locale): Promise<ArchiveEntry[]> => {
    const rows = await db.entry.findMany({
      where: publishedOnly,
      orderBy: [{ featured: "desc" }, { number: "asc" }],
      include: {
        translations: { where: { locale: localeColumn[locale] } },
        project: true,
      },
    });

    return rows.flatMap((row) => {
      const translation = row.translations[0];

      /* An entry with no translation in the requested language is skipped
         rather than shown under a fallback language. A half-translated
         archive reads worse than a shorter one. */
      if (!translation) {
        return [];
      }

      return [
        {
          slug: row.slug,
          number: row.number,
          kind: row.kind,
          dimension: row.dimension,
          accent: row.accent,
          wear: row.wear,
          featured: row.featured,
          startedOn: row.startedOn,
          endedOn: row.endedOn,
          title: translation.title,
          summary: translation.summary,
          body: translation.body,
          stack: row.project?.stack ?? [],
          repositoryUrl: row.project?.repositoryUrl ?? null,
          liveUrl: row.project?.liveUrl ?? null,
        },
      ];
    });
  },
);

export const countEntries = cache(async (): Promise<number> => {
  return db.entry.count({ where: publishedOnly });
});
