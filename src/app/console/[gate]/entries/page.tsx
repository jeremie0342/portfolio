import Link from "next/link";
import { requireConsole } from "@/lib/console";
import { db } from "@/lib/db";
import { Shell, Head } from "@/components/console/shell";

/**
 * The archive, seen from behind.
 *
 * Every kind in one table rather than a page each. They are one model with one
 * numbering, and splitting the view would hide the thing the numbering exists
 * to show: what the archive holds, in order.
 */
const kinds = [
  { value: "", label: "Tout" },
  { value: "PROJECT", label: "Projets" },
  { value: "WORLD", label: "Mondes" },
  { value: "POSITION", label: "Postes" },
  { value: "CREDENTIAL", label: "Diplômes" },
  { value: "WRITING", label: "Écrits" },
] as const;

export default async function Entries({
  params,
  searchParams,
}: PageProps<"/console/[gate]/entries">) {
  const { gate } = await params;
  await requireConsole(gate);

  const filters = await searchParams;
  const kind = typeof filters.kind === "string" ? filters.kind : "";

  const entries = await db.entry.findMany({
    where: kinds.some((entry) => entry.value === kind && kind)
      ? { kind: kind as "PROJECT" }
      : {},
    orderBy: { number: "asc" },
    include: {
      translations: { where: { locale: "FR" } },
      parent: { select: { slug: true } },
      _count: { select: { children: true } },
    },
  });

  return (
    <Shell gate={gate} current="entries">
      <Head
        title="Archive"
        count={entries.length}
        action={
          <Link
            href={`/console/${gate}/entries/new`}
            className="stamp stamp-solid"
            style={{ "--stamp-angle": "-1.5deg" } as React.CSSProperties}
          >
            <span className="stamp-label">Nouvelle entrée</span>
          </Link>
        }
      />

      <nav className="flex flex-wrap gap-x-8 gap-y-3">
        {kinds.map((entry) => (
          <Link
            key={entry.label}
            href={`/console/${gate}/entries${entry.value ? `?kind=${entry.value}` : ""}`}
            className={`t-meta transition-colors ${
              entry.value === kind
                ? "text-accent"
                : "text-content-muted hover:text-content"
            }`}
          >
            {entry.label}
          </Link>
        ))}
      </nav>

      <div className="mt-10">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={`/console/${gate}/entries/${entry.id}`}
            className="border-rule group grid gap-x-8 gap-y-2 border-t py-5 md:grid-cols-[4rem_1fr_9rem_7rem]"
          >
            <span className="t-meta text-accent">
              {String(entry.number).padStart(3, "0")}
            </span>

            <span className="t-register group-hover:text-accent transition-colors">
              {entry.parent ? (
                <span className="text-content-muted">
                  {entry.parent.slug} /{" "}
                </span>
              ) : null}
              {entry.translations[0]?.title ?? entry.slug}
              {entry._count.children > 0 ? (
                <span className="text-content-muted">
                  {" "}
                  ({entry._count.children})
                </span>
              ) : null}
            </span>

            <span className="t-meta text-content-muted">{entry.kind}</span>

            <span
              className={`t-meta ${
                entry.status === "PUBLISHED" ? "text-content-muted" : "text-energy"
              }`}
            >
              {entry.status === "PUBLISHED" ? "Publié" : "Brouillon"}
            </span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
