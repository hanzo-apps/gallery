'use client';

import Link from 'next/link';
import { HanzoLogo } from '@hanzo/logo/react';
import { XStack, YStack, Anchor, Text } from '@hanzo/ui';
import { c, t } from '../lib/design';

const link = {
  transition: 'quickest',
  color: c.gray300,
  ...t.base,
  textDecorationLine: 'none',
  hoverStyle: { color: '#fff' },
} as const;

export function Header() {
  return (
    <YStack
      render="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={50}
      backgroundColor="rgba(0,0,0,0.8)"
      backdropFilter="blur(16px)"
      borderBottomWidth={1}
      borderColor={c.white10}
    >
      <XStack
        width="100%"
        maxWidth={1280}
        marginLeft="auto"
        marginRight="auto"
        paddingLeft={16}
        paddingRight={16}
        height={64}
        alignItems="center"
        justifyContent="space-between"
      >
        <XStack
          render={<Link href="/" />}
          transition="quickest"
          alignItems="center"
          gap={12}
          hoverStyle={{ opacity: 0.8 }}
        >
          <HanzoLogo variant="white" size={32} />
          <Text {...t.xl} fontWeight={700} color="#fff">
            Templates
          </Text>
        </XStack>

        <XStack render="nav" display="none" $md={{ display: 'flex' }} alignItems="center" gap={32}>
          <Anchor render={<Link href="/gallery" />} {...link}>
            Browse
          </Anchor>
          <Anchor render={<Link href="/docs" />} {...link}>
            Docs
          </Anchor>
          <Anchor href="https://github.com/hanzoai" target="_blank" rel="noopener noreferrer" {...link}>
            GitHub
          </Anchor>
          <Anchor
            href="https://hanzo.ai"
            target="_blank"
            rel="noopener noreferrer"
            transition="quickest"
            paddingLeft={24}
            paddingRight={24}
            paddingTop={8}
            paddingBottom={8}
            borderRadius={8}
            {...t.base}
            fontWeight={600}
            color="#fff"
            textDecorationLine="none"
            backgroundImage={c.brand}
            hoverStyle={{ backgroundImage: c.brandHover, scale: 1.05 }}
          >
            Hanzo AI
          </Anchor>
        </XStack>

        <Text
          render="button"
          $md={{ display: 'none' }}
          padding={8}
          color={c.gray300}
          cursor="pointer"
          hoverStyle={{ color: '#fff' }}
        >
          <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Text>
      </XStack>
    </YStack>
  );
}
