import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Nothing is disallowed. There is no admin surface, no search parameters worth
 * excluding and no duplicate paths, so a rule here would only be a rule to
 * maintain. The sitemap line is the part that matters.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
