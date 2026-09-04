# Archive Nocturne, typographic system

Three families, four roles, no overlap.

| Role | Family | Origin | Licence |
| --- | --- | --- | --- |
| Display | **Redaction** | The Redaction, by Titus Kaphar and Reginald Dwayne Betts at MoMA PS1; typeface by Forest Young and Jeremy Mickel (MCKL) | SIL OFL |
| Text | **Author** | Indian Type Foundry, via Fontshare | Fontshare |
| Meta and register | **Sligoil Micro** | Ariel Martin Perez, Velvetyne | SIL OFL |

All three are self-hosted through `next/font/local`. No third-party request, no
layout shift.

## Redaction: wear as data

Redaction is not a variable font. Each degree of print wear is a separate
family (0, 10, 20, 35, 50, 70, 100), with the halftone cut into the outlines
themselves.

**Two degrees, not seven.** Seven degrees is an effect. Two is a system.

| Degree | Token | Use |
| --- | --- | --- |
| Redaction 10 | `--font-display` | Default. Everything alive and in progress. |
| Redaction 50 | `--font-worn` | Exception. Older pieces, worldbuilding fragments, closed entries. |

Moving from 10 to 50 has to **mean** something, namely age or depth in the
archive, and never serve as decorative variation. It is a column in the
database, not a layout choice.

### Size floor

The halftone closes up as the size drops, and a high degree becomes a grey
smear.

| Degree | Minimum |
| --- | --- |
| Redaction 10 | 32 px |
| Redaction 50 | 64 px |

Below 32 px, Redaction is not used at all. Never in body copy, never in a
label, never in navigation.

### Settings

- Regular only. Bold plus halftone goes opaque and loses the grain.
- `letter-spacing: -0.015em` at very large sizes, `0` below 48 px.
- No uppercase: the halftone reads better across varied lowercase shapes.

## Author: reading

- Body: 400, `1.0625rem`, `line-height: 1.65`, measure capped at **68
  characters**.
- Uppercase labels: 600, `letter-spacing: 0.08em`.
- Three weights total: 400, 500, 600. No 700.

**Optical correction on the dark ground.** Ivory irradiates against
`#0b0a0c` and reads heavier than it is, so the dark theme drops the body to
`wght: 380`. The correction belongs on the weight axis rather than on
smoothing, which would have no equivalent effect in the light theme.

## Sligoil: two voices

Sligoil carries two distinct roles, and the difference between them is size
and case rather than family.

### Meta, 11 to 13 px, uppercase

Archive punctuation: numbers, dates, tags, field labels, chapter markers.
This is not text. **It is the only place gold appears systematically**;
everywhere else gold is an exception.

### Register, 15 px, lowercase

The one place the meta face carries actual sentences, and it is deliberately
confined to the archive: index standfirsts, entry standfirsts, the summaries
of the pieces inside an entry.

A catalogue describes its holdings in the same hand it uses to label them,
and that is what makes a registry feel like a registry rather than a blog
with numbers on it. The front page and any long-form body stay in Author:
monospace is a texture, and eight hundred words of texture is a wall.

Lowercase, unlike the meta role, since uppercase stops being readable the
moment a line becomes a sentence.

## Scale

```css
--text-display-xl: clamp(4rem, 1.5rem + 8vw, 8rem);
--text-display-l:  clamp(2.75rem, 1.5rem + 4.5vw, 4.5rem);
--text-display-m:  clamp(2rem, 1.5rem + 2vw, 2.75rem);
--text-body-l:     clamp(1.0625rem, 1rem + 0.3vw, 1.25rem);
--text-body:       1.0625rem;
--text-register:   0.9375rem;
--text-label:      0.875rem;
--text-meta:       0.75rem;
```

Display line height is **0.95**. That tightness is what produces the compact
typographic block of a magazine cover.

## Interaction with the palette

Contrast against `#0b0a0c`:

| | Ratio | Allowed in |
| --- | --- | --- |
| Ivory `#f3efe6` | 16.3:1 | anything |
| Gold `#c49a5a` | 7.6:1 | anything, meta included |
| Crimson `#a92532` | 2.8:1 | **display only**, 32 px and up |
| Violet `#54245f` | 1.7:1 | **surface only**, never ink |

Crimson can therefore only live in Redaction, never in Author or Sligoil,
which makes it mechanically a title colour.

Against the light ground the relationship inverts: crimson reaches 6.1:1 and
violet 10.2:1, so both become usable ink, while gold falls to 2.3:1 and hands
over to its deeper cut `#7e5f28`.

**Worn Redaction in crimson is forbidden.** The halftone already fragments the
outlines and effective contrast drops below 2:1. Degree 50 stays ivory or
gold.

## Loading

```
Redaction10-Regular.woff2      preloaded, font-display: optional
Redaction10-Italic.woff2       not in the global bundle
Redaction50-Regular.woff2      route scoped, never preloaded
Author-Variable.woff2          preloaded
SligoilMicro-Regular.woff2     preloaded
```

The default display face uses `optional` rather than `swap` because it renders
the largest text on the page and is therefore almost always the LCP element.
If it has not arrived in time, keeping the fallback beats reflowing a headline
that occupies half the viewport.

Redaction outlines are heavy, since the halftone multiplies the point count,
so subsetting is required. Budget: **under 250 KB** of type per page.

## Forbidden

- A fourth family.
- Redaction below 32 px, in uppercase, in bold, or worn in crimson.
- Sligoil above 15 px, or in uppercase once a line becomes a sentence.
- The register voice outside the archive.
- More than two Author weights visible in one screen.
- A third degree of wear.
