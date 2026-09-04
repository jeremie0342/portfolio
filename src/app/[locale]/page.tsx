import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { listSelected } from "@/lib/entries";
import { readActivity, readYearTotals } from "@/lib/github";
import { SiteHeader } from "@/components/site-header";
import { EntryRow } from "@/components/entry-row";
import { JsonLd } from "@/components/json-ld";
import {
  graph,
  personSchema,
  profilePageSchema,
  websiteSchema,
} from "@/lib/schema";
import { Stamp } from "@/components/stamp";
import { Marker } from "@/components/marker";
import { WordCycle } from "@/components/word-cycle";
import { FigureReels } from "@/components/figure-reels";

/**
 * The front page.
 *
 * This is a portfolio before it is an archive. Someone arriving has not asked
 * for a catalogue: they want to know who this is, what he does and whether it
 * is any good, in that order and quickly. The archive is one section deeper,
 * and this page is the argument for going there.
 */
export const revalidate = 3600;

/* Six steps forming a closed loop: the last measures against the objective set
   by the first. The order is the argument, so they are numbered and read in
   sequence rather than laid out as a grid of equals. */
const method = ["one", "two", "three", "four", "five", "six"] as const;

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations("home");
  const site = await getTranslations("site");
  const footer = await getTranslations("footer");
  const format = await getFormatter();

  const selected = await listSelected(locale);
  const [activity, totals] = await Promise.all([
    readActivity(),
    readYearTotals(),
  ]);

  const figures = [
    [totals.commits, t("evidence.commits")],
    [totals.pullRequests, t("evidence.pullRequests")],
    [totals.repositories, t("evidence.repositories")],
  ] as const;

  return (
    <main className="px-(--spacing-gutter) py-(--spacing-gutter)">
      {/* The front page carries the person and the site itself. Every other
          page references these two nodes by id rather than restating them. */}
      <JsonLd
        data={graph([
          personSchema(locale),
          websiteSchema(locale),
          profilePageSchema(locale, t("metaTitle")),
        ])}
      />

      <SiteHeader locale={locale} />

      <section className="pt-(--spacing-hero) pb-(--spacing-section)">
        <p className="t-byline text-accent">{site("person")}</p>

        {/* The keywords are marked in the message rather than in the markup, so
            each language decides which of its own words carry the sentence.
            "Construis" and "build" do not sit in the same place in a line. */}
        <h1 className="t-display text-display-xl measure-lead mt-8 text-balance">
          {t.rich("statement", {
            mark: (chunks) => <Marker>{chunks}</Marker>,
            cycle: () => (
              <WordCycle
                words={[t("cycle.one"), t("cycle.two"), t("cycle.three")]}
              />
            ),
          })}
        </h1>

        {/* The marks sit in the margin beside the text, where a stamp lands on
            a document, rather than underneath it where a button would. Below
            the large breakpoint they fall back under the paragraph, since a
            stamp squeezed into a phone column stops reading as a stamp. */}
        <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-14">
          {/* min-w-0 so the column gives way instead of overflowing. Between
              the breakpoint and a comfortable laptop the two columns want more
              room than there is, and a flex item defaults to refusing to
              shrink below its content. */}
          <div className="measure-wide min-w-0">
            {t("intro")
              .split("\n\n")
              .map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-body-l mt-5">
                  {paragraph}
                </p>
              ))}
          </div>

          {/* The two lean opposite ways by different amounts, so they read as
              two impressions made by hand at different moments rather than as
              a pair of buttons that happen to be rotated. */}
          <div className="flex shrink-0 flex-wrap items-center gap-x-8 gap-y-8">
            <Stamp
              href="/contact"
              label={t("stamps.contact.label")}
              note={t("stamps.contact.note")}
              angle="-2.5deg"
              solid
            />
            <Stamp
              href="/about"
              label={t("stamps.about.label")}
              note={t("stamps.about.note")}
              angle="1.75deg"
            />
          </div>
        </div>
      </section>

      {/*
       * Decisions rather than skills.
       *
       * This block used to name three dimensions and assert what each one
       * meant, which made it the only part of the page that claimed instead
       * of showing. Everything around it is evidence, and the contrast was
       * audible.
       *
       * Each decision now carries the constraint that forced it, so the
       * dimension survives as a label on a proof rather than as a heading
       * over an adjective.
       */}
      <section>
        <p className="t-meta text-accent">{t("decisions.label")}</p>

        <p className="measure t-register text-content-muted mt-6">
          {t("decisions.intro")}
        </p>

        <div className="mt-12">
          {method.map((key, position) => (
            <article
              key={key}
              className="grid gap-x-10 gap-y-3 border-t border-rule py-8 md:grid-cols-[10rem_1fr]"
            >
              <p className="t-meta text-accent">
                {String(position + 1).padStart(2, "0")}
              </p>

              <div>
                <h2 className="t-display text-display-m measure-lead text-balance">
                  {t(`decisions.${key}.title`)}
                </h2>
                <p className="measure text-content-muted mt-4">
                  {t(`decisions.${key}.body`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Figures rather than adjectives. The yearly totals are measured and
          dated; the list underneath is read from GitHub on every revalidation,
          so the page keeps proving the work is ongoing without anyone
          maintaining a copy of that claim. */}
      <section className="mt-(--spacing-section)">
        <p className="t-meta text-accent">
          {t("evidence.label")}{" "}
          <span className="text-content-muted">{totals.year}</span>
        </p>

        {/* The three numbers are rendered together because their reels share
            one schedule: no digit can know when to stop without knowing about
            the others. */}
        <FigureReels figures={figures} />

        {activity ? (
          <div className="mt-16">
            <p className="t-meta text-accent">{t("activity.label")}</p>

            <p className="measure t-register text-content-muted mt-4">
              {t("activity.summary", {
                pushes: activity.pushes,
                merged: activity.merged,
                repositories: activity.repositories,
                since: format.dateTime(new Date(activity.since), {
                  day: "numeric",
                  month: "long",
                }),
              })}
            </p>

            <ul className="mt-8">
              {activity.recent.map((touch) => (
                <li
                  key={`${touch.repository}#${touch.branch}`}
                  className="grid gap-x-8 gap-y-2 border-t border-rule py-5 md:grid-cols-[18rem_1fr_auto]"
                >
                  <a
                    href={touch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="t-meta hover:text-accent transition-colors"
                  >
                    {touch.repository}
                  </a>

                  {/* The branch name is what the feed still carries, and it
                      happens to say more than a commit subject would: it names
                      the piece of work rather than one step inside it. */}
                  <span className="t-register text-content-muted">
                    {touch.branch}
                  </span>

                  <span className="t-meta text-content-muted">
                    {format.dateTime(new Date(touch.at), {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
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

      <section className="mt-(--spacing-section) grid gap-x-16 gap-y-16 md:grid-cols-2">
        <div>
          <p className="t-meta text-accent">{t("about.label")}</p>

          <div className="measure mt-6">
            {t("about.body")
              .split("\n\n")
              .map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-4">
                  {paragraph}
                </p>
              ))}
          </div>

          <Link
            href="/about"
            className="t-meta text-accent mt-8 inline-block underline underline-offset-4"
          >
            {t("about.more")}
          </Link>
        </div>

        <div>
          <p className="t-meta text-accent">{t("contact.label")}</p>

          <p className="measure mt-6">{t("contact.body")}</p>

          <Link
            href="/contact"
            className="t-meta text-accent mt-8 inline-block underline underline-offset-4"
          >
            {t("contact.more")}
          </Link>
        </div>
      </section>

      <footer className="mt-(--spacing-section) flex flex-wrap justify-between gap-4 border-t border-rule pt-6">
        <span className="t-meta text-content-muted">{site("person")}</span>
        <span className="t-meta text-accent">{footer("typefaces")}</span>
      </footer>
    </main>
  );
}
