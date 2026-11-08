import type { Template } from '../templates-data';

export interface TemplateParam {
  key: string;
  label: string;
  type: 'string' | 'color' | 'enum' | 'boolean';
  default: string;
  options?: string[];
  envVar: string;
  description: string;
}

export interface TemplateCommands {
  install: string;
  dev: string;
  build: string;
  deploy: string;
}

export interface TemplateBlueprint {
  slug: string;
  seed: boolean;
  generation: 'modern' | 'classic';
  intents: string[];
  blocks: string[];
  params: TemplateParam[];
  commands: TemplateCommands;
  repo: string;
  deployUrl: string;
  platformDeployUrl: string;
  previewUrl: string;
}

export interface PromptMatch {
  template: Template;
  blueprint: TemplateBlueprint;
  score: number;
  matchedIntents: string[];
  matchedBlocks: string[];
}

const MODERN_SEED_SLUGS = new Set([
  'instrument',
  'fernline',
  'aerva',
  'tensile',
  'nova',
  'minimal-ui',
  'component-states',
  'lighthouse',
  'warp-tunnel',
  'dotted-globe',
  'tracking-3d',
  'line-illustrations',
  'holo',
  'warp-shader',
  'animated-rings',
  'bestiary',
  'emptykit',
]);

const SEED_SPECS: Record<
  string,
  {
    intents: string[];
    blocks: string[];
    extraParams?: TemplateParam[];
  }
