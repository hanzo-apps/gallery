// Every class in a page's markup must have a rule in a stylesheet that page
// delivers. A build is green when the code compiles; nothing in a compiler
// knows whether the sheet actually carries the classes the document uses, so an
// unstyled page ships silently. This reads the exported HTML and says.
import { readFileSync, existsSync } from 'node:fs';

const pages = process.argv.slice(2);
if (!pages.length) {
  console.error('usage: node scripts/css-check.mjs out/index.html ...');
  process.exit(2);
}

/**
 * Marker classes, which carry no styling and are not meant to.
 *
 * `is_*` and `t_*` are gui's identity and theme markers; `btn`/`btn-*` are the
 * handle `buttonVariants()` puts on a button for a host that wants to reach it
 * from CSS. `r-*` and `css-*` belong to react-native-web, whose Spinner injects
 * its own rules at runtime rather than shipping them — so they are absent from
 * the sheet by design and present the moment the component draws.
 */
const marker = (c) => /^(is_|t_|r-|css-)/.test(c) || c === 'btn' || c.startsWith('btn-') || /^Select/.test(c);

let bad = 0;
for (const page of pages) {
  if (!existsSync(page)) {
    console.log(`${page}: MISSING`);
    bad++;
    continue;
  }
  const html = readFileSync(page, 'utf8');

  const links = [...html.matchAll(/href="([^"]+\.css)"/g)].map((m) => m[1].split('?')[0]);
  let css = links.map((l) => readFileSync('out' + l, 'utf8')).join('\n');
  css += [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');

  const defined = new Set();
  for (const m of css.matchAll(/\.((?:\\.|[A-Za-z0-9_-])+)/g)) defined.add(m[1].replace(/\\/g, ''));

  const used = new Set();
  for (const m of html.matchAll(/class="([^"]*)"/g))
    for (const token of m[1].split(/\s+/).filter(Boolean)) used.add(token);

  const missing = [...used].filter((u) => !defined.has(u) && !marker(u));
  console.log(`${page.padEnd(34)} sheets=${links.length}  used=${String(used.size).padStart(4)}  no-rule=${missing.length}`);
  if (missing.length) {
    console.log(`    ${missing.join(' ')}`);
    bad++;
  }
}
process.exit(bad ? 1 : 0);
