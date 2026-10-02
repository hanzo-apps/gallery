'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { YStack, XStack, Text, Anchor } from '@hanzo/ui';
import { Grid } from '@hanzo/ui/grid';
import { Action, Chip, Display, Leaf, Lede, Line, More, Title } from '@hanzo/ui/marketing';
import { MARKS } from '@hanzogui/shell';
import { frame, shot, sizes, type Size } from '../../lib/shot';
import type { Template } from '../../templates-data';
import { c, column, lift, mono, round } from '../../lib/design';
import { Stars } from '../../components/stars';
import { HEADER } from '../../components/header';

interface TemplatePageClientProps {
  variants: Template[];
  prevTemplate: Template | null;
  nextTemplate: Template | null;
  currentIndex: number;
  totalTemplates: number;
  allTemplates: Template[];
}

/** A pill in the bar: an outline that brightens under the pointer. */
const pill = {
  display: 'inline-flex',
  items: 'center',
  justify: 'center',
  gap: 6,
  height: 32,
  px: 12,
  rounded: round.pill,
  borderWidth: 1,
  borderColor: c.edge,
  bg: 'transparent',
  color: c.muted,
  fontSize: '$2',
  lineHeight: 18,
  fontWeight: '500',
  whiteSpace: 'nowrap',
  textDecorationLine: 'none',
  cursor: 'pointer',
  hoverStyle: { borderColor: c.strong, color: c.ink, bg: c.wash },
} as const;

/** The same pill with nowhere to go: the first template has no previous one. */
const spent = { ...pill, color: c.faint, cursor: 'not-allowed', hoverStyle: {} } as const;

/** A choice among framework variants, or among screenshot sizes. */
function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Text
      render="button"
      onClick={onClick}
      aria-pressed={on}
      display="inline-flex"
      items="center"
      height={40}
      px={20}
      rounded={round.pill}
      borderWidth={1}
      borderColor={on ? c.chosen : c.edge}
      bg={on ? c.wash : 'transparent'}
      color={on ? c.ink : c.muted}
      fontSize="$2"
      lineHeight={18}
      fontWeight="500"
      textTransform="capitalize"
      cursor="pointer"
      hoverStyle={{ borderColor: on ? c.chosen : c.strong, color: c.ink }}
    >
      {children}
    </Text>
  );
}

/** A page section on the gutter. */
function Band({ children }: { children: ReactNode }) {
  return (
    <YStack render="section" py={56}>
      <YStack {...column(1024)}>{children}</YStack>
    </YStack>
  );
}

/** A card: the raised ground, the hairline, hanzo.ai's corner. */
const card = { bg: c.card, borderColor: c.edge, rounded: round.card, hoverStyle: { borderColor: c.strong } } as const;

