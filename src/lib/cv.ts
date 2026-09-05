import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import {
  listArchive,
  listCredentials,
  listPositions,
  listSelected,
  listProfiles,
  type CareerRecord,
} from "./entries";
import { contact } from "./contact";
import { skills } from "./skills";
import { siteUrl } from "./site";

/**
 * The curriculum vitae, drawn from the same database as the pages.
 *
 * A recruiter's first move is to forward a candidate internally, and what gets
 * forwarded is a file. A page cannot be attached to an email, so the site
 * carries a real document; generating it from the archive rather than keeping
 * a copy in a drawer means it cannot fall behind the site, which is the way
 * every hand maintained CV eventually dies.
 *
 * Laid out by hand rather than through a rendering engine. A page of type in
 * two columns is a few measurements, and the alternative is a second layout
 * system to keep in step with the first.
 */

/* A4, in points, which is the only unit a PDF has. */
const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 54;
const COLUMN = 96; // the dated gutter on the left of every entry
const WIDTH = PAGE.width - MARGIN * 2;

const INK = rgb(0.043, 0.039, 0.047);
const GOLD = rgb(0.494, 0.373, 0.157);
const STONE = rgb(0.42, 0.392, 0.361);

type Faces = {
  display: PDFFont;
  meta: PDFFont;
  text: PDFFont;
  strong: PDFFont;
};

async function faces(pdf: PDFDocument): Promise<Faces> {
  const dir = join(process.cwd(), "src/fonts");

  const [display, meta, text, strong] = await Promise.all([
    readFile(join(dir, "og/Redaction10.otf")),
    readFile(join(dir, "og/SligoilMicro.otf")),
    readFile(join(dir, "pdf/Author-Regular.ttf")),
    readFile(join(dir, "pdf/Author-Semibold.ttf")),
  ]);

  return {
    /* The two OpenType faces are embedded whole. Subsetting them produces a
       CFF table that some readers refuse to load, and a curriculum vitae that
       renders in a substitute font on the reader a recruiter happens to use is
       not worth the forty kilobytes saved. The TrueType pair subsets safely. */
    display: await pdf.embedFont(display, { subset: false }),
    meta: await pdf.embedFont(meta, { subset: false }),
    text: await pdf.embedFont(text, { subset: true }),
    strong: await pdf.embedFont(strong, { subset: true }),
  };
}

/**
 * Breaks a paragraph to a width.
 *
 * A PDF has no line boxes: text is placed at a coordinate and stays there, so
 * wrapping is the caller's job and has to be measured against the same font
 * that will draw it.
 */
function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  let line = "";

  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, size) > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

/** A page and the pen on it, so that a section does not have to track both. */
class Sheet {
  private page: PDFPage;
  y: number;

  constructor(
    private pdf: PDFDocument,
    private f: Faces,
  ) {
    this.page = pdf.addPage([PAGE.width, PAGE.height]);
    this.y = PAGE.height - MARGIN;
  }

  /* Starts a new page when the next block would not fit whole. Breaking a
     three line summary across a page turn is worse than a short page. */
  private room(height: number) {
    if (this.y - height < MARGIN + 24) {
      this.page = this.pdf.addPage([PAGE.width, PAGE.height]);
      this.y = PAGE.height - MARGIN;
    }
  }

