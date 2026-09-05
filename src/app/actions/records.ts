"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSession, isGate } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Writes for everything the console manages.
 *
 * Each action guards itself. A server action is a public endpoint whatever page
 * renders the form that calls it, so a check in the page it was reached from
 * protects the view and nothing else.
 *
 * Every write revalidates the whole tree rather than the paths it touched.
 * Editing an organisation changes a career page, editing an entry changes the
 * front page, the index, its own page and possibly its parent's, and working
 * out which is a calculation that will be wrong the first time the pages move.
 * This site is a few dozen pages; correctness is worth more than the
 * difference.
 */

async function guard(gate: string) {
  if (!isGate(gate) || !(await hasSession())) {
    redirect("/");
  }
}

function refresh() {
  revalidatePath("/", "layout");
}

function text(form: FormData, key: string) {
  const value = String(form.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function date(form: FormData, key: string) {
  const value = text(form, key);
  return value ? new Date(value) : null;
}

// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------

export async function saveEntry(form: FormData) {
  const gate = String(form.get("gate") ?? "");
  await guard(gate);

  const id = text(form, "id");
  const kind = String(form.get("kind") ?? "PROJECT") as
    | "PROJECT"
    | "WORLD"
    | "CREDENTIAL"
    | "POSITION"
    | "WRITING";
  const status = String(form.get("status") ?? "DRAFT") as "DRAFT" | "PUBLISHED";

  const base = {
    slug: String(form.get("slug") ?? "").trim(),
    number: Number(form.get("number") ?? 0),
    kind,
    status,
    dimension: (text(form, "dimension") ?? null) as
      | "BUILD"
      | "LEAD"
      | "CREATE"
      | null,
    accent: String(form.get("accent") ?? "GOLD") as
      | "GOLD"
      | "CRIMSON"
      | "VIOLET",
    wear: String(form.get("wear") ?? "CLEAN") as "CLEAN" | "WORN",
    featured: form.get("featured") === "on",
    rank: Number(form.get("rank") ?? 0),
    parentId: text(form, "parentId"),
    startedOn: date(form, "startedOn"),
    endedOn: date(form, "endedOn"),
    /* Stamped when it first goes public and left alone afterwards, so a later
       edit does not tell a reader the piece is new. */
    publishedAt: status === "PUBLISHED" ? new Date() : null,
  };

  if (!base.slug || !base.number) {
    return;
  }

  const entry = id
    ? await db.entry.update({
        where: { id },
        data: {
          ...base,
          publishedAt: undefined,
          ...(status === "PUBLISHED" ? {} : { publishedAt: null }),
        },
      })
    : await db.entry.create({ data: base });

  if (status === "PUBLISHED" && !id) {
    await db.entry.update({
      where: { id: entry.id },
      data: { publishedAt: new Date() },
    });
  }

  for (const locale of ["EN", "FR"] as const) {
    const key = locale.toLowerCase();

    const payload = {
      title: String(form.get(`${key}Title`) ?? "").trim(),
      summary: text(form, `${key}Summary`),
      body: text(form, `${key}Body`),
      seoTitle: text(form, `${key}SeoTitle`),
      seoDescription: text(form, `${key}SeoDescription`),
    };

    if (!payload.title) {
      /* A translation with no title is not a translation. The read layer drops
         entries missing one, so writing an empty row would hide the entry in
         that language without saying why. */
      continue;
    }

    await db.entryTranslation.upsert({
      where: { entryId_locale: { entryId: entry.id, locale } },
      create: { entryId: entry.id, locale, ...payload },
      update: payload,
    });
  }

  /* The satellite is replaced rather than merged, and only the one matching the
     kind is written. Changing an entry from a project to a world leaves the old
     satellite orphaned otherwise, and the page would read from it. */
  await Promise.all([
    kind === "PROJECT" ? Promise.resolve() : db.project.deleteMany({ where: { entryId: entry.id } }),
    kind === "WORLD" ? Promise.resolve() : db.world.deleteMany({ where: { entryId: entry.id } }),
    kind === "POSITION" ? Promise.resolve() : db.position.deleteMany({ where: { entryId: entry.id } }),
    kind === "CREDENTIAL" ? Promise.resolve() : db.credential.deleteMany({ where: { entryId: entry.id } }),
  ]);

  if (kind === "PROJECT") {
    const satellite = {
      repositoryUrl: text(form, "repositoryUrl"),
      liveUrl: text(form, "liveUrl"),
      stack: String(form.get("stack") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    await db.project.upsert({
      where: { entryId: entry.id },
      create: { entryId: entry.id, ...satellite },
      update: satellite,
    });
  }

  if (kind === "WORLD") {
    const satellite = { era: text(form, "era") };

    await db.world.upsert({
      where: { entryId: entry.id },
      create: { entryId: entry.id, ...satellite },
      update: satellite,
    });
  }

  if (kind === "POSITION") {
    const organizationId = text(form, "organizationId");

    if (organizationId) {
      const satellite = {
        organizationId,
        location: text(form, "location"),
        remote: form.get("remote") === "on",
      };

      await db.position.upsert({
        where: { entryId: entry.id },
        create: { entryId: entry.id, ...satellite },
        update: satellite,
      });
    }
  }

  if (kind === "CREDENTIAL") {
    const issuerId = text(form, "issuerId");

    if (issuerId) {
      const satellite = {
        issuerId,
        kind: String(form.get("credentialKind") ?? "DEGREE") as
          | "DEGREE"
          | "CERTIFICATION"
          | "COURSE"
          | "AWARD",
        issuedOn: date(form, "issuedOn"),
        expiresOn: date(form, "expiresOn"),
        reference: text(form, "reference"),
        verifyUrl: text(form, "verifyUrl"),
      };

      await db.credential.upsert({
        where: { entryId: entry.id },
        create: { entryId: entry.id, ...satellite },
        update: satellite,
      });
    }
  }

  refresh();
  redirect(`/console/${gate}/entries/${entry.id}`);
}

export async function deleteEntry(form: FormData) {
  const gate = String(form.get("gate") ?? "");
  await guard(gate);

  const id = text(form, "id");

  if (id) {
    /* Children are detached rather than deleted with the parent. Losing a
       platform should not silently take four services with it. */
    await db.entry.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });

    await db.entry.delete({ where: { id } });
  }

  refresh();
  redirect(`/console/${gate}/entries`);
}

// ---------------------------------------------------------------------------
// Organisations
// ---------------------------------------------------------------------------

export async function saveOrganization(form: FormData) {
  const gate = String(form.get("gate") ?? "");
  await guard(gate);

  const id = text(form, "id");
  const data = {
    name: String(form.get("name") ?? "").trim(),
    url: text(form, "url"),
    country: text(form, "country"),
  };

  if (!data.name) {
    return;
  }

  if (id) {
    await db.organization.update({ where: { id }, data });
  } else {
    await db.organization.create({ data });
  }

  refresh();
  redirect(`/console/${gate}/organizations`);
}

export async function deleteOrganization(form: FormData) {
  const gate = String(form.get("gate") ?? "");
  await guard(gate);

  const id = text(form, "id");

  if (id) {
    const used = await db.entry.count({
      where: {
        OR: [
          { position: { organizationId: id } },
          { credential: { issuerId: id } },
        ],
      },
    });

    /* Refused rather than cascaded. An organisation still attached to a
       position or a degree is load-bearing, and deleting it would take the
       entry with it. */
    if (used === 0) {
      await db.organization.delete({ where: { id } });
    }
  }

  refresh();
  redirect(`/console/${gate}/organizations`);
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export async function saveProfile(form: FormData) {
  const gate = String(form.get("gate") ?? "");
  await guard(gate);

  const id = text(form, "id");
  const data = {
    label: String(form.get("label") ?? "").trim(),
    handle: String(form.get("handle") ?? "").trim(),
    url: String(form.get("url") ?? "").trim(),
    rank: Number(form.get("rank") ?? 0),
    listed: form.get("listed") === "on",
  };

  if (!data.label || !data.url) {
    return;
  }

  if (id) {
    await db.profile.update({ where: { id }, data });
  } else {
    await db.profile.create({ data });
  }

  refresh();
  redirect(`/console/${gate}/profiles`);
}

export async function deleteProfile(form: FormData) {
  const gate = String(form.get("gate") ?? "");
  await guard(gate);

  const id = text(form, "id");

  if (id) {
    await db.profile.delete({ where: { id } });
  }

  refresh();
  redirect(`/console/${gate}/profiles`);
}
