# LLM.md — Hanzo Agent Build Playbook for Fernline Ops (`fernline`)

> **Agent Directive:** Read this file before modifying any code. This repository is a Hanzo Cloud-optimized seed template (`https://github.com/hanzo-apps/template-fernline`). Use the Hotspot File Map, Parameterization Contract, and `src/lib/hanzo.ts` SDK below to customize and ship the user's application in minimal turns with zero broken builds.

## 1. Template Identity & Stack
- **Template Seed:** `fernline` (Fernline Ops)
- **Target Brand / Project:** `Fernline Ops` (`fernline-ops.hanzo.app`)
- **Category & Use Case:** AI/SaaS — AI Agent Ops & Observability Console · Hanzo Cloud + Insights
- **Framework:** Next.js 16 + React 19 + TS
- **Build Output Directory:** `out`
- **Live Reference Preview:** https://gallery.hanzo.ai/previews/fernline/index.html
- **Edit in Hanzo Studio:** https://hanzo.ai/chat?template=fernline

## 2. Exact Hotspot File Map ("Where to Edit What")
- **Brand Copy, Catalog & Domain Data (EDIT FIRST):**
  - `lib/site.ts`
  - `lib/pricing.ts`
  - `lib/mock/marketing.ts`
  - `lib/mock/catalog.ts`
- **Primary UI Sections & Interactive Views:**
  - `app/(marketing)/page.tsx`
  - `app/(marketing)/product/[slug]/page.tsx`
  - `components/`
- **Design Tokens, Typography & Theme Variables:**
  - `lib/tokens.ts`
  - `app/globals.css`
- **Engine / Shaders / Core Runtime (DO NOT BREAK):**
  - `AGENTS.md`
  - `next.config.ts`
  - `lib/mock/generators.ts`

## 3. Active Composable Blocks
- `agent-trace-stream`
- `run-timeline`
- `tool-call-inspector`
- `latency-flamegraph`
- `fleet-status-rail`
- `command-bar`

## 4. Parameterization Contract (`.env.local` & `hanzo.template.json`)
| Parameter | Env Variable | Default / Value | Purpose |
| :--- | :--- | :--- | :--- |
| `brandName` | `NEXT_PUBLIC_SITE_NAME` | `Fernline Ops` | Primary brand or product title rendered in navigation and metadata |
| `tagline` | `NEXT_PUBLIC_SITE_TAGLINE` | `AI Agent Ops & Observability Console · Hanzo Cloud + Insights` | Headline or value proposition displayed in the hero section |
| `hanzoApiKey` | `HANZO_API_KEY` | `hz_live_your_api_key` | API key for Zen AI models, embeddings, and agents via https://api.hanzo.ai/v1 |
| `hanzoAiModel` | `NEXT_PUBLIC_HANZO_AI_MODEL` | `zen4` | Default Hanzo AI model routed for chat, copilot, and structured completions |
| `hanzoAnalyticsId` | `NEXT_PUBLIC_HANZO_ANALYTICS_ID` | `hz_ins_fernline` | Project telemetry key for real-time pageviews, conversion funnels & AI token insights |
| `hanzoIamOrg` | `NEXT_PUBLIC_HANZO_IAM_ORG` | `hanzo` | Organization tenant slug on hanzo.id for zero-config SSO and RBAC |
| `accentColor` | `NEXT_PUBLIC_ACCENT_COLOR` | `#ffffff` | Primary interactive accent token (hex or CSS color) |
| `themeMode` | `NEXT_PUBLIC_THEME_MODE` | `dark` | Initial color scheme applied on first visit |
| `telemetryEndpoint` | `VITE_TELEMETRY_URL` | `https://api.hanzo.ai/v1/traces` | Streaming endpoint for live agent runs and tool calls |
| ` refreshIntervalMs` | `VITE_STREAM_INTERVAL_MS` | `1000` | Tick cadence for live trace and token throughput updates |

## 5. Pre-Wired Hanzo Cloud Stack (`src/lib/hanzo.ts`)
Every Hanzo template integrates out of the box with the Hanzo Cloud stack via `src/lib/hanzo.ts`:
1. **Zen AI Gateway (`https://api.hanzo.ai/v1`)**:
   - Call `askHanzoAi(prompt, { model: 'zen4', system })` for chat, copilot, command palette, or structured generation.
   - Uses `HANZO_API_KEY` (provision at https://console.hanzo.ai/keys).
2. **Hanzo Analytics & Insights (`https://analytics.hanzo.ai/v1/track`)**:
   - Call `trackInsight(event, properties)` on key user actions (CTA clicks, checkout, prompt submissions, onboarding steps).
   - Uses `hz_ins_fernline` and automatically logs AI latency + token usage.
3. **Hanzo IAM Single Sign-On (`https://hanzo.id`)**:
   - Organization tenant: `hanzo`.

## 6. Agent Execution Playbook (4 Deterministic Steps)
1. **Configure Parameters:** Update `hanzo.template.json` and `.env.local` with the user's brand name, tagline, accent tokens, `HANZO_API_KEY`, and `HANZO_ANALYTICS_ID`.
2. **Update Hotspot Data & Copy:** Edit the files listed under **Brand Copy, Catalog & Domain Data** first. Prefer structured data edits over rewriting layout trees.
3. **Wire Cloud AI & Insights:** Import `askHanzoAi` and `trackInsight` from `src/lib/hanzo.ts` into interactive components (command bars, forms, AI assistants, primary CTAs).
4. **Verify & Deploy:** Run `pnpm build` to verify zero TypeScript or bundler errors, then deploy with `npx @hanzo/cli deploy --template fernline --name fernline-ops --platform --insights`.
