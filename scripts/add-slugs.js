const fs = require('fs');
const path = require('path');

// Helper function to generate slug from display name
function generateSlug(displayName) {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Read the templates-data.ts file
const filePath = path.join(__dirname, '..', 'app', 'templates-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Find all template objects and add slug field after displayName
// Pattern: displayName: 'Something',
const displayNamePattern = /displayName:\s*'([^']+)',/g;

let match;
const replacements = [];

while ((match = displayNamePattern.exec(content)) !== null) {
  const displayName = match[1];
  const slug = generateSlug(displayName);
  const matchIndex = match.index + match[0].length;

  // Check if slug already exists after this displayName
  const nextFewChars = content.substring(matchIndex, matchIndex + 200);
  if (!nextFewChars.includes('slug:')) {
    replacements.push({
      index: matchIndex,
      text: `\n    slug: '${slug}',`
    });
  }
}

// Apply replacements in reverse order to maintain correct indices
replacements.reverse();
for (const replacement of replacements) {
  content = content.substring(0, replacement.index) + replacement.text + content.substring(replacement.index);
}

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');

console.log(`✅ Added ${replacements.length} slug fields to templates-data.ts`);
