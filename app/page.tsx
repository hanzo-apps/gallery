'use client';

import Image from 'next/image';
import { YStack, XStack, Text } from '@hanzo/ui';
import { Grid } from '@hanzo/ui/grid';
import {
  Action,
  Chip,
  Claim,
  Display,
  Feature,
  Lattice,
  Leaf,
  Lede,
  Lift,
  More,
  Section,
  Title,
} from '@hanzo/ui/marketing';
import { shot } from './lib/shot';
import { templates, CATEGORIES } from './templates-data';
import { c, round, lift } from './lib/design';
import { DOCS } from './lib/links';
import { Stars } from './components/stars';

type Template = (typeof templates)[number];

/** A template as a card: its picture, its name and stack, what it is for. */
function TemplateCard({ template }: { template: Template }) {
  return (
    <Leaf href={`/templates/${template.slug}`} p={12} bg={c.card} borderColor={c.edge} rounded={round.card} hoverStyle={{ borderColor: c.strong }}>
      <YStack position="relative" aspectRatio={16 / 9} rounded={round.frame} overflow="hidden" bg={c.raised}>
        <Image src={shot(template.screenshot)} alt={template.displayName} fill style={{ objectFit: 'cover' }} data-zoom="" />
      </YStack>
      <YStack gap={6} px={8} pt={16} pb={8}>
        <XStack items="center" justify="space-between" gap={8}>
          <Lift render="h3" m={0} fontSize="$6" lineHeight={24} fontWeight="500" color={c.ink}>
            {template.displayName}
          </Lift>
          <Stars n={template.rating} size="$2" />
        </XStack>
        <Text fontSize="$2" lineHeight={18} color={c.muted}>
          {template.framework}
        </Text>
        <Text fontSize="$2" lineHeight={18} color={c.faint}>
          {template.useCase}
        </Text>
        <XStack gap={6} pt={6} flexWrap="wrap">
          <Chip px={10} py={2}>
            Tier {template.tier}
          </Chip>
          <Chip px={10} py={2}>
            {template.category}
          </Chip>
        </XStack>
      </YStack>
    </Leaf>
  );
}

/** A tile of the ruled stack grid. */
function Stack({ name, count }: { name: string; count: number }) {
  return (
    <YStack gap={4} p={24} bg={c.ground}>
      <Text fontSize="$7" lineHeight={26} fontWeight="500" color={c.ink}>
        {name}
      </Text>
      <Text fontSize="$2" lineHeight={18} color={c.muted}>
        {count} templates
      </Text>
    </YStack>
  );
}

/** What someone is building, and how many templates start there. */
function UseCase({ title, description, count }: { title: string; description: string; count: number }) {
  return (
    <Leaf href="/gallery" p={24} bg={c.card} borderColor={c.edge} rounded={round.card} hoverStyle={{ borderColor: c.strong }}>
      <YStack gap={8}>
        <Text fontSize="$6" lineHeight={24} fontWeight="500" color={c.ink}>
          {title}
        </Text>
        <Text fontSize="$3" lineHeight={22} color={c.muted}>
          {description}
        </Text>
        <Lift step fontSize="$2" lineHeight={18} fontWeight="500" color={c.muted} pt={8}>
          {count} templates →
        </Lift>
      </YStack>
    </Leaf>
  );
}

const has = (needle: string) => (s: string) => s.toLowerCase().includes(needle);

