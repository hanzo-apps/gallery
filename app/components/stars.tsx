import { XStack, Text } from '@hanzo/ui';

/** Five stars, `n` of them lit, in the page's one ink. */
export function Stars({ n, size = '$3' }: { n: number; size?: '$2' | '$3' | '$6' | '$7' }) {
  return (
    <XStack aria-label={`${n} of 5`} gap={2}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Text key={i} aria-hidden fontSize={size} color={i < n ? 'var(--foreground)' : 'var(--text-disabled)'}>
          ★
        </Text>
      ))}
    </XStack>
  );
}
