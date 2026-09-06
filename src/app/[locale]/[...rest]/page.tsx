import { notFound } from "next/navigation";

/**
 * Everything else under a language.
 *
 * Without this, an address that matches no route falls out of the localised
 * tree entirely and gets the framework's own page: unstyled, in English
 * whatever the reader was reading, and with no way back. The catch-all keeps
 * the miss inside the layout, so the answer is the site's own.
 */
export default function Rest() {
  notFound();
}
