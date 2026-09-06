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
- Light is the default ground and English the default language. The root always
  leads to English rather than negotiating, and dark is reached through the
  switch rather than through the system preference.
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
- The front page carries a working method: six steps forming a closed loop,
  from framing the problem to operating what shipped, each carrying one
  specific practice rather than a general claim.
- Search work: a database driven sitemap with per-URL language alternates, a
  robots file, reciprocal hreflang including x-default, and JSON-LD on every
  page tying four spellings of one name to the profiles that corroborate it.
- Share images rendered at build time in the site's own typefaces, generic per
  language and specific per archive entry.
- Display sizes and section rhythm answer to viewport height as well as width,
  through min(). A short laptop screen shrinks the type instead of pushing the
  layout below the fold, so the wide arrangement holds down to the point where
  stacking is genuinely right.
- One word of the front page statement rides a reel, between products, solutions
  and worlds. The page opens with a spin that decelerates into the first word,
  then the reel turns slowly. Only the current word is in the document, and the
  box is sized from a measurement so the sentence neither jumps nor sits in a
  gap.
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
- A section of its own for the person, with a portrait held as an archive
  plate: monochrome by default, its colour returning under the pointer.
- Public profiles move from a constant into the database, so opening an account
  no longer needs a deployment, and the structured data reads the same table the
  contact page lists.
- Media stored in MinIO, with dimensions and a blur placeholder measured on
  upload and alternative text asked for in both languages straight away.
- The console manages the archive as well as the messages: entries with both
  translations and their kind specific fields, organisations, and profiles.
- A console for the messages, behind a generated path, a single scrypt hashed
  password and a signed session, with replies recorded and sent through Resend
  when it is configured.
- A contact form stored in the database, with a hidden field and a minimum
  time to submit as its defences, and a note saying what happens to the message.
- A career page that carries the detail: what each role actually asks, and what
  was built under it, rather than one line per position.
- A contact page, both linked from a summary on the front.
- Positions, organisations and credentials seeded from the curriculum vitae,
  and the professional work itself added to the archive: a multi-tenant SaaS
  platform, a civic technology platform, a diaspora campaign site, a production
  ETL pipeline, and the technical direction of a cultural product.
- Live GitHub activity on the front page, read from the public events feed with
  no token and degrading to nothing when the API is unavailable. Counted in
  pushes and merged pull requests, since the feed no longer carries commit
  counts, and listed by branch rather than by commit message.
- Year totals read from the GraphQL API when GITHUB_TOKEN is set, falling back
  to the recorded values when it is not, and arriving on reels: all eight digits
  spin at once and stop one at a time, in an order drawn fresh on every visit.
- A register voice: Sligoil at reading size and lowercase, confined to archive
  surfaces. The archive now speaks in the same hand it uses to label itself,
  while the front page and long-form bodies stay in Author.

- The console password moves into the database on first use. The digest in the
  environment is a bootstrap: the first login with it creates the account and
  the console refuses every page but the password screen until a new one is
  chosen, shown or hidden as the reader prefers and confirmed twice. A new
  password is refused if it is under twelve characters, if the confirmation
  differs, or if it is the one being replaced.
- End to end tests, run against a built server and the real database. They
  drive the site as a browser without JavaScript does, posting the forms the
  pages render, and cover the public routes in both languages, the login and
  the forced password change, and the full create, read, update and delete
  cycle for every record the console manages.

- Measured figures on the entries that carry the most weight. UBBFY, Allons
  Voter, Skilluv, Diaspora ROW and the pipeline now state the scale of the
  system, the constraint that was met and, where there is one, the decision
  that was taken back. The career page separates the size of the platform from
  the part of it that is mine.

- Architecture diagrams on the entries that have one, drawn in HTML and CSS
  rather than uploaded as images: they follow the theme, are set in the site's
  own faces, translate with everything else and can be read aloud. An entry
  names one from the console.

