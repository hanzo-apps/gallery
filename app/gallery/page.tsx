'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  YStack,
  XStack,
  H3,
  H4,
  H5,
  Text,
  Button,
  Input,
  Anchor,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@hanzo/ui';
import { Grid } from '@hanzo/ui/grid';
import { templates as templateData, CATEGORIES, type Template } from '../templates-data';
import { ForkModal } from '../components/ForkModal';
import { shot } from '../lib/shot';
import { getUniqueTemplates, groupTemplatesByFamily } from '../lib/template-utils';
import { c, t, at, hue, tint } from '../lib/design';

type SortOption = 'name-asc' | 'name-desc' | 'rating-high' | 'rating-low' | 'framework' | 'updated';
type ViewMode = 'consolidated' | 'grouped';

const sorts: [SortOption, string][] = [
  ['name-asc', 'A-Z'],
  ['name-desc', 'Z-A'],
  ['rating-high', 'Top Rated'],
  ['framework', 'Framework'],
];

/** The quiet button this page is built from. */
const muted = {
  transition: 'quickest',
  height: 'auto',
  backgroundColor: c.neutral900,
  borderWidth: 1,
  borderColor: c.neutral800,
  borderRadius: 'var(--radius-lg, 0.75rem)',
  hoverStyle: { backgroundColor: c.neutral800, borderColor: c.neutral700 },
} as const;

/** The loud one: deploy. */
const loud = {
  transition: 'quickest',
  height: 'auto',
  backgroundColor: '#fff',
  borderRadius: 'var(--radius-lg, 0.75rem)',
  hoverStyle: { backgroundColor: c.neutral200 },
} as const;

const pill = {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 9999,
  borderWidth: 1,
  borderColor: c.neutral800,
  backgroundColor: c.neutral900,
  color: c.neutral500,
} as const;

/** Deploy / preview / details, which every card carries. */
function Actions({
  template,
  onFork,
  onPreview,
  stacked,
}: {
  template: Template;
  onFork: () => void;
  onPreview: () => void;
  stacked?: boolean;
}) {
  const label = template.port ? '▶️ Live Preview' : '📸 Screenshot';
  const deploy = (
    <Button {...loud} onPress={onFork} paddingHorizontal={stacked ? 20 : 24} paddingVertical={12} width={stacked ? '100%' : undefined}>
      <Text {...t.sm} fontWeight={500} color="#000">
        Deploy to Hanzo
      </Text>
    </Button>
  );
  const rest = (
    <>
      <Button {...muted} onPress={onPreview} paddingHorizontal={stacked ? 16 : 24} paddingVertical={10} flexGrow={stacked ? 1 : 0}>
        <Text {...t.sm} color={c.neutral300}>
          {label}
        </Text>
      </Button>
      <Button {...muted} render={<Link href={`/templates/${template.slug}`} />} paddingHorizontal={stacked ? 16 : 24} paddingVertical={10} flexGrow={stacked ? 1 : 0}>
        <Text {...t.sm} color={c.neutral300}>
          Details
        </Text>
      </Button>
    </>
  );

  return stacked ? (
    <YStack gap={12}>
      {deploy}
      <XStack gap={8}>{rest}</XStack>
    </YStack>
  ) : (
    <XStack flexWrap="wrap" gap={12}>
      {deploy}
      {rest}
    </XStack>
  );
}

function Shot({ src, alt, ratio = 16 / 9, ...rest }: { src: string; alt: string; ratio?: number; [k: string]: unknown }) {
  return (
    <YStack position="relative" aspectRatio={ratio} backgroundColor={c.neutral900} overflow="hidden" {...rest}>
      <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} data-zoom="" />
    </YStack>
  );
}

