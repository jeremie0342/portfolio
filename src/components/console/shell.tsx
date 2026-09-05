import Link from "next/link";
import { signOut } from "@/app/actions/console";
import { resources } from "@/lib/console";

/**
 * The frame every console page sits in.
 *
 * The gate has to travel through the markup because it is part of every URL,
 * and reading it from the environment in each component would work but would
 * put the secret in a dozen files instead of one.
 */
export function Shell({
  gate,
  current,
  children,
}: {
  gate: string;
  current?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="px-(--spacing-gutter) py-(--spacing-gutter)">
      <header className="border-rule flex flex-wrap items-baseline justify-between gap-4 border-b pb-4">
        <Link
          href={`/console/${gate}`}
          className="t-meta hover:text-accent transition-colors"
        >
          Console
        </Link>

        <nav className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {resources.map((resource) => (
            <Link
              key={resource.slug}
              href={`/console/${gate}/${resource.slug}`}
              className={`t-meta transition-colors ${
                resource.slug === current
                  ? "text-accent"
                  : "text-content-muted hover:text-content"
              }`}
            >
              {resource.label}
            </Link>
          ))}

          <form action={signOut}>
            <input type="hidden" name="gate" value={gate} />
            <button
              type="submit"
              className="t-meta text-content-muted hover:text-energy transition-colors"
            >
              Sortir
            </button>
          </form>
        </nav>
      </header>

      {children}
    </main>
  );
}

/** A page heading, with an optional action to its right. */
export function Head({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-6 pt-14 pb-8">
      <h1 className="t-display text-display-l">
        {title}
        {count === undefined ? null : (
          <span className="t-meta text-content-muted ml-4 align-middle">
            {count}
          </span>
        )}
      </h1>
      {action}
    </div>
  );
}