> = {
  instrument: {
    intents: ['portfolio', 'design engineer', 'creative developer', 'interactive lab', 'command palette', 'personal site', 'case study'],
    blocks: ['hero-editorial', 'command-palette-cmdk', 'interactive-lab-grid', 'case-study-reel', 'audio-tactile-keys', 'theme-switcher'],
    extraParams: [
      {
        key: 'personaRole',
        label: 'Role / Discipline',
        type: 'string',
        default: 'Design Engineer',
        envVar: 'VITE_PERSONA_ROLE',
        description: 'Primary role subtitle displayed in the editorial header',
      },
      {
        key: 'enableAudio',
        label: 'Tactile Audio Feedback',
        type: 'boolean',
        default: 'true',
        envVar: 'VITE_ENABLE_AUDIO',
        description: 'Enable synthesized keystroke and interaction clicks',
      },
    ],
  },
  fernline: {
    intents: ['agent console', 'ai observability', 'llm telemetry', 'workflow runner', 'evals dashboard', 'developer tool', 'ops console'],
    blocks: ['agent-trace-stream', 'run-timeline', 'tool-call-inspector', 'latency-flamegraph', 'fleet-status-rail', 'command-bar'],
    extraParams: [
      {
        key: 'telemetryEndpoint',
        label: 'Telemetry API Endpoint',
        type: 'string',
        default: 'https://api.hanzo.ai/v1/traces',
        envVar: 'VITE_TELEMETRY_URL',
        description: 'Streaming endpoint for live agent runs and tool calls',
      },
      {
        key: ' refreshIntervalMs',
        label: 'Stream Poll Interval (ms)',
        type: 'enum',
        default: '1000',
        options: ['500', '1000', '2500', '5000'],
        envVar: 'VITE_STREAM_INTERVAL_MS',
        description: 'Tick cadence for live trace and token throughput updates',
      },
    ],
  },
  aerva: {
    intents: ['climate tech', 'bioscience', 'editorial product', 'hardware launch', 'sustainability', 'research lab', 'longform story'],
    blocks: ['hero-atmospheric', 'telemetry-spec-table', 'editorial-scroll-chapters', 'field-data-cards', 'press-kit-footer'],
    extraParams: [
      {
        key: 'editionLabel',
        label: 'Field Report / Edition',
        type: 'string',
        default: 'Field Release 04',
        envVar: 'VITE_EDITION_LABEL',
        description: 'Issue or hardware revision badge in the top rail',
      },
    ],
  },
  tensile: {
    intents: ['design system', 'architecture studio', 'industrial design', 'structural grid', 'documentation', 'technical showcase'],
    blocks: ['swiss-modular-grid', 'token-specimen-matrix', 'motion-curve-inspector', 'component-anatomy-viewer', 'spec-drawer'],
    extraParams: [
      {
        key: 'gridColumns',
        label: 'Structural Grid Columns',
        type: 'enum',
        default: '12',
        options: ['8', '12', '16'],
        envVar: 'VITE_GRID_COLUMNS',
        description: 'Visible Swiss grid overlay column count',
      },
    ],
  },
  nova: {
    intents: ['ai saas', 'startup landing', 'pricing page', 'product launch', 'developer platform', 'b2b saas', 'waitlist'],
    blocks: ['hero-spotlight', 'interactive-bento-features', 'roi-calculator', 'tiered-pricing-toggle', 'customer-logos', 'faq-accordion'],
    extraParams: [
      {
        key: 'billingDefault',
        label: 'Default Billing Cycle',
        type: 'enum',
        default: 'annual',
        options: ['monthly', 'annual'],
        envVar: 'VITE_BILLING_DEFAULT',
        description: 'Initial state of the pricing table billing toggle',
      },
    ],
  },
  'minimal-ui': {
    intents: ['ui kit', 'component library', 'dashboard starter', 'settings pages', 'clean interface', 'monochrome app'],
    blocks: ['sidebar-shell', 'command-search', 'metric-strip', 'data-table-filterable', 'form-primitives', 'notification-popover'],
    extraParams: [
      {
        key: 'density',
        label: 'Interface Density',
        type: 'enum',
        default: 'comfortable',
        options: ['compact', 'comfortable', 'spacious'],
        envVar: 'VITE_UI_DENSITY',
        description: 'Spacing and control height preset across primitives',
      },
    ],
  },
  'component-states': {
    intents: ['design tokens', 'qa matrix', 'interactive states', 'storybook alternative', 'accessibility audit', 'ui playground'],
    blocks: ['state-matrix-grid', 'focus-ring-inspector', 'contrast-checker', 'token-variable-editor', 'theme-mirror'],
    extraParams: [
      {
        key: 'showPseudoBadges',
        label: 'Show State Badges',
        type: 'boolean',
        default: 'true',
        envVar: 'VITE_SHOW_STATE_BADGES',
        description: 'Display :hover / :focus-visible / :disabled state labels on cells',
      },
    ],
  },
  lighthouse: {
    intents: ['content site', 'documentation', 'blog', 'changelog', 'static site', 'seo landing', 'fast marketing'],
    blocks: ['zero-js-hero', 'perf-score-gauge', 'article-index', 'rss-subscribe-card', 'table-of-contents'],
    extraParams: [
      {
        key: 'contentCollection',
        label: 'Primary Content Section',
        type: 'enum',
        default: 'articles',
        options: ['articles', 'docs', 'changelog'],
        envVar: 'PUBLIC_CONTENT_COLLECTION',
        description: 'Default collection rendered on the index route',
      },
    ],
  },
  'warp-tunnel': {
    intents: ['3d hero', 'webgpu shader', 'immersive launch', 'ai portal', 'cyberpunk', 'webgl background', 'event page'],
    blocks: ['webgpu-warp-canvas', 'tsl-postprocessing-bloom', 'floating-glass-hero', 'pointer-velocity-controller', 'cta-dock'],
    extraParams: [
      {
        key: 'warpSpeed',
        label: 'Tunnel Velocity',
        type: 'enum',
        default: '1.0',
        options: ['0.5', '1.0', '1.75', '2.5'],
        envVar: 'VITE_WARP_SPEED',
        description: 'Base forward speed multiplier for the TSL tunnel shader',
      },
    ],
  },
  'dotted-globe': {
    intents: ['global network', 'edge cloud', 'fintech map', 'infrastructure', 'telemetry globe', 'cdn status', 'world map'],
    blocks: ['interactive-3d-globe', 'great-circle-arcs', 'region-latency-ticker', 'pop-location-cards', 'orbit-camera-rig'],
    extraParams: [
      {
        key: 'autoRotateSpeed',
        label: 'Globe Rotation Speed',
        type: 'enum',
        default: '0.6',
        options: ['0', '0.3', '0.6', '1.2'],
        envVar: 'VITE_GLOBE_ROTATION',
        description: 'Orbital auto-rotation speed when idle',
      },
    ],
  },
  'tracking-3d': {
    intents: ['spatial computing', 'computer vision', 'robotics', '3d product showcase', 'interactive cursor', 'ar vr'],
    blocks: ['cursor-tracked-3d-rig', 'depth-parallax-stage', 'hud-telemetry-reticle', 'spring-camera-controller', 'spec-overlay'],
    extraParams: [
      {
        key: 'trackingDamping',
        label: 'Spring Damping',
        type: 'enum',
        default: '0.08',
        options: ['0.04', '0.08', '0.15'],
        envVar: 'VITE_TRACKING_DAMPING',
        description: 'Pointer-follow interpolation damping factor',
      },
    ],
  },
  'line-illustrations': {
    intents: ['technical illustration', 'svg animation', 'architecture diagram', 'how it works', 'developer explainer', 'blueprint'],
    blocks: ['vector-stroke-sequencer', 'scroll-triggered-diagrams', 'isometric-wireframe-cards', 'step-by-step-flow'],
    extraParams: [
      {
        key: 'strokeSpeed',
        label: 'Stroke Draw Duration (s)',
        type: 'enum',
        default: '1.4',
        options: ['0.8', '1.4', '2.2'],
        envVar: 'VITE_STROKE_DURATION',
        description: 'SVG path dashoffset reveal duration in seconds',
      },
    ],
  },
  holo: {
    intents: ['holographic', 'passes & badges', 'web3', 'collectible card', 'event ticket', 'membership', 'iridescent shader'],
    blocks: ['iridescent-foil-card', 'gyro-tilt-stage', 'chromatic-dispersion-shader', 'tier-selector', 'mint-cta'],
    extraParams: [
      {
        key: 'foilIntensity',
        label: 'Diffraction Intensity',
        type: 'enum',
        default: '0.85',
        options: ['0.5', '0.85', '1.2'],
        envVar: 'VITE_FOIL_INTENSITY',
        description: 'Holographic rainbow diffraction strength on tilt',
      },
    ],
  },
  'warp-shader': {
    intents: ['creative studio', 'fluid background', 'music visual', 'brand launch', 'generative art', 'glsl shader'],
    blocks: ['domain-warped-noise-canvas', 'palette-interpolator', 'minimal-editorial-overlay', 'audio-reactive-hook'],
    extraParams: [
      {
        key: 'noiseOctaves',
        label: 'FBM Noise Octaves',
        type: 'enum',
        default: '4',
        options: ['2', '4', '6'],
        envVar: 'VITE_NOISE_OCTAVES',
        description: 'Detail octaves in the domain-warped fragment shader',
      },
    ],
  },
  'animated-rings': {
    intents: ['ai voice', 'benchmark launch', 'countdown', 'keynote', 'realtime assistant', 'hardware gauge'],
    blocks: ['concentric-webgl-rings', 'orbital-bloom-stage', 'metric-counter-hud', 'voice-pulse-visualizer'],
    extraParams: [
      {
        key: 'ringCount',
        label: 'Orbital Ring Count',
        type: 'enum',
        default: '7',
        options: ['5', '7', '11'],
        envVar: 'VITE_RING_COUNT',
        description: 'Number of concentric WebGL rings in the hero stage',
      },
    ],
  },
  bestiary: {
    intents: ['game', 'creature collector', 'interactive encyclopedia', 'isometric 3d', 'voxel', 'character codex', 'worldbuilding'],
    blocks: ['isometric-voxel-stage', 'creature-codex-drawer', 'biome-filter-bar', 'procedural-animation-rig', 'specimen-stats-card'],
    extraParams: [
      {
        key: 'startingBiome',
        label: 'Default Biome Filter',
        type: 'enum',
        default: 'all',
        options: ['all', 'forest', 'abyss', 'tundra', 'volcanic'],
        envVar: 'VITE_STARTING_BIOME',
        description: 'Initial creature habitat filter in the codex',
      },
    ],
  },
  emptykit: {
    intents: ['blank starter', 'clean scaffold', 'nextjs 16', 'tailwind v4', 'shadcn starter', 'minimal boilerplate', 'custom app'],
    blocks: ['app-router-shell', 'theme-token-provider', 'top-nav-minimal', 'responsive-grid-container', 'api-health-route'],
    extraParams: [
      {
        key: 'layoutVariant',
        label: 'Root Shell Layout',
        type: 'enum',
        default: 'centered',
        options: ['centered', 'sidebar', 'full-bleed'],
        envVar: 'NEXT_PUBLIC_LAYOUT_VARIANT',
        description: 'Initial page container structure for rapid assembly',
      },
    ],
  },
};

