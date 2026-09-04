import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitch } from "./locale-switch";

/**
 * The masthead.
 *
 * A single hairline under it, and none between the sections below. Rules are
 * the cheapest way to make a page look organised and the fastest way to make
 * it look like a form; the section rhythm does that work instead.
 */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations("nav");
  const site = await getTranslations("site");

  const other = routing.locales.find((candidate) => candidate !== locale)!;

  return (
    <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-rule pb-4">
      <Link href="/" className="t-meta hover:text-accent transition-colors">
        {site("name")}
      </Link>

      <nav className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <Link
          href="/archive"
          className="t-meta hover:text-accent transition-colors"
        >
          {t("archive")}
        </Link>
        <Link
          href="/about"
          className="t-meta hover:text-accent transition-colors"
        >
          {t("about")}
        </Link>
        <Link
          href="/contact"
          className="t-meta hover:text-accent transition-colors"
        >
          {t("contact")}
        </Link>
        <LocaleSwitch target={other} label={t("localeToggle")} />
        <ThemeToggle label={t("themeToggle")} />
      </nav>
    </header>
  );
}
