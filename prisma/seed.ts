import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Seeds the archive from work that actually exists on GitHub.
 *
 * Dates, stacks and scope come from the repositories themselves rather than
 * from memory. Private repositories are seeded as drafts, so publishing one
 * stays a deliberate act.
 *
 * Entries nest: a body of work such as Skilluv is a parent holding the
 * services, starters and governance repositories that compose it. Numbering
 * runs across the whole archive rather than restarting inside each parent,
 * because a number is meant to identify a piece, not its position in a list.
 *
 * The script is idempotent. Everything is keyed by slug and upserted, so it
 * can be rerun after the copy is edited without duplicating anything.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type Translation = {
  title: string;
  summary: string;
  body?: string;
};

type Seed = {
  slug: string;
  number: number;
  parent?: string;
  rank?: number;
  kind: "PROJECT" | "WORLD";
  status: "DRAFT" | "PUBLISHED";
  dimension: "BUILD" | "LEAD" | "CREATE" | null;
  accent: "GOLD" | "CRIMSON" | "VIOLET";
  wear: "CLEAN" | "WORN";
  featured: boolean;
  startedOn: string;
  endedOn: string | null;
  repositoryUrl: string | null;
  stack: string[];
  en: Translation;
  fr: Translation;
};

const entries: Seed[] = [
  {
    slug: "skilluv",
    number: 1,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "LEAD",
    accent: "CRIMSON",
    wear: "CLEAN",
    featured: true,
    startedOn: "2026-02-02",
    endedOn: null,
    repositoryUrl: "https://github.com/Skilluv",
    stack: ["Rust", "Axum", "SvelteKit", "Python", "gRPC", "PostgreSQL"],
    en: {
      title: "Skilluv",
      summary:
        "A talent development platform for the African tech ecosystem, built as four services with a public governance layer around them.",
      body: "Skilluv is the largest body of work in this archive and the only one that spans every dimension of it. It is not a single application: four services, fourteen reference implementations and four governance repositories, each with its own reason to exist.\n\nSplitting the admin panel out from the product is the decision that shaped the rest. An operations team and a learner have almost nothing in common in what they need to see, and merging them would have produced one interface permanently compromised for both.\n\nThe governance repositories matter as much as the code. A community becomes governable at the point where its decisions stop living in private conversations.",
    },
    fr: {
      title: "Skilluv",
      summary:
        "Une plateforme de développement des talents pour l'écosystème tech africain, construite comme quatre services entourés d'une gouvernance publique.",
      body: "Skilluv est l'ensemble le plus vaste de cette archive, et le seul qui en traverse toutes les dimensions. Ce n'est pas une application : quatre services, quatorze implémentations de référence et quatre dépôts de gouvernance, chacun avec sa raison d'exister.\n\nSéparer l'administration du produit est la décision qui a structuré le reste. Une équipe d'exploitation et un apprenant n'ont presque rien en commun dans ce qu'ils ont besoin de voir, et les réunir aurait produit une interface durablement médiocre pour les deux.\n\nLes dépôts de gouvernance comptent autant que le code. Une communauté devient gouvernable à partir du moment où ses décisions cessent de vivre dans des conversations privées.",
    },
  },
  {
    slug: "skilluv-backend",
    number: 2,
    parent: "skilluv",
    rank: 1,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-02-02",
    endedOn: null,
    repositoryUrl: "https://github.com/Skilluv/skilluv-backend",
    stack: ["Rust", "Axum", "PostgreSQL"],
    en: {
      title: "API core",
      summary:
        "The Rust and Axum service that every other part of the platform talks to.",
    },
    fr: {
      title: "Cœur d'API",
      summary:
        "Le service Rust et Axum auquel toutes les autres parties de la plateforme s'adressent.",
    },
  },
  {
    slug: "skilluv-frontend",
    number: 3,
    parent: "skilluv",
    rank: 2,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-03-21",
    endedOn: null,
    repositoryUrl: "https://github.com/Skilluv/skilluv-frontend",
    stack: ["SvelteKit", "TypeScript"],
    en: {
      title: "Learner application",
      summary: "The SvelteKit surface that learners actually use.",
    },
    fr: {
      title: "Application apprenant",
      summary: "La surface SvelteKit que les apprenants utilisent réellement.",
    },
  },
  {
    slug: "skilluv-admin",
    number: 4,
    parent: "skilluv",
    rank: 3,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "LEAD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-07-09",
    endedOn: null,
    repositoryUrl: "https://github.com/Skilluv/skilluv-admin",
    stack: ["SvelteKit", "TypeScript"],
    en: {
      title: "Admin panel",
      summary:
        "Moderation, catalog and operations, kept as a standalone build rather than a privileged corner of the product.",
    },
    fr: {
      title: "Panneau d'administration",
      summary:
        "Modération, catalogue et exploitation, tenus dans un build distinct plutôt que dans un recoin privilégié du produit.",
    },
  },
  {
    slug: "skilluv-ia",
    number: 5,
    parent: "skilluv",
    rank: 4,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-03-21",
    endedOn: null,
    repositoryUrl: "https://github.com/Skilluv/skilluv-ia",
    stack: ["Python", "gRPC"],
    en: {
      title: "AI service",
      summary:
        "Code review, plagiarism detection and career-path suggestions, reached over gRPC.",
    },
    fr: {
      title: "Service IA",
      summary:
        "Revue de code, détection de plagiat et suggestions de parcours, joints en gRPC.",
    },
  },
  {
    slug: "skilluv-starters",
    number: 6,
    parent: "skilluv",
    rank: 5,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-07-22",
    endedOn: null,
    repositoryUrl: "https://github.com/Skilluv",
    stack: [
      "Rust",
      "Go",
      "Python",
      "TypeScript",
      "Kotlin",
      "Dart",
      "Svelte",
      "Astro",
      "GDScript",
    ],
    en: {
      title: "Fourteen starters",
      summary:
        "One reference implementation per track, each a working project rather than a template.",
      body: "Full-stack in Rust, Go, Python and Node. Frontend in React, Svelte and HTMX. Mobile in Kotlin, Flutter and React Native. Games in Bevy and Godot. Embedded on the ESP32. Data work in JupyterLab. A DevOps track with OpenTofu and observability already wired in.\n\nEach one runs, has tests, and pins its versions. A learner who cannot get a project to start learns nothing except that the ecosystem is hostile.",
    },
    fr: {
      title: "Quatorze starters",
      summary:
        "Une implémentation de référence par filière, chacune un projet qui tourne plutôt qu'un gabarit.",
      body: "Full-stack en Rust, Go, Python et Node. Front en React, Svelte et HTMX. Mobile en Kotlin, Flutter et React Native. Jeu avec Bevy et Godot. Embarqué sur ESP32. Donnée avec JupyterLab. Une filière DevOps avec OpenTofu et l'observabilité déjà câblée.\n\nChacun démarre, comporte des tests et épingle ses versions. Un apprenant qui n'arrive pas à lancer un projet n'apprend rien, sinon que l'écosystème lui est hostile.",
    },
  },
  {
    slug: "skilluv-governance",
    number: 7,
    parent: "skilluv",
    rank: 6,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "LEAD",
    accent: "CRIMSON",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-07-22",
    endedOn: null,
    repositoryUrl: "https://github.com/skilluv-community",
    stack: ["RFC", "Governance", "Open source"],
    en: {
      title: "Community governance",
      summary:
        "Four public repositories that make the decisions, the rules and the arrivals visible instead of implicit.",
      body: "Structured RFCs for product, technology and governance choices. A weekly public changelog. A code of conduct for the compagnonnage model. And a public timeline of members' first commits.\n\nThe last one matters more than it looks. Recording a first contribution as an event, in public, changes what arriving in a community feels like.",
    },
    fr: {
      title: "Gouvernance de la communauté",
      summary:
        "Quatre dépôts publics qui rendent visibles les décisions, les règles et les arrivées, au lieu de les laisser implicites.",
      body: "Des RFC structurées pour les choix de produit, de technique et de gouvernance. Un changelog public hebdomadaire. Une charte pour le modèle de compagnonnage. Et une chronologie publique des premiers commits des membres.\n\nLe dernier compte davantage qu'il n'y paraît. Consigner une première contribution comme un événement, publiquement, change ce que veut dire arriver dans une communauté.",
    },
  },
  {
    slug: "chess-coach",
    number: 8,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: true,
    startedOn: "2026-06-19",
    endedOn: "2026-06-24",
    repositoryUrl: null,
    stack: ["Python", "FastAPI", "PostgreSQL", "Stockfish", "Unity 6", "C#"],
    en: {
      title: "Chess coach",
      summary:
        "A self-hosted coach that reads your own games rather than a generic curriculum, split across a backend and a game engine client.",
      body: "Everything runs locally, including the language model that writes the commentary. Nothing about your play leaves the machine.\n\nChoosing a game engine for what could have been a web page was a deliberate constraint: it forced the interface to be spatial rather than a list of moves.",
    },
    fr: {
      title: "Coach d'échecs",
      summary:
        "Un coach auto-hébergé qui lit vos propres parties plutôt qu'un programme générique, réparti entre un backend et un client moteur de jeu.",
      body: "Tout tourne en local, y compris le modèle de langage qui rédige les commentaires. Rien de votre jeu ne quitte la machine.\n\nChoisir un moteur de jeu pour ce qui aurait pu être une page web était une contrainte volontaire : elle a obligé l'interface à devenir spatiale au lieu de rester une liste de coups.",
    },
  },
  {
    slug: "chess-coach-backend",
    number: 9,
    parent: "chess-coach",
    rank: 1,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-06-19",
    endedOn: "2026-06-24",
    repositoryUrl: "https://github.com/jeremie0342/coach_chess",
    stack: ["Python", "FastAPI", "SQLAlchemy", "Alembic", "Stockfish", "Ollama"],
    en: {
      title: "Analysis backend",
      summary:
        "Imports games from Chess.com, runs Stockfish over them, detects tactical motifs and generates puzzles from the positions where you actually went wrong.",
    },
    fr: {
      title: "Backend d'analyse",
      summary:
        "Importe les parties depuis Chess.com, les analyse avec Stockfish, détecte les motifs tactiques et génère des exercices à partir des positions où vous vous êtes réellement trompé.",
    },
  },
  {
    slug: "chess-coach-client",
    number: 10,
    parent: "chess-coach",
    rank: 2,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "CREATE",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-06-19",
    endedOn: "2026-06-19",
    repositoryUrl: "https://github.com/jeremie0342/chess_coach",
    stack: ["Unity 6", "C#", "URP", "UI Toolkit", "Piper"],
    en: {
      title: "Unity client",
      summary:
        "Five concept scenes reachable from a central hub, with speech synthesised locally.",
    },
    fr: {
      title: "Client Unity",
      summary:
        "Cinq scènes accessibles depuis un hub central, avec une synthèse vocale locale.",
    },
  },
  {
    slug: "trackmyweight",
    number: 11,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "CRIMSON",
    wear: "CLEAN",
    featured: true,
    startedOn: "2026-07-16",
    endedOn: "2026-08-14",
    repositoryUrl: "https://github.com/jeremie0342/trackmyweight",
    stack: [
      "Kotlin",
      "Jetpack Compose",
      "Room",
      "Hilt",
      "Health Connect",
      "WorkManager",
    ],
    en: {
      title: "TrackMyWeight",
      summary:
        "A local-first fitness and nutrition tracker for Android, built around West African cooking rather than translated for it.",
      body: "Nutrition trackers assume a food database that does not contain what most of the world eats. This one is built around Benin and West African cuisine from the start, which is a data problem before it is an interface problem.\n\nThe app is fully usable with no network. That is not a line on a specification sheet but the condition for it being used at all.",
    },
    fr: {
      title: "TrackMyWeight",
      summary:
        "Un suivi de forme et de nutrition local-first pour Android, conçu autour de la cuisine ouest-africaine plutôt que traduit vers elle.",
      body: "Les applications de nutrition supposent une base d'aliments qui ne contient pas ce que mange la majeure partie du monde. Celle-ci est construite dès le départ autour de la cuisine béninoise et ouest-africaine, ce qui est un problème de données avant d'être un problème d'interface.\n\nL'application reste entièrement utilisable sans réseau. Ce n'est pas une ligne de spécification, c'est la condition pour qu'elle serve.",
    },
  },
  {
    slug: "worldsmith",
    number: 12,
    kind: "WORLD",
    status: "DRAFT",
    dimension: "CREATE",
    accent: "VIOLET",
    wear: "WORN",
    featured: false,
    startedOn: "2026-05-06",
    endedOn: "2026-06-24",
    repositoryUrl: null,
    stack: ["TypeScript"],
    en: {
      title: "Worldsmith",
      summary:
        "A web platform for AI-assisted worldbuilding. Held as a draft, since the repository is private.",
      body: "This entry exists so the archive has a place for work that is imagined rather than shipped. It stays unpublished on purpose: the repository behind it is private, and its scope has not been described publicly anywhere yet.",
    },
    fr: {
      title: "Worldsmith",
      summary:
        "Une plateforme web de worldbuilding assistée par IA. Gardée en brouillon, puisque le dépôt est privé.",
      body: "Cette entrée existe pour que l'archive ait une place réservée à ce qui relève de l'imaginaire plutôt que du livré. Elle reste non publiée volontairement : le dépôt qui la porte est privé, et son périmètre n'a été décrit publiquement nulle part.",
    },
  },
];

