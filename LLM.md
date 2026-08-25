# Hanzo Gallery

## Overview
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack
- **Language**: TypeScript/JavaScript
- **UI**: `@hanzo/ui` on `@hanzo/gui`. No utility engine, no Radix.

## Build & Run
```bash
npm install && npm run build
npm run e2e         # drives the exported site: filters, dialog, size switch, 404
npm run css-check   # every class in the markup has a rule in a sheet it delivers
```

## Structure
```
gallery/
  LICENSE
  README.md
  app/                  # the gallery itself; app/lib/shot.ts addresses a capture
  app/lib/design.ts     # the palette and the type scale, stated once
  public/screenshots/   # <name>.webp, <name>-tablet.webp, <name>-mobile.webp
  scripts/              # gen-templates-json.mjs runs on prebuild
  .hanzo/workflows/     # deploy.yml publishes out/ to the Sites plane
  eslint.config.mjs
  gui.d.ts              # names the motion scale so `transition="quickest"` types
  next-env.d.ts
  next.config.ts
  package-lock.json
  package.json
```

## Key Files
- `README.md` -- Project documentation
- `package.json` -- Dependencies and scripts

## Styling

Everything is a gui style prop. `app/lib/design.ts` holds the two things a call
site needs and nothing else: `c` (colours) and `t` (type steps). Spread a type
step, never assign its size alone — `<H1 {...t.xl8}>` — because a step carries
its leading, and display type set without one renders sliced.

Four things earned their way into `app/globals.css`, each because no style prop
can say it: the document's own margin, a `@keyframes`, the WebKit half of hiding
a scrollbar, and the hover that reaches from a card to its picture.

Learned the expensive way, all measured here:

- **The type scale is the system's, the palette is not.** `--text-*` are defined
  and fluid, so `t` names them. `--purple-500` and friends are NOT defined —
  the system ships `--neutral-*` and `--white-*` and stops — so asking for one
  by name yields an undefined variable and the property is dropped in silence.
  The colours are therefore literals, read out of the sheet the page used to
  render, and `at(colour, alpha)` puts the alpha INSIDE the `oklch()` where its
  syntax wants it. A hex-style `33` suffix produces a value the browser drops.
- **`borderStyle: 'solid'` sets the style on all four sides.** Give one side a
  width and the other three keep CSS's initial `medium` — 3px — so a single top
  rule renders as a box. react-native-web's base already supplies `solid` at
  width 0, so the prop is never needed: state widths only.
- **Frames take frame props; text props go on text.** `color`, `fontSize`,
  `textAlign` and `textDecorationLine` are dropped by a Stack. An icon button
  that tints its SVG through `currentColor` has to BE a `Text`.
- **gui drops an unknown prop without a word.** Read the installed `.d.ts`. The
  motion prop is `transition`, not `animation`; `Spinner`'s `size` is a number
  of pixels; `Anchor` types neither `title` nor `transitionProperty`.
- **`react-native` must alias to `react-native-web`** (see `next.config.ts`), and
  so must `@react-native/assets-registry/registry`, which otherwise forwards to
  the internals the first alias just replaced and throws on any asset.
- **`ToggleGroup` does not typecheck here** — its prop union exceeds
  TypeScript's complexity limit — so the gallery's view switch is two buttons.

The static export is fully styled with JavaScript off: gui inlines the atomics
it generates during the build into the HTML. `npm run css-check` is what says
so, and it is the check that catches a page whose classes have no rules — a
green build cannot.

## License

Dual-licensed **MIT OR Apache-2.0** (`LICENSE-MIT`, `LICENSE-APACHE`), replacing the
previous BSD-3-Clause declaration. Original Hanzo work standardises on this pair per
HIP-0137 "One License" (`hanzoai/hips`, `HIPs/hip-0137-one-license.md`); forks keep
their upstream licence unchanged.
