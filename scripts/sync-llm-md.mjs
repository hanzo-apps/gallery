import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { templates } from '../app/templates-data.ts';
import { assembleProjectConfig, getBlueprint } from '../app/lib/template-assembly.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const llmsDir = path.join(publicDir, 'llms');

fs.mkdirSync(llmsDir, { recursive: true });

const llmsTxtLines = [
  '# Hanzo Templates Gallery — Agent & LLM Directory (llmstxt.org)',
  '',
  '> Production-ready UI/UX and 3D/WebGL seed templates pre-wired for the Hanzo Cloud stack (Zen AI via api.hanzo.ai/v1, Hanzo Analytics & Insights via analytics.hanzo.ai, and Hanzo IAM via hanzo.id).',
  '',
  '## How an Agent Should Build From a Hanzo Template',
  '1. Fetch the template `LLM.md` playbook: `https://gallery.hanzo.ai/llms/<slug>/LLM.md`',
  '2. Fetch the machine-readable manifest: `https://gallery.hanzo.ai/llms/<slug>/hanzo.template.json`',
  '3. Clone the repository (`https://github.com/hanzo-apps/<slug>`), update the Hotspot files listed in `LLM.md`, wire `src/lib/hanzo.ts`, verify `pnpm build`, and deploy via `npx @hanzo/cli deploy --platform --insights`.',
  '',
  '## Templates Catalog',
];

// Also map aliases used on hanzo.ai so /llms/<alias>/LLM.md always works
const ALIAS_MAP = {
  'minimal-ui': ['monolith'],
  'component-states': ['states'],
  lighthouse: ['lighthouses'],
  'warp-tunnel': ['hyperion'],
  'tracking-3d': ['hud'],
  'line-illustrations': ['svg-lab'],
  holo: ['hologram'],
  'warp-shader': ['metaballs'],
  'animated-rings': ['planets'],
};

for (const tpl of templates) {
  const bp = getBlueprint(tpl);
  const assembled = assembleProjectConfig(tpl);

  const slugs = [tpl.slug, tpl.name, ...(ALIAS_MAP[tpl.slug] || [])];
  const uniqueSlugs = Array.from(new Set(slugs));

  let llmContent = assembled.llmMd;
  const metaPath = `/tmp/hanzo-gui-meta/${tpl.slug}.json`;
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      const extra = [];
      if (meta.schema_sql) {
        extra.push('## 7. Hanzo Base SQLite Schema (`schema.sql`)', '', '```sql', meta.schema_sql.trim(), '```', '');
      }
      if (meta.llm_md) {
        extra.push('## 8. Upstream Repository Notes (`LLM.md`)', '', meta.llm_md.trim(), '');
      }
      if (extra.length) {
        llmContent = llmContent + '\n\n' + extra.join('\n');
      }
    } catch {}
  }

  for (const s of uniqueSlugs) {
    const dir = path.join(llmsDir, s);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'LLM.md'), llmContent + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'hanzo.template.json'), assembled.manifestJson + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'hanzo.ts'), assembled.hanzoSdkCode + '\n', 'utf8');
  }

  llmsTxtLines.push(
    `- [${tpl.displayName} (\`${tpl.slug}\`)](https://gallery.hanzo.ai/llms/${tpl.slug}/LLM.md): ${tpl.useCase} (${tpl.framework}). [Manifest](https://gallery.hanzo.ai/llms/${tpl.slug}/hanzo.template.json) · [Live Preview](https://gallery.hanzo.ai${bp.previewUrl}) · [Edit in Hanzo.ai](https://hanzo.ai/chat?template=${tpl.slug})`,
  );
}

fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsTxtLines.join('\n') + '\n', 'utf8');
console.log(`Generated LLM.md & hanzo.template.json for ${templates.length} templates + public/llms.txt`);

// Sync into /tmp/hanzo-modern-templates/* if present
const modernRoot = '/tmp/hanzo-modern-templates';
if (fs.existsSync(modernRoot)) {
  for (const tpl of templates) {
    const repoDir = path.join(modernRoot, tpl.slug);
    if (!fs.existsSync(repoDir)) continue;
    const assembled = assembleProjectConfig(tpl);

    // 1. Write LLM.md
    fs.writeFileSync(path.join(repoDir, 'LLM.md'), assembled.llmMd + '\n', 'utf8');

    // 2. Write hanzo.template.json & .env.example
    fs.writeFileSync(path.join(repoDir, 'hanzo.template.json'), assembled.manifestJson + '\n', 'utf8');
    fs.writeFileSync(path.join(repoDir, '.env.example'), assembled.envFile + '\n', 'utf8');

    // 3. Write Hanzo Cloud SDK (src/lib/hanzo.ts or lib/hanzo.ts)
    if (tpl.slug === 'fernline') {
      const libDir = path.join(repoDir, 'lib');
      fs.mkdirSync(libDir, { recursive: true });
      fs.writeFileSync(path.join(libDir, 'hanzo.ts'), assembled.hanzoSdkCode + '\n', 'utf8');
    } else if (tpl.slug === 'emptykit') {
      const webDir = path.join(repoDir, 'web');
      fs.mkdirSync(webDir, { recursive: true });
      fs.writeFileSync(path.join(webDir, 'hanzo.ts'), assembled.hanzoSdkCode + '\n', 'utf8');
    } else {
      const srcLibDir = path.join(repoDir, 'src', 'lib');
      fs.mkdirSync(srcLibDir, { recursive: true });
      fs.writeFileSync(path.join(srcLibDir, 'hanzo.ts'), assembled.hanzoSdkCode + '\n', 'utf8');
    }

    console.log(`Synced LLM.md, hanzo.template.json, .env.example, and hanzo.ts into ${repoDir}`);
  }
}
