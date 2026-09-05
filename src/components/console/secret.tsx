"use client";

import { useState } from "react";

/**
 * A password field that can be read.
 *
 * Hiding what someone types is a defence against a person standing behind them,
 * which is a real threat in an office and almost never one at a desk at home.
 * It costs an error rate on every entry, and the usual answer to that error
 * rate is a shorter password. Showing it is the option, hidden is the default,
 * and the reader decides which risk applies to the room they are in.
 *
 * The control is a button rather than a checkbox so that it never lands in the
 * tab order between the two fields, where it would be pressed by accident on
 * the way to the confirmation.
 */
export function Secret({
  name,
  label,
  autoComplete = "new-password",
}: {
  name: string;
  label: string;
  autoComplete?: string;
}) {
  const [shown, setShown] = useState(false);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={name} className="t-meta text-content-muted">
          {label}
        </label>

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShown((current) => !current)}
          className="t-meta text-content-muted hover:text-accent transition-colors"
        >
          {shown ? "Masquer" : "Afficher"}
        </button>
      </div>

      <input
        id={name}
        name={name}
        type={shown ? "text" : "password"}
        autoComplete={autoComplete}
        required
        className="t-register focus:border-accent border-rule mt-3 block w-full border-b bg-transparent pb-3 outline-none"
      />
    </div>
  );
}
