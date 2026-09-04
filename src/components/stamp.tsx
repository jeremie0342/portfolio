import { Link } from "@/i18n/navigation";

/**
 * A call to action drawn as an archive stamp.
 *
 * The angle is passed per instance rather than randomised: two stamps leaning
 * the same way look like a mistake, and two leaning by the same amount in
 * opposite directions look like a decoration. Slightly different angles read
 * as two marks made by hand at different moments, which is the point.
 */
export function Stamp({
  href,
  label,
  note,
  angle,
  solid = false,
}: {
  href: "/about" | "/contact" | "/archive";
  label: string;
  note: string;
  angle: string;
  solid?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`stamp${solid ? " stamp-solid" : ""}`}
      style={{ "--stamp-angle": angle } as React.CSSProperties}
    >
      <span className="stamp-label">{label}</span>
      <span className="stamp-note">{note}</span>
    </Link>
  );
}
