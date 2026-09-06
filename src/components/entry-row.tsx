import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ArchiveEntry } from "@/lib/entries";

/**
 * One line of an index.
 *
 * The number sits on the right and the classification on the left, which is
 * the arrangement a printed contents page uses: the eye scans titles down the
 * left edge and only reaches for a number once it has decided.
 *
 * Accent colour reaches the number and nothing else here. At index sizes the
 * title is below the threshold where crimson stays readable against the dark
 * ground, and an index that colours its titles turns into a list of links
 * rather than a table of contents.
 */

const numberTone: Record<ArchiveEntry["accent"], string> = {
  GOLD: "text-accent",
  CRIMSON: "text-energy",
  VIOLET: "text-content-muted",
};

export async function EntryRow({ entry }: { entry: ArchiveEntry }) {
  const t = await getTranslations("entry");
  const archive = await getTranslations("archive");

  const classification = entry.dimension
    ? t(`dimension.${entry.dimension}`)
    : t(`kind.${entry.kind}`);

  return (
    <Link
      href={`/archive/${entry.slug}`}
      className="group grid grid-cols-[1fr_auto] items-baseline gap-x-8 border-t border-rule py-8"
    >
      <div>
        <p className="t-meta text-content-muted">
          {classification}
          {entry.children.length > 0 ? (
            <span className="text-accent">
              {" "}
              {archive("pieces", { count: entry.children.length })}
            </span>
          ) : null}
        </p>

        {/* A level two heading, not three. These rows are the first thing
            under the page title on the front page and on the index, and a
            document that jumps from one to three is a document a screen reader
            announces as having a missing section. */}
        <h2 className="t-display text-display-m mt-3 group-hover:text-accent transition-colors">
          {entry.title}
        </h2>

        {entry.summary ? (
          <p className="measure t-register text-content-muted mt-3">
            {entry.summary}
          </p>
        ) : null}
      </div>

      <span className={`t-meta ${numberTone[entry.accent]}`}>
        {String(entry.number).padStart(3, "0")}
      </span>
    </Link>
  );
}
