# Zardonis

An archive of things I build, shape and imagine.

This is not a portfolio in the usual sense. It is an archive: numbered
entries covering product work, engineering, worldbuilding, credentials and
positions, held in one system and served in English and French.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, React 19 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4, CSS-first tokens |
| Database | PostgreSQL 18 |
| ORM | Prisma 7 |
| Localisation | next-intl 4 |

TypeScript is held at 5.9 on purpose. `typescript-eslint`, which
`eslint-config-next` depends on, declares a peer range of `>=4.8.4 <6.1.0`,
so moving to TypeScript 7 would break linting.

## Requirements

- Node.js 24
- PostgreSQL 18 running locally

## Getting started

```bash
npm install
cp .env.example .env   # then set DATABASE_URL to your local instance
npm run db:generate
npm run db:migrate
npm run dev
```

The site is served at `http://localhost:3000/en` and
`http://localhost:3000/fr`. The unprefixed root redirects.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Type check without emitting |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:studio` | Browse the database |
| `npm run test:e2e` | End to end tests against a running server |

## Search

The production origin is `https://zardonis.skill-uv.com`.

`NEXT_PUBLIC_SITE_URL` **must be set at build time in production**. Canonical
URLs, language alternates, the sitemap and the share images are all absolute,
and without it every one of them points at `http://localhost:3000`. It is the
single setting that can silently ruin the indexing of the whole site.

What is in place:

- Every page prerendered as static HTML, in both languages.
- Canonical URLs and reciprocal `hreflang` alternates including `x-default`.
- `sitemap.xml` generated from the database, with per-URL language alternates
  and a `lastModified` taken from the entry itself.
- `robots.txt` pointing at the sitemap.
- JSON-LD on every page: `Person`, `WebSite`, `ProfilePage`, `CollectionPage`,
  `SoftwareSourceCode` or `CreativeWork` per entry, and `BreadcrumbList`. The
  nodes cross-reference each other by id, so one graph per page resolves in a
  single pass.
- Share images rendered at build time in the site's own typefaces, generic per
  language and specific per archive entry.

The `Person` node is the part that matters most. The same person is searched
for as Jérémie, Zardonis, ZITTI and Flemart, and nothing tells a search engine
those are one person unless `alternateName` says so. `sameAs` then anchors the
claim to profiles the engine already knows, which is what turns a page about a
name into a page about a person.

## Console

A single account reads the messages the contact form collects, at
`/console/<path>` where the path is generated rather than chosen.

```bash
npm run console:secrets   # prints CONSOLE_PATH, ADMIN_PASSWORD_HASH, AUTH_SECRET
```

Copy the three into `.env`. The path is not a security boundary and is not
treated as one: it keeps scanners away from the login form, and the password
and the signed session hold the door. A wrong path answers 404 rather than
showing a login form, since a scanner that finds one knows there is something
behind it.

`ADMIN_PASSWORD_HASH` is a bootstrap. The first login with it creates the
account row, and the console then refuses to go anywhere but the password
screen until a new one is chosen: the value in `.env` has been copied, pasted
and left on screen in a terminal, so it is treated as temporary rather than as
the credential. From then on the row is the only password that counts and the
environment value is dead. Both are scrypt digests, never the password itself,
and the new one is refused if it is shorter than twelve characters, if the
confirmation differs, or if it is the one being replaced.

Sessions last twelve hours and are signed with `AUTH_SECRET`; changing that
value closes every open session at once.

The console manages the messages and everything the site reads from the
database: archive entries with both translations and their kind specific
fields, organisations, media, and the public profiles.

Media is stored in MinIO and is optional: without the variables the section
still lists and edits existing records and refuses uploads, rather than writing
a row that points at a file nobody wrote. On upload the image is measured and a
twenty pixel placeholder is generated, both stored beside the object key, and
the filename is generated rather than taken from the upload. Alternative text
is asked for in both languages on the same screen as the file, because it is
the field everyone means to fill in later.

