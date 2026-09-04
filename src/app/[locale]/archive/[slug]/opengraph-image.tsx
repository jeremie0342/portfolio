import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getEntry, listSlugs } from "@/lib/entries";
import { shareImage, trim, size, contentType } from "@/lib/share-image";

export { size, contentType };
export const alt = "Zardonis Jérémie ZITTI";

export async function generateStaticParams() {
  const slugs = await listSlugs();

  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    throw new Error(`Unknown locale ${locale}`);
  }

  const entry = await getEntry(locale, slug);

  if (!entry) {
    throw new Error(`Unknown entry ${slug}`);
  }

  /* The card carries the entry's own accent, so a shared link already looks
     like the page behind it. Violet is a ground rather than ink, so it hands
     over to gold here. */
  const year = entry.startedOn?.getUTCFullYear();

  return shareImage({
    eyebrow: `${String(entry.number).padStart(3, "0")} ${entry.stack.slice(0, 3).join(" / ")}`,
    mark: "Zardonis",
    title: entry.title,
    footnote: entry.summary ? trim(entry.summary, 52) : "",
    stamp: year ? String(year) : "",
    accent: entry.accent === "CRIMSON" ? "crimson" : "gold",
  });
}
