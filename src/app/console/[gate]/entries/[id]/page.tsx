import { notFound } from "next/navigation";
import { requireConsole } from "@/lib/console";
import { deleteEntry, saveEntry } from "@/app/actions/records";
import { db } from "@/lib/db";
import { Shell, Head } from "@/components/console/shell";
import { Area, Choice, Switch, Text, day } from "@/components/console/fields";

/**
 * One entry, whole.
 *
 * Both languages and the kind specific fields on the same page rather than
 * behind tabs. An entry that exists in one language and not the other is
 * invisible in the other, and a tab is the easiest place in an interface to
 * forget something.
 *
 * The satellite fields for every kind are rendered and the action writes only
 * the one that matches, which keeps the form honest when the kind changes: the
 * values are already there rather than appearing after a save.
 */
export default async function Entry({
  params,
}: PageProps<"/console/[gate]/entries/[id]">) {
  const { gate, id } = await params;
  await requireConsole(gate);

  const creating = id === "new";

  const [entry, organizations, parents, highest] = await Promise.all([
    creating
      ? null
      : db.entry.findUnique({
          where: { id },
          include: {
            translations: true,
            project: true,
            world: true,
            position: true,
            credential: true,
          },
        }),
    db.organization.findMany({ orderBy: { name: "asc" } }),
    db.entry.findMany({
      where: { parentId: null },
      orderBy: { number: "asc" },
      include: { translations: { where: { locale: "FR" } } },
    }),
    db.entry.aggregate({ _max: { number: true } }),
  ]);

  if (!creating && !entry) {
    notFound();
  }

  const en = entry?.translations.find((row) => row.locale === "EN");
  const fr = entry?.translations.find((row) => row.locale === "FR");

  const organizationOptions = [
    { value: "", label: "Aucune" },
    ...organizations.map((org) => ({ value: org.id, label: org.name })),
  ];

  return (
    <Shell gate={gate} current="entries">
      <Head title={fr?.title ?? (creating ? "Nouvelle entrée" : entry!.slug)} />

      <form action={saveEntry} className="pb-16">
        <input type="hidden" name="gate" value={gate} />
        {entry ? <input type="hidden" name="id" value={entry.id} /> : null}

        <p className="t-meta text-accent">Classement</p>

        <div className="mt-6 grid gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
          <Text name="slug" label="Slug" value={entry?.slug} required />
          <Text
            name="number"
            label="Numéro"
            type="number"
            /* The next free number, since they are never reused. */
            value={String(entry?.number ?? (highest._max.number ?? 0) + 1)}
            required
          />
          <Choice
            name="kind"
            label="Type"
            value={entry?.kind ?? "PROJECT"}
            options={[
              { value: "PROJECT", label: "Projet" },
              { value: "WORLD", label: "Monde" },
              { value: "POSITION", label: "Poste" },
              { value: "CREDENTIAL", label: "Diplôme" },
              { value: "WRITING", label: "Écrit" },
            ]}
          />
          <Choice
            name="status"
            label="État"
            value={entry?.status ?? "DRAFT"}
            options={[
              { value: "DRAFT", label: "Brouillon" },
              { value: "PUBLISHED", label: "Publié" },
            ]}
          />
        </div>

        <div className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
          <Choice
            name="dimension"
            label="Dimension"
            value={entry?.dimension ?? ""}
            options={[
              { value: "", label: "Aucune" },
              { value: "BUILD", label: "Construire" },
              { value: "LEAD", label: "Diriger" },
              { value: "CREATE", label: "Créer" },
            ]}
          />
          <Choice
            name="accent"
            label="Accent"
            value={entry?.accent ?? "GOLD"}
            options={[
              { value: "GOLD", label: "Or" },
              { value: "CRIMSON", label: "Carmin" },
              { value: "VIOLET", label: "Violet, en aplat" },
            ]}
          />
          <Choice
            name="wear"
            label="Usure"
            value={entry?.wear ?? "CLEAN"}
            options={[
              { value: "CLEAN", label: "Net" },
              { value: "WORN", label: "Usé" },
            ]}
          />
          <Switch name="featured" label="En sélection" value={entry?.featured} />
        </div>

        <div className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
          <Choice
            name="parentId"
            label="Entrée parente"
            value={entry?.parentId ?? ""}
            options={[
              { value: "", label: "Aucune" },
              ...parents
                .filter((candidate) => candidate.id !== entry?.id)
                .map((candidate) => ({
                  value: candidate.id,
                  label: candidate.translations[0]?.title ?? candidate.slug,
                })),
            ]}
          />
          <Text
            name="rank"
            label="Rang dans le parent"
            type="number"
            value={String(entry?.rank ?? 0)}
          />
          <Text
            name="startedOn"
            label="Début"
            type="date"
            value={day(entry?.startedOn)}
          />
          <Text
            name="endedOn"
            label="Fin"
            type="date"
            value={day(entry?.endedOn)}
          />
        </div>

        <p className="t-meta text-accent mt-16">Français</p>

        <div className="mt-6 grid gap-x-12 gap-y-8">
          <Text name="frTitle" label="Titre" value={fr?.title} />
          <Area name="frSummary" label="Chapeau" rows={3} value={fr?.summary} />
          <Area
            name="frBody"
            label="Corps"
            rows={10}
            hint="une ligne vide sépare les paragraphes"
            value={fr?.body}
          />
          <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
            <Text name="frSeoTitle" label="Titre de recherche" value={fr?.seoTitle} />
            <Text
              name="frSeoDescription"
              label="Description de recherche"
              value={fr?.seoDescription}
            />
          </div>
        </div>

        <p className="t-meta text-accent mt-16">Anglais</p>

        <div className="mt-6 grid gap-x-12 gap-y-8">
          <Text name="enTitle" label="Titre" value={en?.title} />
          <Area name="enSummary" label="Chapeau" rows={3} value={en?.summary} />
          <Area
            name="enBody"
            label="Corps"
            rows={10}
            hint="une ligne vide sépare les paragraphes"
            value={en?.body}
          />
          <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
            <Text name="enSeoTitle" label="Titre de recherche" value={en?.seoTitle} />
            <Text
              name="enSeoDescription"
              label="Description de recherche"
              value={en?.seoDescription}
            />
          </div>
        </div>

        <p className="t-meta text-accent mt-16">Projet</p>

        <div className="mt-6 grid gap-x-12 gap-y-8 md:grid-cols-2">
          <Text
            name="repositoryUrl"
            label="Dépôt"
            value={entry?.project?.repositoryUrl}
          />
          <Text name="liveUrl" label="En ligne" value={entry?.project?.liveUrl} />
          <div className="md:col-span-2">
            <Text
              name="stack"
              label="Stack"
              hint="séparée par des virgules"
              value={entry?.project?.stack.join(", ")}
            />
          </div>
        </div>

        <p className="t-meta text-accent mt-16">Monde</p>

        <div className="mt-6">
          <Text
            name="era"
            label="Datation interne"
            hint="texte libre, les calendriers inventés ne sont pas des dates"
            value={entry?.world?.era}
          />
        </div>

        <p className="t-meta text-accent mt-16">Poste</p>

        <div className="mt-6 grid gap-x-12 gap-y-8 md:grid-cols-3">
          <Choice
            name="organizationId"
            label="Organisation"
            value={entry?.position?.organizationId ?? ""}
            options={organizationOptions}
          />
          <Text name="location" label="Lieu" value={entry?.position?.location} />
          <Switch
            name="remote"
            label="Télétravail"
            value={entry?.position?.remote}
          />
        </div>

        <p className="t-meta text-accent mt-16">Diplôme ou certification</p>

        <div className="mt-6 grid gap-x-12 gap-y-8 md:grid-cols-3">
          <Choice
            name="issuerId"
            label="Délivré par"
            value={entry?.credential?.issuerId ?? ""}
            options={organizationOptions}
          />
          <Choice
            name="credentialKind"
            label="Nature"
            value={entry?.credential?.kind ?? "DEGREE"}
            options={[
              { value: "DEGREE", label: "Diplôme" },
              { value: "CERTIFICATION", label: "Certification" },
              { value: "COURSE", label: "Formation" },
              { value: "AWARD", label: "Distinction" },
            ]}
          />
          <Text
            name="issuedOn"
            label="Obtenu le"
            type="date"
            value={day(entry?.credential?.issuedOn)}
          />
          <Text
            name="expiresOn"
            label="Expire le"
            type="date"
            value={day(entry?.credential?.expiresOn)}
          />
          <Text
            name="reference"
            label="Référence"
            value={entry?.credential?.reference}
          />
          <Text
            name="verifyUrl"
            label="Vérification"
            value={entry?.credential?.verifyUrl}
          />
        </div>

        <div className="mt-16">
          <button
            type="submit"
            className="stamp stamp-solid"
            style={{ "--stamp-angle": "-1.5deg" } as React.CSSProperties}
          >
            <span className="stamp-label">Enregistrer</span>
          </button>
        </div>
      </form>

      {entry ? (
        <form action={deleteEntry} className="border-rule border-t pt-8">
          <input type="hidden" name="gate" value={gate} />
          <input type="hidden" name="id" value={entry.id} />
          <button
            type="submit"
            className="t-meta text-content-muted hover:text-energy transition-colors"
          >
            Supprimer cette entrée
          </button>
          <p className="t-meta text-content-muted measure mt-3">
            Les entrées enfants sont détachées, pas supprimées.
          </p>
        </form>
      ) : null}
    </Shell>
  );
}
