import Link from "next/link";
import { requireConsole } from "@/lib/console";
import { db } from "@/lib/db";
import { Shell, Head } from "@/components/console/shell";

const shelves = [
  { status: "NEW", label: "Nouveaux" },
  { status: "READ", label: "Lus" },
  { status: "REPLIED", label: "Répondus" },
  { status: "ARCHIVED", label: "Archivés" },
  { status: "SPAM", label: "Indésirables" },
] as const;

export default async function Messages({
  params,
  searchParams,
}: PageProps<"/console/[gate]/messages">) {
  const { gate } = await params;
  await requireConsole(gate);

  const filters = await searchParams;
  const shelf = typeof filters.shelf === "string" ? filters.shelf : "NEW";
  const known = shelves.some((entry) => entry.status === shelf);

  const [messages, counts] = await Promise.all([
    db.message.findMany({
      where: known
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
    <Shell gate={gate} current="messages">
      <Head title="Messages" count={messages.length} />

      <nav className="flex flex-wrap gap-x-8 gap-y-3">
        {shelves.map((entry) => (
          <Link
            key={entry.status}
            href={`/console/${gate}/messages?shelf=${entry.status}`}
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
            href={`/console/${gate}/messages/${message.id}`}
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
    </Shell>
  );
}
