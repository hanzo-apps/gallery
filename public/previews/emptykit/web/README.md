# Emptykit for the web (three.js)

The 48 illustrations drawn live in the browser from one GLB each (80 KB to 1.4 MB), with the strokes of the PNG
and SVG files. They are real 3D: the models turn (a slow orbit, or toward the pointer), and their outlines,
silhouettes and hidden edges are redrawn correctly at every angle. Any accent colour, light and dark, Mono / Line /
Blueprint, crisp at any size.

```
web/
  empty-state.js        the <empty-state> web component and mountEmptyState()
  looks.js              looks, accent presets and the catalogue (imported by empty-state.js)
  glb/                  ek-01-no-messages.glb ... ek-48-success.glb
  react/EmptyState.jsx  a thin React wrapper
  examples/             index.html (gallery with every option), vanilla.html (a card), react-example.jsx
```

## Quick start (no build step)

Serve the folder with any static server (ES modules and GLBs don't load from `file://`), for example
`npx serve .` or `python3 -m http.server`, then open `examples/index.html`.

```html
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js",
               "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/" } }
</script>
<script type="module" src="/emptykit/web/empty-state.js"></script>

<empty-state name="no-results" look="mono" theme="light" accent="teal" style="width: 240px"></empty-state>
```

## With a bundler (Vite, Next.js, Remix ...)

Copy `web/` into your project (or `npm install ./path/to/web`), `npm install three`, then:

```js
import 'emptykit-web';                                   // registers <empty-state>
import { EmptyState } from 'emptykit-web/react';         // React
<EmptyState name="no-orders" theme="dark" glow accent="#0EA5E9" size={200} />
```

The GLBs are looked up next to `empty-state.js` (`./glb/`). If your bundler moves files, serve `glb/` yourself and
pass `src="/assets/ek-13-no-results.glb"` instead of `name`.

## Attributes / options

| Attribute | Values | Default |
|---|---|---|
| `name` | the slug: `no-messages`, `no-results`, `empty-cart` ... (see `looks.js` `SUBJECTS` or `../copy/copy.md`) | – |
| `src` | a GLB URL, instead of `name` | – |
| `look` | `mono`, `line`, `blueprint` | `mono` |
| `theme` | `light`, `dark`, `auto` (follows the system) | `light` |
| `accent` | `indigo`, `violet`, `blue`, `teal`, `orange`, `pink`, or any `#hex` (Mono) | `indigo` |
| `glow` | soft glow on the accent lines (Mono dark) | off |
| `bold` | strokes x1.45 | off |
| `line-scale` | any stroke multiplier | `1` |
| `motion` | `orbit` (turns slowly back and forth, ±24°), `tilt` (turns toward the pointer), `float` (a gentle bob at the exact isometric view), `none` | `orbit` |
| `yaw`, `pitch` | a fixed pose in degrees (turn around the vertical, look from higher or lower), with any motion | `0` |
| `phase` | seconds added to the animation clock, so several illustrations don't move in step | `0` |
| `hidden-edges` | `false` drops the faint dashed hidden edges of Line and Blueprint | on |

With `prefers-reduced-motion: reduce` every illustration stays still (at its `yaw` / `pitch` pose).
`float="false"` from version 1.0 still works and means `motion="none"`.

Size it with CSS: the element is square (`width: 200px`, or `width: 100%` in a container). Stroke widths adapt to
the displayed size the way the PNG sets do: about 1.5 px lines in a UI, a little heavier when small.

From JavaScript:

```js
import { mountEmptyState } from './empty-state.js';
const ill = await mountEmptyState(document.querySelector('#art'), { name: 'no-orders', theme: 'dark', glow: true });
ill.set({ accent: '#F2702A' });     // live
ill.set({ look: 'line', theme: 'light' });
ill.set({ motion: 'tilt' });        // or { motion: 'none', yaw: 20 } for a fixed three-quarter view
ill.dispose();
```

Any hex accent gets a matching shade, dark-theme variant and glow, derived in OKLCH the same way as the presets
(`accentPalette('#0EA5E9')`).

## How it draws

- One shared WebGL renderer draws every illustration on the page and copies it into each element's own canvas, so
  a page can show all 48 at once (browsers allow only about 16 live WebGL contexts).
- Strokes are the kit's own line engine, run live. Each GLB carries the model's line topology (feature edges with
  their two face normals, marked creases, open borders, decorative strokes, smooth triangles with their corner
  normals). Every time the pose changes, the component redoes the engine's candidate pass: an edge between flat faces
  becomes a contour where one face turns away and a crease where they fold, and smooth surfaces give contours
  interpolated inside their triangles (where the normal turns side-on), so curved silhouettes stay smooth.
- Visibility is decided per pixel on the GPU at each stroke's centre line, against a depth pre-pass of the model, so
  silhouettes keep their full width and lines behind other parts disappear (or turn into Line's dashed hidden edges).
  A contour with empty background on either side gets the heavier outline weight, as in the PNGs. Dashes are
  measured along the chained strokes on screen, like the SVG's.
- At the isometric pose this matches the PNGs to within about 1-2/255 per pixel on average.
- Fills are the three-tone shader: a pure function of the surface normal, identical to the Blender material.
- The soft shadow is baked into the GLB as two small textures. The kit's light is straight above, so the ground
  shadow lies on the ground plane and turns with the model; the shadow on the objects stays on the surfaces where it
  falls in the isometric view.
- Blueprint's grid and dimension guides are SVG layers under the canvas (their 3D data is in the GLB's extras); the
  guides turn with the model, the grid stays on the ground.
- Sparkles keep facing you and twinkle slightly.
- Cost: the stroke pass takes 0.2 to 1 ms of JavaScript per turning illustration and frame on a laptop (the
  heaviest models have about 4,000 stroke segments); illustrations that are off screen don't animate, and still
  ones aren't redrawn. For pages with dozens of illustrations, `motion="tilt"` or `"float"` is lighter.

Browser support: any browser with WebGL 2 (all current ones). three.js r160 or newer.
