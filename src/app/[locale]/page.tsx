import { getTranslations, setRequestLocale } from "next-intl/server";
import { displayWorn } from "@/lib/fonts";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Proof sheet.
 *
 * This page exists to judge the art direction on a real screen rather than
 * to stand in for the eventual home page: Redaction in ivory on the deep
 * black, gold reserved for the meta line, crimson confined to display sizes
 * and violet used as ground. The copy will be replaced by archive entries
 * once the database is wired.
 */
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const masthead = await getTranslations("masthead");
  const footer = await getTranslations("footer");

  const facts = [
    [t("entry.roleLabel"), t("entry.roleValue")],
    [t("entry.periodLabel"), t("entry.periodValue")],
    [t("entry.statusLabel"), t("entry.statusValue")],
  ];

  return (
    <main className="px-(--spacing-gutter) py-(--spacing-gutter)">
      <header className="flex items-baseline justify-between gap-4 border-b border-rule pb-4">
        <span className="t-meta">{masthead("name")}</span>
        <div className="flex items-baseline gap-6">
          <span className="t-meta text-accent">{masthead("reference")}</span>
          <ThemeToggle label={masthead("themeToggle")} />
        </div>
      </header>

      <section className="py-(--spacing-section)">
        <h1 className="t-display text-display-xl measure-lead text-balance">
          {t("title")}
        </h1>
      </section>

      <section>
        <p className="t-meta text-accent">
          {t("entry.reference")}{" "}
          <span className="text-content-muted">{t("entry.kind")}</span>
        </p>

        <h2 className="t-display text-display-l text-energy mt-6">
          {t("entry.name")}
        </h2>

        <p className="t-label text-content-muted mt-5">
          {t("entry.disciplines")}
        </p>

        <p className="measure text-body-l mt-8">{t("entry.body")}</p>

        <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-5">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="t-meta text-accent">{label}</dt>
              <dd className="t-meta text-content-muted mt-1">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/*
       * Violet cannot be ink, so it becomes the ground for this entry. The
       * negative margin lets the field run to the window edges while the
       * copy stays inside the gutter.
       */}
      <section className="mt-(--spacing-section) -mx-(--spacing-gutter) bg-surface-imagined px-(--spacing-gutter) py-(--spacing-section)">
        <p className="t-meta text-accent">
          {t("world.reference")}{" "}
          <span className="text-ivory/70">{t("world.date")}</span>
        </p>

        <h2 className="t-display text-display-l text-ivory mt-6 measure-lead text-balance">
          {t("world.title")}
        </h2>

        <p className="measure text-body-l text-ivory/85 mt-8">
          {t("world.body")}
        </p>
      </section>

      {/*
       * Redaction 50 is requested by this section alone. Its font variable is
       * carried here rather than by the root layout, which keeps it off the
       * routes that never render it.
       */}
      <section className={`${displayWorn.variable} mt-(--spacing-section)`}>
        <p className="t-meta text-accent">{t("fragment.reference")}</p>
        <p className="t-display-worn text-display-m mt-6 measure-lead">
          {t("fragment.body")}
        </p>
      </section>

      <footer className="mt-(--spacing-section) flex flex-wrap justify-between gap-4 border-t border-rule pt-6">
        <span className="t-meta text-content-muted">{footer("left")}</span>
        <span className="t-meta text-accent">{footer("right")}</span>
      </footer>
    </main>
  );
}
