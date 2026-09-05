import { requireConsole } from "@/lib/console";
import { deleteProfile, saveProfile } from "@/app/actions/records";
import { db } from "@/lib/db";
import { Shell, Head } from "@/components/console/shell";
import { Switch, Text } from "@/components/console/fields";

/**
 * Public profiles.
 *
 * These were a constant in the source until now, which meant opening an account
 * required a deployment. They move on their own schedule, so they belong where
 * they can be edited on it.
 *
 * Unlisting rather than deleting is the usual move: a dormant account stays on
 * record without being advertised, and the structured data stops claiming it.
 */
export default async function Profiles({
  params,
}: PageProps<"/console/[gate]/profiles">) {
  const { gate } = await params;
  await requireConsole(gate);

  const profiles = await db.profile.findMany({
    orderBy: [{ rank: "asc" }, { label: "asc" }],
  });

  return (
    <Shell gate={gate} current="profiles">
      <Head title="Profils" count={profiles.length} />

      <div>
        {profiles.map((profile) => (
          <form
            key={profile.id}
            action={saveProfile}
            className="border-rule grid gap-x-10 gap-y-6 border-t py-8 md:grid-cols-[1fr_1fr_2fr_6rem_auto_auto]"
          >
            <input type="hidden" name="gate" value={gate} />
            <input type="hidden" name="id" value={profile.id} />

            <Text name="label" label="Nom" value={profile.label} required />
            <Text name="handle" label="Identifiant" value={profile.handle} />
            <Text name="url" label="Adresse" value={profile.url} required />
            <Text
              name="rank"
              label="Rang"
              type="number"
              value={String(profile.rank)}
            />

            <Switch name="listed" label="Affiché" value={profile.listed} />

            <div className="flex items-end gap-6 pb-1">
              <button
                type="submit"
                className="t-meta text-accent hover:text-content transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </form>
        ))}
      </div>

      <div className="border-rule mt-16 border-t pt-10">
        <form
          action={saveProfile}
          className="grid gap-x-10 gap-y-6 md:grid-cols-[1fr_1fr_2fr_6rem_auto]"
        >
          <input type="hidden" name="gate" value={gate} />
          <input type="hidden" name="listed" value="on" />

          <Text name="label" label="Nouveau profil" required />
          <Text name="handle" label="Identifiant" />
          <Text name="url" label="Adresse" required />
          <Text name="rank" label="Rang" type="number" value="0" />

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
      </div>

      {profiles.length > 0 ? (
        <div className="mt-16">
          <p className="t-meta text-accent">Supprimer définitivement</p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {profiles.map((profile) => (
              <form key={profile.id} action={deleteProfile}>
                <input type="hidden" name="gate" value={gate} />
                <input type="hidden" name="id" value={profile.id} />
                <button
                  type="submit"
                  className="t-meta text-content-muted hover:text-energy transition-colors"
                >
                  {profile.label}
                </button>
              </form>
            ))}
          </div>
        </div>
      ) : null}
    </Shell>
  );
}
