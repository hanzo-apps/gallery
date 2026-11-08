'use client';

import { useState } from 'react';
import { Dialog, DialogContent, YStack, XStack, Text, ScrollView, Input } from '@hanzo/ui';
import { Grid } from '@hanzo/ui/grid';
import { Action, Chip } from '@hanzo/ui/marketing';
import type { Template } from '../templates-data';
import { assembleProjectConfig, getBlueprint } from '../lib/template-assembly';
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
  'Zen AI API key & model routing (api.hanzo.ai)',
  'Real-time Hanzo Analytics & Insights out of box',
  'Zero-config Hanzo IAM auth & orgs (hanzo.id)',
  'Instant global edge deployment (CDN)',
  'AI token & latency cost telemetry',
  'Automated hanzo.yml CI/CD pipeline',
  'Managed SSL & custom domains',
  '99.99% enterprise uptime SLA',
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
  const blueprint = getBlueprint(template);
  const [method, setMethod] = useState<Method | null>('cloud');
  const [busy, setBusy] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [configTab, setConfigTab] = useState<'cli' | 'sdk' | 'yaml' | 'env'>('cli');
  const [params, setParams] = useState<Record<string, string>>(() =>
    Object.fromEntries(blueprint.params.map((p) => [p.key, p.default])),
  );
  const [blocks, setBlocks] = useState<string[]>(() => [...blueprint.blocks]);

  const assembled = assembleProjectConfig(template, params, blocks);
  const repo = blueprint.repo;

  const toggleBlock = (b: string) => {
    setBlocks((prev) => (prev.includes(b) ? (prev.length > 1 ? prev.filter((x) => x !== b) : prev) : [...prev, b]));
  };

  const run = async () => {
    setBusy(true);
    try {
      if (method === 'cloud') {
        window.open(assembled.platformDeployUrl, '_blank', 'noopener,noreferrer');
      } else if (method === 'local') {
        window.open(repo, '_blank', 'noopener,noreferrer');
      } else if (method === 'github') {
        window.open(`${repo}/fork`, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setBusy(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 2000);
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
            <YStack gap={14}>
              <Head>Parameterize & Assemble Seed Template</Head>
              <Grid columns={{ min: 220, max: 2 }} gap={12}>
                {blueprint.params.map((p) => (
                  <YStack key={p.key} gap={6}>
                    <Text fontSize="$1" lineHeight={16} fontWeight="500" color={c.muted}>
                      {p.label} ({p.envVar})
                    </Text>
                    <Input
                      value={params[p.key] ?? p.default}
                      onChangeText={(val: string) => setParams((prev) => ({ ...prev, [p.key]: val }))}
                      rounded={round.control}
                      bg={c.ground}
                      borderColor={c.edge}
                      color={c.ink}
                    />
                  </YStack>
                ))}
              </Grid>
              <YStack gap={8} pt={4}>
                <Text fontSize="$1" lineHeight={16} fontWeight="500" color={c.muted}>
                  Modular Blocks ({blocks.length} of {blueprint.blocks.length} enabled)
                </Text>
                <XStack flexWrap="wrap" gap={8}>
                  {blueprint.blocks.map((b) => {
                    const active = blocks.includes(b);
                    return (
                      <Chip
                        key={b}
                        render="button"
                        onClick={() => toggleBlock(b)}
                        aria-pressed={active}
                        px={12}
                        py={4}
                        cursor="pointer"
                        {...(active
                          ? { bg: c.bright, color: c.onBright, borderColor: c.bright }
                          : { bg: 'transparent', color: c.muted, borderColor: c.edge })}
                      >
                        {b}
                      </Chip>
                    );
                  })}
                </XStack>
              </YStack>
            </YStack>
          </Well>

          <Well>
            <XStack items="center" justify="space-between" mb={12} flexWrap="wrap" gap={8}>
              <XStack items="center" gap={8} flexWrap="wrap">
                <Head>Hanzo Cloud Stack & SDK Config</Head>
                <XStack gap={4} p={3} rounded={round.pill} bg={c.ground} borderWidth={1} borderColor={c.edge}>
                  {(
                    [
                      ['cli', 'Deploy CLI'],
                      ['sdk', 'src/lib/hanzo.ts'],
                      ['yaml', 'hanzo.yml'],
                      ['env', '.env.local'],
                    ] as const
                  ).map(([id, label]) => (
                    <Text
                      key={id}
                      render="button"
                      onClick={() => setConfigTab(id)}
                      px={10}
                      py={4}
                      rounded={round.pill}
                      borderWidth={0}
                      cursor="pointer"
                      fontSize="$1"
                      lineHeight={14}
                      fontWeight="500"
                      bg={configTab === id ? c.bright : 'transparent'}
                      color={configTab === id ? c.onBright : c.muted}
                    >
                      {label}
                    </Text>
                  ))}
                </XStack>
              </XStack>
              <XStack gap={8} items="center" flexWrap="wrap">
                <Action
                  href="https://console.hanzo.ai/keys"
                  minH={32}
                  px={12}
                >
                  Get API Key ↗
                </Action>
                <Action
                  href="https://analytics.hanzo.ai"
                  minH={32}
                  px={12}
                >
                  Insights ↗
                </Action>
                <Action
                  render="button"
                  onClick={() =>
                    copy(
                      configTab === 'cli'
                        ? assembled.cliCommand
                        : configTab === 'sdk'
                          ? assembled.hanzoSdkCode
                          : configTab === 'yaml'
                            ? assembled.hanzoYaml
                            : assembled.envFile,
                      configTab,
                    )
                  }
                  minH={32}
                  px={12}
                >
                  {copiedKey === configTab ? 'Copied ✓' : 'Copy'}
                </Action>
              </XStack>
            </XStack>
            <YStack bg={c.ground} p={16} rounded={round.control} borderWidth={1} borderColor={c.edge} overflow="scroll">
              <Text render="pre" m={0} {...mono} fontSize="$2" lineHeight={20} color={c.ink} style={{ whiteSpace: 'pre' }}>
                {configTab === 'cli'
                  ? assembled.cliCommand
                  : configTab === 'sdk'
                    ? assembled.hanzoSdkCode
                    : configTab === 'yaml'
                      ? assembled.hanzoYaml
                      : assembled.envFile}
              </Text>
            </YStack>
          </Well>

          <Well>
            <XStack items="center" justify="space-between" gap={16} flexWrap="wrap">
              <YStack shrink={1} minW={0} gap={4}>
                <Head>Template Repository & Path</Head>
                <Text {...mono} fontSize="$2" lineHeight={18} color={c.muted}>
                  {repo} · {template.path}
                </Text>
              </YStack>
              <XStack gap={8}>
                <Action
                  render="button"
                  onClick={() => copy(assembled.platformCliCommand, 'one-liner')}
                  shrink={0}
                  whiteSpace="nowrap"
                >
                  {copiedKey === 'one-liner' ? 'Copied CLI ✓' : 'Copy CLI Deploy'}
                </Action>
                <Action
                  render="button"
                  onClick={() => copy(template.path, 'path')}
                  shrink={0}
                  whiteSpace="nowrap"
                >
                  {copiedKey === 'path' ? 'Copied ✓' : 'Copy Path'}
                </Action>
              </XStack>
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
          <XStack gap={10} flexWrap="wrap">
            <Action render="button" onClick={onClose}>
              Cancel
            </Action>
            <Action
              render="button"
              onClick={() => window.open(assembled.hanzoEditUrl, '_blank', 'noopener,noreferrer')}
            >
              Edit in Hanzo.ai ↗
            </Action>
            <Action
              render="button"
              onClick={() => window.open(assembled.studioBuildUrl, '_blank', 'noopener,noreferrer')}
            >
              Open in Studio
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
                  ? 'Deploy to Hanzo Platform'
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
