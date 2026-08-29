// Counts the tailwind surface in app/: class attributes (className=/class=) and
// string literals appearing inside cn(...) expressions. A plain attribute scan
// misses the second, so both are reported.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = process.argv.slice(2);
const files = [];
for (const root of roots.length ? roots : ['app']) walk(root);

function walk(p) {
  const s = statSync(p);
  if (s.isDirectory()) for (const e of readdirSync(p)) walk(join(p, e));
  else if (/\.(tsx?|jsx?|mjs)$/.test(p)) files.push(p);
}

let attrs = 0, cnLiterals = 0, radix = new Map();
const perFile = [];

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const a = (src.match(/\bclassName=/g) || []).length + (src.match(/\bclass=/g) || []).length;

  // literals inside cn(...) — scan balanced parens after each cn(
  let c = 0;
  for (const m of src.matchAll(/\bcn\(/g)) {
    let i = m.index + m[0].length, depth = 1;
    while (i < src.length && depth > 0) {
      const ch = src[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      i++;
    }
    const body = src.slice(m.index + m[0].length, i - 1);
    c += (body.match(/'[^']*'|"[^"]*"|`[^`]*`/g) || []).length;
  }

  for (const m of src.matchAll(/from\s+['"](@radix-ui\/[^'"]+)['"]/g)) {
    const decl = src.slice(Math.max(0, src.lastIndexOf('import', m.index)), m.index);
    radix.set(m[1], (radix.get(m[1]) || '') + decl);
  }

  attrs += a; cnLiterals += c;
  if (a || c) perFile.push([f, a, c]);
}

perFile.sort((x, y) => (y[1] + y[2]) - (x[1] + x[2]));
for (const [f, a, c] of perFile) console.log(`${String(a).padStart(4)} attr  ${String(c).padStart(3)} cn   ${f}`);
console.log(`---\nclass attributes: ${attrs}\ncn() string literals: ${cnLiterals}\nTOTAL tailwind: ${attrs + cnLiterals}`);
console.log(`radix packages: ${radix.size}`);
for (const [pkg, decl] of radix) console.log(`  ${pkg} -> ${decl.replace(/\s+/g, ' ').trim()}`);
