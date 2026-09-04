import { cache } from "react";
import { db } from "./db";
import type { Locale } from "@/i18n/routing";

/**
 * Read side of the archive.
 *
 * Queries return a flattened shape rather than raw Prisma records. A view
 * should not have to know that a title lives in a translation table or that a
 * repository URL lives in a satellite, and keeping that knowledge here means
 * the storage layout can change without touching a component.
 *
 * `cache` deduplicates within a single render pass: a page and its metadata
 * both need the same entry, and neither should have to pass it to the other
 * to avoid a second round trip.
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
  children: ArchiveEntry[];
};

/* Published filtering belongs at the query layer. Left to callers, the first
   forgotten filter leaks unfinished work. */
const published = { status: "PUBLISHED" } as const;

const shape = (locale: Locale) => ({
  translations: { where: { locale: localeColumn[locale] } },
  project: true,
});

type Row = {
  slug: string;
  number: number;
  kind: ArchiveEntry["kind"];
  dimension: ArchiveEntry["dimension"];
  accent: ArchiveEntry["accent"];
  wear: ArchiveEntry["wear"];
  featured: boolean;
  startedOn: Date | null;
  endedOn: Date | null;
  translations: { title: string; summary: string | null; body: string | null }[];
  project: {
    stack: string[];
    repositoryUrl: string | null;
    liveUrl: string | null;
  } | null;
};

/* An entry with no translation in the requested language is dropped rather
   than shown under a fallback. A half translated archive reads worse than a
   shorter one. */
function present(row: Row, children: ArchiveEntry[] = []): ArchiveEntry | null {
  const translation = row.translations[0];

  if (!translation) {
    return null;
  }

  return {
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
    children,
  };
}

/** Top level entries only. A child belongs to the page of its parent. */
export const listArchive = cache(
  async (locale: Locale): Promise<ArchiveEntry[]> => {
    const rows = await db.entry.findMany({
      where: { ...published, parentId: null },
      orderBy: { number: "asc" },
      include: shape(locale),
    });

    return rows.flatMap((row) => present(row) ?? []);
  },
);

/** The handful of entries that carry the front page. */
export const listSelected = cache(
  async (locale: Locale): Promise<ArchiveEntry[]> => {
    const rows = await db.entry.findMany({
      where: { ...published, parentId: null, featured: true },
      orderBy: { number: "asc" },
      include: shape(locale),
    });

    return rows.flatMap((row) => present(row) ?? []);
  },
);

export const getEntry = cache(
  async (locale: Locale, slug: string): Promise<ArchiveEntry | null> => {
    const row = await db.entry.findFirst({
      where: { ...published, slug },
      include: {
        ...shape(locale),
        children: {
          where: published,
          orderBy: { rank: "asc" },
          include: shape(locale),
        },
      },
    });

    if (!row) {
      return null;
    }

    const children = row.children.flatMap((child) => present(child) ?? []);

    return present(row, children);
  },
);

/** Slugs for static generation. Children have pages of their own too. */
export const listSlugs = cache(async (): Promise<string[]> => {
  const rows = await db.entry.findMany({
    where: published,
    select: { slug: true },
  });

  return rows.map((row) => row.slug);
});

export const archiveSize = cache(async (): Promise<number> => {
  return db.entry.count({ where: published });
});
