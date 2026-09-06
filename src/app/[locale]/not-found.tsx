import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { displayWorn } from "@/lib/fonts";
import { routing, type Locale } from "@/i18n/routing";

/**
 * The page for an address that holds nothing.
 *
 * An archive is the one kind of site where a missing item is worth saying
 * plainly: catalogues have gaps, numbers are withdrawn, and a reader who
 * followed an old link deserves the accession number treatment rather than a
 * default browser page in the wrong language.
 *
 * Set in the worn face, which the archive uses for what has aged. It is the
 * only place on the site where wear is not a property of an entry but of the
 * address itself.
 */
export default async function NotFound() {
  /* getLocale returns the string next-intl resolved for this request; the
     header wants the union the routing declares, and the fallback covers the
     case where a request reached here without one. */
  const resolved = await getLocale();
  const locale: Locale = routing.locales.includes(resolved as Locale)
    ? (resolved as Locale)
    : routing.defaultLocale;
  const t = await getTranslations("notFound");
  const site = await getTranslations("site");
  const footer = await getTranslations("footer");

  return (
    <main className="px-(--spacing-gutter) py-(--spacing-gutter)">
      {/* The locale comes from the request rather than from a parameter: a
          not-found page has no route to take one from. */}
      <SiteHeader locale={locale} />

      <section className={`${displayWorn.variable} py-(--spacing-section)`}>
        <p className="t-meta text-accent">{t("number")}</p>

        <h1 className="t-display-worn text-display-xl measure-lead mt-8 text-balance">
          {t("title")}
        </h1>

        <p className="measure t-register text-content-muted mt-10">
          {t("body")}
        </p>

        <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
          <Link
            href="/archive"
            className="t-meta text-accent underline underline-offset-4"
          >
            {t("archive")}
          </Link>

          <Link
            href="/"
            className="t-meta text-content-muted hover:text-accent underline underline-offset-4 transition-colors"
          >
            {t("home")}
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
