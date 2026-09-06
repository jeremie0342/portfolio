/**
 * Contact details and public profiles.
 *
 * Held in one place because they appear on the contact page, in the footer and
 * in the structured data, and three copies of a phone number is two too many.
 */
export const contact = {
  email: "jeremie@skill-uv.com",
  /* The number and the personal address are deliberately absent.
     Both were printed in full on two public, indexed pages, which is the
     shortest path a harvester takes to a phone that then rings at dinner. The
     form is protected, the address on it is monitored, and a number can be
     given in the first reply to a message worth answering. */
  city: "Cotonou",
  country: "Bénin",
  timezone: "GMT+1",
} as const;

/**
 * Organisations whose repositories carry part of the work. Listed because a
 * reader checking the GitHub account alone would miss most of it: the Skilluv
 * repositories belong to organisations rather than to the personal account.
 */
export const organisations = [
  { name: "Skilluv", url: "https://github.com/Skilluv", role: "owner" },
  {
    name: "skilluv-community",
    url: "https://github.com/skilluv-community",
    role: "owner",
  },
  { name: "Orisum Groupe", url: null, role: "owner" },
  { name: "IT Opportunities Tracker", url: null, role: "member" },
] as const;
