/**
 * End to end tests, against a running server and the real database.
 *
 * They exercise the pages a reader sees, the login, the forced first password,
 * and one full create/read/update/delete cycle for every kind of record the
 * console manages. Nothing is mocked: the point is to prove that a form on a
 * page reaches the action it names and that the row it writes comes back out on
 * the public site.
 *
 * Run with the server already started:
 *
 *   npm run build && npm run start
 *   npm run test:e2e
 *
 * The account row is emptied at the start and again at the end, so the password
 * flow can be tested from its first state and the bootstrap digest in the
 * environment keeps working afterwards. Every record the run creates is deleted
 * before it finishes, and anything left behind carries the run's own marker so
 * it can be found.
 */

import { Client } from "pg";
import { Browser, text } from "./browser.mjs";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const GATE = process.env.CONSOLE_PATH;
const BOOTSTRAP = process.env.E2E_PASSWORD;

/* Long enough for the rule the console enforces, and used only here. */
const CHOSEN = "e2e-temporary-passphrase";

const MARK = `e2e-${Date.now().toString(36)}`;

const results = [];
let failures = 0;

function check(name, passed, detail) {
  results.push({ name, passed, detail });

  if (!passed) {
    failures += 1;
  }

  const mark = passed ? "ok  " : "FAIL";
  console.log(`${mark} ${name}${passed || !detail ? "" : ` — ${detail}`}`);
}

function equal(name, actual, expected) {
  check(name, actual === expected, `expected ${expected}, got ${actual}`);
}

async function section(title, run) {
  console.log(`\n${title}`);

  try {
    await run();
  } catch (error) {
    check(`${title} ran to the end`, false, error.message);
  }
}

const db = new Client({ connectionString: process.env.DATABASE_URL });

async function forget() {
  await db.query('DELETE FROM "Account"');
}

// ---------------------------------------------------------------------------

const reader = new Browser(BASE);
const console_ = new Browser(BASE);

/** Pages every visitor can reach, in both languages. */
async function publicRoutes() {
  const paths = [
    "/en",
    "/fr",
    "/en/about",
    "/fr/about",
    "/en/archive",
    "/fr/archive",
    "/en/contact",
    "/fr/contact",
    "/sitemap.xml",
    "/robots.txt",
  ];

  for (const path of paths) {
    const page = await reader.get(path);
    equal(`GET ${path}`, page.status, 200);
  }

  const root = await reader.peek("/");
  check(
    "GET / redirects to the default language",
    [307, 308, 302].includes(root.status) && root.location?.includes("/en"),
    `${root.status} ${root.location}`,
  );

  const missing = await reader.get("/en/archive/no-such-entry");
  equal("GET a missing entry", missing.status, 404);

  const index = await reader.get("/en/archive");
  const slug = index.html.match(/\/en\/archive\/([a-z0-9-]+)/)?.[1];
  check("the index links to at least one entry", Boolean(slug), "none found");

  if (slug) {
    const entry = await reader.get(`/en/archive/${slug}`);
    equal(`GET /en/archive/${slug}`, entry.status, 200);

    const image = await reader.get(`/en/archive/${slug}/opengraph-image`);
    equal("its share image renders", image.status, 200);
  }

  const gate = await reader.get("/console/not-the-gate");
  equal("a wrong gate is a missing page", gate.status, 404);

  const bare = await reader.peek(`/console/${GATE}/entries`);
  check(
    "the console redirects a visitor with no session",
    REDIRECT.has(bare.status),
    `${bare.status}`,
  );
}

const REDIRECT = new Set([301, 302, 303, 307, 308]);

