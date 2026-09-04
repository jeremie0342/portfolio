import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * One rule, for the console. It is already noindex on the page itself and
 * behind a password, and this is the belt to that pair of braces.
 *
 * The path in the rule is the prefix rather than the secret segment: writing
 * the real address into a file whose whole purpose is to be fetched by
 * strangers would defeat the point of having one.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/console" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
