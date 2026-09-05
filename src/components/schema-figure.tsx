/**
 * The drawing kit the architecture diagrams are made of.
 *
 * They are HTML and CSS rather than an uploaded image, and the reasons are
 * practical rather than principled. Text in a picture does not follow the
 * theme, cannot be selected, cannot be read aloud, cannot be translated and
 * cannot be corrected without opening a drawing tool. Boxes joined by rules
 * are the whole vocabulary these diagrams need, and the browser draws those
 * better than any export.
 *
 * A diagram is a stack of tiers read downwards, or a chain read along. Each
 * tier holds one or more nodes; the label between two tiers says what travels
 * between them, which is the part of an architecture drawing that carries the
 * information.
 */

export type Node = {
  label: string;
  note?: string;
  /** The one node a reader should land on first. */
  lead?: boolean;
};

export type Tier = {
  nodes: Node[];
  /** What passes to the tier that follows. */
  link?: string;
};

function Box({ node }: { node: Node }) {
  return (
    <div
      className={`border-rule flex-1 border px-5 py-4 ${
        node.lead ? "border-accent" : ""
      }`}
    >
      <p className={`t-meta ${node.lead ? "text-accent" : "text-content"}`}>
        {node.label}
      </p>
      {node.note ? (
        <p className="t-meta text-content-muted mt-2 normal-case">
          {node.note}
        </p>
      ) : null}
    </div>
  );
}

/** The rule between two tiers, carrying the name of what crosses it. */
function Link({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-3">
      <span className="bg-rule h-6 w-px" aria-hidden="true" />
      {label ? (
        <span className="t-meta text-content-muted px-3 py-2 text-center normal-case">
          {label}
        </span>
      ) : null}
      <span className="bg-rule h-6 w-px" aria-hidden="true" />
    </div>
  );
}

export function SchemaFigure({
  title,
  caption,
  tiers,
  along = false,
}: {
  title: string;
  caption: string;
  tiers: Tier[];
  /** A chain read left to right, which stacks on a narrow screen. */
  along?: boolean;
}) {
  return (
    <figure className="border-rule mt-12 border-t pt-8">
      <figcaption className="t-meta text-accent">{title}</figcaption>

      {along ? (
        /* Numbered rather than joined by arrows. The site already counts its
           entries and its method in the same hand, so a reader knows what an
           ordinal means here, and it survives the boxes stacking on a phone
           where a row of arrows would be pointing the wrong way. */
        <ol className="mt-8 flex flex-col gap-y-3 md:flex-row md:items-stretch md:gap-x-3">
          {tiers.map((tier, index) => (
            <li key={tier.nodes[0].label} className="flex flex-1 flex-col">
              <span className="t-meta text-accent mb-2">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-1">
                <Box node={tier.nodes[0]} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-8">
          {tiers.map((tier, index) => (
            <div key={tier.nodes[0].label}>
              <div className="flex flex-col gap-3 sm:flex-row">
                {tier.nodes.map((node) => (
                  <Box key={node.label} node={node} />
                ))}
              </div>

              {index < tiers.length - 1 ? <Link label={tier.link} /> : null}
            </div>
          ))}
        </div>
      )}

      {/* The sentence a reader gets instead of the drawing: on a screen reader,
          in a printed page, and in the search result that quotes it. */}
      <p className="measure t-register text-content-muted mt-8">{caption}</p>
    </figure>
  );
}
