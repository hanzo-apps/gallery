'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { YStack, XStack, Text, Spinner } from '@hanzo/ui';
import { Grid } from '@hanzo/ui/grid';
import { Action, Chip, Display, Eyebrow, Lede, Line, Title } from '@hanzo/ui/marketing';
import { templates } from './templates-data';
import { shot } from './lib/shot';
import { getUniqueTemplates } from './lib/template-utils';
import type { Template } from './templates-data';
import { c, column, lift, round } from './lib/design';
import { Stars } from './components/stars';

export default function NotFound() {
  const [pick, setPick] = useState<Template | null>(null);
  const [fading, setFading] = useState(false);
  const unique = getUniqueTemplates(templates);

  const another = () => unique[Math.floor(Math.random() * unique.length)];

  useEffect(() => {
    setPick(another());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reroll() {
    setFading(true);
    setTimeout(() => {
      setPick(another());
      setFading(false);
    }, 200);
  }

  if (!pick) {
    return (
      <YStack minH="70vh" bg={c.ground} items="center" justify="center">
        <Spinner size={32} />
      </YStack>
    );
  }

  return (
    <YStack minH="70vh" bg={c.ground} items="center" justify="center" py={96}>
      <YStack {...column(896)}>
        <YStack items="center" mb={48} gap={12}>
          <Eyebrow>404</Eyebrow>
          <Display text="center">Template not found</Display>
          <Lede text="center">Here is one to start from instead.</Lede>
        </YStack>

        <YStack
          transition="quick"
          bg={c.card}
          rounded={round.card}
          borderWidth={1}
          borderColor={c.edge}
          p={32}
          boxShadow={lift.card}
          opacity={fading ? 0.5 : 1}
          scale={fading ? 0.98 : 1}
        >
          <Title quiet mb={24}>
            How about this instead?
          </Title>

          <Grid columns={{ min: 280, max: 2 }} gap={24} style={{ marginBottom: 24 }}>
            <YStack
              position="relative"
              aspectRatio={16 / 9}
              rounded={round.frame}
              overflow="hidden"
              borderWidth={1}
              borderColor={c.edge}
              bg={c.raised}
            >
              <Image src={shot(pick.screenshot)} alt={pick.displayName} fill unoptimized style={{ objectFit: 'cover' }} />
            </YStack>

            <YStack justify="center" gap={16}>
              <Line render="h3" size="x2" weight="500" display="block">
                {pick.displayName}
              </Line>
              <Text
                fontSize="$3"
                lineHeight={22}
                color={c.muted}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {pick.description || `Premium ${pick.displayName} template with modern design and functionality.`}
              </Text>

              <XStack flexWrap="wrap" gap={8}>
                <Chip px={12} py={4}>
                  {pick.framework}
                </Chip>
                <Chip px={12} py={4}>
                  {pick.category}
                </Chip>
                <Chip px={12} py={4}>
                  Tier {pick.tier}
                </Chip>
              </XStack>

              <XStack items="center" gap={8}>
                <Stars n={pick.rating} size="$6" />
                <Text fontSize="$2" lineHeight={18} color={c.faint}>
                  ({pick.rating}/5)
                </Text>
              </XStack>
            </YStack>
          </Grid>

          <XStack flexWrap="wrap" gap={12} justify="center">
            <Action fill href={`/templates/${pick.slug}`}>
              View This Template
            </Action>
            <Action render="button" onClick={reroll} disabled={fading}>
              Show Another Random
            </Action>
          </XStack>
        </YStack>

        <XStack flexWrap="wrap" gap={12} justify="center" mt={48}>
          <Action href="/gallery">← Browse All Templates</Action>
          <Action href="/">Home</Action>
        </XStack>

        <YStack items="center" mt={48}>
          <Text fontSize="$2" lineHeight={18} color={c.faint}>
            Fun fact: We have {unique.length} amazing templates waiting for you!
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}
