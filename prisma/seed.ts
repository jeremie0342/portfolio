import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Seeds the archive from work that actually exists on GitHub.
 *
 * Every entry is drawn from a real repository: its dates, its stack and its
 * scope come from the repository itself rather than from memory. Private
 * repositories are seeded as drafts, so publishing one stays a deliberate act.
 *
 * The script is idempotent. Entries are keyed by slug and upserted, so it can
 * be rerun after the copy is edited without duplicating anything.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type Translation = {
  title: string;
  summary: string;
  body: string;
};

type Seed = {
  slug: string;
  number: number;
  kind: "PROJECT" | "WORLD";
  status: "DRAFT" | "PUBLISHED";
  dimension: "BUILD" | "LEAD" | "CREATE" | null;
  accent: "GOLD" | "CRIMSON" | "VIOLET";
  wear: "CLEAN" | "WORN";
  featured: boolean;
  startedOn: string;
  endedOn: string | null;
  repositoryUrl: string | null;
  liveUrl: string | null;
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
    liveUrl: null,
    stack: ["Rust", "Axum", "SvelteKit", "Python", "gRPC", "PostgreSQL"],
    en: {
      title: "Skilluv",
      summary:
        "A talent development platform for the African tech ecosystem, built as four services rather than one application.",
      body: "Skilluv is the largest thing in this archive and the only one that spans every dimension of it. The API core is written in Rust on Axum. The user-facing application and the standalone admin panel are separate SvelteKit builds, which keeps moderation and catalog operations out of the product surface entirely. A Python service reached over gRPC handles code review, plagiarism detection and career-path suggestions.\n\nSplitting the admin panel out is the decision that shaped the rest. An operations team and a learner have almost nothing in common in what they need to see, and merging them would have produced one interface permanently compromised for both.",
    },
    fr: {
      title: "Skilluv",
      summary:
        "Une plateforme de développement des talents pour l'écosystème tech africain, construite comme quatre services plutôt que comme une application.",
      body: "Skilluv est la pièce la plus vaste de cette archive, et la seule qui en traverse toutes les dimensions. Le cœur de l'API est écrit en Rust sur Axum. L'application destinée aux utilisateurs et le panneau d'administration sont deux builds SvelteKit distincts, ce qui sort entièrement la modération et la gestion du catalogue de la surface produit. Un service Python joint en gRPC prend en charge la revue de code, la détection de plagiat et les suggestions de parcours.\n\nSéparer l'administration est la décision qui a structuré le reste. Une équipe d'exploitation et un apprenant n'ont presque rien en commun dans ce qu'ils ont besoin de voir, et les réunir aurait produit une interface durablement médiocre pour les deux.",
    },
  },
  {
    slug: "skilluv-governance",
    number: 2,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "LEAD",
    accent: "CRIMSON",
    wear: "CLEAN",
    featured: true,
    startedOn: "2026-07-22",
    endedOn: null,
    repositoryUrl: "https://github.com/skilluv-community",
    liveUrl: null,
    stack: ["RFC", "Governance", "Open source"],
    en: {
      title: "Skilluv community governance",
      summary:
        "Four public repositories that make the decisions, the rules and the arrivals visible instead of implicit.",
      body: "A community becomes governable at the point where its decisions stop living in private conversations. Four repositories carry that here: structured RFCs for product, technology and governance choices, a weekly public changelog, a code of conduct for the compagnonnage model, and a public timeline of members' first commits.\n\nThe last one matters more than it looks. Recording a first contribution as an event, in public, changes what arriving in a community feels like.",
    },
    fr: {
      title: "Gouvernance de la communauté Skilluv",
      summary:
        "Quatre dépôts publics qui rendent visibles les décisions, les règles et les arrivées, au lieu de les laisser implicites.",
      body: "Une communauté devient gouvernable à partir du moment où ses décisions cessent de vivre dans des conversations privées. Quatre dépôts portent cela ici : des RFC structurées pour les choix de produit, de technique et de gouvernance, un changelog public hebdomadaire, une charte pour le modèle de compagnonnage, et une chronologie publique des premiers commits des membres.\n\nLe dernier compte davantage qu'il n'y paraît. Consigner une première contribution comme un événement, publiquement, change ce que veut dire arriver dans une communauté.",
    },
  },
  {
    slug: "skilluv-starters",
    number: 3,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-07-22",
    endedOn: null,
    repositoryUrl: "https://github.com/Skilluv",
    liveUrl: null,
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
      title: "Skilluv starters",
      summary:
        "Fourteen reference implementations, one per track, each a working project rather than a template.",
      body: "Fourteen repositories covering full-stack Rust, Go, Python and Node, frontend work in React, Svelte and HTMX, mobile in Kotlin, Flutter and React Native, games in Bevy and Godot, embedded on the ESP32, data work in JupyterLab, and a DevOps track with OpenTofu and observability already wired in.\n\nEach one runs, has tests, and pins its versions. A learner who cannot get a project to start learns nothing except that the ecosystem is hostile.",
    },
    fr: {
      title: "Starters Skilluv",
      summary:
        "Quatorze implémentations de référence, une par filière, chacune un projet qui tourne plutôt qu'un gabarit.",
      body: "Quatorze dépôts couvrant le full-stack en Rust, Go, Python et Node, le front en React, Svelte et HTMX, le mobile en Kotlin, Flutter et React Native, le jeu avec Bevy et Godot, l'embarqué sur ESP32, la donnée avec JupyterLab, et une filière DevOps avec OpenTofu et l'observabilité déjà câblée.\n\nChacun démarre, comporte des tests et épingle ses versions. Un apprenant qui n'arrive pas à lancer un projet n'apprend rien, sinon que l'écosystème lui est hostile.",
    },
  },
  {
    slug: "chess-coach",
    number: 4,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-06-19",
    endedOn: "2026-06-24",
    repositoryUrl: "https://github.com/jeremie0342/coach_chess",
    liveUrl: null,
    stack: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Stockfish",
      "Unity 6",
      "C#",
      "Ollama",
    ],
    en: {
      title: "Chess coach",
      summary:
        "A self-hosted coach that reads your own games rather than a generic curriculum, split across a FastAPI backend and a Unity 6 client.",
      body: "The backend imports games from Chess.com, runs Stockfish over them, detects tactical motifs and generates puzzles from the positions where you actually went wrong. A spaced repetition schedule drives the opening repertoire, and a local language model writes the commentary, so nothing leaves the machine.\n\nThe client is a Unity 6 build using URP and UI Toolkit, with five concept scenes reachable from a central hub and speech synthesised locally through Piper. Choosing a game engine for what could have been a web page was a deliberate constraint: it forced the interface to be spatial rather than a list of moves.",
    },
    fr: {
      title: "Coach d'échecs",
      summary:
        "Un coach auto-hébergé qui lit vos propres parties plutôt qu'un programme générique, réparti entre un backend FastAPI et un client Unity 6.",
      body: "Le backend importe les parties depuis Chess.com, les analyse avec Stockfish, détecte les motifs tactiques et génère des exercices à partir des positions où vous vous êtes réellement trompé. Une répétition espacée pilote le répertoire d'ouvertures, et un modèle de langage local rédige les commentaires, si bien que rien ne quitte la machine.\n\nLe client est un build Unity 6 en URP et UI Toolkit, avec cinq scènes accessibles depuis un hub central et une synthèse vocale locale via Piper. Choisir un moteur de jeu pour ce qui aurait pu être une page web était une contrainte volontaire : elle a obligé l'interface à devenir spatiale au lieu de rester une liste de coups.",
    },
  },
  {
    slug: "trackmyweight",
    number: 5,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "CRIMSON",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-07-16",
    endedOn: "2026-08-14",
    repositoryUrl: "https://github.com/jeremie0342/trackmyweight",
    liveUrl: null,
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
      body: "Nutrition trackers assume a food database that does not contain what most of the world eats. This one is built around Benin and West African cuisine from the start, which is a data problem before it is an interface problem.\n\nEverything is local-first: Room for storage, Health Connect for synchronisation, WorkManager for background reconciliation. The app is fully usable with no network, which is not a line on a specification sheet but the condition for it being used at all.",
    },
    fr: {
      title: "TrackMyWeight",
      summary:
        "Un suivi de forme et de nutrition local-first pour Android, conçu autour de la cuisine ouest-africaine plutôt que traduit vers elle.",
      body: "Les applications de nutrition supposent une base d'aliments qui ne contient pas ce que mange la majeure partie du monde. Celle-ci est construite dès le départ autour de la cuisine béninoise et ouest-africaine, ce qui est un problème de données avant d'être un problème d'interface.\n\nTout est local-first : Room pour le stockage, Health Connect pour la synchronisation, WorkManager pour la réconciliation en tâche de fond. L'application reste entièrement utilisable sans réseau, ce qui n'est pas une ligne de spécification mais la condition pour qu'elle serve.",
    },
  },
  {
    slug: "worldsmith",
    number: 6,
    kind: "WORLD",
    status: "DRAFT",
    dimension: "CREATE",
    accent: "VIOLET",
    wear: "WORN",
    featured: false,
    startedOn: "2026-05-06",
    endedOn: "2026-06-24",
    repositoryUrl: null,
    liveUrl: null,
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

async function main() {
  for (const entry of entries) {
    const { en, fr, repositoryUrl, liveUrl, stack, ...base } = entry;

    const data = {
      ...base,
      startedOn: new Date(base.startedOn),
      endedOn: base.endedOn ? new Date(base.endedOn) : null,
      publishedAt: base.status === "PUBLISHED" ? new Date() : null,
    };

    const record = await db.entry.upsert({
      where: { slug: entry.slug },
      create: data,
      update: data,
    });

    for (const [locale, translation] of [
      ["EN", en],
      ["FR", fr],
    ] as const) {
      await db.entryTranslation.upsert({
        where: { entryId_locale: { entryId: record.id, locale } },
        create: { entryId: record.id, locale, ...translation },
        update: translation,
      });
    }

    /* An entry only ever carries the satellite matching its kind. */
    if (entry.kind === "PROJECT") {
      await db.project.upsert({
        where: { entryId: record.id },
        create: { entryId: record.id, repositoryUrl, liveUrl, stack },
        update: { repositoryUrl, liveUrl, stack },
      });
    }

    if (entry.kind === "WORLD") {
      await db.world.upsert({
        where: { entryId: record.id },
        create: { entryId: record.id },
        update: {},
      });
    }

    console.log(`${String(entry.number).padStart(3, "0")}  ${entry.slug}`);
  }

  const published = await db.entry.count({ where: { status: "PUBLISHED" } });
  const drafts = await db.entry.count({ where: { status: "DRAFT" } });
  console.log(`\n${published} published, ${drafts} draft.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
