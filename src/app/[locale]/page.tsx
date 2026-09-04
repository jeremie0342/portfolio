import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { listSelected } from "@/lib/entries";
import { contributions } from "@/lib/evidence";
import { SiteHeader } from "@/components/site-header";
import { EntryRow } from "@/components/entry-row";

/**
 * The front page.
 *
 * This is a portfolio before it is an archive. Someone arriving here has not
 * asked for a catalogue: they want to know who this is, what he does and
 * whether it is any good, in that order and quickly. The archive is one
 * section deeper, and this page is the argument for going there.
 */
export const revalidate = 3600;

const dimensions = ["BUILD", "LEAD", "CREATE"] as const;

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations("home");
  const site = await getTranslations("site");
  const footer = await getTranslations("footer");
  const selected = await listSelected(locale);

  const figures = [
    [contributions.commits, t("evidence.commits")],
    [contributions.pullRequests, t("evidence.pullRequests")],
    [contributions.repositories, t("evidence.repositories")],
  ] as const;

  return (
    <main className="px-(--spacing-gutter) py-(--spacing-gutter)">
      <SiteHeader locale={locale} />

      <section className="py-(--spacing-section)">
        <p className="t-meta text-accent">{site("person")}</p>

        <h1 className="t-display text-display-xl measure-lead mt-8 text-balance">
          {t("statement")}
        </h1>

        <div className="measure mt-12">
          {t("intro")
            .split("\n\n")
            .map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-body-l mt-5">
                {paragraph}
              </p>
            ))}
        </div>
      </section>

      {/* The three dimensions, stated once and plainly. A visitor who reads
          only this block should already know what kind of person they are
          dealing with. */}
      <section>
        <p className="t-meta text-accent">{t("dimensions.label")}</p>

        <div className="mt-10 grid gap-x-12 gap-y-12 md:grid-cols-3">
          {dimensions.map((dimension) => (
            <div key={dimension}>
              <h2 className="t-display text-display-m">
                {t(`dimensions.${dimension}.title`)}
              </h2>
              <p className="text-content-muted mt-4">
                {t(`dimensions.${dimension}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Figures rather than adjectives. They are measured, dated, and they
          say more about how someone works than a paragraph claiming to. */}
      <section className="mt-(--spacing-section)">
        <p className="t-meta text-accent">
          {t("evidence.label")} <span className="text-content-muted">{contributions.year}</span>
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-16 gap-y-8">
          {figures.map(([value, label]) => (
            <div key={label}>
              <dt className="t-display text-display-l">{value}</dt>
              <dd className="t-meta text-content-muted mt-2">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-(--spacing-section)">
        <p className="t-meta text-accent">{t("selected.label")}</p>

        <div className="mt-8">
          {selected.map((entry) => (
            <EntryRow key={entry.slug} entry={entry} />
          ))}
        </div>

        <Link
          href="/archive"
          className="t-meta text-accent mt-10 inline-block underline underline-offset-4"
        >
          {t("selected.all")}
        </Link>
      </section>

      <footer className="mt-(--spacing-section) flex flex-wrap justify-between gap-4 border-t border-rule pt-6">
        <span className="t-meta text-content-muted">{site("person")}</span>
        <span className="t-meta text-accent">{footer("typefaces")}</span>
      </footer>
    </main>
  );
}
