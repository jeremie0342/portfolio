import { requireConsole } from "@/lib/console";
import { deleteOrganization, saveOrganization } from "@/app/actions/records";
import { db } from "@/lib/db";
import { Shell, Head } from "@/components/console/shell";
import { Text } from "@/components/console/fields";

/**
 * Organisations, edited in place.
 *
 * A list with a form on every row rather than a page each. There are four of
 * them and three fields apiece; a detail page would be a click and a load to
 * change a URL.
 *
 * Each row counts what depends on it, and the delete refuses while that count
 * is above zero. An organisation attached to a position or a degree is
 * load-bearing, and removing it would take the entry with it.
 */
export default async function Organizations({
  params,
}: PageProps<"/console/[gate]/organizations">) {
  const { gate } = await params;
  await requireConsole(gate);

  const organizations = await db.organization.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { positions: true, credentials: true } } },
  });

  return (
    <Shell gate={gate} current="organizations">
      <Head title="Organisations" count={organizations.length} />

      <div>
        {organizations.map((organization) => {
          const used =
            organization._count.positions + organization._count.credentials;

          return (
            <div
              key={organization.id}
              className="border-rule grid gap-x-10 gap-y-6 border-t py-8 lg:grid-cols-[1fr_auto]"
            >
              <form
                action={saveOrganization}
                className="grid gap-x-10 gap-y-6 md:grid-cols-4"
              >
                <input type="hidden" name="gate" value={gate} />
                <input type="hidden" name="id" value={organization.id} />

                <Text name="name" label="Nom" value={organization.name} required />
                <Text name="url" label="Site" value={organization.url} />
                <Text name="country" label="Pays" value={organization.country} />

                <div className="flex items-end pb-1">
                  <button
                    type="submit"
                    className="t-meta text-accent hover:text-content transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>

              <div className="flex items-end gap-6 pb-1">
                <span className="t-meta text-content-muted">
                  {used} rattachement{used === 1 ? "" : "s"}
                </span>

                {used === 0 ? (
                  <form action={deleteOrganization}>
                    <input type="hidden" name="gate" value={gate} />
                    <input type="hidden" name="id" value={organization.id} />
                    <button
                      type="submit"
                      className="t-meta text-content-muted hover:text-energy transition-colors"
                    >
                      Supprimer
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <form
        action={saveOrganization}
        className="border-rule mt-16 grid gap-x-10 gap-y-6 border-t pt-10 md:grid-cols-4"
      >
        <input type="hidden" name="gate" value={gate} />

        <Text name="name" label="Nouvelle organisation" required />
        <Text name="url" label="Site" />
        <Text name="country" label="Pays" />

        <div className="flex items-end pb-1">
          <button
            type="submit"
            className="stamp stamp-solid"
            style={{ "--stamp-angle": "-1.5deg" } as React.CSSProperties}
          >
            <span className="stamp-label">Ajouter</span>
          </button>
        </div>
      </form>
    </Shell>
  );
}
