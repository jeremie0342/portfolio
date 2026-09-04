# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Next.js 16 application with the App Router, React 19 and the React
  Compiler enabled.
- Archive Nocturne design tokens, split into fixed pigments and themeable
  roles, with a dark and a light theme resolved before first paint.
- Self-hosted typographic system: Redaction for display, Author for reading,
  Sligoil for archive punctuation.
- English and French localisation with prefixed routes, per-locale metadata
  and alternate language tags.
- The system colour preference is honoured in CSS alone, so a visitor who never
  touched the control gets the right ground on the first paint with no script
  involved. Only an explicit override is applied from JavaScript.
- Prisma schema for the archive: a single numbered entry with satellite
  tables for projects, worlds, credentials and positions, and dedicated
  translation tables.
- Read layer over the archive, and an index page rendered from the database
  in both languages, prerendered and revalidated hourly.
- Seed drawn from real public repositories: Skilluv and its four services,
  the community governance repositories, the fourteen starters, the chess
  coach, and TrackMyWeight. Private work is seeded as a draft.
- Colour rules encoded in the components rather than restated per entry: a
  violet accent turns the section into a violet field instead of colouring the
  text, since violet cannot reach a readable contrast as ink.
- Entries nest. A body of work holds the services, starters and governance
  repositories that compose it, and the index lists only the top level.
- Three routes: a front page that introduces the person, the archive index,
  and an entry page that carries the pieces it contains.
- Language switch that keeps the reader on the same entry rather than
  returning them to the front page.
- A career page and a contact page, both linked from a summary on the front.
- Positions, organisations and credentials seeded from the curriculum vitae,
  and the professional work itself added to the archive: a multi-tenant SaaS
  platform, a civic technology platform, a diaspora campaign site, a production
  ETL pipeline, and the technical direction of a cultural product.
- Live GitHub activity on the front page, read from the public events feed with
  no token and degrading to nothing when the API is unavailable.
- A register voice: Sligoil at reading size and lowercase, confined to archive
  surfaces. The archive now speaks in the same hand it uses to label itself,
  while the front page and long-form bodies stay in Author.

### Notes

- ESLint is held at 9.x. The 10.x release breaks `eslint-plugin-react` as
  bundled by `eslint-config-next`.
- TypeScript is held at 5.9 for the peer range declared by
  `typescript-eslint`.