  text(
    value: string,
    options: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      x?: number;
      lead?: number;
      width?: number;
    } = {},
  ) {
    const font = options.font ?? this.f.text;
    const size = options.size ?? 9.5;
    const lead = options.lead ?? size * 1.45;
    const x = options.x ?? MARGIN;
    const width = options.width ?? WIDTH - (x - MARGIN);
    const lines = wrap(value, font, size, width);

    this.room(lines.length * lead);

    for (const line of lines) {
      this.page.drawText(line, {
        x,
        y: this.y - size,
        font,
        size,
        color: options.color ?? INK,
      });
      this.y -= lead;
    }
  }

  /**
   * Draws a line of text with letter spacing.
   *
   * pdf-lib places a run at a coordinate and has no notion of tracking, so
   * the letters are placed one at a time. The meta face is only ever used
   * here for a handful of short labels, and those labels are unreadable at
   * seven points without the air the site gives them on screen.
   */
  private tracked(
    value: string,
    x: number,
    y: number,
    size: number,
    color: ReturnType<typeof rgb>,
    tracking = 0.9,
  ) {
    let pen = x;

    for (const glyph of value) {
      this.page.drawText(glyph, { x: pen, y, font: this.f.meta, size, color });
      pen += this.f.meta.widthOfTextAtSize(glyph, size) + tracking;
    }
  }

  /** A section label, gold, over a hairline. */
  section(label: string) {
    /* Enough for the label, the rule and the first record under it. A heading
       alone at the foot of a page is the classic failure of a hand written
       layout, and the only cure is to reserve the block rather than the
       line. */
    this.room(120);
    this.y -= 22;

    this.tracked(label.toUpperCase(), MARGIN, this.y - 8, 7.5, GOLD);

    this.y -= 16;
    this.rule();
    this.y -= 12;
  }

  rule(color = GOLD, opacity = 0.35) {
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE.width - MARGIN, y: this.y },
      thickness: 0.5,
      color,
      opacity,
    });
  }

  /* One record: its dates in the gutter, everything else in the column. */
  entry(dates: string, place: string | null, lines: () => void) {
    this.room(40);
    const top = this.y;

    this.tracked(dates, MARGIN, top - 8, 7, STONE, 0.5);

    if (place) {
      this.tracked(place, MARGIN, top - 20, 7, STONE, 0.5);
    }

    lines();

    /* The gutter can be taller than the column on a one line entry. */
    const used = top - this.y;
    const gutter = place ? 26 : 14;

    if (used < gutter) {
      this.y = top - gutter;
    }

    this.y -= 10;
  }

  gap(height: number) {
    this.y -= height;
  }

  /** Page numbers, written once every page exists. */
  stamp(note: string) {
    const pages = this.pdf.getPages();

    pages.forEach((page, index) => {
      page.drawText(`${note}   ${index + 1} / ${pages.length}`, {
        x: MARGIN,
        y: MARGIN - 18,
        font: this.f.meta,
        size: 6.5,
        color: STONE,
      });
    });
  }
}

function span(record: CareerRecord, present: string) {
  const start = record.startedOn?.getUTCFullYear();
  const end = record.endedOn?.getUTCFullYear();

  if (!start) {
    return end ? String(end) : "";
  }

  if (!end) {
    return `${start} / ${present}`;
  }

  return start === end ? String(start) : `${start} / ${end}`;
}

