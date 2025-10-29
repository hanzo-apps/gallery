#!/usr/bin/env node

/**
 * Screenshot Capture Script for Gallery Apps
 * 
 * This script captures screenshots for specified apps by:
 * 1. Starting the app on its designated port
 * 2. Using Playwright to navigate and capture screenshot
 * 3. Saving screenshot to public/screenshots/
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

// Apps to capture screenshots for with their ports
const APPS_TO_CAPTURE = [
  { name: 'restoq', port: 3059, path: 'apps/restoq' },
  { name: 'quantum', port: 3005, path: 'apps/quantum' },
  { name: 'saas-landing', port: 3104, path: 'apps/saas-landing' },
  { name: 'serif', port: 3106, path: 'apps/serif' },
  { name: 'solo', port: 3043, path: 'apps/solo' },
  { name: 'synapse', port: 3001, path: 'apps/synapse' },
  { name: 'temple', port: 3027, path: 'apps/temple' },
  { name: 'trustify', port: 3105, path: 'apps/trustify' },
  { name: 'vault', port: 3044, path: 'apps/vault' },
];

const TEMPLATES_ROOT = path.resolve(__dirname, '../../../');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../public/screenshots');
const VIEWPORT = { width: 1920, height: 1080 };

async function checkAppExists(appPath) {
  try {
    await fs.access(path.join(TEMPLATES_ROOT, appPath));
    return true;
  } catch {
    return false;
  }
}

async function startApp(appPath, port) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(TEMPLATES_ROOT, appPath);
    console.log(`Starting app at ${fullPath} on port ${port}...`);

    // Try different start commands based on app type
    let startCommand = 'npm';
    let args = ['run', 'dev'];

    const proc = spawn(startCommand, args, {
      cwd: fullPath,
      env: { ...process.env, PORT: port.toString() },
      stdio: 'pipe',
    });

    let started = false;

    proc.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[${port}] ${output}`);

      // Check for common startup messages
      if (
        output.includes('ready') ||
        output.includes('started') ||
        output.includes('compiled') ||
        output.includes(`localhost:${port}`)
      ) {
        if (!started) {
          started = true;
          console.log(`✓ App started on port ${port}`);
          // Give it a moment to fully start
          setTimeout(() => resolve(proc), 2000);
        }
      }
    });

    proc.stderr.on('data', (data) => {
      console.error(`[${port}] Error: ${data}`);
    });

    proc.on('error', (error) => {
      reject(new Error(`Failed to start app: ${error.message}`));
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        reject(new Error(`App failed to start within 30 seconds`));
      }
    }, 30000);
  });
}

async function captureScreenshot(name, port) {
  console.log(`Capturing screenshot for ${name}...`);

  // Use MCP Playwright tool via CLI
  const url = `http://localhost:${port}`;
  const outputPath = path.join(SCREENSHOTS_DIR, `${name}.png`);

  // We'll use the browser automation - let's create a simple page that can be automated
  // For now, let's use a simpler approach with a shell script that uses playwright CLI

  return new Promise((resolve, reject) => {
    const script = `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: ${VIEWPORT.width}, height: ${VIEWPORT.height} } });
  
  try {
    await page.goto('${url}', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for animations
    await page.screenshot({ path: '${outputPath}', fullPage: false });
    console.log('Screenshot saved to ${outputPath}');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw error;
  } finally {
    await browser.close();
  }
})();
`;

    const tempScriptPath = path.join(__dirname, `temp-capture-${name}.js`);
    
    fs.writeFile(tempScriptPath, script)
      .then(() => {
        const proc = spawn('node', [tempScriptPath], { stdio: 'inherit' });

        proc.on('close', (code) => {
          fs.unlink(tempScriptPath).catch(() => {});
          if (code === 0) {
            console.log(`✓ Screenshot captured for ${name}`);
            resolve();
          } else {
            reject(new Error(`Screenshot capture failed with code ${code}`));
          }
        });

        proc.on('error', (error) => {
          fs.unlink(tempScriptPath).catch(() => {});
          reject(error);
        });
      })
      .catch(reject);
  });
}

async function captureAppScreenshot(app) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing: ${app.name}`);
  console.log(`${'='.repeat(60)}\n`);

  const exists = await checkAppExists(app.path);
  if (!exists) {
    console.warn(`⚠️  App not found at ${app.path}, skipping...`);
    return { name: app.name, success: false, reason: 'not found' };
  }

  let proc = null;
  try {
    proc = await startApp(app.path, app.port);
    await captureScreenshot(app.name, app.port);
    return { name: app.name, success: true };
  } catch (error) {
    console.error(`❌ Failed to capture ${app.name}: ${error.message}`);
    return { name: app.name, success: false, reason: error.message };
  } finally {
    if (proc) {
      console.log(`Stopping app on port ${app.port}...`);
      proc.kill('SIGTERM');
      // Give it time to cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

async function main() {
  console.log('Screenshot Capture Script');
  console.log(`Templates root: ${TEMPLATES_ROOT}`);
  console.log(`Screenshots dir: ${SCREENSHOTS_DIR}\n`);

  // Ensure screenshots directory exists
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });

  const results = [];

  // Process apps one by one to avoid port conflicts
  for (const app of APPS_TO_CAPTURE) {
    const result = await captureAppScreenshot(app);
    results.push(result);

    // Wait a bit between apps
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(60)}\n`);

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✓ Successful: ${successful.length}/${results.length}`);
  successful.forEach(r => console.log(`  - ${r.name}`));

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${results.length}`);
    failed.forEach(r => console.log(`  - ${r.name}: ${r.reason}`));
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
