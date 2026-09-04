"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { closeSession, hasSession, isGate, openSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { sendReply } from "@/lib/mail";
import { db } from "@/lib/db";

/**
 * Console actions.
 *
 * Every one of them checks the session itself. A server action is a public
 * endpoint whatever page renders the form that calls it, so guarding the page
 * guards nothing: the check belongs here, on each action, not in the layout
 * that happens to display them.
 */

export type SignInState = { status: "idle" | "wrong" | "unconfigured" };

/* One process's memory, which is the right scale for one account: it slows a
   guessing run without a table, a service or a schema. A restart clears it,
   and a restart is not something an attacker can ask for. */
const attempts = new Map<string, { count: number; until: number }>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function tooManyAttempts(gate: string) {
  const record = attempts.get(gate);

  if (!record || Date.now() > record.until) {
    return false;
  }

  return record.count >= MAX_ATTEMPTS;
}

function recordAttempt(gate: string) {
  const record = attempts.get(gate);

  if (!record || Date.now() > record.until) {
    attempts.set(gate, { count: 1, until: Date.now() + WINDOW_MS });
    return;
  }

  record.count += 1;
}

export async function signIn(
  _previous: SignInState,
  form: FormData,
): Promise<SignInState> {
  const gate = String(form.get("gate") ?? "");
  const password = String(form.get("password") ?? "");
  const stored = process.env.ADMIN_PASSWORD_HASH;

  if (!isGate(gate)) {
    return { status: "wrong" };
  }

  if (!stored || !process.env.AUTH_SECRET) {
    return { status: "unconfigured" };
  }

  if (tooManyAttempts(gate)) {
    return { status: "wrong" };
  }

  if (!(await verifyPassword(password, stored))) {
    recordAttempt(gate);
    return { status: "wrong" };
  }

  attempts.delete(gate);
  await openSession();
  redirect(`/console/${gate}`);
}

export async function signOut(form: FormData) {
  await closeSession();
  redirect(`/console/${String(form.get("gate") ?? "")}`);
}

async function guard(gate: string) {
  if (!isGate(gate) || !(await hasSession())) {
    /* The same answer for a wrong path and a missing session. Distinguishing
       them would tell a caller which half they got right. */
    redirect("/");
  }
}

export async function setStatus(form: FormData) {
  const gate = String(form.get("gate") ?? "");
  await guard(gate);

  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");

  if (!["NEW", "READ", "ARCHIVED", "SPAM"].includes(status)) {
    return;
  }

  await db.message.update({
    where: { id },
    data: {
      status: status as "NEW" | "READ" | "ARCHIVED" | "SPAM",
      readAt: status === "READ" ? new Date() : undefined,
    },
  });

  revalidatePath(`/console/${gate}`);
  revalidatePath(`/console/${gate}/${id}`);
}

export type ReplyState = {
  status: "idle" | "saved" | "sent" | "empty" | "failed";
};

/**
 * Records a reply, and sends it when mail is configured.
 *
 * The write happens first and on its own. A reply that was composed and then
 * lost to a mail provider's bad afternoon is worse than one that is saved and
 * not yet sent, and the second is recoverable from any mail client.
 */
export async function replyTo(
  _previous: ReplyState,
  form: FormData,
): Promise<ReplyState> {
  const gate = String(form.get("gate") ?? "");
  await guard(gate);

  const id = String(form.get("id") ?? "");
  const body = String(form.get("reply") ?? "").trim();

  if (body.length < 2) {
    return { status: "empty" };
  }

  const message = await db.message.findUnique({ where: { id } });

  if (!message) {
    return { status: "failed" };
  }

  await db.message.update({
    where: { id },
    data: { reply: body, repliedAt: new Date(), status: "REPLIED" },
  });

  revalidatePath(`/console/${gate}`);
  revalidatePath(`/console/${gate}/${id}`);

  const delivery = await sendReply({
    to: message.email,
    subject: message.subject
      ? `Re: ${message.subject}`
      : message.locale === "FR"
        ? "Votre message"
        : "Your message",
    body,
  });

  if (delivery.ok) {
    return { status: "sent" };
  }

  /* Saved either way, and the console says which happened, so nothing has to
     be rewritten if the send is the part that failed. */
  return { status: "saved" };
}
