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

## Search

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
