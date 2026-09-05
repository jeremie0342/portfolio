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

/* Positions and credentials are entries like any other, but they belong to the
   career page rather than to the archive. Listing a job alongside a project
   would say they are the same kind of thing, and they are not: one is work,
   the other is where the work happened. */
const archiveKinds: { in: ("PROJECT" | "WORLD")[] } = {
  in: ["PROJECT", "WORLD"],
};

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
      where: { ...published, parentId: null, kind: archiveKinds },
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
      where: { ...published, parentId: null, featured: true, kind: archiveKinds },
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

/** Slugs for static generation. Children have pages of their own too.
    Positions and credentials do not: a job title and two lines of summary make
    a thin page, and thin pages are worth less than the link that led to them. */
export const listSlugs = cache(async (): Promise<string[]> => {
  const rows = await db.entry.findMany({
    where: { ...published, kind: archiveKinds },
    select: { slug: true },
  });

  return rows.map((row) => row.slug);
});

export type CareerRecord = {
  slug: string;
  title: string;
  summary: string | null;
  organization: string;
  organizationUrl: string | null;
  location: string | null;
  startedOn: Date | null;
  endedOn: Date | null;
};

/** Positions, most recent first. */
export const listPositions = cache(
  async (locale: Locale): Promise<CareerRecord[]> => {
    const rows = await db.entry.findMany({
      where: { ...published, kind: "POSITION" },
      orderBy: { startedOn: "desc" },
      include: {
        translations: { where: { locale: localeColumn[locale] } },
        position: { include: { organization: true } },
      },
    });

    return rows.flatMap((row) => {
      const translation = row.translations[0];

      if (!translation || !row.position) {
        return [];
      }

      return [
        {
          slug: row.slug,
          title: translation.title,
          summary: translation.summary,
          organization: row.position.organization.name,
          organizationUrl: row.position.organization.url,
          location: row.position.location,
          startedOn: row.startedOn,
          endedOn: row.endedOn,
        },
      ];
    });
  },
);

/** Degrees, certifications and courses, most recent first. */
export const listCredentials = cache(
  async (locale: Locale): Promise<CareerRecord[]> => {
    const rows = await db.entry.findMany({
      where: { ...published, kind: "CREDENTIAL" },
      orderBy: { endedOn: "desc" },
      include: {
        translations: { where: { locale: localeColumn[locale] } },
        credential: { include: { issuer: true } },
      },
    });

    return rows.flatMap((row) => {
      const translation = row.translations[0];

      if (!translation || !row.credential) {
        return [];
      }

      return [
        {
          slug: row.slug,
          title: translation.title,
          summary: translation.summary,
          organization: row.credential.issuer.name,
          organizationUrl: row.credential.issuer.url,
          location: null,
          startedOn: row.startedOn,
          endedOn: row.credential.issuedOn ?? row.endedOn,
        },
      ];
    });
  },
);

/** Slugs with the dates and weighting a sitemap needs. */
export const listSitemapEntries = cache(
  async (): Promise<
    { slug: string; updatedAt: Date; featured: boolean }[]
  > => {
    return db.entry.findMany({
      where: { ...published, kind: archiveKinds },
      select: { slug: true, updatedAt: true, featured: true },
      orderBy: { number: "asc" },
    });
  },
);

export const archiveSize = cache(async (): Promise<number> => {
  return db.entry.count({ where: { ...published, kind: archiveKinds } });
});

export type PublicProfile = {
  label: string;
  handle: string;
  url: string;
};

/** Listed profiles, in the order they were curated. */
export const listProfiles = cache(async (): Promise<PublicProfile[]> => {
  return db.profile.findMany({
    where: { listed: true },
    orderBy: [{ rank: "asc" }, { label: "asc" }],
    select: { label: true, handle: true, url: true },
  });
});
