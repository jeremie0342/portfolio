import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { listArchive } from "@/lib/entries";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/json-ld";
import { languageAlternates } from "@/lib/site";
import { breadcrumbSchema, collectionSchema, graph } from "@/lib/schema";
import { EntryRow } from "@/components/entry-row";

export const revalidate = 3600;

export async function generateMetadata(
  props: PageProps<"/[locale]/archive">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "archive" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/archive`,
      languages: languageAlternates("/archive"),
    },
  };
}

/**
 * The archive index.
 *
 * Only top level entries are listed. A platform and the repositories that
 * compose it are not siblings, and flattening them here would bury the two
 * things worth seeing under twelve things that only make sense in context.
 */
export default async function Archive({
  params,
}: PageProps<"/[locale]/archive">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations("archive");
  const site = await getTranslations("site");
  const footer = await getTranslations("footer");
  const entries = await listArchive(locale);

  return (
    <main className="px-(--spacing-gutter) py-(--spacing-gutter)">
      <JsonLd
        data={graph([
          collectionSchema(
            locale,
            "/archive",
            t("title"),
            t("metaDescription"),
          ),
          breadcrumbSchema(locale, [
            { name: site("name"), path: "" },
            { name: t("title"), path: "/archive" },
          ]),
        ])}
      />

      <SiteHeader locale={locale} />

      <section className="pt-(--spacing-section) pb-16">
        <h1 className="t-display text-display-xl">{t("title")}</h1>
        <p className="measure t-register text-content-muted mt-8">
          {t("intro")}
        </p>
      </section>

      <div>
        {entries.map((entry) => (
          <EntryRow key={entry.slug} entry={entry} />
        ))}
      </div>

      <footer className="mt-(--spacing-section) flex flex-wrap justify-between gap-4 border-t border-rule pt-6">
        <span className="t-meta text-content-muted">{site("person")}</span>
        <span className="t-meta text-accent">{footer("typefaces")}</span>
      </footer>
    </main>
  );
}
