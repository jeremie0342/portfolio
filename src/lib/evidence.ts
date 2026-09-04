/**
 * Contribution figures, read from the GitHub API rather than estimated.
 *
 * They are stored as data with the date they were measured, not fetched at
 * request time: a front page should not depend on a third-party API being up,
 * and a figure that moves by three between two visits is noise rather than
 * information. Rerun the query below and update `measuredOn` when refreshing.
 *
 *   gh api graphql -f query='query { viewer { contributionsCollection(
 *     from: "2026-01-01T00:00:00Z", to: "2026-12-31T00:00:00Z") {
 *       totalCommitContributions
 *       totalPullRequestContributions
 *       totalRepositoriesWithContributedCommits } } }'
 */
export const contributions = {
  year: 2026,
  measuredOn: "2026-09-04",
  commits: 561,
  pullRequests: 124,
  repositories: 30,
} as const;