function defaultCommands(framework: string, path: string): TemplateCommands {
  const f = framework.toLowerCase();
  if (f.includes('astro')) {
    return {
      install: 'pnpm install',
      dev: 'pnpm dev',
      build: 'pnpm build',
      deploy: `npx hanzo deploy --path "${path}"`,
    };
  }
  if (f.includes('next')) {
    return {
      install: 'pnpm install',
      dev: 'pnpm dev',
      build: 'pnpm build',
      deploy: `npx hanzo deploy --path "${path}"`,
    };
  }
  if (f.includes('vite')) {
    return {
      install: 'pnpm install',
      dev: 'pnpm dev',
      build: 'pnpm build',
      deploy: `npx hanzo deploy --path "${path}"`,
    };
  }
  if (f.includes('react')) {
    return {
      install: 'npm install',
      dev: 'npm start',
      build: 'npm run build',
      deploy: `npx hanzo deploy --path "${path}"`,
    };
  }
  if (f.includes('gulp')) {
    return {
      install: 'npm install',
      dev: 'npx gulp',
      build: 'npx gulp build',
      deploy: `npx hanzo deploy --static --path "${path}"`,
    };
  }
  return {
    install: 'npm install',
    dev: 'npx serve .',
    build: 'echo "Static build ready"',
    deploy: `npx hanzo deploy --static --path "${path}"`,
  };
}

