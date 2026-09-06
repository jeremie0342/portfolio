/**
 * Archive contents.
 *
 * Everything here is drawn from a real source: the public repositories, the
 * curriculum vitae, or the organisations behind the work. Nothing is invented.
 * Private repositories carry no link, since a URL nobody can open is worse
 * than none.
 *
 * Numbers are accession numbers, not a chronology. They record the order in
 * which a piece entered the archive and are never reused, so a reference that
 * has been printed or shared keeps resolving. New work is appended.
 */

export type Translation = {
  title: string;
  summary: string;
  body?: string;
};

export type Seed = {
  slug: string;
  number: number;
  /* Key of a drawn diagram, matched against the registry in the components. */
  diagram?: string;
  parent?: string;
  rank?: number;
  kind: "PROJECT" | "WORLD" | "CREDENTIAL" | "POSITION";
  status: "DRAFT" | "PUBLISHED";
  dimension: "BUILD" | "LEAD" | "CREATE" | null;
  accent: "GOLD" | "CRIMSON" | "VIOLET";
  wear: "CLEAN" | "WORN";
  featured: boolean;
  startedOn: string;
  endedOn: string | null;
  repositoryUrl?: string | null;
  liveUrl?: string | null;
  stack?: string[];
  organization?: string;
  credentialKind?: "DEGREE" | "CERTIFICATION" | "COURSE" | "AWARD";
  location?: string;
  remote?: boolean;
  en: Translation;
  fr: Translation;
};

export const profiles = [
  {
    label: "GitHub",
    handle: "jeremie0342",
    url: "https://github.com/jeremie0342",
    rank: 1,
  },
  {
    label: "LinkedIn",
    handle: "jérémiezitti",
    url: "https://www.linkedin.com/in/jérémiezitti",
    rank: 2,
  },
  { label: "X", handle: "@jeremy0342", url: "https://x.com/jeremy0342", rank: 3 },
  /* Not listed: the account exists but has nothing on it yet, and the page
     answers 404. It comes back on from the console the day it does not. */
  {
    label: "dev.to",
    handle: "jeremie0342",
    url: "https://dev.to/jeremie0342",
    rank: 4,
    listed: false,
  },
] as const;

export const organizations = [
  { name: "KPS Groupe", url: "https://ubbfy.com", country: "BJ" },
  { name: "Orisum Groupe", url: "https://yaragroupe.com", country: "BJ" },
  { name: "BestCash", url: null, country: "BJ" },
  { name: "UATM GASA Formation", url: null, country: "BJ" },
] as const;

