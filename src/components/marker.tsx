/**
 * A keyword struck through with gold, the way a reader marks a line.
 *
 * The word changes colour as the stroke passes under it, and that is not
 * decoration: ivory on gold measures 2.3:1, so a highlighted word that kept its
 * colour would be less readable than the sentence around it. Taking the surface
 * colour puts it at 7.6:1 on the dark ground and 5.2:1 on the light one.
 *
 * It also happens to be the only emphasis available here. Redaction has a bold,
 * but the halftone goes opaque in it and loses the grain, so weight is not a
 * lever this typeface offers. Inversion is.
 *
 * `mark` rather than a span: the element means marked or highlighted text, and
 * a screen reader can say so.
 */
export function Marker({ children }: { children: React.ReactNode }) {
  return (
    <mark className="marker">
      <span className="marker-word">{children}</span>
    </mark>
  );
}