function baseParams(template: Template): TemplateParam[] {
  const isNext = template.framework.toLowerCase().includes('next');
  const isAstro = template.framework.toLowerCase().includes('astro');
  const prefix = isNext ? 'NEXT_PUBLIC_' : isAstro ? 'PUBLIC_' : 'VITE_';
  return [
    {
      key: 'brandName',
      label: 'Brand / Project Name',
      type: 'string',
      default: template.displayName,
      envVar: `${prefix}SITE_NAME`,
      description: 'Primary brand or product title rendered in navigation and metadata',
    },
    {
      key: 'tagline',
      label: 'Hero Tagline',
      type: 'string',
      default: template.useCase,
      envVar: `${prefix}SITE_TAGLINE`,
      description: 'Headline or value proposition displayed in the hero section',
    },
    {
      key: 'accentColor',
      label: 'Accent Color',
      type: 'color',
      default: '#ffffff',
      envVar: `${prefix}ACCENT_COLOR`,
      description: 'Primary interactive accent token (hex or CSS color)',
    },
    {
      key: 'themeMode',
      label: 'Default Theme',
      type: 'enum',
      default: 'dark',
      options: ['dark', 'light', 'system'],
      envVar: `${prefix}THEME_MODE`,
      description: 'Initial color scheme applied on first visit',
    },
  ];
}