export async function buildCv(locale: Locale): Promise<Uint8Array> {
  const [t, site, positions, credentials, selected, archive, profiles] =
    await Promise.all([
      getTranslations({ locale, namespace: "about" }),
      getTranslations({ locale, namespace: "site" }),
      listPositions(locale),
      listCredentials(locale),
      listSelected(locale),
      listArchive(locale),
      listProfiles(),
    ]);

  /* The front page selection first, then the rest of the archive in order, and
     six in total. A curriculum vitae that lists everything is a curriculum
     vitae nobody finishes, and the two pieces the site puts forward are not
     enough range on their own. */
  const pieces = [
    ...selected,
    ...archive.filter(
      (entry) => !selected.some((piece) => piece.slug === entry.slug),
    ),
  ].slice(0, 6);

  const cv = await getTranslations({ locale, namespace: "cv" });

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const f = await faces(pdf);
  const sheet = new Sheet(pdf, f);

  pdf.setTitle(`${site("person")}, ${cv("role")}`);
  pdf.setAuthor(site("person"));
  pdf.setSubject(cv("role"));
  pdf.setCreator(siteUrl);
  pdf.setProducer(siteUrl);

  // ---------------------------------------------------------------- masthead

  sheet.text(site("person"), { font: f.display, size: 25, lead: 30 });
  sheet.gap(2);
  sheet.text(cv("role").toUpperCase(), {
    font: f.meta,
    size: 8,
    color: GOLD,
    lead: 14,
  });

  sheet.gap(6);
  sheet.rule();
  sheet.gap(14);

  const links = [
    contact.email,
    siteUrl.replace("https://", ""),
    ...profiles
      .filter((profile) => profile.label === "GitHub" || profile.label === "LinkedIn")
      .map((profile) => profile.url.replace("https://", "").replace("www.", "")),
    /* Written per language rather than assembled from the record: the country
       is spelled with an accent in one and without in the other, and one
       column cannot hold both. */
    cv("location"),
  ];

  sheet.text(links.join("   ·   "), {
    font: f.meta,
    size: 7,
    color: STONE,
    lead: 12,
  });

  sheet.gap(10);

  /* The opening paragraph of the career page, and only the first: a document
     someone skims in twenty seconds cannot open with four. */
  const intro = t("intro").split("\n\n")[0];
  sheet.text(intro, { size: 9.5, lead: 14 });

  // -------------------------------------------------------------- experience

  sheet.section(t("experience"));

  for (const position of positions) {
    sheet.entry(span(position, t("present")), position.location, () => {
      sheet.text(position.title, {
        font: f.strong,
        size: 10,
        x: MARGIN + COLUMN,
        lead: 14,
      });
      sheet.text(position.organization, {
        font: f.meta,
        size: 7,
        color: GOLD,
        x: MARGIN + COLUMN,
        lead: 13,
      });

      if (position.summary) {
        sheet.text(position.summary, {
          size: 9,
          x: MARGIN + COLUMN,
          lead: 12.5,
        });
      }
    });
  }

  // ------------------------------------------------------------------ pieces

  sheet.section(cv("selected"));

  for (const entry of pieces) {
    const year = entry.startedOn?.getUTCFullYear();
    const end = entry.endedOn?.getUTCFullYear();

    sheet.entry(
      year ? (end && end !== year ? `${year} / ${end}` : `${year}`) : "",
      null,
      () => {
        sheet.text(entry.title, {
          font: f.strong,
          size: 9.5,
          x: MARGIN + COLUMN,
          lead: 13,
        });

        if (entry.summary) {
          sheet.text(entry.summary, {
            size: 9,
            x: MARGIN + COLUMN,
            lead: 12.5,
          });
        }

        if (entry.stack.length > 0) {
          sheet.text(entry.stack.join(" / "), {
            font: f.meta,
            size: 6.5,
            color: STONE,
            x: MARGIN + COLUMN,
            lead: 12,
          });
        }
      },
    );
  }

  // --------------------------------------------------------------- education

  sheet.section(t("education"));

  for (const credential of credentials) {
    sheet.entry(span(credential, t("present")), null, () => {
      sheet.text(credential.title, {
        font: f.strong,
        size: 9.5,
        x: MARGIN + COLUMN,
        lead: 13,
      });

      if (credential.summary) {
        sheet.text(credential.summary, {
          size: 9,
          x: MARGIN + COLUMN,
          lead: 12.5,
        });
      }
    });
  }

  // ------------------------------------------------------------------ skills

  sheet.section(t("skills"));

  for (const group of skills) {
    sheet.entry(t(`skillGroups.${group.key}`).toUpperCase(), null, () => {
      sheet.text(group.items.join(", "), {
        size: 9,
        x: MARGIN + COLUMN,
        lead: 12.5,
      });
    });
  }

  sheet.section(t("languages"));
  sheet.text(t("languagesBody"), { size: 9, lead: 12.5 });

  sheet.stamp(cv("stamp", { url: siteUrl.replace("https://", "") }));

  return pdf.save();
}