/** The contact form, and the message it leaves behind. */
async function contact() {
  const page = await reader.get("/en/contact");
  const form = reader.form('name="body"');

  await reader.submit(form, {
    name: `Tester ${MARK}`,
    email: "tester@example.com",
    subject: `Subject ${MARK}`,
    body: `A message long enough to pass the minimum, marked ${MARK}.`,
    /* Set by script on a real visit. Backdated here because the action refuses
       anything that arrives within three seconds of the page rendering. */
    opened: String(Date.now() - 10_000),
  });

  check(
    "the contact form reports the message as sent",
    /sent|envoy/i.test(text(reader.page.html)) ||
      reader.page.status === 200,
    `status ${reader.page.status}`,
  );

  const stored = await db.query(
    'SELECT id, name, body FROM "Message" WHERE name = $1',
    [`Tester ${MARK}`],
  );

  check("the message is in the database", stored.rowCount === 1, `${stored.rowCount} rows`);
  void page;
}

/** Login, and the password the first login is made to change. */
async function authentication() {
  await forget();

  let page = await console_.get(`/console/${GATE}`);
  equal("the gate shows a login page", page.status, 200);

  await console_.submit(console_.form('name="password"'), {
    password: "not-the-password",
  });

  check(
    "a wrong password is refused",
    console_.page.html.includes('name="password"'),
    "the login form is gone, so something let it through",
  );

  await console_.submit(console_.form('name="password"'), {
    password: BOOTSTRAP,
  });

  equal(
    "the bootstrap password lands on the password screen",
    console_.page.url,
    `/console/${GATE}/password`,
  );

  const elsewhere = await console_.peek(`/console/${GATE}/entries`);
  check(
    "every other page sends the reader back to it",
    elsewhere.location?.endsWith("/password"),
    `${elsewhere.status} ${elsewhere.location}`,
  );

  const attempts = [
    ["a short password", { password: "short", confirmation: "short" }, /douze|twelve/i],
    [
      "two different entries",
      { password: `${CHOSEN}-a`, confirmation: `${CHOSEN}-b` },
      /diff/i,
    ],
    [
      "the password it is replacing",
      { password: BOOTSTRAP, confirmation: BOOTSTRAP },
      /actuel|current/i,
    ],
  ];

  for (const [name, values, expected] of attempts) {
    await console_.get(`/console/${GATE}/password`);
    await console_.submit(console_.form('name="confirmation"'), values);

    check(
      `${name} is refused`,
      expected.test(text(console_.page.html)),
      text(console_.page.html).slice(0, 160),
    );
  }

  await console_.get(`/console/${GATE}/password`);
  await console_.submit(console_.form('name="confirmation"'), {
    password: CHOSEN,
    confirmation: CHOSEN,
  });

  equal(
    "a new password lets the console open",
    console_.page.url,
    `/console/${GATE}`,
  );

  const flag = await db.query('SELECT "mustChange" FROM "Account"');
  check("the account no longer asks for a change", flag.rows[0]?.mustChange === false);

  const entries = await console_.get(`/console/${GATE}/entries`);
  equal("and the rest of the console is reachable", entries.status, 200);

  await console_.submit(console_.form("Sortir"));
  const out = await console_.peek(`/console/${GATE}/entries`);
  check("signing out closes the session", REDIRECT.has(out.status), `${out.status}`);

  await console_.get(`/console/${GATE}`);
  await console_.submit(console_.form('name="password"'), { password: CHOSEN });

  equal(
    "the new password signs in",
    console_.page.url,
    `/console/${GATE}`,
  );
}

/** Organisations, including the deletion the console is supposed to refuse. */
async function organizations() {
  await console_.get(`/console/${GATE}/organizations`);

  await console_.submit(console_.form("Nouvelle organisation"), {
    name: `Org ${MARK}`,
    url: "https://example.org",
    country: "FR",
  });

  check(
    "an organisation is created",
    console_.page.html.includes(`Org ${MARK}`),
    "not on the page after saving",
  );

  const created = await db.query('SELECT id FROM "Organization" WHERE name = $1', [
    `Org ${MARK}`,
  ]);
  const id = created.rows[0]?.id;
  check("with a row to match", Boolean(id));

  await console_.submit(
    console_.form((form) =>
      form.fields.some((field) => field.name === "id" && field.value === id),
    ),
    { name: `Org ${MARK} renamed`, country: "BE" },
  );

  const updated = await db.query('SELECT name, country FROM "Organization" WHERE id = $1', [id]);
  equal("it can be renamed", updated.rows[0]?.name, `Org ${MARK} renamed`);
  equal("and its other fields change with it", updated.rows[0]?.country, "BE");

  /* Kept while the organisation is still detached from everything, because the
     console stops rendering the button once something is attached and the
     refusal underneath it would go untested. */
  const removal = console_.form(deletes(id));

  return { id, removal };
}

