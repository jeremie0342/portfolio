import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  listPositions,
  listCredentials,
  type CareerRecord,
} from "@/lib/entries";
import { skills } from "@/lib/skills";
import { organisations } from "@/lib/contact";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/json-ld";
import { languageAlternates } from "@/lib/site";
import {
  breadcrumbSchema,
  collectionSchema,
  graph,
  personSchema,
} from "@/lib/schema";

export const revalidate = 3600;

export async function generateMetadata(
  props: PageProps<"/[locale]/about">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/about`,
      languages: languageAlternates("/about"),
    },
  };
}

/**
 * The career page.
 *
 * Positions and credentials are archive entries like any other, they simply
 * belong here rather than in the index: a job is where work happened, not the
 * work itself. Both are read from the database, so adding a certification is
 * an edit to the seed rather than to this file.
 */
export default async function About({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations("about");
  const site = await getTranslations("site");
  const footer = await getTranslations("footer");

  const positions = await listPositions(locale);
  const credentials = await listCredentials(locale);

  function span(record: CareerRecord) {
    const start = record.startedOn?.getUTCFullYear();
    const end = record.endedOn?.getUTCFullYear();

    if (!start) {
      return null;
    }

    if (!end) {
      return `${start} / ${t("present")}`;
    }

    return start === end ? String(start) : `${start} / ${end}`;
  }

  return (
    <main className="px-(--spacing-gutter) py-(--spacing-gutter)">
      {/* The career page repeats the person in full. It is the page most
          likely to be the one a search engine lands on for the name, and the
          only one whose content is the biography itself. */}
      <JsonLd
        data={graph([
          personSchema(locale),
          collectionSchema(locale, "/about", t("title"), t("metaDescription")),
          breadcrumbSchema(locale, [
            { name: site("name"), path: "" },
            { name: t("title"), path: "/about" },
          ]),
        ])}
      />

      <SiteHeader locale={locale} />

      <section className="pt-(--spacing-section) pb-16">
        <p className="t-meta text-accent">{site("person")}</p>

        <h1 className="t-display text-display-xl mt-8">{t("title")}</h1>

        <div className="measure mt-10">
          {t("intro")
            .split("\n\n")
            .map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-body-l mt-5">
                {paragraph}
              </p>
            ))}
        </div>
      </section>

      <section>
        <p className="t-meta text-accent">{t("experience")}</p>

        <div className="mt-8">
          {positions.map((position) => (
            <article
              key={position.slug}
              className="grid gap-x-10 gap-y-3 border-t border-rule py-8 md:grid-cols-[10rem_1fr]"
            >
              <div>
                <p className="t-meta text-accent">{span(position)}</p>
                <p className="t-meta text-content-muted mt-2">
                  {position.location}
                </p>
              </div>

              <div>
                <h2 className="t-display text-display-m">{position.title}</h2>

                <p className="t-label text-content-muted mt-3">
                  {position.organizationUrl ? (
                    <a
                      href={position.organizationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-accent underline-offset-4"
                    >
                      {position.organization}
                    </a>
                  ) : (
                    position.organization
                  )}
                </p>

                {position.summary ? (
                  <p className="measure t-register text-content-muted mt-4">
                    {position.summary}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-(--spacing-section)">
        <p className="t-meta text-accent">{t("education")}</p>

        <div className="mt-8">
          {credentials.map((credential) => (
            <article
              key={credential.slug}
              className="grid gap-x-10 gap-y-3 border-t border-rule py-8 md:grid-cols-[10rem_1fr]"
            >
              <p className="t-meta text-accent">{span(credential)}</p>

              <div>
                <h2 className="t-display text-display-m">{credential.title}</h2>
                {credential.summary ? (
                  <p className="measure t-register text-content-muted mt-3">
                    {credential.summary}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-(--spacing-section)">
        <p className="t-meta text-accent">{t("skills")}</p>

        <dl className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {skills.map((group) => (
            <div key={group.key}>
              <dt className="t-meta text-content-muted">
                {t(`skillGroups.${group.key}`)}
              </dt>
              <dd className="t-register mt-2">{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-(--spacing-section) grid gap-x-12 gap-y-12 md:grid-cols-2">
        <div>
          <p className="t-meta text-accent">{t("organisations")}</p>
          <ul className="mt-6">
            {organisations.map((organisation) => (
              <li key={organisation.name} className="t-register mt-2">
                {organisation.url ? (
                  <a
                    href={organisation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-accent underline-offset-4"
                  >
                    {organisation.name}
                  </a>
                ) : (
                  organisation.name
                )}
                <span className="text-content-muted"> {organisation.role}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="t-meta text-accent">{t("languages")}</p>
          <p className="measure t-register mt-6">{t("languagesBody")}</p>
        </div>
      </section>

      {/* The page ended on a link to the archive, which answers a question a
          reader of a career page has not asked. They came to find out whether
          to write. */}
      <section className="mt-(--spacing-section)">
        <p className="t-meta text-accent">{t("closing.label")}</p>

        <p className="measure-lead text-body-l mt-6">{t("closing.body")}</p>

        <Link
          href="/contact"
          className="t-meta text-accent mt-8 inline-block underline underline-offset-4"
        >
          {t("closing.more")}
        </Link>
      </section>

      <footer className="mt-(--spacing-section) flex flex-wrap items-baseline justify-between gap-4 border-t border-rule pt-6">
        <Link
          href="/archive"
          className="t-meta text-accent underline underline-offset-4"
        >
          {t("cta")}
        </Link>
        <span className="t-meta text-content-muted">{footer("typefaces")}</span>
      </footer>
    </main>
  );
}
