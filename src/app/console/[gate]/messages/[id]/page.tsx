import { notFound } from "next/navigation";
import { setStatus } from "@/app/actions/console";
import { requireConsole } from "@/lib/console";
import { Shell, Head } from "@/components/console/shell";
import { db } from "@/lib/db";
import { ReplyForm } from "@/components/console/reply-form";

const filings = [
  { status: "READ", label: "Lu" },
  { status: "ARCHIVED", label: "Archiver" },
  { status: "SPAM", label: "Indésirable" },
  { status: "NEW", label: "Remettre en nouveau" },
] as const;

export default async function Message({
  params,
}: PageProps<"/console/[gate]/messages/[id]">) {
  const { gate, id } = await params;
  await requireConsole(gate);

  const message = await db.message.findUnique({ where: { id } });

  if (!message) {
    notFound();
  }

  return (
    <Shell gate={gate} current="messages">
      <Head
        title={message.subject ?? message.name}
        action={<span className="t-meta text-accent">{message.status}</span>}
      />

      <section>
        <p className="t-meta text-accent">
          {message.createdAt.toISOString().slice(0, 16).replace("T", " ")}
          <span className="text-content-muted"> {message.locale}</span>
        </p>

        <p className="t-register text-content-muted mt-4">
          {message.name}{" "}
          <a
            href={`mailto:${message.email}`}
            className="decoration-accent hover:text-accent underline underline-offset-4 transition-colors"
          >
            {message.email}
          </a>
        </p>

        {/* Whitespace preserved. Someone wrote this in paragraphs and reading
            it as one block is a small disrespect and a real inconvenience. */}
        <p className="measure text-body-l mt-10 whitespace-pre-wrap">
          {message.body}
        </p>
      </section>

      <section className="mt-(--spacing-section)">
        <p className="t-meta text-accent">Classer</p>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          {filings
            .filter((filing) => filing.status !== message.status)
            .map((filing) => (
              <form key={filing.status} action={setStatus}>
                <input type="hidden" name="gate" value={gate} />
                <input type="hidden" name="id" value={message.id} />
                <input type="hidden" name="status" value={filing.status} />
                <button
                  type="submit"
                  className="t-meta text-content-muted hover:text-accent transition-colors"
                >
                  {filing.label}
                </button>
              </form>
            ))}
        </div>
      </section>

      <section className="mt-(--spacing-section)">
        {message.repliedAt ? (
          <p className="t-meta text-accent">
            Répondu le {message.repliedAt.toISOString().slice(0, 10)}
          </p>
        ) : null}

        <ReplyForm gate={gate} id={message.id} existing={message.reply} />
      </section>
    </Shell>
  );
}