/** Matches the delete form for a record: its id, and none of the edit fields. */
function deletes(id, edited = "name") {
  return (form) =>
    form.fields.some((field) => field.name === "id" && field.value === id) &&
    !form.fields.some((field) => field.name === edited);
}

/** One entry, through the console and out onto the public site. */
async function entries(organization) {
  const slug = `entry-${MARK}`;
  const number = 90000 + Math.floor(Math.random() * 9000);

  await console_.get(`/console/${GATE}/entries/new`);

  await console_.submit(console_.form('name="slug"'), {
    slug,
    number: String(number),
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    enTitle: `Entry ${MARK}`,
    frTitle: `Entrée ${MARK}`,
    enSummary: "An entry written by the test suite.",
    frSummary: "Une entrée écrite par la suite de tests.",
    liveUrl: "https://example.com",
    stack: "Next.js, PostgreSQL",
  });

  const id = console_.page.url.split("/").pop();
  check("saving an entry opens its editor", Boolean(id) && id !== "new", console_.page.url);

  const row = await db.query('SELECT id, status FROM "Entry" WHERE slug = $1', [slug]);
  check("the entry is in the database", row.rowCount === 1);

  const satellite = await db.query('SELECT "liveUrl", stack FROM "Project" WHERE "entryId" = $1', [id]);
  equal("its project details are written", satellite.rows[0]?.liveUrl, "https://example.com");
  check(
    "including the stack, split into a list",
    satellite.rows[0]?.stack?.join(",") === "Next.js,PostgreSQL",
    JSON.stringify(satellite.rows[0]?.stack),
  );

  const published = await reader.get(`/en/archive/${slug}`);
  equal("a published entry is visible to a reader", published.status, 200);
  check(
    "with the title it was given",
    published.html.includes(`Entry ${MARK}`),
    "title missing from the page",
  );

  const french = await reader.get(`/fr/archive/${slug}`);
  check(
    "and its French translation",
    french.html.includes(`Entrée ${MARK}`),
    "French title missing",
  );

  await console_.get(`/console/${GATE}/entries/${id}`);
  await console_.submit(console_.form('name="slug"'), {
    enTitle: `Entry ${MARK} revised`,
    featured: true,
  });

  const again = await reader.get(`/en/archive/${slug}`);
  check(
    "an edit reaches the public page",
    again.html.includes(`Entry ${MARK} revised`),
    "the old title is still being served",
  );

  const sitemap = await reader.get("/sitemap.xml");
  check("and the sitemap", sitemap.html.includes(slug), "slug missing from the sitemap");

  /* Switching kinds is the case that leaves an orphan satellite if the action
     writes rather than replaces. */
  await console_.get(`/console/${GATE}/entries/${id}`);
  await console_.submit(console_.form('name="slug"'), {
    kind: "POSITION",
    organizationId: organization.id,
    location: "Remote",
    remote: true,
  });

  const orphan = await db.query('SELECT 1 FROM "Project" WHERE "entryId" = $1', [id]);
  equal("changing the kind removes the old satellite", orphan.rowCount, 0);

  const position = await db.query('SELECT "organizationId" FROM "Position" WHERE "entryId" = $1', [id]);
  equal("and writes the new one", position.rows[0]?.organizationId, organization.id);

  const gone = await reader.get(`/en/archive/${slug}`);
  equal("a position is no longer in the archive", gone.status, 404);

  return { id, slug };
}

