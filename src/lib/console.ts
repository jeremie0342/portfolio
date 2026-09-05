import "server-only";

import { notFound, redirect } from "next/navigation";
import { hasSession, isGate } from "./auth";

/**
 * The guard every console page past the door runs.
 *
 * A wrong path is a 404 and a missing session is a redirect to the login, and
 * the difference is deliberate: the first answer is what any unknown URL gets,
 * so it tells a scanner nothing, while the second is only ever seen by someone
 * who already knows the path.
 *
 * Pages guard the view. The actions guard themselves, separately, because a
 * server action is a public endpoint whatever page renders the form.
 */
export async function requireConsole(gate: string) {
  if (!isGate(gate)) {
    notFound();
  }

  if (!(await hasSession())) {
    redirect(`/console/${gate}`);
  }
}

/** The resources the console manages, in the order they are listed. */
export const resources = [
  { slug: "messages", label: "Messages" },
  { slug: "entries", label: "Archive" },
  { slug: "organizations", label: "Organisations" },
  { slug: "media", label: "Médias" },
  { slug: "profiles", label: "Profils" },
] as const;
