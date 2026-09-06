import { notFound } from "next/navigation";
import { indexNowKey } from "@/lib/indexnow";

/**
 * The key an engine reads back to check the announcement was ours.
 *
 * Deliberately not a secret: anyone can fetch it, and that is the point. It
 * proves whoever submitted a list of changed addresses also controls this
 * host. With no key configured the address does not exist at all, rather than
 * serving an empty file that would fail verification in a confusing way.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const key = indexNowKey();

  if (!key) {
    notFound();
  }

  return new Response(key, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
