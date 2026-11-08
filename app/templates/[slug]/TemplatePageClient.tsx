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
import { blur, c, column, lift, mono, round } from '../../lib/design';
import { assembleProjectConfig, getBlueprint } from '../../lib/template-assembly';
import { ForkModal } from '../../components/ForkModal';
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
  const [stageMode, setStageMode] = useState<'capture' | 'live'>('capture');
  const [forking, setForking] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [absent, setAbsent] = useState<Set<string>>(new Set());

  const blueprint = getBlueprint(pick);
  const assembled = assembleProjectConfig(pick);
  const repo = blueprint.repo;
  const deployUrl = assembled.studioBuildUrl;
  const platformUrl = assembled.platformDeployUrl;
  const hanzoEditUrl = assembled.hanzoEditUrl;
  const previewUrl = blueprint.previewUrl;

  // Templates without a capture at this size fall back to the desktop one.
  const src = shot(pick.screenshot, size);
  const shown = absent.has(src) ? shot(pick.screenshot) : src;

  function toRandom() {
    const others = allTemplates.filter((x) => x.slug !== variants[0].slug);
    if (others.length > 0) router.push(`/templates/${others[Math.floor(Math.random() * others.length)].slug}`);
  }

  const openRepo = () => window.open(repo, '_blank', 'noopener,noreferrer');
  const openPreviewTab = () => window.open(previewUrl, '_blank', 'noopener,noreferrer');
  const toFork = () => setForking(true);
  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 2000);
  };

  const start = pick.framework.toLowerCase().includes('html')
    ? 'gulp'
    : pick.framework.toLowerCase().includes('react') && !pick.framework.toLowerCase().includes('next') && !pick.framework.toLowerCase().includes('vite')
      ? 'npm start'
      : 'npm run dev';

  const tier = pick.tier === 1 ? 'Excellent' : pick.tier === 2 ? 'Very Good' : 'Good';

  return (
    <YStack minH="100vh" bg={c.ground}>
      <YStack
        render="nav"
        position="sticky"
        t={HEADER}
        z={40}
        bg={c.glass}
        backdropFilter={blur}
        borderBottomWidth={1}
        borderColor={c.edge}
      >
        <XStack {...column(1280)} py={10} items="center" justify="space-between" gap={12} flexWrap="wrap">
          <XStack items="center" gap={12}>
            <More href="/gallery">← Gallery</More>
            <Chip px={10} py={2} fontSize="$1">
              {pick.framework}
            </Chip>
            <Chip px={10} py={2} fontSize="$1">
              {pick.category}
            </Chip>
          </XStack>

          <XStack items="center" gap={8} flexWrap="wrap">
            <Text render="button" onClick={() => setStageMode(stageMode === 'live' ? 'capture' : 'live')} {...pill}>
              {stageMode === 'live' ? 'Show Capture' : 'Live Preview'}
            </Text>
            <Text render="button" onClick={openPreviewTab} {...pill}>
              Fullscreen Preview ↗
            </Text>
            <Anchor href={hanzoEditUrl} target="_blank" rel="noopener noreferrer" {...pill}>
              Edit in Hanzo.ai ↗
            </Anchor>
            <Anchor href={platformUrl} target="_blank" rel="noopener noreferrer" {...pill}>
              Deploy to Platform ↗
            </Anchor>
            <Text
              render="button"
              onClick={toFork}
              {...pill}
              bg={c.bright}
              color={c.onBright}
              borderColor={c.bright}
              hoverStyle={{ opacity: 0.9 }}
            >
              Deploy to Hanzo
            </Text>
            <Text fontSize="$1" lineHeight={16} color={c.faint} fontWeight="500" ml={4}>
              {currentIndex} / {totalTemplates}
            </Text>
            <XStack gap={6}>
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
      </YStack>

      {/* Hero */}
      <Band>
        <XStack items="flex-start" justify="space-between" gap={20} mb={16} flexWrap="wrap">
          <YStack gap={12} maxW={720}>
            <XStack items="center" gap={16} flexWrap="wrap">
              <Display>{pick.displayName}</Display>
              <Stars n={pick.rating} size="$7" />
            </XStack>
            <Lede fontSize="$6" lineHeight={28}>
              {pick.description || `Premium ${pick.displayName} template with modern design and functionality.`}
            </Lede>
          </YStack>
          <XStack gap={10} flexWrap="wrap" pt={8}>
            <Action fill render="button" onClick={toFork}>
              Deploy to Hanzo
            </Action>
            <Action href={hanzoEditUrl}>
              Edit in Hanzo.ai ↗
            </Action>
            <Action render="button" onClick={() => setStageMode(stageMode === 'live' ? 'capture' : 'live')}>
              {stageMode === 'live' ? 'Responsive Captures' : 'Interactive Live Preview'}
            </Action>
            <Action render="button" onClick={openPreviewTab}>
              Open Fullscreen ↗
            </Action>
          </XStack>
        </XStack>

        {variants.length > 1 && (
          <YStack mb={28} gap={12}>
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

        {/* Tech stack & modular blocks */}
        <XStack flexWrap="wrap" gap={8} mb={36}>
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
          {blueprint.blocks.map((block) => (
            <Chip key={block} px={12} py={6}>
              {block}
            </Chip>
          ))}
        </XStack>

        {/* Interactive Stage: Responsive Captures + Embedded Live Preview */}
        <YStack>
          <XStack items="center" justify="space-between" flexWrap="wrap" gap={12} mb={16}>
            <XStack flexWrap="wrap" gap={8}>
              {sizes.map((s) => (
                <Choice key={s} on={size === s} onClick={() => setSize(s)}>
                  {s}
                </Choice>
              ))}
            </XStack>
            <XStack flexWrap="wrap" gap={8}>
              <Choice on={stageMode === 'capture'} onClick={() => setStageMode('capture')}>
                Screenshots
              </Choice>
              <Choice on={stageMode === 'live'} onClick={() => setStageMode('live')}>
                Live Preview
              </Choice>
              <Text render="button" onClick={openPreviewTab} {...pill} height={40} px={16}>
                New Tab ↗
              </Text>
            </XStack>
          </XStack>

          {stageMode === 'live' ? (
            <YStack
              position="relative"
              mx="auto"
              width="100%"
              height={size === 'mobile' ? 760 : size === 'tablet' ? 680 : 640}
              maxW={frame[size].maxWidth}
              rounded={round.frame}
              overflow="hidden"
              borderWidth={1}
              borderColor={c.edge}
              bg={c.raised}
              boxShadow={lift.card}
            >
              <iframe
                src={previewUrl}
                title={`${pick.displayName} Live Preview`}
                style={{ width: '100%', height: '100%', border: '0', background: '#0a0a0a' }}
              />
            </YStack>
          ) : (
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
          )}
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

      {/* Quick start & Automated Hanzo Platform Deployment */}
      <Band>
        <XStack items="center" justify="space-between" mb={24} flexWrap="wrap" gap={12}>
          <Title>Hanzo Cloud Stack · AI, API Keys & Insights Out of the Box</Title>
          <XStack gap={8} flexWrap="wrap">
            <Action href="https://console.hanzo.ai/keys" minH={36} px={14}>
              Get Hanzo API Key ↗
            </Action>
            <Action href="https://analytics.hanzo.ai" minH={36} px={14}>
              Open Hanzo Insights ↗
            </Action>
            <Action render="button" onClick={() => copyText(assembled.llmMd, 'llm')} minH={36} px={14}>
              {copiedKey === 'llm' ? 'Copied LLM.md ✓' : 'Copy LLM.md'}
            </Action>
            <Action href={assembled.llmMdUrl} minH={36} px={14}>
              View LLM.md ↗
            </Action>
            <Action render="button" onClick={() => copyText(assembled.hanzoSdkCode, 'sdk')} minH={36} px={14}>
              {copiedKey === 'sdk' ? 'Copied SDK ✓' : 'Copy src/lib/hanzo.ts'}
            </Action>
            <Action render="button" onClick={() => copyText(assembled.platformCliCommand, 'cli')} minH={36} px={14}>
              {copiedKey === 'cli' ? 'Copied CLI ✓' : 'Copy 1-Click CLI'}
            </Action>
            <Action render="button" onClick={() => copyText(assembled.hanzoYaml, 'yaml')} minH={36} px={14}>
              {copiedKey === 'yaml' ? 'Copied hanzo.yml ✓' : 'Copy hanzo.yml'}
            </Action>
          </XStack>
        </XStack>
        <XStack flexWrap="wrap" gap={8} mb={20}>
          {blueprint.cloudServices.map((svc) => (
            <Chip key={svc} px={12} py={6}>
              ✓ {svc}
            </Chip>
          ))}
        </XStack>
        <YStack bg={c.ground} p={32} rounded={round.card} borderWidth={1} borderColor={c.edge} gap={24}>
          {(
            [
              ['# 1-Click Automated Deploy to Hanzo Platform (Zen AI + Insights)', assembled.platformCliCommand],
              ['# Edit & customize directly in Hanzo.ai Chat + Dev', hanzoEditUrl],
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
          <Title text="center">Deploy to Hanzo Platform</Title>
          <Lede text="center" mb={16}>
            Parameterize, preview, and deploy {pick.displayName} to Hanzo global edge infrastructure in one click.
          </Lede>
          <XStack flexWrap="wrap" gap={12} justify="center">
            <Action render="button" fill onClick={toFork}>
              Deploy to Hanzo
            </Action>
            <Action href={hanzoEditUrl}>
              Edit in Hanzo.ai ↗
            </Action>
            <Action href={platformUrl}>
              Deploy on Platform ↗
            </Action>
            <Action href={deployUrl}>
              Open in Studio ↗
            </Action>
            <Action render="button" onClick={openPreviewTab}>
              Live Preview ↗
            </Action>
            <Action render="button" onClick={openRepo}>
              View on GitHub
            </Action>
            <Action render="button" onClick={() => copyText(pick.path, 'path')}>
              {copiedKey === 'path' ? 'Path Copied ✓' : 'Copy path'}
            </Action>
          </XStack>
        </YStack>
      </Band>

      {forking && <ForkModal template={pick} onClose={() => setForking(false)} />}
    </YStack>
  );
}
