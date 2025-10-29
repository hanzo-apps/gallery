const fs = require('fs');
const path = require('path');

// Read the templates-data.ts file
const filePath = path.join(__dirname, '..', 'app', 'templates-data.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Groups of templates that should be consolidated
const consolidationGroups = {
  'Bento Cards': [
    'Bento Cards v1 Multipurpose (Next.js)',
    'Bento Cards v1 Multipurpose (React)',
    'Bento Cards v2 AI (Next.js)',
    'Bento Cards v2 AI (React)',
    'Bento Cards v3',
    'Bento Cards v3 (Alt)',
    'Bento Cards v3 (HTML)',
    'Bento Cards v4 (HTML)',
    'Bento Cards v4 (React)'
  ],
  'Bitcloud': [
    'Bitcloud (React)',
    'Bitcloud (HTML)'
  ],
  'Hygge': [
    'Hygge (React)',
    'Hygge (HTML)'
  ],
  'Code Landing': [
    'Code App Landing',
    'Code Marketing Landing'
  ],
  'Xora': [
    'Xora (React)',
    'Xora (HTML)'
  ],
  'FitnessPro': [
    'FitnessPro (React)',
    'FitnessPro (HTML)'
  ],
  'Folio': [
    // All Folio variants
  ]
};

// Output consolidation plan
console.log('📊 Template Consolidation Plan:\n');
Object.entries(consolidationGroups).forEach(([name, variants]) => {
  console.log(`${name}:`);
  console.log(`  Variants: ${variants.length}`);
  variants.forEach(v => console.log(`    - ${v}`));
  console.log('');
});

console.log(`\n✅ Total templates to consolidate: ${Object.keys(consolidationGroups).length}`);
console.log(`📦 Total variants: ${Object.values(consolidationGroups).flat().length}`);
