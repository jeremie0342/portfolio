import { contributions } from "./evidence";

/**
 * Activity read from GitHub.
 *
 * Two windows, and they answer different questions. The year totals say how
 * much work there is; the recent feed says the work is still happening. Only
 * the second is available without authentication.
 *
 * Everything degrades. A front page has to render when GitHub is down, rate
 * limited or slow, and a build that fails because a third party had a bad
 * afternoon is a worse outcome than a missing section.
 */

const account = "jeremie0342";
const events = `https://api.github.com/users/${account}/events/public?per_page=100`;

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export type Touch = {
  repository: string;
  branch: string;
  url: string;
  at: string;
};

export type Activity = {
  pushes: number;
  merged: number;
  opened: number;
  repositories: number;
  since: string;
  recent: Touch[];
};

type Event = {
  type: string;
  created_at: string;
  repo: { name: string };
  payload?: { ref?: string; action?: string };
};

/**
 * The last week or so of public activity.
 *
 * Counted in pushes rather than in commits, and that is not a preference. The
 * public events endpoint no longer carries `size`, `distinct_size` or the
 * commit list on a PushEvent: the payload is down to the repository, the
 * branch and the head SHA. Anything claiming a commit count from this feed is
 * either authenticated elsewhere or making it up, so this counts what the feed
 * can actually prove.
 */
export async function readActivity(): Promise<Activity | null> {
  try {
    const response = await fetch(events, {
      headers,
      /* Revalidated on the same hourly cadence as the pages that use it, so a
         visitor never waits on GitHub and the figures still move on their
         own. */
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const feed = (await response.json()) as Event[];

    if (!Array.isArray(feed) || feed.length === 0) {
      return null;
    }

    const pushes = feed.filter((event) => event.type === "PushEvent");
    const pulls = feed.filter((event) => event.type === "PullRequestEvent");

    if (pushes.length === 0) {
      return null;
    }

    const oldest = feed.reduce((earliest, event) =>
      event.created_at < earliest.created_at ? event : earliest,
    );

    /* One line per branch rather than per push. A repository pushed to eleven
       times in an afternoon says less than four branches across three
       repositories, which is what the reader is actually looking at. */
    const seen = new Set<string>();
    const recent: Touch[] = [];

    for (const event of pushes) {
      const branch = (event.payload?.ref ?? "").replace("refs/heads/", "");
      const key = `${event.repo.name}#${branch}`;

      if (!branch || seen.has(key)) {
        continue;
      }

      seen.add(key);

      recent.push({
        repository: event.repo.name,
        branch,
        url: `https://github.com/${event.repo.name}/tree/${branch}`,
        at: event.created_at,
      });

      if (recent.length === 6) {
        break;
      }
    }

    return {
      pushes: pushes.length,
      merged: pulls.filter((event) => event.payload?.action === "merged").length,
      opened: pulls.filter((event) => event.payload?.action === "opened").length,
      repositories: new Set(feed.map((event) => event.repo.name)).size,
      since: oldest.created_at,
      recent,
    };
  } catch {
    return null;
  }
}

/**
 * Totals for the current year.
 *
 * Contribution totals only exist on the GraphQL API, which requires a token.
 * `GITHUB_TOKEN` is therefore optional: set it and the figures are read at
 * build time, leave it unset and they fall back to the values recorded in
 * evidence.ts. A deployment should not be obliged to carry a secret for a
 * number nobody disputes, but it should be able to.
 */
export async function readYearTotals() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return contributions;
  }

  const year = new Date().getUTCFullYear();

  const query = `query($from: DateTime!, $to: DateTime!) {
    viewer {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalRepositoriesWithContributedCommits
      }
    }
  }`;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...headers, Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        query,
        variables: {
          from: `${year}-01-01T00:00:00Z`,
          to: `${year}-12-31T23:59:59Z`,
        },
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return contributions;
    }

    const body = await response.json();
    const totals = body?.data?.viewer?.contributionsCollection;

    if (!totals) {
      return contributions;
    }

    return {
      year,
      measuredOn: new Date().toISOString().slice(0, 10),
      commits: totals.totalCommitContributions as number,
      pullRequests: totals.totalPullRequestContributions as number,
      repositories: totals.totalRepositoriesWithContributedCommits as number,
    };
  } catch {
    return contributions;
  }
}
