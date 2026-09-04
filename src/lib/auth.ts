import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Authentication for a console with exactly one user.
 *
 * Built on node:crypto rather than on a library, because a single account needs
 * a password check and a signed cookie and nothing else. A framework for one
 * user is more surface to keep patched than code to read.
 *
 * The password is never stored, only its scrypt digest, and the digest lives in
 * the environment rather than in the database. A stolen dump of this database
 * contains messages from strangers and no way in. The hashing itself lives in
 * password.ts, which has no server runtime behind it so that the secrets script
 * can use it too.
 *
 * The session is a signed statement of when it was issued, not a random token
 * looked up in a table. With one user there is nothing to look up, and nothing
 * to keep in sync.
 */

const COOKIE = "console";

/* Twelve hours. Long enough that reading an inbox does not mean logging in
   twice, short enough that a laptop left open in a cafe is not a standing
   invitation. */
const LIFETIME_MS = 12 * 60 * 60 * 1000;

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function openSession() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not set.");
  }

  const issued = String(Date.now());
  const jar = await cookies();

  jar.set(COOKIE, `${issued}.${sign(issued, secret)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: LIFETIME_MS / 1000,
  });
}

export async function closeSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/**
 * Whether the caller holds a session that this deployment issued and that has
 * not expired. The expiry is carried inside the signature rather than left to
 * the cookie's own lifetime, which the holder of the cookie controls.
 */
export async function hasSession() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    return false;
  }

  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;

  if (!value) {
    return false;
  }

  const [issued, signature] = value.split(".");

  if (!issued || !signature) {
    return false;
  }

  const expected = Buffer.from(sign(issued, secret));
  const actual = Buffer.from(signature);

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return false;
  }

  return Date.now() - Number(issued) < LIFETIME_MS;
}

/**
 * Whether the path segment matches the one this deployment answers on.
 *
 * Not a security boundary, and it is worth being clear about that: it keeps
 * scanners and crawlers away from the login form, and nothing more. The
 * password does the actual work. Compared in constant time anyway, since it
 * costs one line.
 */
export function isGate(segment: string) {
  const gate = process.env.CONSOLE_PATH;

  if (!gate) {
    return false;
  }

  const expected = Buffer.from(gate);
  const actual = Buffer.from(segment);

  return (
    expected.length === actual.length && timingSafeEqual(expected, actual)
  );
}