function deriveCategoryBlocks(template: Template): { intents: string[]; blocks: string[] } {
  const c = template.category.toLowerCase();
  const featureTokens = template.features.map((f) => f.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  if (c.includes('ai') || c.includes('saas')) {
    return {
      intents: ['ai saas', 'chat app', 'subscription platform', 'marketing site', template.useCase.toLowerCase()],
      blocks: ['hero-cta', 'feature-bento', 'pricing-tiers', 'testimonials', ...featureTokens.slice(0, 3)],
    };
  }
  if (c.includes('dashboard') || c.includes('crm') || c.includes('analytics')) {
    return {
      intents: ['admin dashboard', 'analytics', 'crm', 'backoffice', template.useCase.toLowerCase()],
      blocks: ['sidebar-nav', 'kpi-stat-cards', 'revenue-chart', 'activity-table', ...featureTokens.slice(0, 3)],
    };
  }
  if (c.includes('portfolio') || c.includes('agency')) {
    return {
      intents: ['portfolio', 'creative agency', 'case studies', 'personal site', template.useCase.toLowerCase()],
      blocks: ['project-showcase-grid', 'case-study-detail', 'about-bio', 'contact-form', ...featureTokens.slice(0, 3)],
    };
  }
  if (c.includes('commerce') || c.includes('food')) {
    return {
      intents: ['ecommerce', 'storefront', 'checkout', 'product catalog', template.useCase.toLowerCase()],
      blocks: ['product-grid', 'cart-drawer', 'category-filter', 'checkout-flow', ...featureTokens.slice(0, 3)],
    };
  }
  if (c.includes('3d') || c.includes('shader') || c.includes('interactive')) {
    return {
      intents: ['3d webgl', 'shader hero', 'interactive experience', 'creative coding', template.useCase.toLowerCase()],
      blocks: ['webgl-canvas-stage', 'interactive-camera', 'hud-overlay', ...featureTokens.slice(0, 3)],
    };
  }
  return {
    intents: [template.category.toLowerCase(), template.useCase.toLowerCase(), ...template.features.map((f) => f.toLowerCase())],
    blocks: ['hero-section', 'feature-grid', 'cta-banner', 'responsive-footer', ...featureTokens.slice(0, 3)],
  };
}

export function getBlueprint(template: Template): TemplateBlueprint {
  const isModernSeed = MODERN_SEED_SLUGS.has(template.slug);
  const spec = SEED_SPECS[template.slug];
  const fallback = deriveCategoryBlocks(template);
  const repo = `https://github.com/hanzo-apps/template-${template.slug}`;
  const params = [...baseParams(template), ...(spec?.extraParams ?? [])];

  return {
    slug: template.slug,
    seed: isModernSeed || template.tier === 1,
    generation: isModernSeed ? 'modern' : 'classic',
    intents: spec ? spec.intents : fallback.intents,
    blocks: spec ? spec.blocks : fallback.blocks,
    params,
    commands: defaultCommands(template.framework, template.path),
    repo,
    deployUrl: `https://hanzo.app/new?template=${encodeURIComponent(repo)}&seed=${encodeURIComponent(template.slug)}`,
    platformDeployUrl: `https://platform.hanzo.ai/new?repo=${encodeURIComponent(repo)}&template=${encodeURIComponent(template.slug)}`,
    previewUrl: `/previews/${template.name}/index.html`,
  };
}

/**
 * Match a natural-language build request / prompt to the best seed templates and
 * composable blocks on demand.
 */
export function matchTemplatesForPrompt(
  prompt: string,
  catalog: Template[] = [],
  limit = 6,
): PromptMatch[] {
  const q = prompt.trim().toLowerCase();
  const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length >= 2);

  const scored: PromptMatch[] = catalog.map((template) => {
    const blueprint = getBlueprint(template);
    if (!q) {
      const baseScore = (blueprint.generation === 'modern' ? 100 : 40) + (4 - template.tier) * 15 + template.rating * 5;
      return { template, blueprint, score: baseScore, matchedIntents: [], matchedBlocks: [] };
    }

    let score = 0;
    const matchedIntents: string[] = [];
    const matchedBlocks: string[] = [];

    if (template.slug.includes(q) || template.displayName.toLowerCase().includes(q)) score += 80;
    if (template.category.toLowerCase().includes(q)) score += 50;
    if (template.useCase.toLowerCase().includes(q)) score += 45;
    if ((template.description || '').toLowerCase().includes(q)) score += 35;

    for (const intent of blueprint.intents) {
      if (q.includes(intent) || intent.includes(q)) {
        score += 40;
        matchedIntents.push(intent);
      } else {
        const hitTokens = tokens.filter((tk) => intent.includes(tk));
        if (hitTokens.length > 0) {
          score += hitTokens.length * 14;
          matchedIntents.push(intent);
        }
      }
    }

    for (const block of blueprint.blocks) {
      const readable = block.replace(/-/g, ' ');
      const hitTokens = tokens.filter((tk) => readable.includes(tk));
      if (hitTokens.length > 0) {
        score += hitTokens.length * 12;
        matchedBlocks.push(block);
      }
    }

    for (const tk of tokens) {
      if (template.framework.toLowerCase().includes(tk)) score += 10;
      if (template.features.some((f) => f.toLowerCase().includes(tk))) score += 12;
      if ((template.description || '').toLowerCase().includes(tk)) score += 8;
    }

    if (score > 0) {
      if (blueprint.generation === 'modern') score += 18;
      if (blueprint.seed) score += 10;
      score += (4 - template.tier) * 4;
    }

    return {
      template,
      blueprint,
      score,
      matchedIntents: Array.from(new Set(matchedIntents)),
      matchedBlocks: Array.from(new Set(matchedBlocks)),
    };
  });

  const hits = scored.filter((m) => m.score > 0).sort((a, b) => b.score - a.score);
  if (hits.length > 0) return hits.slice(0, limit);

  // Fallback when prompt has no direct lexical overlap: return top modern seed templates
  return scored
    .sort((a, b) => {
      const aMod = a.blueprint.generation === 'modern' ? 1 : 0;
      const bMod = b.blueprint.generation === 'modern' ? 1 : 0;
      if (aMod !== bMod) return bMod - aMod;
      return a.template.tier - b.template.tier;
    })
    .slice(0, limit);
}

