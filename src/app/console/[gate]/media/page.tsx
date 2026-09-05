import { requireConsole } from "@/lib/console";
import { deleteMedia, saveMedia, uploadMedia } from "@/app/actions/records";
import { db } from "@/lib/db";
import { isConfigured, publicUrl } from "@/lib/media";
import { Shell, Head } from "@/components/console/shell";
import { Text } from "@/components/console/fields";

/**
 * Media.
 *
 * The alternative text is asked for on the same screen as the file, in both
 * languages, because it is the field everyone means to fill in later and nobody
 * does. An image whose alt is empty is announced by a screen reader as a
 * filename, and the filename here is twenty four hexadecimal characters.
 *
 * Each row says what uses it. Deleting an image that a page still points at
 * would leave a hole nobody notices until someone opens that page.
 */
export default async function Media({
  params,
}: PageProps<"/console/[gate]/media">) {
  const { gate } = await params;
  await requireConsole(gate);

  const configured = isConfigured();

  const media = await db.media.findMany({
    orderBy: { id: "desc" },
    include: {
      translations: true,
      _count: { select: { coverOf: true, usedIn: true } },
    },
  });

  return (
    <Shell gate={gate} current="media">
      <Head title="Médias" count={media.length} />

      {configured ? (
        <form
          action={uploadMedia}
          className="border-rule flex flex-wrap items-end gap-x-10 gap-y-6 border-t pt-8"
        >
          <input type="hidden" name="gate" value={gate} />

          <div>
            <label htmlFor="file" className="t-meta text-content-muted">
              Fichier
              <span className="text-content-muted">
                {" "}
                jpeg, png, webp ou avif, 12 Mo au plus
              </span>
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required
              className="t-register border-rule mt-3 block w-full border-b pb-3 outline-none"
            />
          </div>

          <button
            type="submit"
            className="stamp stamp-solid"
            style={{ "--stamp-angle": "-1.5deg" } as React.CSSProperties}
          >
            <span className="stamp-label">Téléverser</span>
          </button>
        </form>
      ) : (
        <p className="t-register text-content-muted measure border-rule border-t pt-8">
          Le stockage n’est pas configuré. Renseignez MINIO_ENDPOINT,
          MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET et MINIO_PUBLIC_URL
          pour téléverser des images. Les fiches existantes restent modifiables.
        </p>
      )}

      <div className="mt-16">
        {media.map((item) => {
          const en = item.translations.find((row) => row.locale === "EN");
          const fr = item.translations.find((row) => row.locale === "FR");
          const used = item._count.coverOf + item._count.usedIn;

          return (
            <div
              key={item.id}
              className="border-rule grid gap-x-10 gap-y-6 border-t py-8 lg:grid-cols-[12rem_1fr]"
            >
              <div>
                {/* A plain img, not next/image. This is a proof sheet: the
                    point is to see which file a row refers to, and running it
                    through the optimiser would cost a transform per thumbnail
                    for an audience of one. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicUrl(item.path)}
                  alt={fr?.alt || item.path}
                  width={item.width}
                  height={item.height}
                  className="border-rule w-full border object-cover"
                  style={{ aspectRatio: "4 / 3" }}
                />

                <p className="t-meta text-content-muted mt-3">
                  {item.width} × {item.height}
                  <span className="block">
                    {used} usage{used === 1 ? "" : "s"}
                  </span>
                </p>
              </div>

              <div>
                <form
                  action={saveMedia}
                  className="grid gap-x-10 gap-y-6 md:grid-cols-2"
                >
                  <input type="hidden" name="gate" value={gate} />
                  <input type="hidden" name="id" value={item.id} />

                  <Text
                    name="frAlt"
                    label="Texte alternatif, français"
                    value={fr?.alt}
                    required
                  />
                  <Text
                    name="enAlt"
                    label="Texte alternatif, anglais"
                    value={en?.alt}
                    required
                  />
                  <Text
                    name="frCaption"
                    label="Légende, français"
                    value={fr?.caption}
                  />
                  <Text
                    name="enCaption"
                    label="Légende, anglais"
                    value={en?.caption}
                  />

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="t-meta text-accent hover:text-content transition-colors"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>

                {used === 0 ? (
                  <form action={deleteMedia} className="mt-6">
                    <input type="hidden" name="gate" value={gate} />
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="t-meta text-content-muted hover:text-energy transition-colors"
                    >
                      Supprimer le fichier et sa fiche
                    </button>
                  </form>
                ) : (
                  <p className="t-meta text-content-muted mt-6">
                    Utilisé par une entrée, donc non supprimable.
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {media.length === 0 ? (
          <p className="t-register text-content-muted border-rule border-t py-8">
            Aucun média.
          </p>
        ) : null}
      </div>
    </Shell>
  );
}