export default function Gallery() {
  const router = useRouter();
  const [category, setCategory] = useState('All Categories');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [forking, setForking] = useState<Template | null>(null);
  const [view, setView] = useState<ViewMode>('grouped');
  const [open, setOpen] = useState<Set<string>>(new Set());

  const unique = getUniqueTemplates(templateData);
  const families = groupTemplatesByFamily(templateData);

  function toRandom() {
    if (unique.length > 0) router.push(`/templates/${unique[Math.floor(Math.random() * unique.length)].slug}`);
  }

  function toggle(family: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(family)) next.delete(family);
      else next.add(family);
      return next;
    });
  }

  const hit = (x: Template, name: string) =>
    (category === 'All Categories' || x.category === category) &&
    (search === '' ||
      [name, x.useCase, x.framework, x.category].some((s) => s.toLowerCase().includes(search.toLowerCase())));

  const rank = (a: Template, b: Template, an: string, bn: string) => {
    switch (sortBy) {
      case 'name-asc':
        return an.localeCompare(bn);
      case 'name-desc':
        return bn.localeCompare(an);
      case 'rating-high':
        return b.rating - a.rating;
      case 'rating-low':
        return a.rating - b.rating;
      case 'framework':
        return a.framework.localeCompare(b.framework);
      case 'updated':
        return (b.updatedDate || '').localeCompare(a.updatedDate || '');
      default:
        return 0;
    }
  };

  const shownTemplates =
    view === 'consolidated'
      ? unique.filter((x) => hit(x, x.displayName)).sort((a, b) => rank(a, b, a.displayName, b.displayName))
      : [];

  const shownFamilies =
    view === 'grouped'
      ? families
          .filter((f) => hit(f.primaryTemplate, f.displayName))
          .sort((a, b) => rank(a.primaryTemplate, b.primaryTemplate, a.displayName, b.displayName))
      : [];

  const preview = (template: Template) => {
    const url = `/previews/${template.name}/index.html`;
    fetch(url, { method: 'HEAD' })
      .then((r) => {
        if (r.ok) window.open(url, '_blank');
        else
          alert(
            `Preview not built yet for ${template.displayName}.\n\nTo build this template:\n\ncd ${template.path}\nnpm install\nnpm run build\n\nOr run: npm run build-templates in the gallery directory to build all templates.`,
          );
      })
      .catch(() =>
        alert(
          `Preview not available for ${template.displayName}.\n\nPath: ${template.path}\n\nRun: npm run build-templates to build all templates.`,
        ),
      );
  };

  return (
    <YStack minHeight="100vh" backgroundColor="#000">
      {/* Filters, pinned */}
      <YStack
        position="sticky"
        top={0}
        zIndex={40}
        backgroundColor="#000"
        borderBottomWidth={1}
        borderColor={c.neutral800}
      >
        <YStack width="100%" maxWidth={1600} marginLeft="auto" marginRight="auto" paddingHorizontal={32} paddingVertical={24}>
          <XStack alignItems="center" justifyContent="space-between" marginBottom={24}>
            <Anchor
              render={<Link href="/" />}
              transition="quickest"
              {...t.sm}
              color={c.neutral400}
              textDecorationLine="none"
              hoverStyle={{ color: '#fff' }}
            >
              ← Back
            </Anchor>
            <XStack alignItems="center" gap={16}>
              <Text {...t.sm} color={c.neutral400}>
                {view === 'grouped' ? `${shownFamilies.length} template families` : `${shownTemplates.length} templates`}
              </Text>
              <XStack
                gap={8}
                padding={4}
                borderRadius={9999}
                backgroundColor={c.neutral900}
                borderWidth={1}
                borderColor={c.neutral800}
              >
                {(
                  [
                    ['consolidated', 'Simple'],
                    ['grouped', 'Grouped'],
                  ] as [ViewMode, string][]
                ).map(([mode, label]) => (
                  <Button
                    key={mode}
                    onPress={() => setView(mode)}
                    aria-pressed={view === mode}
                    transition="quickest"
                    height="auto"
                    paddingHorizontal={16}
                    paddingVertical={6}
                    borderRadius={9999}
                    backgroundColor={view === mode ? '#fff' : 'transparent'}
                  >
                    <Text {...t.xs} fontWeight={500} color={view === mode ? '#000' : c.neutral400}>
                      {label}
                    </Text>
                  </Button>
                ))}
              </XStack>
            </XStack>
          </XStack>

          <XStack gap={12} marginBottom={24} alignItems="center">
            <Input
              flexGrow={1}
              flexShrink={1}
              flexBasis={0}
              placeholder="Search templates..."
              value={search}
              onChangeText={setSearch}
              borderRadius={9999}
              backgroundColor={c.neutral900}
              borderColor={c.neutral800}
              color="#fff"
              focusStyle={{ borderColor: '#fff' }}
            />
            <Button
              onPress={toRandom}
              transition="quickest"
              height="auto"
              flexShrink={0}
              paddingHorizontal={20}
              paddingVertical={12}
              borderRadius={9999}
              borderWidth={1}
              borderColor={at(c.purple400, 0.5)}
              backgroundImage={c.brand}
              boxShadow={`0 10px 15px ${at(c.purple500, 0.3)}`}
              title="Jump to Random Template"
              hoverStyle={{ backgroundImage: c.brandHover, scale: 1.05, boxShadow: `0 10px 15px ${at(c.purple500, 0.5)}` }}
            >
              <Text {...t.sm} fontWeight={500} color="#fff" whiteSpace="nowrap">
                🎲 Random
              </Text>
            </Button>
            <Select value={sortBy} onValueChange={(v: string) => setSortBy(v as SortOption)}>
              <SelectTrigger
                width={150}
                flexShrink={0}
                borderRadius={9999}
                backgroundColor={c.neutral900}
                borderColor={c.neutral800}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sorts.map(([value, label], index) => (
                  <SelectItem key={value} value={value} index={index}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </XStack>

          {/* Category chips */}
          <XStack
            overflow="scroll"
            marginHorizontal={-32}
            paddingHorizontal={32}
            data-scrollbar="none"
            style={{ scrollbarWidth: 'none' }}
          >
            <XStack gap={12} paddingBottom={8} minWidth="max-content">
              {['All Categories', ...CATEGORIES].map((name) => {
                const on = category === name;
                return (
                  <Button
                    key={name}
                    onPress={() => setCategory(name)}
                    transition="quickest"
                    height="auto"
                    paddingHorizontal={20}
                    paddingVertical={10}
                    borderRadius={9999}
                    borderWidth={1}
                    borderColor={on ? '#fff' : c.neutral800}
                    backgroundColor={on ? '#fff' : c.neutral900}
                    hoverStyle={on ? {} : { borderColor: c.neutral600 }}
                  >
                    <Text {...t.sm} fontWeight={500} color={on ? '#000' : c.neutral300} whiteSpace="nowrap">
                      {name === 'All Categories' ? 'All' : name}
                    </Text>
                  </Button>
                );
              })}
            </XStack>
          </XStack>
        </YStack>
      </YStack>

      <YStack width="100%" maxWidth={1600} marginLeft="auto" marginRight="auto" paddingHorizontal={32} paddingVertical={48}>
        {view === 'consolidated' && (
          <Grid columns={{ min: 320, max: 3 }} gap={32}>
            {shownTemplates.map((x) => (
              <YStack
                key={x.id}
                group
                transition="quick"
                backgroundColor={c.neutral950}
                borderRadius="var(--radius-2xl, 1.5rem)"
                borderWidth={1}
                borderColor={c.neutral800}
                overflow="hidden"
                hoverStyle={{ borderColor: c.neutral700 }}
              >
                <Shot src={shot(x.screenshot)} alt={x.displayName} borderBottomWidth={1} borderColor={c.neutral800} />
                <YStack padding={32}>
                  <XStack alignItems="flex-start" justifyContent="space-between" marginBottom={16} gap={12}>
                    <YStack flexGrow={1} flexShrink={1}>
                      <H3 {...t.xl} fontWeight={600} color="#fff" marginBottom={8}>
                        {x.displayName}
                      </H3>
                      <Text {...t.sm} color={c.neutral400}>
                        {x.framework}
                      </Text>
                    </YStack>
                    <Text {...pill} {...t.xs}>
                      {x.category}
                    </Text>
                  </XStack>
                  <Text {...t.sm} color={c.neutral500} marginBottom={24} lineHeight="1.625">
                    {x.useCase}
                  </Text>
                  <Actions template={x} stacked onFork={() => setForking(x)} onPreview={() => preview(x)} />
                </YStack>
              </YStack>
            ))}
          </Grid>
        )}

        {view === 'grouped' && (
          <YStack gap={24}>
            {shownFamilies.map((family) => {
              const expanded = open.has(family.family);
              const x = family.primaryTemplate;
              const many = family.variantCount > 1;

              return (
                <YStack
                  key={family.family}
                  group
                  backgroundColor={c.neutral950}
                  borderRadius="var(--radius-2xl, 1.5rem)"
                  borderWidth={1}
                  borderColor={c.neutral800}
                  overflow="hidden"
                >
                  <Grid columns={{ min: 260, max: 3 }} gap={24} style={{ padding: 24 }}>
                    <Shot
                      src={shot(x.screenshot)}
                      alt={family.displayName}
                      borderRadius="var(--radius-xl, 1rem)"
                      borderWidth={1}
                      borderColor={c.neutral800}
                    />
                    <YStack style={{ gridColumn: 'span 2' }}>
                      <XStack alignItems="center" gap={12} marginBottom={8} flexWrap="wrap">
                        <H3 {...t.xl2} fontWeight={600} color="#fff">
                          {family.displayName}
                        </H3>
                        {many && (
                          <Text
                            paddingHorizontal={12}
                            paddingVertical={4}
                            borderRadius={9999}
                            borderWidth={1}
                            {...t.xs}
                            fontWeight={500}
                            {...tint('purple')}
                          >
                            {family.variantCount} variants
                          </Text>
                        )}
                      </XStack>
                      <Text {...t.sm} color={c.neutral400} marginBottom={4}>
                        {x.framework}
                      </Text>
                      <XStack marginBottom={24}>
                        <Text {...pill} {...t.xs}>
                          {x.category}
                        </Text>
                      </XStack>
                      <Text {...t.sm} color={c.neutral500} marginBottom={24} lineHeight="1.625">
                        {x.useCase}
                      </Text>
                      <XStack flexWrap="wrap" gap={12}>
                        <Actions template={x} onFork={() => setForking(x)} onPreview={() => preview(x)} />
                        {many && (
                          <Button {...muted} onPress={() => toggle(family.family)} paddingHorizontal={24} paddingVertical={10}>
                            <Text {...t.sm} color={c.neutral300}>
                              {expanded ? '▼ Hide' : '▶ Show'} Variants
                            </Text>
                          </Button>
                        )}
                      </XStack>
                    </YStack>
                  </Grid>

                  {expanded && many && (
                    <YStack
                      borderTopWidth={1}
                      borderColor={c.neutral800}
                      backgroundColor={at(c.neutral950, 0.5)}
                      padding={24}
                    >
                      <H4 {...t.sm} fontWeight={600} color={c.neutral400} marginBottom={16} textTransform="uppercase" letterSpacing={0.8}>
                        All Variants ({family.variantCount})
                      </H4>
                      <Grid columns={{ min: 240, max: 3 }} gap={16}>
                        {family.templates.map((v) => (
                          <YStack
                            key={v.id}
                            transition="quickest"
                            backgroundColor={c.neutral900}
                            borderRadius="var(--radius-xl, 1rem)"
                            borderWidth={1}
                            borderColor={c.neutral800}
                            padding={16}
                            hoverStyle={{ borderColor: c.neutral700 }}
                          >
                            <XStack alignItems="flex-start" justifyContent="space-between" marginBottom={12} gap={8}>
                              <YStack flexGrow={1} flexShrink={1}>
                                <H5 {...t.sm} fontWeight={500} color="#fff" marginBottom={4}>
                                  {v.framework}
                                </H5>
                                <Text {...t.xs} color={c.neutral500}>
                                  {v.displayName}
                                </Text>
                              </YStack>
                              <Text
                                paddingHorizontal={8}
                                paddingVertical={4}
                                borderRadius="var(--radius-lg, 0.75rem)"
                                {...t.xs}
                                fontWeight={500}
                                backgroundColor={tint(hue(v.tier)).backgroundColor}
                                color={tint(hue(v.tier)).color}
                              >
                                T{v.tier}
                              </Text>
                            </XStack>
                            <XStack gap={8}>
                              <Button {...loud} onPress={() => setForking(v)} flexGrow={1} paddingHorizontal={12} paddingVertical={6}>
                                <Text {...t.xs} fontWeight={500} color="#000">
                                  Deploy
                                </Text>
                              </Button>
                              <Button {...muted} onPress={() => preview(v)} paddingHorizontal={12} paddingVertical={6}>
                                <Text {...t.xs} color={c.neutral300}>
                                  {v.port ? '▶️' : '📸'}
                                </Text>
                              </Button>
                              <Button {...muted} render={<Link href={`/templates/${v.slug}`} />} paddingHorizontal={12} paddingVertical={6}>
                                <Text {...t.xs} color={c.neutral300}>
                                  Info
                                </Text>
                              </Button>
                            </XStack>
                          </YStack>
                        ))}
                      </Grid>
                    </YStack>
                  )}
                </YStack>
              );
            })}
          </YStack>
        )}

        {forking && <ForkModal template={forking} onClose={() => setForking(null)} />}
      </YStack>
    </YStack>
  );
}
