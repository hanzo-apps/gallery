'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  YStack,
  XStack,
  Text,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@hanzo/ui';
import { Grid, Cell } from '@hanzo/ui/grid';
import { Action, Chip, Leaf, More } from '@hanzo/ui/marketing';
import { templates as templateData, CATEGORIES, type Template } from '../templates-data';
import { ForkModal } from '../components/ForkModal';
import { HEADER } from '../components/header';
import { shot } from '../lib/shot';
import { getUniqueTemplates, groupTemplatesByFamily } from '../lib/template-utils';
import { c, round, column } from '../lib/design';

type SortOption = 'name-asc' | 'name-desc' | 'rating-high' | 'rating-low' | 'framework' | 'updated';
type ViewMode = 'consolidated' | 'grouped';

const sorts: [SortOption, string][] = [
  ['name-asc', 'A-Z'],
  ['name-desc', 'Z-A'],
  ['rating-high', 'Top Rated'],
  ['framework', 'Framework'],
];

/** A badge: the outline Chip at its small size. */
const badge = { px: 10, py: 2, fontSize: '$1', lineHeight: 18 } as const;

/** A card: hanzo.ai's raised surface, a hairline that brightens on approach. */
const card = {
  bg: c.card,
  borderColor: c.edge,
  rounded: round.card,
  overflow: 'hidden',
  hoverStyle: { borderColor: c.strong },
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
  const deploy = (
    <Action fill render="button" onClick={onFork} width={stacked ? '100%' : undefined}>
      Deploy to Hanzo
    </Action>
  );
  const rest = (
    <>
      <Action render="button" onClick={onPreview} grow={stacked ? 1 : 0}>
        {template.port ? 'Live preview' : 'Screenshot'}
      </Action>
      <Action href={`/templates/${template.slug}`} grow={stacked ? 1 : 0}>
        Details
      </Action>
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

/** A capture in its frame. */
function Shot({ src, alt, ...rest }: { src: string; alt: string; [k: string]: unknown }) {
  return (
    <YStack position="relative" aspectRatio={16 / 9} bg={c.raised} overflow="hidden" {...rest}>
      <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} data-zoom="" />
    </YStack>
  );
}

/** A turn-over chevron for the variants switch. */
function Chevron({ turned }: { turned: boolean }) {
  return (
    <Text render="span" aria-hidden display="flex" rotate={turned ? '180deg' : '0deg'} transition="quickest">
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </Text>
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
    <YStack minH="100vh" bg={c.ground}>
      {/* Filters, pinned under the site header */}
      <YStack position="sticky" t={HEADER} z={40} bg={c.ground} borderBottomWidth={1} borderColor={c.edge}>
        <YStack {...column(1600)} py={20} gap={16}>
          <XStack items="center" justify="space-between" gap={12} flexWrap="wrap">
            <More href="/">← Back</More>
            <XStack items="center" gap={12}>
              <Text fontSize="$2" lineHeight={18} color={c.faint}>
                {view === 'grouped' ? `${shownFamilies.length} template families` : `${shownTemplates.length} templates`}
              </Text>
              <XStack gap={4} p={4} rounded={round.pill} bg={c.card} borderWidth={1} borderColor={c.edge}>
                {(
                  [
                    ['consolidated', 'Simple'],
                    ['grouped', 'Grouped'],
                  ] as [ViewMode, string][]
                ).map(([mode, label]) => (
                  <Text
                    key={mode}
                    render="button"
                    onClick={() => setView(mode)}
                    aria-pressed={view === mode}
                    px={14}
                    py={6}
                    borderWidth={0}
                    rounded={round.pill}
                    cursor="pointer"
                    fontSize="$1"
                    lineHeight={16}
                    fontWeight="500"
                    bg={view === mode ? c.bright : 'transparent'}
                    color={view === mode ? c.onBright : c.muted}
                    hoverStyle={view === mode ? {} : { color: c.ink }}
                  >
                    {label}
                  </Text>
                ))}
              </XStack>
            </XStack>
          </XStack>

          <XStack gap={8} items="center">
            <Input
              grow={1}
              shrink={1}
              flexBasis={0}
              minW={0}
              placeholder="Search templates..."
              value={search}
              onChangeText={setSearch}
              rounded={round.pill}
              bg={c.card}
              borderColor={c.edge}
              color={c.ink}
              focusStyle={{ borderColor: c.chosen }}
            />
            <Action render="button" onClick={toRandom} shrink={0} title="Jump to Random Template">
              Random
            </Action>
            <Select value={sortBy} onValueChange={(v: string) => setSortBy(v as SortOption)}>
              <SelectTrigger width={132} shrink={0} rounded={round.pill} bg={c.card} borderColor={c.edge}>
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

          {/* Category chips: the row scrolls inside itself */}
          <XStack
            overflow="scroll"
            mx="calc(-1 * var(--page-gutter))"
            px="var(--page-gutter)"
            data-scrollbar="none"
            style={{ scrollbarWidth: 'none' }}
          >
            <XStack gap={8} pb={4} minW="max-content">
              {['All Categories', ...CATEGORIES].map((name) => {
                const on = category === name;
                return (
                  <Chip
                    key={name}
                    render="button"
                    onClick={() => setCategory(name)}
                    aria-pressed={on}
                    px={16}
                    py={8}
                    cursor="pointer"
                    whiteSpace="nowrap"
                    fontWeight="500"
                    {...(on
                      ? { bg: c.bright, color: c.onBright, borderColor: c.bright, hoverStyle: {} }
                      : { hoverStyle: { borderColor: c.strong, color: c.ink } })}
                  >
                    {name === 'All Categories' ? 'All' : name}
                  </Chip>
                );
              })}
            </XStack>
          </XStack>
        </YStack>
      </YStack>

      <YStack {...column(1600)} py={48}>
        {view === 'consolidated' && (
          <Grid columns={{ min: 300, max: 3 }} gap={24}>
            {shownTemplates.map((x) => (
              <Leaf key={x.id} p={0} {...card}>
                <Shot src={shot(x.screenshot)} alt={x.displayName} borderBottomWidth={1} borderColor={c.edge} />
                <YStack p={24}>
                  <XStack items="flex-start" justify="space-between" mb={12} gap={12}>
                    <YStack grow={1} shrink={1}>
                      <Text render="h3" m={0} fontSize="$6" lineHeight={24} fontWeight="500" color={c.ink} mb={4}>
                        {x.displayName}
                      </Text>
                      <Text fontSize="$2" lineHeight={18} color={c.muted}>
                        {x.framework}
                      </Text>
                    </YStack>
                    <Chip {...badge}>{x.category}</Chip>
                  </XStack>
                  <Text fontSize="$2" lineHeight={21} color={c.muted} mb={20}>
                    {x.useCase}
                  </Text>
                  <Actions template={x} stacked onFork={() => setForking(x)} onPreview={() => preview(x)} />
                </YStack>
              </Leaf>
            ))}
          </Grid>
        )}

        {view === 'grouped' && (
          <YStack gap={20}>
            {shownFamilies.map((family) => {
              const expanded = open.has(family.family);
              const x = family.primaryTemplate;
              const many = family.variantCount > 1;

              return (
                <Leaf key={family.family} p={0} {...card}>
                  <Grid columns={{ min: 260, max: 3 }} gap={24} p={24}>
                    <Shot
                      src={shot(x.screenshot)}
                      alt={family.displayName}
                      rounded={round.frame}
                      borderWidth={1}
                      borderColor={c.edge}
                    />
                    <Cell col={2}>
                      <YStack>
                        <XStack items="center" gap={12} mb={6} flexWrap="wrap">
                          <Text render="h3" m={0} fontSize="$7" lineHeight={26} fontWeight="500" color={c.ink}>
                            {family.displayName}
                          </Text>
                          {many && <Chip {...badge}>{family.variantCount} variants</Chip>}
                        </XStack>
                        <Text fontSize="$2" lineHeight={18} color={c.muted} mb={10}>
                          {x.framework}
                        </Text>
                        <XStack mb={16}>
                          <Chip {...badge}>{x.category}</Chip>
                        </XStack>
                        <Text fontSize="$2" lineHeight={21} color={c.muted} mb={20}>
                          {x.useCase}
                        </Text>
                        <XStack flexWrap="wrap" gap={12}>
                          <Actions template={x} onFork={() => setForking(x)} onPreview={() => preview(x)} />
                          {many && (
                            <Action render="button" onClick={() => toggle(family.family)} aria-expanded={expanded}>
                              {expanded ? 'Hide variants' : 'Show variants'}
                              <Chevron turned={expanded} />
                            </Action>
                          )}
                        </XStack>
                      </YStack>
                    </Cell>
                  </Grid>

                  {expanded && many && (
                    <YStack borderTopWidth={1} borderColor={c.edge} bg={c.ground} p={24}>
                      <Text
                        render="h4"
                        m={0}
                        mb={16}
                        fontSize="$1"
                        lineHeight={16}
                        fontWeight="600"
                        color={c.faint}
                        textTransform="uppercase"
                        letterSpacing={0.8}
                      >
                        All Variants ({family.variantCount})
                      </Text>
                      <Grid columns={{ min: 240, max: 3 }} gap={12}>
                        {family.templates.map((v) => (
                          <YStack
                            key={v.id}
                            bg={c.card}
                            rounded={round.frame}
                            borderWidth={1}
                            borderColor={c.edge}
                            p={16}
                            hoverStyle={{ borderColor: c.strong }}
                          >
                            <XStack items="flex-start" justify="space-between" mb={12} gap={8}>
                              <YStack grow={1} shrink={1}>
                                <Text render="h5" m={0} fontSize="$2" lineHeight={18} fontWeight="500" color={c.ink} mb={2}>
                                  {v.framework}
                                </Text>
                                <Text fontSize="$1" lineHeight={16} color={c.faint}>
                                  {v.displayName}
                                </Text>
                              </YStack>
                              <Chip {...badge}>Tier {v.tier}</Chip>
                            </XStack>
                            <XStack gap={8}>
                              <Action fill render="button" onClick={() => setForking(v)} grow={1} minH={36} px={12}>
                                Deploy
                              </Action>
                              <Action render="button" onClick={() => preview(v)} minH={36} px={12}>
                                {v.port ? 'Preview' : 'Screenshot'}
                              </Action>
                              <Action href={`/templates/${v.slug}`} minH={36} px={12}>
                                Info
                              </Action>
                            </XStack>
                          </YStack>
                        ))}
                      </Grid>
                    </YStack>
                  )}
                </Leaf>
              );
            })}
          </YStack>
        )}

        {forking && <ForkModal template={forking} onClose={() => setForking(null)} />}
      </YStack>
    </YStack>
  );
}
