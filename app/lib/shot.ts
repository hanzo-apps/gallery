// One way to address a screenshot. The bare name is the desktop capture;
// tablet and phone captures sit beside it under the same name.
export const sizes = ['desktop', 'tablet', 'mobile'] as const;

export type Size = (typeof sizes)[number];

export function shot(name: string, size: Size = 'desktop'): string {
  return `/screenshots/${name}${size === 'desktop' ? '' : `-${size}`}.png`;
}

// Frames at the real capture geometry: 16:9, 834x1112, 390x844. The widths
// give all three the same height, so switching reads as a change of device
// rather than a change of scale.
export const frame: Record<Size, string> = {
  desktop: 'aspect-video w-full',
  tablet: 'aspect-[834/1112] w-full max-w-[480px]',
  mobile: 'aspect-[390/844] w-full max-w-[296px]',
};
