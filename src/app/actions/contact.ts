"use server";

import { db } from "@/lib/db";
import { routing } from "@/i18n/routing";

/**
 * Receives a message from the contact form.
 *
 * The defences here are the cheap ones, chosen because they cost nothing to a
 * real sender and stop the traffic a portfolio actually gets. A public form
 * with none of them fills the table with junk within days of going live.
 *
 * A hidden field no human sees, filled only by something reading the markup
 * rather than the page. A minimum time between the form rendering and its
 * submission, since a person needs longer than three seconds to write a
 * message and a script does not. And length caps on everything, because an
 * unbounded text column is an invitation.
 *
 * Rejections are silent. Telling a sender which check they failed tells the
 * next script how to pass it, so a caught submission gets the same reply a
 * real one does and simply is not stored.
 *
 * When this stops being enough the next step is Turnstile, which needs a key
 * and a network call and is therefore not the first step.
 */

const LIMITS = {
  name: 120,
  email: 200,
  subject: 200,
  body: 4000,
} as const;

const MINIMUM_MS = 3000;

/* Deliberately loose. Address syntax is far stranger than most patterns allow,
   and the only test that proves an address works is sending to it. This
   catches the typo and the empty field, which is all validation can honestly
   claim. */
const looksLikeAddress = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;

export type ContactState = {
  status: "idle" | "sent" | "invalid" | "failed";
  fields?: Partial<Record<"name" | "email" | "body", true>>;
};

export async function sendMessage(
  _previous: ContactState,
  form: FormData,
): Promise<ContactState> {
  const trap = String(form.get("company") ?? "");
  const opened = Number(form.get("opened") ?? 0);

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  const locale = String(form.get("locale") ?? routing.defaultLocale);

  const fields: ContactState["fields"] = {};

  if (!name || name.length > LIMITS.name) {
    fields.name = true;
  }

  if (!email || email.length > LIMITS.email || !looksLikeAddress.test(email)) {
    fields.email = true;
  }

  if (body.length < 10 || body.length > LIMITS.body) {
    fields.body = true;
  }

  if (Object.keys(fields).length > 0) {
    return { status: "invalid", fields };
  }

  /* Both silent. The sender is told the message went through, and nothing is
     written. */
  if (trap) {
    return { status: "sent" };
  }

  if (!opened || Date.now() - opened < MINIMUM_MS) {
    return { status: "sent" };
  }

  try {
    await db.message.create({
      data: {
        name,
        email,
        subject: subject.slice(0, LIMITS.subject) || null,
        body,
        locale: locale === "fr" ? "FR" : "EN",
      },
    });

    return { status: "sent" };
  } catch {
    /* The one failure worth reporting: the message was real and is not saved,
       so the sender needs to know to use the address instead. */
    return { status: "failed" };
  }
}
