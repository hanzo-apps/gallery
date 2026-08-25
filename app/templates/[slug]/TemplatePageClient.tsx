'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { YStack, XStack, H1, H2, H3, Text, Button, Anchor, Label } from '@hanzo/ui';
import { Grid } from '@hanzo/ui/grid';
import { frame, shot, sizes, type Size } from '../../lib/shot';
import type { Template } from '../../templates-data';
import { c, t, at, clip, hue, tint } from '../../lib/design';
import { Stars } from '../../components/stars';

interface TemplatePageClientProps {
  variants: Template[];
  prevTemplate: Template | null;
  nextTemplate: Template | null;
  currentIndex: number;
  totalTemplates: number;
  allTemplates: Template[];
}

/** The pill in the action bar, in its two states. */
const pill = {
  transition: 'quickest',
  height: 'auto',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 9999,
  borderWidth: 1,
} as const;

const outline = {
  ...pill,
  borderColor: c.neutral700,
  backgroundColor: 'transparent',
  hoverStyle: { backgroundColor: c.neutral800 },
} as const;

const still = {
  ...pill,
  borderColor: c.neutral800,
  backgroundColor: c.neutral900,
} as const;

/** A choice among framework variants, or among screenshot sizes. */
function Choice({ on, children, ...rest }: { on: boolean; children: React.ReactNode; [k: string]: unknown }) {
  return (
    <Button
      transition="quickest"
      height="auto"
      paddingHorizontal={24}
      paddingVertical={12}
      borderRadius="var(--radius-lg, 0.75rem)"
      borderWidth={2}
      {...(on
        ? { backgroundColor: c.blue500, borderColor: c.blue400 }
        : {
            backgroundColor: c.white5,
            borderColor: c.white10,
            hoverStyle: { borderColor: at(c.blue500, 0.5), backgroundColor: 'rgba(255,255,255,0.1)' },
          })}
      {...rest}
    >
      <Text fontWeight={500} color={on ? '#fff' : c.gray300} textTransform="capitalize">
        {children}
      </Text>
    </Button>
  );
}

/** A page section: centred column, optional lift off the ground. */
function Band({ children, lifted }: { children: React.ReactNode; lifted?: boolean }) {
  return (
    <YStack
      render="section"
      paddingHorizontal={16}
      paddingVertical={64}
      {...(lifted ? { backgroundColor: c.white5 } : {})}
    >
      <YStack width="100%" maxWidth={1024} marginLeft="auto" marginRight="auto">
        {children}
      </YStack>
    </YStack>
  );
}

