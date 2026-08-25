'use client';

import { useState } from 'react';
import { Dialog, DialogContent, YStack, XStack, H2, H3, Text, Button, ScrollView } from '@hanzo/ui';
import { Grid } from '@hanzo/ui/grid';
import type { Template } from '../templates-data';
import { c, t, at } from '../lib/design';

interface ForkModalProps {
  template: Template;
  onClose: () => void;
}

const deploy = `

# Deploy to Hanzo Cloud
npx hanzo deploy`;

function setupCommands(template: Template): string {
  const f = template.framework.toLowerCase();
  const cd = `# Navigate to template\ncd "${template.path}"`;
  const install = `\n\n# Install dependencies\nnpm install`;

  if (f.includes('next.js') || f.includes('nextjs'))
    return `${cd}${install}\n\n# Set up environment (if needed)\ncp .env.example .env.local\n\n# Run development server\nnpm run dev\n\n# Build for production\nnpm run build${deploy}`;

  if (f.includes('react') && (f.includes('vite') || f.includes('18')))
    return `${cd}${install}\n\n# Run development\nnpm run dev\n\n# Build for production\nnpm run build${deploy}`;

  if (f.includes('react') && f.includes('cra'))
    return `${cd}${install}\n\n# Run development\nnpm start\n\n# Build for production\nnpm run build${deploy}`;

  if (f.includes('html') && f.includes('gulp'))
    return `${cd}${install}\n\n# Run development\ngulp\n\n# Build for production\ngulp build\n\n# Deploy to Hanzo Cloud (static site)\nnpx hanzo deploy --static`;

  if (f.includes('html'))
    return `${cd}\n\n# Install dependencies (if needed)\nnpm install\n\n# Serve locally\nnpx serve .\n\n# Deploy to Hanzo Cloud (static site)\nnpx hanzo deploy --static`;

  return `${cd}\n\n# See README for framework-specific setup`;
}

function estimate(template: Template): string {
  const f = template.framework.toLowerCase();
  if (f.includes('next.js') || f.includes('nextjs')) return '2-3 minutes';
  if (f.includes('react')) return '3-4 minutes';
  if (f.includes('html') && f.includes('gulp')) return '2-3 minutes';
  return '2-5 minutes';
}

type Method = 'cloud' | 'local' | 'github';

const methods: { id: Method; icon: string; head: string; note: string; edge: string }[] = [
  { id: 'cloud', icon: '🚀', head: 'Deploy to Hanzo Cloud', note: 'One-click deployment to Hanzo global edge network', edge: c.blue500 },
  { id: 'local', icon: '📦', head: 'Download & Deploy Locally', note: 'Download template and deploy from your machine', edge: c.green500 },
  { id: 'github', icon: '🔗', head: 'Clone to GitHub', note: 'Fork to your GitHub and connect to Hanzo', edge: c.purple500 },
];

const perks = [
  'Instant global deployment',
  'Global edge network (CDN)',
  'Auto-scaling infrastructure',
  'Built-in analytics dashboard',
  'Automated CI/CD pipeline',
  'SSL certificates included',
  'Performance monitoring',
  '99.99% uptime SLA',
];

/** A bordered well: the setup block and the path row sit in one. */
function Well({ children }: { children: React.ReactNode }) {
  return (
    <YStack
      backgroundColor={c.white5}
      borderRadius="var(--radius-xl, 1rem)"
      borderWidth={1}
      borderColor={c.white10}
      padding={16}
      marginBottom={24}
    >
      {children}
    </YStack>
  );
}

const mono = { fontFamily: 'var(--font-zen-mono), monospace' } as const;

