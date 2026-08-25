'use client';

import Image from 'next/image';
import Link from 'next/link';
import { YStack, XStack, H1, H2, H3, Text, Button } from '@hanzo/ui';
import { Grid } from '@hanzo/ui/grid';
import { shot } from './lib/shot';
import { templates } from './templates-data';
import { c, t, at, clip, hue, fill } from './lib/design';
import { Stars } from './components/stars';

/** A section of the page: full-bleed ground, centred column. */
function Band({
  children,
  width = 1152,
  banded,
}: {
  children: React.ReactNode;
  width?: number;
  banded?: boolean;
}) {
  return (
    <YStack
      render="section"
      paddingVertical={96}
      paddingHorizontal={16}
      {...(banded
        ? {
            backgroundImage: `linear-gradient(to bottom, ${c.white5}, transparent)`,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: c.white10,
          }
        : {})}
    >
      <YStack width="100%" maxWidth={width} marginLeft="auto" marginRight="auto">
        {children}
      </YStack>
    </YStack>
  );
}

/** A band's heading and its line of explanation. */
function Title({ text, note, image }: { text: string; note?: string; image: string }) {
  return (
    <YStack alignItems="center" marginBottom={64}>
      <H2 {...t.xl5} fontWeight={700} marginBottom={16} textAlign="center" {...clip(image)}>
        {text}
      </H2>
      {note ? (
        <Text color={c.gray400} {...t.xl} textAlign="center">
          {note}
        </Text>
      ) : null}
    </YStack>
  );
}

function TemplateCard({ template }: { template: (typeof templates)[0] }) {
  return (
    <YStack
      render={<Link href={`/templates/${template.slug}`} />}
      group
      transition="quick"
      position="relative"
      backgroundColor={c.white5}
      backdropFilter="blur(16px)"
      borderRadius="var(--radius-xl, 1rem)"
      borderWidth={1}
      borderColor={c.white10}
      overflow="hidden"
      cursor="pointer"
      hoverStyle={{
        borderColor: c.white20,
        y: -8,
        boxShadow: `0 25px 50px ${at(c.purple500, 0.2)}`,
      }}
    >
      <YStack position="relative" aspectRatio={16 / 9} backgroundColor={at(c.gray900, 0.5)} overflow="hidden">
        <Image
          src={shot(template.screenshot)}
          alt={template.displayName}
          fill
          style={{ objectFit: 'cover' }}
          data-zoom=""
        />
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.6}
          backgroundImage="linear-gradient(to top, #000, transparent, transparent)"
        />
        <Text
          position="absolute"
          top={12}
          left={12}
          paddingHorizontal={12}
          paddingVertical={4}
          borderRadius={9999}
          {...t.xs}
          fontWeight={700}
          color="#fff"
          backgroundColor={fill(hue(template.tier))}
        >
          Tier {template.tier}
        </Text>
        <Text
          position="absolute"
          top={12}
          right={12}
          paddingHorizontal={12}
          paddingVertical={4}
          borderRadius={9999}
          {...t.xs}
          fontWeight={700}
          color="#fff"
          backgroundColor={at(c.purple500, 0.9)}
          backdropFilter="blur(4px)"
        >
          {template.category}
        </Text>
      </YStack>

      <YStack padding={24}>
        <H3
          transition="quickest"
          {...t.xl}
          fontWeight={700}
          color="#fff"
          marginBottom={8}
          $group-hover={{ color: c.purple400 }}
        >
          {template.displayName}
        </H3>
        <Text {...t.sm} color={c.blue400} marginBottom={8}>
          {template.framework}
        </Text>
        <Text {...t.sm} color={c.gray400} fontStyle="italic" marginBottom={12}>
          {template.useCase}
        </Text>
        <Stars n={template.rating} />
      </YStack>
    </YStack>
  );
}

function Panel({ children, pad = 24 }: { children: React.ReactNode; pad?: number }) {
  return (
    <YStack
      transition="quickest"
      backgroundColor={c.white5}
      backdropFilter="blur(16px)"
      padding={pad}
      borderRadius="var(--radius-xl, 1rem)"
      borderWidth={1}
      borderColor={c.white10}
      cursor="pointer"
      hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.1)', scale: 1.05 }}
    >
      {children}
    </YStack>
  );
}

