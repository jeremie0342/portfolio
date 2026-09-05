import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { buildCv } from "@/lib/cv";

/**
 * The curriculum vitae as a file, one per language.
 *
 * Rebuilt on the same schedule as the pages rather than on every request: it
 * reads the database and draws four pages of type, which is not work to repeat
 * for a crawler that asks twice.
 */
export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const pdf = await buildCv(locale);

  return new Response(pdf as BodyInit, {
    headers: {
      "content-type": "application/pdf",
      /* Inline, so a click opens the document rather than dropping a file in
         a downloads folder the reader then has to go and find. The filename
         is still the one that gets saved. */
      "content-disposition": `inline; filename="Zardonis-Jeremie-ZITTI-${locale.toUpperCase()}.pdf"`,
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
