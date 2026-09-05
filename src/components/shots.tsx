import Image, { type StaticImageData } from "next/image";
import { getTranslations } from "next-intl/server";

import ubbfyDashboard from "@/assets/shots/ubbfy-dashboard.webp";
import ubbfyRoles from "@/assets/shots/ubbfy-roles.webp";
import skilluvOpening from "@/assets/shots/skilluv-opening.webp";
import skilluvDisciplines from "@/assets/shots/skilluv-disciplines.webp";
import yaraCard from "@/assets/shots/yara-card.webp";

/**
 * Screens, keyed by the entry they belong to.
 *
 * These are fixed assets rather than uploads: five images of software that has
 * already shipped, which will change when the software does and not before.
 * Imported rather than served from the public directory so that the build
 * knows their size and can hold the space before they arrive, and so that a
 * missing file is a build error rather than a hole in a page.
 *
 * Anything that turns over belongs in the media library and the console. This
 * is the other case, and pretending otherwise would mean an object store as a
 * dependency for five files that are already in the repository.
 */

const shots: Record<string, { image: StaticImageData; key: string }[]> = {
  ubbfy: [
    { image: ubbfyDashboard, key: "ubbfyDashboard" },
    { image: ubbfyRoles, key: "ubbfyRoles" },
  ],
  skilluv: [
    { image: skilluvOpening, key: "skilluvOpening" },
    { image: skilluvDisciplines, key: "skilluvDisciplines" },
  ],
  yara: [{ image: yaraCard, key: "yaraCard" }],
};

export async function Shots({ slug }: { slug: string }) {
  const set = shots[slug];

  if (!set) {
    return null;
  }

  const t = await getTranslations("shots");

  return (
    <div className="mt-16">
      {set.map(({ image, key }) => (
        <figure key={key} className="mt-12">
          {/* The frame is a hairline rather than a shadow. A screenshot of an
              interface already carries its own edges, and a second set of them
              in another style reads as a mistake. */}
          <Image
            src={image}
            alt={t(`${key}.alt`)}
            placeholder="blur"
            sizes="(min-width: 1280px) 1100px, 100vw"
            className="border-rule w-full border"
          />

          <figcaption className="measure t-register text-content-muted mt-4">
            {t(`${key}.caption`)}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
