/**
 * Live activity read from the GitHub public events feed.
 *
 * The unauthenticated endpoint is used on purpose. Contribution totals would
 * need the GraphQL API and therefore a token, which would mean a secret in the
 * deployment for a figure nobody disputes; the public feed needs nothing and
 * carries what actually matters here, which is that the work is ongoing.
 *
 * The feed is capped by GitHub at roughly the last ninety events or thirty
 * days, whichever comes first, so these numbers describe recent activity
 * rather than a career total. The copy says so.
 *
 * Everything degrades to null. A front page must render when GitHub is down,
 * rate limited, or simply slow, and a build that fails because a third party
 * had a bad afternoon is a worse outcome than a missing section.
 */

const account = "jeremie0342";
const endpoint = `https://api.github.com/users/${account}/events/public?per_page=100`;

export type Push = {
  repository: string;
  url: string;
  commits: number;
  message: string;
  at: string;
};

export type Activity = {
  commits: number;
  repositories: number;
  since: string;
  pushes: Push[];
};

type PushEvent = {
  type: string;
  created_at: string;
  repo: { name: string };
  payload?: {
    commits?: { message: string }[];
    size?: number;
  };
};

export async function readActivity(): Promise<Activity | null> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      /* Revalidated on the same hourly cadence as the pages that use it, so a
         visitor never waits on GitHub and the figures still move on their own. */
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const events = (await response.json()) as PushEvent[];
    const pushes = events.filter((event) => event.type === "PushEvent");

    if (pushes.length === 0) {
      return null;
    }

    const commits = pushes.reduce(
      (total, event) => total + (event.payload?.size ?? 0),
      0,
    );

    const repositories = new Set(pushes.map((event) => event.repo.name)).size;
    const oldest = pushes[pushes.length - 1];

    /* One line per push, most recent first, deduplicated by repository: the
       same repository pushed to eleven times in an afternoon says less than
       eleven different repositories would. */
    const seen = new Set<string>();
    const recent: Push[] = [];

    for (const event of pushes) {
      if (seen.has(event.repo.name)) {
        continue;
      }

      seen.add(event.repo.name);

      const message = event.payload?.commits?.at(-1)?.message ?? "";

      recent.push({
        repository: event.repo.name,
        url: `https://github.com/${event.repo.name}`,
        commits: event.payload?.size ?? 0,
        /* Commit bodies are kept out: the subject line is the part written for
           a reader. */
        message: message.split("\n")[0],
        at: event.created_at,
      });

      if (recent.length === 6) {
        break;
      }
    }

    return {
      commits,
      repositories,
      since: oldest.created_at,
      pushes: recent,
    };
  } catch {
    return null;
  }
}
