"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/app/actions/console";

const initial: SignInState = { status: "idle" };

/**
 * The login form.
 *
 * One field. There is one account, so asking for its name would be asking the
 * reader to remember something that has only one possible answer.
 *
 * The failure message never distinguishes a wrong password from a rate limit
 * or a misconfigured deployment, because each of those tells a stranger
 * something about the state of the door.
 */
export function SignIn({ gate }: { gate: string }) {
  const [state, action, pending] = useActionState(signIn, initial);

  return (
    <form action={action} className="mt-10 max-w-sm">
      <input type="hidden" name="gate" value={gate} />

      <label htmlFor="password" className="t-meta text-content-muted">
        Mot de passe
      </label>

      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        className="t-register focus:border-accent border-rule mt-3 block w-full border-b bg-transparent pb-3 outline-none"
      />

      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <button
          type="submit"
          disabled={pending}
          className="stamp stamp-solid disabled:opacity-60"
          style={{ "--stamp-angle": "-1.5deg" } as React.CSSProperties}
        >
          <span className="stamp-label">{pending ? "Ouverture" : "Entrer"}</span>
        </button>

        <p aria-live="polite" className="t-register text-content-muted">
          {state.status === "wrong" ? "Accès refusé." : null}
          {state.status === "unconfigured"
            ? "Console non configurée sur ce déploiement."
            : null}
        </p>
      </div>
    </form>
  );
}
