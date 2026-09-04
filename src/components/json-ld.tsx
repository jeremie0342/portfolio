/**
 * Emits a JSON-LD graph.
 *
 * The script tag is the only shape a crawler reads structured data in, so it
 * is rendered rather than described. It carries no executable code: the type
 * keeps browsers from running it, and it exists purely to be parsed by
 * something that is not a browser.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
