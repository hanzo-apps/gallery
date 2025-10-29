import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const TEMPLATES_ROOT = path.resolve(process.cwd(), '../');
const PREVIEWS_DIR = path.resolve(process.cwd(), 'public/previews');

interface BuildConfig {
  buildCmd: string | null;
  outputDir: string;
  installCmd: string | null;
}

const BUILD_CONFIGS: Record<string, BuildConfig> = {
  'HTML/Gulp': {
    buildCmd: './node_modules/.bin/gulp build || npx gulp build',
    outputDir: 'build',
    installCmd: 'npm install',
  },
  'HTML/CSS': {
    buildCmd: null, // Just copy files
    outputDir: '.',
    installCmd: null,
  },
  'React': {
    buildCmd: 'npm run build',
    outputDir: 'build',
    installCmd: 'npm install --legacy-peer-deps',
  },
  'Next.js': {
    buildCmd: 'npm run build && npm run export',
    outputDir: 'out',
    installCmd: 'npm install',
  },
};

function getBuildConfig(framework: string): BuildConfig {
  if (framework.includes('Gulp')) return BUILD_CONFIGS['HTML/Gulp'];
  if (framework.includes('Next')) return BUILD_CONFIGS['Next.js'];
  if (framework.includes('React')) return BUILD_CONFIGS['React'];
  if (framework.includes('HTML')) return BUILD_CONFIGS['HTML/CSS'];
  return BUILD_CONFIGS['HTML/CSS'];
}

function copyDir(src: string, dest: string) {
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

export async function POST(request: NextRequest) {
  try {
    const { templateName, templatePath, framework } = await request.json();

    if (!templateName || !templatePath || !framework) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const previewPath = path.join(PREVIEWS_DIR, templateName);

    // Check if already built
    if (fs.existsSync(previewPath) && fs.existsSync(path.join(previewPath, 'index.html'))) {
      return NextResponse.json({
        success: true,
        cached: true,
        previewUrl: `/previews/${templateName}/index.html`,
      });
    }

    const templateFullPath = path.join(TEMPLATES_ROOT, templatePath);

    // Check if template path exists
    if (!fs.existsSync(templateFullPath)) {
      return NextResponse.json(
        { error: `Template path not found: ${templatePath}` },
        { status: 404 }
      );
    }

    const config = getBuildConfig(framework);
    const buildOutput = path.join(templateFullPath, config.outputDir);

    // Check if template is pre-built (build directory exists but no package.json)
    const packageJson = path.join(templateFullPath, 'package.json');
    const isPreBuilt = fs.existsSync(buildOutput) && !fs.existsSync(packageJson);

    if (!isPreBuilt) {
      // Install dependencies if needed
      if (config.installCmd && fs.existsSync(packageJson)) {
        try {
          await execAsync(config.installCmd, {
            cwd: templateFullPath,
            timeout: 300000, // 5 minutes
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          return NextResponse.json(
            { error: `Dependency installation failed: ${message}` },
            { status: 500 }
          );
        }
      }

      // Build the template
      if (config.buildCmd) {
        try {
          await execAsync(config.buildCmd, {
            cwd: templateFullPath,
            timeout: 600000, // 10 minutes
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          return NextResponse.json(
            { error: `Build failed: ${message}` },
            { status: 500 }
          );
        }
      }
    }

    if (!fs.existsSync(buildOutput)) {
      return NextResponse.json(
        { error: `Build output directory not found: ${config.outputDir}` },
        { status: 500 }
      );
    }

    // Remove existing preview if it exists
    if (fs.existsSync(previewPath)) {
      fs.rmSync(previewPath, { recursive: true, force: true });
    }

    copyDir(buildOutput, previewPath);

    return NextResponse.json({
      success: true,
      cached: false,
      previewUrl: `/previews/${templateName}/index.html`,
    });

  } catch (error: unknown) {
    console.error('Build error:', error);
    const message = error instanceof Error ? error.message : 'Build failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
