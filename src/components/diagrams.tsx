import { getTranslations } from "next-intl/server";
import { SchemaFigure, type Tier } from "./schema-figure";

/**
 * The diagrams an entry can carry.
 *
 * The drawing is code and the words are content: the shape of a system belongs
 * with the components, its labels belong in the message files where they get
 * translated like everything else. An entry names one by key, which is why the
 * console offers a list rather than a free text field.
 */

export const diagramKeys = ["ubbfy", "skilluv", "pipeline"] as const;

export type DiagramKey = (typeof diagramKeys)[number];

export function isDiagram(name: string | null): name is DiagramKey {
  return name !== null && (diagramKeys as readonly string[]).includes(name);
}

/* Read along rather than down: a pipeline is a sequence, and drawing it as a
   stack would say the stages sit on top of each other. */
const along = new Set<DiagramKey>(["pipeline"]);

export async function Diagram({ name }: { name: string | null }) {
  if (!isDiagram(name)) {
    return null;
  }

  const t = await getTranslations(`diagrams.${name}`);

  return (
    <SchemaFigure
      title={t("title")}
      caption={t("caption")}
      tiers={t.raw("tiers") as Tier[]}
      along={along.has(name)}
    />
  );
}
