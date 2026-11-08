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
  hanzoEditUrl: string;
  previewUrl: string;
  llmMdUrl: string;
  cloudServices: string[];
  hotspots: {
    copyData: string[];
    uiComponents: string[];
    stylingTokens: string[];
    preserveDoNotBreak: string[];
  };
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
  // 35 Full-Stack @hanzo/gui + @hanzo/iam + @hanzo/base Apps
  'agenda',
  'bistro',
  'booking',
  'deskline',
  'devlog',
  'dispatch',
  'dropstore',
  'epk',
  'essays',
  'expenses',
  'feedback',
  'gear',
  'habits',
  'hanzo-starter',
  'inventory',
  'kanban',
  'launchpad',
  'links',
  'magazine',
  'meetup',
  'photoessay',
  'proposal',
  'rally',
  'reading',
  'releases',
  'resume',
  'retro',
  'roadmap',
  'roster',
  'setlist',
  'shop',
  'smartlink',
  'standup',
  'upvote',
  'waitlist',
  // 8 Desktop Apps (Tauri v2 / Electron + React 19 + Hanzo Base)
  'desktop-tauri',
  'desktop-chat',
  'desktop-editor',
  'desktop-electron',
  'desktop-monitor',
  'desktop-notes',
  'desktop-recorder',
  'desktop-tray',
  // 6 WebGPU / Physics / Game Starters
  'three-webgpu',
  'rapier-physics',
  'voxel-craft',
  'kart-racer',
  'godot-arcade',
  'unity-webgl',
  // 18 Mobile & Native Starters
  'mobile',
  'expo-auth',
  'expo-chat',
  'expo-shop',
  'flutter',
  'flutter-chat',
  'swiftui',
  'swiftui-chat',
  'android-compose-jetchat',
  'android-compose-jetnews',
  'android-compose-jetsnack',
  'android-expo-nativewind',
  'android-expo-tabs',
  'android-flutter-animations',
  'android-flutter-forms',
  'android-flutter-material3',
  'android-flutter-routing',
  'android-rn-obytes',
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
      key: 'hanzoApiKey',
      label: 'Hanzo AI API Key',
      type: 'string',
      default: 'hz_live_your_api_key',
      envVar: 'HANZO_API_KEY',
      description: 'API key for Zen AI models, embeddings, and agents via https://api.hanzo.ai/v1',
    },
    {
      key: 'hanzoAiModel',
      label: 'Default Zen AI Model',
      type: 'enum',
      default: 'zen4',
      options: ['zen4', 'zen4-mini', 'zen4-coder', 'enso'],
      envVar: `${prefix}HANZO_AI_MODEL`,
      description: 'Default Hanzo AI model routed for chat, copilot, and structured completions',
    },
    {
      key: 'hanzoAnalyticsId',
      label: 'Hanzo Analytics & Insights ID',
      type: 'string',
      default: `hz_ins_${template.slug}`,
      envVar: `${prefix}HANZO_ANALYTICS_ID`,
      description: 'Project telemetry key for real-time pageviews, conversion funnels & AI token insights',
    },
    {
      key: 'hanzoIamOrg',
      label: 'Hanzo IAM Organization',
      type: 'string',
      default: 'hanzo',
      envVar: `${prefix}HANZO_IAM_ORG`,
      description: 'Organization tenant slug on hanzo.id for zero-config SSO and RBAC',
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

const HOTSPOT_FILES: Record<
  string,
  {
    copyData: string[];
    uiComponents: string[];
    stylingTokens: string[];
    preserveDoNotBreak: string[];
  }
> = {
  instrument: {
    copyData: ['src/landing/copy.tsx', 'src/landing/links.tsx', 'src/lib/defaults.ts'],
    uiComponents: ['src/landing/parts.tsx', 'src/docs/Shell.tsx', 'src/docs/Blocks.tsx'],
    stylingTokens: ['src/lib/tokens.tsx', 'src/lib/fonts.ts', 'index.css'],
    preserveDoNotBreak: ['src/illustration/glsl.ts', 'src/illustration/Illustration.tsx'],
  },
  fernline: {
    copyData: ['lib/site.ts', 'lib/pricing.ts', 'lib/mock/marketing.ts', 'lib/mock/catalog.ts'],
    uiComponents: ['app/(marketing)/page.tsx', 'app/(marketing)/product/[slug]/page.tsx', 'components/'],
    stylingTokens: ['lib/tokens.ts', 'app/globals.css'],
    preserveDoNotBreak: ['AGENTS.md', 'next.config.ts', 'lib/mock/generators.ts'],
  },
  aerva: {
    copyData: ['src/pages/HomePage.tsx', 'src/pages/CarsDetailPage.tsx', 'src/pages/JournalPage.tsx'],
    uiComponents: ['src/sections/home/', 'src/sections/cars/', 'src/components/layout/'],
    stylingTokens: ['src/styles/tokens.css', 'design/tokens.dtcg.json'],
    preserveDoNotBreak: ['src/lib/useRevealMotion.ts', 'docs/slicing-rules.md'],
  },
  tensile: {
    copyData: ['src/data/demo.json', 'src/pages/llms.txt.ts', 'src/lib/seo.ts'],
    uiComponents: ['src/pages/index.astro', 'src/pages/work/', 'src/pages/services/'],
    stylingTokens: ['src/styles/', 'astro.config.mjs'],
    preserveDoNotBreak: ['src/pages/llms.txt.ts', 'src/lib/types.ts'],
  },
  nova: {
    copyData: ['src/lib/plans.ts', 'src/lib/models.ts', 'src/lib/stories.ts', 'src/lib/people.ts'],
    uiComponents: ['src/site/', 'src/lib/docs.ts', 'src/lib/billing.ts'],
    stylingTokens: ['src/lib/theme.ts', 'src/lib/chipStyles.ts', 'index.css'],
    preserveDoNotBreak: ['src/lib/heroShader.ts', 'src/lib/glassShader.ts', 'src/lib/lakeShader.ts'],
  },
  'minimal-ui': {
    copyData: ['src/shop/content.ts', 'src/shop/data.ts', 'src/lib/defaults.ts'],
    uiComponents: ['src/shop/Shop.tsx', 'src/shop/parts.tsx', 'src/docs/Shell.tsx'],
    stylingTokens: ['src/shop/theme.ts', 'index.css'],
    preserveDoNotBreak: ['src/shop/state.tsx', 'src/docs/context.ts'],
  },
  'component-states': {
    copyData: ['src/lib/data.ts', 'src/lib/defaults.ts'],
    uiComponents: ['src/variants/states.tsx', 'src/components/Controls.tsx', 'src/docs/Shell.tsx'],
    stylingTokens: ['src/lib/tokens.tsx', 'src/lib/color.ts', 'index.css'],
    preserveDoNotBreak: ['src/lib/transfer.ts', 'src/docs/context.ts'],
  },
  lighthouse: {
    copyData: ['src/main.tsx', 'forge.meta.json'],
    uiComponents: ['src/', 'ui/'],
    stylingTokens: ['index.css', 'fonts/'],
    preserveDoNotBreak: ['ui/icons/', 'vite.config.ts'],
  },
  'warp-tunnel': {
    copyData: ['src/variants/main.tsx', 'src/media.ts'],
    uiComponents: ['src/FunnelSceneV3.tsx', 'src/MiniLoader.tsx'],
    stylingTokens: ['index.css'],
    preserveDoNotBreak: ['src/FunnelCanvasV3.tsx', 'src/vendor/three-webgpu.ts', 'src/warp-audio.ts'],
  },
  'dotted-globe': {
    copyData: ['src/cities/data.ts', 'src/variants/main-2.tsx'],
    uiComponents: ['src/city-layer.tsx', 'src/particle-globe.tsx'],
    stylingTokens: ['src/city-tooltip.css', 'index.css'],
    preserveDoNotBreak: ['src/globe-geometry.ts', 'src/globe-effects.tsx', 'src/coastlines.json'],
  },
  'tracking-3d': {
    copyData: ['src/variants/tracking-overlay.tsx', 'src/main.tsx'],
    uiComponents: ['src/lib/bl.tsx', 'src/variants/tracking-overlay.tsx'],
    stylingTokens: ['src/lib/fonts.ts', 'index.css'],
    preserveDoNotBreak: ['src/lib/motion.ts', 'assets/fonts/'],
  },
  'line-illustrations': {
    copyData: ['src/variants/tracks.tsx', 'src/variants/funnel.tsx', 'src/variants/playground.tsx'],
    uiComponents: ['src/hairline/Illustration.tsx', 'src/figures/'],
    stylingTokens: ['index.css'],
    preserveDoNotBreak: ['src/hairline/kernel.js', 'src/hairline/board.js', 'src/hairline/depth.js'],
  },
  holo: {
    copyData: ['src/HudOverlay.tsx', 'src/variants/main.tsx'],
    uiComponents: ['src/HoloExperience.tsx', 'src/holo/layers.tsx'],
    stylingTokens: ['index.css'],
    preserveDoNotBreak: ['src/holo/stage.ts', 'src/holo/camera.ts', 'src/vendor/'],
  },
  'warp-shader': {
    copyData: ['src/variants/main.tsx', 'src/main.tsx'],
    uiComponents: ['src/variants/main.tsx'],
    stylingTokens: ['index.css'],
    preserveDoNotBreak: ['src/lib/shader.ts', 'src/lib/stage.ts'],
  },
  'animated-rings': {
    copyData: ['src/variants/main.tsx', 'src/main.tsx'],
    uiComponents: ['src/variants/main.tsx'],
    stylingTokens: ['index.css'],
    preserveDoNotBreak: ['vite.config.ts'],
  },
  bestiary: {
    copyData: ['product.json', 'src/species.js', 'demo/index.html'],
    uiComponents: ['react/Bestiary.tsx', 'specimens/'],
    stylingTokens: ['_engine/plate.css', 'dist/bestiary.css'],
    preserveDoNotBreak: ['_engine/engine.js', '_engine/build.mjs', 'dist/bestiary.esm.js'],
  },
  emptykit: {
    copyData: ['copy/', 'index.html'],
    uiComponents: ['web/react/EmptyState.jsx', 'web/looks.js'],
    stylingTokens: ['index.html'],
    preserveDoNotBreak: ['web/glb/', 'svg/'],
  },
};

function resolveHotspots(template: Template) {
  if (HOTSPOT_FILES[template.slug]) return HOTSPOT_FILES[template.slug];
  const f = template.framework.toLowerCase();
  if (f.includes('@hanzo/gui') || f.includes('@hanzo/base')) {
    return {
      copyData: ['schema.sql', 'src/views/', 'src/app.tsx'],
      uiComponents: ['src/views/', 'src/ui.tsx', 'src/icons.tsx'],
      stylingTokens: ['src/theme.ts', 'src/gui.config.ts'],
      preserveDoNotBreak: ['src/providers.tsx', 'src/lib/base.ts', 'src/iam.config.ts', 'vite.config.ts'],
    };
  }
  if (f.includes('tauri') || f.includes('electron')) {
    return {
      copyData: ['src/App.tsx', 'index.html'],
      uiComponents: ['src/App.tsx', 'src/'],
      stylingTokens: ['src/styles.css', 'index.html'],
      preserveDoNotBreak: ['src-tauri/src/lib.rs', 'src-tauri/tauri.conf.json', 'vite.config.ts'],
    };
  }
  if (f.includes('next')) {
    return {
      copyData: ['src/constants/', 'src/mocks/', 'app/page.tsx'],
      uiComponents: ['src/components/', 'components/', 'app/'],
      stylingTokens: ['app/globals.css', 'tailwind.config.ts'],
      preserveDoNotBreak: ['next.config.mjs', 'package.json'],
    };
  }
  return {
    copyData: ['src/data/', 'src/constants/', 'index.html'],
    uiComponents: ['src/components/', 'src/pages/', 'src/App.tsx'],
    stylingTokens: ['src/styles/', 'index.css'],
    preserveDoNotBreak: ['vite.config.ts', 'package.json'],
  };
}

export function getBlueprint(template: Template): TemplateBlueprint {
  const isModernSeed = MODERN_SEED_SLUGS.has(template.slug);
  const spec = SEED_SPECS[template.slug];
  const fallback = deriveCategoryBlocks(template);
  const repo = `https://github.com/hanzo-apps/${template.slug}`;
  const params = [...baseParams(template), ...(spec?.extraParams ?? [])];
  const c = template.category.toLowerCase();
  const f = template.framework.toLowerCase();
  const cloudServices = [
    'Zen AI Gateway (api.hanzo.ai)',
    'Hanzo Analytics & Insights (analytics.hanzo.ai)',
    'Hanzo IAM Auth (hanzo.id)',
    ...(f.includes('@hanzo/base') || f.includes('tauri') || f.includes('electron') ? ['Hanzo Base SQLite + Realtime (api.hanzo.ai)'] : []),
    ...(c.includes('commerce') || c.includes('e-commerce') ? ['Hanzo Commerce & Billing'] : []),
    ...(c.includes('ai') || c.includes('dashboard') ? ['Hanzo Vector & KV Cloud'] : []),
    'Hanzo Global Edge CDN',
  ];

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
    hanzoEditUrl: `https://hanzo.ai/chat?template=${encodeURIComponent(template.slug)}`,
    previewUrl: `/previews/${template.name}/index.html`,
    llmMdUrl: `/llms/${template.slug}/LLM.md`,
    cloudServices,
    hotspots: resolveHotspots(template),
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
  hanzoSdkCode: string;
  llmMd: string;
  llmMdUrl: string;
  cliCommand: string;
  platformCliCommand: string;
  githubBadgeMarkdown: string;
  studioBuildUrl: string;
  platformDeployUrl: string;
  hanzoEditUrl: string;
  previewUrl: string;
} {
  const blueprint = getBlueprint(template);
  const resolvedParams: Record<string, string> = {};
  const envLines: string[] = [
    `# Generated by Hanzo Template Assembly — seed: ${template.slug}`,
    `HANZO_TEMPLATE_SEED="${template.slug}"`,
    `HANZO_API_BASE_URL="https://api.hanzo.ai/v1"`,
    `HANZO_ANALYTICS_ENDPOINT="https://analytics.hanzo.ai/v1/track"`,
    `HANZO_INSIGHTS_ENABLED="true"`,
    `HANZO_IAM_ISSUER="https://hanzo.id"`,
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

  const aiModel = resolvedParams.hanzoAiModel || 'zen4';
  const analyticsId = resolvedParams.hanzoAnalyticsId || `hz_ins_${template.slug}`;
  const iamOrg = resolvedParams.hanzoIamOrg || 'hanzo';

  const f = template.framework.toLowerCase();
  const outDir = f.includes('next') ? 'out' : f.includes('vite') || f.includes('astro') || blueprint.generation === 'modern' ? 'dist' : f.includes('react') || f.includes('gulp') ? 'build' : '.';

  const hanzoYaml = [
    `# Automated Hanzo Cloud, AI & Insights Configuration (${projectSlug})`,
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
    `  ai:`,
    `    gateway: https://api.hanzo.ai/v1`,
    `    defaultModel: ${aiModel}`,
    `    secretRef: HANZO_API_KEY`,
    `  insights:`,
    `    enabled: true`,
    `    analyticsId: ${analyticsId}`,
    `    endpoint: https://analytics.hanzo.ai/v1/track`,
    `    captureAiUsage: true`,
    `    captureWebVitals: true`,
    `  iam:`,
    `    issuer: https://hanzo.id`,
    `    org: ${iamOrg}`,
  ].join('\n');

  const hanzoSdkCode = [
    `// src/lib/hanzo.ts — Pre-wired Hanzo Cloud Stack (Zen AI + Analytics & Insights + IAM)`,
    `// Provision or rotate API keys at: https://console.hanzo.ai/keys`,
    ``,
    `export const HANZO_CONFIG = {`,
    `  project: ${JSON.stringify(projectSlug)},`,
    `  template: ${JSON.stringify(template.slug)},`,
    `  aiBaseUrl: 'https://api.hanzo.ai/v1',`,
    `  defaultModel: ${JSON.stringify(aiModel)},`,
    `  analyticsEndpoint: 'https://analytics.hanzo.ai/v1/track',`,
    `  analyticsId: ${JSON.stringify(analyticsId)},`,
    `  iamIssuer: 'https://hanzo.id',`,
    `  iamOrg: ${JSON.stringify(iamOrg)},`,
    `} as const;`,
    ``,
    `export interface HanzoChatOptions {`,
    `  model?: string;`,
    `  system?: string;`,
    `  apiKey?: string;`,
    `}`,
    ``,
    `/** Track product events, funnel conversions, and AI usage in Hanzo Insights */`,
    `export async function trackInsight(event: string, properties: Record<string, unknown> = {}): Promise<void> {`,
    `  try {`,
    `    await fetch(HANZO_CONFIG.analyticsEndpoint, {`,
    `      method: 'POST',`,
    `      headers: { 'Content-Type': 'application/json' },`,
    `      body: JSON.stringify({`,
    `        analyticsId: HANZO_CONFIG.analyticsId,`,
    `        project: HANZO_CONFIG.project,`,
    `        event,`,
    `        properties,`,
    `        timestamp: new Date().toISOString(),`,
    `      }),`,
    `      keepalive: true,`,
    `    });`,
    `  } catch {`,
    `    // Non-blocking telemetry`,
    `  }`,
    `}`,
    ``,
    `/** Call Zen AI models via Hanzo Gateway with automatic latency & token insights */`,
    `export async function askHanzoAi(prompt: string, opts: HanzoChatOptions = {}): Promise<string> {`,
    `  const started = Date.now();`,
    `  const model = opts.model || HANZO_CONFIG.defaultModel;`,
    `  const apiKey = opts.apiKey || (typeof process !== 'undefined' ? process.env.HANZO_API_KEY : undefined) || '';`,
    `  const res = await fetch(\`\${HANZO_CONFIG.aiBaseUrl}/chat/completions\`, {`,
    `    method: 'POST',`,
    `    headers: {`,
    `      'Content-Type': 'application/json',`,
    `      ...(apiKey ? { Authorization: \`Bearer \${apiKey}\` } : {}),`,
    `    },`,
    `    body: JSON.stringify({`,
    `      model,`,
    `      messages: [`,
    `        ...(opts.system ? [{ role: 'system', content: opts.system }] : []),`,
    `        { role: 'user', content: prompt },`,
    `      ],`,
    `    }),`,
    `  });`,
    `  const data = await res.json();`,
    `  const content = data?.choices?.[0]?.message?.content ?? '';`,
    `  void trackInsight('ai.completion', {`,
    `    model,`,
    `    latencyMs: Date.now() - started,`,
    `    tokens: data?.usage?.total_tokens ?? 0,`,
    `    status: res.status,`,
    `  });`,
    `  return content;`,
    `}`,
  ].join('\n');

  const platformCliCommand = `npx @hanzo/cli deploy --template ${template.slug} --name ${projectSlug} --platform --insights`;

  const llmMd = [
    `# LLM.md — Hanzo Agent Build Playbook for ${resolvedParams.brandName || template.displayName} (\`${template.slug}\`)`,
    ``,
    `> **Agent Directive:** Read this file before modifying any code. This repository is a Hanzo Cloud-optimized seed template (\`${blueprint.repo}\`). Use the Hotspot File Map, Parameterization Contract, and \`src/lib/hanzo.ts\` SDK below to customize and ship the user's application in minimal turns with zero broken builds.`,
    ``,
    `## 1. Template Identity & Stack`,
    `- **Template Seed:** \`${template.slug}\` (${template.displayName})`,
    `- **Target Brand / Project:** \`${resolvedParams.brandName || template.displayName}\` (\`${projectSlug}.hanzo.app\`)`,
    `- **Category & Use Case:** ${template.category} — ${template.useCase}`,
    `- **Framework:** ${template.framework}`,
    `- **Build Output Directory:** \`${outDir}\``,
    `- **Live Reference Preview:** https://gallery.hanzo.ai${blueprint.previewUrl}`,
    `- **Edit in Hanzo Studio:** https://hanzo.ai/chat?template=${template.slug}`,
    ``,
    `## 2. Exact Hotspot File Map ("Where to Edit What")`,
    `- **Brand Copy, Catalog & Domain Data (EDIT FIRST):**`,
    ...blueprint.hotspots.copyData.map((fPath) => `  - \`${fPath}\``),
    `- **Primary UI Sections & Interactive Views:**`,
    ...blueprint.hotspots.uiComponents.map((fPath) => `  - \`${fPath}\``),
    `- **Design Tokens, Typography & Theme Variables:**`,
    ...blueprint.hotspots.stylingTokens.map((fPath) => `  - \`${fPath}\``),
    `- **Engine / Shaders / Core Runtime (DO NOT BREAK):**`,
    ...blueprint.hotspots.preserveDoNotBreak.map((fPath) => `  - \`${fPath}\``),
    ``,
    `## 3. Active Composable Blocks`,
    ...blocks.map((b) => `- \`${b}\``),
    ``,
    `## 4. Parameterization Contract (\`.env.local\` & \`hanzo.template.json\`)`,
    `| Parameter | Env Variable | Default / Value | Purpose |`,
    `| :--- | :--- | :--- | :--- |`,
    ...blueprint.params.map(
      (p) =>
        `| \`${p.key}\` | \`${p.envVar}\` | \`${resolvedParams[p.key] ?? p.default}\` | ${p.description} |`,
    ),
    ``,
    `## 5. Pre-Wired Hanzo Cloud Stack (\`src/lib/hanzo.ts\`)`,
    `Every Hanzo template integrates out of the box with the Hanzo Cloud stack via \`src/lib/hanzo.ts\`:`,
    `1. **Zen AI Gateway (\`https://api.hanzo.ai/v1\`)**:`,
    `   - Call \`askHanzoAi(prompt, { model: '${aiModel}', system })\` for chat, copilot, command palette, or structured generation.`,
    `   - Uses \`HANZO_API_KEY\` (provision at https://console.hanzo.ai/keys).`,
    `2. **Hanzo Analytics & Insights (\`https://analytics.hanzo.ai/v1/track\`)**:`,
    `   - Call \`trackInsight(event, properties)\` on key user actions (CTA clicks, checkout, prompt submissions, onboarding steps).`,
    `   - Uses \`${analyticsId}\` and automatically logs AI latency + token usage.`,
    `3. **Hanzo IAM Single Sign-On (\`https://hanzo.id\`)**:`,
    `   - Organization tenant: \`${iamOrg}\`.`,
    ``,
    `## 6. Agent Execution Playbook (4 Deterministic Steps)`,
    `1. **Configure Parameters:** Update \`hanzo.template.json\` and \`.env.local\` with the user's brand name, tagline, accent tokens, \`HANZO_API_KEY\`, and \`HANZO_ANALYTICS_ID\`.`,
    `2. **Update Hotspot Data & Copy:** Edit the files listed under **Brand Copy, Catalog & Domain Data** first. Prefer structured data edits over rewriting layout trees.`,
    `3. **Wire Cloud AI & Insights:** Import \`askHanzoAi\` and \`trackInsight\` from \`src/lib/hanzo.ts\` into interactive components (command bars, forms, AI assistants, primary CTAs).`,
    `4. **Verify & Deploy:** Run \`${blueprint.commands.build}\` to verify zero TypeScript or bundler errors, then deploy with \`${platformCliCommand}\`.`,
  ].join('\n');

  const manifest = {
    seed: template.slug,
    name: resolvedParams.brandName || template.displayName,
    slug: projectSlug,
    framework: template.framework,
    category: template.category,
    repo: blueprint.repo,
    llmMd: `https://gallery.hanzo.ai/llms/${template.slug}/LLM.md`,
    hotspots: blueprint.hotspots,
    blocks,
    params: resolvedParams,
    commands: blueprint.commands,
    cloud: {
      aiGateway: 'https://api.hanzo.ai/v1',
      defaultModel: aiModel,
      analyticsId,
      insightsUrl: `https://analytics.hanzo.ai/projects/${projectSlug}`,
      apiKeysUrl: 'https://console.hanzo.ai/keys',
      iamOrg,
    },
    platform: {
      outDir,
      deployUrl: `https://platform.hanzo.ai/new?repo=${encodeURIComponent(blueprint.repo)}&template=${template.slug}&name=${encodeURIComponent(projectSlug)}`,
      studioUrl: `https://hanzo.app/new?template=${encodeURIComponent(blueprint.repo)}&seed=${template.slug}`,
      hanzoEditUrl: `https://hanzo.ai/chat?template=${encodeURIComponent(template.slug)}&name=${encodeURIComponent(projectSlug)}`,
    },
  };

  const cliCommand = [
    `# 1-Click Automated Deploy to Hanzo Platform (with Zen AI + Insights)`,
    platformCliCommand,
    ``,
    `# Or clone, wire Hanzo Cloud SDK + LLM.md & deploy from local workspace`,
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
    model: aiModel,
    analytics: analyticsId,
    blocks: blocks.join(','),
  });

  const editQuery = new URLSearchParams({
    template: template.slug,
    name: resolvedParams.brandName || template.displayName,
    model: aiModel,
  });

  const deployHref = `https://platform.hanzo.ai/new?repo=${encodeURIComponent(blueprint.repo)}&template=${template.slug}`;
  const editHref = `https://hanzo.ai/chat?template=${template.slug}`;
  const liveHref = `https://gallery.hanzo.ai/templates/${template.slug}`;
  const llmHref = `https://gallery.hanzo.ai/llms/${template.slug}/LLM.md`;

  const githubBadgeMarkdown = [
    `[![Deploy to Hanzo](https://gallery.hanzo.ai/deploy.svg)](${deployHref})`,
    `[![Edit in Hanzo.ai](https://gallery.hanzo.ai/badges/edit-in-hanzo.svg)](${editHref})`,
    `[![Live Preview](https://gallery.hanzo.ai/badges/live-preview.svg)](${liveHref})`,
    `[![LLM.md Playbook](https://gallery.hanzo.ai/badges/llm-md.svg)](${llmHref})`,
  ].join(' ');

  return {
    envFile: envLines.join('\n'),
    manifestJson: JSON.stringify(manifest, null, 2),
    hanzoYaml,
    hanzoSdkCode,
    llmMd,
    llmMdUrl: blueprint.llmMdUrl,
    cliCommand,
    platformCliCommand,
    githubBadgeMarkdown,
    studioBuildUrl: `https://hanzo.app/new?${query.toString()}`,
    platformDeployUrl: `https://platform.hanzo.ai/new?${platformQuery.toString()}`,
    hanzoEditUrl: `https://hanzo.ai/chat?${editQuery.toString()}`,
    previewUrl: blueprint.previewUrl,
  };
}