/* Archive numbers are unique, so renumbering an existing archive collides
   with itself halfway through the upsert loop. Existing rows are moved out of
   the way first, into a range the seed never writes to, and whatever still
   sits there at the end is an entry the seed no longer describes. */
const PARKING = 10_000;

async function main() {
  const idBySlug = new Map<string, string>();

  await db.$executeRaw`UPDATE "Entry" SET number = number + ${PARKING} WHERE number < ${PARKING}`;

  /* Two passes. Parents have to exist before a child can point at one, and
     sorting by depth would only work as long as the tree stays one level
     deep. */
  for (const entry of entries) {
    const { en, fr, repositoryUrl, stack } = entry;

    /* Fields are listed rather than spread from a rest object: the seed shape
       carries keys the table does not have, and a rest spread would only
       surface that at runtime. */
    const data = {
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
    };

    const record = await db.entry.upsert({
      where: { slug: entry.slug },
      create: data,
      update: data,
    });

    idBySlug.set(entry.slug, record.id);

    for (const [locale, translation] of [
      ["EN", en],
      ["FR", fr],
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
      await db.project.upsert({
        where: { entryId: record.id },
        create: { entryId: record.id, repositoryUrl, liveUrl: null, stack },
        update: { repositoryUrl, stack },
      });
    }

    if (entry.kind === "WORLD") {
      await db.world.upsert({
        where: { entryId: record.id },
        create: { entryId: record.id },
        update: {},
      });
    }
  }

  for (const entry of entries) {
    const parentId = entry.parent ? idBySlug.get(entry.parent) : null;

    if (entry.parent && !parentId) {
      throw new Error(`Unknown parent "${entry.parent}" for ${entry.slug}`);
    }

    await db.entry.update({
      where: { slug: entry.slug },
      data: { parentId: parentId ?? null },
    });

    const indent = entry.parent ? "    " : "";
    console.log(`${indent}${String(entry.number).padStart(3, "0")}  ${entry.slug}`);
  }

  const stale = await db.entry.deleteMany({
    where: { number: { gte: PARKING } },
  });

  if (stale.count > 0) {
    console.log(`\nRemoved ${stale.count} entries no longer in the seed.`);
  }

  const roots = await db.entry.count({
    where: { status: "PUBLISHED", parentId: null },
  });
  const total = await db.entry.count({ where: { status: "PUBLISHED" } });
  const drafts = await db.entry.count({ where: { status: "DRAFT" } });

  console.log(`\n${roots} top level, ${total} published, ${drafts} draft.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
