"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendMessage, type ContactState } from "@/app/actions/contact";

/**
 * The contact form.
 *
 * Plain fields on the page's own ground rather than boxes drawn to look like
 * inputs. A rule under each one and a label above it: the same grammar the
 * archive uses for a field, so the form reads as part of the document instead
 * of as a widget dropped into it.
 *
 * Two of the inputs are not for the reader. One is a hidden field only
 * something reading the markup will fill, and the other records when the form
 * appeared so a submission arriving three seconds later can be treated as what
 * it is. Both are described in the action.
 */

const initial: ContactState = { status: "idle" };

export function ContactForm({
  locale,
  labels,
}: {
  locale: string;
  labels: {
    name: string;
    email: string;
    subject: string;
    optional: string;
    body: string;
    send: string;
    sending: string;
    sent: string;
    invalid: string;
    failed: string;
    privacy: string;
  };
}) {
  const [state, action, pending] = useActionState(sendMessage, initial);
  const form = useRef<HTMLFormElement>(null);
  const opened = useRef<HTMLInputElement>(null);

  /* Written to the field rather than held in state. The value belongs to the
     DOM, and routing it through a render would only reach the same input one
     pass later.

     Stamped on the client too: a statically generated page would otherwise
     carry its build time, and every visitor would look as though they had had
     the form open for weeks. */
  function stamp() {
    if (opened.current) {
      opened.current.value = String(Date.now());
    }
  }

  useEffect(stamp, []);

  useEffect(() => {
    if (state.status === "sent") {
      /* A reset returns the hidden field to its empty default, so the clock
         has to be restarted or the next message would look automated. */
      form.current?.reset();
      stamp();
    }
  }, [state.status]);

  const invalid = state.status === "invalid" ? state.fields : undefined;

  return (
    <form ref={form} action={action} className="mt-10">
      <input type="hidden" name="locale" value={locale} />
      <input ref={opened} type="hidden" name="opened" />

      {/* Not for people. aria-hidden and off the tab order, so a screen reader
          never meets it and a keyboard never lands on it. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
        <Field
          name="name"
          label={labels.name}
          autoComplete="name"
          invalid={invalid?.name}
        />
        <Field
          name="email"
          label={labels.email}
          type="email"
          autoComplete="email"
          invalid={invalid?.email}
        />
      </div>

      <div className="mt-8">
        <Field
          name="subject"
          label={`${labels.subject} ${labels.optional}`}
          autoComplete="off"
        />
      </div>

      <div className="mt-8">
        <label htmlFor="body" className="t-meta text-content-muted">
          {labels.body}
        </label>
        <textarea
          id="body"
          name="body"
          rows={7}
          required
          aria-invalid={invalid?.body ? true : undefined}
          className={`t-register mt-3 block w-full resize-y border-b bg-transparent pb-3 outline-none focus:border-accent ${
            invalid?.body ? "border-energy" : "border-rule"
          }`}
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <button
          type="submit"
          disabled={pending}
          className="stamp stamp-solid disabled:opacity-60"
          style={{ "--stamp-angle": "-1.5deg" } as React.CSSProperties}
        >
          <span className="stamp-label">
            {pending ? labels.sending : labels.send}
          </span>
        </button>

        {/* One line, in the register voice, replacing itself rather than
            stacking. A form that keeps its old errors on screen makes the
            reader work out which one is current. */}
        <p aria-live="polite" className="t-register text-content-muted">
          {state.status === "sent" ? labels.sent : null}
          {state.status === "invalid" ? labels.invalid : null}
          {state.status === "failed" ? labels.failed : null}
        </p>
      </div>

      <p className="measure t-meta text-content-muted mt-10">
        {labels.privacy}
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  invalid,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  invalid?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="t-meta text-content-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={invalid ? true : undefined}
        className={`t-register mt-3 block w-full border-b bg-transparent pb-3 outline-none focus:border-accent ${
          invalid ? "border-energy" : "border-rule"
        }`}
      />
    </div>
  );
}
