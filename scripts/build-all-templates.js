#!/usr/bin/env node

/**
 * Build All Templates Script
 *
 * This script builds all templates to static files and copies them to public/previews/
 * so they can be served directly from the gallery Next.js app without running
 * separate dev servers on different ports.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the templates directory (parent of template-gallery)
const TEMPLATES_ROOT = path.resolve(__dirname, '../../');
const GALLERY_ROOT = path.resolve(__dirname, '..');
const PREVIEWS_DIR = path.join(GALLERY_ROOT, 'public/previews');

// Create previews directory if it doesn't exist
if (!fs.existsSync(PREVIEWS_DIR)) {
  fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
}

// Template build configurations
const BUILD_CONFIGS = {
  'HTML/Gulp': {
    buildCmd: 'npx gulp build',
    outputDir: 'build',
    installCmd: 'npm install',
  },
  'HTML/CSS': {
    // Static HTML, just copy files
    buildCmd: null,
    outputDir: '.',
    installCmd: null,
  },
  'React': {
    buildCmd: 'npm run build',
    outputDir: 'build',
    installCmd: 'npm install --legacy-peer-deps',
  },
  'Next.js': {
    buildCmd: 'npm run build',
    outputDir: 'out',  // For static export
    installCmd: 'npm install',
  },
};

// Match framework to build config
function getBuildConfig(framework) {
  if (framework.includes('Gulp')) return BUILD_CONFIGS['HTML/Gulp'];
  if (framework.includes('Next')) return BUILD_CONFIGS['Next.js'];
  if (framework.includes('React')) return BUILD_CONFIGS['React'];
  if (framework.includes('HTML')) return BUILD_CONFIGS['HTML/CSS'];
  return BUILD_CONFIGS['HTML/CSS']; // Default
}

// Read templates from JSON file
function getTemplates() {
  const jsonPath = path.join(__dirname, 'templates.json');

  if (!fs.existsSync(jsonPath)) {
    console.log('❌ templates.json not found. Running export script...');
    execSync('node scripts/export-templates-json.js', { cwd: GALLERY_ROOT });
  }

  const templates = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  return templates.map(t => ({
    name: t.name,
    path: t.path,
    framework: t.framework,
  }));
}

// Copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Build a single template
function buildTemplate(template) {
  const templatePath = path.join(TEMPLATES_ROOT, template.path);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📦 Building: ${template.name}`);
  console.log(`   Path: ${template.path}`);
  console.log(`   Framework: ${template.framework}`);

  if (!fs.existsSync(templatePath)) {
    console.log(`   ⚠️  Template path does not exist, skipping...`);
    return { success: false, reason: 'path_not_found' };
  }

  const config = getBuildConfig(template.framework);
  const outputPath = path.join(PREVIEWS_DIR, template.name);

  try {
    // Install dependencies if needed
    if (config.installCmd) {
      console.log(`   📥 Installing dependencies...`);
      const packageJson = path.join(templatePath, 'package.json');

      if (fs.existsSync(packageJson)) {
        try {
          execSync(config.installCmd, {
            cwd: templatePath,
            stdio: 'pipe',
            timeout: 300000, // 5 minutes
          });
          console.log(`   ✓ Dependencies installed`);
        } catch (error) {
          console.log(`   ⚠️  Dependency installation failed: ${error.message}`);
          return { success: false, reason: 'install_failed' };
        }
      }
    }

    // Build the template
    if (config.buildCmd) {
      console.log(`   🔨 Running build command: ${config.buildCmd}`);

      try {
        execSync(config.buildCmd, {
          cwd: templatePath,
          stdio: 'pipe',
          timeout: 600000, // 10 minutes
        });
        console.log(`   ✓ Build completed`);
      } catch (error) {
        console.log(`   ⚠️  Build failed: ${error.message}`);
        return { success: false, reason: 'build_failed' };
      }
    }

    // Copy output to previews directory
    const buildOutput = path.join(templatePath, config.outputDir);

    if (!fs.existsSync(buildOutput)) {
      console.log(`   ⚠️  Build output directory not found: ${config.outputDir}`);
      return { success: false, reason: 'output_not_found' };
    }

    console.log(`   📂 Copying to public/previews/${template.name}...`);

    // Remove existing preview if it exists
    if (fs.existsSync(outputPath)) {
      fs.rmSync(outputPath, { recursive: true, force: true });
    }

    copyDir(buildOutput, outputPath);
    console.log(`   ✅ Successfully built and deployed to previews`);

    return { success: true };

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

// Main function
function main() {
  console.log('🚀 Building All Templates');
  console.log('='.repeat(80));

  const templates = getTemplates();
  console.log(`Found ${templates.length} templates to build\n`);

  const results = {
    total: templates.length,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  // Build each template
  for (const template of templates) {
    const result = buildTemplate(template);

    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({
        name: template.name,
        reason: result.reason,
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Build Summary');
  console.log('='.repeat(80));
  console.log(`✅ Successful: ${results.success}/${results.total}`);
  console.log(`❌ Failed: ${results.failed}/${results.total}`);

  if (results.errors.length > 0) {
    console.log('\nFailed templates:');
    results.errors.forEach(({ name, reason }) => {
      console.log(`  - ${name}: ${reason}`);
    });
  }

  // Save build manifest
  const manifest = {
    buildDate: new Date().toISOString(),
    results,
    templates: templates.map(t => ({
      name: t.name,
      framework: t.framework,
      previewPath: `/previews/${t.name}/index.html`,
    })),
  };

  fs.writeFileSync(
    path.join(PREVIEWS_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('\n✅ Build manifest saved to public/previews/manifest.json');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { buildTemplate, getTemplates };
