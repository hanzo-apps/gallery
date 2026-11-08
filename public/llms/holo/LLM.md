# LLM.md — Hanzo Agent Build Playbook for Holo Deck (`holo`)

> **Agent Directive:** Read this file before modifying any code. This repository is a Hanzo Cloud-optimized seed template (`https://github.com/hanzo-apps/holo`). Use the Hotspot File Map, Parameterization Contract, and `src/lib/hanzo.ts` SDK below to customize and ship the user's application in minimal turns with zero broken builds.

## 1. Template Identity & Stack
- **Template Seed:** `holo` (Holo Deck)
- **Target Brand / Project:** `Holo Deck` (`holo-deck.hanzo.app`)
- **Category & Use Case:** 3D & Shaders — 3D Hardware Configurator & AI Product Showcase · Three.js + Cloud
- **Framework:** Three.js + React 19 + TS
- **Build Output Directory:** `dist`
- **Live Reference Preview:** https://gallery.hanzo.ai/previews/holo/index.html
- **Edit in Hanzo Studio:** https://hanzo.ai/chat?template=holo

## 2. Exact Hotspot File Map ("Where to Edit What")
- **Brand Copy, Catalog & Domain Data (EDIT FIRST):**
  - `src/HudOverlay.tsx`
  - `src/variants/main.tsx`
- **Primary UI Sections & Interactive Views:**
  - `src/HoloExperience.tsx`
  - `src/holo/layers.tsx`
- **Design Tokens, Typography & Theme Variables:**
  - `index.css`
- **Engine / Shaders / Core Runtime (DO NOT BREAK):**
  - `src/holo/stage.ts`
  - `src/holo/camera.ts`
  - `src/vendor/`

## 3. Active Composable Blocks
- `iridescent-foil-card`
- `gyro-tilt-stage`
- `chromatic-dispersion-shader`
- `tier-selector`
- `mint-cta`

## 4. Parameterization Contract (`.env.local` & `hanzo.template.json`)
| Parameter | Env Variable | Default / Value | Purpose |
| :--- | :--- | :--- | :--- |
| `brandName` | `VITE_SITE_NAME` | `Holo Deck` | Primary brand or product title rendered in navigation and metadata |
| `tagline` | `VITE_SITE_TAGLINE` | `3D Hardware Configurator & AI Product Showcase · Three.js + Cloud` | Headline or value proposition displayed in the hero section |
| `hanzoApiKey` | `HANZO_API_KEY` | `hz_live_your_api_key` | API key for Zen AI models, embeddings, and agents via https://api.hanzo.ai/v1 |
| `hanzoAiModel` | `VITE_HANZO_AI_MODEL` | `zen4` | Default Hanzo AI model routed for chat, copilot, and structured completions |
| `hanzoAnalyticsId` | `VITE_HANZO_ANALYTICS_ID` | `hz_ins_holo` | Project telemetry key for real-time pageviews, conversion funnels & AI token insights |
| `hanzoIamOrg` | `VITE_HANZO_IAM_ORG` | `hanzo` | Organization tenant slug on hanzo.id for zero-config SSO and RBAC |
| `accentColor` | `VITE_ACCENT_COLOR` | `#ffffff` | Primary interactive accent token (hex or CSS color) |
| `themeMode` | `VITE_THEME_MODE` | `dark` | Initial color scheme applied on first visit |
| `foilIntensity` | `VITE_FOIL_INTENSITY` | `0.85` | Holographic rainbow diffraction strength on tilt |

## 5. Pre-Wired Hanzo Cloud Stack (`src/lib/hanzo.ts`)
Every Hanzo template integrates out of the box with the Hanzo Cloud stack via `src/lib/hanzo.ts`:
1. **Zen AI Gateway (`https://api.hanzo.ai/v1`)**:
   - Call `askHanzoAi(prompt, { model: 'zen4', system })` for chat, copilot, command palette, or structured generation.
   - Uses `HANZO_API_KEY` (provision at https://console.hanzo.ai/keys).
2. **Hanzo Analytics & Insights (`https://analytics.hanzo.ai/v1/track`)**:
   - Call `trackInsight(event, properties)` on key user actions (CTA clicks, checkout, prompt submissions, onboarding steps).
   - Uses `hz_ins_holo` and automatically logs AI latency + token usage.
3. **Hanzo IAM Single Sign-On (`https://hanzo.id`)**:
   - Organization tenant: `hanzo`.

## 6. Agent Execution Playbook (4 Deterministic Steps)
1. **Configure Parameters:** Update `hanzo.template.json` and `.env.local` with the user's brand name, tagline, accent tokens, `HANZO_API_KEY`, and `HANZO_ANALYTICS_ID`.
2. **Update Hotspot Data & Copy:** Edit the files listed under **Brand Copy, Catalog & Domain Data** first. Prefer structured data edits over rewriting layout trees.
3. **Wire Cloud AI & Insights:** Import `askHanzoAi` and `trackInsight` from `src/lib/hanzo.ts` into interactive components (command bars, forms, AI assistants, primary CTAs).
4. **Verify & Deploy:** Run `npm run build` to verify zero TypeScript or bundler errors, then deploy with `npx @hanzo/cli deploy --template holo --name holo-deck --platform --insights`.
