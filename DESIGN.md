# Design System

## Direction

A formal Maharashtra education-institution website translated for a defence academy.
The public landing page follows the supplied department-site reference: a white identity
masthead, full-width maroon navigation, slim cream notice strip, warm editorial hero and
gold actions. Shivrakshak's shield, Marathi voice and real training media keep it distinct.

Admin screens keep their task-focused layout while inheriting the academy's maroon,
warm cream and restrained-gold identity. The public composition remains scoped beneath
`.sra`; admin reuses the brand tokens without copying the marketing-page structure.

## Color

Warm cream is the page ground, institutional maroon carries navigation and structure,
and military gold carries actions and emphasis.

- Maroon: `#641b23` / `#7c2029`
- Ground: `#fffaf2`
- Alternate ground: `#f8efe5`
- Panel: `#fffdf9` / `#f4e6df`
- Gold: `#c79b3b` (accent), `#e0bd6b` (hover/light)
- Saffron: `#e08a2b` (sparingly)
- Text: `#401d20`; muted `#7a6b70`
- Hairlines: `rgba(212,164,55,.16)` over `#2a3520`
- WhatsApp green: `#15703c` (darkened from brand green so white label text clears 4.5:1)

Gold is an accent, never a fill for large areas. No gradient text.

## Typography

- **Mukta** (400/500/700/800) — Marathi and Latin body and headings. Devanagari-capable.
- **Oswald** (400/500/600) — command lettering: statistics, uppercase labels, course
  titles, small caps rules.

Fonts load through `next/font/google` inside the landing page and are applied via
`--font-mukta` / `--font-oswald` on the `.sra` wrapper. Admin keeps its operational
type sizing while matching the public site's color and material character.

## Composition

The masthead establishes identity before a sticky maroon navigation rail. A thin trust
strip precedes a warm, lightly photographic hero: Marathi headline left, founders right,
gold admission action. Cream and pale rose surfaces alternate down the page, with maroon
bands for authority and gold hairlines for rhythm.

## Responsive behavior

Navigation collapses to a drawer below 1080px. Four-column grids become two, then one.
The results rail scrolls horizontally with snap. The process timeline drops its
connecting rule and becomes a left-aligned list on narrow screens. Stats become two
columns with dividers turned into top borders.

## Motion

One authored moment: content settles upward once on entry (`Reveal`), exponential
ease-out, visible by default so a failed observer never blanks the page. Hover lift and
image zoom are the only other movement. Everything collapses under
`prefers-reduced-motion`.

## Content ownership

Landing copy, statistics, courses, results, gallery, testimonials, facilities, process
and contact hours live in `src/content/landing.ts`. Admin-uploaded photographs still
override the hero, course and result slots at runtime by `placement`.

## Honesty

Statistics, student names, result photographs and testimonials ship as clearly labelled
placeholders. The founder portrait renders an explicit placeholder frame rather than a
stock face. Nothing invented is presented as a verified academy claim.
