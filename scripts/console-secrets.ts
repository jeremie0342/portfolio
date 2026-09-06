import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { hashPassword } from "../src/lib/password";

/**
 * Generates the three values the console needs.
 *
 * Prints them rather than writing them: a script that edits .env on its own
 * will one day overwrite something it did not put there, and the one moment
 * these values should pass in front of a human is when they are created.
 *
 * The password is asked for rather than generated. A generated one ends up in
 * a password manager, which is fine, but it also ends up in a shell history on
 * the way there, which is not.
 */
async function main() {
  /* Asked for interactively, except where there is nobody to ask: continuous
     integration needs a digest for a password it already knows, and there the
     shell history argument does not apply because the password is thrown away
     with the runner. */
  const supplied = process.env.CONSOLE_PASSWORD?.trim();
  let password = supplied ?? "";

  if (!supplied) {
    const io = createInterface({ input: process.stdin, output: process.stdout });
    password = (await io.question("Mot de passe de la console : ")).trim();
    io.close();
  }

  if (password.length < 12) {
    console.error("\nTrop court. Douze caractères au minimum.");
    process.exitCode = 1;
    return;
  }

  const hash = await hashPassword(password);

  /* base64url so the value survives a URL without escaping, and long enough
     that guessing it is not a strategy. */
  const path = randomBytes(18).toString("base64url");
  const secret = randomBytes(32).toString("base64url");

  console.log("\nÀ recopier dans .env :\n");
  console.log(`CONSOLE_PATH="${path}"`);
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
  console.log(`AUTH_SECRET="${secret}"`);
  console.log(`\nLa console répondra sur /console/${path}`);
  console.log(
    "Changer AUTH_SECRET ferme immédiatement toutes les sessions ouvertes.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
