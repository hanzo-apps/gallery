# LLM.md — Hanzo Agent Build Playbook for Aerva AI (`aerva`)

> **Agent Directive:** Read this file before modifying any code. This repository is a Hanzo Cloud-optimized seed template (`https://github.com/hanzo-apps/template-aerva`). Use the Hotspot File Map, Parameterization Contract, and `src/lib/hanzo.ts` SDK below to customize and ship the user's application in minimal turns with zero broken builds.

## 1. Template Identity & Stack
- **Template Seed:** `aerva` (Aerva AI)
- **Target Brand / Project:** `Aerva AI` (`aerva-ai.hanzo.app`)
- **Category & Use Case:** AI/SaaS — AI Copilot & Product Launch Platform · Zen AI + Funnel Insights
- **Framework:** React 19 + Vite + TS
- **Build Output Directory:** `dist`
- **Live Reference Preview:** https://gallery.hanzo.ai/previews/aerva/index.html
- **Edit in Hanzo Studio:** https://hanzo.ai/chat?template=aerva

## 2. Exact Hotspot File Map ("Where to Edit What")
- **Brand Copy, Catalog & Domain Data (EDIT FIRST):**
  - `src/pages/HomePage.tsx`
  - `src/pages/CarsDetailPage.tsx`
  - `src/pages/JournalPage.tsx`
- **Primary UI Sections & Interactive Views:**
  - `src/sections/home/`
  - `src/sections/cars/`
  - `src/components/layout/`
- **Design Tokens, Typography & Theme Variables:**
  - `src/styles/tokens.css`
  - `design/tokens.dtcg.json`
- **Engine / Shaders / Core Runtime (DO NOT BREAK):**
  - `src/lib/useRevealMotion.ts`
  - `docs/slicing-rules.md`

## 3. Active Composable Blocks
- `hero-atmospheric`
- `telemetry-spec-table`
- `editorial-scroll-chapters`
- `field-data-cards`
- `press-kit-footer`

## 4. Parameterization Contract (`.env.local` & `hanzo.template.json`)
| Parameter | Env Variable | Default / Value | Purpose |
| :--- | :--- | :--- | :--- |
| `brandName` | `VITE_SITE_NAME` | `Aerva AI` | Primary brand or product title rendered in navigation and metadata |
| `tagline` | `VITE_SITE_TAGLINE` | `AI Copilot & Product Launch Platform · Zen AI + Funnel Insights` | Headline or value proposition displayed in the hero section |
| `hanzoApiKey` | `HANZO_API_KEY` | `hz_live_your_api_key` | API key for Zen AI models, embeddings, and agents via https://api.hanzo.ai/v1 |
| `hanzoAiModel` | `VITE_HANZO_AI_MODEL` | `zen4` | Default Hanzo AI model routed for chat, copilot, and structured completions |
| `hanzoAnalyticsId` | `VITE_HANZO_ANALYTICS_ID` | `hz_ins_aerva` | Project telemetry key for real-time pageviews, conversion funnels & AI token insights |
| `hanzoIamOrg` | `VITE_HANZO_IAM_ORG` | `hanzo` | Organization tenant slug on hanzo.id for zero-config SSO and RBAC |
| `accentColor` | `VITE_ACCENT_COLOR` | `#ffffff` | Primary interactive accent token (hex or CSS color) |
| `themeMode` | `VITE_THEME_MODE` | `dark` | Initial color scheme applied on first visit |
| `editionLabel` | `VITE_EDITION_LABEL` | `Field Release 04` | Issue or hardware revision badge in the top rail |

## 5. Pre-Wired Hanzo Cloud Stack (`src/lib/hanzo.ts`)
Every Hanzo template integrates out of the box with the Hanzo Cloud stack via `src/lib/hanzo.ts`:
1. **Zen AI Gateway (`https://api.hanzo.ai/v1`)**:
   - Call `askHanzoAi(prompt, { model: 'zen4', system })` for chat, copilot, command palette, or structured generation.
   - Uses `HANZO_API_KEY` (provision at https://console.hanzo.ai/keys).
2. **Hanzo Analytics & Insights (`https://analytics.hanzo.ai/v1/track`)**:
   - Call `trackInsight(event, properties)` on key user actions (CTA clicks, checkout, prompt submissions, onboarding steps).
   - Uses `hz_ins_aerva` and automatically logs AI latency + token usage.
3. **Hanzo IAM Single Sign-On (`https://hanzo.id`)**:
   - Organization tenant: `hanzo`.

## 6. Agent Execution Playbook (4 Deterministic Steps)
1. **Configure Parameters:** Update `hanzo.template.json` and `.env.local` with the user's brand name, tagline, accent tokens, `HANZO_API_KEY`, and `HANZO_ANALYTICS_ID`.
2. **Update Hotspot Data & Copy:** Edit the files listed under **Brand Copy, Catalog & Domain Data** first. Prefer structured data edits over rewriting layout trees.
3. **Wire Cloud AI & Insights:** Import `askHanzoAi` and `trackInsight` from `src/lib/hanzo.ts` into interactive components (command bars, forms, AI assistants, primary CTAs).
4. **Verify & Deploy:** Run `pnpm build` to verify zero TypeScript or bundler errors, then deploy with `npx @hanzo/cli deploy --template aerva --name aerva-ai --platform --insights`.
