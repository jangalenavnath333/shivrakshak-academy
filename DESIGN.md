# Design System

## Direction

A recruitment-drive noticeboard for a defence academy, not a coaching-class brochure.
The academy's authority is a retired Indian Army officer, so the public site leads with
training-ground photography and command lettering, and states that leadership early.

This replaces the earlier cream-paper / saffron editorial world on the public landing
page. Admin, student and other operational screens keep their own light UI; the dark
world is scoped to the landing page under `.sra` and must not leak into them.

## Color

Ground and structure are near-black olive; a single military gold carries every accent.

- Black: `#050804`
- Ground: `#0a0f08`
- Panel: `#101809` / `#16210f`
- Olive: `#1e2b16` / `#26351b`
- Gold: `#d4a437` (accent), `#f2ce74` (hover/light)
- Saffron: `#e08a2b` (sparingly)
- Text: `#f5f2e9`; muted `#a7ac99`
- Hairlines: `rgba(212,164,55,.16)` over `#2a3520`
- WhatsApp green: `#15703c` (darkened from brand green so white label text clears 4.5:1)

Gold is an accent, never a fill for large areas. No gradient text.

## Typography

- **Mukta** (400/500/700/800) — Marathi and Latin body and headings. Devanagari-capable.
- **Oswald** (400/500/600) — command lettering: statistics, uppercase labels, course
  titles, small caps rules.

Fonts load through `next/font/google` inside the landing page and are applied via
`--font-mukta` / `--font-oswald` on the `.sra` wrapper, so admin typography is unaffected.

## Composition

Full-bleed hero photograph under a two-axis dark scrim, headline left, second line in
gold, admission as the gold primary action. A bordered statistics strip separates the
hero from the founder section. Sections alternate between ground and black to pace the
scroll. Square corners (3–4px), hairline gold rules, one diamond ornament under section
titles. Cards lift on hover; images zoom inside a fixed frame.

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
