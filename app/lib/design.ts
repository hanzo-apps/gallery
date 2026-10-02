/**
 * The values the gallery is drawn with, and they are hanzo.ai's.
 *
 * Colours are @hanzo/design's custom properties, read by name, so the page wears
 * the same ink ladder, surfaces and hairlines as hanzo.ai and follows a reader's
 * theme and appearance settings with it. There is no hue: hanzo.ai is drawn in
 * one ink on one ground, and its emphasis is weight and brightness.
 *
 * Type is @hanzo/ui's gui ladder (`$1` 11 · `$2` 13 · `$3` 14 · `$4` 15 · `$6` 17
 * · `$7` 21 · `$8` 26 · `$10` 32), which resolves to the same `--text-*` rungs.
 * Page and section headings come from `@hanzo/ui/marketing` (Display, Title,
 * Lede), which set them exactly as hanzo.ai does.
 */
export const c = {
  /** The page ground. */
  ground: 'var(--background)',
  /** A raised surface: a card, a well, a dialog. */
  card: 'var(--card)',
  /** A raised surface one step up: a control's ground, a picture's frame. */
  raised: 'var(--muted)',
  /** Headings and labels. */
  ink: 'var(--foreground)',
  /** The filled control's ground, and the ink on it. */
  bright: 'var(--primary)',
  onBright: 'var(--primary-foreground)',
  /** Running text. */
  muted: 'var(--muted-foreground)',
  /** What is read last: counts, captions, a disabled label. */
  faint: 'var(--text-tertiary)',
  /** The hairline, and the edge it brightens to under the pointer. */
  edge: 'var(--border)',
  strong: 'var(--border-strong)',
  /** The edge of the thing currently chosen. */
  chosen: 'var(--border-selected)',
  /** What hangs from the bar, and the scrim under a dialog. */
  panel: 'var(--chrome-panel)',
  /** A wash for a control under the pointer. */
  wash: '$ink/6',
} as const;

/** The shadow hanzo.ai's filled control and cards stand on. */
export const lift = {
  control: '0 4px 20px -2px rgb(255 255 255 / .22), 0 2px 8px rgb(0 0 0 / .4)',
  card: '0 4px 20px -2px rgb(0 0 0 / .3)',
} as const;

/** Radii, as hanzo.ai rounds them: pills, cards, and the frame of a picture. */
export const round = {
  pill: 9999,
  card: 24,
  frame: 16,
  control: 12,
} as const;

/** The side gutter hanzo.ai's bar, pages and footer share. */
export const gutter = 'var(--page-gutter)';

/** A column of page, centred on the gutter. */
export const column = (maxW = 1152) =>
  ({ width: '100%', maxW, mx: 'auto', px: gutter }) as const;

/** The monospace face, for paths and commands. */
export const mono = { fontFamily: '$mono' } as const;
