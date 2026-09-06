import "server-only";

import { siteUrl } from "./site";
import { routing } from "@/i18n/routing";

/**
 * Announcing a change rather than waiting to be found.
 *
 * A crawler decides when to come back, and for a site this size that interval
 * is measured in days. IndexNow inverts it: the site says which addresses just
 * changed and the engines that implement it come and look, usually within
 * minutes. Bing built it, and Bing is what answers when an assistant searches
 * the web, which is increasingly how a name gets looked up.
 *
 * The key is not a secret. It is published at a fixed address on this host so
 * that an engine can check the announcement came from someone who controls the
 * site; that is its only job. Without it configured, everything here is a no
 * operation, which is what the local machine and the test runner both want.
 */

const ENDPOINT = "https://api.indexnow.org/indexnow";

/* The file the key is served from. Not the spec's default location, which
   names the file after the key itself; a fixed path is one route rather than a
   dynamic one, and the payload says where to look. */
export const KEY_PATH = "/indexnow.txt";

/** The key, if one is configured. Served as a file, so no origin check. */
export function indexNowKey() {
  return process.env.INDEXNOW_KEY?.trim() || null;
}

/**
 * Announces paths, in every language, as absolute addresses.
 *
 * Failures are swallowed on purpose. This runs after a write that has already
 * succeeded, and a search engine having a bad afternoon is not a reason to
 * show an error to someone who has just saved an entry.
 */
export async function announce(paths: string[]) {
  const key = indexNowKey();

  /* An origin nobody outside can resolve cannot be verified, so a laptop
     announces nothing however it is configured. */
  if (!key || paths.length === 0 || siteUrl.includes("localhost")) {
    return;
  }

  const urlList = paths.flatMap((path) =>
    routing.locales.map((locale) => `${siteUrl}/${locale}${path}`),
  );

  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        host: new URL(siteUrl).host,
        key,
        keyLocation: `${siteUrl}${KEY_PATH}`,
        urlList,
      }),
      /* The write is done and the reader is being redirected. Waiting on a
         third party here would only make a saved entry feel slow. */
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    /* Announced or not, the page is correct and the crawler will arrive on its
       own schedule. */
  }
}
