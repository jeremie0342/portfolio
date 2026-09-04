"use client";

import { useActionState } from "react";
import { replyTo, type ReplyState } from "@/app/actions/console";

const initial: ReplyState = { status: "idle" };

/**
 * The reply.
 *
 * The message is recorded before it is sent, so the outcome has three states
 * rather than two: sent, saved but not sent, and nothing written at all. The
 * middle one is the reason this is worth saying out loud. A reply that exists
 * in the database and not in an inbox can be copied out of here; one that was
 * lost because a mail provider was down cannot.
 */
export function ReplyForm({
  gate,
  id,
  existing,
}: {
  gate: string;
  id: string;
  existing: string | null;
}) {
  const [state, action, pending] = useActionState(replyTo, initial);

  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="gate" value={gate} />
      <input type="hidden" name="id" value={id} />

      <label htmlFor="reply" className="t-meta text-content-muted">
        Réponse
      </label>

      <textarea
        id="reply"
        name="reply"
        rows={9}
        defaultValue={existing ?? ""}
        className="t-register focus:border-accent border-rule mt-3 block w-full resize-y border-b bg-transparent pb-3 outline-none"
      />

      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
        <button
          type="submit"
          disabled={pending}
          className="stamp stamp-solid disabled:opacity-60"
          style={{ "--stamp-angle": "-1.5deg" } as React.CSSProperties}
        >
          <span className="stamp-label">{pending ? "Envoi" : "Répondre"}</span>
        </button>

        <p aria-live="polite" className="t-register text-content-muted">
          {state.status === "sent" ? "Envoyée et enregistrée." : null}
          {state.status === "saved"
            ? "Enregistrée. L’envoi n’a pas abouti, le courriel reste à faire partir à la main."
            : null}
          {state.status === "empty" ? "Rien à envoyer." : null}
          {state.status === "failed" ? "Message introuvable." : null}
        </p>
      </div>
    </form>
  );
}
