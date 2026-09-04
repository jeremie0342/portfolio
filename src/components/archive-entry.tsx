import { getTranslations } from "next-intl/server";
import { displayWorn } from "@/lib/fonts";
import type { ArchiveEntry } from "@/lib/entries";

/**
 * One archive entry, rendered under the colour rules of the art direction.
 *
 * The accent stored on an entry is not a colour swap. Against the dark ground
 * violet measures 1.7:1, so it cannot be ink at any size; an entry accented
 * violet turns its whole section into a violet field and writes on it in
 * ivory instead. Crimson at 2.8:1 survives only at display size, which is why
 * it reaches the title and nothing else. Gold is the one accent that holds
 * everywhere.
 *
 * Encoding that here rather than at each call site is what keeps the rule from
 * being quietly broken by the next entry someone adds.
 */

const titleTone: Record<ArchiveEntry["accent"], string> = {
  GOLD: "text-accent",
  CRIMSON: "text-energy",
  /* Violet entries invert: the accent becomes the ground, so the title takes
     the readable ivory rather than the accent itself. */
  VIOLET: "text-ivory",
};

function period(
  entry: ArchiveEntry,
  t: Awaited<ReturnType<typeof getTranslations<"home">>>,
) {
  if (!entry.startedOn) {
    return null;
  }

  const start = String(entry.startedOn.getUTCFullYear());

  if (!entry.endedOn) {
    return t("period.ongoing", { start });
  }

  const end = String(entry.endedOn.getUTCFullYear());

  return start === end
    ? t("period.single", { start })
    : t("period.range", { start, end });
}

export async function ArchiveEntryBlock({ entry }: { entry: ArchiveEntry }) {
  const t = await getTranslations("home");

  const imagined = entry.accent === "VIOLET";
  const worn = entry.wear === "WORN";

  /* The worn cut of Redaction is only pulled in by the sections that render
     it, which keeps it off every route that does not. */
  const scopedFont = worn ? displayWorn.variable : "";

  const shell = imagined
    ? "-mx-(--spacing-gutter) bg-surface-imagined px-(--spacing-gutter) py-(--spacing-section)"
    : "";

  const muted = imagined ? "text-ivory/70" : "text-content-muted";
  const prose = imagined ? "text-ivory/85" : "text-content";

  return (
    <article className={`${scopedFont} ${shell}`.trim()}>
      <p className="t-meta text-accent">
        {String(entry.number).padStart(3, "0")}{" "}
        <span className={muted}>
          {entry.dimension
            ? t(`dimension.${entry.dimension}`)
            : t(`kind.${entry.kind}`)}
        </span>
        {entry.featured ? (
          <span className="text-accent"> {t("selected")}</span>
        ) : null}
      </p>

      <h2
        className={`${worn ? "t-display-worn" : "t-display"} text-display-l ${titleTone[entry.accent]} measure-lead mt-6 text-balance`}
      >
        {entry.title}
      </h2>

      {entry.summary ? (
        <p className={`measure text-body-l ${prose} mt-6`}>{entry.summary}</p>
      ) : null}

      {entry.body
        ? entry.body.split("\n\n").map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className={`measure ${prose} mt-5`}>
              {paragraph}
            </p>
          ))
        : null}

      <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5">
        {period(entry, t) ? (
          <div>
            <dt className="t-meta text-accent">{t(`kind.${entry.kind}`)}</dt>
            <dd className={`t-meta ${muted} mt-1`}>{period(entry, t)}</dd>
          </div>
        ) : null}

        {entry.stack.length > 0 ? (
          <div>
            <dt className="t-meta text-accent">Stack</dt>
            <dd className={`t-meta ${muted} mt-1`}>
              {entry.stack.join(" / ")}
            </dd>
          </div>
        ) : null}

        {entry.repositoryUrl ? (
          <div>
            <dt className="t-meta text-accent">{t("repository")}</dt>
            <dd className="t-meta mt-1">
              <a
                href={entry.repositoryUrl}
                rel="noreferrer"
                className={`${imagined ? "text-ivory" : "text-content"} underline decoration-accent underline-offset-4`}
              >
                {entry.repositoryUrl.replace("https://github.com/", "")}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