const mono = { fontFamily: 'var(--font-zen-mono), monospace' } as const;

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

  return (
    <YStack minHeight="100vh" backgroundColor={c.ink}>
      <YStack
        render="nav"
        position="sticky"
        top={0}
        zIndex={50}
        backgroundColor="#000"
        borderBottomWidth={1}
        borderColor={c.neutral800}
      >
        <YStack borderBottomWidth={1} borderColor={c.neutral800}>
          <XStack
            width="100%"
            maxWidth={1280}
            marginLeft="auto"
            marginRight="auto"
            paddingHorizontal={16}
            paddingVertical={12}
            alignItems="center"
            justifyContent="space-between"
          >
            <Anchor
              render={<Link href="/gallery" />}
              transition="quickest"
              alignItems="center"
              gap={8}
              {...t.sm}
              color={c.neutral400}
              textDecorationLine="none"
              hoverStyle={{ color: '#fff' }}
            >
              ← Gallery
            </Anchor>

            <XStack alignItems="center" gap={12}>
              <Text {...t.xs} color={c.neutral500} fontWeight={500}>
                {currentIndex} / {totalTemplates}
              </Text>
              <XStack gap={8}>
                {prevTemplate ? (
                  <Button {...outline} render={<Link href={`/templates/${prevTemplate.slug}`} />} paddingVertical={6} paddingHorizontal={12}>
                    <Text {...t.xs} fontWeight={500} color={c.neutral300}>
                      ←
                    </Text>
                  </Button>
                ) : (
                  <Button {...pill} disabled borderColor={c.neutral800} backgroundColor="transparent" paddingVertical={6} paddingHorizontal={12} cursor="not-allowed">
                    <Text {...t.xs} color={c.neutral700}>
                      ←
                    </Text>
                  </Button>
                )}
                <Button
                  {...outline}
                  onPress={toRandom}
                  title="Random Template"
                  paddingVertical={6}
                  paddingHorizontal={12}
                  hoverStyle={{ backgroundColor: c.neutral800, borderColor: at(c.purple500, 0.5) }}
                >
                  <Text {...t.xs} fontWeight={500} color={c.neutral300}>
                    🎲
                  </Text>
                </Button>
                {nextTemplate ? (
                  <Button {...outline} render={<Link href={`/templates/${nextTemplate.slug}`} />} paddingVertical={6} paddingHorizontal={12}>
                    <Text {...t.xs} fontWeight={500} color={c.neutral300}>
                      →
                    </Text>
                  </Button>
                ) : (
                  <Button {...pill} disabled borderColor={c.neutral800} backgroundColor="transparent" paddingVertical={6} paddingHorizontal={12} cursor="not-allowed">
                    <Text {...t.xs} color={c.neutral700}>
                      →
                    </Text>
                  </Button>
                )}
              </XStack>
            </XStack>
          </XStack>
        </YStack>

        {/* Actions */}
        <XStack
          width="100%"
          maxWidth={1280}
          marginLeft="auto"
          marginRight="auto"
          paddingHorizontal={16}
          paddingVertical={8}
          overflow="scroll"
          data-scrollbar="none"
          style={{ scrollbarWidth: 'none' }}
        >
          <XStack gap={8} minWidth="max-content" alignItems="center">
            <Button {...outline} onPress={openRepo}>
              <Text {...t.xs} fontWeight={500} color={c.neutral300} whiteSpace="nowrap">
                📦 View on GitHub
              </Text>
            </Button>
            <Button {...outline} onPress={toFork}>
              <Text {...t.xs} fontWeight={500} color={c.neutral300} whiteSpace="nowrap">
                🚀 Deploy
              </Text>
            </Button>
            <Anchor
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              alignItems="center"
              whiteSpace="nowrap"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://hanzo.app/deploy-badge.svg" alt="Deploy on Hanzo" height={36} style={{ height: 36 }} />
            </Anchor>
            <Button {...outline} onPress={() => copyPath('Path copied!')}>
              <Text {...t.xs} fontWeight={500} color={c.neutral300} whiteSpace="nowrap">
                📋 Copy Path
              </Text>
            </Button>
            <Text {...still} {...t.xs} fontWeight={500} color={c.neutral400} whiteSpace="nowrap">
              {pick.framework}
            </Text>
            <Text {...still} {...t.xs} fontWeight={500} color={c.neutral400} whiteSpace="nowrap">
              {pick.category}
            </Text>
            <Text
              {...pill}
              {...t.xs}
              fontWeight={500}
              whiteSpace="nowrap"
              {...deep(pick.tier)}
            >
              Tier {pick.tier}
            </Text>
          </XStack>
        </XStack>
      </YStack>

      {/* Hero */}
      <Band>
        <XStack alignItems="center" gap={12} marginBottom={24} flexWrap="wrap">
          <H1 {...t.xl6} fontWeight={700} {...clip(c.wash)}>
            {pick.displayName}
          </H1>
          <Stars n={pick.rating} size={t.xl2} />
        </XStack>
        <Text {...t.xl2} color={c.gray400} marginBottom={32}>
          {pick.description || `Premium ${pick.displayName} template with modern design and functionality.`}
        </Text>

        {variants.length > 1 && (
          <YStack marginBottom={32}>
            <Label {...t.sm} fontWeight={500} color={c.gray400} marginBottom={12}>
              Choose Framework ({variants.length} variants available)
            </Label>
            <XStack flexWrap="wrap" gap={12}>
              {variants.map((v) => (
                <Choice key={v.id} on={pick.id === v.id} onPress={() => setPick(v)}>
                  {v.framework}
                </Choice>
              ))}
            </XStack>
          </YStack>
        )}

        {/* Tech stack */}
        <XStack flexWrap="wrap" gap={12} marginBottom={48}>
          <Chip {...tint('blue')}>{pick.framework}</Chip>
          <Chip {...tint(hue(pick.tier))}>
            Tier {pick.tier} - {pick.tier === 1 ? 'Excellent' : pick.tier === 2 ? 'Very Good' : 'Good'}
          </Chip>
          <Chip {...tint('purple')}>{pick.components}</Chip>
          <Chip backgroundColor={at(c.gray500, 0.2)} borderColor={at(c.gray500, 0.3)} color={c.gray300}>
            {pick.category}
          </Chip>
        </XStack>

        {/* Screenshot */}
        <YStack marginBottom={64}>
          <XStack flexWrap="wrap" gap={12} marginBottom={16}>
            {sizes.map((s) => (
              <Choice key={s} on={size === s} onPress={() => setSize(s)}>
                {s}
              </Choice>
            ))}
          </XStack>
          <YStack
            position="relative"
            marginLeft="auto"
            marginRight="auto"
            {...frame[size]}
            borderRadius="var(--radius-2xl, 1.5rem)"
            overflow="hidden"
            borderWidth={1}
            borderColor={c.white10}
            boxShadow={`0 25px 50px ${at(c.blue500, 0.2)}`}
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
      <Band lifted>
        <H2 {...t.xl4} fontWeight={700} color="#fff" marginBottom={32}>
          Key Features
        </H2>
        <Grid columns={{ min: 300, max: 2 }} gap={24}>
          {pick.features.map((feature, i) => (
            <YStack
              key={i}
              transition="quickest"
              backgroundColor={c.white5}
              backdropFilter="blur(16px)"
              padding={24}
              borderRadius="var(--radius-xl, 1rem)"
              borderWidth={1}
              borderColor={c.white10}
              hoverStyle={{ borderColor: at(c.blue500, 0.5) }}
            >
              <Text {...t.xl3} marginBottom={12}>
                ✨
              </Text>
              <H3 {...t.xl} fontWeight={700} color="#fff" marginBottom={8}>
                {feature}
              </H3>
            </YStack>
          ))}
        </Grid>
      </Band>

      {/* Technology */}
      <Band>
        <H2 {...t.xl4} fontWeight={700} color="#fff" marginBottom={32}>
          Technology Stack
        </H2>
        <YStack
          backgroundImage={`linear-gradient(to right, ${at(c.blue500, 0.1)}, ${at(c.purple500, 0.1)})`}
          backdropFilter="blur(16px)"
          padding={32}
          borderRadius="var(--radius-2xl, 1.5rem)"
          borderWidth={1}
          borderColor={c.white10}
        >
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
              <YStack key={head}>
                <H3 {...t.lg} fontWeight={700} color={c.blue400} marginBottom={8}>
                  {head}
                </H3>
                <Text color={c.gray300}>{body}</Text>
              </YStack>
            ))}
          </Grid>
        </YStack>
      </Band>

      {/* Quick start */}
      <Band lifted>
        <H2 {...t.xl4} fontWeight={700} color="#fff" marginBottom={32}>
          Quick Start
        </H2>
        <YStack
          backgroundColor="rgba(0,0,0,0.5)"
          backdropFilter="blur(16px)"
          padding={32}
          borderRadius="var(--radius-2xl, 1.5rem)"
          borderWidth={1}
          borderColor={c.white10}
          {...mono}
        >
          {(
            [
              ['# Navigate to template directory', `cd ${pick.path}`],
              ['# Install dependencies', 'npm install'],
              ['# Start development server', start],
              ...(pick.port ? ([['# Open in browser', `http://localhost:${pick.port}`]] as [string, string][]) : []),
            ] as [string, string][]
          ).map(([note, line]) => (
            <YStack key={note}>
              <Text {...mono} color={c.gray400} marginBottom={16}>
                {note}
              </Text>
              <Text {...mono} color={c.green400} marginBottom={24}>
                {line}
              </Text>
            </YStack>
          ))}
        </YStack>
      </Band>

      {/* Perfect for */}
      <Band>
        <H2 {...t.xl4} fontWeight={700} color="#fff" marginBottom={32}>
          Perfect For
        </H2>
        <Grid columns={{ min: 260, max: 3 }} gap={24}>
          {(
            [
              ['🚀', pick.useCase, 'Primary use case for this template', [c.blue500, c.purple500]],
              ['⚡', 'Fast Development', 'Pre-built components ready to use', [c.green500, c.blue500]],
              ['🎨', 'Modern Design', 'Beautiful UI following latest trends', [c.purple500, c.pink500]],
            ] as [string, string, string, [string, string]][]
          ).map(([icon, head, note, [from, to]]) => (
            <YStack
              key={head}
              backgroundImage={`linear-gradient(to bottom right, ${at(from, 0.1)}, ${at(to, 0.1)})`}
              padding={24}
              borderRadius="var(--radius-xl, 1rem)"
              borderWidth={1}
              borderColor={c.white10}
            >
              <Text {...t.xl3} marginBottom={12}>
                {icon}
              </Text>
              <H3 {...t.lg} fontWeight={700} color="#fff" marginBottom={8}>
                {head}
              </H3>
              <Text {...t.sm} color={c.gray400}>
                {note}
              </Text>
            </YStack>
          ))}
        </Grid>
      </Band>

      {/* Call to action */}
      <Band>
        <YStack
          backgroundImage={`linear-gradient(to right, ${at(c.blue500, 0.2)}, ${at(c.purple500, 0.2)})`}
          backdropFilter="blur(16px)"
          padding={48}
          borderRadius="var(--radius-2xl, 1.5rem)"
          borderWidth={1}
          borderColor={c.white10}
          alignItems="center"
        >
          <H2 {...t.xl4} fontWeight={700} color="#fff" marginBottom={24} textAlign="center">
            Get Started with Hanzo AI
          </H2>
          <Text {...t.xl} color={c.gray400} marginBottom={32} textAlign="center">
            This template is part of the Hanzo AI premium template collection
          </Text>
          <XStack flexWrap="wrap" gap={16} justifyContent="center">
            <Cta onPress={openRepo} ground={c.neutral700} lift={c.neutral600}>
              📦 View on GitHub
            </Cta>
            <Cta onPress={toFork} ground={c.purple500} lift={c.purple600}>
              🚀 Deploy to Hanzo
            </Cta>
            <Cta onPress={() => copyPath('Path copied to clipboard!')} ground={c.blue500} lift={c.blue600}>
              📋 Copy Path
            </Cta>
            <Button
              render={<Link href="/gallery" />}
              transition="quickest"
              height="auto"
              paddingHorizontal={32}
              paddingVertical={16}
              borderRadius="var(--radius-xl, 1rem)"
              backgroundColor="rgba(255,255,255,0.1)"
              borderWidth={1}
              borderColor={c.white20}
              hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text {...t.lg} fontWeight={700} color="#fff">
                Browse More Templates
              </Text>
            </Button>
          </XStack>
        </YStack>
      </Band>
    </YStack>
  );
}

