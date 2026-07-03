#!/usr/bin/env node
// One source of truth -> canonical catalog API.
// Reads app/templates-data.ts (the SoT) and emits public/templates.json so
// gallery.hanzo.ai/templates.json is the machine-readable template catalog
// consumed by hanzo.app. Run as a prebuild step (npm run build).
//
// Each emitted record keeps the raw SoT fields and adds absolute URLs so
// consumers never have to know the gallery's internal path scheme:
//   screenshotUrl -> https://gallery.hanzo.ai/screenshots/<screenshot>.png
//   templateUrl   -> https://gallery.hanzo.ai/templates/<slug>
//   repo          -> https://github.com/hanzo-apps/<slug>  (fork source)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { templates } from '../app/templates-data.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const GALLERY_ORIGIN = process.env.GALLERY_ORIGIN || 'https://gallery.hanzo.ai';
const screenshotsDir = join(root, 'public', 'screenshots');

const enriched = templates.map((t) => {
  const shotFile = `${t.screenshot}.png`;
  const hasShot = existsSync(join(screenshotsDir, shotFile));
  return {
    ...t,
    screenshotUrl: `${GALLERY_ORIGIN}/screenshots/${shotFile}`,
    hasScreenshot: hasShot,
    templateUrl: `${GALLERY_ORIGIN}/templates/${t.slug}`,
    repo: `https://github.com/hanzo-apps/${t.slug}`,
  };
});

const withShots = enriched.filter((t) => t.hasScreenshot).length;
const payload = {
  version: 1,
  origin: GALLERY_ORIGIN,
  count: enriched.length,
  screenshots: withShots,
  generatedAt: new Date().toISOString(),
  templates: enriched,
};

const out = join(root, 'public', 'templates.json');
writeFileSync(out, JSON.stringify(payload, null, 2));
console.log(
  `gen-templates-json: wrote ${enriched.length} templates (${withShots} with screenshots) -> public/templates.json`,
);
