import "server-only";

import { notFound, redirect } from "next/navigation";
import { hasSession, isGate } from "./auth";
import { mustChangePassword } from "./account";

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
export async function requireConsole(gate: string, { changing = false } = {}) {
  if (!isGate(gate)) {
    notFound();
  }

  if (!(await hasSession())) {
    redirect(`/console/${gate}`);
  }

  /* A password that has never been changed leads nowhere but the screen that
     changes it. The exception is that screen itself, which would otherwise
     redirect to itself for ever. */
  if (!changing && (await mustChangePassword())) {
    redirect(`/console/${gate}/password`);
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
