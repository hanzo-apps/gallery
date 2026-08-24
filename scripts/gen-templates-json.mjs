#!/usr/bin/env node
// One source of truth -> canonical catalog API.
// Reads app/templates-data.ts (the SoT) and emits public/templates.json so
// gallery.hanzo.ai/templates.json is the machine-readable template catalog
// consumed by hanzo.app. Run as a prebuild step (npm run build).
//
// Each emitted record keeps the raw SoT fields and adds absolute URLs so
// consumers never have to know the gallery's internal path scheme:
//   screenshotUrl -> https://gallery.hanzo.ai/screenshots/<screenshot>.webp
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

// WEBP, which is what every capture in public/screenshots actually is. This
// line spelled .png, matched nothing, and wrote hasScreenshot:false for all of
// them — and the consumer draws a schematic when that is false, so the whole
// gallery rendered as coloured mockups while 211 real screenshots sat on disk
// beside it. Nothing failed, because a catalog with no pictures is still a
// catalog. See the count check below, which is the half that was missing.
const enriched = templates.map((t) => {
  const shotFile = `${t.screenshot}.webp`;
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

// A catalog where NOTHING has a picture is a broken build, not a thin one. It is
// also exactly what a wrong extension, a moved directory or an empty checkout
// all look like, and none of them announced themselves before.
if (enriched.length > 0 && withShots === 0) {
  console.error(
    `gen-templates-json: ${enriched.length} templates and not one screenshot in ${screenshotsDir}.\n` +
      `Every card would render as a drawn placeholder. Check the file extension and the directory.`,
  );
  process.exit(1);
}

const missing = enriched.filter((t) => !t.hasScreenshot).map((t) => t.slug);
if (missing.length) {
  console.warn(`gen-templates-json: no screenshot for ${missing.length}: ${missing.join(', ')}`);
}

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
