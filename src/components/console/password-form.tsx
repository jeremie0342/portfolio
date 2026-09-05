"use client";

import { useActionState } from "react";
import { setPassword, type PasswordState } from "@/app/actions/console";
import { Secret } from "./secret";

const initial: PasswordState = { status: "idle" };

const messages: Record<PasswordState["status"], string | null> = {
  idle: null,
  changed: null,
  tooShort: "Douze caractères au minimum.",
  mismatch: "Les deux saisies diffèrent.",
  reused: "C’est le mot de passe actuel. Il faut en choisir un autre.",
  missing: "Aucun compte à modifier sur ce déploiement.",
};

export function PasswordForm({
  gate,
  first,
}: {
  gate: string;
  first: boolean;
}) {
  const [state, action, pending] = useActionState(setPassword, initial);

  return (
    <form action={action} className="mt-10 max-w-md">
      <input type="hidden" name="gate" value={gate} />

      <div className="grid gap-y-8">
        <Secret name="password" label="Nouveau mot de passe" />
        <Secret name="confirmation" label="Confirmation" />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <button
          type="submit"
          disabled={pending}
          className="stamp stamp-solid disabled:opacity-60"
          style={{ "--stamp-angle": "-1.5deg" } as React.CSSProperties}
        >
          <span className="stamp-label">
            {pending ? "Enregistrement" : first ? "Définir" : "Changer"}
          </span>
        </button>

        <p aria-live="polite" className="t-register text-content-muted">
          {messages[state.status]}
        </p>
      </div>
    </form>
  );
}
