#!/usr/bin/env node

/**
 * Export templates data to JSON
 * This script reads templates-data.ts and exports it as JSON for build scripts
 */

const fs = require('fs');
const path = require('path');

// Dynamic import for ESM module
async function exportTemplates() {
  try {
    // Read the templates-data.ts file
    const dataPath = path.join(__dirname, '../app/templates-data.ts');
    const content = fs.readFileSync(dataPath, 'utf8');

    // Extract just the templates array data
    const match = content.match(/export const templates: Template\[\] = (\[[\s\S]*?\n\]);/);

    if (!match) {
      console.error('❌ Could not find templates array in templates-data.ts');
      process.exit(1);
    }

    // Convert TypeScript to JSON-compatible format
    let jsonStr = match[1]
      .replace(/\/\/.*$/gm, '')  // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove multi-line comments
      .replace(/'/g, '"')  // Single quotes to double quotes
      .replace(/(\w+):/g, '"$1":')  // Unquoted keys to quoted keys
      .replace(/,(\s*[}\]])/g, '$1');  // Remove trailing commas

    const templates = JSON.parse(jsonStr);

    // Export to JSON file
    const outputPath = path.join(__dirname, 'templates.json');
    fs.writeFileSync(outputPath, JSON.stringify(templates, null, 2));

    console.log(`✅ Exported ${templates.length} templates to templates.json`);
    return templates;

  } catch (error) {
    console.error('❌ Error exporting templates:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  exportTemplates();
}

module.exports = { exportTemplates };