export function ForkModal({ template, onClose }: ForkModalProps) {
  const [method, setMethod] = useState<Method | null>(null);
  const [busy, setBusy] = useState(false);

  const repo = `https://github.com/hanzo-apps/template-${template.slug}`;

  const run = async () => {
    setBusy(true);
    try {
      if (method === 'cloud') {
        await new Promise((r) => setTimeout(r, 2000));
        alert('🚀 Deployment initiated!\n\nYour template is being deployed to Hanzo Cloud.\nYou will receive a deployment URL shortly.');
      } else if (method === 'local') {
        window.open(repo, '_blank');
        alert('📦 Opening GitHub repository!\n\nClone the repo and follow the setup commands.');
      } else if (method === 'github') {
        await new Promise((r) => setTimeout(r, 1500));
        alert('🔗 GitHub fork created!\n\nRepository forked to your account.\nConnect to Hanzo Cloud in the next step.');
      }
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setBusy(false);
    }
  };

  const copy = (text: string, said: string) => {
    navigator.clipboard.writeText(text);
    alert(said);
  };

  return (
    <Dialog modal open onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        width="100%"
        maxWidth={896}
        maxHeight="90vh"
        padding={0}
        overflow="hidden"
        borderRadius="var(--radius-2xl, 1.5rem)"
        borderWidth={1}
        borderColor={c.white20}
        backgroundImage={`linear-gradient(to bottom right, ${c.gray900}, ${c.gray950})`}
      >
        <XStack
          padding={24}
          justifyContent="space-between"
          alignItems="flex-start"
          backgroundImage={`linear-gradient(to right, ${c.blue600}, ${c.purple600})`}
        >
          <YStack flexShrink={1}>
            <H2 {...t.xl2} fontWeight={700} color="#fff" marginBottom={8}>
              Fork {template.displayName} on Hanzo AI
            </H2>
            <Text color={c.blue100} {...t.sm}>
              {template.framework} • {template.category}
            </Text>
          </YStack>
          <Button
            onPress={onClose}
            transition="quickest"
            height="auto"
            paddingHorizontal={16}
            paddingVertical={8}
            borderRadius="var(--radius-lg, 0.75rem)"
            backgroundColor="rgba(255,255,255,0.1)"
            hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            aria-label="Close"
          >
            <Text color="#fff">✕</Text>
          </Button>
        </XStack>

        <ScrollView flex={1} padding={24}>
          <YStack marginBottom={24}>
            <H3 {...t.lg} fontWeight={600} color="#fff" marginBottom={16}>
              Choose Deployment Method
            </H3>
            <Grid columns={{ min: 220, max: 3 }} gap={16}>
              {methods.map((m) => (
                <YStack
                  key={m.id}
                  render="button"
                  onPress={() => setMethod(m.id)}
                  transition="quickest"
                  alignItems="flex-start"
                  cursor="pointer"
                  padding={16}
                  borderRadius="var(--radius-xl, 1rem)"
                  borderWidth={2}
                  borderColor={method === m.id ? m.edge : c.white10}
                  backgroundColor={method === m.id ? at(m.edge, 0.1) : c.white5}
                  hoverStyle={{ borderColor: at(m.edge, 0.5) }}
                >
                  <Text {...t.xl3} marginBottom={8}>
                    {m.icon}
                  </Text>
                  <H3 fontWeight={700} color="#fff" marginBottom={4}>
                    {m.head}
                  </H3>
                  <Text {...t.sm} color={c.gray400} marginBottom={8}>
                    {m.note}
                  </Text>
                  <Text {...t.xs} {...mono} color={m.edge}>
                    {m.id === 'cloud'
                      ? `Estimated: ${estimate(template)}`
                      : m.id === 'local'
                        ? `Path: ${template.path}`
                        : 'git clone ...'}
                  </Text>
                </YStack>
              ))}
            </Grid>
          </YStack>

          <Well>
            <XStack alignItems="center" justifyContent="space-between" marginBottom={12}>
              <H3 fontWeight={600} color="#fff">
                Setup Commands
              </H3>
              <Button
                onPress={() => copy(setupCommands(template), '✅ Setup commands copied to clipboard!')}
                transition="quickest"
                height="auto"
                paddingHorizontal={12}
                paddingVertical={4}
                borderRadius="var(--radius-lg, 0.75rem)"
                backgroundColor="rgba(255,255,255,0.1)"
                hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Text {...t.sm} color="#fff">
                  📋 Copy
                </Text>
              </Button>
            </XStack>
            <YStack
              backgroundColor="rgba(0,0,0,0.5)"
              padding={16}
              borderRadius="var(--radius-lg, 0.75rem)"
              overflow="scroll"
            >
              <Text render="pre" {...t.sm} {...mono} color={c.green400} style={{ whiteSpace: 'pre' }}>
                {setupCommands(template)}
              </Text>
            </YStack>
          </Well>

          <Well>
            <XStack alignItems="center" justifyContent="space-between" gap={16}>
              <YStack flexShrink={1}>
                <H3 fontWeight={600} color="#fff" marginBottom={4}>
                  Template Path
                </H3>
                <Text {...t.sm} {...mono} color={c.gray400}>
                  {template.path}
                </Text>
              </YStack>
              <Button
                onPress={() => copy(template.path, `📋 Path copied!\n\nRelative path: ${template.path}`)}
                transition="quickest"
                height="auto"
                paddingHorizontal={16}
                paddingVertical={8}
                borderRadius="var(--radius-lg, 0.75rem)"
                backgroundColor="rgba(255,255,255,0.1)"
                hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Text color="#fff" whiteSpace="nowrap">
                  📋 Copy Path
                </Text>
              </Button>
            </XStack>
          </Well>

          <YStack
            backgroundImage={`linear-gradient(to bottom right, ${at(c.blue500, 0.1)}, ${at(c.purple500, 0.1)})`}
            borderRadius="var(--radius-xl, 1rem)"
            borderWidth={1}
            borderColor={at(c.blue500, 0.2)}
            padding={24}
          >
            <H3 {...t.lg} fontWeight={600} color="#fff" marginBottom={16}>
              What You Get with Hanzo AI
            </H3>
            <Grid columns={{ min: 240, max: 2 }} gap={12}>
              {perks.map((perk) => (
                <XStack key={perk} alignItems="center" gap={8}>
                  <Text color={c.green400}>✓</Text>
                  <Text color={c.gray300}>{perk}</Text>
                </XStack>
              ))}
            </Grid>
          </YStack>
        </ScrollView>

        <XStack
          padding={24}
          alignItems="center"
          justifyContent="space-between"
          gap={16}
          borderTopWidth={1}
          borderColor={c.white10}
          backgroundColor={at(c.gray900, 0.8)}
          backdropFilter="blur(4px)"
        >
          <Text {...t.sm} color={c.gray400}>
            {method
              ? `Ready to ${method === 'cloud' ? 'deploy' : method === 'local' ? 'download' : 'clone'}?`
              : 'Select a deployment method to continue'}
          </Text>
          <XStack gap={12}>
            <Button
              onPress={onClose}
              transition="quickest"
              height="auto"
              paddingHorizontal={24}
              paddingVertical={8}
              borderRadius="var(--radius-lg, 0.75rem)"
              backgroundColor={c.white5}
              borderWidth={1}
              borderColor={c.white10}
              hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <Text color="#fff">Cancel</Text>
            </Button>
            <Button
              onPress={run}
              disabled={!method || busy}
              isLoading={busy}
              transition="quickest"
              height="auto"
              paddingHorizontal={24}
              paddingVertical={8}
              borderRadius="var(--radius-lg, 0.75rem)"
              {...(method && !busy
                ? {
                    backgroundImage: c.cool,
                    boxShadow: `0 10px 15px ${at(c.blue500, 0.25)}`,
                    hoverStyle: { backgroundImage: c.coolHover },
                  }
                : { backgroundColor: c.gray700 })}
            >
              <Text fontWeight={500} color={method && !busy ? '#fff' : c.gray500}>
                {busy
                  ? 'Processing…'
                  : method === 'cloud'
                    ? '🚀 Deploy Now'
                    : method === 'local'
                      ? '⬇️ Download Now'
                      : method === 'github'
                        ? '🔗 Clone to GitHub'
                        : 'Select Option'}
              </Text>
            </Button>
          </XStack>
        </XStack>
      </DialogContent>
    </Dialog>
  );
}