function TechBadge({ icon, name, count }: { icon: string; name: string; count: string }) {
  return (
    <Panel>
      <Text {...t.xl5} marginBottom={12} textAlign="center">
        {icon}
      </Text>
      <YStack alignItems="center">
        <Text {...t.xl} fontWeight={700} color="#fff" marginBottom={4}>
          {name}
        </Text>
        <Text color={c.gray400} {...t.sm}>
          {count} templates
        </Text>
      </YStack>
    </Panel>
  );
}

function UseCaseCard({
  icon,
  title,
  description,
  templates: n,
}: {
  icon: string;
  title: string;
  description: string;
  templates: number;
}) {
  return (
    <Panel pad={32}>
      <Text {...t.xl6} marginBottom={16}>
        {icon}
      </Text>
      <H3 {...t.xl2} fontWeight={700} color="#fff" marginBottom={12}>
        {title}
      </H3>
      <Text color={c.gray400} marginBottom={16}>
        {description}
      </Text>
      <Text color={c.purple400} fontWeight={700}>
        {n} templates →
      </Text>
    </Panel>
  );
}

/** One of the four counters under the hero. */
function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <YStack alignItems="center" cursor="pointer" transition="quickest" hoverStyle={{ scale: 1.1 }}>
      <Text {...t.xl6} fontWeight={700} color={color} marginBottom={8}>
        {value}
      </Text>
      <Text color={c.gray400} {...t.lg}>
        {label}
      </Text>
    </YStack>
  );
}

const has = (t: string) => (s: string) => s.toLowerCase().includes(t);

