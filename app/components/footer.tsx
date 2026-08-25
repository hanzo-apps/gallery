import Link from 'next/link';
import { HanzoLogo } from '@hanzo/logo/react';
import { YStack, XStack, Anchor, Text, H4 } from '@hanzo/ui';
import { Grid } from '@hanzo/ui/grid';
import { c, t, clip } from '../lib/design';

const rule = { borderColor: c.white10 } as const;

const item = {
  transition: 'quickest',
  color: c.gray400,
  ...t.sm,
  textDecorationLine: 'none',
  hoverStyle: { color: '#fff' },
} as const;

function Column({ head, links }: { head: string; links: [string, string][] }) {
  return (
    <YStack>
      <H4 {...t.base} fontWeight={700} color="#fff" marginBottom={16}>
        {head}
      </H4>
      <YStack gap={8}>
        {links.map(([label, href]) =>
          href.startsWith('http') ? (
            <Anchor key={label} href={href} target="_blank" rel="noopener noreferrer" {...item}>
              {label}
            </Anchor>
          ) : (
            <Anchor key={label} render={<Link href={href} />} {...item}>
              {label}
            </Anchor>
          ),
        )}
      </YStack>
    </YStack>
  );
}

export function Footer() {
  return (
    <YStack
      render="footer"
      paddingVertical={48}
      paddingHorizontal={16}
      backgroundColor="#000"
      borderTopWidth={1}
      {...rule}
    >
      <YStack width="100%" maxWidth={1152} marginLeft="auto" marginRight="auto">
        <Grid columns={{ min: 160, max: 4 }} gap={32} style={{ marginBottom: 32 }}>
          <YStack>
            <XStack alignItems="center" gap={12} marginBottom={16}>
              <HanzoLogo variant="white" size={28} />
              <Text {...t.xl} fontWeight={700} {...clip(c.washShort)}>
                Templates
              </Text>
            </XStack>
            <Text color={c.gray400} {...t.sm}>
              Premium UI/UX templates for modern web applications
            </Text>
          </YStack>

          <Column
            head="Product"
            links={[
              ['Templates', '/gallery'],
              ['Documentation', '/docs'],
              ['Pricing', '/pricing'],
            ]}
          />
          <Column
            head="Company"
            links={[
              ['About', '/about'],
              ['Hanzo AI', 'https://hanzo.ai'],
              ['GitHub', 'https://github.com/hanzoai'],
            ]}
          />
          <Column
            head="Legal"
            links={[
              ['Terms', '/terms'],
              ['Privacy', '/privacy'],
              ['License', '/license'],
            ]}
          />
        </Grid>

        <YStack alignItems="center" paddingTop={32} borderTopWidth={1} {...rule}>
          <Text color={c.gray400} {...t.sm}>
            © 2025 Hanzo AI Inc. All rights reserved.
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}
