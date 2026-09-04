import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

/**
 * The console's own root.
 *
 * A second root layout rather than a branch of the site's. The public pages
 * live under a locale segment and this does not: the console is not translated
 * and never will be, since it has one reader.
 *
 * It is also not the same kind of document. No opening sequence, no share
 * image, no structured data, and nothing here should ever be indexed.
 */
export const metadata: Metadata = {
  title: "Console",
  robots: { index: false, follow: false, nocache: true },
};

/* Nothing is prerendered. Every page reads the session, and a cached console
   is a console showing someone else's inbox. */
export const dynamic = "force-dynamic";

export default function ConsoleLayout({
  children,
}: LayoutProps<"/console">) {
  return (
    <html lang="fr" className={`${fontVariables} h-full`} data-theme="dark">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
