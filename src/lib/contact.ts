/**
 * Contact details and public profiles.
 *
 * Held in one place because they appear on the contact page, in the footer and
 * in the structured data, and three copies of a phone number is two too many.
 */
export const contact = {
  email: "jeremie@skill-uv.com",
  /* The personal address stays listed: it is the one on the GitHub profile and
     on the curriculum vitae, and a reader who found it there should not wonder
     whether it still works. */
  personalEmail: "jeremiezitti@gmail.com",
  /* Kept as two fields: one for the tel: href, which must not contain spaces,
     and one for the eye. */
  phone: "+2290152007017",
  phoneDisplay: "+229 01 52 00 70 17",
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
