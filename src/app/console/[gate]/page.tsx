import Link from "next/link";
import { notFound } from "next/navigation";
import { hasSession, isGate } from "@/lib/auth";
import { db } from "@/lib/db";
import { SignIn } from "@/components/console/sign-in";
import { Shell, Head } from "@/components/console/shell";

/**
 * The door, and the hub behind it.
 *
 * A wrong path is a 404 rather than a login form: a scanner that finds a login
 * form knows there is something behind it, and one that finds a 404 learns
 * nothing.
 *
 * The hub counts rather than lists. Someone opening the console wants to know
 * whether anything needs them, and four numbers answer that faster than four
 * tables would.
 */
export default async function Console({ params }: PageProps<"/console/[gate]">) {
  const { gate } = await params;

  if (!isGate(gate)) {
    notFound();
  }

  if (!(await hasSession())) {
    return (
      <main className="px-(--spacing-gutter) py-(--spacing-gutter)">
        <p className="t-meta text-accent">Console</p>
        <h1 className="t-display text-display-l mt-6">Entrée</h1>
        <SignIn gate={gate} />
      </main>
    );
  }

  const [unread, published, drafts, organizations, profiles] = await Promise.all(
    [
      db.message.count({ where: { status: "NEW" } }),
      db.entry.count({ where: { status: "PUBLISHED" } }),
      db.entry.count({ where: { status: "DRAFT" } }),
      db.organization.count(),
      db.profile.count(),
    ],
  );

  const shelves = [
    { href: "messages", label: "Messages à lire", value: unread },
    { href: "entries", label: "Entrées publiées", value: published },
    { href: "entries", label: "Brouillons", value: drafts },
    { href: "organizations", label: "Organisations", value: organizations },
    { href: "profiles", label: "Profils", value: profiles },
  ];

  return (
    <Shell gate={gate}>
      <Head title="Console" />

      <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {shelves.map((shelf) => (
          <Link key={shelf.label} href={`/console/${gate}/${shelf.href}`}>
            <dt className="t-display text-display-l">{shelf.value}</dt>
            <dd className="t-meta text-content-muted mt-2">{shelf.label}</dd>
          </Link>
        ))}
      </dl>
    </Shell>
  );
}
