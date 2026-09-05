import "server-only";

import { db } from "./db";
import { hashPassword, verifyPassword } from "./password";

/**
 * The console account.
 *
 * The environment holds a bootstrap digest and the database holds the real one.
 * The first successful login with the bootstrap creates the row and marks it as
 * needing a change; from then on the row is the only credential that counts and
 * the environment value is dead.
 *
 * That split is what makes a password change possible at all. A digest in the
 * environment can only be changed by a deployment, which is a poor answer to
 * "someone saw me type it".
 */

const ID = "console";

export async function readAccount() {
  return db.account.findUnique({ where: { id: ID } });
}

export type SignInOutcome =
  | { ok: true; mustChange: boolean }
  | { ok: false; reason: "wrong" | "unconfigured" };

/**
 * Checks a password against whichever credential is currently in force.
 *
 * The bootstrap path runs at most once. Creating the row on the way through
 * means there is no separate setup step to forget, and no window in which the
 * console is reachable with no password at all.
 */
export async function attempt(password: string): Promise<SignInOutcome> {
  const account = await readAccount();

  if (account) {
    if (!(await verifyPassword(password, account.passwordHash))) {
      return { ok: false, reason: "wrong" };
    }

    return { ok: true, mustChange: account.mustChange };
  }

  const bootstrap = process.env.ADMIN_PASSWORD_HASH;

  if (!bootstrap) {
    return { ok: false, reason: "unconfigured" };
  }

  if (!(await verifyPassword(password, bootstrap))) {
    return { ok: false, reason: "wrong" };
  }

  await db.account.create({
    data: { id: ID, passwordHash: bootstrap, mustChange: true },
  });

  return { ok: true, mustChange: true };
}

export type ChangeOutcome =
  | "changed"
  | "tooShort"
  | "mismatch"
  | "reused"
  | "missing";

/* Twelve, matching the secrets script. Long enough to be worth the scrypt cost
   behind it, short enough that nobody works around the rule with a note. */
const MINIMUM = 12;

export async function changePassword(
  next: string,
  confirmation: string,
): Promise<ChangeOutcome> {
  const account = await readAccount();

  if (!account) {
    return "missing";
  }

  if (next.length < MINIMUM) {
    return "tooShort";
  }

  if (next !== confirmation) {
    return "mismatch";
  }

  /* Refusing the current password is the whole point of a forced change:
     accepting it would clear the flag and leave the credential exactly where it
     was. */
  if (await verifyPassword(next, account.passwordHash)) {
    return "reused";
  }

  await db.account.update({
    where: { id: ID },
    data: { passwordHash: await hashPassword(next), mustChange: false },
  });

  return "changed";
}

/** Whether the console should be leading its reader to the password screen. */
export async function mustChangePassword() {
  const account = await readAccount();
  return account?.mustChange ?? false;
}
