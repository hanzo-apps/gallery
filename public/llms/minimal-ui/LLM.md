# LLM.md — Hanzo Agent Build Playbook for Monolith UI (`minimal-ui`)

> **Agent Directive:** Read this file before modifying any code. This repository is a Hanzo Cloud-optimized seed template (`https://github.com/hanzo-apps/minimal-ui`). Use the Hotspot File Map, Parameterization Contract, and `src/lib/hanzo.ts` SDK below to customize and ship the user's application in minimal turns with zero broken builds.

## 1. Template Identity & Stack
- **Template Seed:** `minimal-ui` (Monolith UI)
- **Target Brand / Project:** `Monolith UI` (`monolith-ui.hanzo.app`)
- **Category & Use Case:** Component Library — AI Design System & Developer Docs Portal · Zen Search + Tokens
- **Framework:** React 19 + Vite + TS
- **Build Output Directory:** `dist`
- **Live Reference Preview:** https://gallery.hanzo.ai/previews/minimal-ui/index.html
- **Edit in Hanzo Studio:** https://hanzo.ai/chat?template=minimal-ui

## 2. Exact Hotspot File Map ("Where to Edit What")
- **Brand Copy, Catalog & Domain Data (EDIT FIRST):**
  - `src/shop/content.ts`
  - `src/shop/data.ts`
  - `src/lib/defaults.ts`
- **Primary UI Sections & Interactive Views:**
  - `src/shop/Shop.tsx`
  - `src/shop/parts.tsx`
  - `src/docs/Shell.tsx`
- **Design Tokens, Typography & Theme Variables:**
  - `src/shop/theme.ts`
  - `index.css`
- **Engine / Shaders / Core Runtime (DO NOT BREAK):**
  - `src/shop/state.tsx`
  - `src/docs/context.ts`

## 3. Active Composable Blocks
- `sidebar-shell`
- `command-search`
- `metric-strip`
- `data-table-filterable`
- `form-primitives`
- `notification-popover`

## 4. Parameterization Contract (`.env.local` & `hanzo.template.json`)
| Parameter | Env Variable | Default / Value | Purpose |
| :--- | :--- | :--- | :--- |
| `brandName` | `VITE_SITE_NAME` | `Monolith UI` | Primary brand or product title rendered in navigation and metadata |
| `tagline` | `VITE_SITE_TAGLINE` | `AI Design System & Developer Docs Portal · Zen Search + Tokens` | Headline or value proposition displayed in the hero section |
| `hanzoApiKey` | `HANZO_API_KEY` | `hz_live_your_api_key` | API key for Zen AI models, embeddings, and agents via https://api.hanzo.ai/v1 |
| `hanzoAiModel` | `VITE_HANZO_AI_MODEL` | `zen4` | Default Hanzo AI model routed for chat, copilot, and structured completions |
| `hanzoAnalyticsId` | `VITE_HANZO_ANALYTICS_ID` | `hz_ins_minimal-ui` | Project telemetry key for real-time pageviews, conversion funnels & AI token insights |
| `hanzoIamOrg` | `VITE_HANZO_IAM_ORG` | `hanzo` | Organization tenant slug on hanzo.id for zero-config SSO and RBAC |
| `accentColor` | `VITE_ACCENT_COLOR` | `#ffffff` | Primary interactive accent token (hex or CSS color) |
| `themeMode` | `VITE_THEME_MODE` | `dark` | Initial color scheme applied on first visit |
| `density` | `VITE_UI_DENSITY` | `comfortable` | Spacing and control height preset across primitives |

## 5. Pre-Wired Hanzo Cloud Stack (`src/lib/hanzo.ts`)
Every Hanzo template integrates out of the box with the Hanzo Cloud stack via `src/lib/hanzo.ts`:
1. **Zen AI Gateway (`https://api.hanzo.ai/v1`)**:
   - Call `askHanzoAi(prompt, { model: 'zen4', system })` for chat, copilot, command palette, or structured generation.
   - Uses `HANZO_API_KEY` (provision at https://console.hanzo.ai/keys).
2. **Hanzo Analytics & Insights (`https://analytics.hanzo.ai/v1/track`)**:
   - Call `trackInsight(event, properties)` on key user actions (CTA clicks, checkout, prompt submissions, onboarding steps).
   - Uses `hz_ins_minimal-ui` and automatically logs AI latency + token usage.
3. **Hanzo IAM Single Sign-On (`https://hanzo.id`)**:
   - Organization tenant: `hanzo`.

## 6. Agent Execution Playbook (4 Deterministic Steps)
1. **Configure Parameters:** Update `hanzo.template.json` and `.env.local` with the user's brand name, tagline, accent tokens, `HANZO_API_KEY`, and `HANZO_ANALYTICS_ID`.
2. **Update Hotspot Data & Copy:** Edit the files listed under **Brand Copy, Catalog & Domain Data** first. Prefer structured data edits over rewriting layout trees.
3. **Wire Cloud AI & Insights:** Import `askHanzoAi` and `trackInsight` from `src/lib/hanzo.ts` into interactive components (command bars, forms, AI assistants, primary CTAs).
4. **Verify & Deploy:** Run `pnpm build` to verify zero TypeScript or bundler errors, then deploy with `npx @hanzo/cli deploy --template minimal-ui --name monolith-ui --platform --insights`.
