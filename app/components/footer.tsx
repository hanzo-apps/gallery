'use client';

import { Anchor } from '@hanzo/ui';
import { Footer as Foot, type FooterColumn, type FooterLink } from '@hanzo/ui/marketing';
import { HanzoWordmark } from '@hanzogui/shell';
import { HANZO_FOOTER_BOTTOM } from '@hanzogui/shell/registry';
import { DOCS } from '../lib/links';

/**
 * hanzo.ai's footer — the same component, gutter and copyright line — carrying
 * the gallery's own links: each column's title is the page its subject lives on.
 */
const COLUMNS: FooterColumn[] = [
  {
    id: 'product',
    title: 'Product',
    href: '/gallery',
    links: [
      { label: 'Templates', href: '/gallery' },
      { label: 'Documentation', href: DOCS, out: true },
      { label: 'Pricing', href: 'https://hanzo.ai/pricing' },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    href: 'https://hanzo.ai/about',
    links: [
      { label: 'About', href: 'https://hanzo.ai/about' },
      { label: 'Hanzo AI', href: 'https://hanzo.ai' },
      { label: 'GitHub', href: 'https://github.com/hanzoai', out: true },
    ],
  },
];

const LEGAL: FooterLink[] = [
  { label: 'Terms', href: 'https://hanzo.ai/terms' },
  { label: 'Privacy', href: 'https://hanzo.ai/privacy' },
  { label: 'License', href: 'https://github.com/hanzo-apps/gallery/blob/main/LICENSE', out: true },
];

export function Footer() {
  return (
    <Foot
      gutter="var(--page-gutter)"
      columns={COLUMNS}
      legal={LEGAL}
      copyright={HANZO_FOOTER_BOTTOM.copyright}
      wordmark={
        <Anchor href="/" aria-label="Hanzo Gallery home" display="inline-flex" items="center" color="inherit" textDecorationLine="none">
          <HanzoWordmark label="Hanzo Gallery" size={20} />
        </Anchor>
      }
    />
  );
}