/**
 * Pick a random seed template as a starting point for building a new project.
 * Defaults to the modern seed templates first when `modernFirst` is true.
 */
export function pickRandomSeedTemplate(
  options: {
    category?: string;
    modernOnly?: boolean;
    seedOnly?: boolean;
    excludeSlug?: string;
  } = {},
  catalog: Template[] = [],
): { template: Template; blueprint: TemplateBlueprint } {
  const { category, modernOnly = false, seedOnly = true, excludeSlug } = options;

  let pool = catalog.filter((t) => {
    if (excludeSlug && t.slug === excludeSlug) return false;
    if (category && category !== 'All Categories' && t.category !== category) return false;
    const bp = getBlueprint(t);
    if (modernOnly && bp.generation !== 'modern') return false;
    if (seedOnly && !bp.seed) return false;
    return true;
  });

  if (pool.length === 0) {
    pool = catalog.filter((t) => t.slug !== excludeSlug);
  }

  const picked = pool[Math.floor(Math.random() * pool.length)] || catalog[0];
  return { template: picked, blueprint: getBlueprint(picked) };
}

/**
 * Assemble a parameterized project configuration (.env, hanzo.template.json, CLI command,
 * and on-demand Hanzo Studio build URL) from a seed template and parameter overrides.
 */
