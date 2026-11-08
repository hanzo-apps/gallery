# LLM.md — Hanzo Agent Build Playbook for Lighthouse World (`lighthouse`)

> **Agent Directive:** Read this file before modifying any code. This repository is a Hanzo Cloud-optimized seed template (`https://github.com/hanzo-apps/template-lighthouse`). Use the Hotspot File Map, Parameterization Contract, and `src/lib/hanzo.ts` SDK below to customize and ship the user's application in minimal turns with zero broken builds.

## 1. Template Identity & Stack
- **Template Seed:** `lighthouse` (Lighthouse World)
- **Target Brand / Project:** `Lighthouse World` (`lighthouse-world.hanzo.app`)
- **Category & Use Case:** App — AI Interactive World & NPC Game Engine · Zen AI + Analytics
- **Framework:** React 19 + Canvas + TS
- **Build Output Directory:** `dist`
- **Live Reference Preview:** https://gallery.hanzo.ai/previews/lighthouse/index.html
- **Edit in Hanzo Studio:** https://hanzo.ai/chat?template=lighthouse

## 2. Exact Hotspot File Map ("Where to Edit What")
- **Brand Copy, Catalog & Domain Data (EDIT FIRST):**
  - `src/main.tsx`
  - `forge.meta.json`
- **Primary UI Sections & Interactive Views:**
  - `src/`
  - `ui/`
- **Design Tokens, Typography & Theme Variables:**
  - `index.css`
  - `fonts/`
- **Engine / Shaders / Core Runtime (DO NOT BREAK):**
  - `ui/icons/`
  - `vite.config.ts`

## 3. Active Composable Blocks
- `zero-js-hero`
- `perf-score-gauge`
- `article-index`
- `rss-subscribe-card`
- `table-of-contents`

## 4. Parameterization Contract (`.env.local` & `hanzo.template.json`)
| Parameter | Env Variable | Default / Value | Purpose |
| :--- | :--- | :--- | :--- |
| `brandName` | `VITE_SITE_NAME` | `Lighthouse World` | Primary brand or product title rendered in navigation and metadata |
| `tagline` | `VITE_SITE_TAGLINE` | `AI Interactive World & NPC Game Engine · Zen AI + Analytics` | Headline or value proposition displayed in the hero section |
| `hanzoApiKey` | `HANZO_API_KEY` | `hz_live_your_api_key` | API key for Zen AI models, embeddings, and agents via https://api.hanzo.ai/v1 |
| `hanzoAiModel` | `VITE_HANZO_AI_MODEL` | `zen4` | Default Hanzo AI model routed for chat, copilot, and structured completions |
| `hanzoAnalyticsId` | `VITE_HANZO_ANALYTICS_ID` | `hz_ins_lighthouse` | Project telemetry key for real-time pageviews, conversion funnels & AI token insights |
| `hanzoIamOrg` | `VITE_HANZO_IAM_ORG` | `hanzo` | Organization tenant slug on hanzo.id for zero-config SSO and RBAC |
| `accentColor` | `VITE_ACCENT_COLOR` | `#ffffff` | Primary interactive accent token (hex or CSS color) |
| `themeMode` | `VITE_THEME_MODE` | `dark` | Initial color scheme applied on first visit |
| `contentCollection` | `PUBLIC_CONTENT_COLLECTION` | `articles` | Default collection rendered on the index route |

## 5. Pre-Wired Hanzo Cloud Stack (`src/lib/hanzo.ts`)
Every Hanzo template integrates out of the box with the Hanzo Cloud stack via `src/lib/hanzo.ts`:
1. **Zen AI Gateway (`https://api.hanzo.ai/v1`)**:
   - Call `askHanzoAi(prompt, { model: 'zen4', system })` for chat, copilot, command palette, or structured generation.
   - Uses `HANZO_API_KEY` (provision at https://console.hanzo.ai/keys).
2. **Hanzo Analytics & Insights (`https://analytics.hanzo.ai/v1/track`)**:
   - Call `trackInsight(event, properties)` on key user actions (CTA clicks, checkout, prompt submissions, onboarding steps).
   - Uses `hz_ins_lighthouse` and automatically logs AI latency + token usage.
3. **Hanzo IAM Single Sign-On (`https://hanzo.id`)**:
   - Organization tenant: `hanzo`.

## 6. Agent Execution Playbook (4 Deterministic Steps)
1. **Configure Parameters:** Update `hanzo.template.json` and `.env.local` with the user's brand name, tagline, accent tokens, `HANZO_API_KEY`, and `HANZO_ANALYTICS_ID`.
2. **Update Hotspot Data & Copy:** Edit the files listed under **Brand Copy, Catalog & Domain Data** first. Prefer structured data edits over rewriting layout trees.
3. **Wire Cloud AI & Insights:** Import `askHanzoAi` and `trackInsight` from `src/lib/hanzo.ts` into interactive components (command bars, forms, AI assistants, primary CTAs).
4. **Verify & Deploy:** Run `npm run build` to verify zero TypeScript or bundler errors, then deploy with `npx @hanzo/cli deploy --template lighthouse --name lighthouse-world --platform --insights`.
