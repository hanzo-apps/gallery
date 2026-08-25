'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { YStack, XStack, H1, H2, H3, H4, Text, Button, Spinner } from '@hanzo/ui';
import { Grid } from '@hanzo/ui/grid';
import { templates } from './templates-data';
import { shot } from './lib/shot';
import { getUniqueTemplates } from './lib/template-utils';
import type { Template } from './templates-data';
import { c, t, at, clip, hue, tint } from './lib/design';
import { Stars } from './components/stars';

const pulse = { animation: 'pulse 2s cubic-bezier(.4,0,.6,1) infinite' };

/** A rounded chip: the framework, the category, the tier. */
function Chip({ children, ...rest }: { children: React.ReactNode; [k: string]: unknown }) {
  return (
    <Text
      paddingHorizontal={12}
      paddingVertical={4}
      borderRadius="var(--radius-lg, 0.75rem)"
      borderWidth={1}
      {...t.sm}
      fontWeight={500}
      {...rest}
    >
      {children}
    </Text>
  );
}

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
      <YStack minHeight="100vh" backgroundColor={c.ink} alignItems="center" justifyContent="center">
        <Spinner size={64} color={c.blue500} />
      </YStack>
    );
  }

  return (
    <YStack
      minHeight="100vh"
      backgroundColor={c.ink}
      alignItems="center"
      justifyContent="center"
      padding={16}
    >
      <YStack position="absolute" top={0} left={0} right={0} bottom={0} overflow="hidden" pointerEvents="none">
        <YStack
          position="absolute"
          top="25%"
          left="25%"
          width={384}
          height={384}
          borderRadius={9999}
          backgroundColor={at(c.blue500, 0.1)}
          filter="blur(120px)"
          style={pulse}
        />
        <YStack
          position="absolute"
          bottom="25%"
          right="25%"
          width={384}
          height={384}
          borderRadius={9999}
          backgroundColor={at(c.purple500, 0.1)}
          filter="blur(120px)"
          style={{ animation: 'pulse 2s cubic-bezier(.4,0,.6,1) 1s infinite' }}
        />
      </YStack>

      <YStack position="relative" zIndex={10} width="100%" maxWidth={896}>
        <YStack alignItems="center" marginBottom={48}>
          <H1 {...t.xl9} fontWeight={700} marginBottom={16} style={pulse} {...clip(c.wash)}>
            404
          </H1>
          <H2 {...t.xl3} fontWeight={700} color={c.neutral300} marginBottom={12} textAlign="center">
            Oops! Template Not Found
          </H2>
          <Text {...t.lg} color={c.neutral500} marginBottom={32} textAlign="center">
            The template you&apos;re looking for doesn&apos;t exist. But don&apos;t worry—we&apos;ve got plenty
            more!
          </Text>
        </YStack>

        <YStack
          transition="quick"
          backgroundImage={`linear-gradient(to bottom right, ${at(c.neutral900, 0.5)}, ${at(c.neutral800, 0.5)})`}
          backdropFilter="blur(24px)"
          borderRadius="var(--radius-3xl, 1.5rem)"
          borderWidth={1}
          borderColor={c.white10}
          padding={32}
          boxShadow="0 25px 50px rgb(0 0 0 / .25)"
          opacity={fading ? 0.5 : 1}
          scale={fading ? 0.95 : 1}
        >
          <XStack alignItems="center" gap={12} marginBottom={24}>
            <Text {...t.xl3}>✨</Text>
            <H3 {...t.xl2} fontWeight={700} color="#fff">
              How about this instead?
            </H3>
          </XStack>

          <Grid columns={{ min: 280, max: 2 }} gap={24} style={{ marginBottom: 24 }}>
            <YStack
              position="relative"
              aspectRatio={16 / 9}
              borderRadius="var(--radius-xl, 1rem)"
              overflow="hidden"
              borderWidth={1}
              borderColor={c.white10}
              boxShadow="0 10px 15px rgb(0 0 0 / .1), 0 4px 6px rgb(0 0 0 / .05)"
            >
              <Image
                src={shot(pick.screenshot)}
                alt={pick.displayName}
                fill
                unoptimized
                style={{ objectFit: 'cover' }}
              />
            </YStack>

            <YStack justifyContent="center">
              <H4 {...t.xl3} fontWeight={700} marginBottom={12} {...clip(c.washShort)}>
                {pick.displayName}
              </H4>
              <Text
                color={c.neutral400}
                marginBottom={16}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {pick.description ||
                  `Premium ${pick.displayName} template with modern design and functionality.`}
              </Text>

              <XStack flexWrap="wrap" gap={8} marginBottom={16}>
                <Chip {...tint('blue')}>{pick.framework}</Chip>
                <Chip {...tint('purple')}>{pick.category}</Chip>
                <Chip {...tint(hue(pick.tier))}>Tier {pick.tier}</Chip>
              </XStack>

              <XStack alignItems="center" gap={8}>
                <Stars n={pick.rating} size={t.xl} />
                <Text {...t.sm} color={c.neutral500}>
                  ({pick.rating}/5)
                </Text>
              </XStack>
            </YStack>
          </Grid>

          <XStack flexWrap="wrap" gap={12} justifyContent="center">
            <Button
              render={<Link href={`/templates/${pick.slug}`} />}
              transition="quickest"
              height="auto"
              paddingHorizontal={32}
              paddingVertical={16}
              borderRadius="var(--radius-xl, 1rem)"
              backgroundImage={c.cool}
              boxShadow={`0 10px 15px ${at(c.blue500, 0.5)}`}
              hoverStyle={{
                backgroundImage: c.coolHover,
                scale: 1.05,
                boxShadow: `0 10px 15px ${at(c.blue500, 0.7)}`,
              }}
            >
              <Text {...t.lg} fontWeight={700} color="#fff">
                🚀 View This Template
              </Text>
            </Button>
            <Button
              onPress={reroll}
              disabled={fading}
              transition="quickest"
              height="auto"
              paddingHorizontal={32}
              paddingVertical={16}
              borderRadius="var(--radius-xl, 1rem)"
              backgroundColor={c.white5}
              borderWidth={1}
              borderColor={c.white20}
              hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.1)', scale: 1.05 }}
              disabledStyle={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              <Text {...t.lg} fontWeight={700} color="#fff">
                🎲 Show Another Random
              </Text>
            </Button>
          </XStack>
        </YStack>

        <XStack flexWrap="wrap" gap={16} justifyContent="center" marginTop={48}>
          <Button
            render={<Link href="/gallery" />}
            transition="quickest"
            height="auto"
            paddingHorizontal={24}
            paddingVertical={12}
            borderRadius="var(--radius-xl, 1rem)"
            backgroundColor={at(c.neutral800, 0.5)}
            borderWidth={1}
            borderColor={c.neutral700}
            hoverStyle={{ backgroundColor: at(c.neutral700, 0.5), borderColor: c.neutral600 }}
          >
            <Text fontWeight={500} color={c.neutral300}>
              ← Browse All Templates
            </Text>
          </Button>
          <Button
            render={<Link href="/" />}
            transition="quickest"
            height="auto"
            paddingHorizontal={24}
            paddingVertical={12}
            borderRadius="var(--radius-xl, 1rem)"
            backgroundColor={at(c.neutral800, 0.5)}
            borderWidth={1}
            borderColor={c.neutral700}
            hoverStyle={{ backgroundColor: at(c.neutral700, 0.5), borderColor: c.neutral600 }}
          >
            <Text fontWeight={500} color={c.neutral300}>
              🏠 Go Home
            </Text>
          </Button>
        </XStack>

        <YStack alignItems="center" marginTop={48}>
          <Text {...t.sm} color={c.neutral600}>
            💡 Fun fact: We have {unique.length} amazing templates waiting for you!
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}
