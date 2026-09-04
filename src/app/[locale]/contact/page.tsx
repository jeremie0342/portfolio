import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { contact, profiles, organisations } from "@/lib/contact";
import { SiteHeader } from "@/components/site-header";

export const revalidate = 3600;

export async function generateMetadata(
  props: PageProps<"/[locale]/contact">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/contact`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/contact`]),
      ),
    },
  };
}

/**
 * Contact.
 *
 * Deliberately a page of addresses rather than a form. A form asks a stranger
 * to trust an unfamiliar endpoint with their message and gives them nothing to
 * keep; an address goes into their own client, where they have a copy of what
 * they sent and a thread to follow.
 */
export default async function Contact({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations("contact");
  const site = await getTranslations("site");
  const footer = await getTranslations("footer");

  const direct = [
    { label: t("email"), value: contact.email, href: `mailto:${contact.email}` },
    {
      label: t("personalEmail"),
      value: contact.personalEmail,
      href: `mailto:${contact.personalEmail}`,
    },
    {
      label: t("phone"),
      value: contact.phoneDisplay,
      href: `tel:${contact.phone}`,
    },
    {
      label: t("location"),
      value: `${contact.city}, ${contact.country} (${contact.timezone})`,
      href: null,
    },
  ];

  return (
    <main className="px-(--spacing-gutter) py-(--spacing-gutter)">
      <SiteHeader locale={locale} />

      <section className="pt-(--spacing-section) pb-16">
        <p className="t-meta text-accent">{site("person")}</p>

        <h1 className="t-display text-display-xl mt-8">{t("title")}</h1>

        <p className="measure-lead text-body-l mt-10">{t("intro")}</p>
      </section>

      <section>
        <p className="t-meta text-accent">{t("direct")}</p>

        <dl className="mt-8">
          {direct.map((row) => (
            <div
              key={row.label}
              className="grid gap-x-10 gap-y-2 border-t border-rule py-6 md:grid-cols-[10rem_1fr]"
            >
              <dt className="t-meta text-content-muted">{row.label}</dt>
              <dd className="t-register">
                {row.href ? (
                  <a
                    href={row.href}
                    className="underline decoration-accent underline-offset-4 hover:text-accent transition-colors"
                  >
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-(--spacing-section)">
        <p className="t-meta text-accent">{t("elsewhere")}</p>

        <dl className="mt-8">
          {profiles.map((profile) => (
            <div
              key={profile.label}
              className="grid gap-x-10 gap-y-2 border-t border-rule py-6 md:grid-cols-[10rem_1fr]"
            >
              <dt className="t-meta text-content-muted">{profile.label}</dt>
              <dd className="t-register">
                <a
                  href={profile.url}
                  rel="me noreferrer"
                  className="underline decoration-accent underline-offset-4 hover:text-accent transition-colors"
                >
                  {profile.handle}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Listed because a reader who checks only the personal account misses
          most of the work: the Skilluv repositories belong to organisations. */}
      <section className="mt-(--spacing-section)">
        <p className="t-meta text-accent">{t("organisations")}</p>

        <dl className="mt-8">
          {organisations.map((organisation) => (
            <div
              key={organisation.name}
              className="grid gap-x-10 gap-y-2 border-t border-rule py-6 md:grid-cols-[10rem_1fr]"
            >
              <dt className="t-meta text-content-muted">{organisation.role}</dt>
              <dd className="t-register">
                {organisation.url ? (
                  <a
                    href={organisation.url}
                    rel="noreferrer"
                    className="underline decoration-accent underline-offset-4 hover:text-accent transition-colors"
                  >
                    {organisation.name}
                  </a>
                ) : (
                  organisation.name
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="mt-(--spacing-section) flex flex-wrap justify-between gap-4 border-t border-rule pt-6">
        <span className="t-meta text-content-muted">{site("person")}</span>
        <span className="t-meta text-accent">{footer("typefaces")}</span>
      </footer>
    </main>
  );
}
