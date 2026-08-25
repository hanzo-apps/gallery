import type { Conf } from '@hanzo/ui/gui-config';

/**
 * Names the motion scale @hanzo/ui configures, so `animation="quickest"` is a
 * checked value rather than a rejected prop.
 *
 * Only `animations` is declared. gui builds its prop types from whatever this
 * interface carries and falls back to the generic config for the rest, so
 * naming the whole config here would also switch the style props to the
 * shorthand-only spelling the config asks for — a rename of every prop in the
 * app, bought for nothing.
 */
declare module '@hanzogui/web' {
  interface GuiCustomConfig {
    animations: Conf['animations'];
  }
}
