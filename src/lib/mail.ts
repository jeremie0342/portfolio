import "server-only";

import { Resend } from "resend";

/**
 * Outgoing mail.
 *
 * Optional by design. Without a key the console still reads, marks and files
 * messages, and a reply written there is stored and can be sent from any mail
 * client; with a key the reply leaves from here. Nothing about the inbox
 * depends on a third party being reachable.
 *
 * The sender address has to be on a domain verified with Resend, which is why
 * it is configured rather than derived from the contact address.
 */

export type Delivery =
  | { ok: true; id: string | null }
  | { ok: false; reason: "unconfigured" | "rejected" };

export async function sendReply({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}): Promise<Delivery> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!key || !from) {
    return { ok: false, reason: "unconfigured" };
  }

  try {
    const resend = new Resend(key);

    const sent = await resend.emails.send({
      from,
      to,
      subject,
      text: body,
      /* A reply goes to the person, and their answer should come back to the
         address that is read every day rather than to the sending domain. */
      replyTo: process.env.MAIL_REPLY_TO ?? from,
    });

    if (sent.error) {
      return { ok: false, reason: "rejected" };
    }

    return { ok: true, id: sent.data?.id ?? null };
  } catch {
    return { ok: false, reason: "rejected" };
  }
}
