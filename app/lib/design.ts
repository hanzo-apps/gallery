/**
 * The values the gallery is drawn with: a palette and a type scale.
 *
 * They come from two different places for one reason. The type scale IS in the
 * design system — `--text-*` are defined, fluid, and retune with a reader's
 * chosen size — so the scale is named and the system owns it. The palette is
 * not: the system defines `--neutral-*` and `--white-*` and stops, so a purple
 * asked for by name resolves to an undefined variable and the property is
 * dropped without a word. This app's purples and blues are therefore literals.
 *
 * The colours were read out of the generated sheet rather than retyped, so they
 * are the values the page already rendered and the move does not restyle it.
 */

/**
 * A colour at an opacity. Every colour here is an `oklch(...)`, whose own
 * syntax carries alpha after a slash, so the channel goes inside the function.
 * Suffixing `33` the way a hex colour takes it produces `oklch(...)33`, which
 * is not a colour and which the browser drops silently.
 */
export const at = (color: string, a: number) => color.replace(/\)$/, ` / ${a})`);

const white = (pct: number) => `rgba(255,255,255,${pct / 100})`;

/** The scale, as the sheet rendered it. */
const p = {
  blue100: 'oklch(93.2% .032 255.585)',
  blue300: 'oklch(80.9% .105 251.813)',
  blue400: 'oklch(70.7% .165 254.624)',
  blue500: 'oklch(62.3% .214 259.815)',
  blue600: 'oklch(54.6% .245 262.881)',
  blue800: 'oklch(42.4% .199 265.638)',
  blue900: 'oklch(37.9% .146 265.522)',
  blue950: 'oklch(28.2% .091 267.935)',
  gray100: 'oklch(96.7% .003 264.542)',
  gray300: 'oklch(87.2% .01 258.338)',
  gray400: 'oklch(70.7% .022 261.325)',
  gray500: 'oklch(55.1% .027 264.364)',
  gray600: 'oklch(44.6% .03 256.802)',
  gray700: 'oklch(37.3% .034 259.733)',
  gray900: 'oklch(21% .034 264.665)',
  gray950: 'oklch(13% .028 261.692)',
  green300: 'oklch(87.1% .15 154.449)',
  green400: 'oklch(79.2% .209 151.711)',
  green500: 'oklch(72.3% .219 149.579)',
  green800: 'oklch(44.8% .119 151.328)',
  green950: 'oklch(26.6% .065 152.934)',
  neutral200: 'oklch(92.2% 0 0)',
  neutral300: 'oklch(87% 0 0)',
  neutral400: 'oklch(70.8% 0 0)',
  neutral500: 'oklch(55.6% 0 0)',
  neutral600: 'oklch(43.9% 0 0)',
  neutral700: 'oklch(37.1% 0 0)',
  neutral800: 'oklch(26.9% 0 0)',
  neutral900: 'oklch(20.5% 0 0)',
  neutral950: 'oklch(14.5% 0 0)',
  pink300: 'oklch(82.3% .12 346.018)',
  pink400: 'oklch(71.8% .202 349.761)',
  pink500: 'oklch(65.6% .241 354.308)',
  pink600: 'oklch(59.2% .249 .584)',
  pink900: 'oklch(40.8% .153 2.432)',
  purple100: 'oklch(94.6% .033 307.174)',
  purple300: 'oklch(82.7% .119 306.383)',
  purple400: 'oklch(71.4% .203 305.504)',
  purple500: 'oklch(62.7% .265 303.9)',
  purple600: 'oklch(55.8% .288 302.321)',
  purple800: 'oklch(43.8% .218 303.724)',
  purple900: 'oklch(38.1% .176 304.987)',
  purple950: 'oklch(29.1% .149 302.717)',
  yellow400: 'oklch(85.2% .199 91.936)',
} as const;

const to = (...stops: string[]) => `linear-gradient(to right, ${stops.join(', ')})`;

export const c = {
  ...p,

  /** The page ground. */
  ink: '#0a0a0a',

  /** White at an opacity, the way the borders and panels were written. */
  white5: white(5),
  white10: white(10),
  white20: white(20),

  /** The gradients the brand is drawn with, and the hover each moves to. */
  brand: to(p.purple500, p.pink500),
  brandHover: to(p.purple600, p.pink600),
  cool: to(p.blue500, p.purple500),
  coolHover: to(p.blue600, p.purple600),

  /** Display type: a wash the heading is clipped out of. */
  wash: to(p.blue400, p.purple400, p.pink400),
  washShort: to(p.blue400, p.purple400),
} as const;

/**
 * The type scale, which the design system does define. Fluid: each step is a
 * clamp that follows the reader's chosen size, so these are names and not
 * numbers.
 *
 * A step carries its LEADING as well as its size, and is spread rather than
 * assigned — `<H1 {...t.xl8}>`. Size alone leaves the component's own
 * line-height in place, which at display sizes is far shorter than the glyphs:
 * the hero heading rendered with its ascenders and descenders sliced off. The
 * ratios are the ones the page already used; the system names no line-height
 * token to defer to (`--text-*--line-height` is undefined), so they are stated.
 *
 * Strings, not numbers: gui reads a bare number as pixels, so `lineHeight: 1`
 * would set one pixel of leading rather than one em of it.
 */
const step = (name: string, lineHeight: string) => ({
  fontSize: `var(--text-${name})`,
  lineHeight,
});

export const t = {
  xs: step('xs', '1.333'),
  sm: step('sm', '1.429'),
  base: step('base', '1.5'),
  lg: step('lg', '1.556'),
  xl: step('xl', '1.4'),
  xl2: step('2xl', '1.333'),
  xl3: step('3xl', '1.2'),
  xl4: step('4xl', '1.111'),
  xl5: step('5xl', '1'),
  xl6: step('6xl', '1'),
  xl7: step('7xl', '1'),
  xl8: step('8xl', '1'),
  xl9: step('9xl', '1'),
} as const;

/**
 * Gradient text. `background-clip: text` has no gui style prop, and tw() reads
 * `bg-clip-text` as a colour named "clip-text", so both spellings are stated
 * here and the element carries them as a plain style.
 */
export const clip = (image: string) => ({
  backgroundImage: image,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  color: 'transparent',
});

/**
 * A template's tier picks a hue: 1 green, 2 blue, anything else purple.
 *
 * The choice was written out five times across four files in four different
 * shade spellings, so a new tier meant finding all five. The SHAPE of each
 * badge stays at its call site — they are genuinely four different marks — but
 * the hue is one decision and lives here.
 */
export type Hue = 'green' | 'blue' | 'purple';
export const hue = (tier: number): Hue => (tier === 1 ? 'green' : tier === 2 ? 'blue' : 'purple');

const base = { green: p.green500, blue: p.blue500, purple: p.purple500 };
const face = { green: p.green300, blue: p.blue300, purple: p.purple300 };

/** A tinted badge: a fifth-strength ground, a slightly stronger edge, pale text. */
export const tint = (h: Hue) => ({
  backgroundColor: at(base[h], 0.2),
  borderColor: at(base[h], 0.3),
  color: face[h],
});

/** The same mark drawn solid, which the home page's cards use. */
export const fill = (h: Hue) => base[h];