export default function GalleryHome() {
  const featured = templates.filter((x) => x.tier === 1).slice(0, 6);
  const components = templates.reduce((sum, x) => {
    const m = x.components.match(/(\d+)/);
    return sum + (m ? parseInt(m[1]) : 0);
  }, 0);
  const byFramework = (needle: string) => templates.filter((x) => has(needle)(x.framework)).length;
  const byUse = (...needles: string[]) =>
    templates.filter((x) => needles.some((n) => has(n)(x.useCase))).length;

  return (
    <YStack minHeight="100vh" backgroundColor="#000">
      {/* Hero */}
      <YStack render="section" position="relative" paddingVertical={96} paddingHorizontal={16} overflow="hidden">
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundImage={`linear-gradient(to bottom right, ${at(c.purple900, 0.2)}, ${at(c.blue900, 0.2)}, ${at(c.pink900, 0.2)})`}
        />
        <YStack position="absolute" top={0} left={0} right={0} bottom={0}>
          <YStack
            position="absolute"
            top={0}
            left="25%"
            width={384}
            height={384}
            borderRadius={9999}
            backgroundColor={at(c.purple500, 0.1)}
            filter="blur(64px)"
            style={{ animation: 'pulse 2s cubic-bezier(.4,0,.6,1) infinite' }}
          />
          <YStack
            position="absolute"
            bottom={0}
            right="25%"
            width={384}
            height={384}
            borderRadius={9999}
            backgroundColor={at(c.blue500, 0.1)}
            filter="blur(64px)"
            style={{ animation: 'pulse 2s cubic-bezier(.4,0,.6,1) 1s infinite' }}
          />
        </YStack>

        <YStack position="relative" width="100%" maxWidth={1152} marginLeft="auto" marginRight="auto" alignItems="center">
          <H1
            {...t.xl7}
            $md={t.xl8}
            fontWeight={700}
            marginBottom={24}
            textAlign="center"
            {...clip(c.wash)}
          >
            Hanzo Templates Gallery
          </H1>
          <Text {...t.xl2} $md={t.xl3} color={c.gray300} marginBottom={16} fontWeight={300} textAlign="center">
            Premium UI/UX templates for your next project
          </Text>
          <Text {...t.xl} color={c.gray400} marginBottom={32} textAlign="center">
            <Text {...t.xl} color={c.blue400} fontWeight={700}>
              {templates.length}
            </Text>{' '}
            Premium Templates
          </Text>
          <XStack gap={16} justifyContent="center" flexWrap="wrap">
            <Button
              render={<Link href="/gallery" />}
              transition="quickest"
              height="auto"
              paddingHorizontal={40}
              paddingVertical={20}
              borderRadius="var(--radius-xl, 1rem)"
              backgroundImage={c.brand}
              boxShadow={`0 20px 25px ${at(c.purple500, 0.5)}`}
              hoverStyle={{ backgroundImage: c.brandHover, scale: 1.05 }}
            >
              <Text {...t.lg} fontWeight={700} color="#fff">
                Browse Templates
              </Text>
            </Button>
            <Button
              render={<Link href="/docs" />}
              transition="quickest"
              height="auto"
              paddingHorizontal={40}
              paddingVertical={20}
              borderRadius="var(--radius-xl, 1rem)"
              backgroundColor="rgba(255,255,255,0.1)"
              backdropFilter="blur(16px)"
              borderWidth={1}
              borderColor={c.white20}
              hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.2)', scale: 1.05 }}
            >
              <Text {...t.lg} fontWeight={700} color="#fff">
                Documentation
              </Text>
            </Button>
          </XStack>
        </YStack>
      </YStack>

      {/* Stats */}
      <Band banded>
        <Grid columns={{ min: 160, max: 4 }} gap={32}>
          <Stat value={String(templates.length)} label="Premium Templates" color={c.blue400} />
          <Stat value="14" label="Categories" color={c.purple400} />
          <Stat value={`${components}+`} label="Components" color={c.pink400} />
          <Stat value="100%" label="Production Ready" color={c.green400} />
        </Grid>
      </Band>

      {/* Featured */}
      <Band width={1280}>
        <Title text="Featured Templates" note="Our highest-rated Tier 1 templates" image={c.washShort} />
        <Grid columns={{ min: 320, max: 3 }} gap={32} style={{ marginBottom: 48 }}>
          {featured.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </Grid>
        <YStack alignItems="center">
          <Button
            render={<Link href="/gallery" />}
            transition="quickest"
            height="auto"
            paddingHorizontal={32}
            paddingVertical={16}
            borderRadius="var(--radius-xl, 1rem)"
            backgroundImage={c.cool}
            hoverStyle={{ backgroundImage: c.coolHover, scale: 1.05 }}
          >
            <Text {...t.lg} fontWeight={700} color="#fff">
              View All Templates →
            </Text>
          </Button>
        </YStack>
      </Band>

      {/* Technology stacks */}
      <Band banded>
        <Title text="Technology Stacks" note="Built with modern web technologies" image={c.brand} />
        <Grid columns={{ min: 200, max: 4 }} gap={32}>
          <TechBadge icon="⚡" name="Next.js" count={String(byFramework('next'))} />
          <TechBadge icon="⚛️" name="React" count={String(byFramework('react'))} />
          <TechBadge
            icon="🎨"
            name="TypeScript"
            count={String(templates.filter((x) => has('typescript')(x.framework) || has('ts')(x.framework)).length)}
          />
          <TechBadge
            icon="🌈"
            name="HTML/CSS"
            count={String(templates.filter((x) => has('html')(x.framework) || has('gulp')(x.framework)).length)}
          />
        </Grid>
      </Band>

      {/* Use cases */}
      <Band width={1280}>
        <Title text="Perfect For" note="Whatever you are building, we have a template" image={c.washShort} />
        <Grid columns={{ min: 300, max: 3 }} gap={32}>
          <UseCaseCard icon="🚀" title="SaaS Startups" description="Launch faster with production-ready templates" templates={byUse('saas')} />
          <UseCaseCard icon="🎨" title="Creative Agencies" description="Beautiful portfolios and agency sites" templates={byUse('portfolio', 'agency', 'creative')} />
          <UseCaseCard icon="📱" title="Mobile Apps" description="Modern app landing pages" templates={byUse('app', 'mobile')} />
          <UseCaseCard icon="📊" title="Dashboards" description="Admin panels and analytics platforms" templates={byUse('dashboard')} />
          <UseCaseCard icon="🛒" title="E-commerce" description="Online stores and marketplaces" templates={byUse('commerce', 'store')} />
          <UseCaseCard icon="💬" title="Social Platforms" description="Community and social networking" templates={byUse('social')} />
        </Grid>
      </Band>

      {/* Why */}
      <Band banded>
        <Title text="Why Choose Hanzo Templates?" image={c.brand} />
        <Grid columns={{ min: 320, max: 2 }} gap={32}>
          {[
            ['⚡', 'Lightning Fast', 'Built with Next.js 14+ for optimal performance and SEO'],
            ['🎨', 'Beautiful Design', 'Premium UI/UX from top designers worldwide'],
            ['📱', 'Fully Responsive', 'Perfect on mobile, tablet, and desktop devices'],
            ['🔧', 'Easy to Customize', 'Clean code with TypeScript and modern best practices'],
          ].map(([icon, head, note]) => (
            <YStack
              key={head}
              padding={32}
              backgroundColor={c.white5}
              backdropFilter="blur(16px)"
              borderRadius="var(--radius-xl, 1rem)"
              borderWidth={1}
              borderColor={c.white10}
            >
              <Text {...t.xl4} marginBottom={16}>
                {icon}
              </Text>
              <H3 {...t.xl2} fontWeight={700} color="#fff" marginBottom={12}>
                {head}
              </H3>
              <Text color={c.gray400}>{note}</Text>
            </YStack>
          ))}
        </Grid>
      </Band>

      {/* Call to action */}
      <YStack render="section" position="relative" paddingVertical={96} paddingHorizontal={16} overflow="hidden">
        <YStack position="absolute" top={0} left={0} right={0} bottom={0} backgroundImage={`linear-gradient(to right, ${c.purple600}, ${c.pink600})`} />
        <YStack position="absolute" top={0} left={0} right={0} bottom={0}>
          <YStack position="absolute" top="25%" left="25%" width={384} height={384} borderRadius={9999} backgroundColor="rgba(255,255,255,0.1)" filter="blur(64px)" />
          <YStack position="absolute" bottom="25%" right="25%" width={384} height={384} borderRadius={9999} backgroundColor="rgba(255,255,255,0.1)" filter="blur(64px)" />
        </YStack>
        <YStack position="relative" width="100%" maxWidth={896} marginLeft="auto" marginRight="auto" alignItems="center">
          <H2 {...t.xl5} $md={t.xl6} fontWeight={700} marginBottom={24} color="#fff" textAlign="center">
            Deploy Instantly with Hanzo AI
          </H2>
          <Text {...t.xl} $md={t.xl2} marginBottom={32} color={c.purple100} textAlign="center">
            One-click deployment to global edge network
          </Text>
          <XStack gap={16} justifyContent="center" flexWrap="wrap">
            <Button
              render={<a href="https://hanzo.ai" target="_blank" rel="noopener noreferrer" />}
              transition="quickest"
              height="auto"
              paddingHorizontal={48}
              paddingVertical={20}
              borderRadius="var(--radius-xl, 1rem)"
              backgroundColor="#fff"
              boxShadow="0 25px 50px rgb(0 0 0 / .25)"
              hoverStyle={{ backgroundColor: c.gray100, scale: 1.05 }}
            >
              <Text {...t.xl} fontWeight={700} color={c.purple600}>
                Get Started Free
              </Text>
            </Button>
            <Button
              render={<Link href="/gallery" />}
              transition="quickest"
              height="auto"
              paddingHorizontal={48}
              paddingVertical={20}
              borderRadius="var(--radius-xl, 1rem)"
              backgroundColor="rgba(255,255,255,0.2)"
              backdropFilter="blur(16px)"
              borderWidth={2}
              borderColor="#fff"
              hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.3)', scale: 1.05 }}
            >
              <Text {...t.xl} fontWeight={700} color="#fff">
                Browse Gallery
              </Text>
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
