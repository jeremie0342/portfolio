import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { contact, organisations } from "@/lib/contact";
import { listProfiles } from "@/lib/entries";
import { SiteHeader } from "@/components/site-header";
import { ContactForm } from "@/components/contact-form";
import { JsonLd } from "@/components/json-ld";
import { languageAlternates } from "@/lib/site";
import { breadcrumbSchema, graph, personSchema } from "@/lib/schema";

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
      languages: languageAlternates("/contact"),
    },
  };
}

/**
 * Contact.
 *
 * A form and the addresses, in that order, and the order is the point. A form
 * asks a stranger to trust an unfamiliar endpoint and leaves them nothing to
 * keep, so the addresses stay listed underneath for anyone who would rather
 * have a copy of what they sent in their own client. Neither is a fallback for
 * the other; they suit different people.
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
  const profiles = await listProfiles();

  const direct = [
    {
      label: t("email"),
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
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
      <JsonLd
        data={graph([
          await personSchema(locale),
          breadcrumbSchema(locale, [
            { name: site("name"), path: "" },
            { name: t("title"), path: "/contact" },
          ]),
        ])}
      />

      <SiteHeader locale={locale} />

      <section className="pt-(--spacing-section) pb-16">
        <p className="t-meta text-accent">{site("person")}</p>

        <h1 className="t-display text-display-xl mt-8">{t("title")}</h1>

        <p className="measure-lead text-body-l mt-10">{t("intro")}</p>
      </section>

      {/* The form comes before the addresses. Someone who arrived meaning to
          write should not have to scroll past four ways of doing it somewhere
          else first. */}
      <section>
        <p className="t-meta text-accent">{t("formLabel")}</p>

        <p className="measure-lead text-body-l mt-6">{t("formLead")}</p>

        <ContactForm
          locale={locale}
          labels={{
            name: t("form.name"),
            email: t("form.email"),
            subject: t("form.subject"),
            optional: t("form.optional"),
            body: t("form.body"),
            send: t("form.send"),
            sending: t("form.sending"),
            sent: t("form.sent"),
            invalid: t("form.invalid"),
            failed: t("form.failed"),
            privacy: t("form.privacy"),
          }}
        />
      </section>

      <section className="mt-(--spacing-section)">
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
                  target="_blank"
                  rel="me noopener noreferrer"
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
                    target="_blank"
                    rel="noopener noreferrer"
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
