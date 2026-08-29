// Pairwise comparison of pages by their distinct class-literal vocabulary.
// A near-identical pair is a missing shared caller, not a translation job.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = [];
walk('app');
function walk(p) {
  const s = statSync(p);
  if (s.isDirectory()) for (const e of readdirSync(p)) walk(join(p, e));
  else if (/\.tsx$/.test(p)) files.push(p);
}

const vocab = new Map();
const all = new Map(); // class -> files using it
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const set = new Set();
  for (const m of src.matchAll(/className=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{'([^']*)'\}|\{"([^"]*)"\})/g)) {
    const s = m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5] ?? '';
    for (const c of s.split(/\s+/).filter(Boolean)) {
      if (c.startsWith('${')) continue;
      set.add(c);
      if (!all.has(c)) all.set(c, new Set());
      all.get(c).add(f);
    }
  }
  // classes inside conditional expressions in className={...}
  for (const m of src.matchAll(/className=\{[^}]*\}/gs)) {
    for (const lit of m[0].matchAll(/'([^']+)'/g)) {
      for (const c of lit[1].split(/\s+/).filter(Boolean)) {
        set.add(c);
        if (!all.has(c)) all.set(c, new Set());
        all.get(c).add(f);
      }
    }
  }
  if (set.size) vocab.set(f, set);
}

const names = [...vocab.keys()];
const pairs = [];
for (let i = 0; i < names.length; i++)
  for (let j = i + 1; j < names.length; j++) {
    const a = vocab.get(names[i]), b = vocab.get(names[j]);
    const inter = [...a].filter(c => b.has(c)).length;
    const union = new Set([...a, ...b]).size;
    // containment: how much of the SMALLER page is already in the larger
    const contain = inter / Math.min(a.size, b.size);
    pairs.push([names[i], names[j], inter / union, contain, inter, a.size, b.size]);
  }
pairs.sort((x, y) => y[3] - x[3]);
console.log('jaccard  contain  shared  A(n)  B(n)   pair');
for (const [a, b, j, c, s, an, bn] of pairs.slice(0, 10))
  console.log(`${j.toFixed(2)}     ${c.toFixed(2)}     ${String(s).padStart(3)}   ${String(an).padStart(3)}  ${String(bn).padStart(3)}   ${a}  ~  ${b}`);

console.log('\n--- classes shared by >=3 files (the shared vocabulary) ---');
const shared = [...all.entries()].filter(([, fs]) => fs.size >= 3).sort((a, b) => b[1].size - a[1].size);
for (const [c, fs] of shared) console.log(`${String(fs.size).padStart(2)}  ${c}`);
console.log(`\ndistinct classes total: ${all.size}`);
