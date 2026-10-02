'use client';

import { useState } from 'react';
import { Dialog, DialogContent, YStack, XStack, Text, ScrollView } from '@hanzo/ui';
import { Grid } from '@hanzo/ui/grid';
import { Action } from '@hanzo/ui/marketing';
import type { Template } from '../templates-data';
import { c, round, mono } from '../lib/design';

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

const methods: { id: Method; head: string; note: string }[] = [
  { id: 'cloud', head: 'Deploy to Hanzo Cloud', note: 'One-click deployment to Hanzo global edge network' },
  { id: 'local', head: 'Download & Deploy Locally', note: 'Download template and deploy from your machine' },
  { id: 'github', head: 'Clone to GitHub', note: 'Fork to your GitHub and connect to Hanzo' },
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

/** A section heading inside the dialog. */
function Head({ children }: { children: React.ReactNode }) {
  return (
    <Text render="h3" m={0} fontSize="$3" lineHeight={20} fontWeight="600" color={c.ink}>
      {children}
    </Text>
  );
}

/** A bordered well: the setup block and the path row each sit in one. */
function Well({ children }: { children: React.ReactNode }) {
  return (
    <YStack bg={c.card} rounded={round.frame} borderWidth={1} borderColor={c.edge} p={16} mb={20}>
      {children}
    </YStack>
  );
}

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

  const ready = method !== null && !busy;

  return (
    <Dialog modal open onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        width="100%"
        maxW={896}
        maxH="90vh"
        p={0}
        overflow="hidden"
        rounded={round.card}
        borderWidth={1}
        borderColor={c.edge}
        bg={c.card}
      >
        <XStack p={24} gap={16} justify="space-between" items="flex-start" borderBottomWidth={1} borderColor={c.edge}>
          <YStack shrink={1}>
            <Text render="h2" m={0} mb={6} fontSize="$7" lineHeight={26} fontWeight="500" color={c.ink}>
              Fork {template.displayName} on Hanzo AI
            </Text>
            <Text fontSize="$2" lineHeight={18} color={c.muted}>
              {template.framework} · {template.category}
            </Text>
          </YStack>
          <Text
            render="button"
            onClick={onClose}
            aria-label="Close"
            display="grid"
            placeItems="center"
            shrink={0}
            width={36}
            height={36}
            p={0}
            borderWidth={0}
            rounded={round.pill}
            bg="transparent"
            color={c.muted}
            cursor="pointer"
            hoverStyle={{ bg: c.wash, color: c.ink }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Text>
        </XStack>

        <ScrollView flex={1} p={24}>
          <YStack mb={24} gap={14}>
            <Head>Choose Deployment Method</Head>
            <Grid columns={{ min: 220, max: 3 }} gap={12}>
              {methods.map((m) => {
                const on = method === m.id;
                return (
                  <YStack
                    key={m.id}
                    render="button"
                    onPress={() => setMethod(m.id)}
                    aria-pressed={on}
                    items="flex-start"
                    cursor="pointer"
                    p={16}
                    gap={6}
                    rounded={round.frame}
                    borderWidth={1}
                    borderColor={on ? c.chosen : c.edge}
                    bg={on ? c.wash : 'transparent'}
                    hoverStyle={{ borderColor: on ? c.chosen : c.strong }}
                  >
                    <Text fontSize="$3" lineHeight={20} fontWeight="600" color={c.ink} text="left">
                      {m.head}
                    </Text>
                    <Text fontSize="$2" lineHeight={18} color={c.muted} text="left">
                      {m.note}
                    </Text>
                    <Text {...mono} fontSize="$1" lineHeight={16} color={c.faint} text="left">
                      {m.id === 'cloud'
                        ? `Estimated: ${estimate(template)}`
                        : m.id === 'local'
                          ? `Path: ${template.path}`
                          : 'git clone ...'}
                    </Text>
                  </YStack>
                );
              })}
            </Grid>
          </YStack>

          <Well>
            <XStack items="center" justify="space-between" mb={12}>
              <Head>Setup Commands</Head>
              <Action render="button" onClick={() => copy(setupCommands(template), '✅ Setup commands copied to clipboard!')} minH={32} px={12}>
                Copy
              </Action>
            </XStack>
            <YStack bg={c.ground} p={16} rounded={round.control} borderWidth={1} borderColor={c.edge} overflow="scroll">
              <Text render="pre" m={0} {...mono} fontSize="$2" lineHeight={20} color={c.ink} style={{ whiteSpace: 'pre' }}>
                {setupCommands(template)}
              </Text>
            </YStack>
          </Well>

          <Well>
            <XStack items="center" justify="space-between" gap={16}>
              <YStack shrink={1} minW={0} gap={4}>
                <Head>Template Path</Head>
                <Text {...mono} fontSize="$2" lineHeight={18} color={c.muted}>
                  {template.path}
                </Text>
              </YStack>
              <Action
                render="button"
                onClick={() => copy(template.path, `📋 Path copied!\n\nRelative path: ${template.path}`)}
                shrink={0}
                whiteSpace="nowrap"
              >
                Copy Path
              </Action>
            </XStack>
          </Well>

          <YStack rounded={round.frame} borderWidth={1} borderColor={c.edge} p={24} gap={16}>
            <Head>What You Get with Hanzo AI</Head>
            <Grid columns={{ min: 240, max: 2 }} gap={10}>
              {perks.map((perk) => (
                <XStack key={perk} items="center" gap={8}>
                  <Text aria-hidden fontSize="$2" color={c.ink}>
                    ✓
                  </Text>
                  <Text fontSize="$2" lineHeight={20} color={c.muted}>
                    {perk}
                  </Text>
                </XStack>
              ))}
            </Grid>
          </YStack>
        </ScrollView>

        <XStack p={20} px={24} items="center" justify="space-between" gap={16} flexWrap="wrap" borderTopWidth={1} borderColor={c.edge} bg={c.card}>
          <Text fontSize="$2" lineHeight={18} color={c.muted}>
            {method
              ? `Ready to ${method === 'cloud' ? 'deploy' : method === 'local' ? 'download' : 'clone'}?`
              : 'Select a deployment method to continue'}
          </Text>
          <XStack gap={10}>
            <Action render="button" onClick={onClose}>
              Cancel
            </Action>
            <Action
              fill
              render="button"
              onClick={run}
              disabled={!ready}
              aria-disabled={!ready}
              opacity={ready ? 1 : 0.4}
              cursor={ready ? 'pointer' : 'not-allowed'}
            >
              {busy
                ? 'Processing…'
                : method === 'cloud'
                  ? 'Deploy now'
                  : method === 'local'
                    ? 'Download now'
                    : method === 'github'
                      ? 'Clone to GitHub'
                      : 'Select option'}
            </Action>
          </XStack>
        </XStack>
      </DialogContent>
    </Dialog>
  );
}
