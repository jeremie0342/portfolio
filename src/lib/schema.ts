import portrait from "@/images/portrait.jpg";
import { contact } from "./contact";
import { listProfiles } from "./entries";
import { siteUrl } from "./site";
import type { Locale } from "@/i18n/routing";

/**
 * Structured data.
 *
 * The point of this file is entity resolution rather than decoration. The
 * person behind this site is searched for under at least four different names,
 * Jérémie, Zardonis, ZITTI and Flemart, and a search engine has no way of
 * knowing those are one person unless it is told. `alternateName` says so, and
 * `sameAs` anchors the claim to profiles the engine already knows, which is
 * what turns a page about a name into a page about a person.
 *
 * Everything here is generated from the same constants the pages render, so
 * the markup cannot drift from what a reader sees. Structured data that
 * disagrees with the page is worse than none: it is a manual action waiting to
 * happen.
 */

const personId = `${siteUrl}/#person`;
const siteId = `${siteUrl}/#website`;

export async function personSchema(locale: Locale) {
  const profiles = await listProfiles();

  return {
    "@type": "Person",
    "@id": personId,
    name: "Zardonis Jérémie ZITTI",
    /* Every form the same person is searched under, including the one the
       masthead shows and the handle the repositories carry. */
    alternateName: [
      "Zardonis",
      "Jérémie ZITTI",
      "Jeremie Zitti",
      "Zardonis ZITTI",
      "Flemart",
      "jeremie0342",
    ],
    givenName: "Jérémie",
    familyName: "ZITTI",
    jobTitle:
      locale === "fr"
        ? "Ingénieur produit et développeur full-stack"
        : "Product engineer and full-stack developer",
    description:
      locale === "fr"
        ? "Ingénieur produit et développeur full-stack basé à Cotonou, au Bénin. Architecture, backend, front, infrastructure et direction produit."
        : "Product engineer and full-stack developer based in Cotonou, Benin. Architecture, backend, frontend, infrastructure and product direction.",
    url: `${siteUrl}/${locale}`,
    /* The build hashed path, made absolute. A search engine resolving a person
       wants a picture of them, and pointing at the one the page actually shows
       keeps the two from disagreeing. */
    image: `${siteUrl}${portrait.src}`,
    email: `mailto:${contact.email}`,
    telephone: contact.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: contact.city,
      addressCountry: "BJ",
    },
    nationality: { "@type": "Country", name: "Bénin" },
    /* The anchor of the whole thing. Each of these is a profile a search engine
       already has, so the identity here is corroborated rather than asserted.
       Read from the same table the contact page lists, so the claim and the
       page cannot disagree. */
    sameAs: profiles.map((profile) => profile.url),
    knowsLanguage: ["fr", "en"],
    knowsAbout: [
      "Product engineering",
      "Software architecture",
      "TypeScript",
      "Rust",
      "Python",
      "Django",
      "Next.js",
      "PostgreSQL",
      "Multi-tenant SaaS",
      "Open source governance",
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "UATM GASA Formation",
      address: {
        "@type": "PostalAddress",
        addressCountry: "BJ",
      },
    },
    worksFor: [
      { "@type": "Organization", name: "KPS Groupe", url: "https://ubbfy.com" },
      {
        "@type": "Organization",
        name: "Orisum Groupe",
        url: "https://yaragroupe.com",
      },
    ],
  };
}

export function websiteSchema(locale: Locale) {
  return {
    "@type": "WebSite",
    "@id": siteId,
    url: `${siteUrl}/${locale}`,
    name: "Zardonis",
    inLanguage: locale,
    author: { "@id": personId },
    publisher: { "@id": personId },
  };
}

/** The front page is a profile page: it is about a person, not about a topic. */
export function profilePageSchema(locale: Locale, title: string) {
  return {
    "@type": "ProfilePage",
    "@id": `${siteUrl}/${locale}#profile`,
    url: `${siteUrl}/${locale}`,
    name: title,
    inLanguage: locale,
    isPartOf: { "@id": siteId },
    about: { "@id": personId },
    mainEntity: { "@id": personId },
  };
}

export function collectionSchema(
  locale: Locale,
  path: string,
  title: string,
  description: string,
) {
  return {
    "@type": "CollectionPage",
    "@id": `${siteUrl}/${locale}${path}`,
    url: `${siteUrl}/${locale}${path}`,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { "@id": siteId },
    about: { "@id": personId },
  };
}

export function entrySchema(
  locale: Locale,
  entry: {
    slug: string;
    title: string;
    summary: string | null;
    startedOn: Date | null;
    endedOn: Date | null;
    stack: string[];
    repositoryUrl: string | null;
    kind: string;
  },
) {
  /* A project with a repository is source code and says so; a world is a
     creative work. Claiming SoftwareSourceCode for something with no code
     would be the kind of overreach that gets structured data ignored. */
  const type =
    entry.kind === "PROJECT" && entry.repositoryUrl
      ? "SoftwareSourceCode"
      : "CreativeWork";

  return {
    "@type": type,
    "@id": `${siteUrl}/${locale}/archive/${entry.slug}`,
    url: `${siteUrl}/${locale}/archive/${entry.slug}`,
    name: entry.title,
    ...(entry.summary ? { description: entry.summary } : {}),
    inLanguage: locale,
    author: { "@id": personId },
    creator: { "@id": personId },
    isPartOf: { "@id": siteId },
    ...(entry.startedOn
      ? { dateCreated: entry.startedOn.toISOString().slice(0, 10) }
      : {}),
    ...(entry.endedOn
      ? { dateModified: entry.endedOn.toISOString().slice(0, 10) }
      : {}),
    ...(entry.stack.length > 0
      ? { programmingLanguage: entry.stack, keywords: entry.stack.join(", ") }
      : {}),
    ...(entry.repositoryUrl ? { codeRepository: entry.repositoryUrl } : {}),
  };
}

export function breadcrumbSchema(
  locale: Locale,
  trail: { name: string; path: string }[],
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, position) => ({
      "@type": "ListItem",
      position: position + 1,
      name: step.name,
      item: `${siteUrl}/${locale}${step.path}`,
    })),
  };
}

/** One graph per page rather than several scripts: the nodes cross-reference
    each other by id, and a single graph lets a crawler resolve them in one
    pass. */
export function graph(nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