export const entries: Seed[] = [
  {
    slug: "skilluv",
    diagram: "skilluv",
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
    liveUrl: "https://skill-uv.com",
    stack: ["Rust", "Axum", "SvelteKit", "Python", "gRPC", "Redis", "PostgreSQL"],
    en: {
      title: "Skilluv",
      summary:
        "A skill platform built solo as a polyglot architecture, with a public governance layer around it. Open beta January 2027.",
      body: "Skilluv is the largest body of work in this archive and the only one that spans every dimension of it. A Rust backend, a Svelte frontend and admin, and a Python AI service that talks to the Rust core over gRPC when an answer is needed now and over a Redis queue when it is not. The core is 183,000 lines of Rust, 4,544 tests across 233 files and 468 migrations; the AI service is around 11,000 lines of Python.\n\nThe AI service does the work that makes the platform more than a course catalogue: challenge generation through an LLM, plagiarism detection that combines syntax trees with embeddings across eight languages, scored matching between talent and companies, and media processing for replays. Each of its methods has a latency budget written before it is served: under fifteen seconds at the median for a code review by a model, under two seconds for plagiarism detection, which is deterministic and owes nothing to a model. Going over blocks the release rather than being discovered by a learner.\n\nSplitting the admin panel out from the product is the decision that shaped the rest. An operations team and a learner have almost nothing in common in what they need to see, and merging them would have produced one interface permanently compromised for both.\n\nThe governance repositories matter as much as the code. A community becomes governable at the point where its decisions stop living in private conversations.\n\nThe decision I reversed: I wanted everything to run on my own server, down to the development environments, Blender and Penpot. It worked for one user and for no others. I stopped in time, but late, and it is the kind of ambition that has to be judged on what the next thousand users cost rather than on whether it stands up on the first day.",
    },
    fr: {
      title: "Skilluv",
      summary:
        "Une plateforme de compétences construite en solo sur une architecture polyglotte, entourée d’une gouvernance publique. Bêta ouverte en janvier 2027.",
      body: "Skilluv est l’ensemble le plus vaste de cette archive, et le seul qui en traverse toutes les dimensions. Un backend Rust, un front et une administration en Svelte, et un service IA Python qui parle au cœur Rust en gRPC quand la réponse doit arriver tout de suite, et par une file Redis quand elle peut attendre. Le cœur, c’est 183 000 lignes de Rust, 4 544 tests répartis sur 233 fichiers et 468 migrations ; le service IA, environ 11 000 lignes de Python.\n\nLe service IA fait le travail qui distingue la plateforme d’un catalogue de cours : génération de défis par un LLM, détection de plagiat combinant arbres syntaxiques et embeddings sur huit langages, appariement noté entre talents et entreprises, et traitement des rediffusions. Chacune de ses méthodes a un budget de latence écrit avant d’être servie : moins de quinze secondes en médiane pour une revue de code par un modèle, moins de deux secondes pour la détection de plagiat, qui est déterministe et ne doit rien à un modèle. Un dépassement bloque la mise en ligne au lieu d’être découvert par un apprenant.\n\nSéparer l’administration du produit est la décision qui a structuré le reste. Une équipe d’exploitation et un apprenant n’ont presque rien en commun dans ce qu’ils ont besoin de voir, et les réunir aurait produit une interface durablement médiocre pour les deux.\n\nLes dépôts de gouvernance comptent autant que le code. Une communauté devient gouvernable à partir du moment où ses décisions cessent de vivre dans des conversations privées.\n\nLa décision que j’ai reprise : je voulais que tout tourne sur mon propre serveur, jusqu’aux environnements de développement, à Blender et à Penpot. Ça marchait pour un utilisateur et pour aucun autre. J’ai arrêté à temps, mais tard, et c’est le genre d’ambition qui se juge sur ce que coûte le millier d’utilisateurs suivant, pas sur le fait qu’elle tienne debout le premier jour.",
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
    stack: ["Rust", "Axum", "PostgreSQL", "Redis"],
    en: {
      title: "API core",
      summary:
        "The Rust and Axum service every other part of the platform talks to.",
    },
    fr: {
      title: "Cœur d’API",
      summary:
        "Le service Rust et Axum auquel toutes les autres parties de la plateforme s’adressent.",
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
      summary: "The SvelteKit surface learners actually use.",
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
      title: "Panneau d’administration",
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
    stack: ["Python", "gRPC", "tree-sitter", "sentence-transformers", "ffmpeg"],
    en: {
      title: "AI service",
      summary:
        "Challenge generation, plagiarism detection across eight languages, talent matching and media processing.",
      body: "Plagiarism detection is the hard part and the reason the service exists as its own process. Comparing syntax trees catches structural copying that renaming variables would hide, and embeddings catch the reverse, code rewritten to look different while doing the same thing. Neither approach is sufficient alone, so both run and their scores are combined.",
    },
    fr: {
      title: "Service IA",
      summary:
        "Génération de défis, détection de plagiat sur huit langages, appariement des talents et traitement des médias.",
      body: "La détection de plagiat est la partie difficile, et la raison pour laquelle ce service vit dans son propre processus. Comparer les arbres syntaxiques attrape la copie structurelle qu’un simple renommage de variables masquerait, et les embeddings attrapent l’inverse, du code réécrit pour paraître différent tout en faisant la même chose. Aucune des deux approches ne suffit seule, alors les deux tournent et leurs scores se combinent.",
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
        "Une implémentation de référence par filière, chacune un projet qui tourne plutôt qu’un gabarit.",
      body: "Full-stack en Rust, Go, Python et Node. Front en React, Svelte et HTMX. Mobile en Kotlin, Flutter et React Native. Jeu avec Bevy et Godot. Embarqué sur ESP32. Donnée avec JupyterLab. Une filière DevOps avec OpenTofu et l’observabilité déjà câblée.\n\nChacun démarre, comporte des tests et épingle ses versions. Un apprenant qui n’arrive pas à lancer un projet n’apprend rien, sinon que l’écosystème lui est hostile.",
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
      body: "Des RFC structurées pour les choix de produit, de technique et de gouvernance. Un changelog public hebdomadaire. Une charte pour le modèle de compagnonnage. Et une chronologie publique des premiers commits des membres.\n\nLe dernier compte davantage qu’il n’y paraît. Consigner une première contribution comme un événement, publiquement, change ce que veut dire arriver dans une communauté.",
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
    featured: false,
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
      title: "Coach d’échecs",
      summary:
        "Un coach auto-hébergé qui lit vos propres parties plutôt qu’un programme générique, réparti entre un backend et un client moteur de jeu.",
      body: "Tout tourne en local, y compris le modèle de langage qui rédige les commentaires. Rien de votre jeu ne quitte la machine.\n\nChoisir un moteur de jeu pour ce qui aurait pu être une page web était une contrainte volontaire : elle a obligé l’interface à devenir spatiale au lieu de rester une liste de coups.",
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
    stack: ["Python", "FastAPI", "SQLAlchemy", "Stockfish", "Ollama"],
    en: {
      title: "Analysis backend",
      summary:
        "Imports games from Chess.com, runs Stockfish over them, detects tactical motifs and generates puzzles from the positions where you actually went wrong.",
    },
    fr: {
      title: "Backend d’analyse",
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
    featured: false,
    startedOn: "2026-07-16",
    endedOn: "2026-08-14",
    repositoryUrl: "https://github.com/jeremie0342/trackmyweight",
    stack: ["Kotlin", "Jetpack Compose", "Room", "Hilt", "Health Connect"],
    en: {
      title: "TrackMyWeight",
      summary:
        "A local-first fitness and nutrition tracker for Android, built on a food database written for the people using it rather than translated for them.",
      body: "Nutrition trackers assume a food database that does not contain what most of the world eats. This one is built around Benin and West African cuisine from the start, which is a data problem before it is an interface problem.\n\nThe app is fully usable with no network. That is not a line on a specification sheet but the condition for it being used at all.",
    },
    fr: {
      title: "TrackMyWeight",
      summary:
        "Un suivi de forme et de nutrition local-first pour Android, construit sur une base d’aliments écrite pour ceux qui s’en servent plutôt que traduite pour eux.",
      body: "Les applications de nutrition supposent une base d’aliments qui ne contient pas ce que mange la majeure partie du monde. Celle-ci est construite dès le départ autour de la cuisine béninoise et ouest-africaine, ce qui est un problème de données avant d’être un problème d’interface.\n\nL’application reste entièrement utilisable sans réseau. Ce n’est pas une ligne de spécification, c’est la condition pour qu’elle serve.",
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
      body: "Cette entrée existe pour que l’archive ait une place réservée à ce qui relève de l’imaginaire plutôt que du livré. Elle reste non publiée volontairement : le dépôt qui la porte est privé, et son périmètre n’a été décrit publiquement nulle part.",
    },
  },
  {
    slug: "ubbfy",
    diagram: "ubbfy",
    number: 13,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "LEAD",
    accent: "CRIMSON",
    wear: "CLEAN",
    featured: true,
    startedOn: "2025-10-01",
    endedOn: null,
    repositoryUrl: null,
    liveUrl: "https://ubbfy.com",
    stack: ["Django", "DRF", "Vue 3", "Celery", "PostgreSQL", "Stripe", "FedaPay"],
    en: {
      title: "UBBFY",
      summary:
        "Lead architect on a multi-tenant ERP, CRM and HR platform in production for many clients.",
      body: "About ten companies run their operations on it, the largest of them managing two hundred employees and contractors. The platform is thirty-three server-side modules, 338 data models and close to four hundred screens, served in three languages: KPS, Planus, Flowplan, Gotolearn and People&Skill are the tenants in production.\n\nI came onto a project already under way, written in Laravel on MySQL, and the first decision was to restructure it onto Django and PostgreSQL. Migrating data is thankless work that bills you late: timestamps carried over from the old database came in an hour behind, and that kind of gap never shows in review, it shows in production on somebody's timesheet.\n\nThe parts that decided the architecture were the ones nobody sees. Role-based access built to be configured rather than coded, so a new tenant does not mean a new deployment. An event bus on Celery, so a module can react to another without importing it. An audit trail, because a platform holding several companies' operations has to be able to answer what happened and who did it. Billing runs through Stripe and FedaPay together, which is what serving both European and West African clients actually requires.\n\nWhat I did not see coming was internationalisation. I did not design for it, and retrofitting it onto a written codebase took the development environment down for days. The problem was not translation, it was the boundary: interface strings are mine, content typed by a tenant is theirs and has to exist in languages I do not choose. A notification now leaves in the language of whoever reads it rather than whoever triggered it. That is a decision I take on the first day of a project now, not in the sixth month.\n\nThe floor is held by tests: 3,146 on the server, 468 end-to-end runs through the browser.",
    },
    fr: {
      title: "UBBFY",
      summary:
        "Architecte principal d’une plateforme ERP, CRM et RH multi-tenant, en production chez de nombreux clients.",
      body: "Une dizaine d’entreprises y font tourner leur exploitation, la plus grande gérant deux cents salariés et prestataires. La plateforme, c’est trente-trois modules côté serveur, 338 modèles de données et près de quatre cents écrans, servis en trois langues : KPS, Planus, Flowplan, Gotolearn et People&Skill sont les tenants en production.\n\nJe suis arrivé sur un projet déjà commencé, écrit en Laravel sur MySQL, et la première décision a été de le restructurer vers Django et PostgreSQL. Migrer des données est un travail ingrat qui se facture tard : les horodatages repris de l’ancienne base arrivaient avec une heure de retard, et ce genre d’écart ne se voit pas en recette, il se voit en production sur la feuille de temps de quelqu’un.\n\nCe qui a décidé de l’architecture, ce sont les parties que personne ne voit. Des droits d’accès conçus pour être configurés plutôt que codés, de sorte qu’un nouveau tenant n’implique pas un nouveau déploiement. Un bus d’événements sur Celery, pour qu’un module puisse réagir à un autre sans l’importer. Une piste d’audit, parce qu’une plateforme qui héberge l’exploitation de plusieurs entreprises doit pouvoir dire ce qui s’est passé et qui l’a fait. La facturation passe par Stripe et FedaPay ensemble, ce qu’exige réellement le fait de servir des clients européens et ouest-africains.\n\nCe que je n’ai pas vu venir, c’est l’internationalisation. Je ne l’ai pas prévue au départ, et la rattraper sur une base déjà écrite a mis l’environnement de développement à terre plusieurs jours. Le problème n’était pas la traduction, c’était la frontière : les chaînes de l’interface sont à moi, le contenu saisi par un tenant est à lui et doit exister dans des langues que je ne choisis pas. Une notification part maintenant dans la langue de qui la lit, pas de qui la déclenche. C’est une décision que je prends désormais le premier jour d’un projet, pas au sixième mois.\n\nLe socle est tenu par les tests : 3 146 côté serveur, 468 parcours de bout en bout dans le navigateur.",
    },
  },
  {
    slug: "allons-voter",
    number: 14,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "CRIMSON",
    wear: "CLEAN",
    featured: true,
    startedOn: "2026-03-07",
    endedOn: "2026-03-23",
    repositoryUrl: null,
    stack: ["Next.js 16", "MongoDB", "MinIO", "JWT"],
    en: {
      title: "Allons Voter",
      summary:
        "A civic technology platform deployed during the 2026 Benin presidential campaign, designed and shipped end to end.",
      body: "Sixteen days between the first commit and production, from 7 to 23 March 2026, in the middle of a presidential campaign. Thirteen data models, forty-eight API routes, thirty-four pages across the public site and the back office. I was alone on the code; the deployment was done with colleagues.\n\nMore than ten thousand visitors over the campaign, peaking at five hundred people on the site at once. It held on the day of the vote.\n\nA civic platform during an election is a moderation problem before it is a software problem. Asking a question takes no account, which is the only way to get questions at all, so anti-spam, one vote per person and moderation were part of the first design rather than a later patch: a challenge and a per-address limit at the door, a browser fingerprint on the vote, a moderation log on every decision, and sessions on rotating tokens in HttpOnly cookies, because the cost of getting authentication wrong here is not measured in support tickets.",
    },
    fr: {
      title: "Allons Voter",
      summary:
        "Une plateforme de tech civique déployée pendant la campagne présidentielle béninoise de 2026, conçue et livrée de bout en bout.",
      body: "Seize jours entre le premier commit et la mise en production, du 7 au 23 mars 2026, en pleine campagne présidentielle. Treize modèles de données, quarante-huit routes d’API, trente-quatre pages entre le site public et le back-office. J’étais seul sur le code ; le déploiement s’est fait avec des collègues.\n\nPlus de dix mille visiteurs sur la durée de la campagne, avec un pic à cinq cents personnes en même temps sur le site. Elle a tenu le jour du scrutin.\n\nUne plateforme civique en période électorale est un problème de modération avant d’être un problème logiciel. Poser une question ne demande pas de compte, ce qui est la seule façon d’avoir des questions, donc l’anti-spam, le vote unique et la modération faisaient partie de la conception initiale plutôt que d’un correctif ultérieur : une épreuve et une limite par adresse à l’entrée, une empreinte de navigateur sur le vote, un journal de modération sur chaque décision, et des sessions à jetons rotatifs en cookies HttpOnly, parce que le coût d’une authentification ratée ne se mesure pas ici en tickets de support.",
    },
  },
  {
    slug: "diaspora-row",
    number: 15,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-03-08",
    endedOn: "2026-04-08",
    repositoryUrl: null,
    stack: ["Next.js 15", "MongoDB", "better-auth", "Turnstile"],
    en: {
      title: "Diaspora ROW",
      summary:
        "The official diaspora campaign site, delivered in a one-month sprint: seventeen sections and a back office covering eighteen resources.",
      body: "Around seventeen thousand lines in a month, which is only possible because the back office was generated from the resource definitions rather than written eighteen times. The interesting constraint was not the volume but the deadline: a campaign site that ships late ships never. The date held, and the site carried traffic of the same order as Allons Voter over the campaign.",
    },
    fr: {
      title: "Diaspora ROW",
      summary:
        "Le site officiel de campagne pour la diaspora, livré en un sprint d’un mois : dix-sept sections et un back-office couvrant dix-huit ressources.",
      body: "Environ dix-sept mille lignes en un mois, ce qui n’est possible que parce que le back-office a été engendré à partir des définitions de ressources plutôt qu’écrit dix-huit fois. La contrainte intéressante n’était pas le volume mais l’échéance : un site de campagne livré en retard n’est jamais livré. La date a tenu, et le site a porté sur la campagne un trafic du même ordre qu’Allons Voter.",
    },
  },
  {
    slug: "market-demand-pipeline",
    diagram: "pipeline",
    number: 16,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2025-12-02",
    endedOn: "2026-03-19",
    repositoryUrl: null,
    stack: ["Python", "Selenium", "Docker", "PostgreSQL"],
    en: {
      title: "Market Demand Pipeline",
      summary:
        "A five-stage production ETL system that scrapes, normalises and tracks job market demand.",
      body: "Scraping is easy to demonstrate and hard to run. Three job platforms are collected, LinkedIn, FreeWork and Welcome to the Jungle, through five stages: collect, clean, enrich, control, load. The stages are separated so a failure in one does not corrupt the others, every run is tracked, and the logs are structured because the question asked of a pipeline at three in the morning is always which run and which stage.\n\nVersion 2.0.1 went into production in March 2026 and it has run since, maintained and extended by other people. Handing a pipeline over is the test of whether its logs were written for someone else.",
    },
    fr: {
      title: "Market Demand Pipeline",
      summary:
        "Un système ETL de production en cinq étapes, qui collecte, normalise et suit la demande du marché de l’emploi.",
      body: "Le scraping est facile à démontrer et difficile à exploiter. Trois plateformes d’offres sont collectées, LinkedIn, FreeWork et Welcome to the Jungle, à travers cinq étages : collecte, nettoyage, enrichissement, contrôle, chargement. Les étages sont séparés pour qu’une défaillance de l’un ne corrompe pas les autres, chaque exécution est tracée, et les journaux sont structurés parce que la question posée à un pipeline à trois heures du matin est toujours quelle exécution et quelle étape.\n\nLa version 2.0.1 est passée en production en mars 2026 et tourne depuis, maintenue et étendue par d’autres. Passer la main sur un pipeline est l’épreuve qui dit si ses journaux ont été écrits pour quelqu’un d’autre.",
    },
  },
  {
    slug: "yara",
    number: 17,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "LEAD",
    accent: "VIOLET",
    wear: "CLEAN",
    featured: true,
    startedOn: "2025-01-01",
    endedOn: null,
    repositoryUrl: null,
    liveUrl: "https://yaragroupe.com",
    stack: ["Node.js", "Express", "Vue.js"],
    en: {
      title: "Yara",
      summary:
        "Technical direction of a cultural and tourism platform: one digital identity replacing the physical ticket for events, restaurants and tourism. Private beta, public launch in Q4 2026.",
      body: "The role here is not writing the code. It is owning the architecture, the stack decisions, the scope, the deadlines and the review across a team of three.\n\nWhat makes it worth an entry is the product idea rather than the stack. Replacing a physical ticket with an identity changes what the platform is: not a booking tool but the thing a visitor carries between a concert, a meal and a museum.",
    },
    fr: {
      title: "Yara",
      summary:
        "Direction technique d’une plateforme culturelle et touristique : une identité numérique qui remplace le billet physique pour les événements, la restauration et le tourisme. Bêta privée, lancement public au quatrième trimestre 2026.",
      body: "Le rôle ici n’est pas d’écrire le code. C’est de porter l’architecture, les choix de stack, le périmètre, les échéances et la revue au sein d’une équipe de trois.\n\nCe qui en fait une entrée, c’est l’idée produit plutôt que la stack. Remplacer un billet physique par une identité change la nature de la plateforme : ce n’est plus un outil de réservation, c’est ce qu’un visiteur porte avec lui entre un concert, un repas et un musée.",
    },
  },
  {
    slug: "ubbfy-roadmap",
    number: 22,
    parent: "ubbfy",
    rank: 1,
    kind: "PROJECT",
    status: "PUBLISHED",
    dimension: "LEAD",
    accent: "CRIMSON",
    wear: "CLEAN",
    featured: false,
    startedOn: "2026-06-12",
    endedOn: null,
    repositoryUrl: null,
    en: {
      title: "UBBFY v2, the plan",
      summary:
        "Five workstreams that carry the platform into 2027, estimated in days and ordered by what depends on what.",
      body: "Written in June 2026 for a management that asked what the digital service would deliver in the second half of the year. It puts a number on five workstreams: stock, 34 to 43 days; logistics, 27 to 34; accounting, 50 to 62; the extension of documents, 22 to 27; and the administration layer that carries internationalisation, configurable workflows, backup and the shop, 48 to 63. Between a hundred and eighty-one and two hundred and twenty-nine days in total.\n\nThe order is not a preference, it is a dependency chain. The catalogue, already delivered, unblocks stock; stock unblocks logistics; accounting consumes invoicing, payroll and stock movements to produce entries, so it cannot come first however much anyone would like it to. Writing that down is what stops a roadmap from being reordered by whoever asks last.\n\nAccounting is designed for two markets at once, France and the OHADA zone, which is a product decision before it is a technical one. A single chart of accounts would have made the platform sellable in one of them and useless in the other, and that choice is far cheaper to make before the module exists.\n\nEstimates are ranges rather than figures, and the ranges widen with what is least understood. A plan that gives one number per line is a plan whose author stopped reading halfway down it.",
    },
    fr: {
      title: "UBBFY v2, le plan",
      summary:
        "Cinq chantiers qui portent la plateforme jusqu’en 2027, chiffrés en jours et ordonnés par ce qui dépend de quoi.",
      body: "Rédigé en juin 2026 pour une direction qui demandait ce que le service digital livrerait au second semestre. Il chiffre cinq chantiers : les stocks, 34 à 43 jours ; la logistique, 27 à 34 ; la comptabilité, 50 à 62 ; l’extension des documents, 22 à 27 ; et la couche d’administration qui porte l’internationalisation, les workflows configurables, la sauvegarde et la boutique, 48 à 63. Entre cent quatre-vingt-un et deux cent vingt-neuf jours au total.\n\nL’ordre n’est pas une préférence, c’est une chaîne de dépendances. Le catalogue, déjà livré, débloque les stocks ; les stocks débloquent la logistique ; la comptabilité consomme la facturation, la paie et les mouvements de stock pour produire ses écritures, donc elle ne peut pas passer en premier, quelle que soit l’envie qu’on en a. L’écrire est ce qui empêche une feuille de route d’être réordonnée par celui qui demande en dernier.\n\nLa comptabilité est conçue pour deux marchés à la fois, la France et la zone OHADA, ce qui est une décision produit avant d’être une décision technique. Un plan comptable unique aurait rendu la plateforme vendable dans l’un et inutile dans l’autre, et cet arbitrage coûte infiniment moins cher avant que le module existe.\n\nLes estimations sont des fourchettes et non des chiffres, et les fourchettes s’élargissent avec ce qu’on comprend le moins. Un plan qui donne un nombre par ligne est un plan dont l’auteur s’est arrêté de lire à la moitié.",
    },
  },
  {
    slug: "kps-groupe",
    number: 18,
    kind: "POSITION",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2025-10-01",
    endedOn: null,
    organization: "KPS Groupe",
    location: "Remote",
    remote: true,
    en: {
      title: "Full-stack developer and backend architect",
      summary:
        "Lead architect on UBBFY, a multi-tenant SaaS platform run by about ten companies, the largest managing two hundred employees and contractors. The platform holds thirty-three server-side modules, 338 data models and close to four hundred screens in three languages, built by a team of eight. My part since October 2025: the foundations, meaning per-module permissions configured rather than coded, an event bus on Celery, an audit trail, object storage and a currency service covering 160 currencies; eight business modules delivered end to end, among them documents with electronic signature, the helpdesk and billing through Stripe and FedaPay; the platform administration application; and 1,154 commits across the two repositories. Three further production systems delivered across the same period, among them a civic platform and an ETL pipeline.",
    },
    fr: {
      title: "Développeur full-stack et architecte backend",
      summary:
        "Architecte principal d’UBBFY, plateforme SaaS multi-tenant sur laquelle tourne l’exploitation d’une dizaine d’entreprises, la plus grande gérant deux cents salariés et prestataires. La plateforme compte trente-trois modules côté serveur, 338 modèles de données et près de quatre cents écrans en trois langues, construits par une équipe de huit. Ma part depuis octobre 2025 : le socle, c’est-à-dire des droits par module configurés plutôt que codés, un bus d’événements sur Celery, une piste d’audit, le stockage objet et un service de devises couvrant 160 monnaies ; huit modules métier livrés de bout en bout, dont les documents avec signature électronique, le support et la facturation par Stripe et FedaPay ; l’application d’administration de la plateforme ; et 1 154 commits sur les deux dépôts. Trois autres systèmes en production livrés sur la même période, dont une plateforme civique et un pipeline ETL.",
    },
  },
  {
    slug: "orisum-groupe",
    number: 19,
    kind: "POSITION",
    status: "PUBLISHED",
    dimension: "LEAD",
    accent: "CRIMSON",
    wear: "CLEAN",
    featured: false,
    startedOn: "2025-01-01",
    endedOn: null,
    organization: "Orisum Groupe",
    location: "Remote",
    remote: true,
    en: {
      title: "Chief technical officer",
      summary:
        "Technical direction of Yara across a team of three, covering frontend, backend and operations: architecture, stack decisions, scope, deadlines and code review. One digital identity replacing the physical ticket for events, restaurants and tourism. Private beta, public launch in Q4 2026.",
    },
    fr: {
      title: "Directeur technique",
      summary:
        "Direction technique de Yara sur une équipe de trois, front, back et exploitation : architecture, choix de stack, périmètre, échéances et revue de code. Une identité numérique qui remplace le billet physique pour les événements, la restauration et le tourisme. Bêta privée, lancement public au quatrième trimestre 2026.",
    },
  },
  {
    slug: "bestcash",
    number: 20,
    kind: "POSITION",
    status: "PUBLISHED",
    dimension: "BUILD",
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2024-01-01",
    endedOn: "2025-01-01",
    organization: "BestCash",
    location: "Bénin",
    remote: false,
    en: {
      title: "Software engineer, internship",
      summary:
        "Internal dashboards and documentation tools for a fintech running virtual and physical prepaid cards, mobile money and payment services. Responsive interfaces, user data management and technical documentation across several internal projects, in Angular and NestJS.",
    },
    fr: {
      title: "Ingénieur logiciel, stage",
      summary:
        "Tableaux de bord internes et outils de documentation pour une fintech opérant cartes prépayées virtuelles et physiques, mobile money et solutions de paiement. Interfaces responsives, gestion des données utilisateurs et documentation technique sur plusieurs projets internes, en Angular et NestJS.",
    },
  },
  {
    slug: "licence-pro-sil",
    number: 21,
    kind: "CREDENTIAL",
    status: "PUBLISHED",
    dimension: null,
    accent: "GOLD",
    wear: "CLEAN",
    featured: false,
    startedOn: "2024-01-01",
    endedOn: "2024-12-31",
    organization: "UATM GASA Formation",
    credentialKind: "DEGREE",
    en: {
      title: "Professional bachelor's in computer software engineering",
      summary: "Licence professionnelle SIL. UATM GASA Formation, Benin.",
    },
    fr: {
      title: "Licence professionnelle en génie logiciel",
      summary: "Licence professionnelle SIL. UATM GASA Formation, Bénin.",
    },
  },
];