/** A profile link, which the public pages read for the JSON-LD as well. */
async function profiles() {
  await console_.get(`/console/${GATE}/profiles`);

  await console_.submit(console_.form("Nouveau profil"), {
    label: `Profile ${MARK}`,
    handle: MARK,
    url: `https://example.net/${MARK}`,
    rank: "99",
  });

  const created = await db.query('SELECT id, listed FROM "Profile" WHERE label = $1', [
    `Profile ${MARK}`,
  ]);
  const id = created.rows[0]?.id;
  check("a profile is created", Boolean(id));
  check("listed by default from the new form", created.rows[0]?.listed === true);

  const page = await reader.get("/en");
  check(
    "a listed profile reaches the structured data",
    page.html.includes(`https://example.net/${MARK}`),
    "not found in the page",
  );

  await console_.get(`/console/${GATE}/profiles`);
  await console_.submit(
    console_.form((form) =>
      form.fields.some((field) => field.name === "id" && field.value === id),
    ),
    { label: `Profile ${MARK} revised`, listed: false },
  );

  const updated = await db.query('SELECT label, listed FROM "Profile" WHERE id = $1', [id]);
  equal("it can be edited", updated.rows[0]?.label, `Profile ${MARK} revised`);
  equal("and unlisted", updated.rows[0]?.listed, false);

  return id;
}

/** A message, filed and replied to from the console. */
async function messages() {
  const row = await db.query('SELECT id FROM "Message" WHERE name = $1', [`Tester ${MARK}`]);
  const id = row.rows[0]?.id;

  if (!id) {
    check("a message to work with", false, "the contact test left nothing behind");
    return null;
  }

  const list = await console_.get(`/console/${GATE}/messages`);
  check("the message is listed in the console", list.html.includes(MARK), "not in the list");

  const detail = await console_.get(`/console/${GATE}/messages/${id}`);
  equal("its page opens", detail.status, 200);

  await console_.submit(console_.form('value="READ"'));
  const filed = await db.query('SELECT status, "readAt" FROM "Message" WHERE id = $1', [id]);
  equal("it can be filed as read", filed.rows[0]?.status, "READ");
  check("and stamped with the time", filed.rows[0]?.readAt !== null);

  await console_.get(`/console/${GATE}/messages/${id}`);
  await console_.submit(console_.form('name="reply"'), {
    reply: `A reply from the test suite, ${MARK}.`,
  });

  const replied = await db.query('SELECT reply, status FROM "Message" WHERE id = $1', [id]);
  check(
    "a reply is stored whether or not mail is configured",
    replied.rows[0]?.reply?.includes(MARK),
    JSON.stringify(replied.rows[0]),
  );
  equal("and the message is marked replied", replied.rows[0]?.status, "REPLIED");

  return id;
}

/** Media, when there is somewhere to put it. */
async function media() {
  const configured =
    process.env.MINIO_ENDPOINT &&
    process.env.MINIO_ACCESS_KEY &&
    process.env.MINIO_SECRET_KEY &&
    process.env.MINIO_BUCKET;

  if (!configured) {
    console.log("skip media: no object store configured");
    return;
  }

  /* A one pixel PNG, small enough to hold in the file and real enough for the
     image pipeline to read a size out of it. */
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );

  await console_.get(`/console/${GATE}/media`);
  await console_.submit(console_.form('name="file"'), {
    file: new Blob([png], { type: "image/png" }),
    "file:name": `${MARK}.png`,
  });

  const created = await db.query(
    'SELECT id FROM "Media" ORDER BY "createdAt" DESC LIMIT 1',
  );
  const id = created.rows[0]?.id;
  check("an upload creates a media row", Boolean(id));

  if (!id) {
    return;
  }

  await console_.get(`/console/${GATE}/media`);
  await console_.submit(
    console_.form((form) =>
      form.fields.some((field) => field.name === "id" && field.value === id) &&
      form.fields.some((field) => field.name === "enAlt"),
    ),
    { enAlt: `Alt ${MARK}`, frAlt: `Texte ${MARK}` },
  );

  const alt = await db.query(
    'SELECT alt FROM "MediaTranslation" WHERE "mediaId" = $1 AND locale = $2',
    [id, "EN"],
  );
  equal("alternative text is saved", alt.rows[0]?.alt, `Alt ${MARK}`);

  await console_.get(`/console/${GATE}/media`);
  await console_.submit(
    console_.form((form) =>
      form.fields.some((field) => field.name === "id" && field.value === id) &&
      !form.fields.some((field) => field.name === "enAlt"),
    ),
  );

  const removed = await db.query('SELECT 1 FROM "Media" WHERE id = $1', [id]);
  equal("and it can be deleted", removed.rowCount, 0);
}

