"use client";

import { usePathname, Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

/**
 * Switches language without losing the reader's place.
 *
 * `usePathname` here is the localised one: it returns the route without its
 * locale segment, so the same entry can be handed to the other language
 * rather than sending the reader back to a home page they did not ask for.
 */
export function LocaleSwitch({
  target,
  label,
}: {
  target: Locale;
  label: string;
}) {
  const pathname = usePathname();

  return (
    <Link
      href={pathname}
      locale={target}
      className="t-meta text-content-muted hover:text-accent transition-colors"
    >
      {/* Same rule as the theme control: the spoken name has to contain the
          two letters that are on screen. */}
      <span className="sr-only">{label} : </span>
      {target.toUpperCase()}
    </Link>
  );
}
