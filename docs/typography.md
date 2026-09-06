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

**The one exception is the opening.** The loader animates a single word through
100, 70, 50, 35, 20 and then 10, which is the whole point of it: a document
coming into focus, performed by the typeface rather than by an effect laid over
it. Those five files are subset to the eight glyphs of the wordmark and weigh
4.4 KB together, so the exception costs less than the rule would suggest. It
does not extend to typesetting: no page sets text in a third degree.

### Size floor

The halftone closes up as the size drops, and a high degree becomes a grey
smear.

| Degree | Minimum |
| --- | --- |
| Redaction 10 | 32 px |
| Redaction 50 | 64 px |
| Redaction 100 | none |

Below 32 px, Redaction is not used at all. Never in body copy, never in a
label, never in navigation.

**Degree 100 is the exception, and for a reason worth recording.** Past a
certain coarseness the halftone stops being a screen laid over an outline and
becomes the outline: the Z at degree 100 is described entirely by horizontal
and vertical segments on hundred-unit steps, 140 characters of path against 902
at degree 10. It is a grid, not a texture, so it holds at wordmark and favicon
sizes where every finer degree turns to mud. That is what the masthead and the
site icon are set in.

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

### Byline, 14 px, uppercase

The name above the front page statement, and stamp labels. A name is neither a
label nor a sentence, so it takes the meta face one step above punctuation
without reaching the register voice.

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

### Annotation, meta size, lowercase

Architecture diagrams are the exception to the uppercase rule at meta size. A
node carries its name in the meta role, uppercase, the way a label is set on a
drawing; the line under it that says what the node holds is the same face at
the same size in lowercase, because it is a fragment rather than a title and
uppercase would give it the weight of one.

The caption under a diagram is register, like every other sentence in the
archive. It is also the only text a screen reader gets in place of the layout,
so it says what the drawing means rather than restating its boxes.

## Scale

```css
--text-display-xl: clamp(2.75rem, min(7.5vw, 13vh), 8rem);
--text-display-l:  clamp(2.25rem, min(4.4vw, 7.5vh), 4.5rem);
--text-display-m:  clamp(1.75rem, min(2.4vw, 4vh), 2.75rem);
--text-body-l:     clamp(1.125rem, 1rem + 0.45vw, 1.375rem);
--text-body:       1.0625rem;
--text-register:   0.9375rem;
--text-label:      0.875rem;
--text-meta:       0.75rem;
```

Display sizes answer to both axes through `min()`. A laptop at 1440 by 900 is
wide enough to hold a viewport width scale near its maximum and short enough
that the result pushes everything below the fold, so the smaller of the two
terms wins and the type shrinks on a low screen without reaching for a
breakpoint. The wide arrangement therefore survives down to the point where
stacking is genuinely the right answer. On a phone the width term always wins
and the vertical term costs nothing.

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

Light is now the default ground, and against it the relationship inverts:
crimson reaches 6.1:1 and violet 10.2:1, so both become usable ink, while gold
falls to 2.3:1 and hands over to its deeper cut `#7e5f28`.

The components keep the stricter rule in both themes rather than changing
behaviour halfway. A headline that only holds in one of the two is a headline
someone will find broken the first time they use the switch.

**Worn Redaction in crimson is forbidden.** The halftone already fragments the
outlines and effective contrast drops below 2:1. Degree 50 stays ivory or
gold.

## Loading

```
Redaction10-Regular.woff2      123.6 KB  preloaded, font-display: optional
Redaction10-Italic.woff2                 not in the global bundle
Redaction50-Regular.woff2       32.2 KB  route scoped, never preloaded
Author-Variable.woff2           36.2 KB  preloaded
SligoilMicro-Regular.woff2      41.4 KB  preloaded
wear/Redaction{100,70,50,35,20}  4.4 KB  preloaded, subset to ZARDONIS
```

Preloaded total: **205.6 KB**, against a budget of 250 KB.

The default display face uses `optional` rather than `swap` because it renders
the largest text on the page and is therefore almost always the LCP element.
If it has not arrived in time, keeping the fallback beats reflowing a headline
that occupies half the viewport.

Redaction outlines are heavy, since the halftone multiplies the point count,
so subsetting is required. Budget: **under 250 KB** of type per page.

### The opening

The sequence runs 2.2 seconds: six wear steps at 190 ms, a hold, then the
travel onto the masthead. It earns that length once, because it is how the
wordmark is introduced, and a reader meeting the site should watch it arrive.

On any later load in the same tab it runs at half pace, which the layout effect
decides from session storage before the first paint. Halved rather than
dropped: a page that appears with no transition at all reads as a different
site than the one the reader just left.

## Forbidden

- A fourth family.
- Redaction below 32 px, in uppercase, in bold, or worn in crimson.
- Sligoil above 15 px, or in uppercase once a line becomes a sentence.
- The register voice outside the archive.
- The wide measure anywhere but the front page description.
- More than two Author weights visible in one screen.
- A third degree of wear in typeset text. The opening is the exception, and it
  sets one word.
