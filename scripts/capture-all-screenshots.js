#!/usr/bin/env node

/**
 * Comprehensive Screenshot Capture System
 * 
 * Captures both full screenshots and thumbnails for gallery apps
 * Uses Playwright for browser automation
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');

// Configuration
const TEMPLATES_ROOT = path.resolve(__dirname, '../../../');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../public/screenshots');
const FULL_SCREENSHOTS_DIR = path.join(SCREENSHOTS_DIR, 'full');
const THUMBNAILS_DIR = path.join(SCREENSHOTS_DIR, 'og');

const VIEWPORT_FULL = { width: 1920, height: 1080 };
const VIEWPORT_THUMBNAIL = { width: 1200, height: 630 }; // OG image size

// Apps to capture - can be extended
const APPS_TO_CAPTURE = [
  // Priority apps (from user request)
  { name: 'restoq', port: 3059, path: 'apps/restoq', startCmd: 'npm run dev' },
  { name: 'quantum', port: 3005, path: 'apps/quantum', startCmd: 'npm run dev' },
  { name: 'saas-landing', port: 3104, path: 'apps/saas-landing', startCmd: 'npm run dev' },
  { name: 'serif', port: 3106, path: 'apps/serif', startCmd: 'npm run dev' },
  { name: 'solo', port: 3043, path: 'apps/solo', startCmd: 'npm run dev' },
  { name: 'synapse', port: 3001, path: 'apps/synapse', startCmd: 'npm run dev' },
  { name: 'temple', port: 3027, path: 'apps/temple', startCmd: 'npm run dev' },
  { name: 'trustify', port: 3105, path: 'apps/trustify', startCmd: 'npm run dev' },
  { name: 'vault', port: 3044, path: 'apps/vault', startCmd: 'npm run dev' },
];

class ScreenshotCapturer {
  constructor() {
    this.browser = null;
  }

  async init() {
    console.log('Initializing browser...');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async ensureDirectories() {
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
    await fs.mkdir(FULL_SCREENSHOTS_DIR, { recursive: true });
    await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
    console.log('✓ Directories created');
  }

  async checkAppExists(appPath) {
    try {
      await fs.access(path.join(TEMPLATES_ROOT, appPath));
      return true;
    } catch {
      return false;
    }
  }

  async startApp(app) {
    const fullPath = path.join(TEMPLATES_ROOT, app.path);
    console.log(`\nStarting ${app.name} at ${fullPath}...`);

    const [cmd, ...args] = app.startCmd.split(' ');
    
    const proc = spawn(cmd, args, {
      cwd: fullPath,
      env: { ...process.env, PORT: app.port.toString() },
      stdio: 'pipe',
    });

    return new Promise((resolve, reject) => {
      let started = false;
      let output = '';

      const timeout = setTimeout(() => {
        if (!started) {
          proc.kill();
          reject(new Error(`App failed to start within 60 seconds. Output: ${output}`));
        }
      }, 60000);

      proc.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Look for startup indicators
        if (text.includes('ready') || 
            text.includes('started') || 
            text.includes('compiled') ||
            text.includes(`localhost:${app.port}`) ||
            text.includes('Local:')) {
          if (!started) {
            started = true;
            clearTimeout(timeout);
            console.log(`✓ ${app.name} started on port ${app.port}`);
            setTimeout(() => resolve(proc), 3000); // Wait for full startup
          }
        }
      });

      proc.stderr.on('data', (data) => {
        output += data.toString();
      });

      proc.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async captureScreenshots(app) {
    const url = `http://localhost:${app.port}`;
    console.log(`\nCapturing screenshots for ${app.name}...`);
    console.log(`URL: ${url}`);

    const context = await this.browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to the app
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for any animations to settle
      await page.waitForTimeout(2000);

      // Capture full screenshot (for detailed view)
      await page.setViewportSize(VIEWPORT_FULL);
      await page.waitForTimeout(500);
      const fullPath = path.join(FULL_SCREENSHOTS_DIR, `${app.name}.png`);
      await page.screenshot({ 
        path: fullPath, 
        fullPage: false 
      });
      console.log(`  ✓ Full screenshot: ${fullPath}`);

      // Capture thumbnail (for gallery card)
      await page.setViewportSize(VIEWPORT_THUMBNAIL);
      await page.waitForTimeout(500);
      const thumbPath = path.join(SCREENSHOTS_DIR, `${app.name}.png`);
      await page.screenshot({ 
        path: thumbPath, 
        fullPage: false 
      });
      console.log(`  ✓ Thumbnail: ${thumbPath}`);

      // Capture OG image (for social sharing)
      const ogPath = path.join(THUMBNAILS_DIR, `${app.name}.png`);
      await page.screenshot({ 
        path: ogPath, 
        fullPage: false 
      });
      console.log(`  ✓ OG image: ${ogPath}`);

      return { success: true };
    } catch (error) {
      console.error(`  ✗ Error capturing screenshots: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      await context.close();
    }
  }

  async processApp(app) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Processing: ${app.name}`);
    console.log(`${'='.repeat(70)}`);

    // Check if app exists
    const exists = await this.checkAppExists(app.path);
    if (!exists) {
      console.warn(`⚠️  App not found at ${app.path}`);
      return { name: app.name, success: false, reason: 'not found' };
    }

    let proc = null;
    try {
      // Start the app
      proc = await this.startApp(app);

      // Capture screenshots
      const result = await this.captureScreenshots(app);
      
      return { 
        name: app.name, 
        success: result.success,
        reason: result.error || 'ok'
      };
    } catch (error) {
      console.error(`❌ Error processing ${app.name}: ${error.message}`);
      return { 
        name: app.name, 
        success: false, 
        reason: error.message 
      };
    } finally {
      // Clean up
      if (proc) {
        console.log(`\nStopping ${app.name}...`);
        proc.kill('SIGTERM');
        
        // Give it time to cleanup
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Force kill if still running
        try {
          proc.kill('SIGKILL');
        } catch {}
      }
    }
  }

  async run() {
    try {
      await this.ensureDirectories();
      await this.init();

      const results = [];

      // Process each app sequentially
      for (const app of APPS_TO_CAPTURE) {
        const result = await this.processApp(app);
        results.push(result);

        // Wait between apps
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Print summary
      console.log(`\n${'='.repeat(70)}`);
      console.log('SUMMARY');
      console.log(`${'='.repeat(70)}\n`);

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      console.log(`✓ Successful: ${successful.length}/${results.length}`);
      successful.forEach(r => console.log(`  • ${r.name}`));

      if (failed.length > 0) {
        console.log(`\n❌ Failed: ${failed.length}/${results.length}`);
        failed.forEach(r => console.log(`  • ${r.name}: ${r.reason}`));
      }

      console.log(`\nScreenshots saved to:`);
      console.log(`  • Full: ${FULL_SCREENSHOTS_DIR}`);
      console.log(`  • Thumbnails: ${SCREENSHOTS_DIR}`);
      console.log(`  • OG images: ${THUMBNAILS_DIR}`);

    } catch (error) {
      console.error('Fatal error:', error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

// Main execution
async function main() {
  console.log('Hanzo Templates Screenshot Capture System');
  console.log('==========================================\n');

  const capturer = new ScreenshotCapturer();
  
  try {
    await capturer.run();
    process.exit(0);
  } catch (error) {
    console.error('\nFatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ScreenshotCapturer, APPS_TO_CAPTURE };
