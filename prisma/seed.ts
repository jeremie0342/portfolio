import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { entries, organizations, profiles } from "./seed-data";

/**
 * Writes the archive contents into the database.
 *
 * The contents live in seed-data.ts; this file only knows how to apply them.
 * The script is idempotent: everything is keyed by slug or name and upserted,
 * so it can be rerun after the copy is edited without duplicating anything,
 * and entries the data no longer describes are removed.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/* Archive numbers are unique, so renumbering an existing archive collides with
   itself halfway through the upsert loop. Existing rows are moved out of the
   way first, into a range the seed never writes to, and whatever still sits
   there at the end is an entry the seed no longer describes. */
const PARKING = 10_000;

async function main() {
  await db.$executeRaw`UPDATE "Entry" SET number = number + ${PARKING} WHERE number < ${PARKING}`;

  for (const profile of profiles) {
    await db.profile.upsert({
      where: { url: profile.url },
      create: profile,
      update: profile,
    });
  }

  const organizationIds = new Map<string, string>();

  for (const organization of organizations) {
    const record = await db.organization.upsert({
      where: { name: organization.name },
      create: organization,
      update: organization,
    });

    organizationIds.set(organization.name, record.id);
  }

  const entryIds = new Map<string, string>();

  /* Two passes over the entries. A parent has to exist before a child can
     point at one, and ordering the data by depth would only hold as long as
     the tree stays one level deep. */
  for (const entry of entries) {
    /* Fields are listed rather than spread from a rest object: the seed shape
       carries keys the table does not have, and a rest spread would only
       surface that at runtime. */
    const record = await db.entry.upsert({
      where: { slug: entry.slug },
      create: {
        slug: entry.slug,
        number: entry.number,
        kind: entry.kind,
        status: entry.status,
        dimension: entry.dimension,
        accent: entry.accent,
        wear: entry.wear,
        featured: entry.featured,
        rank: entry.rank ?? 0,
        startedOn: new Date(entry.startedOn),
        endedOn: entry.endedOn ? new Date(entry.endedOn) : null,
        publishedAt: entry.status === "PUBLISHED" ? new Date() : null,
      },
      update: {
        number: entry.number,
        kind: entry.kind,
        status: entry.status,
        dimension: entry.dimension,
        accent: entry.accent,
        wear: entry.wear,
        featured: entry.featured,
        rank: entry.rank ?? 0,
        startedOn: new Date(entry.startedOn),
        endedOn: entry.endedOn ? new Date(entry.endedOn) : null,
        publishedAt: entry.status === "PUBLISHED" ? new Date() : null,
      },
    });

    entryIds.set(entry.slug, record.id);

    for (const [locale, translation] of [
      ["EN", entry.en],
      ["FR", entry.fr],
    ] as const) {
      const payload = {
        title: translation.title,
        summary: translation.summary,
        body: translation.body ?? null,
      };

      await db.entryTranslation.upsert({
        where: { entryId_locale: { entryId: record.id, locale } },
        create: { entryId: record.id, locale, ...payload },
        update: payload,
      });
    }

    if (entry.kind === "PROJECT") {
      const satellite = {
        repositoryUrl: entry.repositoryUrl ?? null,
        liveUrl: entry.liveUrl ?? null,
        stack: entry.stack ?? [],
      };

      await db.project.upsert({
        where: { entryId: record.id },
        create: { entryId: record.id, ...satellite },
        update: satellite,
      });
    }

    if (entry.kind === "WORLD") {
      await db.world.upsert({
        where: { entryId: record.id },
        create: { entryId: record.id },
        update: {},
      });
    }

    if (entry.kind === "POSITION") {
      const organizationId = organizationIds.get(entry.organization ?? "");

      if (!organizationId) {
        throw new Error(`Unknown organization for ${entry.slug}`);
      }

      const satellite = {
        organizationId,
        location: entry.location ?? null,
        remote: entry.remote ?? false,
      };

      await db.position.upsert({
        where: { entryId: record.id },
        create: { entryId: record.id, ...satellite },
        update: satellite,
      });
    }

    if (entry.kind === "CREDENTIAL") {
      const issuerId = organizationIds.get(entry.organization ?? "");

      if (!issuerId) {
        throw new Error(`Unknown issuer for ${entry.slug}`);
      }

      const satellite = {
        issuerId,
        kind: entry.credentialKind ?? "DEGREE",
        issuedOn: entry.endedOn ? new Date(entry.endedOn) : null,
      };

      await db.credential.upsert({
        where: { entryId: record.id },
        create: { entryId: record.id, ...satellite },
        update: satellite,
      });
    }
  }

  for (const entry of entries) {
    const parentId = entry.parent ? entryIds.get(entry.parent) : null;

    if (entry.parent && !parentId) {
      throw new Error(`Unknown parent "${entry.parent}" for ${entry.slug}`);
    }

    await db.entry.update({
      where: { slug: entry.slug },
      data: { parentId: parentId ?? null },
    });

    const indent = entry.parent ? "    " : "";
    const number = String(entry.number).padStart(3, "0");
    console.log(`${indent}${number}  ${entry.kind.padEnd(10)}  ${entry.slug}`);
  }

  const stale = await db.entry.deleteMany({
    where: { number: { gte: PARKING } },
  });

  if (stale.count > 0) {
    console.log(`\nRemoved ${stale.count} entries no longer in the seed.`);
  }

  const counts = await db.entry.groupBy({
    by: ["kind"],
    where: { status: "PUBLISHED" },
    _count: true,
  });

  console.log(
    "\n" + counts.map((c) => `${c._count} ${c.kind.toLowerCase()}`).join(", "),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
