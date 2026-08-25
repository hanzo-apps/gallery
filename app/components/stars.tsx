import { XStack, Text } from '@hanzo/ui';
import { c, t } from '../lib/design';

/** Five stars, `n` of them lit. Written three times before this existed. */
export function Stars({ n, size = t.base }: { n: number; size?: (typeof t)[keyof typeof t] }) {
  return (
    <XStack>
      {[0, 1, 2, 3, 4].map((i) => (
        <Text key={i} {...size} color={i < n ? c.yellow400 : c.gray600}>
          ★
        </Text>
      ))}
    </XStack>
  );
}
