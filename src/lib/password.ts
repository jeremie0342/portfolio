import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing.
 *
 * Kept apart from the session module, which cannot leave a request context.
 * This is pure cryptography and runs anywhere Node does, which is what lets the
 * secrets script produce a digest without pulling a server runtime in behind
 * it.
 */

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  length: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/* Four times the default work factor, which measures around 150 ms on the
   machine this was written on. Imperceptible on a login that happens a few
   times a week, and paid again on every guess by anyone working through a
   stolen digest. Scrypt is memory hard as well as slow, so that cost does not
   fall away on a graphics card the way a plain hash would.

   maxmem has to be raised with it: scrypt needs roughly 128 * N * r bytes, and
   the default ceiling of thirty two megabytes would refuse this outright. */
const COST = { N: 2 ** 16, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

function digestOf(password: string, salt: Buffer) {
  return scrypt(password, salt, KEY_LENGTH, COST);
}

/** `salt:digest`, both hexadecimal. Produced by the secrets script. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const digest = await digestOf(password, salt);

  return `${salt.toString("hex")}:${digest.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, digestHex] = stored.split(":");

  if (!saltHex || !digestHex) {
    return false;
  }

  const expected = Buffer.from(digestHex, "hex");
  const actual = await digestOf(password, Buffer.from(saltHex, "hex"));

  /* Length is checked first because timingSafeEqual throws on a mismatch, and
     a thrown exception is itself a timing signal. */
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