export function TemplatePageClient({
  variants,
  prevTemplate,
  nextTemplate,
  currentIndex,
  totalTemplates,
  allTemplates,
}: TemplatePageClientProps) {
  const router = useRouter();
  const [pick, setPick] = useState<Template>(variants[0]);
  const [size, setSize] = useState<Size>('desktop');
  const [absent, setAbsent] = useState<Set<string>>(new Set());

  // Canonical repo URL for the selected variant (single source of truth).
  const repo = `https://github.com/hanzo-apps/template-${pick.slug}`;
  const deployUrl = `https://hanzo.app/new?template=${encodeURIComponent(repo)}`;

  // Templates without a capture at this size fall back to the desktop one.
  const src = shot(pick.screenshot, size);
  const shown = absent.has(src) ? shot(pick.screenshot) : src;

  function toRandom() {
    const others = allTemplates.filter((x) => x.slug !== variants[0].slug);
    if (others.length > 0) router.push(`/templates/${others[Math.floor(Math.random() * others.length)].slug}`);
  }

  const openRepo = () => window.open(repo, '_blank');
  const toFork = () => {
    window.location.href = `/gallery?fork=${pick.id}`;
  };
  const copyPath = (said: string) => {
    navigator.clipboard.writeText(pick.path);
    alert(said);
  };

  const start = pick.framework.toLowerCase().includes('html')
    ? 'gulp'
    : pick.framework.toLowerCase().includes('react') && !pick.framework.toLowerCase().includes('next')
      ? 'npm start'
      : 'npm run dev';

  const tier = pick.tier === 1 ? 'Excellent' : pick.tier === 2 ? 'Very Good' : 'Good';

  return (
    <YStack minH="100vh" bg={c.ground}>
      <YStack render="nav" position="sticky" t={HEADER} z={40} bg={c.ground} borderBottomWidth={1} borderColor={c.edge}>
        <XStack {...column(1280)} py={10} items="center" justify="space-between" gap={12}>
          <More href="/gallery">← Gallery</More>

          <XStack items="center" gap={12}>
            <Text fontSize="$1" lineHeight={16} color={c.faint} fontWeight="500">
              {currentIndex} / {totalTemplates}
            </Text>
            <XStack gap={8}>
              {prevTemplate ? (
                <Text render={<Link href={`/templates/${prevTemplate.slug}`} />} aria-label="Previous template" {...pill}>
                  ←
                </Text>
              ) : (
                <Text render="button" disabled aria-label="Previous template" {...spent}>
                  ←
                </Text>
              )}
              <Text render="button" onClick={toRandom} aria-label="Random template" {...pill}>
                <MARKS.spark size={14} />
              </Text>
              {nextTemplate ? (
                <Text render={<Link href={`/templates/${nextTemplate.slug}`} />} aria-label="Next template" {...pill}>
                  →
                </Text>
              ) : (
                <Text render="button" disabled aria-label="Next template" {...spent}>
                  →
                </Text>
              )}
            </XStack>
          </XStack>
        </XStack>

        {/* Actions: the row scrolls inside itself on a narrow screen. */}
        <XStack
          {...column(1280)}
          pb={10}
          overflow="scroll"
          data-scrollbar="none"
          style={{ scrollbarWidth: 'none' }}
        >
          <XStack gap={8} minW="max-content" items="center">
            <Text render="button" onClick={openRepo} {...pill}>
              View on GitHub
            </Text>
            <Text render="button" onClick={toFork} {...pill}>
              Deploy
            </Text>
            <Anchor href={deployUrl} target="_blank" rel="noopener noreferrer" items="center" whiteSpace="nowrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://hanzo.app/deploy-badge.svg" alt="Deploy on Hanzo" height={32} style={{ height: 32 }} />
            </Anchor>
            <Text render="button" onClick={() => copyPath('Path copied!')} {...pill}>
              Copy path
            </Text>
            <Chip px={12} py={6}>
              {pick.framework}
            </Chip>
            <Chip px={12} py={6}>
              {pick.category}
            </Chip>
            <Chip px={12} py={6}>
              Tier {pick.tier}
            </Chip>
          </XStack>
        </XStack>
      </YStack>

      {/* Hero */}
      <Band>
        <XStack items="center" gap={16} mb={16} flexWrap="wrap">
          <Display>{pick.displayName}</Display>
          <Stars n={pick.rating} size="$7" />
        </XStack>
        <Lede fontSize="$6" lineHeight={28} mb={32} maxW={720}>
          {pick.description || `Premium ${pick.displayName} template with modern design and functionality.`}
        </Lede>

        {variants.length > 1 && (
          <YStack mb={32} gap={12}>
            <Line size="sm" tone="muted" weight="500">
              Choose Framework ({variants.length} variants available)
            </Line>
            <XStack flexWrap="wrap" gap={8}>
              {variants.map((v) => (
                <Choice key={v.id} on={pick.id === v.id} onClick={() => setPick(v)}>
                  {v.framework}
                </Choice>
              ))}
            </XStack>
          </YStack>
        )}

        {/* Tech stack */}
        <XStack flexWrap="wrap" gap={8} mb={48}>
          <Chip px={14} py={6}>
            {pick.framework}
          </Chip>
          <Chip px={14} py={6}>
            Tier {pick.tier} - {tier}
          </Chip>
          <Chip px={14} py={6}>
            {pick.components}
          </Chip>
          <Chip px={14} py={6}>
            {pick.category}
          </Chip>
        </XStack>

        {/* Screenshot */}
        <YStack>
          <XStack flexWrap="wrap" gap={8} mb={16}>
            {sizes.map((s) => (
              <Choice key={s} on={size === s} onClick={() => setSize(s)}>
                {s}
              </Choice>
            ))}
          </XStack>
          <YStack
            position="relative"
            mx="auto"
            width="100%"
            aspectRatio={frame[size].aspectRatio}
            maxW={frame[size].maxWidth}
            rounded={round.frame}
            overflow="hidden"
            borderWidth={1}
            borderColor={c.edge}
            bg={c.raised}
            boxShadow={lift.card}
          >
            <Image
              src={shown}
              alt={pick.displayName}
              fill
              unoptimized
              onError={() => setAbsent((prev) => new Set(prev).add(src))}
              style={{ objectFit: shown === src ? 'cover' : 'contain' }}
              priority
            />
          </YStack>
        </YStack>
      </Band>

      {/* Features */}
      <Band>
        <Title mb={24}>Key Features</Title>
        <Grid columns={{ min: 300, max: 2 }} gap={16}>
          {pick.features.map((feature, i) => (
            <Leaf key={i} {...card} p={24}>
              <Line size="lg" weight="500">
                {feature}
              </Line>
            </Leaf>
          ))}
        </Grid>
      </Band>

      {/* Technology */}
      <Band>
        <Title mb={24}>Technology Stack</Title>
        <YStack bg={c.card} p={32} rounded={round.card} borderWidth={1} borderColor={c.edge}>
          <Grid columns={{ min: 200, max: 3 }} gap={24}>
            {(
              [
                ['Framework', pick.framework],
                ['Use Case', pick.useCase],
                [
                  'Setup Difficulty',
                  `${pick.easeOfSetup}/5 - ${pick.easeOfSetup >= 5 ? 'Very Easy' : pick.easeOfSetup >= 4 ? 'Easy' : 'Moderate'}`,
                ],
              ] as [string, string][]
            ).map(([head, body]) => (
              <YStack key={head} gap={8}>
                <Line size="sm" tone="muted" weight="500">
                  {head}
                </Line>
                <Line size="base">{body}</Line>
              </YStack>
            ))}
          </Grid>
        </YStack>
      </Band>

      {/* Quick start */}
      <Band>
        <Title mb={24}>Quick Start</Title>
        <YStack bg={c.ground} p={32} rounded={round.card} borderWidth={1} borderColor={c.edge} gap={24}>
          {(
            [
              ['# Navigate to template directory', `cd ${pick.path}`],
              ['# Install dependencies', 'npm install'],
              ['# Start development server', start],
              ...(pick.port ? ([['# Open in browser', `http://localhost:${pick.port}`]] as [string, string][]) : []),
            ] as [string, string][]
          ).map(([note, line]) => (
            <YStack key={note} gap={8}>
              <Text {...mono} fontSize="$2" lineHeight={20} color={c.faint}>
                {note}
              </Text>
              <Text {...mono} fontSize="$2" lineHeight={20} color={c.ink} style={{ overflowWrap: 'anywhere' }}>
                {line}
              </Text>
            </YStack>
          ))}
        </YStack>
      </Band>

      {/* Perfect for */}
      <Band>
        <Title mb={24}>Perfect For</Title>
        <Grid columns={{ min: 260, max: 3 }} gap={16}>
          {(
            [
              [pick.useCase, 'Primary use case for this template'],
              ['Fast Development', 'Pre-built components ready to use'],
              ['Modern Design', 'Beautiful UI following latest trends'],
            ] as [string, string][]
          ).map(([head, note]) => (
            <Leaf key={head} {...card} p={24}>
              <Line render="h3" size="lg" weight="500" display="block" mb={8}>
                {head}
              </Line>
              <Line size="sm" tone="muted">
                {note}
              </Line>
            </Leaf>
          ))}
        </Grid>
      </Band>

      {/* Call to action */}
      <Band>
        <YStack bg={c.card} p={48} rounded={round.card} borderWidth={1} borderColor={c.edge} items="center" gap={16}>
          <Title text="center">Get Started with Hanzo AI</Title>
          <Lede text="center" mb={16}>
            This template is part of the Hanzo AI premium template collection
          </Lede>
          <XStack flexWrap="wrap" gap={12} justify="center">
            <Action render="button" onClick={openRepo}>
              View on GitHub
            </Action>
            <Action render="button" fill onClick={toFork}>
              Deploy to Hanzo
            </Action>
            <Action render="button" onClick={() => copyPath('Path copied to clipboard!')}>
              Copy path
            </Action>
            <Action href="/gallery">Browse More Templates</Action>
          </XStack>
        </YStack>
      </Band>
    </YStack>
  );
}
