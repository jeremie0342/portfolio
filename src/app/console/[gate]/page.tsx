import Link from "next/link";
import { notFound } from "next/navigation";
import { hasSession, isGate } from "@/lib/auth";
import { signOut } from "@/app/actions/console";
import { db } from "@/lib/db";
import { SignIn } from "@/components/console/sign-in";

/**
 * The inbox.
 *
 * A wrong path is a 404 rather than a login form: a scanner that finds a login
 * form knows there is something behind it, and one that finds a 404 learns
 * nothing. The path is not a security boundary, but there is no reason to hand
 * it away either.
 */

const shelves = [
  { status: "NEW", label: "Nouveaux" },
  { status: "READ", label: "Lus" },
  { status: "REPLIED", label: "Répondus" },
  { status: "ARCHIVED", label: "Archivés" },
  { status: "SPAM", label: "Indésirables" },
] as const;

export default async function Console({
  params,
  searchParams,
}: PageProps<"/console/[gate]">) {
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

  const filters = await searchParams;
  const shelf = typeof filters.shelf === "string" ? filters.shelf : "NEW";

  const [messages, counts] = await Promise.all([
    db.message.findMany({
      where: shelves.some((s) => s.status === shelf)
        ? { status: shelf as (typeof shelves)[number]["status"] }
        : {},
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.message.groupBy({ by: ["status"], _count: true }),
  ]);

  const total = (status: string) =>
    counts.find((row) => row.status === status)?._count ?? 0;

  return (
    <main className="px-(--spacing-gutter) py-(--spacing-gutter)">
      <header className="border-rule flex flex-wrap items-baseline justify-between gap-4 border-b pb-4">
        <span className="t-meta">Console</span>

        <form action={signOut}>
          <input type="hidden" name="gate" value={gate} />
          <button
            type="submit"
            className="t-meta text-content-muted hover:text-accent transition-colors"
          >
            Sortir
          </button>
        </form>
      </header>

      <nav className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
        {shelves.map((entry) => (
          <Link
            key={entry.status}
            href={`/console/${gate}?shelf=${entry.status}`}
            className={`t-meta transition-colors ${
              entry.status === shelf
                ? "text-accent"
                : "text-content-muted hover:text-content"
            }`}
          >
            {entry.label}{" "}
            <span className="text-content-muted">{total(entry.status)}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-10">
        {messages.length === 0 ? (
          <p className="t-register text-content-muted border-rule border-t py-8">
            Rien ici.
          </p>
        ) : null}

        {messages.map((message) => (
          <Link
            key={message.id}
            href={`/console/${gate}/${message.id}`}
            className="border-rule group grid gap-x-8 gap-y-2 border-t py-6 md:grid-cols-[14rem_1fr_auto]"
          >
            <span className="t-meta text-accent">
              {message.name}
              <span className="text-content-muted block">{message.email}</span>
            </span>

            <span className="t-register text-content-muted group-hover:text-content transition-colors">
              {message.subject ? `${message.subject} — ` : ""}
              {message.body.slice(0, 110)}
              {message.body.length > 110 ? "…" : ""}
            </span>

            <span className="t-meta text-content-muted">
              {message.createdAt.toISOString().slice(0, 10)}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