export default function GalleryHome() {
  const featured = templates.filter((x) => x.tier === 1).slice(0, 6);
  const components = templates.reduce((sum, x) => {
    const m = x.components.match(/(\d+)/);
    return sum + (m ? parseInt(m[1]) : 0);
  }, 0);
  const byFramework = (...needles: string[]) => templates.filter((x) => needles.some((n) => has(n)(x.framework))).length;
  const byUse = (...needles: string[]) => templates.filter((x) => needles.some((n) => has(n)(x.useCase))).length;

  const stats: [string, string][] = [
    [String(templates.length), 'templates'],
    [String(CATEGORIES.length), 'categories'],
    [`${components}+`, 'components'],
  ];

  return (
    <YStack>
      {/* Hero: the promise, the counts, the two ways in. */}
      <YStack render="section" position="relative" overflow="hidden" px="var(--page-gutter)" pt={96} pb={88} $md={{ pt: 136, pb: 112 }}>
        <Lattice
          position="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          size={56}
          opacity={0.06}
          style={{ maskImage: 'radial-gradient(ellipse 60% 70% at 50% 30%, #000 30%, transparent 100%)' }}
        />
        <YStack position="relative" width="100%" maxW={880} mx="auto" items="center" gap={20}>
          <Chip px={14} py={6} fontSize="$2">
            gallery.hanzo.ai
          </Chip>
          <Display text="center">Hanzo Templates Gallery</Display>
          <Claim text="center">Premium UI/UX templates for your next project</Claim>
          <XStack flexWrap="wrap" justify="center" gap={8} items="center">
            {stats.map(([n, label], i) => (
              <XStack key={label} items="center" gap={8}>
                {i > 0 ? (
                  <Text color={c.faint} fontSize="$3">
                    ·
                  </Text>
                ) : null}
                <Text fontSize="$3" lineHeight={22} color={c.muted}>
                  <Text fontSize="$3" fontWeight="500" color={c.ink}>
                    {n}
                  </Text>{' '}
                  {label}
                </Text>
              </XStack>
            ))}
            <XStack items="center" gap={8}>
              <Text color={c.faint} fontSize="$3">
                ·
              </Text>
              <Text fontSize="$3" lineHeight={22} color={c.muted}>
                production ready
              </Text>
            </XStack>
          </XStack>
          <XStack flexWrap="wrap" justify="center" gap={12} pt={12}>
            <Action fill href="/gallery">
              Browse templates
            </Action>
            <Action href={DOCS}>Documentation</Action>
          </XStack>
        </YStack>
      </YStack>

      <Section title="Featured templates" lede="Our highest-rated Tier 1 templates" measure={1280}>
        <Grid columns={{ min: 300, max: 3 }} gap={20}>
          {featured.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </Grid>
        <XStack justify="center">
          <More href="/gallery">View all templates →</More>
        </XStack>
      </Section>

      <Section title="Technology stacks" lede="Built with modern web technologies" measure={1280}>
        <YStack rounded={round.card} overflow="hidden" borderWidth={1} borderColor={c.edge} bg={c.edge}>
          <Grid columns={{ min: 220, max: 4 }} gap={1}>
            <Stack name="Next.js" count={byFramework('next')} />
            <Stack name="React" count={byFramework('react')} />
            <Stack name="TypeScript" count={byFramework('typescript', 'ts')} />
            <Stack name="HTML/CSS" count={byFramework('html', 'gulp')} />
          </Grid>
        </YStack>
      </Section>

      <Section title="Perfect for" lede="Whatever you are building, we have a template" measure={1280}>
        <Grid columns={{ min: 280, max: 3 }} gap={20}>
          <UseCase title="SaaS Startups" description="Launch faster with production-ready templates" count={byUse('saas')} />
          <UseCase title="Creative Agencies" description="Beautiful portfolios and agency sites" count={byUse('portfolio', 'agency', 'creative')} />
          <UseCase title="Mobile Apps" description="Modern app landing pages" count={byUse('app', 'mobile')} />
          <UseCase title="Dashboards" description="Admin panels and analytics platforms" count={byUse('dashboard')} />
          <UseCase title="E-commerce" description="Online stores and marketplaces" count={byUse('commerce', 'store')} />
          <UseCase title="Social Platforms" description="Community and social networking" count={byUse('social')} />
        </Grid>
      </Section>

      <Section title="Why choose Hanzo Templates" measure={1280}>
        <Grid columns={{ min: 240, max: 4 }} gap={20}>
          <Feature title="Lightning Fast">Built with Next.js 14+ for optimal performance and SEO</Feature>
          <Feature title="Beautiful Design">Premium UI/UX from top designers worldwide</Feature>
          <Feature title="Fully Responsive">Perfect on mobile, tablet, and desktop devices</Feature>
          <Feature title="Easy to Customize">Clean code with TypeScript and modern best practices</Feature>
        </Grid>
      </Section>

      {/* Closing: deploy, or keep browsing. */}
      <YStack render="section" px="var(--page-gutter)" pt={32} pb={112}>
        <YStack
          width="100%"
          maxW={1280}
          mx="auto"
          items="center"
          gap={16}
          px={24}
          py={64}
          rounded={round.card}
          borderWidth={1}
          borderColor={c.edge}
          bg={c.card}
          boxShadow={lift.card}
        >
          <Title text="center">Deploy instantly with Hanzo AI</Title>
          <Lede text="center">One-click deployment to global edge network</Lede>
          <XStack flexWrap="wrap" justify="center" gap={12} pt={12}>
            <Action fill href="https://hanzo.ai">
              Get started free
            </Action>
            <Action href="/gallery">Browse gallery</Action>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
