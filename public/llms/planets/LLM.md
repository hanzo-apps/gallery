# LLM.md — Hanzo Agent Build Playbook for Orbital Core (`animated-rings`)

> **Agent Directive:** Read this file before modifying any code. This repository is a Hanzo Cloud-optimized seed template (`https://github.com/hanzo-apps/template-animated-rings`). Use the Hotspot File Map, Parameterization Contract, and `src/lib/hanzo.ts` SDK below to customize and ship the user's application in minimal turns with zero broken builds.

## 1. Template Identity & Stack
- **Template Seed:** `animated-rings` (Orbital Core)
- **Target Brand / Project:** `Orbital Core` (`orbital-core.hanzo.app`)
- **Category & Use Case:** 3D & Shaders — 3D AI Voice & Enso Assistant State Visualizer · Three.js + Realtime
- **Framework:** Three.js + React 19 + TS
- **Build Output Directory:** `dist`
- **Live Reference Preview:** https://gallery.hanzo.ai/previews/animated-rings/index.html
- **Edit in Hanzo Studio:** https://hanzo.ai/chat?template=animated-rings

## 2. Exact Hotspot File Map ("Where to Edit What")
- **Brand Copy, Catalog & Domain Data (EDIT FIRST):**
  - `src/variants/main.tsx`
  - `src/main.tsx`
- **Primary UI Sections & Interactive Views:**
  - `src/variants/main.tsx`
- **Design Tokens, Typography & Theme Variables:**
  - `index.css`
- **Engine / Shaders / Core Runtime (DO NOT BREAK):**
  - `vite.config.ts`

## 3. Active Composable Blocks
- `concentric-webgl-rings`
- `orbital-bloom-stage`
- `metric-counter-hud`
- `voice-pulse-visualizer`

## 4. Parameterization Contract (`.env.local` & `hanzo.template.json`)
| Parameter | Env Variable | Default / Value | Purpose |
| :--- | :--- | :--- | :--- |
| `brandName` | `VITE_SITE_NAME` | `Orbital Core` | Primary brand or product title rendered in navigation and metadata |
| `tagline` | `VITE_SITE_TAGLINE` | `3D AI Voice & Enso Assistant State Visualizer · Three.js + Realtime` | Headline or value proposition displayed in the hero section |
| `hanzoApiKey` | `HANZO_API_KEY` | `hz_live_your_api_key` | API key for Zen AI models, embeddings, and agents via https://api.hanzo.ai/v1 |
| `hanzoAiModel` | `VITE_HANZO_AI_MODEL` | `zen4` | Default Hanzo AI model routed for chat, copilot, and structured completions |
| `hanzoAnalyticsId` | `VITE_HANZO_ANALYTICS_ID` | `hz_ins_animated-rings` | Project telemetry key for real-time pageviews, conversion funnels & AI token insights |
| `hanzoIamOrg` | `VITE_HANZO_IAM_ORG` | `hanzo` | Organization tenant slug on hanzo.id for zero-config SSO and RBAC |
| `accentColor` | `VITE_ACCENT_COLOR` | `#ffffff` | Primary interactive accent token (hex or CSS color) |
| `themeMode` | `VITE_THEME_MODE` | `dark` | Initial color scheme applied on first visit |
| `ringCount` | `VITE_RING_COUNT` | `7` | Number of concentric WebGL rings in the hero stage |

## 5. Pre-Wired Hanzo Cloud Stack (`src/lib/hanzo.ts`)
Every Hanzo template integrates out of the box with the Hanzo Cloud stack via `src/lib/hanzo.ts`:
1. **Zen AI Gateway (`https://api.hanzo.ai/v1`)**:
   - Call `askHanzoAi(prompt, { model: 'zen4', system })` for chat, copilot, command palette, or structured generation.
   - Uses `HANZO_API_KEY` (provision at https://console.hanzo.ai/keys).
2. **Hanzo Analytics & Insights (`https://analytics.hanzo.ai/v1/track`)**:
   - Call `trackInsight(event, properties)` on key user actions (CTA clicks, checkout, prompt submissions, onboarding steps).
   - Uses `hz_ins_animated-rings` and automatically logs AI latency + token usage.
3. **Hanzo IAM Single Sign-On (`https://hanzo.id`)**:
   - Organization tenant: `hanzo`.

## 6. Agent Execution Playbook (4 Deterministic Steps)
1. **Configure Parameters:** Update `hanzo.template.json` and `.env.local` with the user's brand name, tagline, accent tokens, `HANZO_API_KEY`, and `HANZO_ANALYTICS_ID`.
2. **Update Hotspot Data & Copy:** Edit the files listed under **Brand Copy, Catalog & Domain Data** first. Prefer structured data edits over rewriting layout trees.
3. **Wire Cloud AI & Insights:** Import `askHanzoAi` and `trackInsight` from `src/lib/hanzo.ts` into interactive components (command bars, forms, AI assistants, primary CTAs).
4. **Verify & Deploy:** Run `npm run build` to verify zero TypeScript or bundler errors, then deploy with `npx @hanzo/cli deploy --template animated-rings --name orbital-core --platform --insights`.
