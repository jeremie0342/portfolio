# Archive Nocturne — Système typographique

Kit retenu : **A — ARCHIVE MATÉRIELLE**.
Principe : la typographie ne décrit pas l'archive, elle en est la matière.

---

## 1. Les trois familles

| Rôle | Famille | Origine | Licence |
|---|---|---|---|
| Display | **Redaction** | Projet *Redaction* de Titus Kaphar & Reginald Dwayne Betts ; caractère par Forest Young & Jeremy Mickel (MCKL) | SIL OFL |
| Texte | **Author** | Indian Type Foundry / Fontshare | Fontshare (usage commercial inclus) |
| Méta | **Sligoil Micro** | Ariel Martín Pérez / Velvetyne | SIL OFL |

Aucune quatrième famille. Jamais.

---

## 2. Redaction — la dégradation comme système

Redaction n'est pas une police variable : chaque degré de dégradation est **une famille distincte**
(Redaction 0, 10, 20, 35, 50, 70, 100). Le degré correspond à une trame d'impression de plus en plus
grossière, gravée dans les contours eux-mêmes.

### Règle de discipline : deux degrés, pas sept

Sept degrés = un effet. Deux degrés = un système.

| Degré | Nom interne | Usage |
|---|---|---|
| **Redaction 10** | `--font-display-clean` | Défaut. Titres de page, noms de projets, tout ce qui est vivant et en cours. |
| **Redaction 50** | `--font-display-worn` | Exception. Pièces anciennes de l'archive, fragments de worldbuilding, citations d'origine, entrées closes. |

Le passage de 10 à 50 doit **signifier quelque chose** — l'âge ou la profondeur dans l'archive —
et jamais servir de variation décorative. C'est un champ en base de données, pas un choix de mise en page.

### Contrainte de corps

La trame se referme quand le corps diminue : en dessous d'un certain seuil, un degré élevé
devient une bouillie grise.

| Degré | Corps minimum |
|---|---|
| Redaction 10 | 32 px |
| Redaction 50 | 64 px |

En dessous de 32 px, Redaction ne s'utilise pas du tout. Jamais en corps de texte, jamais en libellé,
jamais en navigation.

### Réglages

- Graisses : **Regular uniquement**. Le Bold de Redaction combiné à la trame devient opaque et perd le grain.
- `letter-spacing: -0.015em` en très grand corps ; `0` en dessous de 48 px.
- Pas de capitales : la trame se lit mieux sur des formes basses variées.
- Italique autorisé pour les citations, en Redaction 10 seulement.

---

## 3. Author — le texte

C'est la famille qui porte la lisibilité et la crédibilité d'ingénieur.

- Corps : **400**, `1.0625rem`, `line-height: 1.65`, mesure max **68 caractères**.
- Chapeau : **400**, `--t-body-l`, `line-height: 1.5`, mesure max 55 caractères.
- Libellés capitales : **600**, `letter-spacing: 0.08em`.
- Navigation : **500**.
- Trois graisses au total : 400 / 500 / 600. Pas de 700.

**Correction optique sur fond sombre** : le texte ivoire irradie sur `#0B0A0C`.
Si la version variable d'Author est disponible, descendre le corps à `wght: 380`.
Sinon garder 400 et ne jamais monter.

---

## 4. Sligoil Micro — la méta

Sligoil est un mono humaniste dessiné pour le sous-titrage : il a des courbes, il n'a rien
d'un mono de terminal. La variante **Micro** est optimisée pour les petits corps — c'est
exactement notre cas.

- Toujours en capitales, `letter-spacing: 0.06em`.
- Corps : **11 à 13 px uniquement**. C'est de la ponctuation, pas du texte.
- Usages : `2026 / 001`, dates, tags, numéros de chapitre, légendes, libellés de champ.
- **C'est le seul endroit où l'or `#C49A5A` est systématique.** Partout ailleurs, l'or est une exception.

---

## 5. Échelle fluide

```css
--t-display-xl: clamp(4rem, 1.5rem + 8vw, 8rem);        /* Redaction — titre de page */
--t-display-l:  clamp(2.75rem, 1.5rem + 4.5vw, 4.5rem); /* Redaction — titre d'entrée */
--t-display-m:  clamp(2rem, 1.5rem + 2vw, 2.75rem);     /* Redaction 10 seulement */
--t-quote:      clamp(1.75rem, 1.2rem + 2vw, 2.5rem);   /* Redaction 10 italique */

--t-body-l:     clamp(1.0625rem, 1rem + 0.3vw, 1.25rem);/* Author 400 */
--t-body:       1.0625rem;                               /* Author 400 */
--t-label:      0.875rem;                                /* Author 600 caps */
--t-meta:       0.75rem;                                 /* Sligoil Micro caps */
```

Interlignage display : **0.95**. C'est ce serrage qui produit le bloc typographique compact
des couvertures de revue.

---

## 6. Interaction avec la palette

Rappel des ratios de contraste sur `#0B0A0C` :

| | Ratio | Autorisé en |
|---|---|---|
| Ivoire `#F3EFE6` | 16.3:1 | tout |
| Or `#C49A5A` | 7.6:1 | tout, y compris la méta |
| Carmin `#A92532` | 2.8:1 | **display uniquement** (≥ 32 px) ou aplat |
| Violet `#54245F` | 1.7:1 | **surface uniquement**, jamais d'encre |

Conséquence directe : le carmin ne peut vivre qu'en Redaction, jamais en Author ni en Sligoil.
Le rouge devient donc, mécaniquement, une couleur de titre — ce qui est mieux que ce que
prévoyait le plan initial.

**Redaction dégradé en carmin est interdit** : la trame fragmente déjà les contours,
le contraste effectif tombe sous 2:1. Le degré 50 est réservé à l'ivoire et à l'or.

---

## 7. Chargement

Toutes les polices sont **auto-hébergées** via `next/font/local` — zéro requête tierce, zéro CLS.

Fichiers à charger (woff2, sous-ensemblés latin + chiffres + ponctuation) :

```
Redaction10-Regular.woff2
Redaction10-Italic.woff2
Redaction50-Regular.woff2      (chargé uniquement sur les routes qui l'utilisent)
Author-Variable.woff2          (ou 400/500/600 statiques)
SligoilMicro-Regular.woff2
```

- Les contours de Redaction sont lourds (la trame multiplie les points) : **sous-ensembler est obligatoire**,
  via `pyftsubset` ou `glyphhanger`.
- Redaction 50 n'est jamais dans le bundle global : import dynamique sur les routes concernées.
- Budget cible : **< 250 Ko** de police au total sur une page.
- `font-display: swap` partout sauf sur le display de la page d'accueil, en `optional`
  pour protéger le LCP.

---

## 8. Interdits

- Une quatrième famille.
- Redaction sous 32 px, en capitales, en gras, ou en carmin dégradé.
- Sligoil au-delà de 13 px ou pour autre chose que de la méta.
- Plus de deux graisses d'Author visibles dans un même écran.
- Un troisième degré de dégradation.