- Screens on the entries that have shipped software behind them: the UBBFY
  dashboard and its roles matrix, the Skilluv opening and its disciplines, and
  the Yàra membership card. Each carries a caption that says what the screen
  decides rather than what it contains, and alternative text that describes it
  for anyone who cannot see it.

- A curriculum vitae at `/{locale}/cv.pdf`, drawn from the same tables as the
  pages and laid out in the site's own faces. It cannot fall behind the site,
  because there is no second copy of the facts to keep in step.
- The GitHub account and the document are reachable from the front page, and
  the document again from the foot of the career page.

- A page for an address that holds nothing, set in the worn face and written
  as a catalogue would write it, in both languages, with a catch-all route so
  that a missing address stays inside the site rather than falling out to the
  framework's own page.

- Deployment: a four stage Dockerfile, a compose file describing the server,
  Postgres and MinIO on one machine, and a runbook. The server image carries
  neither the toolchain that built it nor the tool that migrates the database.

### Changed

- The opening plays on the front page only, and at two thirds of its pace on a
  phone. It holds the page back while it runs, so it was costing every page a
  reader opened in a new tab a delay that introduced a wordmark they had
  already seen.

- The build no longer reads the database. Nothing is prerendered from it: a
  page is rendered on its first request and kept for an hour, which is what
  already happened after the first hour anyway. Prerendering required a
  database that was migrated and filled before the deployment that creates it
  had run, which is a circle, and it cost a first deployment.
- The Prisma client is opened on the first query rather than when its module is
  imported, so the code can be bundled without a database in reach.

- The opening runs in full on the first arrival in a tab and at half pace on
  every load after it. It earns its length once; the fourth time in ten minutes
  it is a door that sticks.

- The front page leads with the work and follows with the method. A reader
  arrives asking whether the person has built anything, not how they go about
  it, and answering the second question first asks them to take the first on
  trust.
- The telephone number and the personal address are no longer printed on the
  site or in the structured data. Both were in full on two indexed pages, which
  is the shortest path a harvester takes to a phone that then rings at dinner.
  The form is protected and a number can be given in the first reply.
- The list of recently touched branches is gone from the front page. It read as
  a developer's own dashboard: the name of a fix tells a reader deciding
  whether to write precisely nothing, and the line above it already says the
  work is current.

- A content security policy, written without a nonce on purpose: a nonce has to
  be minted per request and matched by the markup, which requires dynamic
  rendering, and every page here is kept for an hour. It refuses scripts from
  any other origin, framing, a rewritten base address, a form posting elsewhere,
  plugins and plain HTTP. It cannot refuse an inline script, because Next writes
  its own into every page.
- Optional support for a Search Console meta tag, for the case where the zone
  cannot be reached to add a record.

- IndexNow: a write from the console announces the addresses it changed, so a
  published entry is looked at in minutes rather than on a crawler's own
  schedule. Off without a key, and silent from a laptop.

### Fixed

- Three accessibility defects a Lighthouse audit of the deployed site found:
  the note under a stamp was dimmed below the readable ratio, the archive rows
  jumped from a level one heading to a level three now that they open the front
  page, and the theme and language controls carried a spoken name that did not
  contain the word on screen, which puts them out of reach of anyone driving
  the page by voice.

- One figure for the same fact across the site. The client count, the launch
  date for Yara and the spelling of the name no longer differ between the front
  page, the career page and the archive.
- French apostrophes are typographic in the content as well as in the
  interface, which is where they were still straight.
- Skilluv and TrackMyWeight are described by what they are rather than by where
  they are aimed.
- The dev.to profile is no longer listed while its page answers 404.

- Deleting an entry no longer fails when it carries a project, world, position
  or credential. The satellite rows are removed with it rather than holding a
  foreign key against the deletion.
- Positions and credentials no longer answer at an archive address. Only the
  kinds the archive lists have a page, matching the slugs that get one
  generated and the sitemap that announces them.

### Notes

- ESLint is held at 9.x. The 10.x release breaks `eslint-plugin-react` as
  bundled by `eslint-config-next`.
- TypeScript is held at 5.9 for the peer range declared by
  `typescript-eslint`.
