import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getEntry, listSlugs, type ArchiveEntry } from "@/lib/entries";
import { displayWorn } from "@/lib/fonts";
import { SiteHeader } from "@/components/site-header";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listSlugs();

  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata(
  props: PageProps<"/[locale]/archive/[slug]">,
): Promise<Metadata> {
  const { locale, slug } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const entry = await getEntry(locale, slug);

  if (!entry) {
    return {};
  }

  return {
    title: entry.title,
    description: entry.summary ?? undefined,
    alternates: {
      canonical: `/${locale}/archive/${slug}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/archive/${slug}`]),
      ),
    },
  };
}

function years(entry: ArchiveEntry) {
  if (!entry.startedOn) {
    return null;
  }

  const start = String(entry.startedOn.getUTCFullYear());
  const end = entry.endedOn ? String(entry.endedOn.getUTCFullYear()) : null;

  return { start, end };
}

/**
 * One entry, and the pieces it contains.
 *
 * A violet entry turns its opening into a violet field rather than colouring
 * its title: violet measures 1.7:1 against the dark ground and cannot be ink
 * at any size. Crimson reaches the title alone, where the display size keeps
 * it legible. The rule lives here so that adding an entry cannot break it.
 */
export default async function EntryPage({
  params,
}: PageProps<"/[locale]/archive/[slug]">) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const entry = await getEntry(locale, slug);

  if (!entry) {
    notFound();
  }

  const t = await getTranslations("entry");
  const archive = await getTranslations("archive");
  const site = await getTranslations("site");
  const footer = await getTranslations("footer");

  const range = years(entry);
  const period = range
    ? range.end
      ? range.end === range.start
        ? t("period.single", { start: range.start })
        : t("period.range", { start: range.start, end: range.end })
      : t("period.ongoing", { start: range.start })
    : null;

  const imagined = entry.accent === "VIOLET";
  const worn = entry.wear === "WORN";

  const openingShell = imagined
    ? "-mx-(--spacing-gutter) bg-surface-imagined px-(--spacing-gutter) py-(--spacing-section)"
    : "py-(--spacing-section)";

  const titleTone = imagined
    ? "text-ivory"
    : entry.accent === "CRIMSON"
      ? "text-energy"
      : "text-content";

  const prose = imagined ? "text-ivory/85" : "text-content";
  const muted = imagined ? "text-ivory/70" : "text-content-muted";

  return (
    <main className="px-(--spacing-gutter) py-(--spacing-gutter)">
      <SiteHeader locale={locale} />

      <section className={`${worn ? displayWorn.variable : ""} ${openingShell}`}>
        <p className="t-meta text-accent">
          {String(entry.number).padStart(3, "0")}{" "}
          <span className={muted}>
            {entry.dimension
              ? t(`dimension.${entry.dimension}`)
              : t(`kind.${entry.kind}`)}
          </span>
        </p>

        <h1
          className={`${worn ? "t-display-worn" : "t-display"} text-display-xl ${titleTone} measure-lead mt-8 text-balance`}
        >
          {entry.title}
        </h1>

        {entry.summary ? (
          <p className={`measure-lead text-body-l ${prose} mt-10`}>
            {entry.summary}
          </p>
        ) : null}

        {/* Metadata reads as a record rather than a caption: labelled fields,
            in the meta face, the way a catalogue entry is written. */}
        <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
          {period ? (
            <div>
              <dt className="t-meta text-accent">{t(`kind.${entry.kind}`)}</dt>
              <dd className={`t-meta ${muted} mt-2`}>{period}</dd>
            </div>
          ) : null}

          {entry.stack.length > 0 ? (
            <div>
              <dt className="t-meta text-accent">{t("stack")}</dt>
              <dd className={`t-meta ${muted} mt-2`}>
                {entry.stack.join(" / ")}
              </dd>
            </div>
          ) : null}

          {entry.repositoryUrl ? (
            <div>
              <dt className="t-meta text-accent">{t("repository")}</dt>
              <dd className="t-meta mt-2">
                <a
                  href={entry.repositoryUrl}
                  rel="noreferrer"
                  className={`${imagined ? "text-ivory" : "text-content"} underline decoration-accent underline-offset-4`}
                >
                  {entry.repositoryUrl.replace("https://github.com/", "")}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      {entry.body ? (
        <section className="pb-(--spacing-section)">
          {entry.body.split("\n\n").map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="measure text-body-l mt-6">
              {paragraph}
            </p>
          ))}
        </section>
      ) : null}

      {entry.children.length > 0 ? (
        <section>
          <p className="t-meta text-accent">{t("contents")}</p>

          <div className="mt-8">
            {entry.children.map((child) => (
              <article
                key={child.slug}
                className="grid grid-cols-[auto_1fr] gap-x-8 border-t border-rule py-8"
              >
                <span className="t-meta text-accent">
                  {String(child.number).padStart(3, "0")}
                </span>

                <div>
                  <h2 className="t-display text-display-m">{child.title}</h2>

                  {child.summary ? (
                    <p className="measure text-content-muted mt-3">
                      {child.summary}
                    </p>
                  ) : null}

                  <p className="t-meta text-content-muted mt-4">
                    {child.stack.join(" / ")}
                    {child.repositoryUrl ? (
                      <>
                        {" "}
                        <a
                          href={child.repositoryUrl}
                          rel="noreferrer"
                          className="text-accent underline underline-offset-4"
                        >
                          {child.repositoryUrl.replace(
                            "https://github.com/",
                            "",
                          )}
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="mt-(--spacing-section) flex flex-wrap items-baseline justify-between gap-4 border-t border-rule pt-6">
        <Link
          href="/archive"
          className="t-meta text-accent underline underline-offset-4"
        >
          {archive("back")}
        </Link>
        <span className="t-meta text-content-muted">{site("person")}</span>
        <span className="t-meta text-content-muted">{footer("typefaces")}</span>
      </footer>
    </main>
  );
}
