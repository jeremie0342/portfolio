import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { listEntries } from "@/lib/entries";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArchiveEntryBlock } from "@/components/archive-entry";

/**
 * The archive index.
 *
 * Prerendered and revalidated hourly rather than rendered per request. The
 * content changes when an entry is edited, not when a visitor arrives, and a
 * static document is what gives the crawler and the first paint their best
 * case. The cost is that the database has to be reachable at build time.
 */
export const revalidate = 3600;

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations("home");
  const masthead = await getTranslations("masthead");
  const footer = await getTranslations("footer");
  const entries = await listEntries(locale);

  return (
    <main className="px-(--spacing-gutter) py-(--spacing-gutter)">
      <header className="flex items-baseline justify-between gap-4 border-b border-rule pb-4">
        <span className="t-meta">{masthead("name")}</span>
        <div className="flex items-baseline gap-6">
          <span className="t-meta text-accent">
            {new Date().getUTCFullYear()} / {String(entries.length).padStart(3, "0")}
          </span>
          <ThemeToggle label={masthead("themeToggle")} />
        </div>
      </header>

      <section className="py-(--spacing-section)">
        <h1 className="t-display text-display-xl measure-lead text-balance">
          {t("title")}
        </h1>
      </section>

      <div className="flex flex-col gap-(--spacing-section)">
        {entries.map((entry) => (
          <ArchiveEntryBlock key={entry.slug} entry={entry} />
        ))}
      </div>

      <footer className="mt-(--spacing-section) flex flex-wrap justify-between gap-4 border-t border-rule pt-6">
        <span className="t-meta text-content-muted">{footer("name")}</span>
        <span className="t-meta text-accent">{footer("typefaces")}</span>
      </footer>
    </main>
  );
}