/** A rounded chip carrying a tint. */
function Chip({ children, ...rest }: { children: React.ReactNode; [k: string]: unknown }) {
  return (
    <Text
      paddingHorizontal={16}
      paddingVertical={8}
      borderRadius="var(--radius-lg, 0.75rem)"
      borderWidth={1}
      fontWeight={500}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** One of the four buttons at the foot of the page. */
function Cta({
  children,
  ground,
  lift,
  onPress,
}: {
  children: React.ReactNode;
  ground: string;
  lift: string;
  onPress: () => void;
}) {
  return (
    <Button
      onPress={onPress}
      transition="quickest"
      height="auto"
      paddingHorizontal={32}
      paddingVertical={16}
      borderRadius="var(--radius-xl, 1rem)"
      backgroundColor={ground}
      boxShadow={`0 10px 15px ${at(ground, 0.5)}`}
      hoverStyle={{ backgroundColor: lift, scale: 1.05, boxShadow: `0 10px 15px ${at(lift, 0.7)}` }}
    >
      <Text {...t.lg} fontWeight={700} color="#fff">
        {children}
      </Text>
    </Button>
  );
}

/** The action bar's tier mark: a deep ground under a bright label. */
function deep(tier: number) {
  const h = hue(tier);
  const edge = { green: c.green800, blue: c.blue800, purple: c.purple800 }[h];
  const ground = { green: c.green950, blue: c.blue950, purple: c.purple950 }[h];
  const ink = { green: c.green400, blue: c.blue400, purple: c.purple400 }[h];
  return { borderColor: edge, backgroundColor: ground, color: ink };
}
