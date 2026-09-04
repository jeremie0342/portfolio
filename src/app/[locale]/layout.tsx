import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { siteName, siteUrl } from "@/lib/site";
import { ThemeScript } from "@/components/theme-script";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  props: LayoutProps<"/[locale]">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("metaTitle"), template: `%s, ${siteName}` },
    description: t("metaDescription"),
    /*
     * Alternates are declared at the root so every page inherits the full
     * set of languages without having to restate it.
     */
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      siteName,
      locale,
      url: `${siteUrl}/${locale}`,
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0A0C" },
    { media: "(prefers-color-scheme: light)", color: "#F3EFE6" },
  ],
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
      className={`${fontVariables} h-full`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
