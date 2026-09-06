import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { wearVariables } from "@/lib/wear-fonts";
import { languageAlternates, siteName, siteUrl } from "@/lib/site";
import "../globals.css";

/**
 * Deliberately empty.
 *
 * Every page on this site is drawn from the database, so prerendering them at
 * build time means the build needs a database that is migrated and filled.
 * That is a real dependency to carry: it has to exist before the image that
 * creates it has been built, which is a circle, and it turns any deployment
 * into an ordering problem.
 *
 * Nothing is prerendered instead. A page is rendered on its first request and
 * kept for an hour, exactly as it was before; the only cost is that the first
 * visitor after a deployment waits for a render that used to happen during the
 * build. On a site of this size that is a fraction of a second, paid once per
 * page per hour, in exchange for a build that cannot fail because a database
 * was not ready.
 */
export function generateStaticParams() {
  return [];
}

export async function generateMetadata(
  props: LayoutProps<"/[locale]">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "home" });

  const person = "Zardonis Jérémie ZITTI";

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("metaTitle"), template: `%s, ${siteName}` },
    description: t("metaDescription"),
    applicationName: siteName,
    authors: [{ name: person, url: siteUrl }],
    creator: person,
    publisher: person,
    /*
     * Alternates are declared at the root so every page inherits the full set
     * of languages without having to restate it.
     */
    alternates: {
      canonical: `/${locale}`,
      languages: languageAlternates(""),
    },
    openGraph: {
      type: "profile",
      siteName,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_FR",
      url: `${siteUrl}/${locale}`,
      title: t("metaTitle"),
      description: t("metaDescription"),
      firstName: "Jérémie",
      lastName: "ZITTI",
      username: "jeremie0342",
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
      creator: "@jeremy0342",
    },
    /* Spelled out rather than left to the default. The default is already
       index and follow, but the large preview and the unlimited snippet are
       not, and a page whose value is its text should let a search engine quote
       as much of it as it wants. */
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    /* Search Console offers two ways to prove the site is yours. A record in
       the zone covers every subdomain and survives a redeployment; this tag
       covers one origin and disappears the day the variable is forgotten. The
       record is the better answer, so this exists for the case where the zone
       is not reachable, and stays out of the markup entirely when unset. */
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}

/* One colour, because the site has one default. It cannot follow the toggle:
   a theme colour is declared in the document head and the choice lives in an
   attribute, so announcing two would leave a dark reader with a light browser
   chrome half the time. */
export const viewport: Viewport = {
  themeColor: "#F3EFE6",
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  /*
   * Without this call, any page reading translations opts into dynamic
   * rendering and loses static generation.
   */
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${fontVariables} ${wearVariables} h-full`}
      suppressHydrationWarning
    >
      {/* Browser extensions routinely add attributes to the body before React
          loads, which React then reports as a hydration mismatch it cannot
          patch. The warning is about the extension rather than this markup. */}
      <body className="min-h-full" suppressHydrationWarning>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
