import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * The share card.
 *
 * What a link to this site looks like on LinkedIn, on X, in a message. It is
 * the only part of the site most people will ever see, so it is set in the
 * same type on the same ground as the page it points at rather than in
 * whatever a generator would have chosen.
 *
 * The typefaces are read from disk at build time. Satori cannot decompress
 * woff2, so these are separate OTF cuts subset to Latin: 58 KB together, and
 * they never reach a browser, since the image is rendered on the server and
 * shipped as a PNG.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ink = "#0B0A0C";
const ivory = "#F3EFE6";
const gold = "#C49A5A";
const crimson = "#A92532";

async function typefaces() {
  const dir = join(process.cwd(), "src/fonts/og");

  const [display, meta] = await Promise.all([
    readFile(join(dir, "Redaction10.otf")),
    readFile(join(dir, "SligoilMicro.otf")),
  ]);

  return [
    { name: "Redaction", data: display, style: "normal" as const, weight: 400 as const },
    { name: "Sligoil", data: meta, style: "normal" as const, weight: 400 as const },
  ];
}

/** Cut at a word boundary. A card that ends mid-word reads as broken rather
    than as abbreviated. */
export function trim(text: string, limit: number) {
  if (text.length <= limit) {
    return text;
  }

  const cut = text.slice(0, limit);
  const boundary = cut.lastIndexOf(" ");

  return `${cut.slice(0, boundary > 0 ? boundary : limit).replace(/[,.;:]$/, "")}…`;
}

export async function shareImage({
  eyebrow,
  mark,
  title,
  footnote,
  stamp,
  accent = gold,
}: {
  eyebrow: string;
  mark: string;
  title: string;
  footnote: string;
  stamp: string;
  accent?: "gold" | "crimson" | string;
}) {
  const tone = accent === "crimson" ? crimson : accent === "gold" ? gold : accent;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: ink,
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Sligoil",
            fontSize: 24,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: tone,
          }}
        >
          <span>{eyebrow}</span>
          <span style={{ color: ivory, opacity: 0.55 }}>{mark}</span>
        </div>

        {/* Held to four lines at this size. A share card that has to be read
            twice has already failed. */}
        <div
          style={{
            display: "flex",
            fontFamily: "Redaction",
            fontSize: title.length > 58 ? 76 : 104,
            lineHeight: 1.02,
            letterSpacing: -1,
            color: ivory,
            maxWidth: 960,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Sligoil",
            fontSize: 22,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: ivory,
            opacity: 0.7,
          }}
        >
          {/* One line, always. The left slot is given room, the right one
              refuses to give any, and nowrap makes the trim above the only
              thing that decides where the sentence ends. */}
          <span style={{ maxWidth: 820, whiteSpace: "nowrap" }}>{footnote}</span>
          <span style={{ color: tone, opacity: 1, flexShrink: 0 }}>{stamp}</span>
        </div>
      </div>
    ),
    { ...size, fonts: await typefaces() },
  );
}