export function assembleProjectConfig(
  template: Template,
  paramValues: Record<string, string> = {},
  enabledBlocks?: string[],
): {
  envFile: string;
  manifestJson: string;
  hanzoYaml: string;
  cliCommand: string;
  platformCliCommand: string;
  studioBuildUrl: string;
  platformDeployUrl: string;
  previewUrl: string;
} {
  const blueprint = getBlueprint(template);
  const resolvedParams: Record<string, string> = {};
  const envLines: string[] = [
    `# Generated by Hanzo Template Assembly — seed: ${template.slug}`,
    `HANZO_TEMPLATE_SEED="${template.slug}"`,
  ];

  for (const p of blueprint.params) {
    const val = paramValues[p.key] !== undefined ? paramValues[p.key] : p.default;
    resolvedParams[p.key] = val;
    envLines.push(`${p.envVar}=${JSON.stringify(val)}`);
  }

  const blocks = enabledBlocks && enabledBlocks.length > 0 ? enabledBlocks : blueprint.blocks;
  envLines.push(`HANZO_TEMPLATE_BLOCKS=${JSON.stringify(blocks.join(','))}`);

  const projectSlug = (resolvedParams.brandName || template.slug)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || template.slug;

  const f = template.framework.toLowerCase();
  const outDir = f.includes('next') ? 'out' : f.includes('vite') || f.includes('astro') || blueprint.generation === 'modern' ? 'dist' : f.includes('react') || f.includes('gulp') ? 'build' : '.';

  const hanzoYaml = [
    `# Automated Hanzo Platform & Sites CI/CD (${projectSlug})`,
    `test:`,
    `  - name: build`,
    `    run: |`,
    `      set -e`,
    `      ${blueprint.commands.install}`,
    `      ${blueprint.commands.build}`,
    ``,
    `site:`,
    `  slug: ${projectSlug}`,
    `  dir: ${outDir}`,
    `  build: ${blueprint.commands.install} && ${blueprint.commands.build}`,
    `  on: [main]`,
    ``,
    `platform:`,
    `  project: ${projectSlug}`,
    `  template: ${template.slug}`,
    `  region: global-edge`,
    `  image: ghcr.io/hanzo-apps/${projectSlug}:latest`,
  ].join('\n');

  const manifest = {
    seed: template.slug,
    name: resolvedParams.brandName || template.displayName,
    slug: projectSlug,
    framework: template.framework,
    category: template.category,
    repo: blueprint.repo,
    blocks,
    params: resolvedParams,
    commands: blueprint.commands,
    platform: {
      outDir,
      deployUrl: `https://platform.hanzo.ai/new?repo=${encodeURIComponent(blueprint.repo)}&template=${template.slug}&name=${encodeURIComponent(projectSlug)}`,
      studioUrl: `https://hanzo.app/new?template=${encodeURIComponent(blueprint.repo)}&seed=${template.slug}`,
    },
  };

  const platformCliCommand = `npx @hanzo/cli deploy --template ${template.slug} --name ${projectSlug} --platform`;

  const cliCommand = [
    `# 1-Click Automated Deploy to Hanzo Platform`,
    platformCliCommand,
    ``,
    `# Or clone, parameterize & deploy from local workspace`,
    `git clone ${blueprint.repo} ${projectSlug}`,
    `cd ${projectSlug}`,
    `cat << 'EOF' > .env.local\n${envLines.join('\n')}\nEOF`,
    `cat << 'EOF' > hanzo.yml\n${hanzoYaml}\nEOF`,
    blueprint.commands.install,
    blueprint.commands.deploy,
  ].join('\n');

  const query = new URLSearchParams({
    template: blueprint.repo,
    seed: template.slug,
    name: resolvedParams.brandName || template.displayName,
    blocks: blocks.join(','),
  });

  const platformQuery = new URLSearchParams({
    repo: blueprint.repo,
    template: template.slug,
    name: projectSlug,
    blocks: blocks.join(','),
  });

  return {
    envFile: envLines.join('\n'),
    manifestJson: JSON.stringify(manifest, null, 2),
    hanzoYaml,
    cliCommand,
    platformCliCommand,
    studioBuildUrl: `https://hanzo.app/new?${query.toString()}`,
    platformDeployUrl: `https://platform.hanzo.ai/new?${platformQuery.toString()}`,
    previewUrl: blueprint.previewUrl,
  };
}
