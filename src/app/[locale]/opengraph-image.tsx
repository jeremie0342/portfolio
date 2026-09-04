import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { shareImage, size, contentType } from "@/lib/share-image";

/* Declared for the segment and inherited by everything under it, so the
   archive index, the career page and the contact page are covered without a
   file each. Entry pages override it with their own. */
export { size, contentType };
export const alt = "Zardonis Jérémie ZITTI";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return shareImage({
    eyebrow: locale === "fr" ? "Ingénieur produit" : "Product engineer",
    mark: "Archive",
    title: "Zardonis Jérémie ZITTI",
    footnote: t("tagline"),
    stamp: String(new Date().getUTCFullYear()),
  });
}
