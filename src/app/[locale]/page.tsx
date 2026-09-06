import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import portrait from "@/images/portrait.jpg";
import { contact } from "@/lib/contact";
import { routing } from "@/i18n/routing";
import { listProfiles,
  listSelected, listPositions, listCredentials } from "@/lib/entries";
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
  const cv = await getTranslations("cv");
  const format = await getFormatter();

  const selected = await listSelected(locale);
  const [activity, totals, positions, credentials, profiles] = await Promise.all([
    readActivity(),
    readYearTotals(),
    listPositions(locale),
    listCredentials(locale),
    listProfiles(),
  ]);

  const github = profiles.find((profile) => profile.label === "GitHub");

  /* A role that ends should leave this page on the same edit that closes its
     entry, so the facts column reads the archive rather than repeating it. */
  const current = positions.filter((position) => !position.endedOn);
  const latestDegree = credentials[0];

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
          await personSchema(locale),
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

      {/* The work first, and the method after it.
       *
       * A reader arrives asking whether the person has built anything, not how
       * they go about it. Answering the second question first asks them to
       * take the first on trust, which is an order only a name they already
       * know can afford. */}
      <section>
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
      <section className="mt-(--spacing-section)">
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

      {/* Figures rather than adjectives, read from GitHub on every
          revalidation, so the page keeps proving the work is ongoing without
          anyone maintaining a copy of that claim.

          The branch names that used to be listed here are gone. They read as a
          developer's own dashboard: a reader deciding whether to write has no
          use for the name of a fix, and the line above already says the work
          is current. */}
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
          </div>
        ) : null}
      </section>

      {/* A section of its own rather than half a row. A reader who has come
          this far is deciding whether to write, and three lines are not what
          decides it. */}
      <section className="mt-(--spacing-section)">
        <p className="t-meta text-accent">{t("who.label")}</p>

        <p className="t-display text-display-m measure-lead mt-8 text-balance">
          {t("who.lead")}
        </p>

        <div className="mt-14 grid gap-x-16 gap-y-12 lg:grid-cols-[1fr_auto]">
          <div className="measure">
            {t("who.body")
              .split("\n\n")
              .map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-body-l mt-6">
                  {paragraph}
                </p>
              ))}

            <Link
              href="/about"
              className="t-meta text-accent mt-10 inline-block underline underline-offset-4"
            >
              {t("who.more")}
            </Link>
          </div>

          <div className="shrink-0 lg:w-72">
            {/* Placed with the facts rather than beside the headline. A face
                at the top of a page is an argument from presence; here it is
                one record among the others. */}
            <Image
              src={portrait}
              alt={t("who.portrait")}
              sizes="(min-width: 1024px) 18rem, 100vw"
              placeholder="blur"
              className="portrait mb-10 aspect-4/5 w-full object-cover object-top"
            />

            {/* Read from the archive rather than restated, so these cannot
                disagree with the career page. */}
            <dl>
              {current.length > 0 ? (
                <div className="border-t border-rule py-5">
                  <dt className="t-meta text-accent">{t("who.facts.now")}</dt>
                  {current.map((position) => (
                    <dd key={position.slug} className="t-register mt-2">
                      {position.title}
                      <span className="text-content-muted">
                        {" / "}
                        {position.organization}
                      </span>
                    </dd>
                  ))}
                </div>
              ) : null}

              <div className="border-t border-rule py-5">
                <dt className="t-meta text-accent">
                  {t("who.facts.building")}
                </dt>
                <dd className="t-register mt-2">Skilluv</dd>
              </div>

              <div className="border-t border-rule py-5">
                <dt className="t-meta text-accent">
                  {t("who.facts.availability")}
                </dt>
                <dd className="t-register mt-2">
                  {t("who.facts.availabilityValue")}
                </dd>
              </div>

              <div className="border-t border-rule py-5">
                <dt className="t-meta text-accent">
                  {t("who.facts.languages")}
                </dt>
                <dd className="t-register mt-2">
                  {t("who.facts.languagesValue")}
                </dd>
              </div>

              {latestDegree ? (
                <div className="border-t border-rule py-5">
                  <dt className="t-meta text-accent">
                    {t("who.facts.education")}
                  </dt>
                  <dd className="t-register mt-2">
                    {latestDegree.title}
                    <span className="text-content-muted">
                      {" / "}
                      {latestDegree.endedOn?.getUTCFullYear()}
                    </span>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </section>

      {/* The closing section, and the one the whole page has been arguing
          towards. It says what the work is worth being asked for before it
          says how to ask, since an address on its own answers a question the
          reader has not decided to have yet. */}
      <section className="mt-(--spacing-section)">
        <p className="t-meta text-accent">{t("reach.label")}</p>

        <p className="t-display text-display-m measure-lead mt-8 text-balance">
          {t("reach.lead")}
        </p>

        <div className="mt-14 grid gap-x-16 gap-y-12 lg:grid-cols-[1fr_auto]">
          <div className="measure">
            {t("reach.body")
              .split("\n\n")
              .map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-body-l mt-6">
                  {paragraph}
                </p>
              ))}

            <Link
              href="/contact"
              className="t-meta text-accent mt-10 inline-block underline underline-offset-4"
            >
              {t("reach.more")}
            </Link>
          </div>

          {/* Two lines rather than the whole page's worth. Someone who wants
              the rest follows the link. */}
          <dl className="shrink-0 lg:w-72">
            <div className="border-t border-rule py-5">
              <dt className="t-meta text-accent">{t("reach.email")}</dt>
              <dd className="t-register mt-2">
                <a
                  href={`mailto:${contact.email}`}
                  className="decoration-accent underline-offset-4 hover:text-accent underline transition-colors"
                >
                  {contact.email}
                </a>
              </dd>
            </div>

            {/* The account, from the front page. A reader who wants to see the
                code before writing should not have to find the contact page
                first, and most of the work in this archive is public. */}
            {github ? (
              <div className="border-t border-rule py-5">
                <dt className="t-meta text-accent">{t("reach.code")}</dt>
                <dd className="t-register mt-2">
                  <a
                    href={github.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="decoration-accent underline-offset-4 hover:text-accent underline transition-colors"
                  >
                    {github.handle ?? github.url}
                  </a>
                </dd>
              </div>
            ) : null}

            {/* A file, because the first thing a recruiter does with a
                candidate is forward them to somebody else. */}
            <div className="border-t border-rule py-5">
              <dt className="t-meta text-accent">{t("reach.document")}</dt>
              <dd className="t-register mt-2">
                <a
                  href={`/${locale}/cv.pdf`}
                  className="decoration-accent underline-offset-4 hover:text-accent underline transition-colors"
                >
                  {cv("download")}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="mt-(--spacing-section) flex flex-wrap justify-between gap-4 border-t border-rule pt-6">
        <span className="t-meta text-content-muted">{site("person")}</span>
        <span className="t-meta text-accent">{footer("typefaces")}</span>
      </footer>
    </main>
  );
}