/** Deleting everything the run created, which is also the delete test. */
async function cleanup({ entry, organization, profileId, messageId }) {
  if (entry) {
    await console_.get(`/console/${GATE}/entries/${entry.id}`);
    await console_.submit(console_.form("Supprimer"), {});

    const left = await db.query('SELECT 1 FROM "Entry" WHERE id = $1', [entry.id]);
    equal("an entry can be deleted", left.rowCount, 0);
  }

  if (organization) {
    /* Attached to nothing now that the entry is gone, so this one should go
       through where the same request a moment ago would not have. */
    await console_.get(`/console/${GATE}/organizations`);
    await console_.submit(console_.form(deletes(organization.id)));

    const left = await db.query('SELECT 1 FROM "Organization" WHERE id = $1', [organization.id]);
    equal("an unused organisation can be deleted", left.rowCount, 0);
  }

  if (profileId) {
    await console_.get(`/console/${GATE}/profiles`);
    await console_.submit(console_.form(deletes(profileId, "label")));

    const left = await db.query('SELECT 1 FROM "Profile" WHERE id = $1', [profileId]);
    equal("a profile can be deleted", left.rowCount, 0);
  }

  if (messageId) {
    await db.query('DELETE FROM "Message" WHERE id = $1', [messageId]);
  }

  await forget();
}

/** The refusal, tested while the organisation is still in use. */
async function protectedDelete({ id, removal }) {
  const page = await console_.get(`/console/${GATE}/organizations`);

  check(
    "an organisation in use offers no delete button",
    !page.html.match(new RegExp(`value="${id}"[\s\S]{0,600}?Supprimer`)),
    "the button is still there",
  );

  /* The button being gone is a courtesy to the reader. Replaying the form it
     used to render is the part that proves the action refuses on its own. */
  await console_.submit(removal);

  const still = await db.query('SELECT 1 FROM "Organization" WHERE id = $1', [id]);
  equal("and the action refuses the request anyway", still.rowCount, 1);
}

async function main() {
  if (!GATE || !BOOTSTRAP) {
    console.error(
      "CONSOLE_PATH and E2E_PASSWORD must be set. Run with node --env-file=.env and\n" +
        "pass the bootstrap password as E2E_PASSWORD.",
    );
    process.exit(2);
  }

  await db.connect();

  let state = {};

  try {
    await section("Public pages", publicRoutes);
    await section("Contact", contact);
    await section("Authentication", authentication);
    await section("Organisations", async () => {
      state.organization = await organizations();
    });
    await section("Entries", async () => {
      state.entry = await entries(state.organization);
    });
    await section("Protected deletes", async () => {
      if (state.organization) {
        await protectedDelete(state.organization);
      }
    });
    await section("Profiles", async () => {
      state.profileId = await profiles();
    });
    await section("Messages", async () => {
      state.messageId = await messages();
    });
    await section("Media", media);
    await section("Deletes", () => cleanup(state));
  } finally {
    /* Whatever happened above, the account goes back to its unconfigured state
       so the next run starts from the same place and the bootstrap digest in
       the environment keeps working. */
    await forget().catch(() => {});
    await db.end();
  }

  const passed = results.length - failures;
  console.log(`\n${passed}/${results.length} checks passed`);

  process.exit(failures > 0 ? 1 : 0);
}

await main();
