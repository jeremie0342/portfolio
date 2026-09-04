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
- One word of the front page statement turns in place, between products,
  solutions and worlds. Only the current word is in the document, and the box is
  sized from a measurement so the sentence neither jumps nor sits in a gap.
- Gold marker strokes under the three verbs of the front page statement, pulled
  left to right on hover. The word takes the surface colour as the stroke
  passes: ivory on gold measures 2.3:1, so a highlighted word that kept its
  colour would be less readable than the sentence around it. Without a pointer
  the strokes are simply drawn, so the emphasis survives on a phone.
- French messages use the typographic apostrophe. It is the correct form, and
  the straight one is the ICU escape character, which had silently swallowed a
  marker tag after "j'".
- The wordmark is ZARDONIS rather than the handle, in the masthead, the opening
  and the metadata, set in Redaction at the coarsest degree of wear so the mark
  and the first frame of the opening are the same object.
- A site icon cut from the typeface itself: the Z of Redaction 100, extracted
  as an outline so the file carries no font dependency.
- An opening in three movements. The wordmark wears from the reading face
  towards degree 100, which is the face of the logo, so the last frame of the
  sequence is already the mark itself. It then travels onto the real masthead,
  measured and scaled rather than morphed. The page arrives around it section by
  section. The five wear degrees are subset to eight glyphs and weigh 4.6 KB
  together. It waits on the fonts rather than on a fixed delay, hides nothing
  from crawlers or screen readers, and everything that holds the page back sits
  inside a reduced motion query so no script decides that.
- Stamps as calls to action on the front page: a double ruled mark, uppercase
  meta type, tilted, in gold. Gold rather than crimson because a control's
  boundary needs 3:1 to be perceivable and crimson measures 2.8:1 against the
  dark ground.
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