Mail is optional. Without `RESEND_API_KEY` and `MAIL_FROM` the console still
reads, files and records replies, and the reply is sent by hand from any mail
client. With them it leaves from here. The reply is written to the database
before it is sent either way, because a reply lost to a mail provider's bad
afternoon is worse than one saved and not yet delivered.

## Curriculum vitae

`/{locale}/cv.pdf` draws the document from the same tables the pages read:
positions, credentials, the selected archive and the public profiles. It is
laid out by hand with pdf-lib, in the site's own faces, and rebuilt on the
same hourly schedule as the pages.

The two OpenType faces are embedded whole rather than subset: pdf-lib's
subsetting produces a CFF table that some readers refuse, and a document that
falls back to a substitute font on a recruiter's machine is not worth the
forty kilobytes. The two TrueType weights of Author are generated from the
variable file by `scripts/pdf-fonts.py` and committed, since fontTools is not
a build dependency.

## Missing addresses

`app/[locale]/not-found.tsx` answers both cases: an entry that no longer exists
and an address that never did. The second needs the catch-all at
`app/[locale]/[...rest]`, because an unmatched path otherwise leaves the
localised tree and gets the framework's own page.

One consequence is worth knowing. The root layout is under a dynamic segment,
so Next has no static shell to put a not-found page in and delivers it through
the streaming payload instead of the first HTML. The status code is 404 and
every reader with JavaScript sees the page; a reader without it sees an empty
one. Next's `globalNotFound` would fix that at the cost of an experimental flag
and a second, unlocalised 404 template.

## Tests

```bash
npm run build && npm run start
E2E_PASSWORD=<the bootstrap password> npm run test:e2e
```

The suite drives the site the way a browser without JavaScript does: it reads
each page, takes the fields the markup renders, fills the ones it is about and
posts them back. Every console form is a server action reached by a plain
multipart POST, so nothing has to be simulated and nothing is mocked. A test
that posted a hand written body would keep passing after a field was renamed in
the page and dropped from the action, which is the failure worth catching.

It covers the public routes in both languages, the sitemap, a missing entry, a
wrong console path, the login, the forced first password and each of its
refusals, and a full create, read, update and delete cycle for entries,
organisations, profiles, media and messages, including the edit reaching the
public page and the deletion the console is supposed to refuse.

It runs against the real database. The account row is emptied at the start, so
the password flow is tested from its first state, and again at the end, so the
bootstrap digest keeps working. Everything else the run creates is deleted by
the end, which is also how the deletes are tested. Media is skipped when there
is no object store configured.

## Content model

Everything that changes over time lives in the database, never in the code.
The model is built around a single `Entry`, which carries what all archive
entries share: a number, a status, a colour accent and a degree of
typographic wear. Data specific to one kind of entry lives in a satellite
table joined one to one, so adding a content type does not disturb
numbering or translations.

Translatable text sits in dedicated translation tables rather than in
per-locale JSON columns, which keeps per-language full text search available
in Postgres.

## Design system

The art direction is documented in `docs/typography.md`. Two points govern
most of the implementation.

Colour roles are separated from colour values in `src/app/globals.css`.
Components consume roles such as `--color-content` or `--color-accent` and
never a pigment directly, which is what allows the theme to flip without
touching a single component.

Contrast decides more than taste does. Against the dark ground, crimson
measures 2.8:1 and violet 1.7:1, so crimson is confined to display sizes and
violet can only be a surface. Against the light ground the relationship
inverts: both become usable ink, and gold has to fall back to a deeper cut.

## Typefaces

Self-hosted, no third-party request. Licences are kept in
`src/fonts/licenses`.

- **Redaction** by Forest Young and Jeremy Mickel, commissioned by Titus
  Kaphar and Reginald Dwayne Betts for The Redaction at MoMA PS1. SIL Open
  Font License.
- **Author** by Indian Type Foundry, distributed through Fontshare.
- **Sligoil** by Ariel Martin Perez, published by Velvetyne. SIL Open Font
  License.
