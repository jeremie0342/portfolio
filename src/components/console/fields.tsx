/**
 * Form fields for the console.
 *
 * Server components, deliberately. Nothing here needs state: a form posts to an
 * action and the page comes back rendered, which is the whole point of using
 * them. Marking these as client components would ship a bundle to move a
 * cursor between two inputs.
 *
 * The styling is the site's own field grammar, a label above and a rule under,
 * so the console reads like the archive rather than like a control panel.
 */

const base =
  "t-register focus:border-accent border-rule mt-3 block w-full border-b bg-transparent pb-3 outline-none";

export function Text({
  name,
  label,
  value,
  hint,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  value?: string | null;
  hint?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="t-meta text-content-muted">
        {label}
        {hint ? <span className="text-content-muted"> {hint}</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={value ?? ""}
        className={base}
      />
    </div>
  );
}

export function Area({
  name,
  label,
  value,
  rows = 6,
  hint,
}: {
  name: string;
  label: string;
  value?: string | null;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="t-meta text-content-muted">
        {label}
        {hint ? <span className="text-content-muted"> {hint}</span> : null}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={value ?? ""}
        className={`${base} resize-y`}
      />
    </div>
  );
}

export function Choice({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string | null;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={name} className="t-meta text-content-muted">
        {label}
      </label>
      {/* The native control. A custom one would have to reimplement keyboard
          handling, typeahead and the mobile picker, and would be worse at all
          three. */}
      <select
        id={name}
        name={name}
        defaultValue={value ?? ""}
        className={`${base} appearance-none`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Switch({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value?: boolean;
}) {
  return (
    <label className="t-register flex items-center gap-3 pt-8">
      <input
        type="checkbox"
        name={name}
        defaultChecked={value}
        className="accent-accent size-4"
      />
      {label}
    </label>
  );
}

/** A date the database stores as a day, rendered for a date input. */
export function day(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}
